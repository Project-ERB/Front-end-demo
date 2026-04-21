import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DeveloperService } from '../../../../core/services/Developer/developer.service';
import { FormsModule } from '@angular/forms';
import { ApolloservicesService } from '../../../../core/services/apollo/apolloservices.service';
import { PermissionService } from '../../../../core/services/permission/permission.service';
import { SiedeAdminComponent } from "../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";
import { Router } from '@angular/router';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

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

  constructor(
    private _developerService: DeveloperService,
    private __ApolloservicesService: ApolloservicesService,
    private _PermissionService: PermissionService,
    private _Router: Router
  ) { }

  goToDetails(id: string) {
    this._Router.navigate(['/Developer-Details', id]);
  }

  // ─── Pagination ──────────────────────────────────────────────
  pageSize = 10;
  currentCursor: string | null = null;
  previousCursors: string[] = [];
  pageInfo: any = null;
  totalCount = 0;

  authorizedPageSize = 10;
  authorizedCurrentCursor: string | null = null;
  authorizedPreviousCursors: string[] = [];
  authorizedPageInfo: any = null;
  authorizedTotalCount = 0;

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
  selectCursor: string | null = null;
  selectPageInfo: any = null;
  loadingMoreEndpoints = false;

  navItems = [
    { name: 'Dashboard', icon: 'grid', active: false },
    { name: 'Endpoints', icon: 'code', active: true },
    { name: 'Roles', icon: 'shield-check', active: false },
    { name: 'Permissions', icon: 'lock-closed', active: false }
  ];

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
  loadEndpoints(after?: string) {
    this.loading = true;
    this.subscription = this._developerService.getEndpoints(this.pageSize, after)
      .subscribe(({ data, loading, error }: any) => {
        this.loading = loading;
        this.error = error;
        if (data?.endpoints?.nodes) {
          this.endpoints = data.endpoints.nodes.map((node: any, index: number) => ({
            method: node.method || 'GET',
            path: node.path,
            isActive: node.isActive,
            __typename: node.__typename,
            description: 'API Endpoint',
            selected: index === 0
          }));
          this.pageInfo = data.endpoints.pageInfo;
          this.totalCount = data.endpoints.totalCount;
        }
      });
  }

  nextPage() {
    if (!this.pageInfo?.hasNextPage) return;
    this.previousCursors.push(this.currentCursor!);
    this.currentCursor = this.pageInfo.endCursor;
    this.loadEndpoints(this.currentCursor!);
  }

  prevPage() {
    if (!this.previousCursors.length) return;
    this.currentCursor = this.previousCursors.pop() ?? null;
    this.loadEndpoints(this.currentCursor ?? undefined);
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
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.newEndpoint = { path: '', method: 0, roles: [], permissions: [] };
    this.allEndpointsForSelect = [];
    this.selectCursor = null;
    this.selectPageInfo = null;
    this.showPathDropdown = false;
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
      next: () => {
        this.isLoading = false;
        this.closeModal();
        this.loadEndpoints();
        this.loadAuthorizedEndpoints();
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // ─── Authorized Endpoints ────────────────────────────────────
  loadAuthorizedEndpoints(after?: string) {
    this._developerService.getAuthorizedEndpoints(this.authorizedPageSize, after)
      .subscribe({
        next: ({ data }: any) => {
          this.loadingAuthorized = false;
          if (data?.authorizedEndpoints?.nodes) {
            this.authorizedEndpoints = data.authorizedEndpoints.nodes;
            this.authorizedPageInfo = data.authorizedEndpoints.pageInfo;
            this.authorizedTotalCount = data.authorizedEndpoints.totalCount;
          }
        },
        error: (err) => {
          this.loadingAuthorized = false;
          console.error('Full error object:', JSON.stringify(err, null, 2));
          console.error('GraphQL errors:', err?.graphQLErrors);
          console.error('Network error:', err?.networkError);
          console.error('Message:', err?.message);
          console.error('GraphQL error details:', err);  // ✅ هتشوف السبب الحقيقي
        }
      });
  }

  nextAuthorizedPage() {
    if (!this.authorizedPageInfo?.hasNextPage) return;
    const nextCursor = this.authorizedPageInfo.endCursor;
    this.authorizedPreviousCursors.push(this.authorizedCurrentCursor!);
    this.authorizedCurrentCursor = nextCursor;
    this.loadAuthorizedEndpoints(nextCursor);
  }

  prevAuthorizedPage() {
    if (!this.authorizedPreviousCursors.length) return;
    this.authorizedCurrentCursor = this.authorizedPreviousCursors.pop() ?? null;
    this.loadAuthorizedEndpoints(this.authorizedCurrentCursor ?? undefined);
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
      next: () => { },
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
      }
    });
  }

  // ─── Delete ──────────────────────────────────────────────────
  deleteEndpoint(id: string) {
    if (!confirm('Are you sure you want to delete this endpoint?')) return;
    this._developerService.deleteEndpoint(id).subscribe({
      next: () => {
        this.loadEndpoints();
        this.loadAuthorizedEndpoints();
      },
      error: (err) => console.error(err)
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
        },
        error: (err) => console.error('Failed to update roles/permissions:', err)
      });
  }

  // ─── Path Dropdown ───────────────────────────────────────────
  loadEndpointsForSelect(after?: string) {
    if (this.loadingMoreEndpoints) return;
    this.loadingMoreEndpoints = true;
    this._developerService.getEndpoints(10, after).subscribe(({ data }: any) => {
      this.loadingMoreEndpoints = false;
      if (data?.endpoints?.nodes) {
        const newItems = data.endpoints.nodes.map((node: any) => ({
          method: node.method || 'GET',
          path: node.path,
          isActive: node.isActive,
          __typename: node.__typename,
          description: 'API Endpoint',
        }));
        this.allEndpointsForSelect = after
          ? [...this.allEndpointsForSelect, ...newItems]
          : newItems;
        this.selectPageInfo = data.endpoints.pageInfo;
        this.selectCursor = data.endpoints.pageInfo?.endCursor ?? null;
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
  }

  onDropdownScroll(event: Event) {
    const el = event.target as HTMLElement;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
    if (nearBottom && this.selectPageInfo?.hasNextPage && !this.loadingMoreEndpoints) {
      this.loadEndpointsForSelect(this.selectCursor!);
    }
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
}