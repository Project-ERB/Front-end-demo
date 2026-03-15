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
  imports: [CommonModule, SiedeAdminComponent],
  templateUrl: './permission-details.component.html',
  styleUrl: './permission-details.component.scss',
})
export class PermissionDetailsComponent implements OnInit {

  permission: PermissionNode | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    // Strategy 1: data passed via router navigation state (no extra HTTP call)
    const nav = this.router.getCurrentNavigation();
    const statePermission = nav?.extras?.state?.['permission'] as PermissionNode | undefined;

    if (statePermission) {
      this.permission = statePermission;
      return;
    }

    // Strategy 2: page refreshed → fall back to history state
    const historyState = history.state?.permission as PermissionNode | undefined;
    if (historyState) {
      this.permission = historyState;
      return;
    }

    // Strategy 3: fetch by id from route param  /permissions/:id
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

  onBack(): void {
    this.router.navigate(['/permissions']);
  }
}
