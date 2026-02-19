import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface InventoryProduct {
  id: string;
  name: string;
  variants: string;
  sku: string;
  category: string;
  categoryColor: string;
  type: 'Physical' | 'Digital';
  typeIcon: string;
  price: number;
  enabled: boolean;
  imageUrl: string;
  imageAlt: string;
  useIconPlaceholder?: boolean;
}

@Component({
  selector: 'app-product-mangement',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-mangement.component.html',
  styleUrl: './product-mangement.component.scss',
})
export class ProductMangementComponent {

  // ── Sidebar (same as all previous components) ──────────────────────
  navItems = [
    { icon: 'grid_view', label: 'Dashboard', active: false },
    { icon: 'trending_up', label: 'Sales Analysis', active: false },
    { icon: 'category', label: 'Categories', active: false },
    { icon: 'inventory_2', label: 'Products', active: true },
    { icon: 'percent', label: 'Discounts', active: false },
  ];

  // ── All products ──────────────────────────────────────────────────
  allProducts: InventoryProduct[] = [
    {
      id: '1', name: 'Ergonomic Office Desk', variants: '2 variants',
      sku: 'OFF-DSK-001', category: 'Furniture', categoryColor: 'bg-blue-50 text-blue-700',
      type: 'Physical', typeIcon: 'inventory_2', price: 450.00, enabled: true,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAABCUndtOMKQjecc2hL1MimjgXClKClKlMWDzWLWuv18fU5E6u1aCXaZzEQdI7NToZaSwr4QFCzZ9WV8b5rIQkW0fj2TCjkZ2G85qXsjTXmlKSdPaSP_0Aj2OKCEeeGwvawRSAIiNPc35M-h5Qfs1Etqi7h1JuBxxAY_tpaoLAegd8P0wnq9f5U4JjRuWukzvp7cTfTqXAJ0_mfwRyGIDkAJ-Gs4lBr4KR66VNuGE8YP2HQGZ3OBDAYPj-z9u0_g31jYaShMMCGesw',
      imageAlt: 'Modern white office desk',
    },
    {
      id: '2', name: 'Urban Runner Sneaker', variants: '5 sizes, 3 colors',
      sku: 'SHOE-RUN-X9', category: 'Footwear', categoryColor: 'bg-purple-50 text-purple-700',
      type: 'Physical', typeIcon: 'inventory_2', price: 129.99, enabled: true,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlWIrQpB6FQXsgvbXMIJ1M0NT-EFz4k4YDrjPHq1pyFbPZWzod7JXxfpoLBHtv4FofqDHpHrZRz-rctrtEghfmN6KqqkPLFVT3jW3roWBIdDVuqyFihKII8tq72JCBZB925PeascQbAUS7KDENf0YrdFIczVPRrdRUkkcARK-uGAXjZUgtoyWE5ByT-RsKweRlsPLZXQ9yFLJGH5kxfHE04EqirKp-aowchDqGdhrq-6BODGEZu89mKPUHBCI_egPfsJR90jr6GWc2',
      imageAlt: 'Red athletic sneaker',
    },
    {
      id: '3', name: 'Pro License Key (1 Year)', variants: 'Digital Good',
      sku: 'SOFT-LIC-PRO', category: 'Software', categoryColor: 'bg-emerald-50 text-emerald-700',
      type: 'Digital', typeIcon: 'download', price: 89.00, enabled: false,
      imageUrl: '', imageAlt: 'Software license', useIconPlaceholder: true,
    },
    {
      id: '4', name: 'Noise Cancelling Headphones', variants: 'Black, White',
      sku: 'AUD-HEAD-NC', category: 'Electronics', categoryColor: 'bg-orange-50 text-orange-700',
      type: 'Physical', typeIcon: 'inventory_2', price: 299.99, enabled: true,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMUxDEK3dc7XDcUCVNiEzocQAPFE1eHGApPedbYIWyAA3Ec6P6MYL2QHWg3i-TlzvAd9vBG9DiEZv6zYr-ax3M_mxVYYht1CUvQfsCJQLV6YV0nZ12bN-YVA38-UtfLrSuDdNUymfyq2DEv6GUGD7hU9w93lZEPa8sxATP69NAsw56fHRxL1r4NgX4HPjQvnu-FmRL7xbQDrIjP9wDfBbKofDPgm8mK09LC3U5L7sgZlzLuDFx-KWM8Sa7LaLv4z7zHhbQdHRLfG8k',
      imageAlt: 'Modern headphones',
    },
    {
      id: '5', name: 'UltraBook Series X', variants: '16GB RAM, 512GB SSD',
      sku: 'COMP-ULTR-X', category: 'Electronics', categoryColor: 'bg-orange-50 text-orange-700',
      type: 'Physical', typeIcon: 'inventory_2', price: 1499.00, enabled: true,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFZe-nPq6jH2IXdZfNaNedTH90W6v37vLcl4MgzHMJTHx79RDixRIGlGtA-nhXpPbpm93g4W-Iyy_bckH8KfPC01FzdF9ecrOgegvKY3TTukInIZjpCqNyPSCwrKE-T-_bqFbSG2QxNrV42GZwhMyDUI8to1o1cP0PN6kbflxTWYJg8-OXzXiBcU0o225bN-kK508NeAMOOyyQs_FAStQmw11X6RTinMoIDSJtSUd6yCfQQojkBAyFIfc_v_Ufrcc_yotGDtiuZBF7',
      imageAlt: 'Silver laptop',
    },
    {
      id: '6', name: 'Basic Cotton Tee', variants: 'Bulk Pack',
      sku: 'CLO-TEE-BLK', category: 'Clothing', categoryColor: 'bg-pink-50 text-pink-700',
      type: 'Physical', typeIcon: 'inventory_2', price: 14.50, enabled: false,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD58Kd2Ha65rqn3cj8Jcpxj4s8UNuMv-RVVP_Dz95QiPbplb3A_V8b6Tw8afT-ffWwVBg8eSfLHaragPSPORY-NG2-oHFru7rWyI3clg38wk98WC69RXS3C6VFHLWbhF_zn2INfG2WQAEBSAOQSUKUvW805dw9t_iRfgwGCS_Mhhan4F29nX4hNhhFGoKN2Cpl7aBFMt7EkDBwO43jY-zKdvS8xGSe2BkdhsVQnk1cPwhZNpvekmLDQ3oXxZ43-blAxKLS7ujOCxzqn',
      imageAlt: 'Basic cotton t-shirt',
    },
    {
      id: '7', name: 'Standing Desk Converter Pro', variants: '3 heights',
      sku: 'OFF-STD-PRO', category: 'Furniture', categoryColor: 'bg-blue-50 text-blue-700',
      type: 'Physical', typeIcon: 'inventory_2', price: 249.00, enabled: true,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAABCUndtOMKQjecc2hL1MimjgXClKClKlMWDzWLWuv18fU5E6u1aCXaZzEQdI7NToZaSwr4QFCzZ9WV8b5rIQkW0fj2TCjkZ2G85qXsjTXmlKSdPaSP_0Aj2OKCEeeGwvawRSAIiNPc35M-h5Qfs1Etqi7h1JuBxxAY_tpaoLAegd8P0wnq9f5U4JjRuWukzvp7cTfTqXAJ0_mfwRyGIDkAJ-Gs4lBr4KR66VNuGE8YP2HQGZ3OBDAYPj-z9u0_g31jYaShMMCGesw',
      imageAlt: 'Standing desk converter',
    },
    {
      id: '8', name: 'Wireless Gaming Mouse', variants: 'Black only',
      sku: 'ACC-MOUSE-G', category: 'Electronics', categoryColor: 'bg-orange-50 text-orange-700',
      type: 'Physical', typeIcon: 'inventory_2', price: 79.99, enabled: true,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMUxDEK3dc7XDcUCVNiEzocQAPFE1eHGApPedbYIWyAA3Ec6P6MYL2QHWg3i-TlzvAd9vBG9DiEZv6zYr-ax3M_mxVYYht1CUvQfsCJQLV6YV0nZ12bN-YVA38-UtfLrSuDdNUymfyq2DEv6GUGD7hU9w93lZEPa8sxATP69NAsw56fHRxL1r4NgX4HPjQvnu-FmRL7xbQDrIjP9wDfBbKofDPgm8mK09LC3U5L7sgZlzLuDFx-KWM8Sa7LaLv4z7zHhbQdHRLfG8k',
      imageAlt: 'Gaming mouse',
    },
    {
      id: '9', name: 'Annual SaaS Subscription', variants: 'Per seat',
      sku: 'SOFT-SAAS-AN', category: 'Software', categoryColor: 'bg-emerald-50 text-emerald-700',
      type: 'Digital', typeIcon: 'download', price: 199.00, enabled: true,
      imageUrl: '', imageAlt: 'SaaS subscription', useIconPlaceholder: true,
    },
    {
      id: '10', name: 'Leather Loafers Classic', variants: 'Brown, Tan',
      sku: 'SHOE-LOAF-CL', category: 'Footwear', categoryColor: 'bg-purple-50 text-purple-700',
      type: 'Physical', typeIcon: 'inventory_2', price: 175.00, enabled: false,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlWIrQpB6FQXsgvbXMIJ1M0NT-EFz4k4YDrjPHq1pyFbPZWzod7JXxfpoLBHtv4FofqDHpHrZRz-rctrtEghfmN6KqqkPLFVT3jW3roWBIdDVuqyFihKII8tq72JCBZB925PeascQbAUS7KDENf0YrdFIczVPRrdRUkkcARK-uGAXjZUgtoyWE5ByT-RsKweRlsPLZXQ9yFLJGH5kxfHE04EqirKp-aowchDqGdhrq-6BODGEZu89mKPUHBCI_egPfsJR90jr6GWc2',
      imageAlt: 'Leather loafers',
    },
    {
      id: '11', name: 'Slim Fit Chinos', variants: 'Navy, Khaki, Grey',
      sku: 'CLO-CHIN-SF', category: 'Clothing', categoryColor: 'bg-pink-50 text-pink-700',
      type: 'Physical', typeIcon: 'inventory_2', price: 59.99, enabled: true,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD58Kd2Ha65rqn3cj8Jcpxj4s8UNuMv-RVVP_Dz95QiPbplb3A_V8b6Tw8afT-ffWwVBg8eSfLHaragPSPORY-NG2-oHFru7rWyI3clg38wk98WC69RXS3C6VFHLWbhF_zn2INfG2WQAEBSAOQSUKUvW805dw9t_iRfgwGCS_Mhhan4F29nX4hNhhFGoKN2Cpl7aBFMt7EkDBwO43jY-zKdvS8xGSe2BkdhsVQnk1cPwhZNpvekmLDQ3oXxZ43-blAxKLS7ujOCxzqn',
      imageAlt: 'Slim fit chinos',
    },
    {
      id: '12', name: '4K Webcam Ultra HD', variants: 'With mic',
      sku: 'ACC-CAM-4K', category: 'Electronics', categoryColor: 'bg-orange-50 text-orange-700',
      type: 'Physical', typeIcon: 'inventory_2', price: 149.00, enabled: true,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFZe-nPq6jH2IXdZfNaNedTH90W6v37vLcl4MgzHMJTHx79RDixRIGlGtA-nhXpPbpm93g4W-Iyy_bckH8KfPC01FzdF9ecrOgegvKY3TTukInIZjpCqNyPSCwrKE-T-_bqFbSG2QxNrV42GZwhMyDUI8to1o1cP0PN6kbflxTWYJg8-OXzXiBcU0o225bN-kK508NeAMOOyyQs_FAStQmw11X6RTinMoIDSJtSUd6yCfQQojkBAyFIfc_v_Ufrcc_yotGDtiuZBF7',
      imageAlt: '4K webcam',
    },
  ];

  // ── Filters ───────────────────────────────────────────────────────
  searchQuery = '';
  selectedCategory = '';
  selectedType = '';

  get availableCategories(): string[] {
    return [...new Set(this.allProducts.map(p => p.category))].sort();
  }

  get activeFilterCount(): number {
    return [this.searchQuery, this.selectedCategory, this.selectedType].filter(Boolean).length;
  }

  get filteredProducts(): InventoryProduct[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.allProducts.filter(p => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchCat = !this.selectedCategory || p.category === this.selectedCategory;
      const matchTyp = !this.selectedType || p.type === this.selectedType;
      return matchQ && matchCat && matchTyp;
    });
  }

  onFilterChange(): void { this.currentPage = 1; }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedType = '';
    this.currentPage = 1;
  }

  // ── Row selection ─────────────────────────────────────────────────
  selectedIds = new Set<string>();

  get selectedCount(): number { return this.selectedIds.size; }

  get allSelected(): boolean {
    return this.pagedProducts.length > 0
      && this.pagedProducts.every(p => this.selectedIds.has(p.id));
  }

  toggleAll(checked: boolean): void {
    this.pagedProducts.forEach(p =>
      checked ? this.selectedIds.add(p.id) : this.selectedIds.delete(p.id)
    );
  }

  toggleRow(id: string, checked: boolean): void {
    checked ? this.selectedIds.add(id) : this.selectedIds.delete(id);
  }

  // ── Toggle enable/disable ─────────────────────────────────────────
  toggleEnabled(product: InventoryProduct): void {
    product.enabled = !product.enabled;
  }

  // ── Pagination ────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 6;

  get totalItems(): number { return this.filteredProducts.length; }
  get totalPages(): number { return Math.ceil(this.totalItems / this.pageSize); }
  get showingFrom(): number { return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get showingTo(): number { return Math.min(this.currentPage * this.pageSize, this.totalItems); }

  get pagedProducts(): InventoryProduct[] {
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

  // ── Helpers ───────────────────────────────────────────────────────
  formatPrice(price: number): string {
    return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  addProduct(): void { alert('Open Add Product form'); }
  exportData(): void { alert('Exporting data…'); }
  editProduct(p: InventoryProduct): void { alert(`Edit: ${p.name}`); }
  moreActions(p: InventoryProduct): void { alert(`More actions: ${p.name}`); }

  ngOnInit(): void { }

}
