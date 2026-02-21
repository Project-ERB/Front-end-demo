import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './category-mangement.component.html',
  styleUrl: './category-mangement.component.scss',
})
export class CategoryMangementComponent implements OnInit {

  // ── Sidebar nav (same as Sales Analysis) ─────────────────────────────────
  navItems = [
    { icon: 'grid_view', label: 'Dashboard', active: false },
    { icon: 'trending_up', label: 'Sales Analysis', active: false },
    { icon: 'category', label: 'Categories', active: true },
    { icon: 'inventory_2', label: 'Products', active: false },
    { icon: 'percent', label: 'Discounts', active: false },
  ];

  // ── Tree data ─────────────────────────────────────────────────────────────
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

  // ── Table data ────────────────────────────────────────────────────────────
  allCategories: Category[] = [
    { id: '1', code: 'CAT-0042', name: 'Gaming Laptops', description: 'High-performance portable computers for gaming.', parent: 'Computers', status: 'Active', selected: false },
    { id: '2', code: 'CAT-0043', name: 'Business Ultrabooks', description: 'Thin and light laptops for enterprise use.', parent: 'Computers', status: 'Active', selected: false },
    { id: '3', code: 'CAT-0089', name: 'Desktops – All-in-One', description: 'Integrated monitor and computer units.', parent: 'Computers', status: 'Draft', selected: false },
    { id: '4', code: 'CAT-0091', name: 'Workstations', description: 'Professional grade desktop towers.', parent: 'Computers', status: 'Active', selected: false },
    { id: '5', code: 'CAT-0102', name: 'Accessories', description: 'Mice, keyboards, and stands.', parent: 'Computers', status: 'Archived', selected: false },
    { id: '6', code: 'CAT-0110', name: 'Flagship Smartphones', description: 'Top-tier phones from major manufacturers.', parent: 'Smartphones', status: 'Active', selected: false },
    { id: '7', code: 'CAT-0111', name: 'Budget Phones', description: 'Affordable smartphones for everyday use.', parent: 'Smartphones', status: 'Active', selected: false },
    { id: '8', code: 'CAT-0115', name: 'DSLR Cameras', description: 'Professional digital single-lens reflex cameras.', parent: 'Cameras', status: 'Active', selected: false },
    { id: '9', code: 'CAT-0116', name: 'Mirrorless Cameras', description: 'Compact interchangeable-lens cameras.', parent: 'Cameras', status: 'Draft', selected: false },
    { id: '10', code: 'CAT-0120', name: 'Men\'s Outerwear', description: 'Jackets, coats and rainwear for men.', parent: 'Apparel', status: 'Active', selected: false },
    { id: '11', code: 'CAT-0121', name: 'Women\'s Dresses', description: 'Casual and formal dresses for women.', parent: 'Apparel', status: 'Active', selected: false },
    { id: '12', code: 'CAT-0130', name: 'Indoor Plants', description: 'Live plants and planters for home décor.', parent: 'Home & Garden', status: 'Active', selected: false },
    { id: '13', code: 'CAT-0131', name: 'Garden Tools', description: 'Shovels, rakes and pruning equipment.', parent: 'Home & Garden', status: 'Archived', selected: false },
  ];

  // ── Search & sort ─────────────────────────────────────────────────────────
  searchQuery = '';
  sortCol: keyof Category = 'name';
  sortDir: 'asc' | 'desc' = 'asc';

  sort(col: keyof Category): void {
    if (this.sortCol === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCol = col;
      this.sortDir = 'asc';
    }
    this.currentPage = 1;
  }

  get filteredCategories(): Category[] {
    const q = this.searchQuery.toLowerCase().trim();
    let list = this.allCategories.filter(c =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.parent.toLowerCase().includes(q)
    );
    list = [...list].sort((a, b) => {
      const av = String(a[this.sortCol]).toLowerCase();
      const bv = String(b[this.sortCol]).toLowerCase();
      return this.sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }

  // ── Bulk selection ────────────────────────────────────────────────────────
  get selectedCount(): number {
    return this.allCategories.filter(c => c.selected).length;
  }

  get allOnPageSelected(): boolean {
    return this.pagedCategories.length > 0 && this.pagedCategories.every(c => c.selected);
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.pagedCategories.forEach(c => c.selected = checked);
  }

  deleteSelected(): void {
    if (this.selectedCount === 0) return;
    if (confirm(`Delete ${this.selectedCount} selected categories?`)) {
      this.allCategories = this.allCategories.filter(c => !c.selected);
      this.currentPage = 1;
    }
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 5;

  get totalItems(): number { return this.filteredCategories.length; }
  get totalPages(): number { return Math.ceil(this.totalItems / this.pageSize); }
  get showingFrom(): number { return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get showingTo(): number { return Math.min(this.currentPage * this.pageSize, this.totalItems); }

  get pagedCategories(): Category[] {
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

  // ── Status badge helper ───────────────────────────────────────────────────
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

  /** Flat list of parent options built from the tree for the dropdown */
  get parentOptions(): { label: string; value: string; depth: number }[] {
    const result: { label: string; value: string; depth: number }[] = [];
    const flatten = (nodes: TreeNode[], depth: number) => {
      nodes.forEach(n => {
        result.push({ label: n.label, value: n.label, depth });
        if (n.children) flatten(n.children, depth + 1);
      });
    };
    // Skip root "All Categories"
    if (this.tree[0]?.children) flatten(this.tree[0].children, 0);
    return result;
  }

  get filteredParentOptions() {
    const q = this.parentSearchQuery.toLowerCase().trim();
    return this.parentOptions.filter(o => !q || o.label.toLowerCase().includes(q));
  }

  openModal(category?: Category): void {
    if (category) {
      this.form = {
        name: category.name,
        code: category.code,
        parent: category.parent,
        description: category.description,
        isActive: category.status === 'Active',
      };
    } else {
      this.form = { name: '', code: '', parent: '', description: '', isActive: true };
    }
    this.formErrors = {};
    this.isModalOpen = true;
    this.isParentDropdownOpen = false;
    this.parentSearchQuery = '';
    this.editingCategory = category ?? null;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.isParentDropdownOpen = false;
    this.editingCategory = null;
  }

  editingCategory: Category | null = null;

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
    // Auto-generate code from name if code is empty
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

  saveCategory(): void {
    if (!this.validateForm()) return;

    if (this.editingCategory) {
      // Update existing
      const idx = this.allCategories.findIndex(c => c.id === this.editingCategory!.id);
      if (idx > -1) {
        this.allCategories[idx] = {
          ...this.allCategories[idx],
          name: this.form.name.trim(),
          code: this.form.code.trim(),
          parent: this.form.parent,
          description: this.form.description.trim(),
          status: this.form.isActive ? 'Active' : 'Draft',
        };
      }
    } else {
      // Create new
      const newId = String(Date.now());
      this.allCategories = [...this.allCategories, {
        id: newId,
        code: this.form.code.trim(),
        name: this.form.name.trim(),
        description: this.form.description.trim(),
        parent: this.form.parent || '—',
        status: this.form.isActive ? 'Active' : 'Draft',
        selected: false,
      }];
    }
    this.closeModal();
  }

  ngOnInit(): void { }
}
