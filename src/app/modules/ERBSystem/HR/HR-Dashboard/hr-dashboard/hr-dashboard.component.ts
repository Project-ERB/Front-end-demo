import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";

export interface KpiCard {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  badge: string;
  badgeColor: string;
}

export interface Activity {
  dotColor: string;
  title: string;
  description: string;
  time: string;
}

export interface Department {
  name: string;
  headcount: number;
  budgetPercent: number;
  status: 'Optimal' | 'At Limit' | 'Under';
}

export interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
}

@Component({
  selector: 'app-hr-dashboard',
  imports: [FormsModule, CommonModule, HrSidebarComponent],
  templateUrl: './hr-dashboard.component.html',
  styleUrl: './hr-dashboard.component.scss',
})
export class HrDashboardComponent {
  selectedRange = 'Last 6 Months';
  rangeOptions = ['Last 6 Months', 'Last Year'];

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', active: true },
    { icon: 'group', label: 'Employees' },
    { icon: 'account_tree', label: 'Departments' },
    { icon: 'payments', label: 'Payroll' },
    { icon: 'description', label: 'Reports' },
  ];

  kpiCards: KpiCard[] = [
    {
      icon: 'group',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      label: 'Total Employees',
      value: '1,248',
      badge: '+2.5%',
      badgeColor: 'text-emerald-500',
    },
    {
      icon: 'work',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      label: 'Open Positions',
      value: '42',
      badge: '-5%',
      badgeColor: 'text-orange-500',
    },
    {
      icon: 'hub',
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      label: 'Active Departments',
      value: '12',
      badge: 'Stable',
      badgeColor: 'text-slate-400',
    },
    {
      icon: 'pending_actions',
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      label: 'Pending Approvals',
      value: '8',
      badge: '+12%',
      badgeColor: 'text-emerald-500',
    },
  ];

  activities: Activity[] = [
    {
      dotColor: 'bg-primary',
      title: 'New Employee Onboarding',
      description: 'Jordan Smith joined Engineering team.',
      time: '2 hours ago',
    },
    {
      dotColor: 'bg-blue-500',
      title: 'Job Posting Published',
      description: 'Senior Product Designer (Remote)',
      time: '5 hours ago',
    },
    {
      dotColor: 'bg-emerald-500',
      title: 'Leave Request Approved',
      description: 'Sarah Connor (Medical Leave)',
      time: 'Yesterday',
    },
    {
      dotColor: 'bg-amber-500',
      title: 'Review Pending',
      description: 'Q3 Performance Review for Marketing.',
      time: '2 days ago',
    },
  ];

  departments: Department[] = [
    { name: 'Engineering', headcount: 452, budgetPercent: 85, status: 'Optimal' },
    { name: 'Product', headcount: 124, budgetPercent: 60, status: 'Optimal' },
    { name: 'Marketing', headcount: 88, budgetPercent: 95, status: 'At Limit' },
  ];

  getStatusClasses(status: Department['status']): string {
    switch (status) {
      case 'Optimal':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
      case 'At Limit':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
      case 'Under':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    }
  }

}
