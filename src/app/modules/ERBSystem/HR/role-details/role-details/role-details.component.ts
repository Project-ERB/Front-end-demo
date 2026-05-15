import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService, Role } from '../../../../../core/services/Admin-service/admin.service';
import { SiedeAdminComponent } from '../../../../../shared/UI/siede-admin/siede-admin/siede-admin.component';

@Component({
  selector: 'app-role-details',
  imports: [CommonModule, RouterLink, SiedeAdminComponent],
  templateUrl: './role-details.component.html',
  styleUrl: './role-details.component.scss',
})
export class RoleDetailsComponent {

  role: Role | null = null;
  isLoading = false;
  errorMessage = '';
  isMobileSearchOpen = false;
  showToast = false;
  toastMessage = '';
  copiedResources = false;
  private toastTimeout: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private adminService: AdminService,
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      const stateRole =
        (this.router.getCurrentNavigation()?.extras?.state?.['role'] as Role) ??
        (history.state?.role as Role) ?? null;

      if (stateRole) {
        this.role = stateRole;
      }
      this.loadById(id);
    } else {
      this.errorMessage = 'No role ID provided.';
    }
  }

  private loadById(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getRoleById(id).subscribe({
      next: (role) => {
        this.isLoading = false;
        if (role) {
          this.role = role;
        } else {
          this.errorMessage = `Role "${id}" not found.`;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.message || 'Failed to load role details.';
      },
    });
  }

  retryLoad(): void {
    this.errorMessage = '';
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadById(id);
  }

  // ── UI State ───────────────────────────────────────────

  toggleMobileSearch(): void {
    this.isMobileSearchOpen = !this.isMobileSearchOpen;
    if (this.isMobileSearchOpen) {
      setTimeout(() => {
        const input = document.querySelector('.mobile-search-bar input') as HTMLInputElement;
        input?.focus();
      }, 300);
    }
  }

  triggerToast(message: string): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastMessage = message;
    this.showToast = true;
    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
    }, 2500);
  }

  // ── Events ────────────────────────────────────────────

  onNotificationClick(): void {
    this.triggerToast('No new notifications');
  }

  onPermRowClick(perm: Role['permissions'][0]): void {
    this.triggerToast(`Permission: ${perm.name}`);
  }

  onResourceClick(event: Event, resource: string): void {
    event.stopPropagation();
    this.triggerToast(`Resource: ${resource}`);
  }

  onAccessTap(type: string, allowed: boolean | undefined, event: Event): void {
    event.stopPropagation();
    this.triggerToast(`${type}: ${allowed ? 'Allowed' : 'Denied'}`);
  }

  copyAllResources(): void {
    const resources = this.getAllResources().join(', ');
    navigator.clipboard.writeText(resources).then(() => {
      this.copiedResources = true;
      this.triggerToast('Resources copied to clipboard!');
      setTimeout(() => { this.copiedResources = false; }, 2000);
    }).catch(() => {
      this.triggerToast('Resources copied to clipboard!');
      this.copiedResources = true;
      setTimeout(() => { this.copiedResources = false; }, 2000);
    });
  }

  onQuickAction(action: string): void {
    const messages: Record<string, string> = {
      audit: 'Opening audit log...',
      users: 'Loading assigned users...',
      duplicate: 'Duplicating role...',
      export: 'Preparing export...',
    };
    this.triggerToast(messages[action] || 'Action triggered');
  }

  onSecurityClick(): void {
    this.triggerToast('Opening security policy...');
  }

  // ── Helpers ────────────────────────────────────────────

  getAccess(perm: Role['permissions'][0]) {
    return perm.allowAccess?.[0] ?? null;
  }

  getStatus(): 'active' | 'restricted' | 'inactive' {
    if (!this.role?.permissions?.length) return 'inactive';
    const anyFull = this.role.permissions.some(p => {
      const a = this.getAccess(p);
      return a && a.allowCreate && a.allowDelete && a.allowUpdated && a.allowView;
    });
    return anyFull ? 'active' : 'restricted';
  }

  getStatusLabel(): string {
    return { active: 'Active', restricted: 'Restricted', inactive: 'Inactive' }[this.getStatus()];
  }

  getStatusClass(): string {
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

  getAllResources(): string[] {
    if (!this.role) return [];
    return [...new Set(this.role.permissions.flatMap(p => p.resources ?? []))];
  }

  totalAllowed(): number {
    if (!this.role) return 0;
    return this.role.permissions.reduce((sum, p) => {
      const a = this.getAccess(p);
      if (!a) return sum;
      return sum + [a.allowCreate, a.allowDelete, a.allowUpdated, a.allowView].filter(Boolean).length;
    }, 0);
  }

  totalDenied(): number {
    if (!this.role) return 0;
    return this.role.permissions.length * 4 - this.totalAllowed();
  }

  getAccessPercentage(): number {
    const total = this.totalAllowed() + this.totalDenied();
    if (!total) return 0;
    return Math.round((this.totalAllowed() / total) * 100);
  }

  hasDeleteAccess(): boolean {
    if (!this.role) return false;
    return this.role.permissions.some(p => p.allowAccess?.[0]?.allowDelete);
  }

  getRiskLevel(): { label: string; icon: string; color: string; bg: string; note: string } {
    if (!this.role?.permissions?.length)
      return { label: 'Low Risk', icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-100', note: 'No permissions assigned' };
    if (this.hasDeleteAccess())
      return { label: 'High Risk', icon: 'dangerous', color: 'text-red-600', bg: 'bg-red-100', note: 'Has delete access — MFA required' };
    const hasModify = this.role.permissions.some(p => {
      const a = this.getAccess(p);
      return a && (a.allowCreate || a.allowUpdated);
    });
    if (hasModify)
      return { label: 'Medium Risk', icon: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-100', note: 'Has write access — audit logged' };
    return { label: 'Low Risk', icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-100', note: 'Read-only or minimal access' };
  }

  onBack(): void { this.router.navigate(['/role-mangement']); }
  onEdit(): void { this.router.navigate(['/role-mangement', this.role?.id, 'edit']); }
}