import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  PermissionNode,
  AllowAccess,
  PermissionService,
} from '../../../../../core/services/permission/permission.service';
import { SiedeAdminComponent } from '../../../../../shared/UI/siede-admin/siede-admin/siede-admin.component';

@Component({
  selector: 'app-permission-details',
  imports: [CommonModule, SiedeAdminComponent, RouterLink],
  templateUrl: './permission-details.component.html',
  styleUrl: './permission-details.component.scss',
})
export class PermissionDetailsComponent implements OnInit {

  permission: PermissionNode | null = null;
  isLoading = false;
  errorMessage = '';
  isMobileSearchOpen = false;
  showToast = false;
  toastMessage = '';
  copiedId: string | null = null;
  private toastTimeout: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const statePermission = nav?.extras?.state?.['permission'] as PermissionNode | undefined;

    if (statePermission) {
      this.permission = statePermission;
      return;
    }

    const historyState = history.state?.permission as PermissionNode | undefined;
    if (historyState) {
      this.permission = historyState;
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadById(id);
    }
  }

  private loadById(id: string): void {
    this.isLoading = true;
    this.permissionService.getPermissions().subscribe({
      next: (list) => {
        this.isLoading = false;
        this.permission = list.find((p) => p.id === id) ?? null;
        if (!this.permission) {
          this.errorMessage = `Permission with id "${id}" not found.`;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.message || 'Failed to load permission.';
      },
    });
  }

  retryLoad(): void {
    this.errorMessage = '';
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadById(id);
  }

  toggleMobileSearch(): void {
    this.isMobileSearchOpen = !this.isMobileSearchOpen;
    if (this.isMobileSearchOpen) {
      setTimeout(() => {
        const input = document.querySelector('.mobile-search-bar input') as HTMLInputElement;
        input?.focus();
      }, 300);
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedId = text;
      this.triggerToast('Copied to clipboard!');
      setTimeout(() => { this.copiedId = null; }, 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.copiedId = text;
      this.triggerToast('Copied to clipboard!');
      setTimeout(() => { this.copiedId = null; }, 2000);
    });
  }

  private triggerToast(message: string): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastMessage = message;
    this.showToast = true;
    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
    }, 2500);
  }

  onResourceClick(resource: string): void {
    this.triggerToast(`Resource: ${resource}`);
  }

  onAccessCardClick(type: string, allowed: boolean): void {
    this.triggerToast(`${type}: ${allowed ? 'Allowed' : 'Denied'}`);
  }

  onNotificationClick(): void {
    this.triggerToast('No new notifications');
  }

  onSecurityClick(): void {
    this.triggerToast('Opening security policy...');
  }

  onQuickAction(action: string): void {
    const messages: Record<string, string> = {
      audit: 'Opening audit log...',
      roles: 'Loading assigned roles...',
      export: 'Preparing export...',
    };
    this.triggerToast(messages[action] || 'Action triggered');
  }

  getAllowAccess(): AllowAccess | null {
    return this.permission?.allowAccess?.length
      ? this.permission.allowAccess[0]
      : null;
  }

  getStatus(): 'active' | 'restricted' | 'inactive' {
    const access = this.getAllowAccess();
    if (!access) return 'inactive';
    const allTrue =
      access.allowCreate && access.allowDelete && access.allowUpdate && access.allowView;
    return allTrue ? 'active' : 'restricted';
  }

  getStatusLabel(): string {
    return { active: 'Active', restricted: 'Restricted', inactive: 'Inactive' }[this.getStatus()];
  }

  getStatusColorClass(): string {
    return { active: 'text-emerald-600', restricted: 'text-amber-600', inactive: 'text-slate-400' }[this.getStatus()];
  }

  getStatusDotClass(): string {
    return { active: 'bg-emerald-500', restricted: 'bg-amber-500', inactive: 'bg-slate-400' }[this.getStatus()];
  }

  getStatusBadgeClass(): string {
    return {
      active: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      restricted: 'bg-amber-50 border-amber-200 text-amber-700',
      inactive: 'bg-slate-100 border-slate-200 text-slate-500',
    }[this.getStatus()];
  }

  getRiskLevel(): { label: string; icon: string; color: string; bg: string; note: string } {
    const access = this.getAllowAccess();
    if (!access)
      return { label: 'Low Risk', icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-100', note: 'No special audit required' };
    if (access.allowDelete)
      return { label: 'High Risk', icon: 'dangerous', color: 'text-red-600', bg: 'bg-red-100', note: 'Requires Approval & MFA' };
    if (access.allowCreate || access.allowUpdate)
      return { label: 'Medium Risk', icon: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-100', note: 'Requires Audit Logging' };
    return { label: 'Low Risk', icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-100', note: 'Read-only access' };
  }

  getAccessBarClass(index: number): string {
    const access = this.getAllowAccess();
    if (!access) return 'bg-slate-200';
    const permissions = [access.allowView, access.allowCreate, access.allowUpdate, access.allowDelete];
    return permissions[index - 1] ? 'bg-blue-500' : 'bg-slate-200';
  }

  getAccessLevelText(): string {
    const access = this.getAllowAccess();
    if (!access) return 'No access';
    const count = [access.allowView, access.allowCreate, access.allowUpdate, access.allowDelete].filter(Boolean).length;
    return `${count} of 4 permissions granted`;
  }

  onBack(): void {
    this.router.navigate(['/permissions']);
  }
}