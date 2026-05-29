import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ECommerceSidebarComponent } from '../../../shared/UI/e-commerce-sidebar/e-commerce-sidebar.component';
import { ECommerceService } from '../../../core/services/e-commerce/e-commerce.service';


interface PaymentTransaction {
  amount: number;
  type: string;
  transactionDate: string;
  relatedTransactionId: string;
  method: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  currency: string;
  invoiceTotalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  transactions: PaymentTransaction[];
}

@Component({
  selector: 'app-my-payments',
  standalone: true,
  imports: [CommonModule, ECommerceSidebarComponent],
  templateUrl: './my-payments.component.html',
  styleUrl: './my-payments.component.scss',
})
export class MyPaymentsComponent implements OnInit {

  isMobileSidebarOpen = false;

  payments = signal<Payment[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  expandedPayments = signal<Set<string>>(new Set());
  activeFilter = signal<string>('all');

  readonly filters = ['all', 'paid', 'partial', 'unpaid'];

  constructor(private eCommerceService: ECommerceService) { }

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading.set(true);
    this.error.set(null);

    this.eCommerceService.getMyPayments().subscribe({
      next: (res) => {
        const data: Payment[] = res?.data?.myPayments?.nodes ?? [];
        this.payments.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load payments.');
        this.loading.set(false);
      }
    });
  }

  togglePayment(id: string): void {
    const next = new Set(this.expandedPayments());
    next.has(id) ? next.delete(id) : next.add(id);
    this.expandedPayments.set(next);
  }

  isExpanded(id: string): boolean {
    return this.expandedPayments().has(id);
  }

  setFilter(f: string): void {
    this.activeFilter.set(f);
  }

  getPaymentStatus(p: Payment): string {
    if (p.remainingAmount <= 0) return 'paid';
    if (p.totalPaid > 0) return 'partial';
    return 'unpaid';
  }

  filteredPayments(): Payment[] {
    const f = this.activeFilter();
    if (f === 'all') return this.payments();
    return this.payments().filter(p => this.getPaymentStatus(p) === f);
  }

  getPaidPercent(p: Payment): number {
    if (!p.invoiceTotalAmount) return 0;
    return Math.min(100, Math.round((p.totalPaid / p.invoiceTotalAmount) * 100));
  }

  getStatusClass(status: string): string {
    if (status === 'paid') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (status === 'partial') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  }

  getStatusDot(status: string): string {
    if (status === 'paid') return 'bg-emerald-400';
    if (status === 'partial') return 'bg-amber-400';
    return 'bg-rose-400';
  }

  getBarColor(percent: number): string {
    if (percent >= 100) return 'bg-emerald-500';
    if (percent >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  }

  getMethodIcon(method: string): string {
    const m = method?.toLowerCase();
    if (m === 'cash') return 'payments';
    if (m === 'card' || m === 'credit_card') return 'credit_card';
    if (m === 'bank' || m === 'transfer' || m === 'wire') return 'account_balance';
    if (m === 'cheque' || m === 'check') return 'receipt';
    return 'paid';
  }

  getTypeColor(type: string): string {
    const t = type?.toLowerCase();
    if (t === 'credit' || t === 'payment') return 'text-emerald-400';
    if (t === 'debit' || t === 'refund') return 'text-rose-400';
    return 'text-amber-400';
  }

  totalSummary() {
    const all = this.payments();
    return {
      count: all.length,
      totalInvoiced: all.reduce((s, p) => s + (p.invoiceTotalAmount ?? 0), 0),
      totalPaid: all.reduce((s, p) => s + (p.totalPaid ?? 0), 0),
      totalRemaining: all.reduce((s, p) => s + (p.remainingAmount ?? 0), 0),
    };
  }
}