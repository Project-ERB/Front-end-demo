import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiedeAdminComponent } from '../../../../shared/UI/siede-admin/siede-admin/siede-admin.component';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Super Admin' | 'Sales Manager' | 'Admin' | 'Viewer' | 'Inventory Clerk' | 'Contractor';
  department: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastActive: string;
  avatarUrl: string;
  isAvatarImage: boolean;
  initials?: string;
}

export interface StatCard {
  label: string;
  value: string;
  icon: string;
  trend: string;
  trendIcon: string;
  trendDirection: 'up' | 'down';
  iconColorClass: string;
  iconBgClass: string;
  trendColorClass: string;
  trendBgClass: string;
}

@Component({
  selector: 'app-usermanagemant',
  standalone: true,
  imports: [CommonModule, FormsModule, SiedeAdminComponent],
  templateUrl: './usermanagemant.component.html',
  styleUrl: './usermanagemant.component.scss',
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
    trigger('staggerItems', [
      transition('* => *', [
        query(
          '.stagger-item',
          [
            style({ opacity: 0, transform: 'translateY(12px)' }),
            stagger(60, [animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('staggerRows', [
      transition('* => *', [
        query(
          '.user-row',
          [
            style({ opacity: 0, transform: 'translateX(-10px)' }),
            stagger(50, [animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(16px) scale(0.96)' }),
        animate('250ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateX(0) scale(1)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateX(8px) scale(0.96)' })),
      ]),
    ]),
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
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
export class UsermanagemantComponent implements OnInit, OnDestroy {

  // ── Mobile Sidebar ──
  isMobileSidebarOpen = false;

  // ── Search & Filters ──
  searchQuery = '';
  selectedRole = 'All Roles';
  selectedStatus = 'All Status';
  roleOptions = ['All Roles', 'Super Admin', 'Sales Manager', 'Admin', 'Viewer', 'Inventory Clerk', 'Contractor'];
  statusOptions = ['All Status', 'Active', 'Inactive', 'Suspended'];
  isMobileFilterOpen = false;

  // ── Selection ──
  selectedUserIds: Set<number> = new Set();
  isAllSelected = false;

  // ── Actions Menu ──
  openActionMenuId: number | null = null;
  bulkActionOpen = false;

  // ── Toast ──
  showToastMsg = false;
  toastText = '';
  toastIcon = 'check_circle';
  toastColor = 'text-emerald-400';

  // ── Pagination ──
  currentPage = 1;
  readonly pageSize = 5;
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  // ── Hover ──
  hoveredUserId: number | null = null;

  // ── Stats ──
  stats: StatCard[] = [
    {
      label: 'Total Users',
      value: '2,453',
      icon: 'group',
      trend: '12%',
      trendIcon: 'trending_up',
      trendDirection: 'up',
      iconColorClass: 'text-[#2463eb]',
      iconBgClass: 'bg-[#2463eb]/10',
      trendColorClass: 'text-emerald-700',
      trendBgClass: 'bg-emerald-50'
    },
    {
      label: 'Active Users',
      value: '2,100',
      icon: 'verified_user',
      trend: '5%',
      trendIcon: 'trending_up',
      trendDirection: 'up',
      iconColorClass: 'text-emerald-600',
      iconBgClass: 'bg-emerald-50',
      trendColorClass: 'text-emerald-700',
      trendBgClass: 'bg-emerald-50'
    },
    {
      label: 'Pending Invites',
      value: '54',
      icon: 'mail',
      trend: '2%',
      trendIcon: 'trending_down',
      trendDirection: 'down',
      iconColorClass: 'text-amber-500',
      iconBgClass: 'bg-amber-50',
      trendColorClass: 'text-red-600',
      trendBgClass: 'bg-red-50'
    }
  ];

  // ── Users Data ──
  users: User[] = [
    {
      id: 1, name: 'Alice Smith', email: 'alice.smith@example.com',
      role: 'Sales Manager', department: 'Sales', status: 'Active', lastActive: 'Just now',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      isAvatarImage: true
    },
    {
      id: 2, name: 'Michael Brown', email: 'michael.b@example.com',
      role: 'Admin', department: 'IT', status: 'Active', lastActive: '2 hours ago',
      avatarUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      isAvatarImage: true
    },
    {
      id: 3, name: 'Courtney Wilson', email: 'c.wilson@example.com',
      role: 'Viewer', department: 'Inventory', status: 'Inactive', lastActive: '5 days ago',
      avatarUrl: '', isAvatarImage: false, initials: 'CW'
    },
    {
      id: 4, name: 'Lindsay Walton', email: 'lindsay.w@example.com',
      role: 'Inventory Clerk', department: 'Warehouse', status: 'Active', lastActive: '1 day ago',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      isAvatarImage: true
    },
    {
      id: 5, name: 'Tom Cook', email: 'tom.cook@example.com',
      role: 'Contractor', department: 'Maintenance', status: 'Suspended', lastActive: '2 months ago',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      isAvatarImage: true
    },
    {
      id: 6, name: 'Sarah Johnson', email: 'sarah.j@example.com',
      role: 'Super Admin', department: 'Engineering', status: 'Active', lastActive: '30 min ago',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      isAvatarImage: true
    },
    {
      id: 7, name: 'David Lee', email: 'david.l@example.com',
      role: 'Admin', department: 'IT', status: 'Inactive', lastActive: '1 week ago',
      avatarUrl: '', isAvatarImage: false, initials: 'DL'
    },
    {
      id: 8, name: 'Emily Davis', email: 'emily.d@example.com',
      role: 'Viewer', department: 'HR', status: 'Active', lastActive: '3 hours ago',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      isAvatarImage: true
    },
  ];

  // ── Filtered Users ──
  get filteredUsers(): User[] {
    let result = this.users;
    if (this.selectedRole !== 'All Roles') {
      result = result.filter(u => u.role === this.selectedRole);
    }
    if (this.selectedStatus !== 'All Status') {
      result = result.filter(u => u.status === this.selectedStatus);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        String(u.id).includes(q)
      );
    }
    return result;
  }

  get pagedUsers(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get rangeStart(): number {
    return this.filteredUsers.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredUsers.length);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const start = Math.max(1, current - 1);
    const end = Math.min(total, current + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // ── Lifecycle ──
  ngOnInit(): void { }

  ngOnDestroy(): void { }

  // ── Sidebar ──
  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  // ── Search & Filter ──
  onSearchChange(): void {
    this.currentPage = 1;
  }

  onRoleChange(): void {
    this.currentPage = 1;
  }

  onStatusChange(): void {
    this.currentPage = 1;
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.selectedRole = 'All Roles';
    this.selectedStatus = 'All Status';
    this.currentPage = 1;
    this.isMobileFilterOpen = false;
  }

  get hasActiveFilters(): boolean {
    return this.searchQuery.trim() !== '' || this.selectedRole !== 'All Roles' || this.selectedStatus !== 'All Status';
  }

  toggleMobileFilter(): void {
    this.isMobileFilterOpen = !this.isMobileFilterOpen;
  }

  // ── Selection ──
  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.selectedUserIds.clear();
      this.isAllSelected = false;
    } else {
      this.pagedUsers.forEach(u => this.selectedUserIds.add(u.id));
      this.isAllSelected = true;
    }
  }

  toggleUserSelect(userId: number): void {
    if (this.selectedUserIds.has(userId)) {
      this.selectedUserIds.delete(userId);
    } else {
      this.selectedUserIds.add(userId);
    }
    this.isAllSelected = this.pagedUsers.every(u => this.selectedUserIds.has(u.id));
  }

  get selectedCount(): number {
    return this.selectedUserIds.size;
  }

  // ── Actions Menu ──
  toggleActionMenu(userId: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.openActionMenuId = this.openActionMenuId === userId ? null : userId;
    this.bulkActionOpen = false;
  }

  closeActionMenu(): void {
    this.openActionMenuId = null;
  }

  toggleBulkAction(): void {
    this.bulkActionOpen = !this.bulkActionOpen;
    this.openActionMenuId = null;
  }

  // ── User Actions ──
  onEditUser(user: User): void {
    this.closeActionMenu();
    this.showToast(`Editing ${user.name}`, 'edit', 'text-[#2463eb]');
  }

  onViewUser(user: User): void {
    this.closeActionMenu();
    this.showToast(`Viewing ${user.name}'s profile`, 'visibility', 'text-[#2463eb]');
  }

  onSuspendUser(user: User): void {
    this.closeActionMenu();
    if (user.status === 'Suspended') {
      user.status = 'Active';
      this.showToast(`${user.name} has been reactivated`, 'check_circle', 'text-emerald-400');
    } else {
      user.status = 'Suspended';
      this.showToast(`${user.name} has been suspended`, 'block', 'text-amber-400');
    }
  }

  onDeleteUser(user: User): void {
    this.closeActionMenu();
    this.users = this.users.filter(u => u.id !== user.id);
    this.selectedUserIds.delete(user.id);
    this.showToast(`${user.name} has been removed`, 'delete', 'text-red-400');
  }

  onSendInvite(): void {
    this.showToast('Invitation sent successfully', 'mail', 'text-emerald-400');
  }

  onBulkDelete(): void {
    const count = this.selectedCount;
    this.users = this.users.filter(u => !this.selectedUserIds.has(u.id));
    this.selectedUserIds.clear();
    this.isAllSelected = false;
    this.bulkActionOpen = false;
    this.showToast(`${count} user(s) removed`, 'delete', 'text-red-400');
  }

  onBulkExport(): void {
    this.bulkActionOpen = false;
    this.showToast(`${this.selectedCount} user(s) exported`, 'download', 'text-emerald-400');
  }

  onAddUser(): void {
    this.showToast('Add user dialog would open here', 'person_add', 'text-[#2463eb]');
  }

  // ── Toast ──
  private toastTimer: any;
  showToast(message: string, icon: string = 'check_circle', color: string = 'text-emerald-400'): void {
    clearTimeout(this.toastTimer);
    this.toastText = message;
    this.toastIcon = icon;
    this.toastColor = color;
    this.showToastMsg = true;
    this.toastTimer = setTimeout(() => { this.showToastMsg = false; }, 2800);
  }

  // ── Status & Role Helpers ──
  getStatusClasses(status: string): string {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Inactive': return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'Suspended': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  }

  getStatusDot(status: string): string {
    switch (status) {
      case 'Active': return 'bg-emerald-500';
      case 'Inactive': return 'bg-slate-400';
      case 'Suspended': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  }

  getRoleClasses(role: string): string {
    switch (role) {
      case 'Super Admin': return 'bg-violet-50 text-violet-700 border border-violet-200';
      case 'Sales Manager': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Admin': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Viewer': return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'Inventory Clerk': return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'Contractor': return 'bg-amber-50 text-amber-700 border border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  }

  getInitialsBg(name: string): string {
    const colors = [
      'bg-rose-100 text-rose-700',
      'bg-sky-100 text-sky-700',
      'bg-amber-100 text-amber-700',
      'bg-teal-100 text-teal-700',
      'bg-violet-100 text-violet-700',
      'bg-emerald-100 text-emerald-700',
      'bg-pink-100 text-pink-700',
      'bg-cyan-100 text-cyan-700',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  // ── Pagination ──
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.selectedUserIds.clear();
    this.isAllSelected = false;
  }

  // ── Hover ──
  onRowHover(userId: number | null): void {
    this.hoveredUserId = userId;
  }

  // ── Keyboard ──
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const input = document.getElementById('user-search-input');
      input?.focus();
    }
    if (event.key === 'Escape') {
      this.closeMobileSidebar();
      this.closeActionMenu();
      this.bulkActionOpen = false;
      this.isMobileFilterOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.action-menu-container')) {
      this.closeActionMenu();
      this.bulkActionOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024) {
      this.isMobileSidebarOpen = false;
      this.isMobileFilterOpen = false;
    }
  }

  // ── Helper: Get User Initials ──
  getUserInitials(user: User): string {
    if (user.initials) return user.initials;
    return user.name.split(' ').map(n => n[0]).join('');
  }
}