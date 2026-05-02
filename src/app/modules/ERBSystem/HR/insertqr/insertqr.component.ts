import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../../core/services/Attendance/attendance.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-insertqr',
  imports: [CommonModule],
  templateUrl: './insertqr.component.html',
  styleUrl: './insertqr.component.scss',
})
export class InsertqrComponent {
  private _attendanceService = inject(AttendanceService);
  private _router = inject(Router);

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  loading = false;
  success = false;
  errorMsg = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    this.errorMsg = '';
    this.success = false;

    // Preview
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (!this.selectedFile || this.loading) return;

    this.loading = true;
    this.errorMsg = '';

    this._attendanceService.insertQrCode(this.selectedFile).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => {
          this._router.navigate(['./attendance-dashboard'])
        }, 200);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'Failed to process QR code. Please try again.';
      }
    });
  }

  goBack(): void {
    this._router.navigate(['/attendance']);
  }

  clearFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.errorMsg = '';
    this.success = false;
  }
}