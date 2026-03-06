import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SiedeAdminComponent } from "../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";
import { AuthService } from '../../../../core/services/Auth/auth.service';
import { Apollo, gql } from 'apollo-angular';
import { AdminService } from '../../../../core/services/Admin-service/admin.service';
import { ApolloservicesService } from '../../../../core/services/apollo/apolloservices.service';

export type UserRole = 'Super Admin' | 'Editor' | 'Manager' | 'Viewer';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface Department {
  name: string;
  selected: boolean;
}

export interface Permission {
  label: string;
  description: string;
  enabled: boolean;
  locked: boolean;
}

export interface User {
  id?: number | string;       // ← API ID
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

// Permissions granted per role
const ROLE_PERMISSIONS: Record<UserRole, boolean[]> = {
  'Super Admin': [true, true, true, true],
  'Manager': [true, true, true, false],
  'Editor': [true, true, false, false],
  'Viewer': [true, false, false, false],
};

// ── Avatar helpers (used when API doesn't return avatar data) ────────────────
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
  imports: [CommonModule, FormsModule, SiedeAdminComponent, ReactiveFormsModule,],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})

export class UserManagementComponent implements OnInit {

  private readonly _apolloService = inject(ApolloservicesService)
  private readonly _adminService = inject(AdminService)

  private readonly _formBuilder = inject(FormBuilder);

  roleOptions: { id: string; name: string }[] = [];

  getroles(): void {
    this._apolloService.getroles().subscribe({
      next: (res) => {
        console.log(res.data.roles.nodes); // 👈 مهم للتأكد
        this.roleOptions = res?.data?.roles?.nodes ?? [];
      },
      error: (err) => {
        console.error('roles error:', err);
        this.roleOptions = [];
      }
    });
  }

  // ── Search ────────────────────────────────────────────────────────────────
  searchQuery = '';

  // ── Loading / Error ───────────────────────────────────────────────────────
  isLoading = false;
  apiError = '';

  // ── Modal state ───────────────────────────────────────────────────────────
  showModal = false;

  // ── Form fields ───────────────────────────────────────────────────────────
  newFullName = '';
  newEmail = '';
  newRole: string = ''; // ← تأكد أن النوع string عشان بتاخد من select
  formError = '';
  isSubmitting = false;

  departments: Department[] = [
    { name: 'Engineering', selected: false },
    { name: 'Product', selected: true },
    { name: 'Marketing', selected: false },
    { name: 'Finance', selected: false },
    { name: 'Design', selected: false },
  ];

  permissions: Permission[] = [
    { label: 'View Records', description: 'Read-only access', enabled: true, locked: true },
    { label: 'Update Records', description: 'Modify existing data', enabled: true, locked: false },
    { label: 'Create Records', description: 'Add new entries', enabled: true, locked: false },
    { label: 'Delete Records', description: 'Permanent removal', enabled: false, locked: true },
  ];

  // ── Actions dropdown ──────────────────────────────────────────────────────
  openActionMenuIndex: number | null = null;

  // ── User data ─────────────────────────────────────────────────────────────
  users: User[] = [];

  // ── Constructor ───────────────────────────────────────────────────────────
  constructor(private http: HttpClient) { }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.getroles();
  }

  // ── API: Load users ───────────────────────────────────────────────────────
  loadUsers(): void {
  }



  // ── Computed ──────────────────────────────────────────────────────────────
  get filteredUsers(): User[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.users;
    return this.users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }

  // ── Role badge classes ────────────────────────────────────────────────────
  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'Super Admin': return 'bg-purple-100 text-purple-800';
      case 'Editor': return 'bg-blue-100 text-blue-800';
      case 'Manager': return 'bg-amber-100 text-amber-800';
      case 'Viewer': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  // ── Status badge classes ──────────────────────────────────────────────────
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

  // ── Modal open/close ──────────────────────────────────────────────────────
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


  // ── Role info text ────────────────────────────────────────────────────────
  get roleInfoText(): string {
    switch (this.newRole) {
      case 'Super Admin': return 'Super Admin has full unrestricted access to all system functions.';
      case 'Manager': return 'Manager role has restricted delete permissions by default.';
      case 'Editor': return 'Editor can view and update records but cannot create or delete entries.';
      case 'Viewer': return 'Viewer has read-only access. No modifications allowed.';
      default: return '';
    }
  }

  newUserForm: FormGroup = this._formBuilder.group({
    username: [null, Validators.required],
    email: [null, [Validators.required, Validators.email]],
    roleid: [null, Validators.required] // ✅ الاسم الصحيح
  });

  // ── API: Create user ──────────────────────────────────────────────────────
  createUser(): void {
    this.formError = '';
    this.isSubmitting = true;
    if (this.newUserForm.valid) {
      this._adminService.createAdminNewUser(this.newUserForm.value).subscribe({
        next: (response) => {
          console.log('User created successfully:', response);
          this.isSubmitting = false;
          this.closeModal();
          this.loadUsers(); // ← reload الجدول بعد الإضافة
        },
        error: (error) => {
          console.error('Failed to create user:', error);
          this.formError = error?.error?.message ?? 'Failed to create user. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }

  // ── Reset form ────────────────────────────────────────────────────────────
  resetForm(): void {
    this.newUserForm.reset();
    this.formError = '';
    this.isSubmitting = false;
    this.departments = this.departments.map(d => ({ ...d, selected: d.name === 'Product' }));
  }

  // ── Action menu ───────────────────────────────────────────────────────────
  toggleActionMenu(index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.openActionMenuIndex = this.openActionMenuIndex === index ? null : index;
  }

  @HostListener('document:click')
  closeActionMenus(): void {
    this.openActionMenuIndex = null;
  }

  // ── API: Edit user ────────────────────────────────────────────────────────
  editUser(user: User): void {
    // افتح modal للتعديل أو روح لصفحة تانية — حسب الـ UX المطلوب
    console.log('Edit user:', user.name);
    this.openActionMenuIndex = null;
  }

  // ── API: Suspend / Reactivate user ────────────────────────────────────────
  suspendUser(user: User): void {
  }

  // ── API: Delete user ──────────────────────────────────────────────────────
  deleteUser(user: User): void {
  }
}