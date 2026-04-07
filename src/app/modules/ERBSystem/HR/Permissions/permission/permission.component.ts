import { PERMISSION_GROUPS, PermissionName, PermissionService } from './../../../../../core/services/permission/permission.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PermissionNode, AllowAccess, Resource, UpdatePermissionRequest } from './../../../../../core/services/permission/permission.service';
import { SiedeAdminComponent } from "../../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";

interface EditModule {
  label: string;
  value: Resource;
  checked: boolean;
}



@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SiedeAdminComponent],
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.scss',
})
export class PermissionComponent implements OnInit {

  permissionGroups = PERMISSION_GROUPS;


  // ── List state ───────────────────────────────────────────────────────────────
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 4;
  isLoading = false;
  errorMessage = '';
  allPermissions: PermissionNode[] = [];
  filteredPermissions: PermissionNode[] = [];
  totalPermissions = 0;
  totalPages = 1;

  // ── Edit Modal state ─────────────────────────────────────────────────────────
  showEditModal = false;
  editId = '';
  editName: PermissionName | '' = '';   // ← بس الواحدة دي، احذف التانية string
  editDescription = '';
  editModules: EditModule[] = Object.keys(Resource)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      label: key,
      value: Resource[key as keyof typeof Resource] as Resource,
      checked: false,
    }));
  isUpdating = false;
  updateSuccess = '';
  updateError = '';

  // ── Pagination helpers ───────────────────────────────────────────────────────
  get paginationStart(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get paginationEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalPermissions);
  }

  constructor(
    private permissionService: PermissionService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadPermissions();
  }

  // ── List logic ───────────────────────────────────────────────────────────────
  loadPermissions(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.permissionService.getPermissions().subscribe({
      next: (data) => {
        this.allPermissions = data;
        this.isLoading = false;
        this.updateFilteredPermissions();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.message || 'Failed to load permissions.';
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.updateFilteredPermissions();
  }

  updateFilteredPermissions(): void {
    const query = this.searchQuery.toLowerCase();
    const filtered = this.allPermissions.filter(p =>
      !query || p.name.toLowerCase().includes(query)
    );
    this.totalPermissions = filtered.length;
    this.totalPages = Math.ceil(this.totalPermissions / this.itemsPerPage) || 1;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredPermissions = filtered.slice(start, start + this.itemsPerPage);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateFilteredPermissions();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateFilteredPermissions();
    }
  }

  // ── Edit Modal ───────────────────────────────────────────────────────────────

  openEditModal(perm: PermissionNode): void {
    this.editId = perm.id;
    this.editName = perm.name as PermissionName;
    this.editDescription = perm.description ?? '';
    this.updateSuccess = '';
    this.updateError = '';
    this.showEditModal = true;
    // Map current resources (strings) back to checked state
    this.editModules = Object.keys(Resource)
      .filter(key => isNaN(Number(key)))
      .map(key => ({
        label: key,
        value: Resource[key as keyof typeof Resource] as Resource,
        checked: perm.resources?.includes(key.toUpperCase()) ||
          perm.resources?.includes(
            key.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '')
          ) || false,
      }));

    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  onUpdate(): void {
    if (!this.editName.trim() || this.isUpdating) return;

    this.isUpdating = true;
    this.updateSuccess = '';
    this.updateError = '';

    const payload: UpdatePermissionRequest = {
      id: this.editId,
      name: this.editName.trim(),
      description: this.editDescription.trim(),
      resources: [],
    };

    this.permissionService.updatePermission(payload).subscribe({
      next: (res) => {
        console.log('Permission updated:', res);
        this.isUpdating = false;
        this.updateSuccess = 'Permission updated successfully!';
        setTimeout(() => {
          this.closeEditModal();
          this.loadPermissions(); // reload fresh data from API
        }, 1200);
      },
      error: (err) => {
        this.isUpdating = false;
        this.updateError = err?.error?.message || err?.message || 'Update failed. Please try again.';
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  getAllowAccess(perm: PermissionNode): AllowAccess | null {
    return perm.allowAccess?.length ? perm.allowAccess[0] : null;
  }

  getStatus(perm: PermissionNode): 'active' | 'restricted' | 'inactive' {
    const access = this.getAllowAccess(perm);
    if (!access) return 'inactive';
    const allTrue = access.allowCreate && access.allowDelete && access.allowUpdate && access.allowView;
    return allTrue ? 'active' : 'restricted';
  }

  getStatusClass(perm: PermissionNode): string {
    const map: Record<string, string> = {
      active: 'text-emerald-600',
      restricted: 'text-amber-600',
      inactive: 'text-slate-400',
    };
    return map[this.getStatus(perm)];
  }

  getStatusDotClass(perm: PermissionNode): string {
    const map: Record<string, string> = {
      active: 'bg-emerald-500',
      restricted: 'bg-amber-500',
      inactive: 'bg-slate-400',
    };
    return map[this.getStatus(perm)];
  }

  getStatusLabel(perm: PermissionNode): string {
    const map: Record<string, string> = {
      active: 'Active',
      restricted: 'Restricted',
      inactive: 'Inactive',
    };
    return map[this.getStatus(perm)];
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  deletingId = '';

  onDelete(perm: PermissionNode): void {
    if (!confirm(`Delete permission "${perm.name}"?`)) return;

    this.deletingId = perm.id;

    this.permissionService.deletePermission(perm.id).subscribe({
      next: () => {
        this.deletingId = '';
        this.allPermissions = this.allPermissions.filter(p => p.id !== perm.id);
        this.updateFilteredPermissions();
      },
      error: (err) => {
        this.deletingId = '';
        alert(err?.error?.message || 'Delete failed. Please try again.');
      },
    });
  }
  onView(perm: PermissionNode): void {
    this.router.navigate(['/permission-details', perm.id], {
      state: { permission: perm },   // بنبعت الـ object كاملاً في الـ state
    });
  }
}