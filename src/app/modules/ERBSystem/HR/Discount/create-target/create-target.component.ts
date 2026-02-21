import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type TargetType = 'products' | 'categories' | 'customer-groups';

export interface TargetTypeOption {
  value: TargetType;
  label: string;
  icon: string;
}

export interface SelectableItem {
  id: number;
  name: string;
  meta: string;
  selected: boolean;
}

@Component({
  selector: 'app-create-target',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-target.component.html',
  styleUrl: './create-target.component.scss',
})
export class CreateTargetComponent {

  navItems = [
    { icon: 'grid_view', label: 'Dashboard', active: false },
    { icon: 'trending_up', label: 'Sales Analysis', active: false },
    { icon: 'category', label: 'Categories', active: false },
    { icon: 'inventory_2', label: 'Products', active: false },
    { icon: 'percent', label: 'Discounts', active: true },
  ];

  steps = [
    { number: 1, label: 'General' },
    { number: 2, label: 'Targets & Schedule' },
    { number: 3, label: 'Review' },
  ];
  currentStep = 2;

  // Target type
  targetTypeOptions: TargetTypeOption[] = [
    { value: 'products', label: 'Specific Products', icon: 'shopping_bag' },
    { value: 'categories', label: 'Categories', icon: 'category' },
    { value: 'customer-groups', label: 'Customer Groups', icon: 'groups' },
  ];
  selectedTargetType: TargetType = 'products';

  // Search
  searchQuery = '';

  // Items list
  items: SelectableItem[] = [
    { id: 1, name: 'Wireless Noise-Cancelling Headphones', meta: 'SKU: AUD-2024-X1 • $299.00', selected: true },
    { id: 2, name: 'Smart Home Security Camera System', meta: 'SKU: HOM-SEC-CAM • $149.99', selected: true },
    { id: 3, name: 'Ergonomic Office Chair - Mesh', meta: 'SKU: FUR-OFF-001 • $189.00', selected: false },
    { id: 4, name: 'Minimalist Desk Lamp', meta: 'SKU: LIT-DSK-099 • $45.00', selected: false },
    { id: 5, name: 'USB-C Docking Station', meta: 'SKU: TECH-DOCK-07 • $129.00', selected: false },
  ];

  get filteredItems(): SelectableItem[] {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.items;
    return this.items.filter(i =>
      i.name.toLowerCase().includes(q) || i.meta.toLowerCase().includes(q)
    );
  }

  get selectedCount(): number {
    return this.items.filter(i => i.selected).length;
  }

  get allSelected(): boolean {
    return this.items.length > 0 && this.items.every(i => i.selected);
  }

  get someSelected(): boolean {
    return this.items.some(i => i.selected);
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.items.forEach(i => i.selected = checked);
  }

  clearAll(): void {
    this.items.forEach(i => i.selected = false);
  }

  // Schedule
  startDate = '';
  startTime = '09:00';
  endDate = '';
  endTime = '';
  neverExpires = false;

  // Actions
  goBack(): void { alert('Going back to step 1'); }
  saveDraft(): void { alert('Draft saved!'); }
  publish(): void { alert('Discount published!'); }

}
