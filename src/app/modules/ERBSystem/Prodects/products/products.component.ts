import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Product {
  id: number;
  name: string;
  image: string;
  sku: string;
  price: number;
  category: string;
  status: 'Active' | 'Inactive';
  selected?: boolean;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {

  private readonly _router = inject(Router);

  user = {
    name: 'Alex Doe',
    role: 'Sales Manager',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Doe&background=3b82f6&color=fff'
  };

  searchQuery: string = '';

  products: Product[] = [
    {
      id: 1,
      name: 'Wireless Mouse',
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=100&h=100&fit=crop',
      sku: 'WM-101-BLK',
      price: 29.99,
      category: 'Electronics',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Ergonomic Keyboard',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&h=100&fit=crop',
      sku: 'EK-202-GRY',
      price: 79.99,
      category: 'Electronics',
      status: 'Active'
    },
    {
      id: 3,
      name: '4K Gaming Monitor',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&h=100&fit=crop',
      sku: 'HDM-303-BLK',
      price: 299.99,
      category: 'Monitors',
      status: 'Inactive'
    },
    {
      id: 4,
      name: 'Modern Office Chair',
      image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=100&h=100&fit=crop',
      sku: 'OC-404-BRN',
      price: 349.00,
      category: 'Furniture',
      status: 'Active'
    },
    {
      id: 5,
      name: 'Noise-Cancelling Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
      sku: 'NCH-505-WHT',
      price: 199.50,
      category: 'Audio',
      status: 'Active'
    }
  ];

  filteredProducts: Product[] = [...this.products];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 10;

  constructor() {
    this.updateFilteredProducts();
  }

  onSearch(): void {
    this.updateFilteredProducts();
  }

  updateFilteredProducts(): void {
    if (!this.searchQuery.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredProducts = this.products.filter(
        product =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query)
      );
    }
  }

  toggleProductSelection(product: Product): void {
    product.selected = !product.selected;
  }

  toggleAllSelection(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filteredProducts.forEach(product => {
      product.selected = target.checked;
    });
  }

  editProduct(product: Product): void {
    console.log('Edit product:', product);
    // Add edit logic here
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      const index = this.products.findIndex(p => p.id === product.id);
      if (index > -1) {
        this.products.splice(index, 1);
        this.updateFilteredProducts();
      }
    }
  }

  addNewProduct(): void {
    console.log('Add new product');
    // Add new product logic here
    this._router.navigate(['/add-product']);
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    if (this.totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first 3, ellipsis, last 3
      pages.push(1, 2, 3, '...', this.totalPages - 2, this.totalPages - 1, this.totalPages);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  getStatusClass(status: string): string {
    return status === 'Active' ? 'status-active' : 'status-inactive';
  }

  onPageClick(page: number | string): void {
    if (typeof page === 'number') {
      this.goToPage(page);
    }
  }
}

