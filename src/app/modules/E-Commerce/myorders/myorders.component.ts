import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Environment } from '../../../shared/UI/environment/env';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { RouterLink } from "@angular/router";
import { NavbarECommerceComponent } from "../../../shared/UI/navbar-e-commerce/navbar-e-commerce.component";
import { ECommerceSidebarComponent } from "../../../shared/UI/e-commerce-sidebar/e-commerce-sidebar.component";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineTax: number;
  lineTotal: number;
  reservations: {
    warehouseId: string;
    reservedQuantity: number;
  }[];
}

export interface Order {
  id: string;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  orderType: string;
  orderNumber: string;
  orderDate: string;
  dueDate: string;
  customerId: string;
  status: string;
  isShippingRequired: boolean;
  totalSubtotal: number;
  items: OrderItem[];
}

@Component({
  selector: 'app-myorders',
  imports: [CommonModule, RouterLink, NavbarECommerceComponent, ECommerceSidebarComponent],

  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('400ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('listStagger', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('60ms', [
            animate('350ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],

  templateUrl: './myorders.component.html',
  styleUrl: './myorders.component.scss',
})
export class MyordersComponent implements OnInit {

  private readonly http = inject(HttpClient);

  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  expandedOrderId: string | null = null;

  // Sidebar Control
  isMobileSidebarOpen = false;

  ngOnInit(): void {
    this.loadOrders();
  }

  // ─── Mobile Sidebar Methods ─────────────────────────────
  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.post<any>(`${Environment.baseUrl}/graphql`, {
      query: `
        query {
          orders {
            nodes {
              id
              totalDiscount
              totalTax
              grandTotal
              orderType
              orderNumber
              orderDate
              dueDate
              customerId
              status
              isShippingRequired
              items {
                reservations {
                  warehouseId
                  reservedQuantity
                }
                productId
                productName
                quantity
                unitPrice
                taxPercent
                lineSubtotal
                lineDiscount
                lineTax
                lineTotal
              }
              totalSubtotal
            }
          }
        }
      `
    }).subscribe({
      next: (res) => {
        this.orders = res?.data?.orders?.nodes ?? [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load orders. Please try again.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  toggleOrder(orderId: string): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  getStatusClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'delivered') return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
    if (s === 'pending') return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300';
    if (s === 'cancelled') return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300';
    if (s === 'processing') return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
  }

  getTotalGrand(): number {
    return this.orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  }

  getTotalDiscount(): number {
    return this.orders.reduce((sum, o) => sum + (o.totalDiscount || 0), 0);
  }

  getPendingCount(): number {
    return this.orders.filter(o => o.status?.toLowerCase() === 'pending').length;
  }

}