import { ECommerceService } from './../../../../core/services/e-commerce/e-commerce.service';
import { ProductService } from './../../../../core/services/products/product.service';
import { Component, signal, computed, OnInit, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavbarECommerceComponent } from "../../../../shared/UI/navbar-e-commerce/navbar-e-commerce.component";
import { ToastrService } from 'ngx-toastr';

interface ProductImage { url: string; alt: string; }
interface ColorOption { name: string; value: string; hex: string; }
interface RelatedProduct { id: string; name: string; price: number; imageUrl: string; }

@Component({
  selector: 'app-cart-details',
  imports: [CommonModule, RouterModule, NavbarECommerceComponent],
  templateUrl: './cart-details.component.html',
  styleUrl: './cart-details.component.scss',
})
export class CartDetailsComponent implements OnInit {

  productId: string | null = null;
  cartItemId: string = '';
  isLoading = true;
  loadError = '';
  addingToCartSku: string | null = null;
  cartSuccessMessage = '';
  productSku: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private sanitizer: DomSanitizer,
    private _eCommerceService: ECommerceService,
    private _ToastrService: ToastrService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      this.cartItemId = '';
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
      related: this.productService.getProducts()
    }).subscribe({
      next: ({ product, related }) => {
        const p = product?.data?.products?.nodes?.[0];
        if (!p) {
          this.loadError = 'Product not found.';
          this.isLoading = false;
          return;
        }

        // ✅ SKU
        this.productSku = p.variants?.[0]?.sku || p.baseBarcode || p.code || '';

        // ✅ Cart Item ID
        if (p.cartItemId) {
          this.cartItemId = p.cartItemId;
        }

        // ✅ Specifications - case-insensitive
        const getSpec = (key: string) =>
          p.specifications?.find(
            (s: any) => s.key?.toLowerCase() === key.toLowerCase()
          )?.value ?? '—';

        // ✅ Color options from variants.options
        this.colorOptions = (p.variants ?? []).map((v: any) => {
          const colorOption = v.options?.find(
            (o: any) => o.attributeName?.toLowerCase() === 'color'
          );
          return {
            name: colorOption?.value ?? v.sku,
            value: v.sku,
            hex: this.getColorHex(colorOption?.value ?? '')
          };
        });

        // ✅ Set default selected color
        if (this.colorOptions.length > 0) {
          this.selectedColor.set(this.colorOptions[0].name);
        }

        // ✅ Color spec from first variant
        const firstVariantColor = p.variants?.[0]?.options
          ?.find((o: any) => o.attributeName?.toLowerCase() === 'color')?.value ?? '—';

        // ✅ Full Description - handle null
        const descriptionHtml: SafeHtml = p.fullDescription
          ? this.sanitizer.bypassSecurityTrustHtml(marked(p.fullDescription) as string)
          : '';

        // ✅ Product Details
        this.product = {
          name: p.name ?? '—',
          tagline: p.shortDescription ?? '',
          description: descriptionHtml,
          hasDescription: !!p.fullDescription,
          productType: p.productType ?? '—',
          category: '—',
          rating: 5,
          reviewsCount: 0,
          currentPrice: p.sellingPrice ?? 0,
          originalPrice: p.costPrice ?? p.sellingPrice ?? 0,
          inStock: true,
          stockQuantity: 0,
          uomName: p.uomName ?? '—',
          currency: p.currency ?? 'EGP',
          taxRateName: p.taxRateName ?? '—',
          taxRateValue: p.taxRateValue ?? 0,
          specifications: {
            material: getSpec('material'),
            dimensions: getSpec('dimensions'),
            weight: getSpec('weight'),
            color: firstVariantColor,
            warranty: getSpec('warranty'),
            assembly: getSpec('assembly'),
          }
        };

        // ✅ Product Images
        this.productImages.set([{ url: p.imageUrl, alt: p.name }]);

        this.selectedImageIndex.set(0);

        console.log('Images:', this.productImages);
        console.log('Selected:', this.selectedImage());

        // ✅ Related Products
        const allProducts = related?.data?.products?.nodes ?? [];
        this.relatedProducts = allProducts
          .filter((item: any) => item.id !== id)
          .slice(0, 4)
          .map((item: any) => ({
            id: item.id,
            name: item.name ?? '—',
            price: item.sellingPrice ?? 0,
            imageUrl: item.imageUrl?.startsWith('http')
              ? item.imageUrl
              : `https://erplocal.runasp.net/${item.imageUrl}`
          }));

        this.isLoading = false;
      },
      error: (err) => {
        this.loadError = err?.message ?? 'Failed to load product.';
        this.isLoading = false;
      }
    });
  }

  private getColorHex(colorName: string): string {
    const colorMap: Record<string, string> = {
      'black': '#1a1a1a',
      'white': '#ffffff',
      'orange': '#FFA500',
      'blue': '#4A90D9',
      'red': '#E53E3E',
      'grey': '#6B7280',
      'gray': '#6B7280',
      'silver': '#C0C0C0',
      'green': '#22C55E',
      'yellow': '#EAB308',
      'purple': '#A855F7',
      'pink': '#EC4899',
    };
    return colorMap[colorName?.toLowerCase()] ?? '#94a3b8';
  }

  product: {
    name: string;
    tagline: string;
    category: string;
    productType: string;
    description: SafeHtml;
    hasDescription: boolean;
    rating: number;
    reviewsCount: number;
    currentPrice: number;
    originalPrice: number;
    inStock: boolean;
    stockQuantity: number;
    uomName: string;
    currency: string;
    taxRateName: string;
    taxRateValue: number;
    specifications: {
      material: string;
      dimensions: string;
      weight: string;
      color: string;
      warranty: string;
      assembly: string;
    };
  } = {
      name: '',
      tagline: '',
      category: '',
      productType: '',
      description: '',
      hasDescription: false,
      rating: 5,
      reviewsCount: 0,
      currentPrice: 0,
      originalPrice: 0,
      inStock: true,
      stockQuantity: 0,
      uomName: '—',
      currency: 'EGP',
      taxRateName: '—',
      taxRateValue: 0,
      specifications: {
        material: '—',
        dimensions: '—',
        weight: '—',
        color: '—',
        warranty: '—',
        assembly: '—',
      }
    };

  // غير الـ declaration
  productImages = signal<ProductImage[]>([]);

  selectedImageIndex = signal(0);
  selectedColor = signal('');
  quantity: WritableSignal<number> = signal(1);
  activeTab = signal<'description' | 'specifications' | 'reviews'>('description');
  selectedImage = computed(() => {
    const images = this.productImages(); // ✅ دلوقتي reactive
    if (!images || images.length === 0) return null;
    return images[this.selectedImageIndex()];
  });
  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) {
      return url; // ✅ صح - بترجعه زي ما هو
    }
    return `https://erplocal.runasp.net/${url}`;
  }



  colorOptions: ColorOption[] = [];
  relatedProducts: RelatedProduct[] = [];

  get discountPercentage() {
    if (!this.product.originalPrice || this.product.originalPrice <= this.product.currentPrice) return 0;
    return Math.round(((this.product.originalPrice - this.product.currentPrice) / this.product.originalPrice) * 100);
  }

  selectImage(index: number) { this.selectedImageIndex.set(index); }
  selectColor(color: string) { this.selectedColor.set(color); }
  setTab(tab: 'description' | 'specifications' | 'reviews') { this.activeTab.set(tab); }

  addToWishlist() {
    this._ToastrService.info(`${this.product.name} added to wishlist!`);
  }

  addToCart(product: any, quantity: number = 1): void {
    const sku = this.productSku;
    if (!sku) {
      this._ToastrService.error('Product SKU not found.');
      return;
    }
    this.addingToCartSku = sku;
    this._eCommerceService.addToCart({ sku, quantity }).subscribe({
      next: (res) => {
        this._eCommerceService.getCart().subscribe({
          next: (cartRes) => {
            const items = cartRes?.data?.cart?.items ?? [];
            const item = items.find((i: any) => i.sku === sku);
            if (item) {
              this.cartItemId = item.id;
            }
          },
          error: (err) => console.error('❌ getCart error:', err)
        });
        this.cartSuccessMessage = `"${this.product.name}" added to cart!`;
        this.addingToCartSku = null;
        this._ToastrService.success(this.cartSuccessMessage);
        setTimeout(() => (this.cartSuccessMessage = ''), 3000);
      },
      error: () => {
        this.addingToCartSku = null;
        this._ToastrService.error('Failed to add to cart. Please try again.');
      },
    });
  }

  increasequantity(cartItemId: string, qty: number) {
    if (!this.cartItemId) {
      this.quantity.update(q => q + 1);
      return;
    }
    this._eCommerceService.updateQuantity(this.cartItemId, qty + 1).subscribe({
      next: () => {
        this._ToastrService.success('Cart quantity updated!');
        this.quantity.update(q => q + 1);
      },
      error: () => this._ToastrService.error('Failed to update quantity.')
    });
  }

  decreasequantity(cartItemId: string, qty: number) {
    if (this.quantity() <= 1) return;
    if (!this.cartItemId) {
      this.quantity.update(q => q - 1);
      return;
    }
    this._eCommerceService.updateQuantity(this.cartItemId, qty - 1).subscribe({
      next: () => {
        this._ToastrService.success('Cart quantity updated!');
        this.quantity.update(q => q - 1);
      },
      error: () => this._ToastrService.error('Failed to update quantity.')
    });
  }

  navigateToProduct(productId: string) {
    this.router.navigate(['/cart-details', productId]);
  }

}