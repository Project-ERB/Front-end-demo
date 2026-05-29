import { Component, OnInit } from '@angular/core';
import { SidebaSalesComponent } from "../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer, InvoiceService, Product } from '../../../../core/services/invoice/invoice.service';

import { 
  Invoice as InvoiceApi,
  InvoiceLine as InvoiceLineApi,
  InvoiceStatus as InvoiceStatusApi,    
 
} from '../../../../core/services/invoice/invoice.service';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Partial' | 'Cancelled';

export interface InvoiceLine {
  productId: string;
  productName: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  status: InvoiceStatus;
  amount: number;
  paid: number;
  remaining: number;
  expanded: boolean;
  selected: boolean;
  lines: InvoiceLine[];
}

@Component({
  selector: 'app-invoicemanagment',
  imports: [CommonModule, FormsModule, SidebaSalesComponent],
  templateUrl: './invoicemanagment.component.html',
  styleUrl: './invoicemanagment.component.scss',
})
export class InvoicemanagmentComponent implements OnInit {

  searchQuery = '';
  selectedDate = '';
  rowsPerPage = 10;
  currentPage = 1;
  totalInvoices = 0;
  loading = false;

  get totalPages(): number {
    return Math.ceil(this.totalInvoices / this.rowsPerPage);
  }

  navLinks = [
    { icon: 'shopping_cart', label: 'Orders', active: false },
    { icon: 'description', label: 'Invoices', active: true },
    { icon: 'payments', label: 'Payments', active: false },
    { icon: 'account_balance_wallet', label: 'Receivables', active: false },
  ];

  invoices: Invoice[] = [];

  constructor(private invoiceService: InvoiceService) { }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    const invoices$ = this.invoiceService.getInvoices();
    const customers$ = this.invoiceService.getCustomers();
    const products$ = this.invoiceService.getProducts();

    import('rxjs').then(({ forkJoin }) => {
      forkJoin({ invoices: invoices$, customers: customers$, products: products$ }).subscribe({
        next: ({ invoices, customers, products }) => {
          const customerMap = new Map<string, string>();
          (customers as Customer[]).forEach((c: Customer) => {
            if (c.id) customerMap.set(c.id, c.name);
          });

          const productMap = new Map<string, string>();
          (products as Product[]).forEach((p: Product) => {
            if (p.id) productMap.set(p.id, p.name);
          });

          this.invoices = (invoices as InvoiceApi[]).map((inv: InvoiceApi) =>
            this.transformToInvoice(inv, customerMap, productMap)
          );

          this.totalInvoices = this.invoices.length;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error loading data:', err);
          this.loading = false;
        }
      });
    });
  }

  private transformToInvoice(
    api: InvoiceApi,
    customerMap: Map<string, string>,
    productMap: Map<string, string>
  ): Invoice {
    return {
      id: api.id,
      invoiceNumber: api.invoiceNumber,
      customerId: api.customerId,
      customerName: customerMap.get(api.customerId) ?? api.customerId,
      date: this.formatDate(api.invoiceDate),
      status: this.mapStatus(api.status),
      amount: api.totalAmount,
      paid: api.paidAmount,
      remaining: api.remainingAmount,
      expanded: false,
      selected: false,
      lines: (api.lines ?? []).map((line: InvoiceLineApi) =>
        this.transformToLine(line, productMap)
      )
    };
  }

  private transformToLine(api: InvoiceLineApi, productMap: Map<string, string>): InvoiceLine {
    return {
      productId: api.productId,
      productName: productMap.get(api.productId) ?? api.productId,
      description: api.description,
      qty: api.quantity,
      unitPrice: api.unitPrice,
      total: api.lineTotal
    };
  }

  private mapStatus(apiStatus: InvoiceStatusApi): InvoiceStatus {
    const map: Record<string, InvoiceStatus> = {
      draft: 'Draft',
      unpaid: 'Sent',
      paid: 'Paid',
      overdue: 'Overdue',
      partial: 'Partial',
      cancelled: 'Cancelled'
    };
    return map[apiStatus] ?? 'Draft';
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

  get allSelected(): boolean {
    return this.filteredInvoices.length > 0 && this.filteredInvoices.every((i) => i.selected);
  }

  get filteredInvoices(): Invoice[] {
    if (!this.searchQuery.trim()) return this.invoices;
    const q = this.searchQuery.toLowerCase();
    return this.invoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerId.toLowerCase().includes(q) ||
        inv.amount.toString().includes(q)
    );
  }

  toggleAll(checked: boolean): void {
    this.filteredInvoices.forEach((i) => (i.selected = checked));
  }

  toggleExpand(invoice: Invoice): void {
    invoice.expanded = !invoice.expanded;
  }

  statusBadgeClasses(status: InvoiceStatus): string {
    switch (status) {
      case 'Draft': return 'bg-[#dee8ff] text-[#111c2d]';
      case 'Sent': return 'bg-[#6063ee] text-white';
      case 'Paid': return 'bg-[#4f46e5] text-[#dad7ff]';
      case 'Overdue': return 'bg-[#ffdad6] text-[#93000a]';
      case 'Partial': return 'bg-[#a44100] text-[#ffd2be]';
      case 'Cancelled': return 'bg-[#e5e7eb] text-[#464555]';
    }
  }

  isOverdue(invoice: Invoice): boolean {
    return invoice.status === 'Overdue';
  }

  formatCurrency(value: number): string {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  onRowsPerPageChange(value: string): void {
    this.rowsPerPage = Number(value);
    this.currentPage = 1;
  }

  maxOnPage(): number {
    return Math.min(this.currentPage * this.rowsPerPage, this.totalInvoices);
  }
}