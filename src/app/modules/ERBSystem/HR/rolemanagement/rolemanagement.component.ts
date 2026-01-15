import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
interface RoleUser {
  avatarUrl: string;
  name?: string;
}

interface Role {
  id: number;
  name: string;
  department: string;
  description: string;
  icon: string;
  // classes for the icon circle background and text color
  iconBgClass: string;
  iconTextClass: string;
  users: RoleUser[];
  extraUserCount: number;
  status: 'Active' | 'Inactive' | 'Archived';
  lastUpdated: Date;
}

@Component({
  selector: 'app-rolemanagement',
  imports: [CommonModule],
  templateUrl: './rolemanagement.component.html',
  styleUrl: './rolemanagement.component.scss',
})
export class RolemanagementComponent {
  // Logic to toggle sidebar on mobile could go here
  isSidebarOpen = false;

  // Mock Data
  roles: Role[] = [
    {
      id: 1,
      name: 'Super Admin',
      department: 'System Wide',
      description:
        'Full access to all modules, settings, and user management features.',
      icon: 'admin_panel_settings',
      iconBgClass: 'bg-blue-100 dark:bg-blue-900/30',
      iconTextClass: 'text-primary',
      users: [
        { avatarUrl: 'https://i.pravatar.cc/150?img=1' },
        { avatarUrl: 'https://i.pravatar.cc/150?img=2' },
      ],
      extraUserCount: 2,
      status: 'Active',
      lastUpdated: new Date('2023-10-24'),
    },
    {
      id: 2,
      name: 'Inventory Manager',
      department: 'Logistics',
      description:
        'Manage stock levels, suppliers, and purchase orders. Read-only for sales.',
      icon: 'inventory',
      iconBgClass: 'bg-purple-100 dark:bg-purple-900/30',
      iconTextClass: 'text-purple-600 dark:text-purple-400',
      users: [
        { avatarUrl: 'https://i.pravatar.cc/150?img=3' },
        { avatarUrl: 'https://i.pravatar.cc/150?img=4' },
        { avatarUrl: 'https://i.pravatar.cc/150?img=5' },
      ],
      extraUserCount: 8,
      status: 'Active',
      lastUpdated: new Date('2023-10-20'),
    },
    {
      id: 3,
      name: 'Support Agent',
      department: 'Customer Success',
      description:
        'Access to CRM, Order Status, and Ticketing system. No access to Settings.',
      icon: 'support_agent',
      iconBgClass: 'bg-orange-100 dark:bg-orange-900/30',
      iconTextClass: 'text-orange-600 dark:text-orange-400',
      users: [{ avatarUrl: 'https://i.pravatar.cc/150?img=8' }],
      extraUserCount: 12,
      status: 'Active',
      lastUpdated: new Date('2023-09-15'),
    },
    {
      id: 4,
      name: 'Finance Junior',
      department: 'Finance',
      description:
        'Basic access to invoices and billing reports. Approval required for refunds.',
      icon: 'attach_money',
      iconBgClass: 'bg-slate-100 dark:bg-slate-700',
      iconTextClass: 'text-slate-500 dark:text-slate-400',
      users: [],
      extraUserCount: 0,
      status: 'Inactive',
      lastUpdated: new Date('2023-08-10'),
    },
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Inactive':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case 'Archived':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }
}
