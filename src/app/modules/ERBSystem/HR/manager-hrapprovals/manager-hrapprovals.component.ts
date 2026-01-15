import { Component } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { SidbarManagerHarapprovalsComponent } from '../../../../shared/UI/sidbar-manager-harapprovals/sidbar-manager-harapprovals.component';

export interface User {
  name: string;
  role: string;
  avatarUrl: string;
}

export interface ApprovalRequest {
  id: number;
  requester: User;
  type: 'Leave Request' | 'Expense Report' | 'New Hire';
  title: string;
  summary: string;
  details: {
    primary: string; // e.g., amount or date range
    secondary?: string; // e.g., duration
  };
  date: Date;
  isUrgent: boolean;
}
@Component({
  selector: 'app-manager-hrapprovals',
  imports: [CommonModule, DatePipe, CurrencyPipe,SidbarManagerHarapprovalsComponent],
  templateUrl: './manager-hrapprovals.component.html',
  styleUrl: './manager-hrapprovals.component.scss',
})
export class ManagerHRApprovalsComponent {
  requests: ApprovalRequest[] = [
    {
      id: 1,
      requester: { name: 'Sarah Jenkins', role: 'UX Designer', avatarUrl: 'https://i.pravatar.cc/150?u=sarah' },
      type: 'Leave Request',
      title: 'Annual Leave - Family Trip',
      summary: 'Requesting 8 days off in October.',
      details: { primary: 'Oct 12 - Oct 20', secondary: '8 Days' },
      date: new Date('2023-10-10T09:42:00'),
      isUrgent: false
    },
    {
      id: 2,
      requester: { name: 'Mike Ross', role: 'Sales Lead', avatarUrl: 'https://i.pravatar.cc/150?u=mike' },
      type: 'Expense Report',
      title: 'Client Lunch - Q3 Review',
      summary: 'Lunch with Acme Corp stakeholders.',
      details: { primary: '145.50' }, // Handled via logic in template
      date: new Date('2023-10-09T14:15:00'),
      isUrgent: true
    },
    {
      id: 3,
      requester: { name: 'Devin Miller', role: 'Engineering Manager', avatarUrl: 'https://i.pravatar.cc/150?u=devin' },
      type: 'New Hire',
      title: 'Frontend Dev Offer',
      summary: 'Candidate: John Doe, Senior FE.',
      details: { primary: 'Contract Review' },
      date: new Date('2023-10-08T11:30:00'),
      isUrgent: false
    },
    {
      id: 4,
      requester: { name: 'Emily Chen', role: 'Marketing Specialist', avatarUrl: 'https://i.pravatar.cc/150?u=emily' },
      type: 'Leave Request',
      title: 'Sick Leave',
      summary: "Doctor's note attached.",
      details: { primary: 'Oct 08', secondary: '1 Day' },
      date: new Date('2023-10-08T08:15:00'),
      isUrgent: false
    },
    {
      id: 5,
      requester: { name: 'Marcus Johnson', role: 'IT Administrator', avatarUrl: 'https://i.pravatar.cc/150?u=marcus' },
      type: 'Expense Report',
      title: 'Software License Renewal',
      summary: 'Adobe Creative Cloud Team License.',
      details: { primary: '299.00' },
      date: new Date('2023-10-07T16:45:00'),
      isUrgent: true
    }
  ];

  getTypeStyles(type: string): string {
    switch (type) {
      case 'Leave Request':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-100 dark:border-blue-900/30';
      case 'Expense Report':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border-purple-100 dark:border-purple-900/30';
      case 'New Hire':
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-100 dark:border-green-900/30';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getTypeDotColor(type: string): string {
    switch (type) {
      case 'Leave Request': return 'bg-blue-500';
      case 'Expense Report': return 'bg-purple-500';
      case 'New Hire': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }
}
