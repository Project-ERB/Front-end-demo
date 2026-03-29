import { SiedeAdminComponent } from './../../../../../shared/UI/siede-admin/siede-admin/siede-admin.component';
import { AdminService } from './../../../../../core/services/Admin-service/admin.service';
import { PermissionService, PermissionNode } from './../../../../../core/services/permission/permission.service';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

export type PermKey = 'view' | 'create' | 'update' | 'delete';

const PERM_LABELS: Record<PermKey, string> = {
  view: 'View',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
};

// Map resource string from API → display label
const RESOURCE_LABEL_MAP: Record<string, string> = {
  SALES: 'Sales',
  SALES_DASHBOARD: 'Sales Dashboard',
  PRODUCTS: 'Products',
  CATEGORIES: 'Categories',
  DISCOUNTS: 'Discounts',
  ORDERS: 'Orders',
  CUSTOMERS: 'Customers',
  HR: 'HR',
  EMPLOYEES: 'Employees',
  DEPARTMENTS: 'Departments',
  RECRUITS: 'Recruits',
  CANDIDATES: 'Candidates',
  APPLICATIONS: 'Applications',
  INVENTORY: 'Inventory',
  ADMINATION: 'Administration',
};

// Role name options — value is the number sent to API
export const ROLE_NAME_OPTIONS = [
  // ── الإدارة العليا
  { label: 'System Admin', value: 0 },
  { label: 'CEO', value: 1 },
  { label: 'CFO', value: 2 },
  { label: 'COO', value: 3 },
  { label: 'HR Director', value: 4 },

  // ── المحاسبة والمالية
  { label: 'Accountant', value: 5 },
  { label: 'Senior Accountant', value: 6 },
  { label: 'Financial Manager', value: 7 },
  { label: 'Auditor', value: 8 },
  { label: 'Cashier', value: 9 },
  { label: 'Treasury Manager', value: 10 },
  { label: 'Tax Manager', value: 11 },
  { label: 'AR Clerk', value: 12 },
  { label: 'AP Clerk', value: 13 },

  // ── المبيعات
  { label: 'Sales Representative', value: 14 },
  { label: 'Sales Manager', value: 15 },
  { label: 'Sales Support', value: 16 },
  { label: 'Customer', value: 17 },

  // ── المشتريات
  { label: 'Procurement Officer', value: 18 },
  { label: 'Procurement Manager', value: 19 },
  { label: 'Supplier Manager', value: 20 },
  { label: 'Supplier', value: 21 },

  // ── المخزون والمستودعات
  { label: 'Inventory Clerk', value: 22 },
  { label: 'Inventory Manager', value: 23 },
  { label: 'Warehouse Keeper', value: 24 },
  { label: 'Warehouse Manager', value: 25 },

  // ── الموارد البشرية
  { label: 'HR Clerk', value: 26 },
  { label: 'Recruiter', value: 27 },
  { label: 'Payroll Officer', value: 28 },
  { label: 'Training Manager', value: 29 },

  // ── شؤون الموظفين
  { label: 'Employee', value: 30 },
  { label: 'Department Manager', value: 31 },
  { label: 'Attendance Officer', value: 32 },

  // ── العملاء والموردين
  { label: 'Customer Service', value: 33 },
  { label: 'CRM Manager', value: 34 },
  { label: 'Vendor Relations', value: 35 },

  // ── الإنتاج والتصنيع
  { label: 'Production Worker', value: 36 },
  { label: 'Production Manager', value: 37 },
  { label: 'Quality Controller', value: 38 },
  { label: 'Maintenance Engineer', value: 39 },

  // ── المشاريع
  { label: 'Project Manager', value: 40 },
  { label: 'Project Engineer', value: 41 },
  { label: 'Task Assignee', value: 42 },

  // ── BI والتقارير
  { label: 'BI Analyst', value: 43 },
  { label: 'Data Analyst', value: 44 },
  { label: 'Report Viewer', value: 45 },

  // ── التقنية والدعم
  { label: 'IT Support', value: 46 },
  { label: 'Developer', value: 47 },
  { label: 'Database Admin', value: 48 },
  { label: 'Security Officer', value: 49 },

  // ── أخرى
  { label: 'Guest', value: 50 },
  { label: 'Supervisor', value: 51 },
  { label: 'Operator', value: 52 },
];

@Component({
  selector: 'app-create-role',
  imports: [CommonModule, FormsModule, SiedeAdminComponent, ReactiveFormsModule],
  templateUrl: './create-role.component.html',
  styleUrl: './create-role.component.scss',
})
export class CreateRoleComponent implements OnInit {

  private readonly _ToastrService = inject(ToastrService);
  private readonly _AdminService = inject(AdminService);
  private readonly _PermissionService = inject(PermissionService);
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _Router = inject(Router);

  // ── State ───────────────────────────────────────────────────────────────
  isDirty = false;
  saveSuccess = false;
  formError = '';
  isLoadingPermissions = false;
  isSaving = false;
  allPermissions: PermissionNode[] = [];

  readonly permLabels = PERM_LABELS;
  readonly resourceLabelMap = RESOURCE_LABEL_MAP;
  readonly roleNameOptions = ROLE_NAME_OPTIONS;

  // ── Form ────────────────────────────────────────────────────────────────
  RoleForm: FormGroup = this._FormBuilder.group({
    name: [null, Validators.required],
    description: [null],
    // setPermissions: this._FormBuilder.array([]),
  });

  // get setPermissions(): FormArray {
  //   return this.RoleForm.get('setPermissions') as FormArray;
  // }

  // getPermGroup(i: number): FormGroup {
  //   return this.setPermissions.at(i) as FormGroup;
  // }

  // ── Build form array from API data ──────────────────────────────────────
  // buildPermissionControls(): void {
  //   this.setPermissions.clear();
  //   this.allPermissions.forEach(perm => {
  //     this.setPermissions.push(
  //       this._FormBuilder.group({
  //         permissionId: [perm.id],
  //         allowCreate: [false],
  //         allowDelete: [false],
  //         allowUpdated: [false],
  //         allowView: [false],
  //       })
  //     );
  //   });
  // }

  // ── Helpers ─────────────────────────────────────────────────────────────
  getResourceLabels(resources: string[]): string[] {
    return (resources || []).map(r => RESOURCE_LABEL_MAP[r] ?? r);
  }

  // getCheckedCount(i: number): number {
  //   const g = this.getPermGroup(i).value;
  //   return [g.allowCreate, g.allowDelete, g.allowUpdated, g.allowView].filter(Boolean).length;
  // }

  // toggleAll(i: number, checked: boolean): void {
  //   this.getPermGroup(i).patchValue({
  //     allowCreate: checked,
  //     allowDelete: checked,
  //     allowUpdated: checked,
  //     allowView: checked,
  //   });
  //   this.markDirty();
  // }

  // isAllChecked(i: number): boolean {
  //   const g = this.getPermGroup(i).value;
  //   return g.allowCreate && g.allowDelete && g.allowUpdated && g.allowView;
  // }

  markDirty(): void { this.isDirty = true; this.saveSuccess = false; }

  cancel(): void {
    if (this.isDirty && !confirm('Discard unsaved changes?')) return;
    this.RoleForm.reset();
    // this.buildPermissionControls();
    this.isDirty = false;
    this.formError = '';
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────
  ngOnInit(): void {
    // this.loadPermissions();
  }

  // loadPermissions(): void {
  //   this.isLoadingPermissions = true;
  //   this._PermissionService.getPermissions().subscribe({
  //     next: (data) => {
  //       this.allPermissions = data;
  //       this.isLoadingPermissions = false;
  //       this.buildPermissionControls();
  //     },
  //     error: () => {
  //       this.isLoadingPermissions = false;
  //       this._ToastrService.error('Failed to load permissions.');
  //     },
  //   });
  // }

  // ── Submit ──────────────────────────────────────────────────────────────
  createRole(): void {
    this.formError = '';

    const nameVal = this.RoleForm.get('name')?.value;
    if (nameVal === null || nameVal === undefined || nameVal === '') {
      this.formError = 'Role name is required.';
      return;
    }

    this.isSaving = true;
    console.log('Payload →', this.RoleForm.value);

    this._AdminService.creatCustomRole(this.RoleForm.value).subscribe({
      next: (res) => {
        this.isSaving = false;
        this._ToastrService.success('Role created successfully!');
        console.log('Created:', res);
        this.saveSuccess = true;
        this.isDirty = false;
        setTimeout(() => {
          this._Router.navigate(['/role-mangement']);
        }, 3000);
      },
      error: (err) => {
        this.isSaving = false;
        this._ToastrService.error('Failed to create role.');
        console.error('Error:', err);
      },
    });
  }
}