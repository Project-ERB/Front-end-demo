import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Super Admin' | 'Sales Manager' | 'Admin' | 'Viewer' | 'Inventory Clerk' | 'Contractor';
  department: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastActive: string;
  avatarUrl: string; // URL for the image
  isAvatarImage: boolean; // To toggle between image and initials
  initials?: string;
}

export interface StatCard {
  label: string;
  value: string;
  icon: string;
  trend: string;
  trendIcon: string;
  trendDirection: 'up' | 'down';
  iconColorClass: string;
  iconBgClass: string;
  trendColorClass: string;
  trendBgClass: string;
}
@Component({
  selector: 'app-usermanagemant',
  imports: [CommonModule],
  templateUrl: './usermanagemant.component.html',
  styleUrl: './usermanagemant.component.scss',
})
export class UsermanagemantComponent {
// Sidebar Navigation Data
  navItems = [
    { label: 'Dashboard', icon: 'dashboard', active: false },
    { label: 'Inventory', icon: 'inventory_2', active: false },
    { label: 'Sales', icon: 'trending_up', active: false },
    { label: 'Users', icon: 'group', active: true }, // Active State
    { label: 'Settings', icon: 'settings', active: false },
  ];

  // Stats Data
  stats: StatCard[] = [
    {
      label: 'Total Users',
      value: '2,453',
      icon: 'group',
      trend: '12%',
      trendIcon: 'trending_up',
      trendDirection: 'up',
      iconColorClass: 'text-primary',
      iconBgClass: 'bg-primary/10',
      trendColorClass: 'text-[#07883b]',
      trendBgClass: 'bg-green-50 dark:bg-green-900/30'
    },
    {
      label: 'Active Users',
      value: '2,100',
      icon: 'verified_user',
      trend: '5%',
      trendIcon: 'trending_up',
      trendDirection: 'up',
      iconColorClass: 'text-primary',
      iconBgClass: 'bg-primary/10',
      trendColorClass: 'text-[#07883b]',
      trendBgClass: 'bg-green-50 dark:bg-green-900/30'
    },
    {
      label: 'Pending Invites',
      value: '54',
      icon: 'mail',
      trend: '2%',
      trendIcon: 'trending_down',
      trendDirection: 'down',
      iconColorClass: 'text-orange-500',
      iconBgClass: 'bg-orange-100 dark:bg-orange-900/30',
      trendColorClass: 'text-[#e73908]',
      trendBgClass: 'bg-red-50 dark:bg-red-900/30'
    }
  ];

  // User Data
  users: User[] = [
    {
      id: 1,
      name: 'Alice Smith',
      email: 'alice.smith@example.com',
      role: 'Sales Manager',
      department: 'Sales',
      status: 'Active',
      lastActive: 'Just now',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      isAvatarImage: true
    },
    {
      id: 2,
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      role: 'Admin',
      department: 'IT',
      status: 'Active',
      lastActive: '2 hours ago',
      avatarUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      isAvatarImage: true
    },
    {
      id: 3,
      name: 'Courtney Wilson',
      email: 'c.wilson@example.com',
      role: 'Viewer',
      department: 'Inventory',
      status: 'Inactive',
      lastActive: '5 days ago',
      avatarUrl: '',
      isAvatarImage: false,
      initials: 'CW'
    },
    {
      id: 4,
      name: 'Lindsay Walton',
      email: 'lindsay.w@example.com',
      role: 'Inventory Clerk',
      department: 'Warehouse',
      status: 'Active',
      lastActive: '1 day ago',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      isAvatarImage: true
    },
    {
      id: 5,
      name: 'Tom Cook',
      email: 'tom.cook@example.com',
      role: 'Contractor',
      department: 'Maintenance',
      status: 'Suspended',
      lastActive: '2 months ago',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      isAvatarImage: true
    }
  ];

  // Helper for Status Badge Styling
  getStatusClasses(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'Suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Helper for Role Badge Styling
  getRoleClasses(role: string): string {
    switch (role) {
      case 'Sales Manager':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      case 'Admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'Viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'Inventory Clerk':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300';
      case 'Contractor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
