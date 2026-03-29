import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type DeptStatus = 'Active' | 'Inactive';

export interface Department {
  id: number;
  name: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  head: string | null;
  headAvatar: string | null;
  employees: number;
  status: DeptStatus;
}

export interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
}

export interface StatCard {
  label: string;
  icon: string;
  value: string;
  sub: string;
  subIcon?: string;
  subColor?: string;
  progress?: number;
}


@Component({
  selector: 'app-hr-department',
  imports: [FormsModule, CommonModule],
  templateUrl: './hr-department.component.html',
  styleUrl: './hr-department.component.scss',
})
export class HrDepartmentComponent {

  // ── Nav ──────────────────────────────────────────────────────────────────
  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard' },
    { icon: 'group', label: 'Employees' },
    { icon: 'account_tree', label: 'Departments', active: true },
    { icon: 'payments', label: 'Payroll' },
    { icon: 'description', label: 'Reports' },
  ];

  // ── Table data ────────────────────────────────────────────────────────────
  allDepartments: Department[] = [
    {
      id: 1,
      name: 'Marketing & Communications',
      icon: 'campaign',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      head: 'Sarah Jenkins',
      headAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD42qdQcuvLyxqyMfA93MDEAWciWdDZZfzxVnQC-Q_J3XTVyfcWSvXaL7yLbJhIRrskWPNSV2GJxbcd4E4Z3FaYsJu70Dvck0MHIGQ133ALf9F4Wjc7WrshfYldnUlFhWAzW1_yMspfht-jGVezJxTGBD7kVG3OfvAxwsoz9IkDobU7hgyuypB5xciMfmgqPPm_KtuXEWukovZfuFlNhhaRFjS0ce7ny5rRaKu6tSi2ObRhUzC15xVatNul3V-WK1HMWcGa8LJqxR8h',
      employees: 42,
      status: 'Active',
    },
    {
      id: 2,
      name: 'Engineering',
      icon: 'terminal',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      head: 'David Chen',
      headAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiWz7sOKzsbUJaJzQlvMr4b_nMeqnVoV2ORk_399HwQ1KNaynYYjfLoqmIKXrVYSyYGPqJyob4GDDS0LNfK6OpU-ln2ZWud7wRNHsmmWNU9NkoRoKzMYJH8PLZykAWRiNvJUgSOCbCfp0RmvJahVdBvg8DasYkILckP6_YECqcjvKHxWctHfduHknyR4C_Md96xaUXyinqgie3LO7A0KagkWcXX99akvxeL_Xu-sGN088PoU9R-JQnV4OqgGTKtVBSwmDi6jzV35to',
      employees: 128,
      status: 'Active',
    },
    {
      id: 3,
      name: 'Finance & Accounting',
      icon: 'payments',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      head: 'Michelle Wong',
      headAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB09qXMOkIZn87ReuXFNrfSHiEeuMQV63TNM5JeVVfQP6CKXb3hTASkxZFxfjAOsxFJUBPlVm5H4aRk2USQS0vitqEB1yLz-iPY7fvYV-Yso4CA7rvQbJuDDPY4gdzeMpDGJposRO439iRB1RWijRsWt0q9-xUPCA80Crp_i9ZW-HuvB-Gztd0QQ6UYaXGKJ5fI7aMvtEFfEv6499gmnxykjJ0i58fNOjkIPDZCki216Af2QXJJrgkY-BqEfRZ9dgxDYRMv3OwSCuqJ',
      employees: 15,
      status: 'Active',
    },
    {
      id: 4,
      name: 'Legal & Compliance',
      icon: 'history_edu',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-500',
      head: null,
      headAvatar: null,
      employees: 8,
      status: 'Inactive',
    },
    {
      id: 5,
      name: 'Human Resources',
      icon: 'person_search',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      head: 'Elena Rodriguez',
      headAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV-55mKXEaH-W8wA2oM9beI-GIu04AVuYwUZyOS2212UruMwPFUYghBLwNCNQ3kayWor0ESU-RjViee2R_HUlx-HZEm5AdhSkP9UNGrtHGNx6pIPPS8FAbylPYCG87-_D2pzJk3ShdWuY2lca00ifrv2Mi5kYIVlrouJ5E2g7CtcUN5ZLTLhFdzTrqR37E8RA1BLY0wAJEuIrPlPaKFPmdmuFWmBRscGoApNkp3Z_vHnV5B9NN63piguvFdspYiOWzjOyo1KVs4xwT',
      employees: 22,
      status: 'Active',
    },
  ];

  // ── Search / filter signals ───────────────────────────────────────────────
  searchQuery = signal('');
  statusFilter = signal<'All' | DeptStatus>('All');
  sortBy = signal<'Name' | 'Employees'>('Name');

  filteredDepartments = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const s = this.statusFilter();
    const sort = this.sortBy();

    return [...this.allDepartments]
      .filter(d => {
        const matchesQuery =
          d.name.toLowerCase().includes(q) ||
          (d.head?.toLowerCase().includes(q) ?? false);
        const matchesStatus = s === 'All' || d.status === s;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) =>
        sort === 'Name'
          ? a.name.localeCompare(b.name)
          : b.employees - a.employees
      );
  });

  // ── Pagination ────────────────────────────────────────────────────────────
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

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p);
  }

  // ── Stats cards ──────────────────────────────────────────────────────────
  statCards: StatCard[] = [
    {
      label: 'Total Departments',
      icon: 'corporate_fare',
      value: '12',
      sub: '+2 since last quarter',
      subIcon: 'trending_up',
      subColor: 'text-emerald-600',
    },
    {
      label: 'Active Employees',
      icon: 'groups',
      value: '223',
      sub: 'Across all 12 units',
      subColor: 'text-slate-500',
    },
    {
      label: 'Budget Utilization',
      icon: 'pie_chart',
      value: '84%',
      sub: '',
      progress: 84,
    },
  ];

  // ── Helpers ──────────────────────────────────────────────────────────────
  setSearch(val: string): void { this.searchQuery.set(val); this.currentPage.set(1); }
  setStatus(val: 'All' | DeptStatus): void { this.statusFilter.set(val); this.currentPage.set(1); }
  setSort(val: 'Name' | 'Employees'): void { this.sortBy.set(val); }

  minVal(a: number, b: number): number { return Math.min(a, b); }

  iconClasses(dept: Department): string {
    return `${dept.iconBg} ${dept.iconColor}`;
  }

  statusClass(status: DeptStatus): string {
    return status === 'Active'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-slate-100 text-slate-600';
  }

}
