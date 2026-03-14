import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { SiedeAdminComponent } from "../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";
import { SystemLog, PermissionService } from '../../../../core/services/permission/permission.service';

export type DetailStatus = 'Success' | 'Critical' | 'Warning' | 'Info';

export interface PermissionChange {
  permission: string;
  action: 'add' | 'remove';
}

export interface LogDetail {
  eventId: string;
  timestamp: string;
  eventType: string;
  status: DetailStatus;
  userInitials: string;
  userBg: string;
  userText: string;
  userName: string;
  userId: string;
  ipAddress: string;
  ipLabel: string;
  device: string;
  userAgent: string;
  module: string;
  moduleIcon: string;
  moduleBg: string;
  specificAction: string;
  description: string;
  descChanges: PermissionChange[];
  oldValues: string | null;
  newValues: string | null;
  correlationId: string;
}

@Component({
  selector: 'app-log-detail',
  standalone: true,
  imports: [CommonModule, SiedeAdminComponent, RouterLink],
  templateUrl: './log-detail.component.html',
  styleUrl: './log-detail.component.scss'
})
export class LogDetailComponent implements OnInit {

  copyTooltip = '';
  isCopied = false;
  formattedOld = '';
  formattedNew = '';
  log!: LogDetail;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private logService: PermissionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    // ── اشترك في تغيير الـ params عشان يتشغل كل مرة ──────────────────
    this.route.params.subscribe(() => {
      this.loadLog();
    });
  }

  private loadLog(): void {
    const rawLog = this.logService.get();

    if (rawLog) {
      this.log = this.mapToDetail(rawLog);
      this.formattedOld = this.tryFormat(this.log.oldValues);
      this.formattedNew = this.tryFormat(this.log.newValues);
      // لا تعمل clear هنا عشان لو refresh الصفحة يفضل موجود
    } else {
      this.log = this.getEmptyLog();
      if (isPlatformBrowser(this.platformId)) {
        this.router.navigate(['/system-logs']);
      }
    }
  }

  // ── Map API node → LogDetail ───────────────────────────────────────────
  private mapToDetail(raw: SystemLog): LogDetail {
    return {
      eventId: raw.id,
      timestamp: raw.timestamp,
      eventType: `${raw.module} — ${raw.action.split(' ')[0]}`,
      status: raw.status as DetailStatus,
      userInitials: raw.userInitials,
      userBg: raw.userBg,
      userText: raw.userText,
      userName: raw.userName,
      userId: raw.userId ?? '—',
      ipAddress: raw.ip,
      ipLabel: this.resolveIpLabel(raw.ip),
      device: '—',
      userAgent: '—',
      module: raw.module,
      moduleIcon: this.resolveModuleIcon(raw.module),
      moduleBg: this.resolveModuleBg(raw.module),
      specificAction: raw.action,
      description: raw.action,
      descChanges: this.parseChanges(raw.oldValues, raw.newValues),
      oldValues: raw.oldValues ?? null,
      newValues: raw.newValues ?? null,
      correlationId: raw.correlationId ?? '—',
    };
  }

  // ── Fallback empty log ─────────────────────────────────────────────────
  private getEmptyLog(): LogDetail {
    return {
      eventId: '—', timestamp: '—', eventType: '—', status: 'Info',
      userInitials: '—', userBg: 'bg-gray-100', userText: 'text-gray-600',
      userName: '—', userId: '—', ipAddress: '—', ipLabel: '—',
      device: '—', userAgent: '—', module: '—', moduleIcon: 'info',
      moduleBg: 'bg-gray-50 text-gray-700 border-gray-100',
      specificAction: '—', description: '—',
      descChanges: [], oldValues: null, newValues: null, correlationId: '—',
    };
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  private resolveIpLabel(ip: string): string {
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) return 'LAN';
    if (ip === '127.0.0.1' || ip === '::1') return 'Localhost';
    return 'External';
  }

  private resolveModuleIcon(module: string): string {
    const map: Record<string, string> = {
      Users: 'group',
      Roles: 'admin_panel_settings',
      Permissions: 'lock',
      RefreshTokens: 'token',
    };
    return map[module] ?? 'settings';
  }

  private resolveModuleBg(module: string): string {
    const map: Record<string, string> = {
      Users: 'bg-blue-50 text-blue-700 border-blue-100',
      Roles: 'bg-purple-50 text-purple-700 border-purple-100',
      Permissions: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      RefreshTokens: 'bg-orange-50 text-orange-700 border-orange-100',
    };
    return map[module] ?? 'bg-gray-50 text-gray-700 border-gray-100';
  }

  private parseChanges(
    oldVal: string | null | undefined,
    newVal: string | null | undefined
  ): PermissionChange[] {
    try {
      if (!oldVal && !newVal) return [];
      const oldObj = oldVal ? JSON.parse(oldVal) : {};
      const newObj = newVal ? JSON.parse(newVal) : {};
      const changes: PermissionChange[] = [];
      const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
      allKeys.forEach(key => {
        if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
          changes.push({
            permission: key,
            action: oldObj[key] !== undefined ? 'remove' : 'add'
          });
        }
      });
      return changes;
    } catch {
      return [];
    }
  }

  private tryFormat(val: string | null | undefined): string {
    if (!val) return '{ }';
    try { return JSON.stringify(JSON.parse(val), null, 2); }
    catch { return val; }
  }

  // ── Status helpers ─────────────────────────────────────────────────────
  getStatusBadge(status: DetailStatus): string {
    const m: Record<DetailStatus, string> = {
      Success: 'bg-green-100 text-green-800 border-green-200',
      Critical: 'bg-red-100 text-red-800 border-red-200',
      Warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Info: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return m[status];
  }

  getStatusDot(status: DetailStatus): string {
    const m: Record<DetailStatus, string> = {
      Success: 'bg-green-500',
      Critical: 'bg-red-500',
      Warning: 'bg-yellow-500',
      Info: 'bg-blue-500',
    };
    return m[status];
  }

  getStatusLabel(status: DetailStatus): string {
    return status === 'Success' ? 'Success / Info' : status;
  }

  // ── Copy JSON ──────────────────────────────────────────────────────────
  copyJson(): void {
    if (this.isCopied) return;
    const text = `Old Values:\n${this.formattedOld}\n\nNew Values:\n${this.formattedNew}`;
    navigator.clipboard.writeText(text).then(() => {
      this.isCopied = true;
      this.copyTooltip = 'Copied!';
      setTimeout(() => { this.isCopied = false; this.copyTooltip = ''; }, 2000);
    }).catch(() => {
      this.copyTooltip = 'Failed to copy';
      setTimeout(() => this.copyTooltip = '', 2000);
    });
  }

  // ── Export PDF ─────────────────────────────────────────────────────────
  exportPdf(): void {
    console.log('Exporting PDF for', this.log.eventId);
  }

  // ── Go back ────────────────────────────────────────────────────────────
  goBack(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.history.back();
    } else {
      this.router.navigate(['/system-logs']);
    }
  }
}