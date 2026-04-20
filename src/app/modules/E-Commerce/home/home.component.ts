import { ProductService } from './../../../core/services/products/product.service';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarECommerceComponent } from '../../../shared/UI/navbar-e-commerce/navbar-e-commerce.component';
import { ProductCardComponent } from '../product-card/product-card.component';

import { ECommerceService } from '../../../core/services/e-commerce/e-commerce.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, NavbarECommerceComponent, ProductCardComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly _ECommerceService = inject(ECommerceService)
  private readonly _ToastrService = inject(ToastrService)
  private readonly _Router = inject(Router);

  products: any[] = [];
  isLoading = false;
  errorMessage = '';

  // Track which product is being added (to show loading on button)
  addingToCartSku: string | null = null;
  cartSuccessMessage = '';

  ngOnInit(): void {
    this.loadProducts();
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
        console.log('Added to cart:', res);
        this.cartSuccessMessage = `"${product.name}" added to cart!`;
        this.addingToCartSku = null;
        this._ToastrService.success(this.cartSuccessMessage);
        // Auto-hide success message after 3s
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
}