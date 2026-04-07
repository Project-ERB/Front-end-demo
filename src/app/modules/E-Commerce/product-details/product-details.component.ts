import { ProductService } from './../../../core/services/products/product.service';
import { CategoriesService } from '../../../core/services/categories/categories.service';
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarECommerceComponent } from "../../../shared/UI/navbar-e-commerce/navbar-e-commerce.component";
import { forkJoin } from 'rxjs';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface ProductImage {
  url: string;
  alt: string;
}

interface ColorOption {
  name: string;
  value: string;
  hex: string;
}

interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, RouterModule, NavbarECommerceComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  productId: string | null = null;
  isLoading = true;
  loadError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoriesService: CategoriesService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      if (this.productId) {
        this.loadProductData(this.productId);
      }
    });
  }

  loadProductData(id: string): void {
    this.isLoading = true;
    this.loadError = '';

    forkJoin({
      product: this.productService.getProductById(id),
      categories: this.categoriesService.getCategories()
    }).subscribe({
      next: ({ product, categories }) => {
        const p = product?.data?.products?.nodes?.[0];
        if (!p) {
          this.loadError = 'Product not found.';
          this.isLoading = false;
          return;
        }

        const categoryName = categories
          ?.find((c: any) => c.id === p.categoryId)?.name ?? '—';

        this.product = {
          name: p.name ?? '—',
          tagline: p.shortDescription ?? '',
          description: this.sanitizer.bypassSecurityTrustHtml(marked(p.fullDescription ?? '') as string),
          productType: p.productType ?? '—',
          category: categoryName,
          rating: 5,
          reviewsCount: 0,
          currentPrice: p.sellingPrice ?? 0,
          originalPrice: p.costPrice ?? p.sellingPrice ?? 0,
          inStock: true,
          stockQuantity: 0,
          specifications: {
            material: p.specifications?.find((s: any) => s.key === 'Material')?.value ?? '—',
            dimensions: p.specifications?.find((s: any) => s.key === 'Dimensions')?.value ?? '—',
            weight: p.specifications?.find((s: any) => s.key === 'Weight')?.value ?? '—',
            color: p.specifications?.find((s: any) => s.key === 'Color')?.value ?? '—',
            warranty: p.specifications?.find((s: any) => s.key === 'Warranty')?.value ?? '—',
            assembly: p.specifications?.find((s: any) => s.key === 'Assembly')?.value ?? '—',
          }
        };

        if (p.imageUrl) {
          this.productImages = [{ url: p.imageUrl, alt: p.name }];
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.loadError = err?.message ?? 'Failed to load product.';
        this.isLoading = false;
      }
    });
  }

  product = {
    name: '',
    tagline: '',
    category: '',
    productType: '',
    description: '' as SafeHtml,
    rating: 5,
    reviewsCount: 0,
    currentPrice: 0,
    originalPrice: 0,
    inStock: true,
    stockQuantity: 0,
    specifications: {
      material: '—',
      dimensions: '—',
      weight: '—',
      color: '—',
      warranty: '—',
      assembly: '—',
    }
  };

  productImages: ProductImage[] = [
    {
      url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=800&fit=crop',
      alt: 'Product image'
    }
  ];

  selectedImageIndex = signal(0);
  selectedColor = signal('Charcoal Grey');
  quantity = signal(1);
  activeTab = signal<'description' | 'specifications' | 'reviews'>('description');

  selectedImage = computed(() => this.productImages[this.selectedImageIndex()]);

  colorOptions: ColorOption[] = [
    { name: 'Charcoal Grey', value: 'charcoal-grey', hex: '#36454F' },
    { name: 'Light Blue-Grey', value: 'light-blue-grey', hex: '#B0C4DE' },
    { name: 'Light Blue', value: 'light-blue', hex: '#87CEEB' }
  ];

  relatedProducts: RelatedProduct[] = [
    { id: 1, name: 'Adjustable Standing Desk', price: 599.00, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop' },
    { id: 2, name: 'LED Desk Lamp', price: 79.99, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop' },
    { id: 3, name: 'Ergonomic Mouse', price: 45.50, imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop' },
    { id: 4, name: 'Cable Management Tray', price: 29.00, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop' }
  ];

  get discountPercentage() {
    if (!this.product.originalPrice || this.product.originalPrice <= this.product.currentPrice) return 0;
    return Math.round(((this.product.originalPrice - this.product.currentPrice) / this.product.originalPrice) * 100);
  }

  selectImage(index: number) { this.selectedImageIndex.set(index); }
  selectColor(color: string) { this.selectedColor.set(color); }
  increaseQuantity() { this.quantity.update(q => q + 1); }
  decreaseQuantity() { if (this.quantity() > 1) this.quantity.update(q => q - 1); }
  setTab(tab: 'description' | 'specifications' | 'reviews') { this.activeTab.set(tab); }

  addToCart() {
    console.log('Added to cart:', {
      product: this.product.name,
      color: this.selectedColor(),
      quantity: this.quantity(),
      price: this.product.currentPrice
    });
  }

  addToWishlist() {
    console.log('Added to wishlist:', this.product.name);
  }

  navigateToProduct(productId: number) {
    this.router.navigate(['/product-management', productId]);
  }
}