import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebaSalesComponent } from "../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component";
import { PaymentService, Payment, PaymentTransaction, InvoiceRaw } from '../../../../core/services/payment/payment.service';
import { forkJoin } from 'rxjs';

export type PaymentMethod = 'Wire Transfer' | 'Credit Card' | 'ACH' | 'Check';
export type TransactionType = 'Credit' | 'Debit';

export interface Transaction {
  id: string;
  date: string;
  method: PaymentMethod;
  methodIcon: string;
  type: TransactionType;
  amount: number;
}

export interface PaymentGroup {
  groupId: string;
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  totalPaid: number;
  expanded: boolean;
  transactions: Transaction[];
}

export interface PaymentStat {
  icon: string;
  label: string;
  value: string;
  trendIcon: string;
  trendText: string;
  trendClass: string;
  highlighted?: boolean;
}

@Component({
  selector: 'app-paymentmanagment',
  imports: [CommonModule, FormsModule, SidebaSalesComponent],
  templateUrl: './paymentmanagment.component.html',
  styleUrl: './paymentmanagment.component.scss',
})
export class PaymentmanagmentComponent implements OnInit {

  searchQuery = '';
  currentPage = 1;
  totalEntries = 0;
  pageSize = 3;
  loading = false;

  isMobileSidebarOpen: boolean = false;

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  get totalPages(): number {
    return Math.ceil(this.totalEntries / this.pageSize);
  }

  navLinks = [
    { icon: 'shopping_cart', label: 'Orders', active: false },
    { icon: 'description', label: 'Invoices', active: false },
    { icon: 'payments', label: 'Payments', active: true },
    { icon: 'account_balance_wallet', label: 'Receivables', active: false },
  ];

  stats: PaymentStat[] = [
    {
      icon: 'account_balance',
      label: 'Total Received',
      value: '$1,245,000',
      trendIcon: 'trending_up',
      trendText: '+12.5% vs last month',
      trendClass: 'text-emerald-600',
    },
    {
      icon: 'pending_actions',
      label: 'Pending Settlement',
      value: '$342,500',
      trendIcon: 'schedule',
      trendText: '14 Invoices',
      trendClass: 'text-amber-600',
    },
    {
      icon: 'receipt_long',
      label: 'Avg Days to Pay',
      value: '18.4 Days',
      trendIcon: 'trending_down',
      trendText: '-2.1 days improvement',
      trendClass: 'text-emerald-600',
    },
    {
      icon: 'account_balance_wallet',
      label: 'Action Required',
      value: '3 Overdue',
      trendIcon: '',
      trendText: '',
      trendClass: '',
      highlighted: true,
    },
  ];

  groups: PaymentGroup[] = [];

  constructor(private paymentService: PaymentService) { }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    forkJoin({
      payments: this.paymentService.getPayments(),
      invoices: this.paymentService.getInvoices()
    }).subscribe({
      next: ({ payments, invoices }) => {
        const invoiceNumberMap = new Map<string, string>();
        (invoices as InvoiceRaw[]).forEach((inv: InvoiceRaw) => {
          if (inv.invoiceNumber) {
            invoiceNumberMap.set(inv.invoiceNumber, inv.invoiceNumber);
          }
        });

        this.groups = payments.map((payment: Payment, index: number) =>
          this.transformToGroup(payment, index, invoiceNumberMap, invoices as InvoiceRaw[])
        );

        this.totalEntries = this.groups.length;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading payment data:', err);
        this.loading = false;
      }
    });
  }

  private transformToGroup(
    payment: Payment,
    index: number,
    invoiceNumberMap: Map<string, string>,
    invoices: InvoiceRaw[]
  ): PaymentGroup {
    let invoiceNumber = invoiceNumberMap.get(payment.invoiceId);

    if (!invoiceNumber && invoices[index]?.invoiceNumber) {
      invoiceNumber = invoices[index].invoiceNumber;
    }

    if (!invoiceNumber) {
      invoiceNumber = payment.invoiceId;
    }

    return {
      groupId: payment.id || `GRP-${8842 + index}`,
      invoiceId: payment.invoiceId,
      invoiceNumber: invoiceNumber,
      totalAmount: payment.invoiceTotalAmount,
      totalPaid: payment.totalPaid,
      expanded: index === 0,
      transactions: payment.transactions.map((tx: PaymentTransaction, txIndex: number) =>
        this.transformToTransaction(tx, txIndex)
      )
    };
  }

  private transformToTransaction(tx: PaymentTransaction, index: number): Transaction {
    return {
      id: tx.id || `TX-${index}`,
      date: this.formatDate(tx.transactionDate),
      method: this.normalizeMethod(tx.method),
      methodIcon: this.getMethodIcon(tx.method),
      type: this.normalizeType(tx.type),
      amount: tx.amount
    };
  }

  private normalizeMethod(method: string): PaymentMethod {
    const validMethods: PaymentMethod[] = ['Wire Transfer', 'Credit Card', 'ACH', 'Check'];
    return validMethods.includes(method as PaymentMethod)
      ? (method as PaymentMethod)
      : 'Wire Transfer';
  }

  private normalizeType(type: string): TransactionType {
    return type === 'Debit' ? 'Debit' : 'Credit';
  }

  private getMethodIcon(method: string): string {
    const iconMap: { [key: string]: string } = {
      'Wire Transfer': 'account_balance',
      'Credit Card': 'credit_card',
      'ACH': 'payment',
      'Check': 'check',
    };
    return iconMap[method] || 'payment';
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  get filteredGroups(): PaymentGroup[] {
    if (!this.searchQuery.trim()) return this.groups;
    const q = this.searchQuery.toLowerCase();
    return this.groups.filter(
      (g) =>
        g.groupId.toLowerCase().includes(q) ||
        g.invoiceNumber.toLowerCase().includes(q) ||
        g.invoiceId.toLowerCase().includes(q)
    );
  }

  toggleGroup(group: PaymentGroup): void {
    group.expanded = !group.expanded;
  }

  remaining(group: PaymentGroup): number {
    return group.totalAmount - group.totalPaid;
  }

  settlementPct(group: PaymentGroup): number {
    if (group.totalAmount === 0) return 0;
    return Math.round((group.totalPaid / group.totalAmount) * 100);
  }

  progressBarColor(group: PaymentGroup): string {
    const pct = this.settlementPct(group);
    if (pct === 100) return 'bg-emerald-500';
    if (pct === 0) return 'bg-red-500';
    return 'bg-[#3525cd]';
  }

  remainingTextColor(group: PaymentGroup): string {
    const rem = this.remaining(group);
    if (rem === 0) return 'text-[#464555]';
    if (group.totalPaid === 0) return 'text-red-600 font-medium';
    return 'text-amber-600';
  }

  formatCurrency(value: number): string {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  goToPageSafe(p: number | string): void {
    if (typeof p === 'number') {
      this.goToPage(p);
    }
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (this.currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(total - 1, this.currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (this.currentPage < total - 2) {
        pages.push('...');
      }
      pages.push(total);
    }

    return pages;
  }

  maxOnPage(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalEntries);
  }
}