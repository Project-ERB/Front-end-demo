import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeService, EmployeeNode } from '../../../../../core/services/Auth/employee/employee.service';

interface TabItem { label: string; active: boolean; }
interface TimeOffBand { label: string; used: number; total: number; color: string; }

@Component({
  selector: 'app-employee-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.scss',
})
export class EmployeeDetailsComponent implements OnInit {

  employee: EmployeeNode | null = null;
  isLoading = true;
  error = '';

  activeTab = 'Overview';
  tabs: TabItem[] = [
    { label: 'Overview', active: true },
    // { label: 'Employment', active: false },
    // { label: 'Documents', active: false },
    // { label: 'Performance', active: false },
    // { label: 'Assets', active: false },
  ];

  // ── Personal ────────────────────────────────────────
  get personal() {
    const addr = this.employee?.address;

    return {
      fullName: this.employee?.name ?? '—',
      email: this.employee?.email ?? '—',
      phone: this.employee?.phoneNumber ?? '—',
      birthDate: '—',   // no longer available from nationalID string
      address: addr
        ? `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`
        : '—',
    };
  }

  // ── Employment ──────────────────────────────────────
  get employment() {
    return {
      department: this.employee?.departmentId ?? '—',
      level: this.levelLabel(this.employee?.employeeLevel),
      type: this.typeLabel(this.employee?.employeeType),
      hireDate: this.employee?.hiredate ?? '—',
      managerName: this.employee?.managerId ?? '—',
      managerTitle: '—',
      managerImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgfrq1OChqTcZ7cmO88-kyHpc5EodvygVLrJlgxRaNfNgV7taQ88Gri-q0dlMR0L0J4Gd6TBW_1tOBixM-kDfJqgK0gx-w2HEenGxegtdBxggGWSabNBEHvcsUmDQ2bDu63NzzhVvFQBoS7L6Z98Dj7Gpm2EGCw52zkwdbvFWGAlbLsIT55RDxWEwMfe6VB_ff2A6ZiYku62QV6OgvMYRXfL48R9bDyBFX-Xw3JrSprtsGZL_w3CFvd8mznHL5d00lLg5CvcG4AXNa',
    };
  }

  // ── Financials ──────────────────────────────────────
  get financials() {
    return {
      salary: this.employee?.salary?.toString() ?? '—',
      currency: this.employee?.currency ?? '—',
      bankName: '—',
      bankType: '—',
    };
  }

  // ── National ID Info (extra card) ───────────────────
  get nationalInfo() {
    const natId = this.employee?.nationalID;
    if (!natId) return null;

    // nationalID is now just the raw ID string e.g. "29901011234567"
    return {
      value: natId,
    };
  }

  timeOff: TimeOffBand[] = [
    { label: 'Paid Time Off (PTO)', used: 12, total: 20, color: 'bg-[#ec5b13]' },
    { label: 'Sick Leave', used: 8, total: 10, color: 'bg-blue-500' },
  ];

  departments: { id: string; name: string }[] = [];

  getDepartmentName(id?: string): string {
    if (!id) return '—';
    return this.departments.find(d => d.id === id)?.name ?? id;
  }

  constructor(
    private _route: ActivatedRoute,
    private _EmployeeService: EmployeeService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    const nav = this._router.getCurrentNavigation();
    const stateEmp = nav?.extras?.state?.['employee'] as EmployeeNode | undefined;
    const routeId = this._route.snapshot.paramMap.get('id');

    // جيب الـ departments أولاً، وبعدين جيب الـ employee
    this._EmployeeService.getDepartments().subscribe({
      next: (deps) => {
        this.departments = deps;

        if (stateEmp) {
          this.fetchByNationalId(stateEmp);
        } else if (routeId) {
          this.fetchById(routeId);
        } else {
          this.error = 'No employee ID provided.';
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error(err);
        // حتى لو الـ departments فشلت، كمّل وجيب الـ employee
        if (stateEmp) {
          this.fetchByNationalId(stateEmp);
        } else if (routeId) {
          this.fetchById(routeId);
        } else {
          this.error = 'No employee ID provided.';
          this.isLoading = false;
        }
      }
    });
  }

  private fetchById(id: string): void {
    // بنستخدم getEmployees ونفلتر بالـ id
    this._EmployeeService.getEmployees().subscribe({
      next: (employees) => {
        const found = employees.find(e => e.id === id);
        if (!found) {
          this.error = 'Employee not found.';
          this.isLoading = false;
          return;
        }
        // لو لقيناه، نجيب التفاصيل الكاملة
        this.fetchByNationalId(found);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load employee.';
        this.isLoading = false;
      }
    });
  }

  private fetchByNationalId(emp: EmployeeNode): void {
    // nationalID is now a plain string, not a nested object
    const natIdValue = emp.nationalID;   // ← was (emp as any).nationalID?.value

    if (!natIdValue) {
      this.employee = emp;
      this.isLoading = false;
      return;
    }

    this._EmployeeService.getEmployeeById(natIdValue).subscribe({
      next: (data) => { this.employee = data; this.isLoading = false; },
      error: (err) => {
        console.error(err);
        this.employee = emp;
        this.isLoading = false;
      },
    });
  }

  bandPercent(band: TimeOffBand): number {
    return Math.round((band.used / band.total) * 100);
  }

  selectTab(label: string): void {
    this.activeTab = label;
    this.tabs = this.tabs.map(t => ({ ...t, active: t.label === label }));
  }

  // ── Label Helpers ───────────────────────────────────
  private levelLabel(val?: string): string {
    const map: Record<string, string> = {
      '1': 'Junior', '2': 'Intermediate', '3': 'Senior', '4': 'Lead', '5': 'Chief',
    };
    return val ? (map[val] ?? val) : '—';
  }

  private typeLabel(val?: string): string {
    const map: Record<string, string> = {
      '1': 'Full-time', '2': 'Part-time', '3': 'Contractor', '4': 'Intern', '5': 'Temporary',
    };
    return val ? (map[val] ?? val) : '—';
  }
}