import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoriesService } from '../../../../core/services/categories/categories.service';
import { ApollocatoriesService } from '../../../../core/services/categories/apollocatories.service';

export interface SubCategory {
  label: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  count: number;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  subCategory: string;
  sku: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  imageUrl: string;
  imageAlt: string;
}


@Component({
  selector: 'app-category-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.scss',
})
export class CategoryDetailComponent {

  private readonly _formBuilder = inject(FormBuilder)

  categoryform: FormGroup = this._formBuilder.group({
    name: [null],
    code: [null],
    description: [null]
  })

  categoreis: any;

  private _CategoriesService = inject(CategoriesService);



  userId!: string;
  private route = inject(ActivatedRoute);

  private readonly _categoriesService = inject(CategoriesService);

  constructor() { }

  // ── Sidebar (same as previous components) ─────────────────────────
  navItems = [
    { icon: 'grid_view', label: 'Dashboard', active: false },
    { icon: 'trending_up', label: 'Sales Analysis', active: false },
    { icon: 'category', label: 'Categories', active: true },
    { icon: 'inventory_2', label: 'Products', active: false },
    { icon: 'percent', label: 'Discounts', active: false },
  ];

  // ── Category meta ─────────────────────────────────────────────────
  category = {
    name: 'Electronics',
    code: 'CAT-EL-001',
    icon: 'devices',
    status: 'Active' as 'Active' | 'Draft' | 'Archived',
    description: `A comprehensive collection of electronic devices and accessories tailored for both
      consumer and enterprise markets. This category encompasses major sub-verticals including mobile
      computing, home entertainment, and smart office solutions. Items in this category are subject to
      quarterly inventory audits and follow standard warranty protocols.`,
    createdBy: {
      name: 'Sarah Jenkins',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD81A89v3FJwqEUo7-II7wkPXTCWEdIY4uopk3fzfYhYck3McazExkmkFh63viJ-cYKRmuJ3IDGcwpTBGaD9lutx3rEqBm3lf56h8VEDgf_8BCAtsA_RG9DOidkIh8hgtn6y_5Yshe4j23nI7YX3NhwXCAv87X6djWOMF6Imy7GjBS1hE4_UvvYpZuSfBDnzcFOgHP1nqRWJXKNapPc066G_QadJyWbCR88PzmlGZqx7QG9mMbow3zsazOmLGRHjPc-_WSwxC3-8kJY',
    },
    lastUpdated: 'Oct 24, 2023',
    totalSkus: '1,420 Items',
  };

  // ── Sub-categories ────────────────────────────────────────────────
  subCategories: SubCategory[] = [
    {
      label: 'Smartphones',
      icon: 'smartphone',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      count: 240,
      description: 'iOS, Android, and feature phones',
    },
    {
      label: 'Laptops & PC',
      icon: 'laptop_mac',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      count: 115,
      description: 'Workstations, gaming rigs, and ultrabooks',
    },
    {
      label: 'Audio',
      icon: 'headphones',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      count: 86,
      description: 'Headphones, speakers, and microphones',
    },
  ];

  // ── Related products ──────────────────────────────────────────────
  allProducts: Product[] = [
    {
      id: '1',
      name: 'Apex Smart Watch Gen 5',
      subCategory: 'Electronics > Wearables',
      sku: 'SW-GEN5-BLK',
      price: 299.00,
      stock: 142,
      status: 'In Stock',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDG7oM33_2NjSwCvjR-MR-1kqU7tdp3kYQPd47d25oiIDxrQWGArGjNq8o3z1_fYfRLi1ZLCmhqEaipGL_AnIWsTY2_FMNT8Lrb21M2zreo1EvNnnMoVhGwglIZkHbdY92_VeJyKTIqDXdls6zo_tAQKC6LRSwLaFWI3SbU2p6Z4Co6l61PCxlWqcloAFpKsgX7kBW3AdmNMxPQcYYBjdgoGWnHguVc4QdqiLFU2T6PGQPfQMIclieC_yy21v63KDWQL7622g70SE3Y',
      imageAlt: 'Smart Watch',
    },
    {
      id: '2',
      name: 'SonicBoom Wireless Pro',
      subCategory: 'Electronics > Audio',
      sku: 'HD-SONIC-PRO',
      price: 349.50,
      stock: 8,
      status: 'Low Stock',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUEEQH4EDVHzX3Fy_BOuVTaCxpQ_bwuelRymbaMOrz6SaFm4KHBwgF9aDcIeOcTlAtRf-9bJjw2WU2je3N-gozBQELUujxtjOeMnH7ioYb8ZwUJJEVz2BaFAiCo6lIKgyCmPdyYfYCrOIsUnPQ-0XWqmg17uUrd_noSLWFV-jNg-zyMAoEi0CPGbgLZWv-5nFmcWS-OV2EoOqCba2-mZhnLTongiOonRleJLzp4UKGIRbdzJq51TI1n_vbocTSI7SRKYr7yqfPwAzt',
      imageAlt: 'Headphones',
    },
    {
      id: '3',
      name: 'ProView 85mm Lens',
      subCategory: 'Electronics > Photography',
      sku: 'CAM-LENS-85',
      price: 899.00,
      stock: 0,
      status: 'Out of Stock',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHs7yB9OTjmGQp8SYPgqC_Fo5uujmw0qnerB34AHtkzMPpSatxZSMOO8QtlSnNx6XpVnmHsqRAgbWhEdV83OiJXMnGllXEzK77hn4ia1ZvpUEMgwpOstZlLXg_dz_uicnsq3XJAtUdTAx1mKEF48m5dT3lGzXumIX5HtaiMKLIOLPGx7qluDoC7X4LSaDGgQil_YvCp8vuQiDa2Ol-TNeMMgZC-4UFOUw0UmX1qImvUE3JfvgE34CoXXbKbnqFCInLkgWy6imgU2ZR',
      imageAlt: 'Camera Lens',
    },
    {
      id: '4',
      name: 'UltraBook X1 Carbon',
      subCategory: 'Electronics > Laptops',
      sku: 'NB-ULTRA-X1',
      price: 1499.00,
      stock: 23,
      status: 'In Stock',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3-eyYWORBd8nRs42XUMfy43Znfj01fYP9llRzebPymjgm7DYDIIB6oLlpN4vdJfm7oOt5WOSpEGJU-MjqBGwcxLVtIhh6tc0xL5Dcik2W0ezoN3i0XdkzAYilC0IsMguXzRkjBxGHNZiYrI6ZRtcksPHMMldNlnqu3irc7awcvxNVbpWh2pQyR6uYrEQLnotDpzp9ceuue6FTw5nuyEjLGSsZPlDoMlPT-5B1mrmEaWi5FSjkQ_ALa2NSf-m5pl50IxPr_Wuzqvxi',
      imageAlt: 'Laptop',
    },
    {
      id: '5',
      name: 'Galaxy Tab Ultra S9',
      subCategory: 'Electronics > Tablets',
      sku: 'TAB-ULTRA-S9',
      price: 799.00,
      stock: 55,
      status: 'In Stock',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDG7oM33_2NjSwCvjR-MR-1kqU7tdp3kYQPd47d25oiIDxrQWGArGjNq8o3z1_fYfRLi1ZLCmhqEaipGL_AnIWsTY2_FMNT8Lrb21M2zreo1EvNnnMoVhGwglIZkHbdY92_VeJyKTIqDXdls6zo_tAQKC6LRSwLaFWI3SbU2p6Z4Co6l61PCxlWqcloAFpKsgX7kBW3AdmNMxPQcYYBjdgoGWnHguVc4QdqiLFU2T6PGQPfQMIclieC_yy21v63KDWQL7622g70SE3Y',
      imageAlt: 'Tablet',
    },
    {
      id: '6',
      name: 'NoisePro ANC Buds',
      subCategory: 'Electronics > Audio',
      sku: 'AUD-NP-BUDS',
      price: 179.00,
      stock: 3,
      status: 'Low Stock',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUEEQH4EDVHzX3Fy_BOuVTaCxpQ_bwuelRymbaMOrz6SaFm4KHBwgF9aDcIeOcTlAtRf-9bJjw2WU2je3N-gozBQELUujxtjOeMnH7ioYb8ZwUJJEVz2BaFAiCo6lIKgyCmPdyYfYCrOIsUnPQ-0XWqmg17uUrd_noSLWFV-jNg-zyMAoEi0CPGbgLZWv-5nFmcWS-OV2EoOqCba2-mZhnLTongiOonRleJLzp4UKGIRbdzJq51TI1n_vbocTSI7SRKYr7yqfPwAzt',
      imageAlt: 'Earbuds',
    },
    {
      id: '7',
      name: 'DeskPro 4K Monitor 32"',
      subCategory: 'Electronics > Monitors',
      sku: 'MON-4K-32DP',
      price: 649.00,
      stock: 18,
      status: 'In Stock',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3-eyYWORBd8nRs42XUMfy43Znfj01fYP9llRzebPymjgm7DYDIIB6oLlpN4vdJfm7oOt5WOSpEGJU-MjqBGwcxLVtIhh6tc0xL5Dcik2W0ezoN3i0XdkzAYilC0IsMguXzRkjBxGHNZiYrI6ZRtcksPHMMldNlnqu3irc7awcvxNVbpWh2pQyR6uYrEQLnotDpzp9ceuue6FTw5nuyEjLGSsZPlDoMlPT-5B1mrmEaWi5FSjkQ_ALa2NSf-m5pl50IxPr_Wuzqvxi',
      imageAlt: 'Monitor',
    },
    {
      id: '8',
      name: 'StreamCam 4K Pro',
      subCategory: 'Electronics > Cameras',
      sku: 'CAM-STRM-4K',
      price: 219.00,
      stock: 0,
      status: 'Out of Stock',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHs7yB9OTjmGQp8SYPgqC_Fo5uujmw0qnerB34AHtkzMPpSatxZSMOO8QtlSnNx6XpVnmHsqRAgbWhEdV83OiJXMnGllXEzK77hn4ia1ZvpUEMgwpOstZlLXg_dz_uicnsq3XJAtUdTAx1mKEF48m5dT3lGzXumIX5HtaiMKLIOLPGx7qluDoC7X4LSaDGgQil_YvCp8vuQiDa2Ol-TNeMMgZC-4UFOUw0UmX1qImvUE3JfvgE34CoXXbKbnqFCInLkgWy6imgU2ZR',
      imageAlt: 'Webcam',
    },
  ];

  // ── Product search / filter ───────────────────────────────────────
  productSearch = '';

  get filteredProducts(): Product[] {
    const q = this.productSearch.toLowerCase().trim();
    if (!q) return this.allProducts;
    return this.allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.subCategory.toLowerCase().includes(q)
    );
  }

  onProductSearchChange(): void { this.currentPage = 1; }

  // ── Pagination ────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 4;

  get totalItems(): number { return this.filteredProducts.length; }
  get totalPages(): number { return Math.ceil(this.totalItems / this.pageSize); }
  get showingFrom(): number { return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get showingTo(): number { return Math.min(this.currentPage * this.pageSize, this.totalItems); }

  get pagedProducts(): Product[] {
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

  // ── Status helpers ────────────────────────────────────────────────
  getStatusClass(status: string): string {
    switch (status) {
      case 'In Stock': return 'bg-emerald-100 text-emerald-800';
      case 'Low Stock': return 'bg-amber-100 text-amber-800';
      case 'Out of Stock': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

  getCategoryStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Draft': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'Archived': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  // ── Actions ───────────────────────────────────────────────────────
  editCategory(): void { alert('Edit category'); }
  deleteCategory(): void { if (confirm('Delete this category?')) alert('Category deleted'); }
  addSubCategory(): void { alert('Add sub-category'); }
  productMenu(p: Product): void { alert(`Actions for: ${p.name}`); }

  formatPrice(price: number): string {
    return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  ngOnInit(): void {
    // route param
    const routeParams = this.route.snapshot.paramMap;
    const categoryId = routeParams.get('id');

    this.loadCategory(categoryId);
  }

  loadCategory(id: any) {
    this._CategoriesService.viewCateDetails(id).subscribe({
      next: (res: any) => {
        console.log(res);
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

}
