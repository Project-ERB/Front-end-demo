import { Router } from '@angular/router';
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrSidebarComponent } from "../../../../../shared/UI/hr-sidebar/hr-sidebar.component";
import { AddPayrollRequest, PayrollService } from '../../../../../core/services/payroll/payroll.service';
import { EmployeeService, EmployeeNode } from '../../../../../core/services/employee/employee.service';

export interface PayrollRecord {
  id: string;
  initials: string;
  highlightInitials: boolean;
  name: string;
  department: string;
  paymentDate: string;
  periodStart: string;
  periodEnd: string;
  basicSalary: number;
  bonus: number;
  netSalary?: number;
}

export interface SummaryCard {
  label: string;
  value: string;
  badge?: string;
  badgeColor?: 'green' | 'neutral';
  showBar?: boolean;
  barPercent?: number;
}

@Component({
  selector: 'app-payroll-management',
  imports: [CommonModule, FormsModule, HrSidebarComponent],
  templateUrl: './payroll-management.component.html',
  styleUrl: './payroll-management.component.scss',
})
export class PayrollManagementComponent {

  private readonly _payrollService = inject(PayrollService);
  private readonly _employeeService = inject(EmployeeService);

  showMobileSearch: boolean = false;

  toggleMobileSearch() {
    this.showMobileSearch = !this.showMobileSearch;
  }

  toggleSidebar() {
    const sidebar = document.querySelector('.hr-sidebar') as HTMLElement;
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  }

  searchQuery = signal('');

  currentPage = signal(1);
  readonly pageSize = 5;
  readonly totalRecords = 42;

  showNewRecordModal = false;
  modalEmployees: EmployeeNode[] = [];
  loadingEmployees = false;

  form = {
    nationalId: '',
    periodStart: '',
    periodEnd: '',
    bonusAmount: 0,
  };

  submitting = false;
  submitSuccess = false;
  submitError = '';

  get isFormValid(): boolean {
    return !!this.form.nationalId
      && !!this.form.periodStart
      && !!this.form.periodEnd
      && new Date(this.form.periodEnd) >= new Date(this.form.periodStart);
  }

  openNewRecordModal(): void {
    this.showNewRecordModal = true;
    this.submitSuccess = false;
    this.submitError = '';
    this.form = { nationalId: '', periodStart: '', periodEnd: '', bonusAmount: 0 };
    this.loadingEmployees = true;

    this._employeeService.getEmployees().subscribe({
      next: (data) => {
        // ✅ FIX: data is EmployeeConnection, use .nodes
        console.log('employees:', data.nodes.map((e: EmployeeNode) => ({ id: e.id, nationalID: e.nationalID, name: e.name })));
        this.modalEmployees = data.nodes;
        this.loadingEmployees = false;
      },
      error: () => { this.loadingEmployees = false; },
    });
  }

  closeNewRecordModal(): void {
    if (this.submitting) return;
    this.showNewRecordModal = false;
  }

  submitNewRecord(): void {
    if (!this.isFormValid || this.submitting) return;

    const payload: AddPayrollRequest = {
      nationalId: this.form.nationalId,
      periodStart: new Date(this.form.periodStart).toISOString(),
      periodEnd: new Date(this.form.periodEnd).toISOString(),
      bonusAmount: this.form.bonusAmount ?? 0,
    };

    this.submitting = true;
    this.submitError = '';

    this._payrollService.addPayroll(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.submitSuccess = true;
        setTimeout(() => this.closeNewRecordModal(), 1800);
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err?.error?.message ?? 'Failed to add payroll record.';
      },
    });
  }

  readonly navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'group', label: 'Employees', active: false },
    { icon: 'payments', label: 'Payroll', active: true },
    { icon: 'volunteer_activism', label: 'Benefits', active: false },
    { icon: 'description', label: 'Reports', active: false },
    { icon: 'settings', label: 'Settings', active: false },
  ];

  readonly summaryCards: SummaryCard[] = [
    { label: 'Total Monthly Payout', value: '$452,890.00', badge: '+4.2% vs last mo', badgeColor: 'green' },
    { label: 'Total Tax & Deductions', value: '$84,120.50', badge: '—', badgeColor: 'neutral' },
    { label: 'Active Employees Paid', value: '156 / 158', showBar: true, barPercent: 98.5 },
  ];

  readonly pages = [1, 2, 3, 9];

  filteredRecords = computed<PayrollRecord[]>(() => {
    if (this.selectedEmployee()) {
      return this.payrollRecords() as PayrollRecord[];
    }
    return [];
  });

  get netSalary(): (record: PayrollRecord) => number {
    return (r) => r.basicSalary + r.bonus;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  }

  formatBonus(bonus: number): string {
    if (bonus === 0) return '$0.00';
    return `+${this.formatCurrency(bonus)}`;
  }

  setPage(page: number): void {
    this.currentPage.set(page);
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  onExportCSV(): void {
    console.log('Exporting CSV...');
  }

  onPrintAll(): void {
    window.print();
  }

  onMoreOptions(record: PayrollRecord): void {
    console.log('More options for', record.name);
  }

  onNewRecord(): void {
    this.openNewRecordModal();
  }

  clearFilters(): void {
    this.searchQuery.set('');
  }

  get showingText(): string {
    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage() * this.pageSize, this.totalRecords);
    return `Showing ${start} to ${end} of ${this.totalRecords} records`;
  }

  // Search state
  searchEmployeeName = '';
  searchResults: EmployeeNode[] = [];
  showDropdown = false;
  selectedEmployee = signal<EmployeeNode | null>(null);

  payrollRecords = signal<any[]>([]);
  searchingPayroll = false;
  payrollError = '';

  onSearchEmployeeName(value: string): void {
    this.searchEmployeeName = value;
    this.selectedEmployee.set(null);
    this.payrollRecords.set([]);

    if (!value.trim()) {
      this.searchResults = [];
      this.showDropdown = false;
      return;
    }

    const q = value.toLowerCase();
    this.searchResults = this.modalEmployees.filter(e =>
      e.nationalID?.toLowerCase().includes(q)
    );
    this.showDropdown = this.searchResults.length > 0;
  }

  selectEmployee(emp: EmployeeNode): void {
    this.selectedEmployee.set(emp);
    this.searchEmployeeName = emp.name;
    this.showDropdown = false;
    this.loadPayrollByEmployee(emp.nationalID!);
  }

  loadPayrollByEmployee(nationalId: string): void {
    this.searchingPayroll = true;
    this.payrollError = '';
    this.payrollRecords.set([]);

    this._payrollService.getPayrollsByNationalId(nationalId).subscribe({
      next: (res) => {
        const nodes = res?.data?.payrollsByNationalId?.nodes ?? [];
        this.payrollRecords.set(nodes);
        this.searchingPayroll = false;
        if (nodes.length === 0) {
          this.payrollError = 'No payroll records found for this employee.';
        }
      },
      error: () => {
        this.payrollError = 'Failed to load payroll records.';
        this.searchingPayroll = false;
      }
    });
  }

  clearEmployeeSearch(): void {
    this.searchEmployeeName = '';
    this.selectedEmployee.set(null);
    this.searchResults = [];
    this.showDropdown = false;
    this.payrollRecords.set([]);
    this.payrollError = '';
  }

  constructor() {
    this._employeeService.getEmployees().subscribe({
      // ✅ FIX: data is EmployeeConnection, use .nodes
      next: (data) => { this.modalEmployees = data.nodes; },
      error: () => { }
    });
  }

  // Edit Modal
  showEditModal = false;
  editingRecord: any = null;
  editForm = { payrollId: '', bonus: 0 };
  editSubmitting = false;
  editSuccess = false;
  editError = '';

  openEditModal(record: any): void {
    this.editingRecord = record;
    this.editForm = {
      payrollId: record.id ?? record.payrollId ?? '',
      bonus: record.bonus ?? 0,
    };
    this.editSuccess = false;
    this.editError = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    if (this.editSubmitting) return;
    this.showEditModal = false;
    this.editingRecord = null;
  }

  submitEditRecord(): void {
    if (this.editSubmitting) return;
    this.editSubmitting = true;
    this.editError = '';

    this._payrollService.updatePayroll(this.editForm.payrollId, this.editForm.bonus).subscribe({
      next: () => {
        this.editSubmitting = false;
        this.editSuccess = true;
        if (this.selectedEmployee()) {
          this.loadPayrollByEmployee(this.selectedEmployee()!.nationalID!);
        }
        setTimeout(() => this.closeEditModal(), 1800);
      },
      error: (err) => {
        this.editSubmitting = false;
        this.editError = err?.error?.message ?? 'Failed to update payroll record.';
      },
    });
  }

  onDeleteRecord(record: any): void {
    const id = record.id ?? record.payrollId;
    if (!id) return;

    const confirmDelete = confirm('Are you sure you want to delete this payroll?');
    if (!confirmDelete) return;

    this._payrollService.deletePayroll(id).subscribe({
      next: () => {
        if (this.selectedEmployee()) {
          this.loadPayrollByEmployee(this.selectedEmployee()!.nationalID!);
        }
      },
      error: (err) => {
        console.error(err);
        alert('Failed to delete payroll record');
      }
    });
  }

  private readonly _router = inject(Router);

  viewPayrollDetails(payrollId: string): void {
    this._router.navigate(['/payroll-details', payrollId], {
      state: { employee: this.selectedEmployee() }
    });
  }
}