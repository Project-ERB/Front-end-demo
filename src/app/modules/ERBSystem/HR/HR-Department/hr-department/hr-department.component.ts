import { DepartmentService, DepartmentNode } from './../../../../../core/services/Auth/department/department.service';
import { Component, computed, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";
import { Router, RouterLink } from "@angular/router";
import { ToastrService } from 'ngx-toastr';

export type DeptStatus = 'Active' | 'Inactive';

export interface NavItem { icon: string; label: string; active?: boolean; }
export interface StatCard {
  label: string; icon: string; value: string; sub: string;
  subIcon?: string; subColor?: string; progress?: number;
}

@Component({
  selector: 'app-hr-department',
  imports: [FormsModule, CommonModule, HrSidebarComponent, RouterLink],
  templateUrl: './hr-department.component.html',
  styleUrl: './hr-department.component.scss',
})
export class HrDepartmentComponent implements OnInit {

  private readonly _DepartmentService = inject(DepartmentService);
  private readonly _ToastrService = inject(ToastrService)

  isLoading = false;

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard' },
    { icon: 'group', label: 'Employees' },
    { icon: 'account_tree', label: 'Departments', active: true },
    { icon: 'payments', label: 'Payroll' },
    { icon: 'description', label: 'Reports' },
  ];

  allDepartments = signal<DepartmentNode[]>([]);

  searchQuery = signal('');
  statusFilter = signal<'All' | 'Active' | 'Inactive'>('All');
  sortBy = signal<'Name' | 'Employees'>('Name');

  filteredDepartments = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const s = this.statusFilter();

    return [...this.allDepartments()]
      .filter(d => {
        const matchesQuery = !q || d.name.toLowerCase().includes(q);
        const deptStatus = d.isActive ? 'Active' : 'Inactive';
        const matchesStatus = s === 'All' || deptStatus === s;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) =>
        this.sortBy() === 'Name' ? a.name.localeCompare(b.name) : 0
      );
  });

  // ── Pagination ────────────────────────────────────────
  pageSize = 5;
  currentPage = signal(1);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredDepartments().length / this.pageSize))
  );

  pagedDepartments = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredDepartments().slice(start, start + this.pageSize);
  });

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  statCards: StatCard[] = [
    {
      label: 'Total Departments', icon: 'corporate_fare', value: '0',
      sub: '', subIcon: 'trending_up', subColor: 'text-emerald-600',
    },
    {
      label: 'Active Departments', icon: 'groups', value: '0',
      sub: '', subColor: 'text-slate-500',
    },
    // {
    //   label: 'Inactive Departments', icon: 'pie_chart', value: '0',
    //   sub: '', progress: 0,
    // },
  ];

  // ── Lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
    this.getDepartments();
  }

  getDepartments(): void {
    this.isLoading = true;
    this._DepartmentService.getDepartments().subscribe({
      next: (data) => {
        this.allDepartments.set(data);
        this.isLoading = false;
        this.updateStatCards(data);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  private updateStatCards(data: DepartmentNode[]): void {
    const active = data.filter(d => d.isActive).length;
    const inactive = data.length - active;
    this.statCards[0].value = data.length.toString();
    this.statCards[1].value = active.toString();
    this.statCards[2].value = inactive.toString();
    this.statCards[2].progress = data.length
      ? Math.round((inactive / data.length) * 100)
      : 0;
  }

  // ── Helpers ───────────────────────────────────────────
  setSearch(val: string): void { this.searchQuery.set(val); this.currentPage.set(1); }
  setStatus(val: 'All' | 'Active' | 'Inactive'): void { this.statusFilter.set(val); this.currentPage.set(1); }
  setSort(val: 'Name' | 'Employees'): void { this.sortBy.set(val); }
  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p);
  }
  minVal(a: number, b: number): number { return Math.min(a, b); }

  statusClass(isActive: boolean): string {
    return isActive
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-slate-100 text-slate-600';
  }

  // ── Edit Modal State ─────────────────────────────────
  showEditModal = false;
  isUpdating = false;
  editingDepartment: DepartmentNode | null = null;

  editData = {
    name: '',
    description: '',
    isActive: true,
  };

  // ── Open / Close ─────────────────────────────────────
  onEdit(dept: DepartmentNode): void {
    this.editingDepartment = dept;

    // pre-fill بالبيانات الحالية
    this.editData = {
      name: dept.name,
      description: dept.description ?? '',
      isActive: dept.isActive,
    };

    this.showEditModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingDepartment = null;
    document.body.style.overflow = '';
  }

  // ── Submit Update ─────────────────────────────────────
  onUpdateSubmit(): void {
    if (!this.editingDepartment) return;
    if (!this.editData.name.trim()) return;

    this.isUpdating = true;

    const payload = {
      departmentId: this.editingDepartment.id,
      name: this.editData.name,
      description: this.editData.description,
      managerId: this.editingDepartment.managerId,
      isActive: this.editData.isActive,
    };

    this._DepartmentService.updateDepartment(payload).subscribe({
      next: () => {
        this.isUpdating = false;
        // إضافة ToastrService لو موجود
        this._ToastrService.success('Department updated successfully!');
        this.closeEditModal();
        this.getDepartments();   // refresh الجدول
      },
      error: (err) => {
        this.isUpdating = false;
        console.error('Update failed', err);
        this._ToastrService.error('Failed to update department.');
      },
    });
  }

  deletingDepartmentId: string | null = null;

  onDelete(dept: DepartmentNode): void {
    if (!confirm(`Are you sure you want to delete "${dept.name}"?`)) return;

    this.deletingDepartmentId = dept.id;

    this._DepartmentService.deleteDepartment(dept.id).subscribe({
      next: () => {
        this.deletingDepartmentId = null;
        this.getDepartments(); // refresh الجدول
        this._ToastrService.success('Department deleted successfully!');
      },
      error: (err) => {
        this.deletingDepartmentId = null;
        console.error('Delete failed', err);
        this._ToastrService.error('Failed to delete department.');
      },
    });
  }

  private readonly _router = inject(Router);

  onView(dept: DepartmentNode): void {
    this._router.navigate(['/department-details', dept.id]);
  }

}