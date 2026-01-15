import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
export interface Permission {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
}

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  // Classes for styling the icon container (e.g., bg-blue-100 text-primary)
  styleClass: string; 
  permissions: Permission[];
}

export interface Role {
  id: string;
  name: string;
  userCount: number;
}
@Component({
  selector: 'app-manage-role-permissions',
  imports: [CommonModule,FormsModule],
  templateUrl: './manage-role-permissions.component.html',
  styleUrl: './manage-role-permissions.component.scss',
})
export class ManageRolePermissionsComponent {
searchQuery: string = '';
  selectedRoleId: string = 'sales_manager';
  hasUnsavedChanges: boolean = true;

  // Mock Roles for the dropdown
  roles: Role[] = [
    { id: 'super_admin', name: 'Super Administrator', userCount: 2 },
    { id: 'sales_manager', name: 'Sales Manager', userCount: 14 },
    { id: 'inventory_manager', name: 'Inventory Manager', userCount: 5 },
    { id: 'support_lead', name: 'Support Lead', userCount: 8 },
  ];

  // Data Groups
  permissionGroups: PermissionGroup[] = [
    {
      id: 'inventory',
      name: 'Inventory Management',
      description: 'Stock levels, warehouses, suppliers',
      icon: 'inventory_2',
      styleClass: 'bg-blue-100 dark:bg-blue-900/30 text-primary',
      permissions: [
        { id: 'inv_view', name: 'View Stock Levels', description: 'Allows viewing of current quantity across all locations.', isEnabled: true },
        { id: 'inv_adjust', name: 'Adjust Inventory', description: 'Manual adjustments for damaged or lost goods.', isEnabled: true },
        { id: 'inv_suppliers', name: 'Manage Suppliers', description: 'Create, edit, or delete supplier profiles.', isEnabled: false }
      ]
    },
    {
      id: 'orders',
      name: 'Order Management',
      description: 'Processing, refunds, shipping',
      icon: 'shopping_cart',
      styleClass: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      permissions: [
        { id: 'ord_process', name: 'Process Orders', description: "Move orders from 'Pending' to 'Shipped'.", isEnabled: true },
        { id: 'ord_refund', name: 'Approve Refunds', description: 'Authorize monetary returns to customers.', isEnabled: true },
        { id: 'ord_cust', name: 'Edit Customer Data', description: 'Modify shipping address and contact info.', isEnabled: true }
      ]
    },
    {
      id: 'admin',
      name: 'User Administration',
      description: 'Team members, roles, access',
      icon: 'admin_panel_settings',
      styleClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      permissions: [
        { id: 'adm_invite', name: 'Invite New Users', description: 'Send invitations to join the ERP.', isEnabled: false },
        { id: 'adm_roles', name: 'Modify Role Assignments', description: 'Promote or demote users.', isEnabled: false }
      ]
    },
    {
      id: 'finance',
      name: 'Financial Reports',
      description: 'Revenue, taxes, forecasting',
      icon: 'attach_money',
      styleClass: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      permissions: [
        { id: 'fin_view', name: 'View Revenue Dashboard', description: 'Access to sensitive financial charts.', isEnabled: false },
        { id: 'fin_tax', name: 'Export Tax Reports', description: 'Download CSV/PDF tax documents.', isEnabled: false }
      ]
    }
  ];

  // Logic to handle searching/filtering permissions
  get filteredGroups(): PermissionGroup[] {
    if (!this.searchQuery) return this.permissionGroups;
    
    const query = this.searchQuery.toLowerCase();
    
    // Return groups where the group name OR any permission matches the query
    return this.permissionGroups.map(group => {
      // Check if group matches
      const groupMatches = group.name.toLowerCase().includes(query) || group.description.toLowerCase().includes(query);
      
      if (groupMatches) return group;

      // Filter permissions inside
      const matchingPermissions = group.permissions.filter(p => 
        p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );

      return matchingPermissions.length > 0 ? { ...group, permissions: matchingPermissions } : null;
    }).filter(g => g !== null) as PermissionGroup[];
  }

  // Check if all permissions in a group are enabled
  isAllSelected(group: PermissionGroup): boolean {
    return group.permissions.every(p => p.isEnabled);
  }

  // Toggle all permissions in a group
  toggleGroup(group: PermissionGroup, event: any): void {
    const isChecked = event.target.checked;
    group.permissions.forEach(p => p.isEnabled = isChecked);
    this.hasUnsavedChanges = true;
  }

  // Individual toggle
  togglePermission(): void {
    this.hasUnsavedChanges = true;
  }

  resetDefaults(): void {
    // Implementation for reset logic
    console.log('Resetting to defaults...');
  }

  saveChanges(): void {
    console.log('Saving configuration...', this.permissionGroups);
    this.hasUnsavedChanges = false;
  }
}
