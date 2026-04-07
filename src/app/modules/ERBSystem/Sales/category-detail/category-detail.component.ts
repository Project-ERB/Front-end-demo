import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoriesService } from '../../../../core/services/categories/categories.service';
import { SidebaSalesComponent } from "../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component";

@Component({
  selector: 'app-category-detail',
  imports: [CommonModule, FormsModule, RouterModule, SidebaSalesComponent],
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.scss',
})
export class CategoryDetailComponent implements OnInit {

  private readonly _formBuilder = inject(FormBuilder);
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly route = inject(ActivatedRoute);
  private readonly _Router = inject(Router);
  // ── Category details ──────────────────────────────────────────────
  categoreis: any = null;
  isLoadingCategory = false;

  // ── Child Categories ──────────────────────────────────────────────
  childCategories: any[] = [];
  isLoadingChildren = false;

  // ── Products ──────────────────────────────────────────────────────
  allProducts: any[] = [];
  isLoadingProducts = false;

  categoryform: FormGroup = this._formBuilder.group({
    name: [null],
    code: [null],
    description: [null],
  });

  // ── Sidebar ───────────────────────────────────────────────────────
  navItems = [
    { icon: 'grid_view', label: 'Dashboard', active: false },
    { icon: 'trending_up', label: 'Sales Analysis', active: false },
    { icon: 'category', label: 'Categories', active: true },
    { icon: 'inventory_2', label: 'Products', active: false },
    { icon: 'percent', label: 'Discounts', active: false },
  ];

  // ── Category meta ─────────────────────────────────────────────────
  category = {
    name: '',
    code: '',
    icon: 'category',
    status: 'Active' as 'Active' | 'Draft' | 'Archived',
    description: '',
    createdBy: { name: '—', avatarUrl: '' },
    lastUpdated: '—',
    totalSkus: '—',
  };

  // ── Search & Pagination ───────────────────────────────────────────
  productSearch = '';
  currentPage = 1;
  pageSize = 4;

  // ─────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const categoryId = this.route.snapshot.paramMap.get('id');
    if (categoryId) {
      this.loadCategoryDetails(categoryId);
      this.loadChildCategories(categoryId);
      this.loadProducts(categoryId);
    }
  }

  // ── Load category details (GraphQL) ──────────────────────────────
  loadCategoryDetails(id: string): void {
    this.isLoadingCategory = true;
    this._CategoriesService.getCategoryById(id).subscribe({
      next: (res: any) => {
        console.log('Category details:', res);
        this.categoreis = res;
        this.category.name = res?.name ?? '';
        this.category.code = res?.code ?? '';
        this.category.description = res?.description ?? '';
        this.category.status = res?.isActive ? 'Active' : 'Archived';
        this.isLoadingCategory = false;
      },
      error: (err: any) => {
        console.error('Failed to load category:', err);
        this.isLoadingCategory = false;
      },
    });
  }

  // ── Load child categories (GraphQL) ──────────────────────────────
  loadChildCategories(parentId: string): void {
    this.isLoadingChildren = true;
    this._CategoriesService.getChildCategories(parentId).subscribe({
      next: (nodes: any[]) => {
        this.childCategories = nodes;
        this.isLoadingChildren = false;
      },
      error: (err: any) => {
        console.error('Failed to load child categories:', err);
        this.isLoadingChildren = false;
      },
    });
  }

  // ── Load products by categoryId (GraphQL) ────────────────────────
  loadProducts(categoryId: string): void {
    this.isLoadingProducts = true;
    this._CategoriesService.getProductsByCategory(categoryId).subscribe({
      next: (nodes: any[]) => {
        this.allProducts = nodes;
        this.isLoadingProducts = false;
      },
      error: (err: any) => {
        console.error('Failed to load products:', err);
        this.isLoadingProducts = false;
      },
    });
  }

  // ── Filtered products ─────────────────────────────────────────────
  get filteredProducts(): any[] {
    const q = this.productSearch.toLowerCase().trim();
    if (!q) return this.allProducts;
    return this.allProducts.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.shortDescription?.toLowerCase().includes(q)
    );
  }

  onProductSearchChange(): void { this.currentPage = 1; }

  // ── Pagination ────────────────────────────────────────────────────
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
    const total = this.totalPages, cur = this.currentPage;
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
  getCategoryStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Draft': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'Archived': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  // ── Actions ───────────────────────────────────────────────────────
  editCategory(): void { this._Router.navigate(['/category-management']) };
  deleteCategory(): void { this._Router.navigate(['/category-management']) };
  addSubCategory(): void {
    this._Router.navigate(['/category-management']);
  }
  productMenu(p: any): void { alert(`Actions for: ${p.name}`); }
}