import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ECommerceService } from '../../../core/services/e-commerce/e-commerce.service';
import { ECommerceSidebarComponent } from '../../../shared/UI/e-commerce-sidebar/e-commerce-sidebar.component';
interface InvoiceLine {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  discountAmount: number;
  lineTotal: number;
}

interface Invoice {
  invoiceNumber: string;
  invoiceDate: string;
  status: string;
  defaultCurrency: string;
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  lines: InvoiceLine[];
}

@Component({
  selector: 'app-my-invoices',
  standalone: true,
  imports: [CommonModule, ECommerceSidebarComponent],
  templateUrl: './my-invoices.component.html',
  styleUrl: './my-invoices.component.scss',
})
export class MyInvoicesComponent implements OnInit {

  isMobileSidebarOpen = false;

  invoices = signal<Invoice[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  expandedInvoices = signal<Set<string>>(new Set());
  activeFilter = signal<string>('all');

  readonly filters = ['all', 'paid', 'unpaid', 'partial', 'overdue'];

  constructor(private eCommerceService: ECommerceService) { }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.error.set(null);

    this.eCommerceService.getMyInvoices().subscribe({
      next: (res) => {
        const data: Invoice[] = res?.data?.myInvoices?.nodes ?? [];
        this.invoices.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load invoices.');
        this.loading.set(false);
      }
    });
  }

  toggleInvoice(invoiceNumber: string): void {
    const current = this.expandedInvoices();
    const next = new Set(current);
    next.has(invoiceNumber) ? next.delete(invoiceNumber) : next.add(invoiceNumber);
    this.expandedInvoices.set(next);
  }

  isExpanded(invoiceNumber: string): boolean {
    return this.expandedInvoices().has(invoiceNumber);
  }

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  filteredInvoices(): Invoice[] {
    const f = this.activeFilter();
    if (f === 'all') return this.invoices();
    return this.invoices().filter(inv => inv.status?.toLowerCase() === f);
  }

  getPaidPercent(inv: Invoice): number {
    if (!inv.totalAmount) return 0;
    return Math.min(100, Math.round((inv.paidAmount / inv.totalAmount) * 100));
  }

  getStatusClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'paid') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s === 'partial') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (s === 'overdue') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }

  getStatusDot(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'paid') return 'bg-emerald-400';
    if (s === 'partial') return 'bg-amber-400';
    if (s === 'overdue') return 'bg-rose-400';
    return 'bg-slate-400';
  }

  getBarColor(percent: number): string {
    if (percent >= 100) return 'bg-emerald-500';
    if (percent >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  }

  totalSummary() {
    const all = this.invoices();
    return {
      total: all.reduce((s, i) => s + (i.totalAmount ?? 0), 0),
      paid: all.reduce((s, i) => s + (i.paidAmount ?? 0), 0),
      remaining: all.reduce((s, i) => s + (i.remainingAmount ?? 0), 0),
      count: all.length,
    };
  }
}