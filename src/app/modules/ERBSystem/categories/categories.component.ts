import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  description: string;
  image: string;
  status: 'Active' | 'Inactive';
  productCount: number;
  subcategoryCount: number;
  expanded?: boolean;
  selected?: boolean;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  searchQuery: string = '';
  selectedCategory: Category | null = null;
  editMode: boolean = false;
  private readonly router = inject(Router);

  categories: Category[] = [
    {
      id: 1,
      name: 'Electronics',
      slug: 'electronics',
      parentId: null,
      description: 'Electronic devices and accessories',
      image:
        'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop',
      status: 'Active',
      productCount: 0,
      subcategoryCount: 4,
      expanded: true,
    },
    {
      id: 2,
      name: 'Laptops',
      slug: 'laptops',
      parentId: 1,
      description: 'Laptop computers and accessories',
      image: '',
      status: 'Active',
      productCount: 45,
      subcategoryCount: 0,
    },
    {
      id: 3,
      name: 'Smartphones',
      slug: 'smartphones',
      parentId: 1,
      description: 'Smartphones and mobile devices',
      image: '',
      status: 'Active',
      productCount: 82,
      subcategoryCount: 0,
    },
    {
      id: 4,
      name: 'Cameras',
      slug: 'cameras',
      parentId: 1,
      description: 'Digital cameras and photography equipment',
      image: '',
      status: 'Inactive',
      productCount: 31,
      subcategoryCount: 0,
    },
    {
      id: 5,
      name: 'Audio',
      slug: 'audio',
      parentId: 1,
      description: 'Audio equipment and headphones',
      image: '',
      status: 'Active',
      productCount: 112,
      subcategoryCount: 0,
    },
    {
      id: 6,
      name: 'Clothing',
      slug: 'clothing',
      parentId: null,
      description: 'Apparel and fashion items',
      image:
        'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop',
      status: 'Active',
      productCount: 0,
      subcategoryCount: 3,
      expanded: false,
    },
    {
      id: 7,
      name: "Men's",
      slug: 'mens-apparel',
      parentId: 6,
      description: "Men's clothing and accessories",
      image: '',
      status: 'Active',
      productCount: 156,
      subcategoryCount: 0,
    },
    {
      id: 8,
      name: "Women's",
      slug: 'womens-apparel',
      parentId: 6,
      description: "A collection of women's clothing and accessories.",
      image: '',
      status: 'Active',
      productCount: 203,
      subcategoryCount: 0,
    },
    {
      id: 9,
      name: "Kid's",
      slug: 'kids-apparel',
      parentId: 6,
      description: "Children's clothing and accessories",
      image: '',
      status: 'Active',
      productCount: 89,
      subcategoryCount: 0,
    },
    {
      id: 10,
      name: 'Home Goods',
      slug: 'home-goods',
      parentId: null,
      description: 'Home and living products',
      image:
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
      status: 'Active',
      productCount: 0,
      subcategoryCount: 5,
      expanded: false,
    },
  ];

  filteredCategories: Category[] = [...this.categories];
  subcategories: Category[] = [];

  editForm = {
    name: '',
    slug: '',
    parentId: this.selectedCategory ? this.selectedCategory.id : null,
    description: '',
    image: '',
    status: 'Active' as 'Active' | 'Inactive',
  };

  constructor() {
    this.updateFilteredCategories();
    this.updateSubcategories();
  }

  onSearch(): void {
    this.updateFilteredCategories();
  }

  updateFilteredCategories(): void {
    if (!this.searchQuery.trim()) {
      this.filteredCategories = [...this.categories];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredCategories = this.categories.filter((cat) =>
        cat.name.toLowerCase().includes(query)
      );
    }
  }

  getMainCategories(): Category[] {
    return this.filteredCategories.filter((cat) => cat.parentId === null);
  }

  getSubcategories(parentId: number): Category[] {
    return this.filteredCategories.filter((cat) => cat.parentId === parentId);
  }

  toggleCategory(category: Category): void {
    if (category.subcategoryCount > 0) {
      category.expanded = !category.expanded;
    }
    this.selectCategory(category);
  }

  selectCategory(category: Category): void {
    if (category.parentId === null) {
      // Main category selected
      this.selectedCategory = category;
      this.updateSubcategories();
      this.editMode = false;
    } else {
      // Subcategory selected - show edit form
      this.selectedCategory = category;
      this.editMode = true;
      this.loadCategoryForEdit(category);
    }
  }

  updateSubcategories(): void {
    if (this.selectedCategory && this.selectedCategory.parentId === null) {
      this.subcategories = this.getSubcategories(this.selectedCategory.id);
    } else {
      this.subcategories = [];
    }
  }

  loadCategoryForEdit(category: Category): void {
    this.editForm = {
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
      description: category.description,
      image: category.image,
      status: category.status,
    };
  }

  getParentCategoryName(parentId: number | null): string {
    if (!parentId) return 'None';
    const parent = this.categories.find((c) => c.id === parentId);
    return parent ? parent.name : 'Unknown';
  }

  getBreadcrumbs(): string[] {
    if (!this.selectedCategory) return ['All Categories'];

    const breadcrumbs: string[] = ['All Categories'];

    if (this.selectedCategory.parentId) {
      const parent = this.categories.find(
        (c) => c.id === this.selectedCategory!.parentId
      );
      if (parent) {
        breadcrumbs.push(parent.name);
      }
    }

    breadcrumbs.push(this.selectedCategory.name);
    return breadcrumbs;
  }

  getStatusClass(status: string): string {
    return status === 'Active' ? 'status-active' : 'status-inactive';
  }

  getCategoryIcon(category: Category): string {
    if (
      category.name.toLowerCase().includes('electronics') ||
      category.name.toLowerCase().includes('laptop') ||
      category.name.toLowerCase().includes('smartphone') ||
      category.name.toLowerCase().includes('camera') ||
      category.name.toLowerCase().includes('audio')
    ) {
      return 'computer';
    } else if (
      category.name.toLowerCase().includes('clothing') ||
      category.name.toLowerCase().includes('apparel') ||
      category.name.toLowerCase().includes('men') ||
      category.name.toLowerCase().includes('women') ||
      category.name.toLowerCase().includes('kid')
    ) {
      return 'checkroom';
    } else if (category.name.toLowerCase().includes('home')) {
      return 'chair';
    }
    return 'folder';
  }

  editSubcategory(category: Category): void {
    this.selectCategory(category);
  }

  deleteCategory(category: Category): void {
    if (
      confirm(`Are you sure you want to delete category "${category.name}"?`)
    ) {
      const index = this.categories.findIndex((c) => c.id === category.id);
      if (index > -1) {
        this.categories.splice(index, 1);
        this.updateFilteredCategories();
        if (this.selectedCategory?.id === category.id) {
          this.selectedCategory = null;
          this.editMode = false;
        }
      }
    }
  }

  addNewCategory(): void {
    this.editMode = true;
    this.selectedCategory = null;
    this.editForm = {
      name: '',
      slug: '',
      parentId: null, // إصلاح هنا
      description: '',
      image: '',
      status: 'Active',
    };
  }

  saveCategory(): void {
    if (!this.editForm.name.trim()) {
      alert('Category name is required');
      return;
    }

    if (this.selectedCategory) {
      // Update existing category
      const index = this.categories.findIndex(
        (c) => c.id === this.selectedCategory!.id
      );
      if (index > -1) {
        this.categories[index] = {
          ...this.categories[index],
          name: this.editForm.name,
          slug: this.editForm.slug || this.generateSlug(this.editForm.name),
          parentId: this.editForm.parentId,
          description: this.editForm.description,
          image: this.editForm.image,
          status: this.editForm.status,
        };
      }
    } else {
      // Create new category
      const newCategory: Category = {
        id: this.categories.length + 1,
        name: this.editForm.name,
        slug: this.editForm.slug || this.generateSlug(this.editForm.name),
        parentId: this.editForm.parentId,
        description: this.editForm.description,
        image: this.editForm.image,
        status: this.editForm.status,
        productCount: 0,
        subcategoryCount: 0,
      };
      this.categories.push(newCategory);
    }

    this.updateFilteredCategories();
    this.editMode = false;
  }

  cancelEdit(): void {
    this.editMode = false;
    if (this.selectedCategory) {
      this.loadCategoryForEdit(this.selectedCategory);
    }
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  getParentCategories(): Category[] {
    return this.categories.filter((c) => c.parentId === null);
  }
  logout() {
    // TODO: Implement logout logic
    console.log('Logging out...');
    this.router.navigate(['/login']);
  }
}
