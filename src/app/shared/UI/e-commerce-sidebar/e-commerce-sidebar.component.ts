import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CategoriesService } from '../../../core/services/categories/categories.service';

@Component({
  selector: 'app-e-commerce-sidebar',
  imports: [CommonModule],
  templateUrl: './e-commerce-sidebar.component.html',
  styleUrl: './e-commerce-sidebar.component.scss',
})
export class ECommerceSidebarComponent {

  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _Router = inject(Router);

  categories: any[] = [];
  isCategoriesLoading = true;
  selectedCategoryId: string | null = null;
  expandedCategoryId: string | null = null;
  isMobileSidebarOpen = false;

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
    this.isMobileSidebarOpen = false;
    this._Router.navigate(['/home'], {
      queryParams: categoryId ? { category: categoryId } : {}
    });
  }

  toggleExpand(categoryId: string, event: Event): void {
    event.stopPropagation();
    this.expandedCategoryId = this.expandedCategoryId === categoryId ? null : categoryId;
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

}
