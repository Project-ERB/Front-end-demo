import { DiscountService } from './../../../../../core/services/Discount/discount.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebaSalesComponent } from "../../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component";
import { Router, RouterLink } from '@angular/router';

export type DiscountStatus = 'Active' | 'Scheduled' | 'Expired';

export interface Discount {
  id: string;
  code: string;
  campaign: string;
  typeIcon: string;
  typeLabel: string;
  value: string;
  validity: string;
  usage: number;
  status: DiscountStatus;
  selected: boolean;
  expired: boolean;
  rawDiscountType: number;
  rawStartDate: string | null;
  rawEndDate: string | null;
}

export interface EditDiscountForm {
  code: string;
  name: string;
  description: string;
  discountType: number;
  discountValueAmount: number;
  startDate: string;
  endDate: string;
  buyQuantity: number;
  getQuantity: number;
  getDiscountPercentage: number;
  currency: string;
  minimumPurchaseAmount: number;
  minimumQuantity: number;
  maximumDiscountAmount: number;
  canCombineWithOtherDiscounts: boolean;
  usageLimitPerCustomer: number;
  totalUsageLimit: number;
}

@Component({
  selector: 'app-discount-mangement',
  imports: [CommonModule, FormsModule, SidebaSalesComponent, RouterLink],
  templateUrl: './discount-mangement.component.html',
  styleUrl: './discount-mangement.component.scss',
})
export class DiscountMangementComponent implements OnInit {

  constructor(private router: Router, private discountService: DiscountService) { }

  isLoading = false;
  errorMessage = '';

  navItems = [
    { icon: 'grid_view', label: 'Dashboard', active: false },
    { icon: 'trending_up', label: 'Sales Analysis', active: false },
    { icon: 'category', label: 'Categories', active: false },
    { icon: 'inventory_2', label: 'Products', active: false },
    { icon: 'percent', label: 'Discounts', active: true },
  ];

  stats = [
    { label: 'Active Discounts', value: '0', icon: 'check_circle', iconBg: 'bg-green-50', iconColor: 'text-green-600', trend: '+2%', trendUp: true, trendNote: 'vs last month' },
    { label: 'Scheduled', value: '0', icon: 'schedule', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', trend: '0', trendUp: false, trendNote: 'New scheduled' },
    { label: 'Total Redeemed', value: '0', icon: 'redeem', iconBg: 'bg-orange-50', iconColor: 'text-orange-600', trend: '+12%', trendUp: true, trendNote: 'vs last month' },
    { label: 'Total Savings', value: '$0', icon: 'attach_money', iconBg: 'bg-purple-50', iconColor: 'text-purple-600', trend: '+8%', trendUp: true, trendNote: 'vs last month' },
  ];

  allDiscounts: Discount[] = [];
  copiedCode: string | null = null;

  copyCode(code: string): void {
    navigator.clipboard?.writeText(code).catch(() => { });
    this.copiedCode = code;
    setTimeout(() => this.copiedCode = null, 1500);
  }

  mapTypeIcon(discountType: string): string {
    const map: Record<string, string> = {
      PERCENTAGE: 'percent',
      FIXED_AMOUNT: 'attach_money',
      BUY_X_GET_Y: 'redeem',
    };
    return map[discountType] ?? 'local_offer';
  }

  mapTypeLabel(discountType: string): string {
    const map: Record<string, string> = {
      PERCENTAGE: 'Percentage',
      FIXED_AMOUNT: 'Fixed Amount',
      BUY_X_GET_Y: 'Buy X Get Y',
    };
    return map[discountType] ?? discountType;
  }

  mapTypeToNumber(discountType: string): number {
    const map: Record<string, number> = {
      PERCENTAGE: 0,
      FIXED_AMOUNT: 1,
      BUY_X_GET_Y: 2,
    };
    return map[discountType] ?? 0;
  }

  loadDiscounts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.discountService.GetDiscounts().subscribe({
      next: (res) => {
        const nodes = res?.data?.discounts?.nodes ?? [];
        this.allDiscounts = nodes.map((d: any) => ({
          id: d.id,
          code: d.code,
          campaign: d.name,
          typeIcon: this.mapTypeIcon(d.discountType),
          typeLabel: this.mapTypeLabel(d.discountType),
          value: d.value ?? '—',
          validity: d.startDate && d.endDate
            ? `${new Date(d.startDate).toLocaleDateString()} – ${new Date(d.endDate).toLocaleDateString()}`
            : 'Ongoing',
          usage: d.currentUsageCount ?? 0,
          status: this.mapStatus(d.status),
          selected: false,
          expired: d.status === 'EXPIRED',
          rawDiscountType: this.mapTypeToNumber(d.discountType),
          rawStartDate: d.startDate,
          rawEndDate: d.endDate,
        }));
        this.updateStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load discounts', err);
        this.errorMessage = 'Failed to load discounts. Please try again.';
        this.isLoading = false;
      },
    });
  }

  mapStatus(status: string): DiscountStatus {
    const map: Record<string, DiscountStatus> = {
      ACTIVE: 'Active',
      SCHEDULED: 'Scheduled',
      EXPIRED: 'Expired',
    };
    return map[status] ?? 'Scheduled';
  }

  updateStats(): void {
    const active = this.allDiscounts.filter(d => d.status === 'Active').length;
    const scheduled = this.allDiscounts.filter(d => d.status === 'Scheduled').length;
    const totalRedeemed = this.allDiscounts.reduce((sum, d) => sum + d.usage, 0);
    this.stats[0].value = active.toString();
    this.stats[1].value = scheduled.toString();
    this.stats[2].value = totalRedeemed.toLocaleString();
  }

  // ── Edit Modal ─────────────────────────────────────────────────────
  showEditModal = false;
  editingId = '';
  isSaving = false;
  saveError = '';
  editForm: EditDiscountForm = this.emptyForm();

  emptyForm(): EditDiscountForm {
    return {
      code: '', name: '', description: '',
      discountType: 0, discountValueAmount: 0,
      startDate: '', endDate: '',
      buyQuantity: 0, getQuantity: 0, getDiscountPercentage: 0,
      currency: 'USD',
      minimumPurchaseAmount: 0, minimumQuantity: 0,
      maximumDiscountAmount: 0,
      canCombineWithOtherDiscounts: false,
      usageLimitPerCustomer: 0, totalUsageLimit: 0,
    };
  }

  toInputDate(dateStr: string | null): string {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
  }

  openEditModal(d: Discount): void {
    this.editingId = d.id;
    this.saveError = '';
    this.editForm = {
      code: d.code,
      name: d.campaign,
      description: '',
      discountType: d.rawDiscountType,
      discountValueAmount: 0,
      startDate: this.toInputDate(d.rawStartDate),
      endDate: this.toInputDate(d.rawEndDate),
      buyQuantity: 0, getQuantity: 0, getDiscountPercentage: 0,
      currency: 'USD',
      minimumPurchaseAmount: 0, minimumQuantity: 0,
      maximumDiscountAmount: 0,
      canCombineWithOtherDiscounts: false,
      usageLimitPerCustomer: 0, totalUsageLimit: 0,
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingId = '';
    this.saveError = '';
  }

  saveEdit(): void {
    this.isSaving = true;
    this.saveError = '';
    const payload = {
      ...this.editForm,
      startDate: this.editForm.startDate ? new Date(this.editForm.startDate).toISOString() : new Date().toISOString(),
      endDate: this.editForm.endDate ? new Date(this.editForm.endDate).toISOString() : new Date().toISOString(),
      targets: [],
    };
    this.discountService.UpdateDiscount(this.editingId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeEditModal();
        this.loadDiscounts();
      },
      error: (err) => {
        console.error('Update failed', err);
        this.saveError = 'Failed to update discount. Please try again.';
        this.isSaving = false;
      },
    });
  }

  // ── Delete Modal ───────────────────────────────────────────────────
  showDeleteModal = false;
  deletingDiscount: Discount | null = null;
  isDeleting = false;
  deleteError = '';

  openDeleteModal(d: Discount): void {
    this.deletingDiscount = d;
    this.deleteError = '';
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingDiscount = null;
    this.deleteError = '';
  }

  confirmDelete(): void {
    if (!this.deletingDiscount) return;
    this.isDeleting = true;
    this.deleteError = '';

    this.discountService.DeleteDiscount(this.deletingDiscount.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.closeDeleteModal();
        this.loadDiscounts();
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.deleteError = 'Failed to delete discount. Please try again.';
        this.isDeleting = false;
      },
    });
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

  get allPageSelected(): boolean {
    return this.pagedDiscounts.length > 0 && this.pagedDiscounts.every(d => d.selected);
  }

  toggleAll(checked: boolean): void {
    this.pagedDiscounts.forEach(d => d.selected = checked);
  }

  get selectedCount(): number {
    return this.allDiscounts.filter(d => d.selected).length;
  }

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

  createDiscount(): void { this.router.navigate(['/create-discount']); }
  exportData(): void { alert('Exporting data…'); }
  editDiscount(d: Discount): void { this.openEditModal(d); }
  deleteDiscount(d: Discount): void { this.openDeleteModal(d); }

  ngOnInit(): void { this.loadDiscounts(); }
}