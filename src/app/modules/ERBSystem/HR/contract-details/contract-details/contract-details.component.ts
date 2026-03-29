import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ContractMilestone {
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface ContractDocument {
  name: string;
  size: string;
  date: string;
  type: 'pdf' | 'article' | 'verified';
  colorClass: string;
  iconColorClass: string;
}

@Component({
  selector: 'app-contract-details',
  imports: [CommonModule],
  templateUrl: './contract-details.component.html',
  styleUrl: './contract-details.component.scss',
})
export class ContractDetailsComponent {

  contract = {
    id: 'CON-88291',
    status: 'Active',
    type: 'Full-time Permanent',
    issuedOn: 'Oct 12, 2023',
  };

  employee = {
    name: 'Johnathan Doe',
    role: 'Senior Software Engineer',
    id: 'EMP-5502',
    email: 'j.doe@company.com',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDGZODQULQeV55PKMYi8l6Bb8w9Dxua8kolwsrLUwjt_wqb4PzteyIWoh2gj8n-YFbB1q8V8rArt6XhjiOT6XaF-mpqvjUsKvzw6aUNWJLm9oM5R-OPCOcYpqBrPjaIX7xwFgnFVVKC9hbLCoGB7RhNKrJRHotgnr_KntmnupS3BdmU_dC96ylScpELLjoqf7YJiBljAUA5OED0rxI4BdGRxAV9_-4EPzFADgPTRP0kDso1WxWu5eOEJ5cv-3tHk9126eQB0OSIU-F5',
  };

  contractTerms = {
    type: 'Full-time Permanent',
    department: 'Engineering',
    startDate: 'Jan 15, 2024',
    endDate: null,
    annualSalary: '$145,000.00',
    currency: 'USD',
    payrollCycle: 'Bi-weekly',
    probationStatus: 'Completed',
  };

  milestones: ContractMilestone[] = [
    {
      date: 'Jan 15, 2024',
      title: 'Contract Signed',
      description: 'Digitally signed by Johnathan Doe',
      status: 'completed',
    },
    {
      date: 'Apr 15, 2024',
      title: 'Probation Passed',
      description: 'Confirmed by Sarah Jenkins (Eng. Manager)',
      status: 'completed',
    },
    {
      date: 'Oct 12, 2024',
      title: 'Salary Adjustment',
      description: '+5.5% Annual performance review increase',
      status: 'current',
    },
    {
      date: 'Jan 15, 2025',
      title: '1st Year Anniversary',
      description: 'Upcoming milestone',
      status: 'upcoming',
    },
  ];

  documents: ContractDocument[] = [
    {
      name: 'Main_Contract_Signed.pdf',
      size: '2.4 MB',
      date: 'Jan 15, 2024',
      type: 'pdf',
      colorClass: 'bg-red-100',
      iconColorClass: 'text-red-600',
    },
    {
      name: 'Performance_Review_Q3.pdf',
      size: '1.1 MB',
      date: 'Sep 30, 2024',
      type: 'article',
      colorClass: 'bg-blue-100',
      iconColorClass: 'text-blue-600',
    },
    {
      name: 'Salary_Amendment_v1.pdf',
      size: '0.8 MB',
      date: 'Oct 12, 2024',
      type: 'verified',
      colorClass: 'bg-emerald-100',
      iconColorClass: 'text-emerald-600',
    },
  ];

  getMilestoneIconClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500';
      case 'current':
        return 'bg-primary shadow-lg shadow-primary/40';
      default:
        return 'bg-slate-200 dark:bg-slate-800';
    }
  }

  getMilestoneTitleClass(status: string): string {
    return status === 'upcoming'
      ? 'font-bold text-slate-400'
      : 'font-bold text-slate-900 dark:text-slate-100';
  }

  getMilestoneDateClass(status: string): string {
    return status === 'current'
      ? 'text-xs font-bold text-primary uppercase tracking-tighter mb-0.5'
      : 'text-xs font-bold text-slate-400 uppercase tracking-tighter mb-0.5';
  }

}
