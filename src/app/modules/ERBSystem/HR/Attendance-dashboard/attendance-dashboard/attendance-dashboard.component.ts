import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

@Component({
  selector: 'app-attendance-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-dashboard.component.html',
  styleUrl: './attendance-dashboard.component.scss',
})
export class AttendanceDashboardComponent {

  searchQuery = '';
  employeeIdInput = '';
  activeTab: 'today' | 'yesterday' = 'today';
  currentPage = 1;
  totalEmployees = 144;
  pageSize = 4;

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

  employees: Employee[] = [
    {
      id: '1',
      name: 'Alex Rivera',
      role: 'Software Engineer',
      empCode: '#EMP-4012',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-teGYVO0Q2i89NcOibgGB9OiUwE909aPG8iSc-slN65bpu4WOYxNrPsHB1PULH4eTchtg5r-eItz1FEvy7I2IniQs0TF9J0qKiKrBPE1y6JhtyW5hrMwxlVdO3FbPAKvrvd6sT2fhUDpwStNMKV3nW6Ocem9lykt2PUGiiHP6A1XdAcM1-S-x6NTdC5inFH_phisk8GKSmy3Nag64RjRBuTHfW0_G-8eF-tPyoKRcXLYNFRGqgi-ky145cGC7Z6-PGYdAPiW7DnzD',
      checkIn: '08:52 AM',
      checkOut: null,
      status: 'present',
    },
    {
      id: '2',
      name: 'Samantha Blue',
      role: 'Marketing Specialist',
      empCode: '#EMP-3921',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUrymZRioivQRyx4aL78vA2ETd0M39aPCiig4s5xBZDFgW-CqzHMpA4uylvrpKxy1BfyoSvWvESUgncpWKz42_Q_6di4F_bfaAt2n2S3FuWX82KI9N10UpLnuHaIMMPzUIH6e_1ncMRN7AJ4XGav-Th71ZGLfeOMiYOxmLHaz5eBdaaeaW0NEikhWDBtQLj0E69e1OgVA1owv5LEzC0X82tiTY1WWjPfdJpCDIwjrfUJ2fNPX92VYuMCLsitzHFF228gv3hudkOANn',
      checkIn: '09:15 AM',
      checkOut: '05:42 PM',
      status: 'late',
    },
    {
      id: '3',
      name: 'Mark Stevenson',
      role: 'Graphic Designer',
      empCode: '#EMP-4105',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNE7IEg3FkR2z2HaCxO9jdFupaC2d35VS8I-2QY3k3NZAcXFfoRZso-4X6zeWdn2s-ek4SIkTmBq2D66p4zSKxbi0pug8eqd0AogvxU0JlIdJb8wKB6ZLmh4Cm2K9IP_HflK3HKQya3asXpcQvPrYs9eDvuReK8F5jN0pMKTjX-umR7loey9EIsg16L7y0qR_SpZsysvfWq75UAqmtoxRvSMofABtgCC1X83Af6zgwMpUOTrfE-m8aVpDuXG-u8Sf6Hmo20ipFsg-L',
      checkIn: null,
      checkOut: null,
      status: 'absent',
    },
    {
      id: '4',
      name: 'Chloe Thompson',
      role: 'Accountant',
      empCode: '#EMP-2218',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARcm8uO43UQ4xqx3Ow_Ctoga4fdXRhuYeVLSUGY3JV_5gV3KZN4HdGguLwHfgzXIBaNxds9QDNdA9QeAu7WIDqd77fhZnJmS-NcaUMT_s7IjSpiomhDidJxgrn0tJYB-6RtOo0NIHXerbluf6fs91BVpPpu-KlzrdgCHLwZe6XTDSNbOvPYFqZSebs_M-Fq3EGlbtFVutXJv74jHJLw4iV-10a8b2q79AqDSmcfNI-YPYjkYgK0tG2cb7SSLoK56HNSEbVcdbsSkNv',
      checkIn: '08:30 AM',
      checkOut: null,
      status: 'present',
    },
  ];

  get filteredEmployees(): Employee[] {
    if (!this.searchQuery.trim()) return this.employees;
    const q = this.searchQuery.toLowerCase();
    return this.employees.filter(
      e => e.name.toLowerCase().includes(q) || e.empCode.toLowerCase().includes(q)
    );
  }

  get visiblePages(): (number | '...')[] {
    const pages: (number | '...')[] = [1, 2, 3, '...', this.totalPages];
    return pages;
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

  onCheckInOut(): void {
    if (this.employeeIdInput.trim()) {
      console.log('Check In/Out for:', this.employeeIdInput);
      this.employeeIdInput = '';
    }
  }

  setPage(page: number | '...'): void {
    if (typeof page === 'number') this.currentPage = page;
  }

  setActiveTab(tab: 'today' | 'yesterday'): void {
    this.activeTab = tab;
  }

}
