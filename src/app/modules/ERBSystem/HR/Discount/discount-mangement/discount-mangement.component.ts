import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type DiscountStatus = 'Active' | 'Scheduled' | 'Expired';
export type DiscountType = 'percent' | 'fixed';

export interface Discount {
  id: string;
  code: string;
  campaign: string;
  typeIcon: string;
  typeLabel: string;
  validity: string;
  usage: number;
  status: DiscountStatus;
  selected: boolean;
  expired: boolean;
}

@Component({
  selector: 'app-discount-mangement',
  imports: [CommonModule, FormsModule],
  templateUrl: './discount-mangement.component.html',
  styleUrl: './discount-mangement.component.scss',
})
export class DiscountMangementComponent implements OnInit {

  // ── Sidebar ────────────────────────────────────────────────────────
  navItems = [
    { icon: 'grid_view', label: 'Dashboard', active: false },
    { icon: 'trending_up', label: 'Sales Analysis', active: false },
    { icon: 'category', label: 'Categories', active: false },
    { icon: 'inventory_2', label: 'Products', active: false },
    { icon: 'percent', label: 'Discounts', active: true },
  ];

  // ── Stats ──────────────────────────────────────────────────────────
  stats = [
    { label: 'Active Discounts', value: '24', icon: 'check_circle', iconBg: 'bg-green-50', iconColor: 'text-green-600', trend: '+2%', trendUp: true, trendNote: 'vs last month' },
    { label: 'Scheduled', value: '8', icon: 'schedule', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', trend: '0', trendUp: false, trendNote: 'New scheduled' },
    { label: 'Total Redeemed', value: '12,450', icon: 'redeem', iconBg: 'bg-orange-50', iconColor: 'text-orange-600', trend: '+12%', trendUp: true, trendNote: 'vs last month' },
    { label: 'Total Savings', value: '$45.2k', icon: 'attach_money', iconBg: 'bg-purple-50', iconColor: 'text-purple-600', trend: '+8%', trendUp: true, trendNote: 'vs last month' },
  ];

  // ── Discount data ──────────────────────────────────────────────────
  allDiscounts: Discount[] = [
    { id: '1', code: 'SUMMER2024', campaign: 'Summer Sale Main', typeIcon: 'percent', typeLabel: '20% Off', validity: 'Jun 1 – Aug 31, 2024', usage: 4231, status: 'Active', selected: false, expired: false },
    { id: '2', code: 'WELCOME10', campaign: 'New User Acquisition', typeIcon: 'attach_money', typeLabel: '$10.00 Fixed', validity: 'Ongoing', usage: 856, status: 'Active', selected: false, expired: false },
    { id: '3', code: 'FLASH50', campaign: '24hr Flash Sale', typeIcon: 'percent', typeLabel: '50% Off', validity: 'Sep 15, 2024 (24h)', usage: 0, status: 'Scheduled', selected: false, expired: false },
    { id: '4', code: 'WINTER23', campaign: 'End of Season Clearance', typeIcon: 'percent', typeLabel: '40% Off', validity: 'Jan 1 – Feb 28, 2024', usage: 12105, status: 'Expired', selected: false, expired: true },
    { id: '5', code: 'VIPONLY', campaign: 'Loyalty Rewards Tier 1', typeIcon: 'attach_money', typeLabel: '$25.00 Fixed', validity: 'Ongoing', usage: 342, status: 'Active', selected: false, expired: false },
    { id: '6', code: 'BFRIDAY', campaign: 'Black Friday Mega Sale', typeIcon: 'percent', typeLabel: '30% Off', validity: 'Nov 24 – Nov 27, 2024', usage: 890, status: 'Scheduled', selected: false, expired: false },
    { id: '7', code: 'REFER20', campaign: 'Referral Program', typeIcon: 'attach_money', typeLabel: '$20.00 Fixed', validity: 'Ongoing', usage: 231, status: 'Active', selected: false, expired: false },
    { id: '8', code: 'SPRING15', campaign: 'Spring Collection Launch', typeIcon: 'percent', typeLabel: '15% Off', validity: 'Mar 1 – May 31, 2024', usage: 3420, status: 'Expired', selected: false, expired: true },
    { id: '9', code: 'LOYALTY5', campaign: 'Loyalty Rewards Tier 2', typeIcon: 'percent', typeLabel: '5% Off', validity: 'Ongoing', usage: 1120, status: 'Active', selected: false, expired: false },
    { id: '10', code: 'CLEAROUT', campaign: 'Warehouse Clearance', typeIcon: 'attach_money', typeLabel: '$15.00 Fixed', validity: 'Oct 1 – Oct 14, 2024', usage: 0, status: 'Scheduled', selected: false, expired: false },
  ];

  copiedCode: string | null = null;

  copyCode(code: string): void {
    navigator.clipboard?.writeText(code).catch(() => { });
    this.copiedCode = code;
    setTimeout(() => this.copiedCode = null, 1500);
  }

  // ── Filters ────────────────────────────────────────────────────────
  searchQuery = '';
  selectedStatus = '';
  selectedTarget = '';

  get activeFilterCount(): number {
    return [this.searchQuery, this.selectedStatus, this.selectedTarget].filter(Boolean).length;
  }

  get filteredDiscounts(): Discount[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.allDiscounts.filter(d => {
      const matchQ = !q || d.code.toLowerCase().includes(q) || d.campaign.toLowerCase().includes(q) || d.typeLabel.toLowerCase().includes(q);
      const matchSt = !this.selectedStatus || d.status === this.selectedStatus;
      return matchQ && matchSt;
    });
  }

  onFilterChange(): void { this.currentPage = 1; }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedTarget = '';
    this.currentPage = 1;
  }

  // ── Selection ──────────────────────────────────────────────────────
  get allPageSelected(): boolean {
    return this.pagedDiscounts.length > 0 && this.pagedDiscounts.every(d => d.selected);
  }

  toggleAll(checked: boolean): void {
    this.pagedDiscounts.forEach(d => d.selected = checked);
  }

  get selectedCount(): number {
    return this.allDiscounts.filter(d => d.selected).length;
  }

  // ── Pagination ──────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 5;

  get totalItems(): number { return this.filteredDiscounts.length; }
  get totalPages(): number { return Math.ceil(this.totalItems / this.pageSize) || 1; }
  get showingFrom(): number { return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get showingTo(): number { return Math.min(this.currentPage * this.pageSize, this.totalItems); }

  get pagedDiscounts(): Discount[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDiscounts.slice(start, start + this.pageSize);
  }

  get pageNumbers(): (number | '...')[] {
    const total = this.totalPages, cur = this.currentPage;
    const pages: (number | '...')[] = [];
    if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i); return pages; }
    pages.push(1);
    if (cur > 3) pages.push('...');
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
    if (cur < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  }

  goToPage(p: number | '...'): void { if (p !== '...') this.currentPage = p as number; }
  prevPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ── Status helpers ─────────────────────────────────────────────────
  statusClass(status: DiscountStatus): string {
    return {
      Active: 'bg-green-50 text-green-700 ring-green-600/20',
      Scheduled: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      Expired: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    }[status];
  }

  statusDotClass(status: DiscountStatus): string {
    return { Active: 'bg-green-600', Scheduled: 'bg-blue-600', Expired: 'bg-slate-500' }[status];
  }

  // ── Actions ────────────────────────────────────────────────────────
  createDiscount(): void { alert('Open Create Discount form'); }
  exportData(): void { alert('Exporting data…'); }
  moreActions(d: Discount): void { alert(`Actions for: ${d.code}`); }

  ngOnInit(): void { }

}
