import { ApollocatoriesService } from './../../../../../core/services/categories/apollocatories.service';
import { ProductService } from './../../../../../core/services/products/product.service';
import { SidebaSalesComponent } from './../../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, SidebaSalesComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  private readonly _Route = inject(ActivatedRoute);
  private readonly _Router = inject(Router);
  private readonly _ProductService = inject(ProductService);
  private readonly _ApollocatoriesService = inject(ApollocatoriesService);
  private readonly _ToastrService = inject(ToastrService);

  product: any = null;
  isLoading = true;

  // ── Tabs ──────────────────────────────────────────────────────────
  activeTab = 'general';

  tabs = [
    { key: 'general', label: 'General', icon: 'info' },
    // { key: 'pricing', label: 'Pricing', icon: 'sell' },
    // { key: 'attributes', label: 'Attributes', icon: 'tune' },
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────
  ngOnInit(): void {
    const id = this._Route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    } else {
      this.isLoading = false;
    }
  }

  loadProduct(id: string): void {
    this.isLoading = true;

    this._ProductService.getProductById(id).subscribe({
      next: (res: any) => {
        const p = res?.data?.products?.nodes?.[0] ?? null;  // ← أول نود بعد الفلترة

        if (!p) {
          this.isLoading = false;
          return;
        }

        if (p.categoryId) {
          this._ApollocatoriesService.getCategoryById(p.categoryId).subscribe({
            next: (catRes: any) => {
              const cat = catRes?.data?.category;
              this.product = { ...p, categoryName: cat?.name ?? 'No Category' };
              this.isLoading = false;
            },
            error: () => {
              this.product = { ...p, categoryName: 'No Category' };
              this.isLoading = false;
            }
          });
        } else {
          this.product = { ...p, categoryName: 'No Category' };
          this.isLoading = false;
        }
      },
      error: () => {
        this._ToastrService.error('Failed to load product', 'Error ❌');
        this.isLoading = false;
      }
    });
  }

  // ── Actions ───────────────────────────────────────────────────────
  editProduct(): void {
    this._Router.navigate(['/Edite-Produect', this.product.id]);
  }

  deleteProduct(): void {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this._ProductService.deleteProduct(this.product.id).subscribe({
      next: () => {
        this._ToastrService.success('Product deleted successfully', 'Deleted ✅');
        this._Router.navigate(['/product-management']);
      },
      error: () => {
        this._ToastrService.error('Failed to delete product', 'Error ❌');
      }
    });
  }

  goBack(): void {
    this._Router.navigate(['/product-management']);
  }

  // ── Helpers ───────────────────────────────────────────────────────
  calcMargin(selling: number, purchase: number): string {
    if (!purchase || purchase === 0) return '0';
    return (((selling - purchase) / selling) * 100).toFixed(1);
  }

  getImageUrl(imageUrl: string | null): string | null {
    if (!imageUrl) return null;
    return imageUrl.startsWith('http') ? imageUrl : 'https://erplocal.runasp.net/' + imageUrl;
  }
}