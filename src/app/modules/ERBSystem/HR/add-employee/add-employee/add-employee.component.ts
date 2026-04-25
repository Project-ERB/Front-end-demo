import { AdminService } from './../../../../../core/services/Admin-service/admin.service';
import { PermissionService, PermissionNode } from './../../../../../core/services/permission/permission.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { EmployeeService } from '../../../../../core/services/Auth/employee/employee.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";



interface RoleOption {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-add-employee',
  imports: [CommonModule, ReactiveFormsModule, HrSidebarComponent],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss',
})
export class AddEmployeeComponent implements OnInit {

  employeeForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  errorMessage = '';

  roles: RoleOption[] = [];
  permissions: PermissionNode[] = [];

  // ── Selected Permissions ───────────────────────────────
  selectedPermissions = new Set<string>();

  // ── Fixed IDs ──────────────────────────────────────────
  readonly MANAGER_ID = '6730cfb3-8a7f-4b5e-9b8f-884dddfa01e0';
  readonly DEPARTMENT_ID = '6a32ef0d-908a-4127-a256-52cbe7728f09';

  navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'group', label: 'Employees', active: true },
    { icon: 'payments', label: 'Payroll', active: false },
    { icon: 'bar_chart', label: 'Reports', active: false },
    { icon: 'settings', label: 'Settings', active: false, section: 'System' },
  ];

  jobLevels = [
    { value: 1, label: 'Junior' },
    { value: 2, label: 'Intermediate' },
    { value: 3, label: 'Senior' },
    { value: 4, label: 'Lead' },
    { value: 5, label: 'Chief' },
  ];

  employeeTypes = [
    { value: 1, label: 'Full-time' },
    { value: 2, label: 'Part-time' },
    { value: 3, label: 'Contractor' },
    { value: 4, label: 'Intern' },
    { value: 5, label: 'Temporary' },
  ];

  statusOptions = [
    { value: 1, label: 'Active' },
    { value: 2, label: 'Inactive' },
    { value: 3, label: 'Suspended' },
    { value: 4, label: 'Terminated' },
    { value: 5, label: 'None' },
  ];

  currencies = ['USD', 'EGP', 'EUR', 'GBP'];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private _EmployeeService: EmployeeService,
    private permissionService: PermissionService,
    private _Router: Router,
    private _ToastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.loadRolesAndPermissions();
  }

  private buildForm(): void {
    this.employeeForm = this.fb.group({
      // Personal
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      nationalId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+20', Validators.required],
      phoneNumber: ['', Validators.required],
      // Address
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      // Job
      jobLevel: [1],        // Junior
      employeeType: [1],    // Full-time
      salaryAmount: [null, [Validators.required, Validators.min(1)]],
      salaryCurrency: ['USD', Validators.required],
      hireDate: [new Date().toISOString().split('T')[0], Validators.required],
      status: [1],          // Active
      roleId: ['', Validators.required],
    });
  }

  private loadRolesAndPermissions(): void {
    forkJoin({
      roles: this.adminService.getRoles(),
      permissions: this.permissionService.getPermissions(),
    }).subscribe({
      next: ({ roles, permissions }) => {
        this.roles = roles.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
        }));
        this.permissions = permissions;
        // تحديد كل الـ permissions افتراضياً — اليوزر يـ deselect اللي مش عايزه
        permissions.forEach(p => this.selectedPermissions.add(p.id));
      },
      error: (err) => console.error('Failed to load roles/permissions', err),
    });
  }

  get f() { return this.employeeForm.controls; }

  isFieldInvalid(field: string): boolean {
    const c = this.employeeForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ── Permission Helpers ────────────────────────────────────────────────────

  togglePermission(id: string): void {
    if (this.selectedPermissions.has(id)) {
      this.selectedPermissions.delete(id);
    } else {
      this.selectedPermissions.add(id);
    }
  }

  selectAllPermissions(): void {
    this.permissions.forEach(p => this.selectedPermissions.add(p.id));
  }

  clearAllPermissions(): void {
    this.selectedPermissions.clear();
  }

  // ── Payload Builder ───────────────────────────────────────────────────────

  private buildPayload(): object {
    const v = this.employeeForm.value;

    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // بس الـ permissions اللي المستخدم اختارها
    const permissionsMap: Record<string, any> = {};
    this.permissions
      .filter(p => this.selectedPermissions.has(p.id))
      .forEach(p => {
        if (!guidRegex.test(p.id)) {
          console.warn('Skipping invalid permission id:', p.id, p.name);
          return;
        }
        permissionsMap[p.id] = {
          allowCreate: true,
          allowDelete: true,
          allowUpdated: true,
          allowView: true,
        };
      });

    return {
      name: v.fullName,
      nationalId: v.nationalId,
      phoneNumber: {
        countryCode: v.countryCode,
        number: v.phoneNumber,
      },
      address: {
        street: v.street,
        city: v.city,
        state: v.state,
        postalCode: v.postalCode,
        country: v.country,
      },
      email: v.email,
      salaryAmount: Number(v.salaryAmount),
      salaryCurrency: v.salaryCurrency,
      employeeLevel: Number(v.jobLevel),
      departmentId: this.DEPARTMENT_ID,
      hireDate: v.hireDate,
      employeeType: Number(v.employeeType),
      employeeStatus: Number(v.status),
      roleid: v.roleId,
      permissions: permissionsMap,
      managerId: this.MANAGER_ID,
    };
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    if (this.selectedPermissions.size === 0) {
      this.errorMessage = 'Please select at least one permission.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = this.buildPayload();
    console.log('Permissions in payload:', (payload as any).permissions);
    console.log('Payload:', payload);

    this._EmployeeService.createEmployee(payload).subscribe({
      next: (res) => {
        console.log('Employee created:', res);
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.selectedPermissions.clear();
        this._ToastrService.success('Employee created successfully!', 'Success!');
        this.employeeForm.reset({
          jobLevel: 1,
          employeeType: 1,
          status: 1,
          salaryCurrency: 'USD',
          countryCode: '+20',
        });
        setTimeout(() => (
          this._Router.navigate(['/employee-managment']),
          this.submitSuccess = false
        ), 3500);
      },
      error: (err) => {
        this.isSubmitting = false;

        const message =
          err?.error?.reasons?.[0]?.message ||
          err?.error?.errors?.[0]?.message ||
          'Something went wrong';

        this._ToastrService.error(message, 'Failed!');
      }
    });
  }

  // ── Cancel ────────────────────────────────────────────────────────────────

  onCancel(): void {
    this.selectedPermissions.clear();
    this.employeeForm.reset({
      jobLevel: 1,
      employeeType: 1,
      status: 1,
      salaryCurrency: 'USD',
      countryCode: '+20',
    });
  }
}