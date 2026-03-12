import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriesService } from '../../../../core/services/categories/categories.service';
import { ApollocatoriesService } from '../../../../core/services/categories/apollocatories.service';
import { ProductService } from '../../../../core/services/products/product.service';
import { RouterLink } from '@angular/router';
import { SidebaSalesComponent } from "../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component";
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

export interface Category {
  id: string;
  code: string;
  name: string;
  description: string;
  parent: string;
  status: 'Active' | 'Draft' | 'Archived';
  selected: boolean;
}

export interface TreeNode {
  label: string;
  icon: string;
  count?: number;
  expanded: boolean;
  active: boolean;
  children?: TreeNode[];
}

export interface CategoryForm {
  name: string;
  code: string;
  parent: string;
  description: string;
  isActive: boolean;
}

@Component({
  selector: 'app-category-mangement',
  imports: [CommonModule, FormsModule, RouterLink, ReactiveFormsModule, SidebaSalesComponent],
  templateUrl: './category-mangement.component.html',
  styleUrl: './category-mangement.component.scss',
})
export class CategoryMangementComponent implements OnInit {

  isEditMode: boolean = false;
  private readonly _ToastrService = inject(ToastrService)
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _categoriesService = inject(ApollocatoriesService);
  private readonly _ProductService = inject(ProductService);

  CategoryForm: FormGroup = this._FormBuilder.group({
    name: [null, Validators.required],
    code: [null, Validators.required],
    description: [null, Validators.required],
    parentCategoryId: [null]
  });

  editingCategory: any | null = null;
  categories: any[] = [];
  allProducts: any[] = [];

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadCategories();
    this.loadAllProducts();
  }

  // ── Data Loading ──────────────────────────────────────────────────────────
  loadCategories() {
    this._categoriesService.getApollocategories().subscribe({
      next: (res: any) => {
        this.categories = (res?.data?.parentCategories?.nodes ?? []).map((c: any) => ({
          ...c,
          selected: false
        }));
        this.currentPage = 1;
      },
      error: (err: any) => console.error('Error loading categories:', err),
    });
  }

  loadAllProducts() {
    this._ProductService.getProducts().subscribe({
      next: (res: any) => {
        this.allProducts = res?.data?.products?.nodes ?? [];
      },
      error: (err: any) => console.error('Error loading products:', err),
    });
  }

  // ── Delete Single Category (cascade) ──────────────────────────────────────
  deleteCategory(id: string): void {
    const linkedProducts = this.allProducts.filter((p: any) => p.categoryId === id);

    const confirmMessage = linkedProducts.length > 0
      ? `This category has ${linkedProducts.length} linked product(s). They will be deleted first. Continue?`
      : 'Are you sure you want to delete this category?';

    if (!confirm(confirmMessage)) return;

    if (linkedProducts.length === 0) {
      this.executeCategoryDelete(id);
      return;
    }

    forkJoin(linkedProducts.map((p: any) => this._ProductService.deleteProduct(p.id))).subscribe({
      next: () => {
        console.log(`Deleted ${linkedProducts.length} linked product(s) ✅`);
        this.executeCategoryDelete(id);
      },
      error: (err) => {
        console.error('Failed to delete linked products:', err);
      }
    });
  }

  private executeCategoryDelete(id: string): void {
    this._CategoriesService.deleteCategory(id).subscribe({
      next: () => {
        console.log('Category deleted ✅');
        this._ToastrService.success('Category deleted successfully', 'Deleted ✅');
        this.loadCategories();
        this.loadAllProducts();
      },
      error: (err) => {
        console.error('Delete category failed:', err);
        if (err.status === 500) {
          alert('Cannot delete this category. Please check if it still has linked data.');
        } else {
          this._ToastrService.error('Failed to delete Category', 'Error ❌');
        }
      }
    });
  }

  // ── Delete Selected Categories (cascade) — ✅ now uses bulk API ────────────
  deleteSelected(): void {
    if (this.selectedCount === 0) return;

    const selectedCategories = this.categories.filter((c: any) => c.selected);
    const totalLinked = selectedCategories.reduce((acc, cat) =>
      acc + this.allProducts.filter((p: any) => p.categoryId === cat.id).length, 0
    );

    const confirmMessage = totalLinked > 0
      ? `Delete ${selectedCategories.length} categories and their ${totalLinked} linked product(s)?`
      : `Delete ${selectedCategories.length} selected categories?`;

    if (!confirm(confirmMessage)) return;

    const linkedProductIds = this.allProducts
      .filter((p: any) => selectedCategories.some((c: any) => c.id === p.categoryId))
      .map((p: any) => p.id);

    const categoryIds = selectedCategories.map((c: any) => c.id);

    const productDeletes = linkedProductIds.length > 0
      ? linkedProductIds.map((id: string) => this._ProductService.deleteProduct(id))
      : [of(null)];

    // ✅ Fixed: use bulk API instead of looping individual deletes
    forkJoin(productDeletes).pipe(
      switchMap(() => this._CategoriesService.deleteAllCategories(categoryIds))
    ).subscribe({
      next: () => {
        console.log('Selected categories deleted ✅');
        this.loadCategories();
        this.loadAllProducts();
      },
      error: (err) => {
        console.error('Failed to delete selected categories:', err);
        alert('Failed to delete selected categories. Please try again.');
      }
    });
  }

  // ── Delete ALL — ✅ uses switchMap (no nested subscribes) + passes ids ─────
  deleteAll(): void {
    if (this.categories.length === 0) return;
    if (!confirm(`This will permanently delete ALL products and ALL categories. Are you sure?`)) return;

    const ids = this.categories.map((c: any) => c.id);

    this._ProductService.deleteAllProducts().pipe(
      switchMap(() => this._CategoriesService.deleteAllCategories(ids))
    ).subscribe({
      next: () => {
        console.log('All products and categories deleted ✅');
        this.categories = [];
        this.allProducts = [];
        this.currentPage = 1;
      },
      error: (err) => {
        console.error('Delete all failed:', err);
        alert('An error occurred during deletion. Please try again.');
      }
    });
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  submitCategory() {
    if (this.CategoryForm.invalid) return;

    const formValue = this.CategoryForm.value;

    if (this.isEditMode && this.editingCategory) {
      this._CategoriesService
        .updataecategore(formValue, this.editingCategory.id)
        .subscribe({
          next: (res) => { console.log('Updated ✅', res); this.afterSuccess(); },
          error: (err) => console.error(err)
        });
    } else {
      this._CategoriesService.addCategory(formValue).subscribe({
        next: (res) => { console.log('Created ✅', res); this.afterSuccess(); },
        error: (err) => console.error(err)
      });
    }
  }

  private afterSuccess() {
    this.CategoryForm.reset();
    this.loadCategories();
    this.closeModal();
  }

  viewDetails(id: string): void {
    this._CategoriesService.getCategoryById(id).subscribe({
      next: (res: any) => console.log(res),
      error: (err: any) => console.error(err)
    });
  }

  // ── Tree ──────────────────────────────────────────────────────────────────
  treeFilter = '';

  tree: TreeNode[] = [
    {
      label: 'All Categories', icon: 'folder_open', count: 124, expanded: true, active: true,
      children: [
        {
          label: 'Electronics', icon: 'laptop_mac', expanded: true, active: false,
          children: [
            { label: 'Computers', icon: 'computer', expanded: false, active: true },
            { label: 'Smartphones', icon: 'smartphone', expanded: false, active: false },
            { label: 'Cameras', icon: 'photo_camera', expanded: false, active: false },
          ],
        },
        { label: 'Apparel', icon: 'checkroom', expanded: false, active: false },
        { label: 'Home & Garden', icon: 'chair', expanded: false, active: false },
      ],
    },
  ];

  treeCollapsedAll = false;

  toggleNode(node: TreeNode): void {
    if (node.children?.length) node.expanded = !node.expanded;
  }

  selectNode(node: TreeNode, root: TreeNode[]): void {
    this.clearActive(root);
    node.active = true;
  }

  clearActive(nodes: TreeNode[]): void {
    nodes.forEach(n => { n.active = false; if (n.children) this.clearActive(n.children); });
  }

  collapseAll(): void {
    const collapse = (nodes: TreeNode[]) =>
      nodes.forEach(n => { n.expanded = false; if (n.children) collapse(n.children); });
    collapse(this.tree);
    this.treeCollapsedAll = true;
  }

  expandAll(): void {
    const expand = (nodes: TreeNode[]) =>
      nodes.forEach(n => { n.expanded = true; if (n.children) expand(n.children); });
    expand(this.tree);
    this.treeCollapsedAll = false;
  }

  // ── Search & sort ─────────────────────────────────────────────────────────
  searchQuery = '';
  sortCol: string = 'name';
  sortDir: 'asc' | 'desc' = 'asc';

  sort(col: string): void {
    if (this.sortCol === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCol = col;
      this.sortDir = 'asc';
    }
    this.currentPage = 1;
  }

  get filteredCategories(): any[] {
    const q = this.searchQuery.toLowerCase().trim();
    let list = this.categories.filter((c: any) =>
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.code?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
    list = [...list].sort((a: any, b: any) => {
      const av = String(a[this.sortCol] ?? '').toLowerCase();
      const bv = String(b[this.sortCol] ?? '').toLowerCase();
      return this.sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }

  // ── Bulk selection ────────────────────────────────────────────────────────
  get selectedCount(): number {
    return this.categories.filter((c: any) => c.selected).length;
  }

  get allOnPageSelected(): boolean {
    return this.pagedCategories.length > 0 && this.pagedCategories.every((c: any) => c.selected);
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.pagedCategories.forEach((c: any) => c.selected = checked);
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 7;

  get totalItems(): number { return this.filteredCategories.length; }
  get totalPages(): number { return Math.ceil(this.totalItems / this.pageSize); }
  get showingFrom(): number { return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get showingTo(): number { return Math.min(this.currentPage * this.pageSize, this.totalItems); }

  get pagedCategories(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCategories.slice(start, start + this.pageSize);
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
  onSearchChange(): void { this.currentPage = 1; }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getSortIcon(col: string): string {
    if (this.sortCol !== col) return 'swap_vert';
    return this.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  // ── Modal ─────────────────────────────────────────────────────────────────
  isModalOpen = false;
  isParentDropdownOpen = false;
  parentSearchQuery = '';

  form: CategoryForm = {
    name: '',
    code: '',
    parent: '',
    description: '',
    isActive: true,
  };

  formErrors: Partial<CategoryForm> = {};

  get parentOptions(): { label: string; value: string; depth: number }[] {
    const result: { label: string; value: string; depth: number }[] = [];
    const flatten = (nodes: TreeNode[], depth: number) => {
      nodes.forEach(n => {
        result.push({ label: n.label, value: n.label, depth });
        if (n.children) flatten(n.children, depth + 1);
      });
    };
    if (this.tree[0]?.children) flatten(this.tree[0].children, 0);
    return result;
  }

  get filteredParentOptions() {
    const q = this.parentSearchQuery.toLowerCase().trim();
    return this.parentOptions.filter(o => !q || o.label.toLowerCase().includes(q));
  }

  openModal(category?: any): void {
    this.isModalOpen = true;
    if (category) {
      this.isEditMode = true;
      this.editingCategory = category;
      this.CategoryForm.patchValue({
        name: category.name,
        code: category.code,
        description: category.description,
        parentCategoryId: category.parentCategoryId
      });
    } else {
      this.isEditMode = false;
      this.editingCategory = null;
      this.CategoryForm.reset();
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.isParentDropdownOpen = false;
    this.editingCategory = null;
  }

  toggleParentDropdown(): void {
    this.isParentDropdownOpen = !this.isParentDropdownOpen;
    if (this.isParentDropdownOpen) this.parentSearchQuery = '';
  }

  selectParent(value: string): void {
    this.form.parent = value;
    this.isParentDropdownOpen = false;
  }

  clearParent(): void {
    this.form.parent = '';
    this.isParentDropdownOpen = false;
  }

  onNameInput(): void {
    if (!this.form.code || this.form.code === this.autoCode) {
      this.form.code = this.autoCode;
    }
  }

  get autoCode(): string {
    return this.form.name
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join('-');
  }

  validateForm(): boolean {
    this.formErrors = {};
    if (!this.form.name.trim()) this.formErrors.name = 'Category name is required.';
    if (!this.form.code.trim()) this.formErrors.code = 'Category code is required.';
    return Object.keys(this.formErrors).length === 0;
  }
}