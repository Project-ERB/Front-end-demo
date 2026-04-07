import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SiedeAdminComponent } from '../../../../shared/UI/siede-admin/siede-admin/siede-admin.component';
import { AdminService, SystemHealth } from '../../../../core/services/Admin-service/admin.service';
import { ApolloservicesService } from '../../../../core/services/apollo/apolloservices.service';
import { interval, Subscription, switchMap } from 'rxjs';

export type UserRole = 'Super Admin' | 'Editor' | 'Manager' | 'Viewer';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

// ── One row in the Permissions Matrix (built dynamically from API) ──────────
export interface ModulePermission {
  id: string;
  key: string;            // permission name as returned by API — used as dict key in payload
  label: string;          // human-readable label (from API description)
  icon: string;           // Material Symbol resolved client-side via ICON_MAP
  allowView: boolean;
  allowCreate: boolean;
  allowUpdated: boolean;  // matches API field name exactly
  allowDelete: boolean;
}

export interface User {
  id?: number | string;
  initials: string;
  avatarUrl?: string;
  avatarBg: string;
  avatarText: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
}

// ── Icon mapping: permission name → Material Symbol ───────────────────────
const ICON_MAP: Record<string, string> = {
  FullAccess: 'admin_panel_settings',
  FullMangeSales: 'payments',
  FullMangeWarehouses: 'inventory_2',
  FullMangeHR: 'diversity_3',
};
const DEFAULT_ICON = 'lock_open';

// ── Avatar helpers ─────────────────────────────────────────────────────────
const AVATAR_COLOURS = [
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-orange-100', text: 'text-orange-600' },
  { bg: 'bg-pink-100', text: 'text-pink-600' },
];

function buildInitials(name: string): string {
  return name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function buildAvatarStyle(index: number): { bg: string; text: string } {
  return AVATAR_COLOURS[index % AVATAR_COLOURS.length];
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SiedeAdminComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {

  private readonly _apolloService = inject(ApolloservicesService);
  private readonly _adminService = inject(AdminService);
  private readonly _formBuilder = inject(FormBuilder);

  // ── Roles from API ─────────────────────────────────────────────────────
  roleOptions: { id: string; name: string }[] = [];

  getroles(): void {
    this._apolloService.getroles().subscribe({
      next: (res) => {
        this.roleOptions = res?.data?.roles?.nodes ?? [];
        this.loadUsers(); // ← هنا بدل ngOnInit
      },
      error: (err) => {
        console.error('roles error:', err);
        this.roleOptions = [];
        this.loadUsers();
      },
    });
  }

  // ── Permissions from API ────────────────────────────────────────────────
  modules: ModulePermission[] = [];
  isLoadingPermissions = false;

  loadPermissions(): void {
    this.isLoadingPermissions = true;
    this.modules = []; // ← reset أول حاجة

    this._adminService.getPermissions().subscribe({
      next: (nodes) => {
        this.modules = (nodes ?? []).map(p => ({
          id: p.id,
          key: p.name,
          label: p.description || p.name,
          icon: ICON_MAP[p.name] ?? DEFAULT_ICON,
          allowView: false,
          allowCreate: false,
          allowUpdated: false,
          allowDelete: false,
        }));
        this.isLoadingPermissions = false; // ← بعد ما modules يتحدث
      },
      error: (err) => {
        console.error('permissions error:', err);
        this.modules = [];
        this.isLoadingPermissions = false;
      },
    });
  }
  // ── Search ─────────────────────────────────────────────────────────────
  searchQuery = '';

  // ── Loading / Error ────────────────────────────────────────────────────
  isLoading = false;
  apiError = '';

  // ── Modal ──────────────────────────────────────────────────────────────
  showModal = false;
  formError = '';
  isSubmitting = false;

  // ── Users ──────────────────────────────────────────────────────────────
  users: User[] = [];

  // ── Actions dropdown ───────────────────────────────────────────────────
  openActionMenuIndex: number | null = null;

  // ── Form ───────────────────────────────────────────────────────────────
  newUserForm: FormGroup = this._formBuilder.group({
    username: [null, Validators.required],
    email: [null, [Validators.required, Validators.email]],
    roleid: [null, Validators.required],
  });

  constructor(private http: HttpClient) { }

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.getroles();      // هي اللي هتستدعي loadUsers جوّاها
    this.loadPermissions();
  }

  trackByKey(index: number, mod: ModulePermission): string {
    return mod.key;
  }

  // ── API: Load users ────────────────────────────────────────────────────
  loadUsers(): void {
    this.isLoading = true;
    this._apolloService.getUsers().subscribe({
      next: (res) => {
        const nodes = res?.data?.users?.nodes ?? [];
        this.users = nodes
          .filter((u: any) => u && u.username)
          .map((u: any, index: number) => {
            const avatar = buildAvatarStyle(index);
            return {
              id: index,
              name: u.username ?? 'Unknown',
              email: u.email ?? '',
              initials: buildInitials(u.username ?? 'U'),
              avatarBg: avatar.bg,
              avatarText: avatar.text,
              role: u.roleNames?.join(', ') ?? '',
              status: 'Active' as UserStatus,
              lastLogin: '-',
            };
          });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('users error:', err);
        this.users = []; // ← مش undefined
        this.isLoading = false;
      },
    });
  }

  // ── Computed ───────────────────────────────────────────────────────────
  get filteredUsers(): User[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.users;
    return this.users.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }

  // ── Badge helpers ──────────────────────────────────────────────────────
  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'Super Admin': return 'bg-purple-100 text-purple-800';
      case 'Editor': return 'bg-blue-100 text-blue-800';
      case 'Manager': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusBadgeClass(status: UserStatus): string {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800';
      case 'Inactive': return 'bg-gray-100 text-gray-600';
      case 'Suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusDotClass(status: UserStatus): string {
    switch (status) {
      case 'Active': return 'bg-emerald-500';
      case 'Inactive': return 'bg-gray-400';
      case 'Suspended': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }

  // ── Modal open / close ─────────────────────────────────────────────────
  openModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showModal) this.closeModal();
  }

  // ── Permissions helpers ────────────────────────────────────────────────
  selectAll(): void {
    this.modules.forEach(m => {
      m.allowView = true; m.allowCreate = true; m.allowUpdated = true; m.allowDelete = true;
    });
  }

  clearAll(): void {
    this.modules.forEach(m => {
      m.allowView = false; m.allowCreate = false; m.allowUpdated = false; m.allowDelete = false;
    });
  }

  // ── API: Create user ───────────────────────────────────────────────────
  createUser(): void {
    this.formError = '';
    this.isSubmitting = true;

    if (this.newUserForm.invalid) {
      this.newUserForm.markAllAsTouched();
      this.isSubmitting = false;
      return;
    }

    // Build permissions dictionary matching the API contract:
    // { "FullAccess": { allowCreate, allowDelete, allowUpdated, allowView }, ... }
    const permissions: Record<string, object> = {};
    this.modules.forEach(m => {
      permissions[m.id] = {
        allowView: m.allowView,
        allowCreate: m.allowCreate,
        allowUpdate: m.allowUpdated,  // ← شيل الـ d
        allowDelete: m.allowDelete,
      };
    });

    const payload = {
      username: this.newUserForm.value.username,
      email: this.newUserForm.value.email,
      roleId: this.newUserForm.value.roleid,
      permissions,
    };

    this._adminService.createAdminNewUser(payload).subscribe({
      next: (response) => {
        console.log('User created successfully:', response);
        this.isSubmitting = false;
        this.closeModal();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Failed to create user:', error);
        this.formError = error?.error?.message ?? 'Failed to create user. Please try again.';
        this.isSubmitting = false;
      },
    });
  }

  // ── Reset form + uncheck all permission rows (keeps API-loaded rows) ────
  resetForm(): void {
    this.newUserForm.reset();
    this.modules.forEach(m => {
      m.allowView = false; m.allowCreate = false; m.allowUpdated = false; m.allowDelete = false;
    });
    this.formError = '';
    this.isSubmitting = false;
  }

  // ── Action menu ────────────────────────────────────────────────────────
  toggleActionMenu(index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.openActionMenuIndex = this.openActionMenuIndex === index ? null : index;
  }

  @HostListener('document:click')
  closeActionMenus(): void {
    this.openActionMenuIndex = null;
  }

  editUser(user: User): void {
    console.log('Edit user:', user.name);
    this.openActionMenuIndex = null;
  }

  suspendUser(user: User): void { }
  deleteUser(user: User): void { }

  getRoleName(roleId: string): string {
    return this.roleOptions.find(r => r.id === roleId)?.name ?? 'Viewer';
  }

}