import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PayrollRecord {
  id: number;
  initials: string;
  highlightInitials: boolean;
  name: string;
  department: string;
  paymentDate: string;
  periodStart: string;
  periodEnd: string;
  basicSalary: number;
  bonus: number;
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
  imports: [CommonModule, FormsModule],
  templateUrl: './payroll-management.component.html',
  styleUrl: './payroll-management.component.scss',
})
export class PayrollManagementComponent {

  searchQuery = signal('');

  currentPage = signal(1);
  readonly pageSize = 5;
  readonly totalRecords = 42;

  readonly navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'group', label: 'Employees', active: false },
    { icon: 'payments', label: 'Payroll', active: true },
    { icon: 'volunteer_activism', label: 'Benefits', active: false },
    { icon: 'description', label: 'Reports', active: false },
    { icon: 'settings', label: 'Settings', active: false },
  ];

  readonly allRecords: PayrollRecord[] = [
    { id: 1, initials: 'JS', highlightInitials: true, name: 'Jordan Smith', department: 'Engineering', paymentDate: 'Oct 28, 2023', periodStart: 'Oct 01, 2023', periodEnd: 'Oct 31, 2023', basicSalary: 8500, bonus: 1200 },
    { id: 2, initials: 'AA', highlightInitials: false, name: 'Amara Akintola', department: 'Marketing', paymentDate: 'Oct 28, 2023', periodStart: 'Oct 01, 2023', periodEnd: 'Oct 31, 2023', basicSalary: 7200, bonus: 0 },
    { id: 3, initials: 'MK', highlightInitials: true, name: 'Marcus Kane', department: 'Sales', paymentDate: 'Oct 28, 2023', periodStart: 'Oct 01, 2023', periodEnd: 'Oct 31, 2023', basicSalary: 6800, bonus: 2450 },
    { id: 4, initials: 'EY', highlightInitials: false, name: 'Elena Yang', department: 'Product', paymentDate: 'Oct 28, 2023', periodStart: 'Oct 01, 2023', periodEnd: 'Oct 31, 2023', basicSalary: 9100, bonus: 500 },
    { id: 5, initials: 'DH', highlightInitials: true, name: 'David Hong', department: 'Engineering', paymentDate: 'Oct 28, 2023', periodStart: 'Oct 01, 2023', periodEnd: 'Oct 31, 2023', basicSalary: 7900, bonus: 0 },
  ];

  readonly summaryCards: SummaryCard[] = [
    { label: 'Total Monthly Payout', value: '$452,890.00', badge: '+4.2% vs last mo', badgeColor: 'green' },
    { label: 'Total Tax & Deductions', value: '$84,120.50', badge: '—', badgeColor: 'neutral' },
    { label: 'Active Employees Paid', value: '156 / 158', showBar: true, barPercent: 98.5 },
  ];

  readonly pages = [1, 2, 3, 9];

  filteredRecords = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.allRecords;
    return this.allRecords.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.id.toString().includes(q)
    );
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
    console.log('New record clicked');
  }

  clearFilters(): void {
    this.searchQuery.set('');
  }

  get showingText(): string {
    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage() * this.pageSize, this.totalRecords);
    return `Showing ${start} to ${end} of ${this.totalRecords} records`;
  }
}
