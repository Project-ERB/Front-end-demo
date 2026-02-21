import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiedeAdminComponent } from "../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";


export type PermKey = 'view' | 'create' | 'update' | 'delete';

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface RoleModule {
  id: string;
  label: string;
  description: string;
  icon: string;
  iconBg: string;
  iconText: string;
  perms: ModulePermissions;
  // Which permission keys are available (others are locked/disabled)
  available: PermKey[];
}

// ── Perm label map ─────────────────────────────────────────────────────────
const PERM_LABELS: Record<PermKey, string> = {
  view: 'View',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
};

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule, SiedeAdminComponent],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss'
})
export class CreateUserComponent {

  // ── Form state ─────────────────────────────────────────────────────────
  roleName = '';
  description = '';
  isDirty = false;
  saveSuccess = false;
  formError = '';

  readonly permKeys: PermKey[] = ['view', 'create', 'update', 'delete'];
  readonly permLabels = PERM_LABELS;

  // ── Module permission data ─────────────────────────────────────────────
  modules: RoleModule[] = [
    {
      id: 'inventory', label: 'Inventory', description: 'Stock & warehouse',
      icon: 'inventory_2', iconBg: 'bg-blue-50', iconText: 'text-blue-600',
      perms: { view: true, create: true, update: false, delete: false },
      available: ['view', 'create', 'update', 'delete'],
    },
    {
      id: 'sales', label: 'Sales', description: 'Orders & Invoices',
      icon: 'shopping_cart', iconBg: 'bg-green-50', iconText: 'text-green-600',
      perms: { view: true, create: true, update: true, delete: false },
      available: ['view', 'create', 'update', 'delete'],
    },
    {
      id: 'hr', label: 'Human Resources', description: 'Employees & Payroll',
      icon: 'group', iconBg: 'bg-orange-50', iconText: 'text-orange-600',
      perms: { view: true, create: false, update: true, delete: false },
      available: ['view', 'create', 'update', 'delete'],
    },
    {
      id: 'reports', label: 'Reports & Analytics', description: 'System wide metrics',
      icon: 'bar_chart', iconBg: 'bg-purple-50', iconText: 'text-purple-600',
      perms: { view: true, create: false, update: false, delete: false },
      // Reports is read-only — create/update/delete locked
      available: ['view'],
    },
    {
      id: 'settings', label: 'System Settings', description: 'Config & integrations',
      icon: 'settings', iconBg: 'bg-slate-50', iconText: 'text-slate-600',
      perms: { view: false, create: false, update: false, delete: false },
      available: ['view', 'update'],
    },
    {
      id: 'finance', label: 'Finance', description: 'Budgets & transactions',
      icon: 'account_balance', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600',
      perms: { view: true, create: false, update: false, delete: false },
      available: ['view', 'create', 'update', 'delete'],
    },
  ];

  // ── Computed: total active permissions ─────────────────────────────────
  get totalEnabled(): number {
    return this.modules.reduce((sum, m) =>
      sum + this.permKeys.filter(k => m.perms[k]).length, 0);
  }

  get totalAvailable(): number {
    return this.modules.reduce((sum, m) => sum + m.available.length, 0);
  }

  // ── Per-module: all available perms enabled? ───────────────────────────
  isModuleAllSelected(m: RoleModule): boolean {
    return m.available.every(k => m.perms[k]);
  }

  toggleModuleAll(m: RoleModule, checked: boolean): void {
    m.available.forEach(k => m.perms[k] = checked);
    this.markDirty();
  }

  // ── Toggle individual perm ─────────────────────────────────────────────
  onPermToggle(): void { this.markDirty(); }

  // ── Select all / Reset all modules ────────────────────────────────────
  selectAll(): void {
    this.modules.forEach(m => m.available.forEach(k => m.perms[k] = true));
    this.markDirty();
  }

  resetAll(): void {
    this.modules.forEach(m => this.permKeys.forEach(k => m.perms[k] = false));
    this.markDirty();
  }

  // ── Dirty tracking ────────────────────────────────────────────────────
  markDirty(): void { this.isDirty = true; this.saveSuccess = false; }

  // ── Save ──────────────────────────────────────────────────────────────
  save(): void {
    this.formError = '';
    if (!this.roleName.trim()) {
      this.formError = 'Role name is required.';
      return;
    }
    // Build output payload
    const payload = {
      name: this.roleName.trim(),
      description: this.description.trim(),
      permissions: Object.fromEntries(
        this.modules.map(m => [m.id, { ...m.perms }])
      )
    };
    console.log('Saving role:', payload);
    this.isDirty = false;
    this.saveSuccess = true;
    setTimeout(() => this.saveSuccess = false, 3000);
  }

  // ── Cancel ────────────────────────────────────────────────────────────
  cancel(): void {
    if (this.isDirty && !confirm('Discard unsaved changes?')) return;
    this.roleName = '';
    this.description = '';
    this.isDirty = false;
    this.formError = '';
    this.resetAll();
  }

  // ── Is perm available for a module ────────────────────────────────────
  isAvailable(m: RoleModule, key: PermKey): boolean {
    return m.available.includes(key);
  }

  permissionProgress(mod: RoleModule): number {
    const availableCount = mod.available.length;
    if (availableCount === 0) return 0;

    const activeCount = mod.available.filter(k => mod.perms[k]).length;
    return Math.round((activeCount / availableCount) * 100);
  }

  getActiveCount(mod: any): number {
    return mod.available.filter((k: string) => mod.perms[k]).length;
  }

}
