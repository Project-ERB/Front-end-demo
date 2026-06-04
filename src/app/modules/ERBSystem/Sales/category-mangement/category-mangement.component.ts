import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
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
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

export interface Category {
  id: string;
  code: string;
  name: string;
  description: string;
  parent: string;
  status: 'Active' | 'Draft' | 'Archived';
  selected: boolean;
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
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ReactiveFormsModule, SidebaSalesComponent],
  templateUrl: './category-mangement.component.html',
  styleUrl: './category-mangement.component.scss',
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('400ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('staggerRows', [
      transition('* => *', [
        query(
          '.cat-row',
          [
            style({ opacity: 0, transform: 'translateX(-10px)' }),
            stagger(40, [animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('modalIn', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('modalPanelIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(10px)' }),
        animate('300ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.97) translateY(5px)' })),
      ]),
    ]),
    trigger('confirmIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class CategoryMangementComponent implements OnInit, OnDestroy {

  isEditMode: boolean = false;
  isMobileSidebarOpen = false;
  private readonly _ToastrService = inject(ToastrService);
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

  // ── Hover ──
  hoveredCatId: string | null = null;

  // ── Delete Confirm ──
  showDeleteConfirm = false;
  deleteTarget: any = null;
  deleteMessage = '';

  // ── Lifecycle ──
  ngOnInit(): void {
    this.loadCategories();
    this.loadAllProducts();
  }

  ngOnDestroy(): void { }

  // ── Sidebar ──
  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  // ── Data Loading ──
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

  // ── Delete Single Category ──
  deleteCategory(cat: any): void {
    const linkedProducts = this.allProducts.filter((p: any) => p.categoryId === cat.id);
    this.deleteTarget = cat;
    this.deleteMessage = linkedProducts.length > 0
      ? `This category has ${linkedProducts.length} linked product(s). They will be deleted first.`
      : 'Are you sure you want to delete this category?';
    this.showDeleteConfirm = true;
  }

  confirmSingleDelete(): void {
    if (!this.deleteTarget) return;
    const cat = this.deleteTarget;
    const linkedProducts = this.allProducts.filter((p: any) => p.categoryId === cat.id);
    this.showDeleteConfirm = false;

    if (linkedProducts.length === 0) {
      this.executeCategoryDelete(cat.id);
      return;
    }

    forkJoin(linkedProducts.map((p: any) => this._ProductService.deleteProduct(p.id))).subscribe({
      next: () => this.executeCategoryDelete(cat.id),
      error: (err) => console.error('Failed to delete linked products:', err),
    });
    this.deleteTarget = null;
  }

  private executeCategoryDelete(id: string): void {
    this._CategoriesService.deleteCategory(id).subscribe({
      next: (res: any) => { // ← أضف :any
        // ✅ استخراج رسالة النجاح
        const successMsg = res?.['message'] || res?.['data']?.['message'] || 'Category deleted successfully';
        this._ToastrService.success(successMsg, 'Deleted ✅');

        this.loadCategories();
        this.loadAllProducts();
      },
      error: (err: any) => { // ← أضف :any
        // ✅ استخراج رسالة الخطأ
        const errorMsg = err?.['error']?.['message'] || err?.['message'];

        if (err.status === 500) {
          // لو في رسالة من الباك اند اعرضها، لو لا اعرض الرسالة الافتراضية
          this._ToastrService.error(errorMsg || 'Cannot delete this category. Please check if it still has linked data.', 'Error ❌');
        } else {
          this._ToastrService.error(errorMsg || 'Failed to delete Category', 'Error ❌');
        }
      }
    });
  }
  // ── Delete Selected ──
  deleteSelected(): void {
    if (this.selectedCount === 0) return;
    const selectedCategories = this.categories.filter((c: any) => c.selected);
    const totalLinked = selectedCategories.reduce((acc, cat) =>
      acc + this.allProducts.filter((p: any) => p.categoryId === cat.id).length, 0
    );
    this.deleteMessage = totalLinked > 0
      ? `Delete ${selectedCategories.length} categories and their ${totalLinked} linked product(s)?`
      : `Delete ${selectedCategories.length} selected categories?`;
    this.deleteTarget = { isBulk: true, categories: selectedCategories };
    this.showDeleteConfirm = true;
  }

  confirmBulkDelete(): void {
    if (!this.deleteTarget?.isBulk) return;
    const selectedCategories = this.deleteTarget.categories;
    this.showDeleteConfirm = false;

    const linkedProductIds = this.allProducts
      .filter((p: any) => selectedCategories.some((c: any) => c.id === p.categoryId))
      .map((p: any) => p.id);
    const categoryIds = selectedCategories.map((c: any) => c.id);
    const productDeletes = linkedProductIds.length > 0
      ? linkedProductIds.map((id: string) => this._ProductService.deleteProduct(id))
      : [of(null)];

    forkJoin(productDeletes).pipe(
      switchMap(() => this._CategoriesService.deleteAllCategories(categoryIds))
    ).subscribe({
      next: (res: any) => { // ← أضف :any
        // ✅ استخراج رسالة النجاح
        const successMsg = res?.['message'] || res?.['data']?.['message'] || 'Selected categories deleted';
        this._ToastrService.success(successMsg, 'Deleted ✅');

        this.loadCategories();
        this.loadAllProducts();
      },
      error: (err: any) => { // ← أضف :any
        // ✅ استخراج رسالة الخطأ
        const errorMsg = err?.['error']?.['message'] || err?.['message'] || 'Failed to delete selected categories';
        this._ToastrService.error(errorMsg, 'Error ❌');
      },
    });
    this.deleteTarget = null;
  }

  // ── Delete ALL ──
  deleteAll(): void {
    if (this.categories.length === 0) return;
    this.deleteMessage = 'This will permanently delete ALL products and ALL categories.';
    this.deleteTarget = { isDeleteAll: true };
    this.showDeleteConfirm = true;
  }

  confirmDeleteAll(): void {
    if (!this.deleteTarget?.isDeleteAll) return;
    this.showDeleteConfirm = false;
    const ids = this.categories.map((c: any) => c.id);

    this._ProductService.deleteAllProducts().pipe(
      switchMap(() => this._CategoriesService.deleteAllCategories(ids))
    ).subscribe({
      next: (res: any) => { // ← أضف :any
        // ✅ استخراج رسالة النجاح
        const successMsg = res?.['message'] || res?.['data']?.['message'] || 'All data deleted';

        this.categories = [];
        this.allProducts = [];
        this.currentPage = 1;
        this._ToastrService.success(successMsg, 'Cleared ✅');
      },
      error: (err: any) => { // ← أضف :any
        // ✅ استخراج رسالة الخطأ
        const errorMsg = err?.['error']?.['message'] || err?.['message'] || 'An error occurred during deletion';
        this._ToastrService.error(errorMsg, 'Error ❌');
      },
    });
    this.deleteTarget = null;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  isSubmitting: boolean = false;

  // ── Form ──
  submitCategory() {
    if (this.CategoryForm.invalid) {
      this.CategoryForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formValue = this.CategoryForm.value;
    const request$ = this.isEditMode && this.editingCategory
      ? this._CategoriesService.updataecategore(formValue, this.editingCategory.id)
      : this._CategoriesService.addCategory(formValue);

    request$.subscribe({
      next: (res: any) => { // ← أضف :any
        // ✅ استخراج رسالة النجاح
        const successMsg = res?.['message'] || res?.['data']?.['message'] || 'Category saved successfully';
        this._ToastrService.success(successMsg, 'Success ✅');

        this.afterSuccess();
      },
      error: (err: any) => { // ← أضف :any
        // ✅ استخراج رسالة الخطأ
        const errorMsg = err?.['error']?.['message'] || err?.['message'] || 'Something went wrong';
        this._ToastrService.error(errorMsg, 'Error ❌');
      },
      complete: () => { this.isSubmitting = false; }
    });
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

  // ── Search & sort ──
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
      !q || c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
    );
    list = [...list].sort((a: any, b: any) => {
      const av = String(a[this.sortCol] ?? '').toLowerCase();
      const bv = String(b[this.sortCol] ?? '').toLowerCase();
      return this.sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }

  // ── Bulk selection ──
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

  // ── Pagination ──
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

  // ── Hover ──
  onRowHover(id: string | null): void {
    this.hoveredCatId = id;
  }

  // ── Helpers ──
  getSortIcon(col: string): string {
    if (this.sortCol !== col) return 'swap_vert';
    return this.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  // ── Modal ──
  isModalOpen = false;
  isParentDropdownOpen = false;
  parentSearchQuery = '';

  form: CategoryForm = { name: '', code: '', parent: '', description: '', isActive: true };
  formErrors: Partial<CategoryForm> = {};

  get filteredParentOptions() {
    const q = this.parentSearchQuery.toLowerCase().trim();
    return this.categories.filter(c => !q || c.name.toLowerCase().includes(q));
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

  // ── Keyboard ──
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const input = document.getElementById('cat-search-input');
      input?.focus();
    }
    if (event.key === 'Escape') {
      this.closeMobileSidebar();
      if (this.isModalOpen) this.closeModal();
      if (this.showDeleteConfirm) this.cancelDelete();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024) this.isMobileSidebarOpen = false;
  }
}