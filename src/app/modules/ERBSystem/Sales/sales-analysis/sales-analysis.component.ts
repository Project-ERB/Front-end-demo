import { SalesDashService } from './../../../../core/services/sales-dash/sales-dash.service';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebaSalesComponent } from '../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component';

export interface KpiCard {
  title: string;
  value: string;
  trend: number;
  isPositive: boolean;
  sparklinePath: string;
  sparklineFillPath: string;
}

export interface CategoryBar {
  name: string;
  percentage: number;
  value: string;
  colorClass: string;
  hoverClass: string;
}

export interface Product {
  name: string;
  sku: string;
  category: string;
  totalSold: string;
  revenue: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  imageUrl: string;
  imageAlt: string;
}

@Component({
  selector: 'app-sales-analysis',
  imports: [CommonModule, FormsModule, SidebaSalesComponent],
  templateUrl: './sales-analysis.component.html',
  styleUrl: './sales-analysis.component.scss',
})
export class SalesAnalysisComponent implements OnInit {

  private readonly _SalesDashService = inject(SalesDashService);

  // ─── State ────────────────────────────────────────────────────────────────
  isLoading = false;
  errorMessage = '';

  selectedPeriod = 'Last 30 Days';
  periods = ['Last 30 Days', 'Last 7 Days', 'Last Quarter', 'Year to Date'];

  navItems = [
    { icon: 'grid_view', label: 'Dashboard', active: false },
    { icon: 'trending_up', label: 'Sales Analysis', active: true },
    { icon: 'category', label: 'Categories', active: false },
    { icon: 'inventory_2', label: 'Products', active: false },
    { icon: 'percent', label: 'Discounts', active: false },
  ];

  kpiCards: KpiCard[] = [];
  categories: CategoryBar[] = [];
  allProducts: Product[] = [];

  // Filter state
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';

  // Pagination state
  currentPage = 1;
  pageSize = 5;

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadDashboard();
  }

  // ─── Period Change ────────────────────────────────────────────────────────
  onPeriodChange(): void {
    this.loadDashboard();
  }

  // ─── Data Loading ─────────────────────────────────────────────────────────
  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const { startDate, endDate } = this.getDateRange();

    this._SalesDashService.getSalesDashboard(startDate, endDate).subscribe({
      next: (res) => {
        const data = res?.data?.salesDashboard;
        if (data) {
          this.mapKpis(data.kpis);
          this.mapCategories(data.salesByCategory);
          this.mapProducts(data.topProducts);
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
      },
    });
  }

  // ─── Date Range Helper ────────────────────────────────────────────────────
  private getDateRange(): { startDate: string; endDate: string } {
    const end = new Date();
    end.setHours(23, 59, 59, 999); // ← include the full current day

    const start = new Date();
    start.setHours(0, 0, 0, 0); // ← start from beginning of the day

    switch (this.selectedPeriod) {
      case 'Last 7 Days':
        start.setDate(end.getDate() - 7);
        break;
      case 'Last Quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'Year to Date':
        start.setMonth(0, 1);
        break;
      default: // Last 30 Days
        start.setDate(end.getDate() - 30);
        break;
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }

  // ─── Mapping Helpers ──────────────────────────────────────────────────────
  private mapKpis(kpis: any): void {
    if (!kpis) return;

    const achievementPct = kpis.targetAchievementPercentage ?? 0;
    const metTarget = achievementPct >= 100;

    this.kpiCards = [
      {
        title: 'Total Revenue',
        value: this.formatCurrency(kpis.totalRevenue),
        trend: achievementPct,
        isPositive: metTarget,
        sparklinePath: 'M0 20 L10 15 L20 18 L30 10 L40 14 L50 8 L60 12 L70 5 L80 10 L90 4 L100 8',
        sparklineFillPath: 'M0 20 L10 15 L20 18 L30 10 L40 14 L50 8 L60 12 L70 5 L80 10 L90 4 L100 8 V 24 H 0 Z',
      },
      {
        title: 'Total Orders',
        value: kpis.totalOrders?.toLocaleString() ?? '0',
        trend: 0,
        isPositive: true,
        sparklinePath: 'M0 10 L10 8 L20 12 L30 5 L40 8 L50 15 L60 12 L70 18 L80 14 L90 20 L100 16',
        sparklineFillPath: 'M0 10 L10 8 L20 12 L30 5 L40 8 L50 15 L60 12 L70 18 L80 14 L90 20 L100 16 V 24 H 0 Z',
      },
      {
        title: 'Avg. Order Value',
        value: this.formatCurrency(kpis.averageOrderValue),
        trend: 0,
        isPositive: true,
        sparklinePath: 'M0 15 L15 15 L30 12 L45 10 L60 11 L75 8 L90 6 L100 5',
        sparklineFillPath: 'M0 15 L15 15 L30 12 L45 10 L60 11 L75 8 L90 6 L100 5 V 24 H 0 Z',
      },
      {
        title: 'Target',
        value: this.formatCurrency(kpis.targetAmount),
        trend: achievementPct,
        isPositive: metTarget,
        sparklinePath: 'M0 22 L10 20 L20 18 L30 14 L40 16 L50 10 L60 12 L70 6 L80 8 L90 4 L100 2',
        sparklineFillPath: 'M0 22 L10 20 L20 18 L30 14 L40 16 L50 10 L60 12 L70 6 L80 8 L90 4 L100 2 V 24 H 0 Z',
      },
      {
        title: 'Achievement',
        value: `${achievementPct.toFixed(1)}%`,
        trend: achievementPct,
        isPositive: metTarget,
        sparklinePath: 'M0 22 L10 18 L20 20 L30 14 L40 16 L50 10 L60 12 L70 6 L80 8 L90 4 L100 2',
        sparklineFillPath: 'M0 22 L10 18 L20 20 L30 14 L40 16 L50 10 L60 12 L70 6 L80 8 L90 4 L100 2 V 24 H 0 Z',
      },
    ];
  }

  private mapCategories(salesByCategory: any[]): void {
    if (!salesByCategory?.length) return;

    const maxRevenue = Math.max(...salesByCategory.map(c => c.revenue ?? 0));
    const colors = [
      { colorClass: 'bg-[#1e3b8a]', hoverClass: 'group-hover:bg-blue-800' },
      { colorClass: 'bg-blue-500', hoverClass: 'group-hover:bg-blue-600' },
      { colorClass: 'bg-blue-400', hoverClass: 'group-hover:bg-blue-500' },
      { colorClass: 'bg-blue-300', hoverClass: 'group-hover:bg-blue-400' },
      { colorClass: 'bg-blue-200', hoverClass: 'group-hover:bg-blue-300' },
    ];

    this.categories = salesByCategory.map((cat, i) => ({
      name: cat.categoryName,
      percentage: maxRevenue > 0 ? Math.round((cat.revenue / maxRevenue) * 100) : 0,
      value: this.formatCurrency(cat.revenue),
      colorClass: colors[i % colors.length].colorClass,
      hoverClass: colors[i % colors.length].hoverClass,
    }));
  }

  private mapProducts(topProducts: any[]): void {
    if (!topProducts?.length) return;

    this.allProducts = topProducts.map(p => ({
      name: p.productName,
      sku: p.productId,
      category: p.categoryName,
      totalSold: p.unitsSold?.toLocaleString() ?? '0',
      revenue: this.formatCurrency(p.revenue),
      status: this.mapStockStatus(p.stockStatus),
      imageUrl: `https://placehold.co/32x32/e2e8f0/64748b?text=${encodeURIComponent((p.productName as string)?.[0] ?? '?')}`,
      imageAlt: p.productName,
    }));

    this.currentPage = 1;
  }

  private mapStockStatus(status: string): 'In Stock' | 'Low Stock' | 'Out of Stock' {
    const s = (status ?? '').toLowerCase().replace(/_/g, ' ');
    if (s === 'low stock') return 'Low Stock';
    if (s === 'out of stock') return 'Out of Stock';
    return 'In Stock';
  }

  private formatCurrency(value: number): string {
    if (value == null || isNaN(value)) return '$0';
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
    return `$${value.toLocaleString()}`;
  }

  // ─── Filter Helpers ───────────────────────────────────────────────────────
  get availableCategories(): string[] {
    return [...new Set(this.allProducts.map(p => p.category))].sort();
  }

  get availableStatuses(): string[] {
    return ['In Stock', 'Low Stock', 'Out of Stock'];
  }

  get activeFilterCount(): number {
    return [this.searchQuery, this.selectedCategory, this.selectedStatus].filter(Boolean).length;
  }

  get filteredProducts(): Product[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.allProducts.filter(p => {
      const matchesSearch = !q
        || p.name.toLowerCase().includes(q)
        || p.sku.toLowerCase().includes(q)
        || p.category.toLowerCase().includes(q);
      const matchesCategory = !this.selectedCategory || p.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || p.status === this.selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.currentPage = 1;
  }

  // ─── Pagination ───────────────────────────────────────────────────────────
  get totalProducts(): number { return this.filteredProducts.length; }
  get totalPages(): number { return Math.ceil(this.totalProducts / this.pageSize); }

  get pagedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get showingFrom(): number {
    return this.totalProducts === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalProducts);
  }

  get pageNumbers(): (number | '...')[] {
    const pages: (number | '...')[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  goToPage(page: number | '...'): void {
    if (page === '...' || page === this.currentPage) return;
    this.currentPage = page as number;
  }

  previousPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ─── Misc ─────────────────────────────────────────────────────────────────
  getStatusClass(status: string): string {
    switch (status) {
      case 'In Stock': return 'bg-green-50 text-green-700';
      case 'Low Stock': return 'bg-yellow-50 text-yellow-700';
      case 'Out of Stock': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  }

  exportReport(): void {
    alert('Exporting report...');
  }
}