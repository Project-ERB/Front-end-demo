import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiedeAdminComponent } from "../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";

export interface SystemLog {
  timestamp: string;
  userInitials: string;
  userColor: string;
  userName: string;
  action: string;
  actionId?: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Blocked' | 'Error';
  isBot?: boolean;
}

@Component({
  selector: 'app-admin-dash',
  standalone: true,
  imports: [CommonModule, FormsModule, SiedeAdminComponent],
  templateUrl: './admin-dash.component.html',
  styleUrl: './admin-dash.component.scss'
})
export class AdminDashComponent {

  // ── Search & Filter ──────────────────────────────────────────────────────
  searchQuery = '';
  selectedFilter = 'All Events';
  filterOptions = ['All Events', 'Errors Only', 'Warnings', 'Success'];

  // ── Pagination ───────────────────────────────────────────────────────────
  readonly pageSize = 10;
  currentPage = 1;

  // ── Widgets ──────────────────────────────────────────────────────────────
  systemHealth = {
    cpuLoad: 12,
    memoryUsed: 4.2,
    memoryTotal: 16,
    memoryPercent: 26,
    latency: 24,
    status: 'Healthy'
  };

  securityStats = {
    threatsBlocked: 124,
    timeRange: 'Last 24h'
  };

  // ── Log Data (30 entries) ─────────────────────────────────────────────────
  logs: SystemLog[] = [
    { timestamp: '2023-10-24 14:32:01', userInitials: 'AM', userColor: 'bg-indigo-100 text-indigo-700', userName: 'Alex Morgan', action: 'Updated User Role', actionId: '482', ipAddress: '192.168.1.42', status: 'Success' },
    { timestamp: '2023-10-24 14:15:22', userInitials: 'JS', userColor: 'bg-orange-100 text-orange-700', userName: 'John Smith', action: 'Failed Login Attempt', ipAddress: '10.0.0.15', status: 'Warning' },
    { timestamp: '2023-10-24 13:45:00', userInitials: '', userColor: 'bg-slate-200 text-slate-600', userName: 'System Bot', action: 'Database Backup Routine', ipAddress: 'localhost', status: 'Success', isBot: true },
    { timestamp: '2023-10-24 12:30:45', userInitials: 'SL', userColor: 'bg-pink-100 text-pink-700', userName: 'Sarah Lee', action: 'API Key Generation', ipAddress: '172.16.0.23', status: 'Blocked' },
    { timestamp: '2023-10-24 11:20:10', userInitials: 'AM', userColor: 'bg-indigo-100 text-indigo-700', userName: 'Alex Morgan', action: 'Exported Audit Logs', ipAddress: '192.168.1.42', status: 'Success' },
    { timestamp: '2023-10-24 10:55:33', userInitials: 'RK', userColor: 'bg-teal-100 text-teal-700', userName: 'Ryan Kim', action: 'Password Reset', ipAddress: '10.0.0.88', status: 'Success' },
    { timestamp: '2023-10-24 10:40:17', userInitials: 'JS', userColor: 'bg-orange-100 text-orange-700', userName: 'John Smith', action: 'Failed Login Attempt', ipAddress: '10.0.0.15', status: 'Warning' },
    { timestamp: '2023-10-24 10:22:05', userInitials: '', userColor: 'bg-slate-200 text-slate-600', userName: 'System Bot', action: 'SSL Certificate Renewal', ipAddress: 'localhost', status: 'Success', isBot: true },
    { timestamp: '2023-10-24 09:58:44', userInitials: 'PW', userColor: 'bg-violet-100 text-violet-700', userName: 'Paula White', action: 'Deleted User Account', actionId: '319', ipAddress: '172.16.0.10', status: 'Success' },
    { timestamp: '2023-10-24 09:31:29', userInitials: 'SL', userColor: 'bg-pink-100 text-pink-700', userName: 'Sarah Lee', action: 'Unauthorized API Access', ipAddress: '172.16.0.23', status: 'Blocked' },
    { timestamp: '2023-10-24 09:10:02', userInitials: 'AM', userColor: 'bg-indigo-100 text-indigo-700', userName: 'Alex Morgan', action: 'System Config Updated', ipAddress: '192.168.1.42', status: 'Success' },
    { timestamp: '2023-10-24 08:47:51', userInitials: 'RK', userColor: 'bg-teal-100 text-teal-700', userName: 'Ryan Kim', action: 'New User Created', actionId: '501', ipAddress: '10.0.0.88', status: 'Success' },
    { timestamp: '2023-10-24 08:30:14', userInitials: 'DT', userColor: 'bg-amber-100 text-amber-700', userName: 'Dana Torres', action: 'Role Permission Denied', ipAddress: '10.10.0.55', status: 'Error' },
    { timestamp: '2023-10-24 08:12:38', userInitials: '', userColor: 'bg-slate-200 text-slate-600', userName: 'System Bot', action: 'Log Rotation Completed', ipAddress: 'localhost', status: 'Success', isBot: true },
    { timestamp: '2023-10-24 07:55:00', userInitials: 'JS', userColor: 'bg-orange-100 text-orange-700', userName: 'John Smith', action: 'Locked Account', actionId: '203', ipAddress: '10.0.0.15', status: 'Warning' },
    { timestamp: '2023-10-24 07:33:22', userInitials: 'PW', userColor: 'bg-violet-100 text-violet-700', userName: 'Paula White', action: 'Exported User List', ipAddress: '172.16.0.10', status: 'Success' },
    { timestamp: '2023-10-24 07:14:09', userInitials: 'SL', userColor: 'bg-pink-100 text-pink-700', userName: 'Sarah Lee', action: 'API Rate Limit Exceeded', ipAddress: '172.16.0.23', status: 'Warning' },
    { timestamp: '2023-10-24 06:58:47', userInitials: 'AM', userColor: 'bg-indigo-100 text-indigo-700', userName: 'Alex Morgan', action: 'Admin Login', ipAddress: '192.168.1.42', status: 'Success' },
    { timestamp: '2023-10-24 06:40:31', userInitials: '', userColor: 'bg-slate-200 text-slate-600', userName: 'System Bot', action: 'Health Check Passed', ipAddress: 'localhost', status: 'Success', isBot: true },
    { timestamp: '2023-10-24 06:22:15', userInitials: 'DT', userColor: 'bg-amber-100 text-amber-700', userName: 'Dana Torres', action: 'Failed Login Attempt', ipAddress: '10.10.0.55', status: 'Warning' },
    { timestamp: '2023-10-24 06:05:03', userInitials: 'RK', userColor: 'bg-teal-100 text-teal-700', userName: 'Ryan Kim', action: 'Bulk Email Notification', ipAddress: '10.0.0.88', status: 'Success' },
    { timestamp: '2023-10-24 05:48:27', userInitials: 'JS', userColor: 'bg-orange-100 text-orange-700', userName: 'John Smith', action: 'IP Address Blocked', ipAddress: '10.0.0.15', status: 'Blocked' },
    { timestamp: '2023-10-24 05:30:00', userInitials: '', userColor: 'bg-slate-200 text-slate-600', userName: 'System Bot', action: 'Scheduled Maintenance Start', ipAddress: 'localhost', status: 'Success', isBot: true },
    { timestamp: '2023-10-24 05:10:44', userInitials: 'PW', userColor: 'bg-violet-100 text-violet-700', userName: 'Paula White', action: 'Two-Factor Auth Enabled', actionId: '319', ipAddress: '172.16.0.10', status: 'Success' },
    { timestamp: '2023-10-24 04:52:19', userInitials: 'SL', userColor: 'bg-pink-100 text-pink-700', userName: 'Sarah Lee', action: 'Config File Modified', ipAddress: '172.16.0.23', status: 'Error' },
    { timestamp: '2023-10-24 04:33:06', userInitials: 'AM', userColor: 'bg-indigo-100 text-indigo-700', userName: 'Alex Morgan', action: 'Restored User Account', actionId: '145', ipAddress: '192.168.1.42', status: 'Success' },
    { timestamp: '2023-10-24 04:14:50', userInitials: 'DT', userColor: 'bg-amber-100 text-amber-700', userName: 'Dana Torres', action: 'Webhook Delivery Failed', ipAddress: '10.10.0.55', status: 'Error' },
    { timestamp: '2023-10-24 03:55:33', userInitials: '', userColor: 'bg-slate-200 text-slate-600', userName: 'System Bot', action: 'Cache Cleared', ipAddress: 'localhost', status: 'Success', isBot: true },
    { timestamp: '2023-10-24 03:37:11', userInitials: 'RK', userColor: 'bg-teal-100 text-teal-700', userName: 'Ryan Kim', action: 'Failed Login Attempt', ipAddress: '10.0.0.88', status: 'Warning' },
    { timestamp: '2023-10-24 03:18:55', userInitials: 'JS', userColor: 'bg-orange-100 text-orange-700', userName: 'John Smith', action: 'Session Expired & Logged Out', ipAddress: '10.0.0.15', status: 'Success' },
  ];

  // ── Computed: all filtered logs (no paging) ───────────────────────────────
  get filteredLogs(): SystemLog[] {
    let result = this.logs;

    if (this.selectedFilter !== 'All Events') {
      const map: Record<string, SystemLog['status']> = {
        'Errors Only': 'Error',
        'Warnings': 'Warning',
        'Success': 'Success'
      };
      const target = map[this.selectedFilter];
      if (target) result = result.filter(log => log.status === target);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(log =>
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q)
      );
    }

    return result;
  }

  // ── Computed: current page slice ─────────────────────────────────────────
  get pagedLogs(): SystemLog[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLogs.slice(start, start + this.pageSize);
  }

  // ── Computed: total pages ────────────────────────────────────────────────
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredLogs.length / this.pageSize));
  }

  // ── Computed: page numbers to display (up to 5 around current) ──────────
  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;

    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // ── Computed: range text for footer ──────────────────────────────────────
  get rangeStart(): number {
    return this.filteredLogs.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredLogs.length);
  }

  // ── Page navigation ───────────────────────────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  prevPage(): void { this.goToPage(this.currentPage - 1); }
  nextPage(): void { this.goToPage(this.currentPage + 1); }

  // ── Reset page when filter / search changes ───────────────────────────────
  onFilterChange(): void { this.currentPage = 1; }
  onSearchChange(): void { this.currentPage = 1; }

  // ── Status helpers ────────────────────────────────────────────────────────
  getStatusClasses(status: string): string {
    switch (status) {
      case 'Success': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Warning': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Blocked': return 'bg-red-50 text-red-700 border-red-100';
      case 'Error': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  getStatusDotClasses(status: string): string {
    switch (status) {
      case 'Success': return 'bg-emerald-500';
      case 'Warning': return 'bg-orange-500';
      case 'Blocked': return 'bg-red-500';
      case 'Error': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  onRefresh(): void {
    this.currentPage = 1;
    console.log('Refreshing logs...');
  }

  onExport(): void {
    console.log('Exporting report...');
  }

  onViewDetails(log: SystemLog): void {
    console.log('Viewing details for:', log);
  }

}
