import { ProductService } from './../../../core/services/products/product.service';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarECommerceComponent } from '../../../shared/UI/navbar-e-commerce/navbar-e-commerce.component';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { ECommerceService } from '../../../core/services/e-commerce/e-commerce.service';
import { ToastrService } from 'ngx-toastr';
import { CategoriesService } from '../../../core/services/categories/categories.service';
import { ECommerceSidebarComponent } from "../../../shared/UI/e-commerce-sidebar/e-commerce-sidebar.component";

type SortField = 'name' | 'price' | null;
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, NavbarECommerceComponent, ECommerceSidebarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(18px)' }),
        animate('420ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('listStagger', [
      transition('* => *', [
        query(
          '.product-card',
          [
            style({ opacity: 0, transform: 'translateY(18px) scale(0.98)' }),
            stagger(80, [
              animate(
                '360ms cubic-bezier(0.22, 1, 0.36, 1)',
                style({ opacity: 1, transform: 'translateY(0) scale(1)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly _ECommerceService = inject(ECommerceService);
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _Router = inject(Router);

  products: any[] = [];
  allProducts: any[] = [];
  categories: any[] = [];

  selectedCategoryId: string | null = null;
  expandedCategoryId: string | null = null;
  isCategoriesLoading = true;
  isLoading = false;
  errorMessage = '';
  addingToCartSku: string | null = null;
  cartSuccessMessage = '';
  isMobileSidebarOpen = false;
  searchTerm = '';

  // ── Sort state ────────────────────────────────────────────
  sortField: SortField = null;
  sortDir: SortDir = 'asc';

  // ── Filter dropdown state ─────────────────────────────────
  isFilterOpen = false;

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  // ─── Filter Dropdown ──────────────────────────────────────
  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  closeFilter(): void {
    this.isFilterOpen = false;
  }

  // ─── Search ───────────────────────────────────────────────
  handleSearch(term: string): void {
    this.searchTerm = term.trim().toLowerCase();
    this.applyFilters();
  }

  // ─── Sort ─────────────────────────────────────────────────
  sortBy(field: SortField): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.applyFilters();
  }

  // ─── Core: filter + sort ──────────────────────────────────
  private applyFilters(): void {
    let result = [...this.allProducts];

    // 1. Search filter
    if (this.searchTerm) {
      result = result.filter(p =>
        p.name?.toLowerCase().includes(this.searchTerm) ||
        p.code?.toLowerCase().includes(this.searchTerm) ||
        p.variants?.[0]?.sku?.toLowerCase().includes(this.searchTerm)
      );
    }

    // 2. Sort
    if (this.sortField === 'name') {
      result.sort((a, b) => {
        const cmp = (a.name ?? '').localeCompare(b.name ?? '');
        return this.sortDir === 'asc' ? cmp : -cmp;
      });
    } else if (this.sortField === 'price') {
      result.sort((a, b) => {
        const cmp = (a.sellingPrice ?? 0) - (b.sellingPrice ?? 0);
        return this.sortDir === 'asc' ? cmp : -cmp;
      });
    }

    this.products = result;
  }

  // ─── Load all products ────────────────────────────────────
  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: (res) => {
        this.allProducts = res?.data?.products?.nodes ?? [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.errorMessage = 'Failed to load products. Please try again.';
        this.isLoading = false;
      },
    });
  }

  // ─── Load by category ─────────────────────────────────────
  loadProductsByCategory(categoryId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this._CategoriesService.getProductsByCategory(categoryId).subscribe({
      next: (products) => {
        this.allProducts = products;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products by category:', err);
        this.errorMessage = 'Failed to load products. Please try again.';
        this.isLoading = false;
      },
    });
  }

  // ─── Cart ─────────────────────────────────────────────────
  addToCart(product: any, quantity: number = 1): void {
    const sku =
      product.variants?.[0]?.sku ||
      product.baseBarcode ||
      product.code;

    if (!sku) {
      console.warn('No SKU found for product:', product);
      return;
    }

    this.addingToCartSku = sku;
    this.cartSuccessMessage = '';

    this._ECommerceService.addToCart({ sku, quantity }).subscribe({
      next: () => {
        this.cartSuccessMessage = `"${product.name}" added to cart!`;
        this.addingToCartSku = null;
        this._ToastrService.success(this.cartSuccessMessage);
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        this.addingToCartSku = null;
        this._ToastrService.error('Failed to add to cart. Please try again.');
      },
    });
  }

  // ─── Navigation & UI ──────────────────────────────────────
  viewDetails(productId: string): void {
    this._Router.navigate(['/cart-details', productId]);
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId = categoryId;
    this.searchTerm = '';
    this.closeMobileSidebar();
    this.closeFilter(); // ← close filter dropdown after selection
    if (categoryId === null) {
      this.loadProducts();
    } else {
      this.loadProductsByCategory(categoryId);
    }
  }

  toggleExpand(categoryId: string, event: Event): void {
    event.stopPropagation();
    this.expandedCategoryId =
      this.expandedCategoryId === categoryId ? null : categoryId;
  }

  // ─── Categories ───────────────────────────────────────────
  // استبدل دالة loadCategories() الموجودة بالكود ده

  loadCategories(): void {
    this.isCategoriesLoading = true;

    this._CategoriesService.getCategories().subscribe({
      next: (parents) => {
        if (parents.length === 0) {
          this.categories = [];
          this.isCategoriesLoading = false;
          return;
        }

        // ✅ initialize كل parent بـ children فاضي وloadingChildren = true
        this.categories = parents.map(p => ({
          ...p,
          children: [],
          loadingChildren: true,
        }));

        let loaded = 0;
        const total = parents.length;

        parents.forEach((parent, index) => {
          this._CategoriesService.getChildCategories(parent.id).subscribe({
            next: (children) => {
              // ✅ استخدم spread جديد عشان Angular يلاحق التغيير
              this.categories = this.categories.map((cat, i) =>
                i === index ? { ...cat, children, loadingChildren: false } : cat
              );
              loaded++;
              if (loaded === total) this.isCategoriesLoading = false;
            },
            error: () => {
              this.categories = this.categories.map((cat, i) =>
                i === index ? { ...cat, children: [], loadingChildren: false } : cat
              );
              loaded++;
              if (loaded === total) this.isCategoriesLoading = false;
            },
          });
        });
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.isCategoriesLoading = false;
      },
    });
  }
}