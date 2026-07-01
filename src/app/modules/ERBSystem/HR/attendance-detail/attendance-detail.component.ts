import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AttendanceService } from '../../../../core/services/Attendance/attendance.service';
import { EmployeeNode, EmployeeService } from '../../../../core/services/employee/employee.service';
import { AttendanceRecord } from '../Attendance-dashboard/attendance-dashboard/attendance-dashboard.component';



@Component({
  selector: 'app-attendance-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './attendance-detail.component.html',
  styleUrl: './attendance-detail.component.scss',
})
export class AttendanceDetailComponent implements OnInit {

  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _attendance = inject(AttendanceService);
  private readonly _employee = inject(EmployeeService);

  record: AttendanceRecord | null = null;
  employee: EmployeeNode | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (!id) { this._router.navigate(['/attendance-dashboard']); return; }

    this._attendance.getAttendanceById(id).subscribe({
      next: (res) => {
        this.record = res?.data?.attendance ?? null;

        if (!this.record) {
          this.error = 'Record not found.';
          this.loading = false;
          return;
        }

        // جيب بيانات الموظف بالـ nationalId
        this._employee.getEmployeeById(this.record.nationalId).subscribe({
          next: (emp) => { this.employee = emp; this.loading = false; },
          error: () => { this.loading = false; }
        });
      },
      error: () => {
        this.error = 'Failed to load attendance record.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this._router.navigate(['/attendance-dashboard']);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  formatTime(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  formatHours(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  formatOvertime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }

  get statusLabel(): string {
    const map: Record<number, string> = { 0: 'Present', 1: 'Late', 2: 'Absent' };
    return map[this.record?.attendanceStatus ?? 2] ?? 'Unknown';
  }

  get statusClasses(): string {
    const map: Record<number, string> = {
      0: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      1: 'bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-400',
      2: 'bg-rose-100   dark:bg-rose-900/30   text-rose-700   dark:text-rose-400',
    };
    return map[this.record?.attendanceStatus ?? 2] ?? map[2];
  }

  get statusIcon(): string {
    const map: Record<number, string> = { 0: 'check_circle', 1: 'schedule', 2: 'cancel' };
    return map[this.record?.attendanceStatus ?? 2] ?? 'cancel';
  }

  get lateNote(): string {
    const m = this.record?.lateMinutes ?? 0;
    return m === 0 ? 'Perfect punctuality' : `${m} minutes late`;
  }

  get checkInNoteClass(): string {
    return (this.record?.lateMinutes ?? 0) === 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-amber-600  dark:text-amber-400';
  }

  get checkInNote(): string {
    return (this.record?.lateMinutes ?? 0) === 0 ? 'On time' : 'Late arrival';
  }

  get hasOvertime(): boolean {
    return (this.record?.overtimeMinutes ?? 0) > 0;
  }
}