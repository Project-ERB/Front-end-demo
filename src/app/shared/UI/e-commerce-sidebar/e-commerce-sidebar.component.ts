import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CategoriesService } from '../../../core/services/categories/categories.service';

@Component({
  selector: 'app-e-commerce-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './e-commerce-sidebar.component.html',
  styleUrl: './e-commerce-sidebar.component.scss',
})
export class ECommerceSidebarComponent implements OnInit {

  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _Router = inject(Router);

  categories: any[] = [];
  isCategoriesLoading = true;
  selectedCategoryId: string | null = null;
  expandedCategoryId: string | null = null;

  // 1. إضافة Input و Output للتحكم من المكون الأب
  @Input() isMobileSidebarOpen: boolean = false;
  @Output() isMobileSidebarOpenChange = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isCategoriesLoading = true;
    this._CategoriesService.getCategories().subscribe({
      next: (parents) => {
        if (parents.length === 0) {
          this.categories = [];
          this.isCategoriesLoading = false;
          return;
        }

        let loaded = 0;
        this.categories = parents.map((p: any) => ({ ...p, children: [], loadingChildren: true }));

        parents.forEach((parent: any, index: number) => {
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
      error: () => (this.isCategoriesLoading = false),
    });
  }

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId = categoryId;
    this.closeMobileSidebar(); // استدعاء دالة الإغلاق المحدثة
    this._Router.navigate(['/home'], {
      queryParams: categoryId ? { category: categoryId } : {}
    });
  }

  toggleExpand(categoryId: string, event: Event): void {
    event.stopPropagation();
    this.expandedCategoryId = this.expandedCategoryId === categoryId ? null : categoryId;
  }

  // 2. تحديث دالة الإغلاق لإرسال قيمة False للمكون الأب
  closeMobileSidebar(): void {
    this.isMobileSidebarOpenChange.emit(false);
  }
}