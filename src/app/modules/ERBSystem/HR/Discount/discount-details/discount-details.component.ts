import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DiscountRule {
  label: string;
  value: string;
  badge?: boolean;
  badgeClass?: string;
}

export interface DiscountDetails {
  name: string;
  status: 'Active' | 'Disabled';
  createdOn: string;
  lastEditedBy: string;
  code: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
  value: string;
  appliesTo: string;
  rules: DiscountRule[];
  targetingDescription: string;
  includesCollections: string[];
  excludesProducts: string[];
}

export interface PerformanceData {
  totalSales: string;
  salesTrend: string;
  redemptions: number;
  usageLimit: number;
  discountAmount: string;
}

@Component({
  selector: 'app-discount-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './discount-details.component.html',
  styleUrl: './discount-details.component.scss',
})
export class DiscountDetailsComponent {

  navItems = [
    { icon: 'grid_view', label: 'Dashboard', active: false },
    { icon: 'trending_up', label: 'Sales Analysis', active: false },
    { icon: 'category', label: 'Categories', active: false },
    { icon: 'inventory_2', label: 'Products', active: false },
    { icon: 'percent', label: 'Discounts', active: true },
  ];

  discount: DiscountDetails = {
    name: 'Summer Sale 2024',
    status: 'Active',
    createdOn: 'Oct 24, 2023',
    lastEditedBy: 'Admin User',
    code: 'SUMMER20',
    description: 'Annual summer clearance event for all swimwear and beach accessories.',
    startDate: 'June 1, 2024 at 12:00 AM',
    endDate: 'August 31, 2024 at 11:59 PM',
    type: 'Percentage',
    value: '20%',
    appliesTo: 'Order Subtotal',
    rules: [
      {
        label: 'Minimum Requirement',
        value: 'Purchase amount of <span class="text-[#1e3b8a]">$50.00</span> or more',
      },
      {
        label: 'Usage Limit',
        value: 'Limited to <span class="text-[#1e3b8a]">5,000</span> total uses',
      },
      {
        label: 'Customer Limit',
        value: 'Limit of <span class="text-[#1e3b8a]">1</span> use per customer',
      },
      {
        label: 'Combination',
        value: 'Cannot combine with other discounts',
        badge: true,
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
      },
    ],
    targetingDescription: 'This discount applies to specific collections and excludes certain items.',
    includesCollections: ['Swimwear', 'Beach Accessories', 'Summer 2024'],
    excludesProducts: ['Digital Gift Cards', 'Clearance Items'],
  };

  performance: PerformanceData = {
    totalSales: '$45,200',
    salesTrend: '+12.5% vs last week',
    redemptions: 1402,
    usageLimit: 5000,
    discountAmount: '-$9,040',
  };

  chartPeriod = '30';

  chartBars = [20, 35, 45, 30, 55, 75, 65];

  get redemptionPercent(): number {
    return Math.round((this.performance.redemptions / this.performance.usageLimit) * 100);
  }

  duplicate(): void { alert('Duplicating discount...'); }

  toggleDisable(): void {
    this.discount.status = this.discount.status === 'Active' ? 'Disabled' : 'Active';
  }

  editDiscount(): void { alert('Opening edit form...'); }

  copyCode(): void {
    navigator.clipboard?.writeText(this.discount.code);
    alert(`Code "${this.discount.code}" copied!`);
  }

  viewFullReport(): void { alert('Opening full report...'); }

}
