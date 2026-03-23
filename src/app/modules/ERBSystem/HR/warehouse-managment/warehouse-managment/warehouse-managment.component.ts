import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr'; // ✅ import ToastrService
import {
  WarehouseService,
  TransferPayload,
  WarehouseProduct,
  WarehouseOption,
  WarehouseNode,
  InventoryNode,
} from '../../../../../core/services/warehouse/warehouse.service';
import { SidebaSalesComponent } from '../../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component';
import { SiedbarWarehouseComponent } from "../../../../../shared/UI/siedbar-warehouse/siedbar-warehouse/siedbar-warehouse.component";

export interface Warehouse {
  id: string; initials: string; name: string; manager: string;
  managerEmail: string; managerAvatar: string; address: string; city: string;
  type: 'Main Distribution' | 'Retail';
  status: 'Active' | 'Maintenance' | 'Inactive';
  color: string; selected?: boolean;
}

export interface StockTransferForm {
  fromWarehouse: string; toWarehouse: string; productSearch: string;
  transferItems: WarehouseProduct[]; scheduledDate: string;
  referenceNumber: string; notes: string;
}

export interface AddWarehouseForm {
  name: string; street: string; city: string;
  state: string; postalCode: string; country: string; type: number;
}

@Component({
  selector: 'app-warehouse-managment',
  imports: [CommonModule, FormsModule, SidebaSalesComponent, SiedbarWarehouseComponent],
  templateUrl: './warehouse-managment.component.html',
  styleUrl: './warehouse-managment.component.scss',
})
export class WarehouseManagmentComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  // ✅ inject ToastrService
  constructor(
    private warehouseService: WarehouseService,
    private toastr: ToastrService
  ) { }

  inventories: InventoryNode[] = [];
  isLoadingWarehouses = false;
  warehousesError = '';

  private mapWarehouse(node: WarehouseNode, index: number): Warehouse {
    const colors = ['blue', 'purple', 'orange', 'emerald', 'pink', 'teal'];
    const words = node.name.trim().split(/\s+/);
    const initials = words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : node.name.slice(0, 2).toUpperCase();

    return {
      id: node.id,
      initials,
      name: node.name,
      manager: node.managerName ?? '—',
      managerEmail: '',
      managerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(node.managerName ?? 'N A')}&background=random`,
      address: node.street,
      city: `${node.city}, ${node.country}`,
      type: node.type === 'Main' ? 'Main Distribution' : 'Retail',
      status: (node.status as 'Active' | 'Maintenance' | 'Inactive') ?? 'Active',
      color: colors[index % colors.length],
    };
  }

  loadWarehouses(): void {
    this.isLoadingWarehouses = true;
    this.warehousesError = '';
    this.warehouseService.getWarehouses().subscribe({
      next: (nodes) => {
        this.warehouses = nodes.map((n, i) => this.mapWarehouse(n, i));
        this.totalResults = this.warehouses.length;
        this.isLoadingWarehouses = false;

        this.warehouseOptions = nodes.map(n => ({
          value: n.name,
          guid: n.id,
          label: `${n.name} - ${n.city}`,
        }));
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.warehouseOptions));
        }
      },
      error: (err) => {
        this.warehousesError = err?.message ?? 'Failed to load warehouses.';
        this.isLoadingWarehouses = false;
      },
    });
  }

  searchQuery = ''; selectAll = false; currentPage = 1; totalResults = 12; pageSize = 5;

  warehouses: Warehouse[] = [
    { id: 'WH-2024-001', initials: 'NL', name: 'North Logistics Hub', manager: 'Sarah Jenkins', managerEmail: 'sarah.j@acme.corp', managerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDadC-pO__wUh3b3HCGdux2f-cdve9x7gONO7LcPTHkl68Eoh8ZNPH4M05VTYzFMD0sBuwYVdDypOt27szWzESP_hmb4BTeF0i4qExCVzJgJgcpo2i62I-9gqCKemrv042GX8_UQyHzfArmmIurxutG5Pvhv5szXRewHAbQ3Eg4H9OowAhpsG-Hgrp2pjMukQGTTqNR9aJhsiwODg6OCUSwbQxgcRt8eO4SWgQPW3UQ_dDwwGZi6Pvbvoj3Jnsill-qJtUCaZRfi8Ir', address: '4500 Industrial Pkwy', city: 'Chicago, IL 60614', type: 'Main Distribution', status: 'Active', color: 'blue' },
    { id: 'WH-2024-002', initials: 'EC', name: 'East Coast Retail', manager: 'Mike Ross', managerEmail: 'mike.r@acme.corp', managerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWUtN_KqxRqonf_ZKNV4sXKmOZQ8VEgNBZ-L0zmjNZGDHVJIqXEvNLkCQLtxWJKldvAvxfOELuVaAqBrCQ_mDzgquHbysb8AIgYr6ZqaPuMSwi4mrK80nkekU1Kii0dGBATJc3_FeIW4RqGpi8sgUDkBnIjh7uhZDbYRzhnPr028oTPS6l1JdVKqeu6Mxs_wiNlMZ1UNg5kVztuAdx3z2MRP_STxcY2Yy040JxnSIXxDEIRsru3Qedcxk5iZYMi1I45ELUyzlAy8gM', address: '1200 Market St', city: 'Philadelphia, PA 19107', type: 'Retail', status: 'Maintenance', color: 'purple' },
    { id: 'WH-2024-003', initials: 'WA', name: 'West Annex', manager: 'Jessica Pearson', managerEmail: 'jessica.p@acme.corp', managerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEC-yPJ7DfqV4txdoYX34F1yHIKcZXuXWx0paMa9WSQd3DxzQoTfU6Qx6st0LEJft_urrJ9lRjWBuhyEjUj2b1bzxdR08UVKfrkuDtbbny_7EIMLoaR8h369eX0gXaVn7LhSWdmr7QUZhQNqormzomD6YUEWPqLVjcxRKyLuh3IyL18bLhYTku8593dyaFQO7d7gktk3Dvrl2OzeBtPEegAh2fXLwpO8sbRcj35e7o0RbKwvu4rcJhrjVCeUVz0bomKEUW9DuB9eXf', address: '880 Harbor Blvd', city: 'San Diego, CA 92101', type: 'Main Distribution', status: 'Inactive', color: 'orange' },
    { id: 'WH-2024-004', initials: 'TX', name: 'Texas Central', manager: 'Harvey Specter', managerEmail: 'harvey.s@acme.corp', managerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQRPkcYrdoKPmBq5sIJ8RI-G_OZJ53Dp80Z2YOUbq4eLQOw9rpyfyFZMkk9-bXJ25vcpDqNExlcLpqwL-sl9u3eKl4erVjEeSIWAMaOT19fqOqlQgKBR0UAUJeTiZXZ_ka_KMjn9uEmFqlXTEDJ2LDrpfNrh-tdqbUF4FiSXxyv0H4FJIfndfaq1kpE-3bc8A_8o8Lo1e7NsZhbskfbdJfR5-cxEFC1OQiGbgMbrh-Awq-WKqqH0Jj2PUeGyjIt9IlCU67bKA52UCI', address: '221B Commerce Way', city: 'Austin, TX 78701', type: 'Retail', status: 'Active', color: 'emerald' },
    { id: 'WH-2024-005', initials: 'FL', name: 'Florida Gateway', manager: 'Louis Litt', managerEmail: 'louis.l@acme.corp', managerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnB2Eis6k7_ASLzR3Jb9ihhalV7-wHcyW1IJf4olcQ4CjWAOYg1f4fDzHUq0VU2t4ENIKkL5athkC65QhL0dqLDS9cOGJxkiBbmOPAX4LQzHCnvwmxPR4oOs2Im7k8ouiC_xxsRzzM-C6VM-uQKocEdy3er7QwezN7W4OPDIwcVckDiPZrgaAhUqVWeqYjWJLY0J6QQF0ibb7zVkRKGUYfOrBIEQUYNUIstA8wBCEe21V_TEunqFIiksKANP1Ro6vIuVGLJFOUZkBA', address: '99 Ocean Dr', city: 'Miami, FL 33101', type: 'Main Distribution', status: 'Active', color: 'pink' },
  ];

  get filteredWarehouses(): Warehouse[] {
    if (!this.searchQuery.trim()) return this.warehouses;
    const q = this.searchQuery.toLowerCase();
    return this.warehouses.filter(w =>
      w.name.toLowerCase().includes(q) || w.manager.toLowerCase().includes(q) ||
      w.address.toLowerCase().includes(q) || w.city.toLowerCase().includes(q)
    );
  }
  get totalPages(): number { return Math.ceil(this.totalResults / this.pageSize); }
  get pageEnd(): number { return Math.min(this.currentPage * this.pageSize, this.totalResults); }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  toggleSelectAll(): void { this.selectAll = !this.selectAll; this.warehouses.forEach(w => (w.selected = this.selectAll)); }
  getInitialsBg(c: string): string { return ({ blue: 'bg-blue-100 text-blue-700', purple: 'bg-purple-100 text-purple-700', orange: 'bg-orange-100 text-orange-700', emerald: 'bg-emerald-100 text-emerald-700', pink: 'bg-pink-100 text-pink-700' } as Record<string, string>)[c] ?? 'bg-slate-100 text-slate-700'; }
  getStatusClass(s: string): string { return ({ Active: 'bg-green-50 text-green-700 border-green-100', Maintenance: 'bg-yellow-50 text-yellow-700 border-yellow-100', Inactive: 'bg-red-50 text-red-700 border-red-100' } as Record<string, string>)[s] ?? ''; }
  getStatusDotClass(s: string): string { return ({ Active: 'bg-green-500', Maintenance: 'bg-yellow-500', Inactive: 'bg-red-500' } as Record<string, string>)[s] ?? 'bg-slate-500'; }
  getTypeClass(t: string): string { return t === 'Retail' ? 'bg-blue-50 text-blue-800 border-blue-100' : 'bg-slate-100 text-slate-800 border-slate-200'; }
  goToPage(p: number): void { this.currentPage = p; }
  prevPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }

  private readonly STORAGE_KEY = 'erp_warehouse_options';
  warehouseOptions: WarehouseOption[] = [];

  // ── Add Warehouse Modal ───────────────────────────────────────────
  showAddWarehouseModal = false;
  isAddingWarehouse = false;
  addWarehouseError = '';
  addWarehouseSuccess = false;
  addWarehouseForm: AddWarehouseForm = this.blankWarehouseForm();

  // ── Transfer Modal ────────────────────────────────────────────────
  showTransferPage = false;
  showCatalogDropdown = false;
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;
  catalogItems: WarehouseProduct[] = [];
  isLoadingProducts = false;
  productsError = '';

  transferForm: StockTransferForm = this.blankForm();

  ngOnInit(): void {
    this.loadWarehouseOptions();
    this.loadProducts();
    this.loadWarehouses();
  }

  loadInventories(): void {
    this.warehouseService.getInventories().subscribe({
      next: (inv) => { this.inventories = inv; },
      error: () => { }
    });
  }

  loadWarehouseOptions(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (nodes) => {
        this.warehouseOptions = nodes.map(n => ({
          value: n.name,
          guid: n.id,
          label: `${n.name} - ${n.city}`,
        }));
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.warehouseOptions));
        }
      },
      error: () => {
        if (isPlatformBrowser(this.platformId)) {
          try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            this.warehouseOptions = stored ? JSON.parse(stored) : [];
          } catch {
            this.warehouseOptions = [];
          }
        }
      }
    });
  }

  private saveWarehouseOption(option: WarehouseOption): void {
    this.warehouseOptions = [...this.warehouseOptions, option];
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.warehouseOptions));
    }
  }

  // ── Add Warehouse ─────────────────────────────────────────────────
  openAddWarehouseModal(): void {
    (document.activeElement as HTMLElement)?.blur();
    this.addWarehouseForm = this.blankWarehouseForm();
    this.addWarehouseError = '';
    this.addWarehouseSuccess = false;
    this.showAddWarehouseModal = true;
  }

  closeAddWarehouseModal(): void {
    if (this.isAddingWarehouse) return;
    this.showAddWarehouseModal = false;
  }

  submitAddWarehouse(): void {
    if (this.isAddingWarehouse) return;
    const f = this.addWarehouseForm;
    if (!f.name.trim() || !f.street.trim() || !f.city.trim() || !f.country.trim()) {
      this.toastr.error('Please fill in all required fields.', 'Validation Error');
      return;
    }
    this.isAddingWarehouse = true;
    this.addWarehouseError = '';
    this.addWarehouseSuccess = false;

    this.warehouseService.addWarehouse(f).subscribe({
      next: (res: any) => {
        const newId = res?.data?.id ?? res?.id ?? crypto.randomUUID();
        this.saveWarehouseOption({ value: f.name, guid: newId, label: `${f.name} - ${f.city}` });
        this.isAddingWarehouse = false;
        this.addWarehouseSuccess = true;
        // ✅ success toastr بالرسالة من الـ API
        this.toastr.success(res?.message ?? `"${f.name}" created successfully.`, 'Warehouse Created');
        setTimeout(() => {
          this.addWarehouseSuccess = false;
          this.loadWarehouses();
          this.closeAddWarehouseModal();
        }, 1500);
      },
      error: (err) => {
        this.isAddingWarehouse = false;
        const msg = err?.error?.errors?.[0] ?? err?.error?.message ?? err?.message ?? 'Failed to create warehouse.';
        this.addWarehouseError = msg;
        // ✅ error toastr بالرسالة من الـ API
        this.toastr.error(msg, 'Create Failed');
      },
    });
  }

  // ── Products ──────────────────────────────────────────────────────
  loadProducts(): void {
    this.isLoadingProducts = true;
    this.productsError = '';
    this.warehouseService.getProducts().subscribe({
      next: (products) => { this.catalogItems = products; this.isLoadingProducts = false; },
      error: (err) => { this.productsError = err?.message ?? 'Failed to load products.'; this.isLoadingProducts = false; },
    });
  }

  // ── Transfer Modal ────────────────────────────────────────────────
  get filteredCatalogItems(): WarehouseProduct[] {
    const q = this.transferForm.productSearch.toLowerCase();
    const added = new Set(this.transferForm.transferItems.map(i => i.sku));
    const all = this.catalogItems.filter(i => !added.has(i.sku));
    return q ? all.filter(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)) : all;
  }

  get canCompleteTransfer(): boolean {
    return !this.isSubmitting &&
      !!this.transferForm.fromWarehouse && !!this.transferForm.toWarehouse &&
      this.transferForm.fromWarehouse !== this.transferForm.toWarehouse &&
      this.transferForm.transferItems.length > 0 &&
      this.transferForm.transferItems.every(i => i.qtyToTransfer > 0);
  }

  get sourceGuid(): string { return this.warehouseOptions.find(w => w.value === this.transferForm.fromWarehouse)?.guid ?? ''; }
  get destGuid(): string { return this.warehouseOptions.find(w => w.value === this.transferForm.toWarehouse)?.guid ?? ''; }

  openTransferPage(): void {
    this.transferForm = this.blankForm();
    this.showCatalogDropdown = false;
    this.isSubmitting = false;
    this.submitError = '';
    this.submitSuccess = false;
    this.showTransferPage = true;
    this.loadProducts();
    this.isLoadingProducts = true;

    this.warehouseService.getWarehouses().subscribe({
      next: (warehouses) => {
        const warehouseIdMap = new Map(warehouses.map(w => [w.name.toLowerCase().trim(), w.id]));
        this.warehouseService.getInventories().subscribe({
          next: (inv) => {
            this.inventories = inv;
            this.isLoadingProducts = false;
            const uniqueNames = [...new Set(inv.map(i => i.warehouseName))];
            this.warehouseOptions = uniqueNames.map(name => ({
              value: name,
              guid: warehouseIdMap.get(name.toLowerCase().trim()) ?? name,
              label: name,
            }));
          },
          error: (err) => { console.error('❌ inventories error:', err); this.isLoadingProducts = false; }
        });
      },
      error: (err) => { console.error('❌ warehouses error:', err); this.isLoadingProducts = false; }
    });
  }

  closeTransferPage(): void {
    if (this.isSubmitting) return;
    this.showCatalogDropdown = false;
    this.showTransferPage = false;
  }

  addCatalogItem(item: WarehouseProduct): void {
    const selectedWarehouseName = this.warehouseOptions.find(w => w.value === this.transferForm.fromWarehouse)?.value ?? '';
    const allMatches = this.inventories.filter(i => i.sku === item.sku);
    const inv = selectedWarehouseName
      ? allMatches.find(i => i.warehouseName.toLowerCase().trim() === selectedWarehouseName.toLowerCase().trim())
      : allMatches.find(i => i.quantityAvailable > 0);
    const realStock = inv?.quantityAvailable ?? 0;

    if (!selectedWarehouseName) {
      this.submitError = 'Please select a source warehouse first.';
      this.toastr.warning('Please select a source warehouse first.', 'Warning');
      return;
    }

    if (realStock === 0) {
      const alternatives = allMatches.filter(i => i.quantityAvailable > 0).map(i => `${i.warehouseName} (${i.quantityAvailable} units)`).join(', ');
      const msg = `"${item.name}" has no stock in ${selectedWarehouseName}.` + (alternatives ? ` Available in: ${alternatives}` : '');
      this.submitError = msg;
      this.toastr.error(msg, 'No Stock');
      return;
    }

    this.submitError = '';
    this.transferForm.transferItems = [...this.transferForm.transferItems, { ...item, availableStock: realStock, qtyToTransfer: 1 }];
    this.transferForm.productSearch = '';
    this.showCatalogDropdown = false;
  }

  removeTransferItem(sku: string): void {
    this.transferForm.transferItems = this.transferForm.transferItems.filter(i => i.sku !== sku);
  }

  completeTransfer(): void {
    if (!this.canCompleteTransfer) return;

    const invalid = this.transferForm.transferItems.find(i => i.qtyToTransfer > i.availableStock);
    if (invalid) {
      const msg = `"${invalid.name}" quantity (${invalid.qtyToTransfer}) exceeds available stock (${invalid.availableStock}).`;
      this.submitError = msg;
      this.toastr.error(msg, 'Invalid Quantity');
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = false;

    const payloads: TransferPayload[] = this.transferForm.transferItems.map(item => ({
      sourceWarehouseId: this.sourceGuid,
      destinationWarehouseId: this.destGuid,
      productId: item.productId,
      sku: item.sku,
      qty: item.qtyToTransfer,
      reference: this.transferForm.referenceNumber,
    }));

    this.warehouseService.transferProducts(payloads).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        // ✅ success toastr بالرسالة من الـ API
        this.toastr.success(res?.message ?? 'Stock transfer completed successfully.', 'Transfer Complete');
        setTimeout(() => this.closeTransferPage(), 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        const apiError = err?.error?.errors?.[0] ?? err?.error?.message ?? err?.message;
        const msg = apiError?.includes('Insufficient')
          ? 'Insufficient stock in source warehouse. Please check available quantities.'
          : apiError ?? 'Transfer failed. Please try again.';
        this.submitError = msg;
        // ✅ error toastr بالرسالة من الـ API
        this.toastr.error(msg, 'Transfer Failed');
      },
    });
  }

  formatStock(n: number): string { return new Intl.NumberFormat('en-US').format(n); }

  private blankForm(): StockTransferForm {
    return {
      fromWarehouse: '', toWarehouse: '', productSearch: '', transferItems: [],
      scheduledDate: new Date().toISOString().slice(0, 10),
      referenceNumber: `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: '',
    };
  }

  private blankWarehouseForm(): AddWarehouseForm {
    return { name: '', street: '', city: '', state: '', postalCode: '', country: '', type: 1 };
  }

  // ── Edit Warehouse Modal ───────────────────────────────────────────
  showEditWarehouseModal = false;
  isEditingWarehouse = false;
  editWarehouseError = '';
  editWarehouseSuccess = false;
  editWarehouseForm: AddWarehouseForm = this.blankWarehouseForm();
  editingWarehouseId = '';

  openEditWarehouseModal(wh: Warehouse): void {
    this.editingWarehouseId = wh.id;
    this.editWarehouseForm = { name: wh.name, street: wh.address, city: wh.city, state: '', postalCode: '', country: '', type: wh.type === 'Retail' ? 2 : 1 };
    this.editWarehouseError = '';
    this.editWarehouseSuccess = false;
    this.showEditWarehouseModal = true;
  }

  closeEditWarehouseModal(): void {
    if (this.isEditingWarehouse) return;
    this.showEditWarehouseModal = false;
  }

  submitEditWarehouse(): void {
    if (this.isEditingWarehouse) return;
    const f = this.editWarehouseForm;
    if (!f.name.trim() || !f.street.trim() || !f.city.trim() || !f.country.trim()) {
      this.editWarehouseError = 'Please fill in all required fields.';
      this.toastr.error('Please fill in all required fields.', 'Validation Error');
      return;
    }
    this.isEditingWarehouse = true;
    this.editWarehouseError = '';

    this.warehouseService.updateWarehouse(this.editingWarehouseId, f).subscribe({
      next: (res: any) => {
        const idx = this.warehouses.findIndex(w => w.id === this.editingWarehouseId);
        if (idx !== -1) {
          this.warehouses[idx] = { ...this.warehouses[idx], name: f.name, address: f.street, city: f.city, type: f.type === 2 ? 'Retail' : 'Main Distribution' };
        }
        const optIdx = this.warehouseOptions.findIndex(w => w.guid === this.editingWarehouseId);
        if (optIdx !== -1) {
          this.warehouseOptions[optIdx] = { ...this.warehouseOptions[optIdx], value: f.name, label: `${f.name} - ${f.city}` };
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.warehouseOptions));
          }
        }
        this.isEditingWarehouse = false;
        this.editWarehouseSuccess = true;
        // ✅ success toastr بالرسالة من الـ API
        this.toastr.success(res?.message ?? `"${f.name}" updated successfully.`, 'Warehouse Updated');
        setTimeout(() => this.closeEditWarehouseModal(), 1500);
      },
      error: (err) => {
        this.isEditingWarehouse = false;
        const msg = err?.error?.message ?? err?.message ?? 'Failed to update warehouse.';
        this.editWarehouseError = msg;
        // ✅ error toastr بالرسالة من الـ API
        this.toastr.error(msg, 'Update Failed');
      },
    });
  }
}