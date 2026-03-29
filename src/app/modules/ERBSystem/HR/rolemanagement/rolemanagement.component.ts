import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SiedeAdminComponent } from '../../../../shared/UI/siede-admin/siede-admin/siede-admin.component';
import {
  AdminService,
  Role,
  UpdateRolePermission,
} from './../../../../core/services/Admin-service/admin.service';

const ROLE_COLORS = [
  'bg-green-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
];

export const ROLE_NAME_OPTIONS = [
  // ── الإدارة العليا
  { label: 'System Admin', value: 0 },
  { label: 'CEO', value: 1 },
  { label: 'CFO', value: 2 },
  { label: 'COO', value: 3 },
  { label: 'HR Director', value: 4 },

  // ── المحاسبة والمالية
  { label: 'Accountant', value: 5 },
  { label: 'Senior Accountant', value: 6 },
  { label: 'Financial Manager', value: 7 },
  { label: 'Auditor', value: 8 },
  { label: 'Cashier', value: 9 },
  { label: 'Treasury Manager', value: 10 },
  { label: 'Tax Manager', value: 11 },
  { label: 'AR Clerk', value: 12 },
  { label: 'AP Clerk', value: 13 },

  // ── المبيعات
  { label: 'Sales Representative', value: 14 },
  { label: 'Sales Manager', value: 15 },
  { label: 'Sales Support', value: 16 },
  { label: 'Customer', value: 17 },

  // ── المشتريات
  { label: 'Procurement Officer', value: 18 },
  { label: 'Procurement Manager', value: 19 },
  { label: 'Supplier Manager', value: 20 },
  { label: 'Supplier', value: 21 },

  // ── المخزون والمستودعات
  { label: 'Inventory Clerk', value: 22 },
  { label: 'Inventory Manager', value: 23 },
  { label: 'Warehouse Keeper', value: 24 },
  { label: 'Warehouse Manager', value: 25 },

  // ── الموارد البشرية
  { label: 'HR Clerk', value: 26 },
  { label: 'Recruiter', value: 27 },
  { label: 'Payroll Officer', value: 28 },
  { label: 'Training Manager', value: 29 },

  // ── شؤون الموظفين
  { label: 'Employee', value: 30 },
  { label: 'Department Manager', value: 31 },
  { label: 'Attendance Officer', value: 32 },

  // ── العملاء والموردين
  { label: 'Customer Service', value: 33 },
  { label: 'CRM Manager', value: 34 },
  { label: 'Vendor Relations', value: 35 },

  // ── الإنتاج والتصنيع
  { label: 'Production Worker', value: 36 },
  { label: 'Production Manager', value: 37 },
  { label: 'Quality Controller', value: 38 },
  { label: 'Maintenance Engineer', value: 39 },

  // ── المشاريع
  { label: 'Project Manager', value: 40 },
  { label: 'Project Engineer', value: 41 },
  { label: 'Task Assignee', value: 42 },

  // ── BI والتقارير
  { label: 'BI Analyst', value: 43 },
  { label: 'Data Analyst', value: 44 },
  { label: 'Report Viewer', value: 45 },

  // ── التقنية والدعم
  { label: 'IT Support', value: 46 },
  { label: 'Developer', value: 47 },
  { label: 'Database Admin', value: 48 },
  { label: 'Security Officer', value: 49 },

  // ── أخرى
  { label: 'Guest', value: 50 },
  { label: 'Supervisor', value: 51 },
  { label: 'Operator', value: 52 },
];

@Component({
  selector: 'app-rolemanagement',
  imports: [CommonModule, FormsModule, RouterLink, SiedeAdminComponent],
  templateUrl: './rolemanagement.component.html',
  styleUrl: './rolemanagement.component.scss',
})
export class RolemanagementComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  // ── State ────────────────────────────────────────────────────────────────
  searchQuery = signal('');
  filterQuery = signal('');
  currentPage = signal(1);
  isLoading = signal(false);
  errorMessage = signal('');
  readonly pageSize = 6;

  allRoles = signal<(Role & { color: string })[]>([]);

  // ── Edit Modal state ──────────────────────────────────────────────────────
  showEditModal = false;
  editId = '';
  editName: number | null = null;
  editDescription = '';
  editPermissions: UpdateRolePermission[] = [];
  isUpdating = false;
  updateSuccess = '';
  updateError = '';
  readonly roleNameOptions = ROLE_NAME_OPTIONS;

  // ── Computed ─────────────────────────────────────────────────────────────
  filteredRoles = computed(() => {
    const q = this.filterQuery().toLowerCase();
    return this.allRoles().filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredRoles().length / this.pageSize))
  );

  paginatedRoles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredRoles().slice(start, start + this.pageSize);
  });

  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  showingText = computed(() => {
    const total = this.filteredRoles().length;
    if (total === 0) return 'No roles found';
    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage() * this.pageSize, total);
    return `Showing ${start} to ${end} of ${total} roles`;
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadRoles();
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  loadRoles(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService.getRoles().subscribe({
      next: (roles) => {
        this.allRoles.set(
          roles.map((r, i) => ({
            ...r,
            color: ROLE_COLORS[i % ROLE_COLORS.length],
          }))
        );
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load roles:', err);
        this.errorMessage.set('Failed to load roles. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  // ── Edit Modal ────────────────────────────────────────────────────────────
  openEditModal(role: Role & { color: string }): void {
    this.editId = role.id;

    const match = ROLE_NAME_OPTIONS.find(
      (o) => o.label.toLowerCase() === role.name.toLowerCase()
    );
    this.editName = match ? match.value : null;
    this.editDescription = role.description ?? '';

    this.editPermissions = (role.permissions ?? []).map((p) => ({
      permissionId: p.id ?? '',
      permissionName: p.name ?? p.id ?? '',  // ← التعديل هنا
      allowCreate: p.allowAccess?.[0]?.allowCreate ?? false,
      allowDelete: p.allowAccess?.[0]?.allowDelete ?? false,
      allowUpdated: p.allowAccess?.[0]?.allowUpdated ?? false,
      allowView: p.allowAccess?.[0]?.allowView ?? false,
    }));

    this.updateSuccess = '';
    this.updateError = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editId = '';
    this.editName = null;
    this.editDescription = '';
    this.editPermissions = [];
    this.updateSuccess = '';
    this.updateError = '';
  }

  onUpdate(): void {
    if (this.editName === null || this.isUpdating) return;

    this.isUpdating = true;
    this.updateSuccess = '';
    this.updateError = '';

    const body = {
      name: this.editName,
      description: this.editDescription,
      setPermissions: this.editPermissions,
    };

    this.adminService.updateRole(this.editId, body).subscribe({
      next: () => {
        this.isUpdating = false;
        this.updateSuccess = 'Role updated successfully!';
        setTimeout(() => {
          this.closeEditModal();
          this.loadRoles();
        }, 1200);
      },
      error: (err) => {
        this.isUpdating = false;
        this.updateError =
          err?.error?.message || 'Update failed. Please try again.';
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getResources(role: Role): string[] {
    const all = (role.permissions ?? []).flatMap((p) => p.resources ?? []);
    return [...new Set(all)];
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onFilterChange(value: string): void {
    this.filterQuery.set(value);
    this.currentPage.set(1);
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  deletingId = '';

  deleteRole(role: Role & { color: string }): void {
    if (!confirm(`Delete role "${role.name}"?`)) return;

    this.deletingId = role.id;

    this.adminService.deleteRole(role.id).subscribe({
      next: () => {
        this.deletingId = '';
        this.allRoles.update((roles) => roles.filter((r) => r.id !== role.id));
      },
      error: (err) => {
        this.deletingId = '';
        alert(err?.error?.message || 'Delete failed. Please try again.');
      },
    });
  }

  onView(role: Role & { color: string }): void {
    this.router.navigate(['/role-details', role.id], {
      state: { role },   // بنبعت الـ object كاملاً → مفيش API call زيادة
    });
  }


}