import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiedeAdminComponent } from "../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";

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
  locked: boolean;    // locked = forced by role, non-editable
}

export interface User {
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

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SiedeAdminComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {

  // ── Search ────────────────────────────────────────────────────────────────
  searchQuery = '';

  // ── Modal state ───────────────────────────────────────────────────────────
  showModal = false;

  // ── Form fields ───────────────────────────────────────────────────────────
  newFullName = '';
  newEmail = '';
  newRole: UserRole = 'Manager';
  formError = '';

  roleOptions: UserRole[] = ['Viewer', 'Editor', 'Manager', 'Super Admin'];

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
  users: User[] = [
    {
      initials: 'AJ', avatarBg: 'bg-blue-100', avatarText: 'text-blue-600',
      name: 'Alice Johnson', email: 'alice@company.com',
      role: 'Super Admin', status: 'Active', lastLogin: '2 mins ago'
    },
    {
      initials: 'BS',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGuAGuS1goMJgwZkI_X6dKNcjm1z7R9pILN5Pt-n2rCFul6yGckRSeTQ4q9DwEhlCghGl-tjHQS9hAzdg7fubXhB1NBG1DA5IuYJEViXLpqe-bsfSDXHiiEdhyifVmZE50QzGL9TtxnItr-L5BPoPCnpDTV4ILFWbLpVmBH5tKG_27ywJkl4IjPvQ62XLqS5p03VZBn0e9EZ-sWsU9Fslo1etT-mnAp1ShBj2GETd_ksOuyn16YAOn1yR3F8FXRHqIcozh80bp25iY',
      avatarBg: 'bg-gray-200', avatarText: '',
      name: 'Bob Smith', email: 'bob@company.com',
      role: 'Editor', status: 'Active', lastLogin: '1 hour ago'
    },
    {
      initials: 'CB', avatarBg: 'bg-orange-100', avatarText: 'text-orange-600',
      name: 'Charlie Brown', email: 'charlie@company.com',
      role: 'Viewer', status: 'Inactive', lastLogin: '2 days ago'
    },
    {
      initials: 'DL', avatarBg: 'bg-teal-100', avatarText: 'text-teal-600',
      name: 'Diana Lee', email: 'diana@company.com',
      role: 'Manager', status: 'Active', lastLogin: '30 mins ago'
    },
    {
      initials: 'EW', avatarBg: 'bg-pink-100', avatarText: 'text-pink-600',
      name: 'Ethan Ward', email: 'ethan@company.com',
      role: 'Editor', status: 'Suspended', lastLogin: '5 days ago'
    },
  ];

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

  // Close modal on backdrop click
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  // Close modal on Escape key
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showModal) this.closeModal();
  }

  // ── Role change → update permissions ─────────────────────────────────────
  onRoleChange(): void {
    const perms = ROLE_PERMISSIONS[this.newRole];
    this.permissions = this.permissions.map((p, i) => ({
      ...p,
      enabled: perms[i],
      locked: this.newRole === 'Super Admin' ? true
        : (i === 0) ? true   // View always locked on
          : (i === 3) ? true   // Delete locked off for non-SA
            : false
    }));
  }

  // ── Role info text ────────────────────────────────────────────────────────
  get roleInfoText(): string {
    switch (this.newRole) {
      case 'Super Admin': return 'Super Admin has full unrestricted access to all system functions.';
      case 'Manager': return 'Manager role has restricted delete permissions by default. Override in role settings.';
      case 'Editor': return 'Editor can view and update records but cannot create or delete entries.';
      case 'Viewer': return 'Viewer has read-only access. No modifications allowed.';
      default: return '';
    }
  }

  // ── Create user ───────────────────────────────────────────────────────────
  createUser(): void {
    this.formError = '';

    if (!this.newFullName.trim()) { this.formError = 'Full name is required.'; return; }
    if (!this.newEmail.trim() || !this.newEmail.includes('@')) { this.formError = 'A valid email is required.'; return; }

    const initials = this.newFullName.trim().split(' ')
      .map(w => w[0]).slice(0, 2).join('').toUpperCase();

    const colours = [
      { bg: 'bg-indigo-100', text: 'text-indigo-700' },
      { bg: 'bg-teal-100', text: 'text-teal-700' },
      { bg: 'bg-rose-100', text: 'text-rose-700' },
      { bg: 'bg-cyan-100', text: 'text-cyan-700' },
    ];
    const c = colours[this.users.length % colours.length];

    this.users.unshift({
      initials,
      avatarBg: c.bg,
      avatarText: c.text,
      name: this.newFullName.trim(),
      email: this.newEmail.trim(),
      role: this.newRole,
      status: 'Active',
      lastLogin: 'Just now'
    });

    this.closeModal();
  }

  // ── Reset form ────────────────────────────────────────────────────────────
  resetForm(): void {
    this.newFullName = '';
    this.newEmail = '';
    this.newRole = 'Manager';
    this.formError = '';
    this.departments = this.departments.map(d => ({ ...d, selected: d.name === 'Product' }));
    this.onRoleChange();
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

  editUser(user: User): void {
    console.log('Edit user:', user.name);
    this.openActionMenuIndex = null;
  }

  suspendUser(user: User): void {
    user.status = user.status === 'Suspended' ? 'Active' : 'Suspended';
    this.openActionMenuIndex = null;
  }

  deleteUser(user: User): void {
    this.users = this.users.filter(u => u !== user);
    this.openActionMenuIndex = null;
  }


}
