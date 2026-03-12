import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/products/product.service';
import { ApollocatoriesService } from '../../../../core/services/categories/apollocatories.service';
import { forkJoin } from 'rxjs';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { SidebaSalesComponent } from "../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component";
import { filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

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
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, SidebaSalesComponent],
  templateUrl: './product-mangement.component.html',
  styleUrl: './product-mangement.component.scss',
})
export class ProductMangementComponent implements OnInit {
  private readonly _Router = inject(Router);
  private readonly _ProductService = inject(ProductService);
  private readonly _ApollocatoriesService = inject(ApollocatoriesService);
  private readonly _ToastrService = inject(ToastrService)
  // ── Products & Categories ─────────────────────────────────────────
  products: any[] = [];
  productpage: any[] = [];
  categories: any[] = [];

  // ── Filters ───────────────────────────────────────────────────────
  searchQuery = '';
  selectedCategory = '';
  selectedType = '';

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

  onFilterChange(): void { this.currentPage = 1; }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedType = '';
    this.currentPage = 1;
  }

  deleteProduct(id: string): void {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this._ProductService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== id);
        this._ToastrService.success('Product deleted successfully', 'Deleted ✅');
      },
      error: () => {
        this._ToastrService.error('Failed to delete product', 'Error ❌');
      }
    });
  }

  // ── Row selection ─────────────────────────────────────────────────
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

  // ── Pagination ────────────────────────────────────────────────────
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

  // ── Helpers ───────────────────────────────────────────────────────
  formatPrice(price: number): string {
    return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  exportData(): void { alert('Exporting data…'); }

  // ── Data Loading ──────────────────────────────────────────────────
  ngOnInit(): void {
    // ✅ Reload products every time this page is navigated to
    this._Router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.loadProducts());

    // ✅ Also load on first init
    this.loadProducts();
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
          products
            .map((p: any) => p.categoryId)
            .filter((id: any) => id && !categoryLookup[id])
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
    this.products = products.map(p => ({
      ...p,
      categoryName: categoryLookup[p.categoryId] ?? 'No Category',
    }));
    this.productpage = [...this.products];
  }
}