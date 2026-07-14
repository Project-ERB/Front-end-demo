import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DeveloperService } from '../../../../core/services/Developer/developer.service';
import { FormsModule } from '@angular/forms';
import { ApolloservicesService } from '../../../../core/services/apollo/apolloservices.service';
import { PermissionService } from '../../../../core/services/permission/permission.service';
import { SiedeAdminComponent } from "../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";
import { Router } from '@angular/router';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';

interface Endpoint {
  method: string;
  path: string;
  isActive: boolean;
  __typename?: string;
  description?: string;
  selected?: boolean;
}

interface AuthorizedEndpoint {
  id: string;
  method: string;
  path: string;
  isActive: boolean;
  roles?: string[];
  permissions?: string[];
  __typename?: string;
}

interface Role {
  name: string;
  assigned: boolean;
}

interface Permission {
  name: string;
  assigned: boolean;
}

@Component({
  selector: 'app-developer',
  standalone: true,
  imports: [CommonModule, FormsModule, SiedeAdminComponent],
  templateUrl: './developer.component.html',
  styleUrl: './developer.component.scss',
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('420ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('staggerItems', [
      transition('* => *', [
        query(
          '.endpoint-item, .auth-card-row',
          [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            stagger(40, [animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('modalPop', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.97) translateY(10px)' }),
        animate('240ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ]),
      transition(':leave', [
        animate('160ms ease-in', style({ opacity: 0, transform: 'scale(0.98) translateY(8px)' })),
      ]),
    ]),
  ],
})
export class DeveloperComponent implements OnInit, OnDestroy {

  @ViewChild(SiedeAdminComponent) sidebar!: SiedeAdminComponent;

  constructor(
    private _developerService: DeveloperService,
    private __ApolloservicesService: ApolloservicesService,
    private _PermissionService: PermissionService,
    private _Router: Router,
    private _ToastrService: ToastrService
  ) { }

  // ─── Toast ───────────────────────────────────────────────────
  showToastMsg = false;
  toastText = '';
  private toastTimer: any;

  fireToast(msg: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastText = msg;
    this.showToastMsg = true;
    this.toastTimer = setTimeout(() => { this.showToastMsg = false; }, 2400);
  }

  // ─── Sidebar ─────────────────────────────────────────────────
  toggleSidebar(): void {
    this.sidebar?.toggle();
  }

  // ─── Copy ────────────────────────────────────────────────────
  copyPath(path: string, event?: Event): void {
    event?.stopPropagation();
    navigator.clipboard.writeText(path).then(() => {
      this.fireToast(`Copied: ${path}`);
    }).catch(() => {
      this.fireToast(`Copied: ${path}`);
    });
  }

  // ─── State ───────────────────────────────────────────────────
  endpoints: Endpoint[] = [];
  rolesList: Role[] = [];
  permissionsList: Permission[] = [];
  authorizedEndpoints: AuthorizedEndpoint[] = [];
  loadingAuthorized = true;
  loading = true;
  error: any;
  isLoading = false;
  private subscription?: Subscription;

  // ─── Search ──────────────────────────────────────────────────
  endpointSearch = '';
  headerSearch = '';

  // ─── Modals ──────────────────────────────────────────────────
  showModal = false;
  showEditModal = false;
  editingEndpoint: AuthorizedEndpoint | null = null;
  showToggleConfirm = false;
  pendingToggleEndpoint: AuthorizedEndpoint | null = null;
  showRolesPermModal = false;
  editingRolesPermEndpoint: AuthorizedEndpoint | null = null;
  modalRoles: Role[] = [];
  modalPermissions: Permission[] = [];

  // ─── Delete Confirm ──────────────────────────────────────────
  showDeleteConfirm = false;
  pendingDeleteId: string | null = null;
  pendingDeletePath: string = '';

  // ─── Mobile Drawer ───────────────────────────────────────────
  showEndpointsDrawer = false;

  // ─── Create Form ─────────────────────────────────────────────
  newEndpoint = {
    path: '',
    method: 0,
    roles: [] as string[],
    permissions: [] as string[]
  };

  // ─── Path Dropdown ───────────────────────────────────────────
  showPathDropdown = false;
  allEndpointsForSelect: Endpoint[] = [];
  loadingMoreEndpoints = false;
  pathSearch = '';

  // ─── Lifecycle ───────────────────────────────────────────────
  ngOnInit() {
    this.loadEndpoints();
    this.loadRoles();
    this.loadPermissions();
    this.loadAuthorizedEndpoints();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  // ─── Endpoints ───────────────────────────────────────────────
  loadEndpoints() {
    this.loading = true;
    this.subscription = this._developerService.getEndpoints()
      .subscribe(({ data, loading, error }: any) => {
        this.loading = loading;
        this.error = error;
        if (data?.endpoints) {
          this.endpoints = data.endpoints.map((node: any, index: number) => ({
            method: node.method || 'GET',
            path: node.path,
            isActive: node.isActive,
            __typename: node.__typename,
            description: 'API Endpoint',
            selected: index === 0
          }));
        }
      });
  }

  // ─── Roles & Permissions ─────────────────────────────────────
  loadRoles() {
    this.__ApolloservicesService.getroles().subscribe((res: any) => {
      this.rolesList = res?.data?.roles?.nodes.map((r: any) => ({
        name: r.name,
        assigned: false,
      })) ?? [];
    });
  }

  loadPermissions() {
    this._PermissionService.getPermissions().subscribe((res: any) => {
      this.permissionsList = res?.map((p: any) => ({
        name: p.name,
        assigned: false,
      })) ?? [];
    });
  }

  // ─── Create Modal ────────────────────────────────────────────
  openModal() {
    this.showEndpointsDrawer = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.newEndpoint = { path: '', method: 0, roles: [], permissions: [] };
    this.allEndpointsForSelect = [];
    this.showPathDropdown = false;
    this.pathSearch = '';
  }

  submitEndpoint() {
    if (!this.newEndpoint.path) return;
    this.isLoading = true;

    const payload = {
      path: this.newEndpoint.path,
      methode: this.newEndpoint.method,
      roles: Array.isArray(this.newEndpoint.roles)
        ? this.newEndpoint.roles.map((r: any) => r?.name ?? r)
        : [this.newEndpoint.roles].map((r: any) => r?.name ?? r),
      permissions: Array.isArray(this.newEndpoint.permissions)
        ? this.newEndpoint.permissions.map((p: any) => p?.name ?? p)
        : [this.newEndpoint.permissions].map((p: any) => p?.name ?? p)
    };

    this._developerService.createEndpoint(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.closeModal();
        this.loadEndpoints();
        this.loadAuthorizedEndpoints();
        this._ToastrService.success('Submit Endpoint Success', 'Success');
      },
      error: (err) => {
        this.isLoading = false;
        this._ToastrService.error('Failed Submit Endpoint', 'Error');
      }
    });
  }

  // ─── Authorized Endpoints ────────────────────────────────────
  loadAuthorizedEndpoints() {
    this._developerService.getAuthorizedEndpoints()
      .subscribe({
        next: ({ data }: any) => {
          this.loadingAuthorized = false;
          if (data?.authorizedEndpoints) {
            this.authorizedEndpoints = data.authorizedEndpoints;
          }
        },
        error: (err) => {
          this.loadingAuthorized = false;
          console.error(err);
        }
      });
  }

  // ─── Edit Modal ──────────────────────────────────────────────
  openEditModal(ep: AuthorizedEndpoint) {
    this.editingEndpoint = { ...ep };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingEndpoint = null;
  }

  saveEdit() {
    if (!this.editingEndpoint) return;
  }

  // ─── Toggle Status ───────────────────────────────────────────
  onToggleStatus(ep: AuthorizedEndpoint, event: Event) {
    event.stopPropagation();
    this.pendingToggleEndpoint = ep;
    this.showToggleConfirm = true;
  }

  cancelToggle() {
    this.showToggleConfirm = false;
    this.pendingToggleEndpoint = null;
  }

  confirmToggle() {
    if (!this.pendingToggleEndpoint) return;

    const ep = this.pendingToggleEndpoint;
    const newStatus = !ep.isActive;
    const epId = ep.id;

    this.showToggleConfirm = false;
    this.pendingToggleEndpoint = null;

    const index = this.authorizedEndpoints.findIndex(e => e.id === epId);
    if (index !== -1) {
      this.authorizedEndpoints = [
        ...this.authorizedEndpoints.slice(0, index),
        { ...this.authorizedEndpoints[index], isActive: newStatus },
        ...this.authorizedEndpoints.slice(index + 1)
      ];
    }

    this._developerService.updateEndpoint(epId, newStatus).subscribe({
      next: () => {
        this.fireToast(`${ep.path} → ${newStatus ? 'Activated' : 'Deactivated'}`);
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        const rollbackIndex = this.authorizedEndpoints.findIndex(e => e.id === epId);
        if (rollbackIndex !== -1) {
          this.authorizedEndpoints = [
            ...this.authorizedEndpoints.slice(0, rollbackIndex),
            { ...this.authorizedEndpoints[rollbackIndex], isActive: !newStatus },
            ...this.authorizedEndpoints.slice(rollbackIndex + 1)
          ];
        }
        this.fireToast('Failed to update status');
      }
    });
  }

  // ─── Delete ──────────────────────────────────────────────────
  deleteEndpoint(id: string, path?: string) {
    this.pendingDeleteId = id;
    this.pendingDeletePath = path || '';
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.pendingDeleteId = null;
    this.pendingDeletePath = '';
  }

  confirmDelete() {
    if (!this.pendingDeleteId) return;
    const id = this.pendingDeleteId;
    this.showDeleteConfirm = false;
    this.pendingDeleteId = null;

    this._developerService.deleteEndpoint(id).subscribe({
      next: () => {
        this.loadEndpoints();
        this.loadAuthorizedEndpoints();
        this.fireToast('Endpoint deleted');
      },
      error: (err) => {
        console.error(err);
        this.fireToast('Failed to delete');
      }
    });
  }

  // ─── Roles & Permissions Modal ───────────────────────────────
  openRolesPermModal(ep: AuthorizedEndpoint) {
    this.editingRolesPermEndpoint = { ...ep };

    const assignedRoles: string[] = ep.roles ?? [];
    const assignedPerms: string[] = ep.permissions ?? [];

    this.modalRoles = (this.rolesList || []).map(r => ({
      name: r.name,
      assigned: assignedRoles.includes(r.name)
    }));

    this.modalPermissions = (this.permissionsList || []).map(p => ({
      name: p.name,
      assigned: assignedPerms.includes(p.name)
    }));

    this.showRolesPermModal = true;
  }

  closeRolesPermModal() {
    this.showRolesPermModal = false;
    this.editingRolesPermEndpoint = null;
    this.modalRoles = [];
    this.modalPermissions = [];
  }

  saveRolesPermissions() {
    if (!this.editingRolesPermEndpoint) return;

    const selectedRoles = this.modalRoles.filter(r => r.assigned).map(r => r.name);
    const selectedPermissions = this.modalPermissions.filter(p => p.assigned).map(p => p.name);

    this._developerService
      .updateRolesPermissions(this.editingRolesPermEndpoint.id, selectedRoles, selectedPermissions)
      .subscribe({
        next: () => {
          this.closeRolesPermModal();
          this.loadAuthorizedEndpoints();
          this.fireToast('Roles & permissions updated');
        },
        error: (err) => {
          console.error('Failed to update roles/permissions:', err);
          this.fireToast('Failed to update');
        }
      });
  }

  // ─── Path Dropdown ───────────────────────────────────────────
  loadEndpointsForSelect() {
    if (this.loadingMoreEndpoints) return;
    this.loadingMoreEndpoints = true;
    this._developerService.getEndpoints().subscribe(({ data }: any) => {
      this.loadingMoreEndpoints = false;
      if (data?.endpoints) {
        this.allEndpointsForSelect = data.endpoints.map((node: any) => ({
          method: node.method || 'GET',
          path: node.path,
          isActive: node.isActive,
          __typename: node.__typename,
          description: 'API Endpoint',
        }));
      }
    });
  }

  openPathDropdown() {
    this.showPathDropdown = true;
    if (this.allEndpointsForSelect.length === 0) {
      this.loadEndpointsForSelect();
    }
  }

  selectPath(path: string) {
    this.newEndpoint.path = path;
    this.showPathDropdown = false;
    this.pathSearch = '';
  }

  // ─── Navigation ──────────────────────────────────────────────
  goToDetails(id: string) {
    this._Router.navigate(['/Developer-Details', id]);
  }

  // ─── Helpers & Getters ───────────────────────────────────────
  get selectedEndpoint(): Endpoint | undefined {
    return this.endpoints.find(e => e.selected);
  }

  get filteredEndpoints(): Endpoint[] {
    if (!this.endpointSearch.trim()) return this.endpoints;
    const q = this.endpointSearch.toLowerCase().trim();
    return this.endpoints.filter(ep =>
      ep.path.toLowerCase().includes(q) || ep.method.toLowerCase().includes(q)
    );
  }

  get filteredAuthorizedEndpoints(): AuthorizedEndpoint[] {
    if (!this.headerSearch.trim()) return this.authorizedEndpoints;
    const q = this.headerSearch.toLowerCase().trim();
    return this.authorizedEndpoints.filter(ep =>
      ep.path.toLowerCase().includes(q) ||
      ep.method.toLowerCase().includes(q) ||
      (ep.isActive ? 'active' : 'inactive').includes(q)
    );
  }

  getMethodColor(method: string): string {
    const m = method?.toUpperCase() || 'GET';
    if (m === 'GET') return 'bg-blue-100 text-blue-700';
    if (m === 'POST') return 'bg-green-100 text-green-700';
    if (m === 'PUT') return 'bg-yellow-100 text-yellow-700';
    if (m === 'DELETE') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  }

  selectEndpoint(endpoint: Endpoint) {
    this.endpoints.forEach(e => e.selected = false);
    endpoint.selected = true;
  }

  toggleRole(role: Role) { role.assigned = !role.assigned; }
  togglePermission(permission: Permission) { permission.assigned = !permission.assigned; }

  get assignedRolesCount(): number { return this.rolesList.filter(r => r.assigned).length; }
  get assignedPermissionsCount(): number { return this.permissionsList.filter(p => p.assigned).length; }
  get selectedModalRolesCount(): number { return this.modalRoles.filter(r => r.assigned).length; }
  get selectedModalPermissionsCount(): number { return this.modalPermissions.filter(p => p.assigned).length; }

  get filteredEndpointsForSelect(): Endpoint[] {
    if (!this.pathSearch.trim()) return this.allEndpointsForSelect;
    const q = this.pathSearch.toLowerCase().trim();
    return this.allEndpointsForSelect.filter(ep =>
      ep.path.toLowerCase().includes(q) ||
      ep.method.toLowerCase().includes(q)
    );
  }

  // ─── Grouped Endpoints State ─────────────────────────────────
  expandedGroups: Set<string> = new Set<string>();

  // استخراج اسم القسم من الـ path
  getGroupName(path: string): string {
    if (!path) return 'OTHER';
    const parts = path.replace(/^\/+/, '').split('/').filter(Boolean);
    // نتجاوز 'api' لو أول جزء
    const idx = parts[0]?.toLowerCase() === 'api' ? 1 : 0;
    return (parts[idx] || 'OTHER').toUpperCase();
  }

  // أيقونات لكل قسم
  getGroupIcon(name: string): string {
    const icons: Record<string, string> = {
      'AUTH': 'login',
      'USERS': 'group',
      'PRODUCTS': 'inventory_2',
      'ORDERS': 'shopping_cart',
      'CATEGORIES': 'category',
      'PAYMENTS': 'payments',
      'SETTINGS': 'settings',
      'ROLES': 'admin_panel_settings',
      'PERMISSIONS': 'vpn_key',
      'BRANDS': 'branding_watermark',
      'REVIEWS': 'rate_review',
      'WISHLIST': 'favorite',
      'CART': 'shopping_cart',
      'CHECKOUT': 'point_of_sale',
      'SHIPPING': 'local_shipping',
      'NOTIFICATIONS': 'notifications',
      'UPLOADS': 'cloud_upload',
      'REPORTS': 'assessment',
      'ANALYTICS': 'analytics',
      'COUPONS': 'local_offer',
      'SLIDERS': 'view_carousel',
      'CONTACT': 'contact_mail',
      'ABOUT': 'info',
      'BLOG': 'article',
    };
    return icons[name] || 'folder';
  }

  // ألوان لكل قسم
  getGroupColor(name: string): string {
    const colors: Record<string, string> = {
      'AUTH': 'text-orange-500 bg-orange-50 border-orange-100',
      'USERS': 'text-blue-500 bg-blue-50 border-blue-100',
      'PRODUCTS': 'text-purple-500 bg-purple-50 border-purple-100',
      'ORDERS': 'text-green-500 bg-green-50 border-green-100',
      'CATEGORIES': 'text-cyan-500 bg-cyan-50 border-cyan-100',
      'PAYMENTS': 'text-yellow-600 bg-yellow-50 border-yellow-100',
      'SETTINGS': 'text-gray-500 bg-gray-100 border-gray-200',
      'ROLES': 'text-indigo-500 bg-indigo-50 border-indigo-100',
      'PERMISSIONS': 'text-pink-500 bg-pink-50 border-pink-100',
      'BRANDS': 'text-rose-500 bg-rose-50 border-rose-100',
      'REVIEWS': 'text-amber-500 bg-amber-50 border-amber-100',
      'WISHLIST': 'text-red-500 bg-red-50 border-red-100',
      'CART': 'text-emerald-500 bg-emerald-50 border-emerald-100',
      'CHECKOUT': 'text-teal-500 bg-teal-50 border-teal-100',
      'SHIPPING': 'text-sky-500 bg-sky-50 border-sky-100',
      'NOTIFICATIONS': 'text-violet-500 bg-violet-50 border-violet-100',
      'UPLOADS': 'text-lime-600 bg-lime-50 border-lime-100',
      'REPORTS': 'text-fuchsia-500 bg-fuchsia-50 border-fuchsia-100',
      'ANALYTICS': 'text-blue-400 bg-blue-50 border-blue-100',
      'COUPONS': 'text-yellow-500 bg-yellow-50 border-yellow-100',
      'SLIDERS': 'text-pink-400 bg-pink-50 border-pink-100',
      'CONTACT': 'text-teal-600 bg-teal-50 border-teal-100',
      'ABOUT': 'text-gray-400 bg-gray-50 border-gray-100',
      'BLOG': 'text-indigo-400 bg-indigo-50 border-indigo-100',
    };
    return colors[name] || 'text-gray-500 bg-gray-50 border-gray-200';
  }

  // فتح/قفل مجموعة
  toggleGroup(groupName: string) {
    if (this.expandedGroups.has(groupName)) {
      this.expandedGroups.delete(groupName);
    } else {
      this.expandedGroups.add(groupName);
    }
  }

  // فتح كل المجموعات
  expandAllGroups() {
    this.filteredGroupedEndpoints.forEach(g => this.expandedGroups.add(g.name));
  }

  // قفل كل المجموعات
  collapseAllGroups() {
    this.expandedGroups.clear();
  }

  // getter لعرض البيانات مجمعة
  get filteredGroupedEndpoints() {
    const filtered = this.filteredEndpoints;
    const groups: Record<string, Endpoint[]> = {};

    filtered.forEach(ep => {
      const groupName = this.getGroupName(ep.path);
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(ep);
    });

    return Object.keys(groups).sort().map(name => ({
      name,
      icon: this.getGroupIcon(name),
      color: this.getGroupColor(name),
      endpoints: groups[name],
      expanded: this.expandedGroups.has(name),
      count: groups[name].length
    }));
  }
}