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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private adminService: AdminService,
  ) { }

  ngOnInit(): void {
    // الـ id موجود دايماً في الـ URL — نعتمد عليه دايماً لضمان بيانات كاملة
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // نعرض بيانات الـ state بسرعة (للـ name في الـ breadcrumb) ونجيب الـ details كاملة
      const stateRole =
        (this.router.getCurrentNavigation()?.extras?.state?.['role'] as Role) ??
        (history.state?.role as Role) ?? null;

      if (stateRole) {
        // نعرض الـ partial data فوراً (اسم، وصف) بينما نجيب الـ permissions
        this.role = stateRole;
      }

      // دايماً نجيب البيانات الكاملة من الـ API عشان الـ permissions تبقى موجودة
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

  // ── helpers ──────────────────────────────────────────────────

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

  onBack(): void { this.router.navigate(['/role-mangement']); }
  onEdit(): void { this.router.navigate(['/role-mangement', this.role?.id, 'edit']); }

}