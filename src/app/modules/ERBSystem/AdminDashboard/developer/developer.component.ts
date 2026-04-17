import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DeveloperService } from '../../../../core/services/Developer/developer.service';
import { FormsModule } from '@angular/forms';
import { ApolloservicesService } from '../../../../core/services/apollo/apolloservices.service';
import { PermissionService } from '../../../../core/services/permission/permission.service';
import { SiedeAdminComponent } from "../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";

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
})
export class DeveloperComponent implements OnInit, OnDestroy {
  constructor(
    private _developerService: DeveloperService,
    private __ApolloservicesService: ApolloservicesService,
    private _PermissionService: PermissionService
  ) { }

  pageSize = 10;
  currentCursor: string | null = null;
  previousCursors: string[] = [];  // stack للـ back navigation
  pageInfo: any = null;
  totalCount = 0;

  endpoints: Endpoint[] = [];
  rolesList: string[] = [];
  permissionsList: string[] = [];
  authorizedEndpoints: AuthorizedEndpoint[] = [];
  loadingAuthorized = true;
  loading = true;
  error: any;
  headerSearch = '';
  private subscription?: Subscription;

  // Create Modal
  showModal = false;

  // Edit Modal
  showEditModal = false;
  editingEndpoint: AuthorizedEndpoint | null = null;

  ngOnInit() {
    this.loadEndpoints();
    this.loadRoles();
    this.loadPermissions();
    this.loadAuthorizedEndpoints();
  }

  newEndpoint = {
    path: '',
    method: 0,
    roles: [] as string[],
    permissions: [] as string[]
  };

  navItems = [
    { name: 'Dashboard', icon: 'grid', active: false },
    { name: 'Endpoints', icon: 'code', active: true },
    { name: 'Roles', icon: 'shield-check', active: false },
    { name: 'Permissions', icon: 'lock-closed', active: false }
  ];

  allowedRoles: Role[] = [
    { name: 'Administrator', assigned: true },
    { name: 'System Manager', assigned: true },
    { name: 'Operations', assigned: true },
    { name: 'Developer', assigned: false },
    { name: 'Auditor', assigned: false },
    { name: 'Support Tier 2', assigned: false }
  ];

  requiredPermissions: Permission[] = [
    { name: 'Orders.Read', assigned: true },
    { name: 'Finance.View', assigned: true },
    { name: 'Orders.Write', assigned: false },
    { name: 'Inventory.Read', assigned: false }
  ];

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

  loadRoles() {
    this.__ApolloservicesService.getroles().subscribe((res: any) => {
      this.rolesList = res?.data?.roles?.nodes.map((r: any) => r.name);
    });
  }

  loadPermissions() {
    this._PermissionService.getPermissions().subscribe((res: any) => {
      this.permissionsList = res?.map((p: any) => p.name);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  // ─── Create Modal ───────────────────────────────────────────
  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.newEndpoint = { path: '', method: 0, roles: [], permissions: [] };
  }

  submitEndpoint() {
    if (!this.newEndpoint.path) return;

    const payload = {
      path: this.newEndpoint.path,
      methode: this.newEndpoint.method,
      roles: Array.isArray(this.newEndpoint.roles)
        ? this.newEndpoint.roles
        : [this.newEndpoint.roles],
      permissions: Array.isArray(this.newEndpoint.permissions)
        ? this.newEndpoint.permissions
        : [this.newEndpoint.permissions]
    };

    this._developerService.createEndpoint(payload).subscribe({
      next: () => {
        this.closeModal();
        this.loadEndpoints();
        this.loadAuthorizedEndpoints();
      },
      error: (err) => console.error(err)
    });
  }

  // ─── Authorized Endpoints ────────────────────────────────────
  loadAuthorizedEndpoints() {
    this._developerService.getAuthorizedEndpoints()
      .subscribe(({ data, loading }: any) => {
        this.loadingAuthorized = loading;
        if (data?.authorizedEndpoints?.nodes) {
          this.authorizedEndpoints = data.authorizedEndpoints.nodes;
        }
      });
  }

  // ─── Edit Modal ──────────────────────────────────────────────
  openEditModal(ep: AuthorizedEndpoint) {
    this.editingEndpoint = { ...ep }; // clone
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingEndpoint = null;
  }



  // ─── Helpers ─────────────────────────────────────────────────
  get selectedEndpoint(): Endpoint | undefined {
    return this.endpoints.find(e => e.selected);
  }

  get filteredAuthorizedEndpoints() {
    if (!this.headerSearch.trim()) return this.authorizedEndpoints;

    const q = this.headerSearch.toLowerCase().trim();
    return this.authorizedEndpoints.filter(ep =>
      ep.path.toLowerCase().includes(q) ||
      ep.method.toLowerCase().includes(q)
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

  toggleRole(role: Role) {
    role.assigned = !role.assigned;
  }

  togglePermission(permission: Permission) {
    permission.assigned = !permission.assigned;
  }

  get assignedRolesCount(): number {
    return this.allowedRoles.filter(r => r.assigned).length;
  }

  get assignedPermissionsCount(): number {
    return this.requiredPermissions.filter(p => p.assigned).length;
  }

  // في developer.component.ts أضف المتغيرات دي
  endpointSearch = '';

  // أضف الـ getter ده
  get filteredEndpoints(): Endpoint[] {
    if (!this.endpointSearch.trim()) return this.endpoints;

    const q = this.endpointSearch.toLowerCase().trim();
    return this.endpoints.filter(ep =>
      ep.path.toLowerCase().includes(q) ||
      ep.method.toLowerCase().includes(q)
    );
  }

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


  saveEdit() {
    if (!this.editingEndpoint) return;

  }


}