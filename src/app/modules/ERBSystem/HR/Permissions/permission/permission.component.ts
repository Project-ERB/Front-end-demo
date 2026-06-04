import { PERMISSION_GROUPS, PermissionName, PermissionService, PermissionsPage } from './../../../../../core/services/permission/permission.service';
import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PermissionNode, AllowAccess, Resource, UpdatePermissionRequest } from './../../../../../core/services/permission/permission.service';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { SiedeAdminComponent } from '../../../../../shared/UI/siede-admin/siede-admin/siede-admin.component';

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
          '.perm-row',
          [
            style({ opacity: 0, transform: 'translateX(-10px)' }),
            stagger(50, [animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('modalIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 })),
      ]),
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
    trigger('toastIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px) scale(0.95)' }),
        animate('350ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
    trigger('confirmIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('slideRight', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms cubic-bezier(0.22, 1, 0.36, 1)', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ transform: 'translateX(-100%)' })),
      ]),
    ]),
  ],

})
export class PermissionComponent implements OnInit, OnDestroy {

  permissionGroups = PERMISSION_GROUPS;

  // ═══ Mobile Sidebar ═══
  showMobileSidebar = false;

  toggleMobileSidebar(): void {
    this.showMobileSidebar = !this.showMobileSidebar;
  }

  closeMobileSidebar(): void {
    this.showMobileSidebar = false;
  }

  // وحدث الـ keyboard و resize كده:
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      document.getElementById('perm-search-input')?.focus();
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
      this.closeMobileSidebar();
    }
  }

  // ── List state ──
  searchQuery = '';
  isLoading = false;
  errorMessage = '';
  filteredPermissions: PermissionNode[] = [];
  totalPermissions = 0;

  // ── Pagination ──
  readonly pageSize = 5;
  currentPage = 1;
  hasNextPage = false;
  hasPreviousPage = false;
  private cursorHistory: string[] = [];
  private endCursor: string | null = null;

  // ── Hover ──
  hoveredPermId: string | null = null;

  // ── Toast ──
  showToastMsg = false;
  toastText = '';
  toastIcon = 'check_circle';
  toastColor = 'text-emerald-400';
  private toastTimer: any;

  // ── Delete Confirm ──
  showDeleteConfirm = false;
  deleteTarget: PermissionNode | null = null;
  deletingId = '';

  // ── Edit Modal ──
  showEditModal = false;
  editId = '';
  editName: PermissionName | '' = '';
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

  constructor(
    private permissionService: PermissionService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadPermissions();
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
  }

  // ── Load ──
  loadPermissions(direction: 'first' | 'next' | 'prev' = 'first'): void {
    this.isLoading = true;
    this.errorMessage = '';

    let after: string | undefined;

    if (direction === 'next' && this.endCursor) {
      after = this.endCursor;
    } else if (direction === 'prev') {
      after = this.cursorHistory[this.currentPage - 3];
    }

    this.permissionService.getPermissionsPaged(this.pageSize, after).subscribe({
      next: (page) => {
        this.filteredPermissions = page.nodes;
        this.totalPermissions = page.nodes.length;
        this.hasNextPage = page.pageInfo.hasNextPage;
        this.hasPreviousPage = page.pageInfo.hasPreviousPage;

        if (page.pageInfo.startCursor) {
          this.cursorHistory[this.currentPage - 1] = page.pageInfo.startCursor;
        }
        this.endCursor = page.pageInfo.endCursor;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.message || 'Failed to load permissions.';
      },
    });
  }

  // ── Pagination Navigation ──
  nextPage(): void {
    if (!this.hasNextPage) return;
    this.currentPage++;
    this.loadPermissions('next');
  }

  prevPage(): void {
    if (!this.hasPreviousPage || this.currentPage <= 1) return;
    this.currentPage--;
    this.loadPermissions('prev');
  }

  goToFirst(): void {
    this.currentPage = 1;
    this.cursorHistory = [];
    this.endCursor = null;
    this.loadPermissions('first');
  }

  // ── Search ──
  onSearch(): void {
    this.goToFirst();
  }

  // ── Hover ──
  onRowHover(id: string | null): void {
    this.hoveredPermId = id;
  }

  // ── Edit Modal ──
  openEditModal(perm: PermissionNode): void {
    this.editId = perm.id;
    this.editName = perm.name as PermissionName;
    this.editDescription = perm.description ?? '';
    this.updateSuccess = '';
    this.updateError = '';
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

  toggleModule(mod: EditModule): void {
    mod.checked = !mod.checked;
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
      resources: this.editModules.filter(m => m.checked).map(m => m.value),
    };

    this.permissionService.updatePermission(payload).subscribe({
      next: (res: any) => { // ← أضف :any
        this.isUpdating = false;

        // ✅ استخراج رسالة النجاح من الـ Response باستخدام الأقواس المربعة
        const successMsg = res?.['message'] || res?.['data']?.['message'] || 'Permission updated successfully!';

        this.updateSuccess = successMsg; // ← عرض الرسالة اللي رجعت من الباك اند
        setTimeout(() => {
          this.closeEditModal();
          this.loadPermissions();
        }, 1200);
      },
      error: (err: any) => { // ← أضف :any
        this.isUpdating = false;

        // ✅ استخراج رسالة الخطأ باستخدام الأقواس المربعة
        const errorMsg = err?.['error']?.['message'] || err?.['message'] || 'Update failed. Please try again.';

        this.updateError = errorMsg; // ← عرض رسالة الخطأ الحقيقية
      },
    });
  }
  // ── Delete ──
  onDelete(perm: PermissionNode): void {
    this.deleteTarget = perm;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const perm = this.deleteTarget;
    this.deletingId = perm.id;
    this.showDeleteConfirm = false;

    this.permissionService.deletePermission(perm.id).subscribe({
      next: (res: any) => { // ← أضف :any
        this.deletingId = '';

        // ✅ استخراج رسالة النجاح من الـ Response باستخدام الأقواس المربعة
        const successMsg = res?.['message'] || res?.['data']?.['message'] || `"${perm.name}" has been deleted`;

        this.showToast(successMsg, 'delete', 'text-red-400');
        this.loadPermissions('first');
      },
      error: (err: any) => { // ← أضف :any
        this.deletingId = '';

        // ✅ استخراج رسالة الخطأ باستخدام الأقواس المربعة
        const errorMsg = err?.['error']?.['message'] || err?.['message'] || 'Delete failed';

        this.showToast(errorMsg, 'error', 'text-red-400');
      },
    });
    this.deleteTarget = null;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  // ── View ──
  onView(perm: PermissionNode): void {
    this.router.navigate(['/permission-details', perm.id], {
      state: { permission: perm },
    });
  }

  onExport(): void {
    this.showToast('Permissions exported to CSV', 'download', 'text-emerald-400');
  }

  // ── Status Helpers ──
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

  getStatusBadgeClass(perm: PermissionNode): string {
    const map: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      restricted: 'bg-amber-50 text-amber-700 border-amber-200',
      inactive: 'bg-slate-100 text-slate-500 border-slate-200',
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

  getStatusIcon(perm: PermissionNode): string {
    const map: Record<string, string> = {
      active: 'check_circle',
      restricted: 'warning',
      inactive: 'cancel',
    };
    return map[this.getStatus(perm)];
  }

  getResourceColor(resource: string): string {
    const colors = [
      'bg-blue-50 text-blue-600 border-blue-200',
      'bg-violet-50 text-violet-600 border-violet-200',
      'bg-emerald-50 text-emerald-600 border-emerald-200',
      'bg-amber-50 text-amber-600 border-amber-200',
      'bg-rose-50 text-rose-600 border-rose-200',
      'bg-cyan-50 text-cyan-600 border-cyan-200',
      'bg-indigo-50 text-indigo-600 border-indigo-200',
      'bg-pink-50 text-pink-600 border-pink-200',
    ];
    return colors[resource.charCodeAt(0) % colors.length];
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

}