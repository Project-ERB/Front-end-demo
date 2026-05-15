import { Component, signal, computed, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SiedeAdminComponent } from '../../../../shared/UI/siede-admin/siede-admin/siede-admin.component';
import {
  AdminService,
  Role,
  UpdateRolePermission,
} from './../../../../core/services/Admin-service/admin.service';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

const ROLE_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-red-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
];

export const ROLE_NAME_OPTIONS = [
  { label: 'System Admin', value: 0 },
  { label: 'CEO', value: 1 },
  { label: 'CFO', value: 2 },
  { label: 'COO', value: 3 },
  { label: 'HR Director', value: 4 },
  { label: 'Accountant', value: 5 },
  { label: 'Senior Accountant', value: 6 },
  { label: 'Financial Manager', value: 7 },
  { label: 'Auditor', value: 8 },
  { label: 'Cashier', value: 9 },
  { label: 'Treasury Manager', value: 10 },
  { label: 'Tax Manager', value: 11 },
  { label: 'AR Clerk', value: 12 },
  { label: 'AP Clerk', value: 13 },
  { label: 'Sales Representative', value: 14 },
  { label: 'Sales Manager', value: 15 },
  { label: 'Sales Support', value: 16 },
  { label: 'Customer', value: 17 },
  { label: 'Procurement Officer', value: 18 },
  { label: 'Procurement Manager', value: 19 },
  { label: 'Supplier Manager', value: 20 },
  { label: 'Supplier', value: 21 },
  { label: 'Inventory Clerk', value: 22 },
  { label: 'Inventory Manager', value: 23 },
  { label: 'Warehouse Keeper', value: 24 },
  { label: 'Warehouse Manager', value: 25 },
  { label: 'HR Clerk', value: 26 },
  { label: 'Recruiter', value: 27 },
  { label: 'Payroll Officer', value: 28 },
  { label: 'Training Manager', value: 29 },
  { label: 'Employee', value: 30 },
  { label: 'Department Manager', value: 31 },
  { label: 'Attendance Officer', value: 32 },
  { label: 'Customer Service', value: 33 },
  { label: 'CRM Manager', value: 34 },
  { label: 'Vendor Relations', value: 35 },
  { label: 'Production Worker', value: 36 },
  { label: 'Production Manager', value: 37 },
  { label: 'Quality Controller', value: 38 },
  { label: 'Maintenance Engineer', value: 39 },
  { label: 'Project Manager', value: 40 },
  { label: 'Project Engineer', value: 41 },
  { label: 'Task Assignee', value: 42 },
  { label: 'BI Analyst', value: 43 },
  { label: 'Data Analyst', value: 44 },
  { label: 'Report Viewer', value: 45 },
  { label: 'IT Support', value: 46 },
  { label: 'Developer', value: 47 },
  { label: 'Database Admin', value: 48 },
  { label: 'Security Officer', value: 49 },
  { label: 'Guest', value: 50 },
  { label: 'Supervisor', value: 51 },
  { label: 'Operator', value: 52 },
];

@Component({
  selector: 'app-rolemanagement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SiedeAdminComponent],
  templateUrl: './rolemanagement.component.html',
  styleUrl: './rolemanagement.component.scss',
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
          '.role-row',
          [
            style({ opacity: 0, transform: 'translateX(-10px)' }),
            stagger(50, [animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('modalIn', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('modalPanelIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(10px)' }),
        animate('300ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.97) translateY(5px)' })),
      ]),
    ]),
    trigger('confirmIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('toastIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px) scale(0.95)' }),
        animate('350ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
  ],
})
export class RolemanagementComponent implements OnInit, OnDestroy {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  // ── Mobile Sidebar ──
  isMobileSidebarOpen = false;

  // ── State ──
  searchQuery = signal('');
  filterQuery = signal('');
  currentPage = signal(1);
  isLoading = signal(false);
  errorMessage = signal('');
  readonly pageSize = 6;

  allRoles = signal<(Role & { color: string })[]>([]);

  hasNextPage = signal(false);
  hasPreviousPage = signal(false);
  private cursorHistory: string[] = [];
  private endCursor: string | null = null;


  // ── Hover ──
  hoveredRoleId: string | null = null;

  // ── Toast ──
  showToastMsg = false;
  toastText = '';
  toastIcon = 'check_circle';
  toastColor = 'text-emerald-400';
  private toastTimer: any;

  // ── Delete Confirm ──
  showDeleteConfirm = false;
  deleteTarget: (Role & { color: string }) | null = null;

  // ── Edit Modal state ──
  showEditModal = false;
  editId = '';
  editName = '';
  editDescription = '';
  editPermissions: UpdateRolePermission[] = [];
  isUpdating = false;
  updateSuccess = '';
  updateError = '';
  readonly roleNameOptions = ROLE_NAME_OPTIONS;

  // ── Computed ──
  filteredRoles = computed(() => {
    const q = this.filterQuery().toLowerCase();
    return this.allRoles().filter(
      (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredRoles().length / this.pageSize))
  );

  paginatedRoles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredRoles().slice(start, start + this.pageSize);
  });

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const start = Math.max(1, current - 1);
    const end = Math.min(total, current + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  showingText = computed(() => {
    const total = this.filteredRoles().length;
    if (total === 0) return 'No roles found';
    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage() * this.pageSize, total);
    return `Showing ${start}–${end} of ${total}`;
  });

  // ── Lifecycle ──
  ngOnInit(): void {
    this.loadRoles();
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
  }

  // ── Sidebar ──
  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  // ── Load ──
  loadRoles(direction: 'first' | 'next' | 'prev' = 'first'): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    let after: string | undefined;

    if (direction === 'next' && this.endCursor) {
      after = this.endCursor;
    } else if (direction === 'prev') {
      after = this.cursorHistory[this.currentPage() - 2];
    }

    this.adminService.getRolesPaged(this.pageSize, after).subscribe({
      next: (page) => {
        this.allRoles.set(
          page.nodes.map((r, i) => ({ ...r, color: ROLE_COLORS[i % ROLE_COLORS.length] }))
        );
        this.hasNextPage.set(page.pageInfo.hasNextPage);
        this.hasPreviousPage.set(page.pageInfo.hasPreviousPage);

        if (page.pageInfo.startCursor) {
          this.cursorHistory[this.currentPage() - 1] = page.pageInfo.startCursor;
        }
        this.endCursor = page.pageInfo.endCursor;
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load roles. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  // ── Pagination Navigation ──
  nextPage(): void {
    if (!this.hasNextPage()) return;
    this.currentPage.update(p => p + 1);
    this.loadRoles('next');
  }

  prevPage(): void {
    if (!this.hasPreviousPage() || this.currentPage() === 1) return;
    this.currentPage.update(p => p - 1);
    this.loadRoles('prev');
  }

  goToFirst(): void {
    this.currentPage.set(1);
    this.cursorHistory = [];
    this.endCursor = null;
    this.loadRoles('first');
  }

  // ── Edit Modal ──
  openEditModal(role: Role & { color: string }): void {
    this.editId = role.id;
    this.editName = role.name;
    this.editDescription = role.description ?? '';
    this.editPermissions = (role.permissions ?? []).map((p) => ({
      permissionId: p.id ?? '',
      permissionName: p.name ?? p.id ?? '',
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
    this.editName = '';
    this.editDescription = '';
    this.editPermissions = [];
    this.updateSuccess = '';
    this.updateError = '';
  }

  onUpdate(): void {
    if (!this.editName.trim() || this.isUpdating) return;
    this.isUpdating = true;
    this.updateSuccess = '';
    this.updateError = '';

    const body = {
      name: this.editName.trim(),
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
        this.updateError = err?.error?.message || 'Update failed. Please try again.';
      },
    });
  }

  // ── Helpers ──
  getResources(role: Role): string[] {
    const all = (role.permissions ?? []).flatMap((p) => p.resources ?? []);
    return [...new Set(all)];
  }

  getPermissionCount(role: Role): number {
    return role.permissions?.length ?? 0;
  }

  getPermColor(index: number): string {
    const colors = [
      'bg-[#6324eb]/8 text-[#6324eb] border-[#6324eb]/15',
      'bg-blue-50 text-blue-600 border-blue-200',
      'bg-emerald-50 text-emerald-600 border-emerald-200',
      'bg-amber-50 text-amber-600 border-amber-200',
      'bg-rose-50 text-rose-600 border-rose-200',
      'bg-cyan-50 text-cyan-600 border-cyan-200',
    ];
    return colors[index % colors.length];
  }

  // ── Pagination ──
  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onFilterChange(value: string): void {
    this.filterQuery.set(value);
  }

  onRefresh(): void {
    this.goToFirst();
    this.showToast('Roles refreshed', 'refresh', 'text-[#6324eb]');
  }

  // ── Hover ──
  onRowHover(id: string | null): void {
    this.hoveredRoleId = id;
  }

  // ── Delete ──
  deletingId = '';

  deleteRole(role: Role & { color: string }): void {
    this.deleteTarget = role;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const role = this.deleteTarget;
    this.deletingId = role.id;
    this.showDeleteConfirm = false;

    this.adminService.deleteRole(role.id).subscribe({
      next: () => {
        this.deletingId = '';
        this.showToast(`"${role.name}" has been deleted`, 'delete', 'text-red-400');
        this.loadRoles('first'); // نرجع للصفحة الأولى بعد الحذف
      },
      error: (err) => {
        this.deletingId = '';
        this.showToast(err?.error?.message || 'Delete failed', 'error', 'text-red-400');
      },
    });
    this.deleteTarget = null;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  onView(role: Role & { color: string }): void {
    this.router.navigate(['/role-details', role.id], { state: { role } });
  }



  // ── Toast ──
  showToast(message: string, icon: string = 'check_circle', color: string = 'text-emerald-400'): void {
    clearTimeout(this.toastTimer);
    this.toastText = message;
    this.toastIcon = icon;
    this.toastColor = color;
    this.showToastMsg = true;
    this.toastTimer = setTimeout(() => { this.showToastMsg = false; }, 2800);
  }

  // ── Keyboard ──
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const input = document.getElementById('role-filter-input');
      input?.focus();
    }
    if (event.key === 'Escape') {
      this.closeMobileSidebar();
      if (this.showEditModal) this.closeEditModal();
      if (this.showDeleteConfirm) this.cancelDelete();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024) {
      this.isMobileSidebarOpen = false;
    }
  }
}