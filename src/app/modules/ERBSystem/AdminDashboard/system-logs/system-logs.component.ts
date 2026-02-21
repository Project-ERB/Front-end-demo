import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SiedeAdminComponent } from "../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";

export type LogStatus = 'Success' | 'Critical' | 'Warning' | 'Info';
export type LogModule = 'User Mgmt' | 'Database' | 'Billing' | 'Security' | 'Auth' | 'Config' | 'Reports' | 'API Gateway';
export type SortField = 'timestamp' | 'user' | 'module' | 'action' | 'status';
export type SortDir = 'asc' | 'desc';
export type DateRange = 'Last 24 Hours' | 'Last 7 Days' | 'Last 30 Days' | 'Custom Range';

export interface SystemLog {
  id: string;
  timestamp: string;
  userInitials: string;
  userBg: string;
  userText: string;
  userName: string;
  ip: string;
  module: LogModule;
  action: string;
  actionHighlight?: string;
  status: LogStatus;
  selected: boolean;
}

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, SiedeAdminComponent, RouterLink],
  templateUrl: './system-logs.component.html',
  styleUrl: './system-logs.component.scss'
})
export class SystemLogsComponent {

  constructor(private router: Router) { }

  // ── Filters ───────────────────────────────────────────────────────────────
  searchQuery = '';
  selectedDate: DateRange = 'Last 24 Hours';
  selectedMod: string = 'All Modules';

  dateRanges: DateRange[] = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'Custom Range'];
  moduleOptions: string[] = ['All Modules', 'User Mgmt', 'Database', 'Billing', 'Security', 'Auth', 'Config', 'Reports', 'API Gateway'];

  // ── Sorting ───────────────────────────────────────────────────────────────
  sortField: SortField = 'timestamp';
  sortDir: SortDir = 'desc';

  // ── Pagination ────────────────────────────────────────────────────────────
  readonly pageSize = 10;
  currentPage = 1;

  // ── Logs data (25 entries) ────────────────────────────────────────────────
  logs: SystemLog[] = [
    { id: 'LOG-001', timestamp: '2023-10-27 14:32:01', userInitials: 'JD', userBg: 'bg-blue-100', userText: 'text-blue-600', userName: 'John Doe', ip: '192.168.1.45', module: 'User Mgmt', action: 'Updated user permissions for @sarah_m', actionHighlight: '@sarah_m', status: 'Success', selected: false },
    { id: 'LOG-002', timestamp: '2023-10-27 14:31:12', userInitials: 'SY', userBg: 'bg-orange-100', userText: 'text-orange-600', userName: 'System (Auto)', ip: '10.0.0.12', module: 'Database', action: 'Failed connection attempt to Replica Set 3', status: 'Critical', selected: false },
    { id: 'LOG-003', timestamp: '2023-10-27 14:28:45', userInitials: 'AK', userBg: 'bg-purple-100', userText: 'text-purple-600', userName: 'Alice Kim', ip: '192.168.1.18', module: 'Billing', action: 'Generated monthly invoice batch #4402', status: 'Warning', selected: false },
    { id: 'LOG-004', timestamp: '2023-10-27 14:25:02', userInitials: 'MR', userBg: 'bg-indigo-100', userText: 'text-indigo-600', userName: 'Marcus Reed', ip: '192.168.1.92', module: 'Security', action: 'API Key rotated for Service Account: svc-mailer-prod', actionHighlight: 'svc-mailer-prod', status: 'Success', selected: false },
    { id: 'LOG-005', timestamp: '2023-10-27 14:22:18', userInitials: 'UN', userBg: 'bg-gray-200', userText: 'text-gray-600', userName: 'Unknown', ip: '45.22.19.112', module: 'Auth', action: 'Failed login attempt (Invalid Creds)', status: 'Warning', selected: false },
    { id: 'LOG-006', timestamp: '2023-10-27 14:18:05', userInitials: 'DL', userBg: 'bg-teal-100', userText: 'text-teal-600', userName: 'David Liu', ip: '192.168.1.205', module: 'Config', action: 'Updated global settings for EMAIL_RETRY_LIMIT', actionHighlight: 'EMAIL_RETRY_LIMIT', status: 'Success', selected: false },
    { id: 'LOG-007', timestamp: '2023-10-27 14:15:22', userInitials: 'ES', userBg: 'bg-pink-100', userText: 'text-pink-600', userName: 'Emily Stone', ip: '192.168.1.11', module: 'Reports', action: "Exported 'Annual Financials 2023' to PDF", status: 'Success', selected: false },
    { id: 'LOG-008', timestamp: '2023-10-27 14:10:44', userInitials: 'JD', userBg: 'bg-blue-100', userText: 'text-blue-600', userName: 'John Doe', ip: '192.168.1.45', module: 'User Mgmt', action: 'Created new admin account for @p.watts', actionHighlight: '@p.watts', status: 'Success', selected: false },
    { id: 'LOG-009', timestamp: '2023-10-27 14:05:33', userInitials: 'SY', userBg: 'bg-orange-100', userText: 'text-orange-600', userName: 'System (Auto)', ip: '10.0.0.12', module: 'Database', action: 'Scheduled backup completed — 4.2 GB archived', status: 'Success', selected: false },
    { id: 'LOG-010', timestamp: '2023-10-27 13:58:19', userInitials: 'AK', userBg: 'bg-purple-100', userText: 'text-purple-600', userName: 'Alice Kim', ip: '192.168.1.18', module: 'Billing', action: 'Refund issued for Invoice #INV-8821', actionHighlight: '#INV-8821', status: 'Info', selected: false },
    { id: 'LOG-011', timestamp: '2023-10-27 13:52:07', userInitials: 'MR', userBg: 'bg-indigo-100', userText: 'text-indigo-600', userName: 'Marcus Reed', ip: '192.168.1.92', module: 'Security', action: 'Firewall rule added: DENY 45.22.0.0/16', actionHighlight: '45.22.0.0/16', status: 'Success', selected: false },
    { id: 'LOG-012', timestamp: '2023-10-27 13:47:55', userInitials: 'UN', userBg: 'bg-gray-200', userText: 'text-gray-600', userName: 'Unknown', ip: '45.22.19.112', module: 'Auth', action: 'Brute-force detected — IP blocked', status: 'Critical', selected: false },
    { id: 'LOG-013', timestamp: '2023-10-27 13:40:30', userInitials: 'DL', userBg: 'bg-teal-100', userText: 'text-teal-600', userName: 'David Liu', ip: '192.168.1.205', module: 'Config', action: 'Disabled feature flag BETA_CHECKOUT', actionHighlight: 'BETA_CHECKOUT', status: 'Warning', selected: false },
    { id: 'LOG-014', timestamp: '2023-10-27 13:35:14', userInitials: 'ES', userBg: 'bg-pink-100', userText: 'text-pink-600', userName: 'Emily Stone', ip: '192.168.1.11', module: 'Reports', action: "Deleted stale report cache for Q2 2023", status: 'Success', selected: false },
    { id: 'LOG-015', timestamp: '2023-10-27 13:28:02', userInitials: 'JD', userBg: 'bg-blue-100', userText: 'text-blue-600', userName: 'John Doe', ip: '192.168.1.45', module: 'User Mgmt', action: 'Suspended account for @charlie_b', actionHighlight: '@charlie_b', status: 'Warning', selected: false },
    { id: 'LOG-016', timestamp: '2023-10-27 13:20:45', userInitials: 'SY', userBg: 'bg-orange-100', userText: 'text-orange-600', userName: 'System (Auto)', ip: '10.0.0.12', module: 'Database', action: 'Index rebuild started on users_table', status: 'Info', selected: false },
    { id: 'LOG-017', timestamp: '2023-10-27 13:15:33', userInitials: 'AK', userBg: 'bg-purple-100', userText: 'text-purple-600', userName: 'Alice Kim', ip: '192.168.1.18', module: 'Billing', action: 'Payment gateway timeout on transaction #TXN-9912', actionHighlight: '#TXN-9912', status: 'Critical', selected: false },
    { id: 'LOG-018', timestamp: '2023-10-27 13:10:11', userInitials: 'MR', userBg: 'bg-indigo-100', userText: 'text-indigo-600', userName: 'Marcus Reed', ip: '192.168.1.92', module: 'API Gateway', action: 'Rate limit exceeded for client api-key-0091', actionHighlight: 'api-key-0091', status: 'Warning', selected: false },
    { id: 'LOG-019', timestamp: '2023-10-27 13:05:58', userInitials: 'DL', userBg: 'bg-teal-100', userText: 'text-teal-600', userName: 'David Liu', ip: '192.168.1.205', module: 'Config', action: 'Rolled back config to snapshot v2.3.1', actionHighlight: 'v2.3.1', status: 'Success', selected: false },
    { id: 'LOG-020', timestamp: '2023-10-27 12:58:40', userInitials: 'ES', userBg: 'bg-pink-100', userText: 'text-pink-600', userName: 'Emily Stone', ip: '192.168.1.11', module: 'Reports', action: "Shared 'Q3 Metrics' with external stakeholder", status: 'Info', selected: false },
    { id: 'LOG-021', timestamp: '2023-10-27 12:50:22', userInitials: 'JD', userBg: 'bg-blue-100', userText: 'text-blue-600', userName: 'John Doe', ip: '192.168.1.45', module: 'Security', action: 'Two-factor auth reset for user @m.reed', actionHighlight: '@m.reed', status: 'Success', selected: false },
    { id: 'LOG-022', timestamp: '2023-10-27 12:44:05', userInitials: 'UN', userBg: 'bg-gray-200', userText: 'text-gray-600', userName: 'Unknown', ip: '103.41.8.201', module: 'Auth', action: 'Session token forged — request rejected', status: 'Critical', selected: false },
    { id: 'LOG-023', timestamp: '2023-10-27 12:38:50', userInitials: 'AK', userBg: 'bg-purple-100', userText: 'text-purple-600', userName: 'Alice Kim', ip: '192.168.1.18', module: 'Billing', action: 'Tax rate table updated for region EU-WEST', actionHighlight: 'EU-WEST', status: 'Success', selected: false },
    { id: 'LOG-024', timestamp: '2023-10-27 12:30:17', userInitials: 'MR', userBg: 'bg-indigo-100', userText: 'text-indigo-600', userName: 'Marcus Reed', ip: '192.168.1.92', module: 'API Gateway', action: 'New webhook endpoint registered for svc-notify', actionHighlight: 'svc-notify', status: 'Success', selected: false },
    { id: 'LOG-025', timestamp: '2023-10-27 12:22:04', userInitials: 'DL', userBg: 'bg-teal-100', userText: 'text-teal-600', userName: 'David Liu', ip: '192.168.1.205', module: 'Config', action: 'SSL certificate renewed — valid until 2024-10-27', status: 'Success', selected: false },
  ];

  // ── Select-all checkbox ────────────────────────────────────────────────────
  get allSelected(): boolean {
    return this.pagedLogs.length > 0 && this.pagedLogs.every(l => l.selected);
  }

  toggleSelectAll(checked: boolean): void {
    this.pagedLogs.forEach(l => l.selected = checked);
  }

  get selectedCount(): number {
    return this.logs.filter(l => l.selected).length;
  }

  // ── Filtered + sorted logs ────────────────────────────────────────────────
  get filteredLogs(): SystemLog[] {
    let result = this.logs;

    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(l =>
        l.userName.toLowerCase().includes(q) ||
        l.ip.includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
      );
    }

    if (this.selectedMod !== 'All Modules') {
      result = result.filter(l => l.module === this.selectedMod);
    }

    result = [...result].sort((a, b) => {
      let av: string, bv: string;
      switch (this.sortField) {
        case 'timestamp': av = a.timestamp; bv = b.timestamp; break;
        case 'user': av = a.userName; bv = b.userName; break;
        case 'module': av = a.module; bv = b.module; break;
        case 'action': av = a.action; bv = b.action; break;
        case 'status': av = a.status; bv = b.status; break;
        default: av = a.timestamp; bv = b.timestamp;
      }
      const cmp = av.localeCompare(bv);
      return this.sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredLogs.length / this.pageSize));
  }

  get pagedLogs(): SystemLog[] {
    const s = (this.currentPage - 1) * this.pageSize;
    return this.filteredLogs.slice(s, s + this.pageSize);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 1;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  get rangeStart(): number { return this.filteredLogs.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get rangeEnd(): number { return Math.min(this.currentPage * this.pageSize, this.filteredLogs.length); }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }
  prevPage(): void { this.goToPage(this.currentPage - 1); }
  nextPage(): void { this.goToPage(this.currentPage + 1); }

  onFilterChange(): void { this.currentPage = 1; }

  // ── Sorting ────────────────────────────────────────────────────────────────
  setSort(field: SortField): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.currentPage = 1;
  }

  sortIcon(field: SortField): string {
    if (this.sortField !== field) return 'unfold_more';
    return this.sortDir === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down';
  }

  // ── Clear filters ──────────────────────────────────────────────────────────
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedDate = 'Last 24 Hours';
    this.selectedMod = 'All Modules';
    this.currentPage = 1;
  }

  // ── Status helpers ─────────────────────────────────────────────────────────
  getStatusBadge(status: LogStatus): string {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-800 border-green-200';
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'Warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Info': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  }

  getStatusDot(status: LogStatus): string {
    switch (status) {
      case 'Success': return 'bg-green-500';
      case 'Critical': return 'bg-red-500';
      case 'Warning': return 'bg-yellow-500';
      case 'Info': return 'bg-blue-500';
    }
  }

  getStatusRowHover(status: LogStatus): string {
    switch (status) {
      case 'Critical': return 'hover:bg-red-50/40';
      case 'Warning': return 'hover:bg-yellow-50/40';
      default: return 'hover:bg-blue-50/40';
    }
  }

  // ── Module badge ───────────────────────────────────────────────────────────
  getModuleBadge(module: LogModule): string {
    const map: Record<string, string> = {
      'User Mgmt': 'bg-indigo-50 text-indigo-700',
      'Database': 'bg-orange-50 text-orange-700',
      'Billing': 'bg-purple-50 text-purple-700',
      'Security': 'bg-red-50 text-red-700',
      'Auth': 'bg-yellow-50 text-yellow-700',
      'Config': 'bg-teal-50 text-teal-700',
      'Reports': 'bg-pink-50 text-pink-700',
      'API Gateway': 'bg-cyan-50 text-cyan-700',
    };
    return map[module] ?? 'bg-gray-100 text-gray-700';
  }

  // ── Navigate to log detail ─────────────────────────────────────────────────
  viewDetails(log: SystemLog): void {
    this.router.navigate(
      ['log-detail', log.id],
      { state: { log } }
    );
  }

  // ── Export / Refresh (stubs) ───────────────────────────────────────────────
  exportCsv(): void { console.log('Exporting CSV…'); }
  refreshLogs(): void { this.currentPage = 1; console.log('Refreshed'); }

}
