import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApplicationContract, ApplicationsService } from '../../../../../core/services/Applications/applications.service';
import { EmployeeService } from '../../../../../core/services/employee/employee.service';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";

@Component({
  selector: 'app-contract-details',
  imports: [CommonModule, HrSidebarComponent],
  templateUrl: './contract-details.component.html',
  styleUrl: './contract-details.component.scss',
})
export class ContractDetailsComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _appService = inject(ApplicationsService);

  contractData: ApplicationContract | null = null;
  isLoading = true;

  // باقي الـ static data زي ما هي
  contract = { id: '', status: '', type: '', issuedOn: '' };
  employee = {
    name: 'Johnathan Doe',
    role: 'Senior Software Engineer',
    id: 'EMP-5502',
    email: 'j.doe@company.com',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGZODQULQeV55PKMYi8l6Bb8w9Dxua8kolwsrLUwjt_wqb4PzteyIWoh2gj8n-YFbB1q8V8rArt6XhjiOT6XaF-mpqvjUsKvzw6aUNWJLm9oM5R-OPCOcYpqBrPjaIX7xwFgnFVVKC9hbLCoGB7RhNKrJRHotgnr_KntmnupS3BdmU_dC96ylScpELLjoqf7YJiBljAUA5OED0rxI4BdGRxAV9_-4EPzFADgPTRP0kDso1WxWu5eOEJ5cv-3tHk9126eQB0OSIU-F5',
  };

  contractTerms = {
    type: '',
    department: 'Engineering',
    startDate: '',
    endDate: null as string | null,
    annualSalary: '',
    currency: '',
    payrollCycle: 'Bi-weekly',
    probationStatus: 'Completed',
  };

  // باقي الـ milestones و documents زي ما هم
  milestones = [
    { date: 'Jan 15, 2024', title: 'Contract Signed', description: 'Digitally signed', status: 'completed' as const },
    { date: 'Apr 15, 2024', title: 'Probation Passed', description: 'Confirmed by manager', status: 'completed' as const },
    { date: 'Oct 12, 2024', title: 'Salary Adjustment', description: '+5.5% Annual increase', status: 'current' as const },
    { date: 'Jan 15, 2025', title: '1st Year Anniversary', description: 'Upcoming milestone', status: 'upcoming' as const },
  ];

  documents = [
    { name: 'Main_Contract_Signed.pdf', size: '2.4 MB', date: 'Jan 15, 2024', type: 'pdf' as const, colorClass: 'bg-red-100', iconColorClass: 'text-red-600' },
    { name: 'Performance_Review_Q3.pdf', size: '1.1 MB', date: 'Sep 30, 2024', type: 'article' as const, colorClass: 'bg-blue-100', iconColorClass: 'text-blue-600' },
    { name: 'Salary_Amendment_v1.pdf', size: '0.8 MB', date: 'Oct 12, 2024', type: 'verified' as const, colorClass: 'bg-emerald-100', iconColorClass: 'text-emerald-600' },
  ];

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this._appService.getContractById(id).subscribe({
        next: (data) => {
          this.contractData = data;
          this._employeeService.getEmployees().subscribe({
            next: (emps) => {
              const emp = emps.find(e => e.id === data.employeeId);
              this.employeeName = emp ? emp.name : 'Unknown';
            }
          });

          this.isLoading = false;
          this.contract = {
            id: data.id,
            status: this.getStatusLabel(data.status),
            type: this.getContractTypeLabel(data.typee),
            issuedOn: data.startDate,
          };
          this.contractTerms = {
            ...this.contractTerms,
            type: this.getContractTypeLabel(data.typee),
            startDate: data.startDate,
            endDate: data.endDate || null,
            annualSalary: data.salaryAmount.toLocaleString(),
            currency: data.salaryCurrency,
          };
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading contract:', err);
          this.isLoading = false;
        },
      });
    }
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      Active: 'Active',
      Pending: 'Pending',
      Expired: 'Expired',
      PartTime: 'Part Time',
    };

    return map[status] ?? 'Unknown';
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

  getMilestoneTitleClass(status: string): string {
    return status === 'upcoming' ? 'font-bold text-slate-400' : 'font-bold text-slate-900';
  }

  getMilestoneDateClass(status: string): string {
    return status === 'current'
      ? 'text-xs font-bold text-[#2563EB] uppercase tracking-tighter mb-0.5'
      : 'text-xs font-bold text-slate-400 uppercase tracking-tighter mb-0.5';
  }

  private readonly _employeeService = inject(EmployeeService);

  employeeName = '';
}