import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
export interface Role {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  tooltip: string;
}

export interface RoleCategory {
  name: string;
  icon: string; // Material symbol name
  roles: Role[];
}

export interface UserProfile {
  name: string;
  email: string;
  employeeId: string;
  department: string;
  avatarUrl: string;
  status: 'Active' | 'Inactive';
}
@Component({
  selector: 'app-assign-roles-to-user',
  imports: [CommonModule,FormsModule],
  templateUrl: './assign-roles-to-user.component.html',
  styleUrl: './assign-roles-to-user.component.scss',
})
export class AssignRolesToUserComponent {
searchQuery: string = '';
  
  // Selected User Mock Data
  selectedUser: UserProfile = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    employeeId: 'EMP-2023-849',
    department: 'Logistics & Supply Chain',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'Active'
  };

  // Roles Data Structure
  roleCategories: RoleCategory[] = [
    {
      name: 'Administration',
      icon: 'admin_panel_settings',
      roles: [
        {
          id: 'super_admin',
          name: 'Super Admin',
          description: 'Full system access including user management and security logs.',
          isActive: false,
          tooltip: 'Full access to all system modules and settings.'
        },
        {
          id: 'user_manager',
          name: 'User Manager',
          description: 'Can create and edit user profiles and assign non-admin roles.',
          isActive: false,
          tooltip: 'Can add, edit, and delete users but cannot change system settings.'
        }
      ]
    },
    {
      name: 'Operations',
      icon: 'inventory_2',
      roles: [
        {
          id: 'inventory_mgr',
          name: 'Inventory Manager',
          description: 'Manage stock levels, suppliers, and purchase orders.',
          isActive: true,
          tooltip: 'Access to stock levels, purchase orders, and supplier management.'
        },
        {
          id: 'order_fulfillment',
          name: 'Order Fulfillment',
          description: 'Process customer orders and manage shipping manifests.',
          isActive: false,
          tooltip: 'Can view and update order status.'
        }
      ]
    },
    {
      name: 'Finance',
      icon: 'payments',
      roles: [
        {
          id: 'finance_viewer',
          name: 'Finance Viewer',
          description: 'Read-only access to invoices, payments, and financial reports.',
          isActive: true,
          tooltip: 'Read-only access to financial reports.'
        }
      ]
    }
  ];

  // Helper to count active roles
  get activeRoleCount(): number {
    return this.roleCategories.flatMap(c => c.roles).filter(r => r.isActive).length;
  }

  toggleRole(role: Role): void {
    role.isActive = !role.isActive;
  }

  saveAssignments(): void {
    console.log('Saving roles for:', this.selectedUser.name);
    console.log('Active Roles:', this.roleCategories.flatMap(c => c.roles).filter(r => r.isActive));
  }
}
