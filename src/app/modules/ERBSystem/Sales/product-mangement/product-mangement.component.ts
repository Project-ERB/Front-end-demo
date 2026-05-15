import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/products/product.service';
import { ApollocatoriesService } from '../../../../core/services/categories/apollocatories.service';
import { forkJoin } from 'rxjs';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { SidebaSalesComponent } from "../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component";
import { filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  categoryId: string;
}

@Component({
  selector: 'app-product-mangement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, SidebaSalesComponent],
  templateUrl: './product-mangement.component.html',
  styleUrl: './product-mangement.component.scss',
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('400ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('staggerRows', [
      transition('* => *', [
        query(
          '.prod-row',
          [
            style({ opacity: 0, transform: 'translateX(-10px)' }),
            stagger(40, [animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('modalIn', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('confirmIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('toastIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px) scale(0.95)' }),
        animate('350ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
  ],
})
export class ProductMangementComponent implements OnInit, OnDestroy {

  private readonly _Router = inject(Router);
  private readonly _ProductService = inject(ProductService);
  private readonly _ApollocatoriesService = inject(ApollocatoriesService);
  private readonly _ToastrService = inject(ToastrService);

  // ── Mobile Sidebar ──
  isMobileSidebarOpen = false;

  // ── Products & Categories ──
  products: any[] = [];
  categories: any[] = [];

  // ── Hover & Toast ──
  hoveredProdId: string | null = null;
  showToastMsg = false;
  toastText = '';
  toastIcon = 'check_circle';
  toastColor = 'text-emerald-400';
  private toastTimer: any;

  // ── Delete Confirm ──
  showDeleteConfirm = false;
  deleteTarget: any = null;
  deleteMessage = '';

  // ── Filters ──
  searchQuery = '';
  selectedCategory = '';
  selectedType = '';
  isMobileFilterOpen = false;

  get availableCategories(): string[] {
    return [...new Set(this.products.map((p: any) => p.categoryName))].sort();
  }

  get activeFilterCount(): number {
    return [this.searchQuery, this.selectedCategory, this.selectedType].filter(Boolean).length;
  }

  get filteredProducts(): any[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.products.filter(p => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q);
      const matchCat = !this.selectedCategory || p.categoryName === this.selectedCategory;
      const matchTyp = !this.selectedType || p.productType === this.selectedType;
      return matchQ && matchCat && matchTyp;
    });
  }

  EditProduct(id: string): void {
    this._Router.navigate(['/Edite-Produect', id]);
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedType = '';
    this.currentPage = 1;
    this.isMobileFilterOpen = false;
  }

  toggleMobileFilter(): void {
    this.isMobileFilterOpen = !this.isMobileFilterOpen;
  }

  deleteProduct(product: any): void {
    this.deleteTarget = product;
    this.deleteMessage = `Are you sure you want to delete "${product.name}"?`;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.showDeleteConfirm = false;

    this._ProductService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== id);
        this.selectedIds.delete(id);
        this.showToast(`"${this.deleteTarget.name}" has been deleted`, 'delete', 'text-red-400');
        this.deleteTarget = null;
      },
      error: () => {
        this.showToast('Failed to delete product', 'error', 'text-red-400');
        this.deleteTarget = null;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  viewProduct(id: string): void {
    this._Router.navigate(['/product-details', id]);
  }

  // ── Row selection ──
  selectedIds = new Set<string>();

  get selectedCount(): number { return this.selectedIds.size; }

  get allSelected(): boolean {
    return this.pagedProducts.length > 0
      && this.pagedProducts.every((p: any) => this.selectedIds.has(p.id));
  }

  toggleAll(checked: boolean): void {
    this.pagedProducts.forEach((p: any) =>
      checked ? this.selectedIds.add(p.id) : this.selectedIds.delete(p.id)
    );
  }

  toggleRow(id: string, checked: boolean): void {
    checked ? this.selectedIds.add(id) : this.selectedIds.delete(id);
  }

  toggleEnabled(product: any): void {
    product.enabled = !product.enabled;
  }

  // ── Pagination ──
  currentPage = 1;
  pageSize = 6;

  get totalItems(): number { return this.filteredProducts.length; }
  get totalPages(): number { return Math.ceil(this.totalItems / this.pageSize); }
  get showingFrom(): number { return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get showingTo(): number { return Math.min(this.currentPage * this.pageSize, this.totalItems); }

  get pagedProducts(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get pageNumbers(): (number | '...')[] {
    const pages: (number | '...')[] = [];
    const total = this.totalPages;
    const cur = this.currentPage;
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (cur > 3) pages.push('...');
      for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
      if (cur < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  goToPage(p: number | '...'): void {
    if (p === '...' || p === this.currentPage) return;
    this.currentPage = p as number;
  }

  previousPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ── Helpers ──
  formatPrice(price: number): string {
    return price?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? '$0';
  }

  getTypeClass(type: string): string {
    return type === 'SERVICE'
      ? 'bg-violet-50 text-violet-700 border border-violet-200'
      : 'bg-blue-50 text-blue-700 border border-blue-200';
  }

  getStockClass(product: any): string {
    if (!product.isTrackInventory) return 'bg-slate-100 text-slate-500 border border-slate-200';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }

  exportData(): void {
    this.showToast('Products exported to CSV', 'download', 'text-emerald-400');
  }

  // ── Data Loading ──
  ngOnInit(): void {
    this._Router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.loadProducts());
    this.loadProducts();
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
  }

  loadProducts(): void {
    forkJoin({
      productsRes: this._ProductService.getProducts(),
      categoriesRes: this._ApollocatoriesService.getApollocategories(),
    }).subscribe({
      next: ({ productsRes, categoriesRes }) => {
        const products: any[] = productsRes?.data?.products?.nodes ?? [];
        const categories: any[] = categoriesRes?.data?.parentCategories?.nodes ?? [];

        const categoryLookup: Record<string, string> = {};
        categories.forEach((c: any) => (categoryLookup[c.id] = c.name));

        this.categories = [...categories];

        const missingIds = [...new Set(
          products.map((p: any) => p.categoryId).filter((id: any) => id && !categoryLookup[id])
        )];

        if (missingIds.length === 0) {
          this.buildProducts(products, categoryLookup);
          return;
        }

        forkJoin(missingIds.map((id: any) => this._ApollocatoriesService.getCategoryById(id)))
          .subscribe((results: any[]) => {
            results.forEach(res => {
              const cat = res?.data?.category;
              if (cat) {
                categoryLookup[cat.id] = cat.name;
                if (!this.categories.find((c: any) => c.id === cat.id)) {
                  this.categories.push(cat);
                }
              }
            });
            this.buildProducts(products, categoryLookup);
          });
      },
    });
  }

  buildProducts(products: any[], categoryLookup: Record<string, string>): void {
    const baseUrl = 'https://erplocal.runasp.net/';
    this.products = products.map(p => ({
      ...p,
      categoryName: categoryLookup[p.categoryId] ?? 'No Category',
      imageUrl: p.imageUrl
        ? p.imageUrl.startsWith('http') ? p.imageUrl : baseUrl + p.imageUrl
        : null,
    }));
  }

  // ── Sidebar ──
  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  // ── Hover ──
  onRowHover(id: string | null): void {
    this.hoveredProdId = id;
  }

  // ── Toast ──
  showToast(message: string, icon: string = 'check_circle', color: string = 'text-emerald-400'): void {
    clearTimeout(this.toastTimer);
    this.toastText = message;
    this.toastIcon = icon;
    this.toastColor = color;
    this.showToastMsg = true;
    this.toastTimer = setTimeout(() => { this.showToastMsg = false; }, 2800);
  }

  // ── Keyboard ──
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const input = document.getElementById('prod-search-input');
      input?.focus();
    }
    if (event.key === 'Escape') {
      this.closeMobileSidebar();
      if (this.showDeleteConfirm) this.cancelDelete();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024) {
      this.isMobileSidebarOpen = false;
      this.isMobileFilterOpen = false;
    }
  }
}