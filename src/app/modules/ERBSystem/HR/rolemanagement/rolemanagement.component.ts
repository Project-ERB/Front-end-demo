import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SiedeAdminComponent } from "../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";
import { AdminService, Role } from './../../../../core/services/Admin-service/admin.service';

const ROLE_COLORS = [
  'bg-green-500', 'bg-blue-500', 'bg-amber-500', 'bg-pink-500',
  'bg-indigo-500', 'bg-purple-500', 'bg-red-500', 'bg-teal-500',
  'bg-orange-500', 'bg-cyan-500',
];

export const ROLE_NAME_OPTIONS = [
  { label: 'Sales', value: 0 },
  { label: 'Sales Dashboard', value: 1 },
  { label: 'Products', value: 2 },
  { label: 'Categories', value: 3 },
  { label: 'Discounts', value: 4 },
  { label: 'Orders', value: 5 },
  { label: 'Customers', value: 6 },
  { label: 'HR', value: 7 },
  { label: 'Employees', value: 8 },
  { label: 'Departments', value: 9 },
  { label: 'Recruits', value: 10 },
  { label: 'Candidates', value: 11 },
  { label: 'Applications', value: 12 },
  { label: 'Inventory', value: 13 },
  { label: 'Administration', value: 14 },
];

@Component({
  selector: 'app-rolemanagement',
  imports: [CommonModule, FormsModule, RouterLink, SiedeAdminComponent],
  templateUrl: './rolemanagement.component.html',
  styleUrl: './rolemanagement.component.scss',
})
export class RolemanagementComponent implements OnInit {

  private readonly adminService = inject(AdminService);

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
  isUpdating = false;
  updateSuccess = '';
  updateError = '';
  readonly roleNameOptions = ROLE_NAME_OPTIONS;

  // ── Computed ─────────────────────────────────────────────────────────────
  filteredRoles = computed(() => {
    const q = this.filterQuery().toLowerCase();
    return this.allRoles().filter(
      r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
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
      next: roles => {
        this.allRoles.set(
          roles.map((r, i) => ({ ...r, color: ROLE_COLORS[i % ROLE_COLORS.length] }))
        );
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Failed to load roles:', err);
        this.errorMessage.set('Failed to load roles. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  // ── Edit Modal ────────────────────────────────────────────────────────────
  openEditModal(role: Role & { color: string }): void {
    this.editId = role.id;
    // Try to match current name to option value
    const match = ROLE_NAME_OPTIONS.find(
      o => o.label.toLowerCase() === role.name.toLowerCase()
    );
    this.editName = match ? match.value : null;
    this.updateSuccess = '';
    this.updateError = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editId = '';
    this.editName = null;
    this.updateSuccess = '';
    this.updateError = '';
  }

  onUpdate(): void {
    if (this.editName === null || this.isUpdating) return;

    this.isUpdating = true;
    this.updateSuccess = '';
    this.updateError = '';

    this.adminService.updateRole(this.editId, this.editName).subscribe({
      next: () => {
        this.isUpdating = false;
        this.updateSuccess = 'Role updated successfully!';
        setTimeout(() => {
          this.closeEditModal();
          this.loadRoles();
        }, 1200);
      },
      error: err => {
        this.isUpdating = false;
        this.updateError = err?.error?.message || 'Update failed. Please try again.';
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getResources(role: Role): string[] {
    const all = (role.permissions ?? []).flatMap(p => p.resources ?? []);
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
        this.allRoles.update(roles => roles.filter(r => r.id !== role.id));
      },
      error: err => {
        this.deletingId = '';
        alert(err?.error?.message || 'Delete failed. Please try again.');
      },
    });
  }
}