import { ProductService } from './../../../core/services/products/product.service';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarECommerceComponent } from '../../../shared/UI/navbar-e-commerce/navbar-e-commerce.component';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

import { ECommerceService } from '../../../core/services/e-commerce/e-commerce.service';
import { ToastrService } from 'ngx-toastr';
import { CategoriesService } from '../../../core/services/categories/categories.service';
import { ECommerceSidebarComponent } from "../../../shared/UI/e-commerce-sidebar/e-commerce-sidebar.component";

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, NavbarECommerceComponent, RouterLink, ECommerceSidebarComponent],
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
  private readonly _CategoriesService = inject(CategoriesService); // ← أضف هذا
  private readonly _ToastrService = inject(ToastrService);
  private readonly _Router = inject(Router);

  products: any[] = [];
  categories: any[] = [];  // parents مع children مدموجين محلياً
  selectedCategoryId: string | null = null;
  expandedCategoryId: string | null = null;
  isCategoriesLoading = true;
  isLoading = false;
  errorMessage = '';
  addingToCartSku: string | null = null;
  cartSuccessMessage = '';
  isMobileSidebarOpen = false;


  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories()
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products = res?.data?.products?.nodes ?? [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.errorMessage = 'Failed to load products. Please try again.';
        this.isLoading = false;
      },
    });
  }

  addToCart(product: any, quantity: number = 1): void {
    // Use first variant SKU if available, otherwise use baseBarcode or product code
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
      next: (res) => {
        this.cartSuccessMessage = `"${product.name}" added to cart!`;
        this.addingToCartSku = null;
        this._ToastrService.success(this.cartSuccessMessage);

        // ✅ هنا المشكلة - لازم تاخد الداتا من GraphQL response
        this._ECommerceService.getCart().subscribe({
          next: (cartRes) => {
            const total = cartRes?.data?.cart?.items?.reduce(
              (sum: number, item: any) => sum + item.quantity, 0
            ) ?? 0;
            this._ECommerceService.updateCartCount(total);
          }
        });

        setTimeout(() => (this.cartSuccessMessage = ''), 3000);
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        this.addingToCartSku = null;
        this._ToastrService.error('Failed to add to cart. Please try again.');
      },
    });
  }

  viewDetails(productId: string): void {
    this._Router.navigate(['/cart-details', productId]);
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  loadCategories(): void {
    this.isCategoriesLoading = true;
    this._CategoriesService.getCategories().subscribe({
      next: (parents) => {
        // حمّل children لكل parent بالتوازي
        if (parents.length === 0) {
          this.categories = [];
          this.isCategoriesLoading = false;
          return;
        }

        let loaded = 0;
        this.categories = parents.map(p => ({ ...p, children: [], loadingChildren: true }));

        parents.forEach((parent, index) => {
          this._CategoriesService.getChildCategories(parent.id).subscribe({
            next: (children) => {
              this.categories[index] = { ...this.categories[index], children, loadingChildren: false };
              loaded++;
              if (loaded === parents.length) this.isCategoriesLoading = false;
            },
            error: () => {
              this.categories[index] = { ...this.categories[index], children: [], loadingChildren: false };
              loaded++;
              if (loaded === parents.length) this.isCategoriesLoading = false;
            }
          });
        });
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.isCategoriesLoading = false;
      }
    });
  }

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId = categoryId;
    this.closeMobileSidebar();
    if (categoryId === null) {
      this.loadProducts(); // كل المنتجات
    } else {
      this.loadProductsByCategory(categoryId);
    }
  }

  loadProductsByCategory(categoryId: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this._CategoriesService.getProductsByCategory(categoryId).subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products by category:', err);
        this.errorMessage = 'Failed to load products. Please try again.';
        this.isLoading = false;
      },
    });
  }

  toggleExpand(categoryId: string, event: Event): void {
    event.stopPropagation();
    this.expandedCategoryId = this.expandedCategoryId === categoryId ? null : categoryId;
  }
}