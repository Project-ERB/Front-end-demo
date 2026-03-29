import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type ContractStatus = 'Active' | 'Pending' | 'Expired';

export interface Contract {
  id: number;
  initials: string;
  avatarClass: string;
  employeeName: string;
  jobTitle: string;
  contractType: string;
  startDate: string;
  endDate: string;
  salary: string;
  status: ContractStatus;
}

@Component({
  selector: 'app-contract-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './contract-management.component.html',
  styleUrl: './contract-management.component.scss',
})
export class ContractManagementComponent {

  searchQuery = '';
  activeFilter: ContractStatus | 'All' = 'All';

  statusFilters: (ContractStatus | 'All')[] = ['All', 'Active', 'Pending', 'Expired'];

  navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'description', label: 'Contracts', active: true },
    { icon: 'group', label: 'Employees', active: false },
    { icon: 'payments', label: 'Payroll', active: false },
    { icon: 'analytics', label: 'Reports', active: false },
  ];

  allContracts: Contract[] = [
    {
      id: 1,
      initials: 'JM',
      avatarClass: 'bg-blue-100 text-blue-700',
      employeeName: 'Jonathan Meyer',
      jobTitle: 'Senior Product Designer',
      contractType: 'Full-Time Permanent',
      startDate: 'Jan 12, 2023',
      endDate: '—',
      salary: '$115,000',
      status: 'Active',
    },
    {
      id: 2,
      initials: 'SC',
      avatarClass: 'bg-amber-100 text-amber-700',
      employeeName: 'Sarah Chen',
      jobTitle: 'Software Engineer',
      contractType: 'Fixed Term',
      startDate: 'Jun 05, 2023',
      endDate: 'Jun 05, 2024',
      salary: '$98,000',
      status: 'Pending',
    },
    {
      id: 3,
      initials: 'MT',
      avatarClass: 'bg-slate-100 text-slate-700',
      employeeName: 'Marcus Thorne',
      jobTitle: 'Sales Lead',
      contractType: 'Independent Contractor',
      startDate: 'Mar 20, 2022',
      endDate: 'Mar 20, 2023',
      salary: '$85,000',
      status: 'Expired',
    },
    {
      id: 4,
      initials: 'ER',
      avatarClass: 'bg-blue-100 text-blue-700',
      employeeName: 'Elena Rodriguez',
      jobTitle: 'HR Specialist',
      contractType: 'Full-Time Permanent',
      startDate: 'Nov 15, 2023',
      endDate: '—',
      salary: '$72,000',
      status: 'Active',
    },
  ];

  get filteredContracts(): Contract[] {
    return this.allContracts.filter((c) => {
      const matchesStatus = this.activeFilter === 'All' || c.status === this.activeFilter;
      const q = this.searchQuery.toLowerCase();
      const matchesSearch =
        !q || c.employeeName.toLowerCase().includes(q) || c.contractType.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }

  setFilter(f: ContractStatus | 'All'): void {
    this.activeFilter = f;
  }

  getStatusClasses(status: ContractStatus): string {
    const map: Record<ContractStatus, string> = {
      Active: 'bg-emerald-100 text-emerald-700',
      Pending: 'bg-amber-100 text-amber-700',
      Expired: 'bg-slate-200 text-slate-600',
    };
    return map[status];
  }

  getDotClasses(status: ContractStatus): string {
    const map: Record<ContractStatus, string> = {
      Active: 'bg-emerald-500',
      Pending: 'bg-amber-500',
      Expired: 'bg-slate-400',
    };
    return map[status];
  }

  exportCSV(): void {
    const headers = ['Employee', 'Title', 'Type', 'Start', 'End', 'Salary', 'Status'];
    const rows = this.allContracts.map((c) => [
      c.employeeName, c.jobTitle, c.contractType, c.startDate, c.endDate, c.salary, c.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contracts.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

}
