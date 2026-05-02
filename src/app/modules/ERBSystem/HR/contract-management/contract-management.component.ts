import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HrSidebarComponent } from '../../../../shared/UI/hr-sidebar/hr-sidebar.component';
import { ApplicationContract, ApplicationsService } from '../../../../core/services/Applications/applications.service';
import { EmployeeService } from '../../../../core/services/employee/employee.service';

@Component({
  selector: 'app-contract-management',
  imports: [CommonModule, FormsModule, HrSidebarComponent, RouterLink],
  templateUrl: './contract-management.component.html',
  styleUrl: './contract-management.component.scss',
})
export class ContractManagementComponent implements OnInit {
  private readonly _appService = inject(ApplicationsService);

  searchQuery = '';
  activeFilter: string | 'All' = 'All';

  statusFilters = [
    { label: 'All', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Expired', value: 'Expired' },
    { label: 'Part Time', value: 'PartTime' },
  ];

  allContracts: ApplicationContract[] = [];

  ngOnInit(): void {
    this.loadContracts();
    this.loadEmployees();
  }

  loadContracts(): void {
    this._appService.getContracts().subscribe({
      next: (data) => (this.allContracts = data),
      error: (err) => console.error('Error loading contracts:', err),
    });
  }

  get filteredContracts(): ApplicationContract[] {
    return this.allContracts.filter((c) => {
      const matchesStatus = this.activeFilter === 'All' || c.status === this.activeFilter;
      const q = this.searchQuery.toLowerCase();
      const matchesSearch = !q || c.employeeId.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }

  setFilter(value: string | 'All'): void {
    this.activeFilter = value;
  }

  getContractTypeLabel(type: string): string {
    const map: Record<string, string> = {
      FullTime: 'Full-time Permanent',
      PartTime: 'Part-time',
      FixedTerm: 'Fixed-term Contract',
      Internship: 'Internship',
    };
    return map[type] ?? 'Unknown';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      Active: 'Active',
      Pending: 'Pending',
      Expired: 'Expired',
      PartTime: 'Part Time', // أو حسب الدومين عندك
    };

    return map[status] ?? 'Unknown';
  }

  getStatusClasses(status: string): string {
    const map: Record<string, string> = {
      Active: 'bg-emerald-100 text-emerald-700',
      Pending: 'bg-amber-100 text-amber-700',
      Expired: 'bg-slate-200 text-slate-600',
      PartTime: 'bg-blue-100 text-blue-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-500';
  }

  getDotClasses(status: string): string {
    const map: Record<string, string> = {
      Active: 'bg-emerald-500',
      Pending: 'bg-amber-500',
      Expired: 'bg-slate-400',
      PartTime: 'bg-blue-500',
    };
    return map[status] ?? 'bg-gray-400';
  }

  deleteContract(id: string): void {
    if (!confirm('Are you sure you want to delete this contract?')) return;

    this._appService.deleteContract(id).subscribe({
      next: () => {
        this.allContracts = this.allContracts.filter(c => c.id !== id);
      },
      error: (err) => console.error('Error deleting contract:', err),
    });
  }

  private readonly _employeeService = inject(EmployeeService);

  employees: any[] = [];

  loadEmployees(): void {
    this._employeeService.getEmployees().subscribe({
      next: (res) => this.employees = res,
      error: (err) => console.error(err)
    });
  }

  getEmployeeName(id: string): string {
    const emp = this.employees.find(e => e.id === id);
    return emp ? emp.name : 'Loading...';
  }
}