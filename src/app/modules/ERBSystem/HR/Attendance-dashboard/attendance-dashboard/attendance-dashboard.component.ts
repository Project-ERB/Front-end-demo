import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../../../core/services/employee/employee.service';
import { AttendanceService, CheckInRequest, COMPANIES } from '../../../../../core/services/Attendance/attendance.service';
import { EmployeeNode } from '../../employee-management/employee-management/employee-management.component';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";
import { Router } from '@angular/router';


export type AttendanceStatus = 'present' | 'late' | 'absent';

export interface Employee {
  id: string;
  name: string;
  role: string;
  empCode: string;
  avatar: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
}

interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
}

export interface AttendanceRecord {
  id: string;
  workDate: string;
  checkIn: string | null;
  checkOut: string | null;
  bookingHours: number;
  lateMinutes: number;
  overtimeMinutes: number;
  attendanceStatus: number; // 0 = present, غيره حسب الـ API
  nationalId: string;
}

@Component({
  selector: 'app-attendance-dashboard',
  imports: [CommonModule, FormsModule, HrSidebarComponent],
  templateUrl: './attendance-dashboard.component.html',
  styleUrl: './attendance-dashboard.component.scss',
})
export class AttendanceDashboardComponent implements OnInit {

  private _employeeService = inject(EmployeeService);
  private _attendanceService = inject(AttendanceService);
  private readonly _Router = inject(Router);

  // ── Table state ────────────────────────────────────────────────────────────
  searchQuery = '';
  activeTab: 'today' | 'yesterday' = 'today';
  currentPage = 1;
  totalEmployees = 144;
  pageSize = 4;

  // ── Modal state ────────────────────────────────────────────────────────────
  showCheckinModal = false;


  // Modal - employees list
  modalEmployees: EmployeeNode[] = [];
  modalLoading = false;
  modalError = '';

  // Modal - form fields
  selectedEmployeeId = '';
  selectedCompanyId = '';
  companies = COMPANIES;

  showSearchModal = false;
  searchNationalId = '';
  searchLoading = false;
  searchError = '';

  // Modal - submission
  submitting = false;
  submitSuccess = false;
  submitError = '';

  // Modal - geolocation
  private userLat = 0;
  private userLng = 0;


  attendanceRecords: AttendanceRecord[] = [];
  loadingRecords = false;
  recordsError = '';

  loadAttendanceByNationalId(nationalId: string): void {
    this.loadingRecords = true;
    this.recordsError = '';

    this._attendanceService.getAttendanceByNationalId(nationalId).subscribe({
      next: (res) => {
        this.attendanceRecords = res?.data?.attendancesByNationalId?.nodes ?? [];
        this.loadingRecords = false;
        console.log('National ID:', nationalId);
      },
      error: () => {
        this.recordsError = 'Failed to load attendance records.';
        this.loadingRecords = false;
      }
    });
  }

  get attendanceAsEmployees(): Employee[] {
    return this.attendanceRecords.map(record => {
      const employee = this.modalEmployees.find(e => e.nationalID === record.nationalId);

      return {
        id: record.id,
        name: employee?.name ?? record.nationalId,  // اسم الموظف أو الـ ID كـ fallback
        role: employee?.employeeLevel ?? '',
        empCode: record.nationalId,
        avatar: '',
        checkIn: this.formatTime(record.checkIn),
        checkOut: this.formatTime(record.checkOut),
        status: this.mapStatus(record.attendanceStatus),
      };
    });
  }
  // حول الـ ISO date لـ وقت بس  "08:52 AM"
  formatTime(isoString: string | null): string {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // حول attendanceStatus number لـ AttendanceStatus string
  mapStatus(statusCode: number): AttendanceStatus {
    const map: Record<number, AttendanceStatus> = {
      0: 'present',
      1: 'late',
      2: 'absent',
    };
    return map[statusCode] ?? 'absent';
  }

  // ──────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadModalEmployees();
  }

  // ── Modal open/close ───────────────────────────────────────────────────────
  openCheckinModal(): void {
    this.showCheckinModal = true;
    this.selectedEmployeeId = '';
    this.selectedCompanyId = '';
    this.submitSuccess = false;
    this.submitError = '';
    this.modalError = '';
    this.loadModalEmployees();
    this.captureLocation();
  }

  closeCheckinModal(): void {
    if (this.submitting) return;
    this.showCheckinModal = false;
  }

  private loadModalEmployees(): void {
    this.modalLoading = true;
    this._employeeService.getEmployees().subscribe({
      next: (data) => {
        this.modalEmployees = data;
        this.modalLoading = false;
      },
      error: () => {
        this.modalError = 'Failed to load employees.';
        this.modalLoading = false;
      },
    });
  }

  private captureLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { this.userLat = pos.coords.latitude; this.userLng = pos.coords.longitude; },
        () => { /* denied → sends 0,0 */ }
      );
    }
  }

  get selectedEmployee(): EmployeeNode | undefined {
    return this.modalEmployees.find(e => e.id === this.selectedEmployeeId);
  }

  get isModalValid(): boolean {
    return !!this.selectedEmployeeId && !!this.selectedCompanyId;
  }

  submitCheckin(): void {
    if (!this.isModalValid || this.submitting) return;

    const payload: CheckInRequest = {
      id: this.selectedEmployeeId,
      companyId: this.selectedCompanyId,
      latitudeUser: this.userLat,
      longitudeUser: this.userLng,
    };

    this.submitting = true;
    this.submitError = '';

    this._attendanceService.checkIn(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.submitSuccess = true;
        setTimeout(() => {
          this.closeCheckinModal();
          this.showRedirectModal = true;  // ← افتح مودال الاختيار
        }, 1800);
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err?.error?.message ?? 'Check-in failed. Please try again.';
      },
    });
  }

  navigateTo(route: string): void {
    this.showRedirectModal = false;
    this._Router.navigate([`/${route}`]);
  }

  // ── Table helpers ──────────────────────────────────────────────────────────
  get totalPages(): number {
    return Math.ceil(this.totalEmployees / this.pageSize);
  }

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard' },
    { icon: 'schedule', label: 'Attendance', active: true },
    { icon: 'group', label: 'Employees' },
    { icon: 'calendar_today', label: 'Leaves' },
    { icon: 'bar_chart', label: 'Reports' },
  ];

  stats = [
    { icon: 'person_check', label: 'Present', value: 124, colorBg: 'bg-emerald-100 dark:bg-emerald-900/30', colorText: 'text-emerald-600' },
    { icon: 'history', label: 'Late', value: 12, colorBg: 'bg-amber-100 dark:bg-amber-900/30', colorText: 'text-amber-600' },
    { icon: 'person_off', label: 'Absent', value: 8, colorBg: 'bg-rose-100 dark:bg-rose-900/30', colorText: 'text-rose-600' },
  ];



  get filteredEmployees(): Employee[] {
    if (!this.searchQuery.trim()) return this.attendanceAsEmployees;
    const q = this.searchQuery.toLowerCase();
    return this.attendanceAsEmployees.filter(
      e => e.name.toLowerCase().includes(q) || e.empCode.toLowerCase().includes(q)
    );
  }

  get visiblePages(): (number | '...')[] {
    return [1, 2, 3, '...', this.totalPages];
  }

  statusBadgeClass(status: AttendanceStatus): string {
    const map: Record<AttendanceStatus, string> = {
      present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      absent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return map[status];
  }

  statusDotClass(status: AttendanceStatus): string {
    const map: Record<AttendanceStatus, string> = {
      present: 'bg-emerald-500',
      late: 'bg-amber-500',
      absent: 'bg-rose-500',
    };
    return map[status];
  }

  checkInIconColor(status: AttendanceStatus): string {
    return status === 'late' ? 'text-amber-500' : 'text-slate-400';
  }

  statusLabel(status: AttendanceStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  setPage(page: number | '...'): void {
    if (typeof page === 'number') this.currentPage = page;
  }

  setActiveTab(tab: 'today' | 'yesterday'): void {
    this.activeTab = tab;
  }

  deleteAttendanceRecord(id: string): void {
    if (!confirm('Are you sure you want to delete this record?')) return;

    this._attendanceService.deleteAttendance(id).subscribe({
      next: () => {
        // ✅ فلتر من attendanceRecords مش employees
        this.attendanceRecords = this.attendanceRecords.filter(r => r.id !== id);
      },
      error: (err) => {
        console.error('Delete failed', err);
      }
    });
  }

  onEmployeeChange(): void {
    const emp = this.modalEmployees.find(e => e.id === this.selectedEmployeeId);
    if (emp?.nationalID) {
      this.loadAttendanceByNationalId(emp.nationalID);
    }
  }

  openSearchModal(): void {
    this.showSearchModal = true;
    this.searchNationalId = '';
    this.attendanceRecords = [];
    this.searchError = '';
  }

  closeSearchModal(): void {
    this.showSearchModal = false;
  }

  searchByNationalId(): void {
    if (!this.searchNationalId.trim()) return;
    this.searchLoading = true;
    this.searchError = '';
    this.attendanceRecords = [];

    this._attendanceService.getAttendanceByNationalId(this.searchNationalId.trim()).subscribe({
      next: (res) => {
        this.attendanceRecords = res?.data?.attendancesByNationalId?.nodes ?? [];
        this.searchLoading = false;
        if (this.attendanceRecords.length === 0) {
          this.searchError = 'No records found for this National ID.';
        }
      },
      error: () => {
        this.searchError = 'Failed to load records. Please try again.';
        this.searchLoading = false;
      }
    });
  }

  clearSearch(): void {
    this.searchNationalId = '';
    this.attendanceRecords = [];
    this.searchError = '';
  }

  viewRecord(emp: Employee): void {
    this._Router.navigate(['/attendance-detail', emp.id]);
  }

  showRedirectModal = false;
}