import { OrdersService } from './../../../../core/services/orders/orders.service';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebaSalesComponent } from "../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component";


export interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    initials?: string;
    avatarUrl?: string;
    avatarColor?: string;
  };
  date: string;
  total: number;
  payment: 'Paid' | 'Pending' | 'Failed';
  fulfillment: 'Unfulfilled' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  selected: boolean;
}

@Component({
  selector: 'app-orders',
  imports: [CommonModule, FormsModule, SidebaSalesComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit {

  private readonly _OrdersService = inject(OrdersService)

  searchQuery = '';
  selectAll = false;
  darkMode = false;
  isLoading = false;
  errorMessage = '';

  stats = [
    { label: 'Total Orders Today', value: '1,240', trend: '+12%', up: true },
    { label: 'Pending Fulfillment', value: '86', trend: '+5%', up: true },
    { label: 'Returns', value: '12', trend: '-2%', up: false },
    { label: 'Revenue', value: '$45.2k', trend: '+8%', up: true },
  ];

  orders: Order[] = [];

  ngOnInit(): void {
    this.loadOrders();
  }

  mockOrders: any[] = [];

  loadOrders(): void {
    this.isLoading = true;

    this._OrdersService.GetOrderDash().subscribe({
      next: (res) => {
        const nodes = res?.data?.orders?.nodes ?? [];

        // Use mock data if API returns empty (dev only)
        if (nodes.length === 0) {
          this.orders = this.mockOrders;
        } else {
          this.orders = nodes.map((node: any) => this.mapToOrder(node));
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load orders. Please try again.';
        this.isLoading = false;
      }
    });
  }
  private mapToOrder(node: any): Order {
    const name = node.customerId ?? 'Unknown';
    const initials = name.substring(0, 2).toUpperCase();

    return {
      id: node.orderNumber ?? '—',
      customer: {
        name: name,
        email: '',           // not in query — add if your API supports it
        initials: initials,
        avatarColor: 'bg-slate-200 text-slate-700',
      },
      date: node.orderDate ?? node.dueDate ?? '—',
      total: (node.grandTotal ?? 0) - (node.totalDiscount ?? 0),
      payment: this.mapPaymentStatus(node.status),
      fulfillment: this.mapFulfillmentStatus(node.orderType, node.status),
      selected: false,
    };
  }

  private mapPaymentStatus(status: string): Order['payment'] {
    const s = (status ?? '').toLowerCase();
    if (s.includes('paid') || s.includes('complete')) return 'Paid';
    if (s.includes('fail') || s.includes('cancel')) return 'Failed';
    return 'Pending';
  }

  private mapFulfillmentStatus(orderType: string, status: string): Order['fulfillment'] {
    const s = (status ?? '').toLowerCase();
    if (s.includes('cancel')) return 'Cancelled';
    if (s.includes('deliver')) return 'Delivered';
    if (s.includes('ship')) return 'Shipped';
    if (s.includes('process')) return 'Processing';
    return 'Unfulfilled';
  }

  // ── rest of your existing methods stay exactly the same ──

  get filteredOrders(): Order[] {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.orders;
    return this.orders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q)
    );
  }

  get selectedCount(): number { return this.orders.filter(o => o.selected).length; }

  toggleSelectAll(): void { this.orders.forEach(o => (o.selected = this.selectAll)); }
  toggleDarkMode(): void { this.darkMode = !this.darkMode; }

  paymentBadgeClass(status: string): string {
    const map: Record<string, string> = {
      Paid: 'bg-emerald-100 text-emerald-800',
      Pending: 'bg-slate-100 text-slate-800',
      Failed: 'bg-rose-100 text-rose-800',
    };
    return map[status] ?? 'bg-slate-100 text-slate-800';
  }

  fulfillmentBadgeClass(status: string): string {
    const map: Record<string, string> = {
      Unfulfilled: 'bg-amber-100 text-amber-800',
      Processing: 'bg-blue-100 text-blue-800',
      Shipped: 'bg-emerald-100 text-emerald-800',
      Delivered: 'bg-emerald-100 text-emerald-800',
      Cancelled: 'bg-slate-100 text-slate-800',
    };
    return map[status] ?? 'bg-slate-100 text-slate-800';
  }

  trendClass(up: boolean): string { return up ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'; }
  trendIcon(up: boolean): string { return up ? 'trending_up' : 'trending_down'; }
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
}