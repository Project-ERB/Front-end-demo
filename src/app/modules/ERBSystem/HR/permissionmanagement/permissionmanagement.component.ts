import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
interface Permission {
  id: number;
  name: string;
  slug: string;
  module: string;
  assignedRoles: string[];
  status: 'Active' | 'Review Needed' | 'Deprecated';
  restricted?: boolean;
}
@Component({
  selector: 'app-permissionmanagement',
  imports: [CommonModule],
  templateUrl: './permissionmanagement.component.html',
  styleUrl: './permissionmanagement.component.scss',
})
export class PermissionmanagementComponent {
  // Mock Data mimicking the HTML
  permissions: Permission[] = [
    {
      id: 1,
      name: 'View Inventory',
      slug: 'inventory.read',
      module: 'Inventory',
      assignedRoles: ['Super Admin', 'Manager'],
      status: 'Active',
    },
    {
      id: 2,
      name: 'Modify Stock Levels',
      slug: 'inventory.write',
      module: 'Inventory',
      assignedRoles: ['Super Admin'],
      status: 'Active',
    },
    {
      id: 3,
      name: 'Delete User Accounts',
      slug: 'users.delete',
      module: 'User Management',
      assignedRoles: [],
      status: 'Review Needed',
      restricted: true,
    },
    {
      id: 4,
      name: 'Approve Expenses',
      slug: 'finance.approve',
      module: 'Finance',
      assignedRoles: ['Super Admin', 'Accountant'],
      status: 'Deprecated',
    },
    {
      id: 5,
      name: 'API Access',
      slug: 'system.api_read',
      module: 'System',
      assignedRoles: ['Developer'],
      status: 'Active',
    },
  ];

  // Helper to determine status badge colors
  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'Review Needed':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'Deprecated':
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  }

  // Helper for status dot color
  getStatusDotClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'Review Needed':
        return 'bg-yellow-500';
      case 'Deprecated':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  }

  // Helper for Module Indication Color
  getModuleDotClass(moduleName: string): string {
    switch (moduleName) {
      case 'Inventory':
        return 'bg-blue-500';
      case 'User Management':
        return 'bg-purple-500';
      case 'Finance':
        return 'bg-teal-500';
      case 'System':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  }
}
