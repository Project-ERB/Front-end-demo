import { Component, OnDestroy, OnInit, HostListener, NgZone, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiedeAdminComponent } from "../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";
import { interval, Subscription, switchMap } from 'rxjs';
import { AdminService, SystemHealth } from '../../../../core/services/Admin-service/admin.service';
import { animate, query, stagger, style, transition, trigger, state } from '@angular/animations';

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
  styleUrl: './admin-dash.component.scss',
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('400ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('staggerRows', [
      transition('* => *', [
        query(
          '.log-row',
          [
            style({ opacity: 0, transform: 'translateX(-12px)' }),
            stagger(40, [animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('countUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('600ms 200ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('pulse', [
      state('active', style({ transform: 'scale(1)' })),
      state('inactive', style({ transform: 'scale(0.95)', opacity: 0.7 })),
      transition('active <=> inactive', animate('150ms ease-in-out')),
    ]),
    trigger('shimmer', [
      transition('* => *', [
        style({ backgroundPosition: '-200% 0' }),
        animate('1.5s ease-in-out', style({ backgroundPosition: '200% 0' })),
      ]),
    ]),
  ],
})
export class AdminDashComponent implements OnInit, OnDestroy {

  constructor(
    private _adminService: AdminService,
    private _ngZone: NgZone
  ) { }

  // ── Search & Filter ──
  searchQuery = '';
  isMobileSidebarOpen = false;
  isMobileSearchOpen = false;
  selectedFilter = 'All Events';
  filterOptions = ['All Events', 'Errors Only', 'Warnings', 'Success'];

  // ── Pagination ──
  readonly pageSize = 10;
  currentPage = 1;

  // ── Hover & Interaction States ──
  hoveredLogIndex: number | null = null;
  isRefreshing = false;
  isExporting = false;
  showSuccessToast = false;
  toastMessage = '';
  expandedLogId: string | null = null;

  // ── Widgets ──
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

  // Animated counter
  displayedThreats = 0;

  // ── Log Data ──
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

  // ── Computed Properties ──
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

  get pagedLogs(): SystemLog[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLogs.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredLogs.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  get rangeStart(): number {
    return this.filteredLogs.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredLogs.length);
  }

  get statusCounts(): { success: number; warning: number; error: number; blocked: number } {
    return {
      success: this.logs.filter(l => l.status === 'Success').length,
      warning: this.logs.filter(l => l.status === 'Warning').length,
      error: this.logs.filter(l => l.status === 'Error').length,
      blocked: this.logs.filter(l => l.status === 'Blocked').length,
    };
  }

  // ── Navigation ──
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  prevPage(): void { this.goToPage(this.currentPage - 1); }
  nextPage(): void { this.goToPage(this.currentPage + 1); }

  // ── Reset page ──
  onFilterChange(): void { this.currentPage = 1; }
  onSearchChange(): void { this.currentPage = 1; }

  // ── Status helpers ──
  getStatusClasses(status: string): string {
    switch (status) {
      case 'Success': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Warning': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Blocked': return 'bg-red-50 text-red-700 border-red-200';
      case 'Error': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  getStatusDotClasses(status: string): string {
    switch (status) {
      case 'Success': return 'bg-emerald-500';
      case 'Warning': return 'bg-amber-500';
      case 'Blocked': return 'bg-red-500';
      case 'Error': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Success': return 'check_circle';
      case 'Warning': return 'warning';
      case 'Blocked': return 'block';
      case 'Error': return 'error';
      default: return 'help';
    }
  }

  getRowHoverClasses(status: string): string {
    switch (status) {
      case 'Success': return 'hover:border-l-emerald-400';
      case 'Warning': return 'hover:border-l-amber-400';
      case 'Blocked': return 'hover:border-l-red-400';
      case 'Error': return 'hover:border-l-rose-400';
      default: return 'hover:border-l-slate-300';
    }
  }

  // ── Actions with feedback ──
  onRefresh(): void {
    this.isRefreshing = true;
    this.currentPage = 1;
    this.fetchHealth();
    setTimeout(() => { this.isRefreshing = false; }, 800);
    this.showToast('Logs refreshed successfully');
  }

  onExport(): void {
    this.isExporting = true;
    setTimeout(() => {
      this.isExporting = false;
      this.showToast('Report exported to CSV');
    }, 1200);
  }

  onViewDetails(log: SystemLog): void {
    const key = `${log.timestamp}-${log.userName}`;
    this.expandedLogId = this.expandedLogId === key ? null : key;
  }

  onCopyIp(ip: string, event: Event): void {
    event.stopPropagation();
    navigator.clipboard.writeText(ip).then(() => {
      this.showToast(`IP ${ip} copied to clipboard`);
    });
  }

  // closeMobileSidebar(): void {
  //   this.isMobileSidebarOpen = false;
  // }

  toggleMobileSearch(): void {
    this.isMobileSearchOpen = !this.isMobileSearchOpen;
    if (this.isMobileSearchOpen) {
      setTimeout(() => {
        const input = document.getElementById('mobile-search-input');
        input?.focus();
      }, 100);
    }
  }

  onRowHover(index: number | null): void {
    this.hoveredLogIndex = index;
  }

  // ── Toast ──
  showToast(message: string): void {
    this.toastMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => { this.showSuccessToast = false; }, 2500);
  }

  // ── Counter Animation ──
  animateCounter(target: number, duration: number = 1200): void {
    let start = 0;
    const startTime = performance.now();
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayedThreats = Math.round(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  // ── Health Data ──
  health: SystemHealth | null = null;
  hasError = false;
  isLoading = false;
  lastUpdated: Date | null = null;
  private pollSub?: Subscription;

  ngOnInit(): void {
    this.fetchHealth();
    this.animateCounter(this.securityStats.threatsBlocked);

    this.pollSub = interval(30000)
      .pipe(switchMap(() => this._adminService.getSystemHealth()))
      .subscribe({
        next: (data) => { this.health = data; },
        error: () => { this.hasError = true; }
      });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  fetchHealth(): void {
    this.isLoading = true;
    this.hasError = false;
    this._adminService.getSystemHealth().subscribe({
      next: (data) => {
        this.health = data;
        this.lastUpdated = new Date();
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  get memoryPercent(): number {
    if (!this.health) return 0;
    return Math.round((this.health.memoryUsageGb / this.health.totalMemoryGb) * 100);
  }

  get freeMemory(): number {
    if (!this.health) return 0;
    return Math.round((this.health.totalMemoryGb - this.health.memoryUsageGb) * 100) / 100;
  }

  get cpuBarColor(): string {
    const v = this.health?.cpuLoadPercentage ?? 0;
    if (v < 50) return 'bg-emerald-500';
    if (v < 80) return 'bg-amber-500';
    return 'bg-red-500';
  }

  get memBarColor(): string {
    if (this.memoryPercent < 50) return 'bg-emerald-500';
    if (this.memoryPercent < 80) return 'bg-amber-500';
    return 'bg-red-500';
  }

  get statusBadgeClass(): string {
    return this.health?.status === 'Healthy'
      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      : 'bg-red-100 text-red-700 border border-red-200';
  }

  get statusDotClass(): string {
    return this.health?.status === 'Healthy' ? 'bg-emerald-500' : 'bg-red-500';
  }

  get latencyTextColor(): string {
    const v = this.health?.networkLatencyMs ?? 0;
    if (v < 50) return 'text-emerald-600';
    if (v < 150) return 'text-amber-600';
    return 'text-red-600';
  }

  // ── Keyboard shortcut ──
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    // Ctrl+K to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      if (window.innerWidth < 640) {
        this.toggleMobileSearch();
      } else {
        const input = document.getElementById('desktop-search-input');
        input?.focus();
      }
    }
    // Escape to close sidebar/search
    if (event.key === 'Escape') {
      this.closeMobileSidebar();
      this.isMobileSearchOpen = false;
    }
  }

  // ── Close sidebar on resize ──
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (window.innerWidth >= 1024) {
      this.isMobileSidebarOpen = false;
      this.isMobileSearchOpen = false;
    }
  }

  @ViewChild('mobileSidebar') mobileSidebar!: SiedeAdminComponent;

  toggleMobileSidebar(): void {
    this.mobileSidebar.toggle();
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }
}