import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";
import { Router, RouterLink } from '@angular/router';
import { EmployeeService, EmployeeNode } from '../../../../../core/services/employee/employee.service';
import { ToastrService } from 'ngx-toastr';
import { AdminService, Role } from '../../../../../core/services/Admin-service/admin.service';
import { PermissionService, PermissionNode } from '../../../../../core/services/permission/permission.service';
import { forkJoin } from 'rxjs';
import { Environment } from '../../../../../shared/UI/environment/env';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Probation' | 'Terminated';

interface StatCard {
  icon: string; label: string; value: string; sub?: string;
  iconBg: string; iconColor: string;
}

interface RoleOption { id: string; name: string; description: string; }

@Component({
  selector: 'app-employee-management',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HrSidebarComponent],
  templateUrl: './employee-management.component.html',
  styleUrl: './employee-management.component.scss',
})
export class EmployeeManagementComponent implements OnInit {

  searchQuery = '';
  selectedDepartment = '';
  selectedStatus = '';

  private readonly _router = inject(Router);
  private readonly _EmployeeService = inject(EmployeeService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _AdminService = inject(AdminService);
  private readonly _PermService = inject(PermissionService);
  private readonly _fb = inject(FormBuilder);

  showEditModal = false;
  isUpdating = false;
  editForm!: FormGroup;
  editingEmployee: EmployeeNode | null = null;

  roles: RoleOption[] = [];
  permissions: PermissionNode[] = [];
  selectedPermissions = new Set<string>();

  readonly MANAGER_ID = '6730cfb3-8a7f-4b5e-9b8f-884dddfa01e0';
  readonly DEPARTMENT_ID = '6a32ef0d-908a-4127-a256-52cbe7728f09';

  jobLevels = [
    { value: 1, label: 'Junior' }, { value: 2, label: 'Intermediate' },
    { value: 3, label: 'Senior' }, { value: 4, label: 'Lead' }, { value: 5, label: 'Chief' },
  ];
  employeeTypes = [
    { value: 1, label: 'Full-time' }, { value: 2, label: 'Part-time' },
    { value: 3, label: 'Contractor' }, { value: 4, label: 'Intern' }, { value: 5, label: 'Temporary' },
  ];
  statusOptions = [
    { value: 1, label: 'Active' }, { value: 2, label: 'Inactive' },
    { value: 3, label: 'Suspended' }, { value: 4, label: 'Terminated' }, { value: 5, label: 'None' },
  ];
  currencies = ['USD', 'EGP', 'EUR', 'GBP'];

  // ══════════════════════════════════════════════════════════════════════════
  //  Cursor-Based Pagination State
  // ══════════════════════════════════════════════════════════════════════════
  pageSize = 10;
  allEmployees: EmployeeNode[] = [];
  isLoading = false;

  /** Stack of cursors — index 0 is always null (first page) */
  private cursorStack: (string | null)[] = [null];
  private cursorIndex = 0;

  hasNextPage = false;
  hasPreviousPage = false;

  departments = ['Engineering', 'Design', 'Marketing', 'Sales'];
  statuses: EmployeeStatus[] = ['Active', 'On Leave', 'Probation', 'Terminated'];

  statCards: StatCard[] = [
    {
      icon: 'person_add', label: 'New Hires', value: '12', sub: '+4% this month',
      iconBg: 'bg-blue-100', iconColor: 'text-blue-600'
    },
    {
      icon: 'diversity_3', label: 'Retention Rate', value: '98.2%',
      iconBg: 'bg-[#ec5b13]/10', iconColor: 'text-[#ec5b13]'
    },
    {
      icon: 'hourglass_empty', label: 'Open Positions', value: '8',
      iconBg: 'bg-purple-100', iconColor: 'text-purple-600'
    },
  ];

  deletingEmployeeId: string | null = null;
  downloadingQrId: string | null = null;

  // ══════════════════════════════════════════════════════════════════════════
  //  Lifecycle
  // ══════════════════════════════════════════════════════════════════════════
  ngOnInit(): void {
    this.buildEditForm();
    this.fetchEmployees();
    this.loadRolesAndPermissions();
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Cursor-Based Pagination Methods
  // ══════════════════════════════════════════════════════════════════════════

  /** Fetch employees using the cursor at the current stack index */
  fetchEmployees(): void {
    this.isLoading = true;
    const after = this.cursorStack[this.cursorIndex] ?? undefined;

    this._EmployeeService.getEmployees(this.pageSize, after).subscribe({
      next: (res) => {
        this.allEmployees = res.nodes;
        this.hasNextPage = res.pageInfo.hasNextPage;
        this.hasPreviousPage = res.pageInfo.hasPreviousPage;

        // ── Edge case: if the current page is empty (e.g. after delete), go back ──
        if (this.allEmployees.length === 0 && this.cursorIndex > 0) {
          this.cursorIndex--;
          this.fetchEmployees();
          return;
        }

        // ── Store endCursor for potential forward navigation ──
        if (res.pageInfo.endCursor) {
          if (this.cursorIndex + 1 >= this.cursorStack.length) {
            this.cursorStack.push(res.pageInfo.endCursor);
          } else {
            this.cursorStack[this.cursorIndex + 1] = res.pageInfo.endCursor;
          }
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  /** Navigate to next page */
  nextPage(): void {
    if (!this.hasNextPage) return;
    this.cursorIndex++;
    this.fetchEmployees();
  }

  /** Navigate to previous page */
  prevPage(): void {
    if (this.cursorIndex <= 0) return;
    this.cursorIndex--;
    this.fetchEmployees();
  }

  // ── Computed pagination info ──────────────────────────────────────────────
  get currentPageLabel(): number {
    return this.cursorIndex + 1;
  }

  get showingFrom(): number {
    return this.cursorIndex * this.pageSize + 1;
  }

  get showingTo(): number {
    return this.showingFrom + this.allEmployees.length - 1;
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Client-Side Search / Filter  (filters current page only)
  //  ⚠️ For full search across ALL employees, add filter args to the GraphQL query
  // ══════════════════════════════════════════════════════════════════════════
  get filteredEmployees(): EmployeeNode[] {
    const q = this.searchQuery.toLowerCase();
    return this.allEmployees.filter(e => {
      const matchesSearch = !q
        || e.name?.toLowerCase().includes(q)
        || e.phoneNumber?.includes(q)
        || e.email?.toLowerCase().includes(q);
      const matchesDept = !this.selectedDepartment || e.departmentId === this.selectedDepartment;
      const matchesStatus = !this.selectedStatus || e.status === this.selectedStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }

  /** Reset to first page when filters change */
  onFilterChange(): void {
    this.cursorStack = [null];
    this.cursorIndex = 0;
    this.fetchEmployees();
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Edit Form
  // ══════════════════════════════════════════════════════════════════════════
  private buildEditForm(): void {
    this.editForm = this._fb.group({
      nationalId: ['', Validators.required],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+20', Validators.required],
      phoneNumber: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      jobLevel: [1],
      employeeType: [1],
      salaryAmount: [null, [Validators.required, Validators.min(1)]],
      salaryCurrency: ['USD', Validators.required],
      hireDate: [new Date().toISOString().split('T')[0]],
      status: [1],
      roleId: ['', Validators.required],
    });
  }

  get ef() { return this.editForm.controls; }

  isEditFieldInvalid(field: string): boolean {
    const c = this.editForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Roles & Permissions
  // ══════════════════════════════════════════════════════════════════════════
  private loadRolesAndPermissions(): void {
    forkJoin({
      roles: this._AdminService.getRoles(),
      permissions: this._PermService.getPermissions(),
    }).subscribe({
      next: ({ roles, permissions }) => {
        this.roles = roles.map((r: Role) => ({ id: r.id, name: r.name, description: r.description }));
        this.permissions = permissions;
      },
      error: (err) => console.error('Failed to load roles/permissions', err),
    });
  }

  togglePermission(id: string): void {
    this.selectedPermissions.has(id)
      ? this.selectedPermissions.delete(id)
      : this.selectedPermissions.add(id);
  }

  selectAllPermissions(): void { this.permissions.forEach(p => this.selectedPermissions.add(p.id)); }
  clearAllPermissions(): void { this.selectedPermissions.clear(); }

  // ══════════════════════════════════════════════════════════════════════════
  //  Edit Modal
  // ══════════════════════════════════════════════════════════════════════════
  openEditModal(emp: EmployeeNode): void {
    this.editingEmployee = emp;
    let countryCode = '+20';
    let phoneNumber = emp.phoneNumber ?? '';
    const phoneMatch = phoneNumber.match(/^(\+\d{1,3})(\d+)$/);
    if (phoneMatch) {
      countryCode = phoneMatch[1];
      phoneNumber = phoneMatch[2];
    }

    const statusStrToNum: Record<string, number> = { Active: 1, Inactive: 2, Suspended: 3, Terminated: 4, None: 5 };
    const levelStrToNum: Record<string, number> = { Junior: 1, Intermediate: 2, Senior: 3, Lead: 4, Chief: 5 };
    const typeStrToNum: Record<string, number> = { 'Full-time': 1, 'Part-time': 2, Contractor: 3, Intern: 4, Temporary: 5 };

    this.editForm.patchValue({
      fullName: emp.name ?? '',
      nationalId: emp.nationalID ?? '',
      email: emp.email ?? '',
      countryCode: countryCode,
      phoneNumber: phoneNumber,
      street: emp.address?.street ?? '',
      city: emp.address?.city ?? '',
      state: emp.address?.state ?? '',
      postalCode: emp.address?.postalCode ?? '',
      country: emp.address?.country ?? '',
      jobLevel: levelStrToNum[emp.employeeLevel] ?? Number(emp.employeeLevel) ?? 1,
      employeeType: typeStrToNum[emp.employeeType] ?? Number(emp.employeeType) ?? 1,
      salaryAmount: emp.salary,
      salaryCurrency: emp.currency || 'USD',
      hireDate: emp.hiredate ? new Date(emp.hiredate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: statusStrToNum[emp.status] ?? Number(emp.status) ?? 1,
      roleId: emp.roleId ?? '',
    });

    this.selectedPermissions.clear();
    this.permissions.forEach(p => this.selectedPermissions.add(p.id));
    this.showEditModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingEmployee = null;
    document.body.style.overflow = '';
    this.editForm.reset({ jobLevel: 1, employeeType: 1, status: 1, salaryCurrency: 'USD', countryCode: '+20' });
  }

  onUpdateSubmit(): void {
    if (this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }
    if (!this.editingEmployee) return;

    const v = this.editForm.value;
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const permissionsMap: Record<string, any> = {};
    this.permissions
      .filter(p => this.selectedPermissions.has(p.id))
      .forEach(p => {
        if (!guidRegex.test(p.id)) return;
        permissionsMap[p.id] = { allowCreate: true, allowDelete: true, allowUpdated: true, allowView: true };
      });

    const payload = {
      id: this.editingEmployee.id,
      nationalId: v.nationalId,
      name: v.fullName,
      email: v.email,
      phoneNumber: { countryCode: v.countryCode, number: v.phoneNumber },
      address: { street: v.street, city: v.city, state: v.state, postalCode: v.postalCode, country: v.country },
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

    this.isUpdating = true;
    this._EmployeeService.updateEmployee(payload).subscribe({
      next: () => {
        this.isUpdating = false;
        this._ToastrService.success('Employee updated successfully!', 'Success!');
        this.closeEditModal();
        this.fetchEmployees();
      },
      error: (err) => {
        this.isUpdating = false;
        const message = err?.error?.reasons?.[0]?.message || err?.error?.errors?.[0]?.message || 'Something went wrong';
        this._ToastrService.error(message, 'Failed!');
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Actions
  // ══════════════════════════════════════════════════════════════════════════
  gotoaddempoyee(): void { this._router.navigate(['/add-employee']); }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Active: 'bg-green-100 text-green-700',
      'On Leave': 'bg-blue-100 text-blue-700',
      Probation: 'bg-yellow-100 text-yellow-700',
      Terminated: 'bg-red-100 text-red-700',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }

  onDelete(emp: EmployeeNode): void {
    if (!confirm(`Are you sure you want to delete "${emp.name}"?`)) return;
    this.deletingEmployeeId = emp.id;
    this._EmployeeService.deleteEmployee(emp.id).subscribe({
      next: () => {
        this.deletingEmployeeId = null;
        this._ToastrService.success(`${emp.name} deleted successfully!`, 'Deleted!');
        this.fetchEmployees(); // will auto-go-back if page becomes empty
      },
      error: (err) => {
        this.deletingEmployeeId = null;
        const message = err?.error?.reasons?.[0]?.message || err?.error?.errors?.[0]?.message || 'Failed to delete employee';
        this._ToastrService.error(message, 'Failed!');
      }
    });
  }

  onView(emp: EmployeeNode): void {
    this._router.navigate(['/employee-details', emp.id], { state: { employee: emp } });
  }

  downloadQrCode(emp: EmployeeNode): void {
    if (!emp.qrCodePath) {
      this._ToastrService.warning('No QR code available for this employee.', 'Warning');
      return;
    }
    const url = emp.qrCodePath.startsWith('http')
      ? emp.qrCodePath
      : `${Environment.baseUrl}${emp.qrCodePath.startsWith('/') ? '' : '/'}${emp.qrCodePath}`;

    const a = document.createElement('a');
    a.href = url;
    a.download = `${emp.name.replace(/\s+/g, '_')}_QR.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}