import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SiedeAdminComponent } from '../../../../shared/UI/siede-admin/siede-admin/siede-admin.component';
import { LogNode, PermissionService, SystemLog, LogStatus } from './../../../../core/services/permission/permission.service';

export type SortField = 'timestamp' | 'user' | 'module' | 'action' | 'status';
export type SortDir = 'asc' | 'desc';
export type DateRange = 'Last 24 Hours' | 'Last 7 Days' | 'Last 30 Days' | 'Custom Range';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, SiedeAdminComponent, RouterLink],
  templateUrl: './system-logs.component.html',
  styleUrl: './system-logs.component.scss',
})
export class SystemLogsComponent implements OnInit {

  constructor(
    private router: Router,
    private logService: PermissionService
  ) { }

  isLoading = false;

  // ── Filters ───────────────────────────────────────────────────────────────
  searchQuery = '';
  selectedDate: DateRange = 'Last 24 Hours';
  selectedMod = 'All Modules';

  dateRanges: DateRange[] = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'Custom Range'];
  moduleOptions: string[] = ['All Modules', 'RefreshTokens', 'Permissions', 'Users', 'Roles'];

  // ── Sorting ───────────────────────────────────────────────────────────────
  sortField: SortField = 'timestamp';
  sortDir: SortDir = 'desc';

  // ── Pagination ────────────────────────────────────────────────────────────
  readonly pageSize = 10;
  currentPage = 1;

  logs: SystemLog[] = [];

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.logService.getLogs().subscribe({
      next: (nodes) => {
        this.logs = nodes.map(n => this.mapNodeToLog(n));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  // ── Map API node → SystemLog ──────────────────────────────────────────────
  private mapNodeToLog(n: LogNode): SystemLog {
    const status = this.resolveStatus(n.level, n.action);
    const { initials, bg, text, name } = this.resolveUser(n.userId, n.ipAddress);

    return {
      id: n.id,
      timestamp: new Date(n.createdAt).toLocaleString(),
      userInitials: initials,
      userBg: bg,
      userText: text,
      userName: name,
      ip: n.ipAddress,
      module: n.tableName,
      action: `${n.action} on ${n.tableName} [${n.primaryKey.slice(0, 8)}…]`,
      status,
      selected: false,
      oldValues: n.oldValues,
      newValues: n.newValues,
      userId: n.userId,
      correlationId: n.correlationId,
    };
  }

  private resolveStatus(level: string, action: string): LogStatus {
    if (level === 'Error' || level === 'Critical') return 'Critical';
    if (level === 'Warning') return 'Warning';
    if (action === 'Delete') return 'Warning';
    if (action === 'Insert' || action === 'Update') return 'Success';
    return 'Info';
  }

  private resolveUser(userId: string | null, ip: string) {
    if (!userId) {
      return { initials: 'SY', bg: 'bg-orange-100', text: 'text-orange-600', name: 'System (Auto)' };
    }
    const short = userId.slice(0, 2).toUpperCase();
    return { initials: short, bg: 'bg-blue-100', text: 'text-blue-600', name: `User ${short}` };
  }

  // ── Select-all ─────────────────────────────────────────────────────────────
  get allSelected(): boolean {
    return this.pagedLogs.length > 0 && this.pagedLogs.every(l => l.selected);
  }
  toggleSelectAll(checked: boolean): void { this.pagedLogs.forEach(l => (l.selected = checked)); }
  get selectedCount(): number { return this.logs.filter(l => l.selected).length; }

  // ── Filtered + sorted ──────────────────────────────────────────────────────
  get filteredLogs(): SystemLog[] {
    let result = this.logs;
    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        l =>
          l.userName.toLowerCase().includes(q) ||
          l.ip.includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q)
      );
    }
    if (this.selectedMod !== 'All Modules') {
      result = result.filter(l => l.module === this.selectedMod);
    }
    return [...result].sort((a, b) => {
      let av = '', bv = '';
      switch (this.sortField) {
        case 'timestamp': av = a.timestamp; bv = b.timestamp; break;
        case 'user': av = a.userName; bv = b.userName; break;
        case 'module': av = a.module; bv = b.module; break;
        case 'action': av = a.action; bv = b.action; break;
        case 'status': av = a.status; bv = b.status; break;
      }
      const cmp = av.localeCompare(bv);
      return this.sortDir === 'asc' ? cmp : -cmp;
    });
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
    const delta = 1;
    const start = Math.max(1, this.currentPage - delta);
    const end = Math.min(this.totalPages, this.currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  get rangeStart(): number {
    return this.filteredLogs.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }
  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredLogs.length);
  }
  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }
  prevPage(): void { this.goToPage(this.currentPage - 1); }
  nextPage(): void { this.goToPage(this.currentPage + 1); }
  onFilterChange(): void { this.currentPage = 1; }

  // ── Sorting ────────────────────────────────────────────────────────────────
  setSort(field: SortField): void {
    this.sortDir = this.sortField === field
      ? (this.sortDir === 'asc' ? 'desc' : 'asc')
      : 'asc';
    this.sortField = field;
    this.currentPage = 1;
  }
  sortIcon(field: SortField): string {
    if (this.sortField !== field) return 'unfold_more';
    return this.sortDir === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down';
  }

  // ── Clear / Refresh / Export ───────────────────────────────────────────────
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedDate = 'Last 24 Hours';
    this.selectedMod = 'All Modules';
    this.currentPage = 1;
  }
  refreshLogs(): void { this.currentPage = 1; this.loadLogs(); }
  exportCsv(): void { console.log('Exporting CSV…'); }

  // ── Status / Module helpers ────────────────────────────────────────────────
  getStatusBadge(status: LogStatus): string {
    const m: Record<LogStatus, string> = {
      Success: 'bg-green-100 text-green-800 border-green-200',
      Critical: 'bg-red-100 text-red-800 border-red-200',
      Warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Info: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return m[status];
  }
  getStatusDot(status: LogStatus): string {
    const m: Record<LogStatus, string> = {
      Success: 'bg-green-500', Critical: 'bg-red-500',
      Warning: 'bg-yellow-500', Info: 'bg-blue-500',
    };
    return m[status];
  }
  getStatusRowHover(status: LogStatus): string {
    if (status === 'Critical') return 'hover:bg-red-50/40';
    if (status === 'Warning') return 'hover:bg-yellow-50/40';
    return 'hover:bg-blue-50/40';
  }
  getModuleBadge(module: string): string {
    const map: Record<string, string> = {
      RefreshTokens: 'bg-orange-50 text-orange-700',
      Permissions: 'bg-indigo-50 text-indigo-700',
      Users: 'bg-blue-50 text-blue-700',
      Roles: 'bg-purple-50 text-purple-700',
    };
    return map[module] ?? 'bg-gray-100 text-gray-700';
  }

  // ── Navigate to detail ────────────────────────────────────────────────────
  viewDetails(log: SystemLog): void {
    this.logService.set(log);
    this.router.navigate(['log-detail', log.id]);
  }
}