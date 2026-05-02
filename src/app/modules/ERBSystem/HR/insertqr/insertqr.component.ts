import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../../core/services/Attendance/attendance.service';
import { EmployeeService } from '../../../../core/services/employee/employee.service';

import { Router } from '@angular/router';
import { EmployeeNode } from '../employee-management/employee-management/employee-management.component';

type StepState = 'upload' | 'validating' | 'confirmed' | 'error' | 'success';

@Component({
  selector: 'app-insertqr',
  imports: [CommonModule],
  templateUrl: './insertqr.component.html',
  styleUrl: './insertqr.component.scss',
})
export class InsertqrComponent implements OnInit {
  private _attendanceService = inject(AttendanceService);
  private _employeeService = inject(EmployeeService);
  private _router = inject(Router);

  // ── State ──
  step: StepState = 'upload';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  errorMsg = '';

  // ── Employee validation ──
  employees: EmployeeNode[] = [];
  matchedEmployee: EmployeeNode | null = null;
  extractedNationalId = '';

  // ── Loading flags ──
  uploadLoading = false;
  scanLoading = false;

  ngOnInit(): void {
    this._employeeService.getEmployees().subscribe({
      next: (data) => this.employees = data,
      error: () => console.error('Failed to load employees')
    });
  }

  // ── Step 1: File select ──
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    this.errorMsg = '';
    this.step = 'upload';
    this.matchedEmployee = null;
    this.extractedNationalId = '';

    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(file);
  }

  // ── Step 2: Upload QR → validate employee ──
  submitQr(): void {
    if (!this.selectedFile || this.uploadLoading) return;

    this.uploadLoading = true;
    this.errorMsg = '';
    this.step = 'validating';

    this._attendanceService.insertQrCode(this.selectedFile).subscribe({
      next: (res) => {
        this.uploadLoading = false;

        // استخرج الـ nationalId من الـ URL
        const url: string = res?.data ?? '';
        const nationalId = new URL(url).searchParams.get('nationalId') ?? '';

        if (!nationalId) {
          this.errorMsg = 'Could not extract National ID from QR code.';
          this.step = 'error';
          return;
        }

        this.extractedNationalId = nationalId;

        // ابحث في الـ employees
        const match = this.employees.find(e => e.nationalID === nationalId);

        if (!match) {
          this.errorMsg = `No employee found with National ID: ${nationalId}. Cannot record attendance.`;
          this.step = 'error';
          return;
        }

        // ✅ موجود
        this.matchedEmployee = match;
        this.step = 'confirmed';
      },
      error: (err) => {
        this.uploadLoading = false;
        this.errorMsg = err?.error?.message ?? 'Failed to process QR code.';
        this.step = 'error';
      }
    });
  }

  // ── Step 3: Confirm → scan attendance ──
  confirmScan(): void {
    if (!this.extractedNationalId || this.scanLoading) return;

    this.scanLoading = true;
    this.errorMsg = '';

    this._attendanceService.scan(this.extractedNationalId).subscribe({
      next: () => {
        this.scanLoading = false;
        this.step = 'success';
        setTimeout(() => {
          this._router.navigate(['/attendance-dashboard'])
        }, 2000);
      },
      error: (err) => {
        this.scanLoading = false;
        this.errorMsg = err?.error?.message ?? 'Failed to record attendance.';
        this.step = 'error';
      }
    });
  }

  reset(): void {
    this.step = 'upload';
    this.selectedFile = null;
    this.previewUrl = null;
    this.errorMsg = '';
    this.matchedEmployee = null;
    this.extractedNationalId = '';
  }

  goBack(): void {
    this._router.navigate(['/attendance']);
  }
}