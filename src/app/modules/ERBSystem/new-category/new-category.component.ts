import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-new-category',
  imports: [CommonModule, FormsModule],
  templateUrl: './new-category.component.html',
  styleUrl: './new-category.component.scss',
})
export class NewCategoryComponent {
  categoryName = signal<string>('');
  categorySlug = signal<string>('summer-collection'); // Pre-filled for demo
  categoryDescription = signal<string>('');
  categoryParent = signal<string>('none');

  // Status Toggles
  isActive = signal<boolean>(true);
  includeInMenu = signal<boolean>(true);

  // SEO
  metaTitle = signal<string>('Category Title'); // Pre-filled for demo
  metaDescription = signal<string>('Brief description for search engines...'); // Pre-filled for demo

  /**
   * Placeholder function for saving the category
   */
  saveCategory() {
    console.log('Category Data to Save:', {
      categoryName: this.categoryName(),
      categorySlug: this.categorySlug(),
      categoryDescription: this.categoryDescription(),
      categoryParent: this.categoryParent(),
      isActive: this.isActive(),
      includeInMenu: this.includeInMenu(),
      metaTitle: this.metaTitle(),
      metaDescription: this.metaDescription(),
    });
    alert('Category Saved! (Check console for data)');
  }
  cancel() {
    console.log('Operation cancelled.');
    // In a real app, this would typically navigate back
    // this.router.navigate(['/categories']);
  }
}
