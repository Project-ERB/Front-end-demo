import { WarehouseProduct } from './../../../../../core/services/warehouse/warehouse.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  WarehouseService,
} from '../../../../../core/services/warehouse/warehouse.service';
import { SiedbarWarehouseComponent } from "../../../../../shared/UI/siedbar-warehouse/siedbar-warehouse/siedbar-warehouse.component";
import { ToastrService } from 'ngx-toastr';

export type StockStatus = 'normal' | 'low';
export type ActiveTab = 'inventory' | 'movements' | 'adjustments' | 'settings';
export type TransactionType = 'Stock In' | 'Stock Out' | 'Transfer' | 'Adjustment';
export type AdjustmentType = 'Physical Count' | 'Damage' | 'Found' | 'Theft/Loss';

export interface InventoryItem {
  inventoryId?: string;
  productId?: string;
  sku: string; name: string; imageUrl: string; imageAlt: string;
  onHand: number; reserved: number; available: number;
  avgCost: number; lastStock: string; stockStatus: StockStatus;
}

export interface StockMovement {
  date: string; time: string; type: TransactionType;
  productName: string; sku: string; imageUrl: string;
  quantityChange: number;
  userInitials: string; userName: string; userAvatarColor: string;
  referenceId: string;
}

export interface Adjustment {
  date: string; time: string;
  productName: string; sku: string; imageUrl: string;
  type: AdjustmentType;
  systemQty: number; actualQty: number; difference: number;
  reason: string;
  approverInitials: string; approverName: string;
}

export interface StorageZone { name: string; type: string; capacity: string; }
export interface Personnel { name: string; role: string; avatarUrl?: string; initials?: string; avatarColor?: string; }
export interface InventoryRule { label: string; description: string; enabled: boolean; }

@Component({
  selector: 'app-warehouse-details',
  imports: [CommonModule, FormsModule, SiedbarWarehouseComponent],
  templateUrl: './warehouse-details.component.html',
  styleUrl: './warehouse-details.component.scss',
})
export class WarehouseDetailsComponent implements OnInit {

  constructor(
    private warehouseService: WarehouseService,
    private route: ActivatedRoute,
    private toast: ToastrService
  ) { }

  // ── Warehouse selector ────────────────────────────────────────────
  warehouseOptions: { value: string; guid: string; label: string }[] = [];
  selectedWarehouseGuid = '';
  warehouseId: string = '';

  // ── All Products (for Add Product modal) ─────────────────────────
  allProducts: WarehouseProduct[] = [];

  // ── Loading states ────────────────────────────────────────────────
  isLoadingInventory = false;
  inventoryLoadError = '';
  isLoadingMovements = false;
  movementsLoadError = '';

  isSubmittingInitStock = false;
  initStockError = '';
  initStockSuccess = false;

  isSubmittingIncreaseStock = false;
  increaseStockError = '';
  increaseStockSuccess = false;

  isSubmittingDecreaseStock = false;
  decreaseStockError = '';
  decreaseStockSuccess = false;

  isSubmittingAdjustment = false;
  adjustmentError = '';
  adjustmentSuccess = false;

  activeTab: ActiveTab = 'inventory';

  // ── Inventory tab state ──────────────────────────────────────────
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  currentPage = 1;
  totalResults = 0;
  pageSize = 5;

  // ── Stock Movements tab state ────────────────────────────────────
  movementsSearch = '';
  selectedTransactionType = '';
  selectedDateRange = 'Last 30 Days';
  movementsPage = 1;
  totalMovements = 0;

  // ── Adjustments tab state ────────────────────────────────────────
  adjustmentsSearch = '';
  selectedAdjustmentType = '';
  selectedAdjustmentDate = '';
  adjustmentsPage = 1;
  totalAdjustments = 0;

  // ── Warehouse header ─────────────────────────────────────────────
  warehouse = {
    name: 'Loading...',
    code: 'WH-001',
    manager: '—',
    address: '—',
    totalSkus: '0',
    valuation: '$0',
    utilization: 0,
    utilizationLabel: '—',
  };

  tabs: { key: ActiveTab; label: string }[] = [
    { key: 'inventory', label: 'Inventory' },
    { key: 'movements', label: 'Stock Movements' },
    { key: 'adjustments', label: 'Adjustments' },
    { key: 'settings', label: 'Settings' },
  ];

  // ── Data ─────────────────────────────────────────────────────────
  inventory: InventoryItem[] = [];
  stockMovements: StockMovement[] = [];
  adjustments: Adjustment[] = [];

  // ── ngOnInit ─────────────────────────────────────────────────────
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'] as ActiveTab;
      }
    });

    // ✅ بس loadWarehouseOptions هي اللي بتكال هنا
    // هي اللي بتكال loadInventory و loadStockMovements جوّاها
    this.loadWarehouseOptions();
    this.loadAllProducts();
    this.loadAdjustments();
  }

  // ── Load All Products (for Add Product modal) ─────────────────────
  loadAllProducts(): void {
    this.warehouseService.getProducts().subscribe({
      next: (products) => this.allProducts = products,
      error: () => { }
    });
  }

  // ── Warehouse Options ─────────────────────────────────────────────
  loadWarehouseOptions(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (nodes) => {
        console.log('🏭 warehouses from API:', nodes.map(n => ({ id: n.id, name: n.name })));

        this.warehouseOptions = nodes.map(n => ({
          value: n.name,
          guid: n.id,
          label: `${n.name} - ${n.city}`,
        }));

        if (this.warehouseOptions.length > 0) {
          this.selectedWarehouseGuid = this.warehouseOptions[0].guid;
          this.warehouseId = this.warehouseOptions[0].guid;
          this.warehouse.name = this.warehouseOptions[0].value;
          console.log('✅ selected warehouse:', this.warehouse.name, this.warehouseId);
        }

        // ✅ بيتكالوا بس بعد ما الـ warehouses اتحملت
        this.loadInventory();
        this.loadStockMovements();
      },
      error: (err) => {
        console.error('❌ getWarehouses error:', err);
        try {
          const stored = localStorage.getItem('erp_warehouse_options');
          if (stored) {
            const options = JSON.parse(stored);
            this.warehouseOptions = options;
            if (options.length > 0) {
              this.selectedWarehouseGuid = options[0].guid;
              this.warehouseId = options[0].guid;
              this.warehouse.name = options[0].value;
            }
          }
        } catch { this.warehouseId = ''; }

        this.loadInventory();
        this.loadStockMovements();
      }
    });
  }

  onWarehouseChange(): void {
    this.warehouseId = this.selectedWarehouseGuid;
    const selected = this.warehouseOptions.find(w => w.guid === this.selectedWarehouseGuid);
    if (selected) this.warehouse.name = selected.value;
    this.loadInventory();
    this.loadStockMovements();
    this.loadAdjustments();
  }

  // ── Load Inventory ────────────────────────────────────────────────
  loadInventory(): void {
    this.isLoadingInventory = true;
    this.inventoryLoadError = '';

    this.warehouseService.getInventories().subscribe({
      next: (nodes) => {
        // ✅ فلتر بالـ warehouseName
        const filtered = nodes.filter(n => n.warehouseName === this.warehouse.name);

        this.inventory = filtered.map(n => ({
          inventoryId: n.id,  // ← ده هو الـ inventoryId الصح
          productId: undefined,
          sku: n.sku,
          name: n.productName,
          imageUrl: '',
          imageAlt: n.productName,
          onHand: n.quantityOnHand,
          reserved: n.quantityReserved,
          available: n.quantityAvailable,
          avgCost: n.averageCost,
          lastStock: n.lastStockDate
            ? new Date(n.lastStockDate).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })
            : '—',
          stockStatus: n.quantityAvailable <= 0 ? 'low' : 'normal' as StockStatus,
        }));

        this.totalResults = this.inventory.length;
        this.warehouse.totalSkus = this.inventory.length.toString();
        this.isLoadingInventory = false;
      },
      error: (err) => {
        this.inventoryLoadError = err?.message ?? 'Failed to load inventory.';
        this.isLoadingInventory = false;
      },
    });
  }
  // ── Load Stock Movements ──────────────────────────────────────────
  loadStockMovements(): void {
    this.isLoadingMovements = true;
    this.movementsLoadError = '';
    this.warehouseService.getStockMovements().subscribe({
      next: (nodes) => {
        this.stockMovements = nodes.map(n => ({
          date: new Date(n.movementDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date(n.movementDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: this.mapMovementType(n.movementType),
          productName: n.productName,
          sku: n.sku,
          imageUrl: '',
          quantityChange: n.movementType === 'Out' || n.movementType === 'TransferOut' ? -n.quantity : n.quantity,
          userInitials: '—',
          userName: n.warehouseName,
          userAvatarColor: 'indigo',
          referenceId: n.reference,
        }));
        this.totalMovements = this.stockMovements.length;
        this.isLoadingMovements = false;
      },
      error: (err) => {
        this.movementsLoadError = err?.message ?? 'Failed to load movements.';
        this.isLoadingMovements = false;
      },
    });
  }

  private mapMovementType(type: string): TransactionType {
    const map: Record<string, TransactionType> = {
      'In': 'Stock In', 'Out': 'Stock Out', 'TransferIn': 'Transfer', 'TransferOut': 'Transfer',
    };
    return map[type] ?? 'Stock In';
  }

  // ── Inventory helpers ────────────────────────────────────────────
  get filteredInventory(): InventoryItem[] {
    const q = this.searchQuery.toLowerCase();
    return this.inventory.filter(item => !q || item.sku.toLowerCase().includes(q) || item.name.toLowerCase().includes(q));
  }
  get totalPages(): number { return Math.ceil(this.totalResults / this.pageSize); }
  get pageStart(): number { return this.totalResults === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get pageEnd(): number { return Math.min(this.currentPage * this.pageSize, this.totalResults); }
  isLowStock(item: InventoryItem): boolean { return item.stockStatus === 'low'; }
  prevPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }
  goToPage(page: number): void { this.currentPage = page; }

  // ── Stock Movements helpers ──────────────────────────────────────
  get filteredMovements(): StockMovement[] {
    const q = this.movementsSearch.toLowerCase();
    return this.stockMovements.filter(m => {
      const matchesSearch = !q || m.sku.toLowerCase().includes(q) || m.referenceId.toLowerCase().includes(q) || m.userName.toLowerCase().includes(q) || m.productName.toLowerCase().includes(q);
      const matchesType = !this.selectedTransactionType || m.type === this.selectedTransactionType;
      return matchesSearch && matchesType;
    });
  }
  get totalMovementPages(): number { return Math.ceil(this.totalMovements / this.pageSize); }
  get movementsPageStart(): number { return this.totalMovements === 0 ? 0 : (this.movementsPage - 1) * this.pageSize + 1; }
  get movementsPageEnd(): number { return Math.min(this.movementsPage * this.pageSize, this.totalMovements); }
  prevMovementsPage(): void { if (this.movementsPage > 1) this.movementsPage--; }
  nextMovementsPage(): void { if (this.movementsPage < this.totalMovementPages) this.movementsPage++; }
  goToMovementsPage(page: number): void { this.movementsPage = page; }

  getTransactionBadgeClass(type: string): string {
    const map: Record<string, string> = {
      'Stock In': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      'Stock Out': 'bg-amber-50 text-amber-700 ring-amber-600/20',
      'Transfer': 'bg-blue-50 text-blue-700 ring-blue-700/10',
      'Adjustment': 'bg-gray-50 text-gray-600 ring-gray-500/10',
    };
    return map[type] ?? '';
  }

  // ── Adjustments helpers ──────────────────────────────────────────
  get filteredAdjustments(): Adjustment[] {
    const q = this.adjustmentsSearch.toLowerCase();
    return this.adjustments.filter(a => {
      const matchesSearch = !q || a.sku.toLowerCase().includes(q) || a.productName.toLowerCase().includes(q) || a.reason.toLowerCase().includes(q) || a.approverName.toLowerCase().includes(q);
      const matchesType = !this.selectedAdjustmentType || a.type === this.selectedAdjustmentType;
      return matchesSearch && matchesType;
    });
  }
  get totalAdjustmentPages(): number { return Math.ceil(this.totalAdjustments / this.pageSize); }
  get adjustmentsPageStart(): number { return this.totalAdjustments === 0 ? 0 : (this.adjustmentsPage - 1) * this.pageSize + 1; }
  get adjustmentsPageEnd(): number { return Math.min(this.adjustmentsPage * this.pageSize, this.totalAdjustments); }
  prevAdjustmentsPage(): void { if (this.adjustmentsPage > 1) this.adjustmentsPage--; }
  nextAdjustmentsPage(): void { if (this.adjustmentsPage < this.totalAdjustmentPages) this.adjustmentsPage++; }
  goToAdjustmentsPage(page: number): void { this.adjustmentsPage = page; }

  getAdjustmentTypeBadgeClass(type: string): string {
    const map: Record<string, string> = {
      'Physical Count': 'bg-amber-50 text-amber-700 ring-amber-600/20',
      'Damage': 'bg-red-50 text-red-700 ring-red-600/20',
      'Found': 'bg-green-50 text-green-700 ring-green-600/20',
      'Theft/Loss': 'bg-purple-50 text-purple-700 ring-purple-600/20',
    };
    return map[type] ?? '';
  }

  getDifferenceClass(diff: number): string {
    if (diff > 0) return 'text-emerald-600';
    if (diff < 0) return 'text-red-600';
    return 'text-slate-600';
  }
  formatDifference(diff: number): string { return diff > 0 ? `+${diff}` : `${diff}`; }

  // ── Shared helpers ───────────────────────────────────────────────
  setTab(tab: ActiveTab): void { this.activeTab = tab; }

  getTabClass(tabKey: ActiveTab): Record<string, boolean> {
    const isActive = this.activeTab === tabKey;
    return {
      'border-blue-600': isActive, 'text-blue-600': isActive, 'font-semibold': isActive,
      'border-transparent': !isActive, 'text-slate-500': !isActive, 'font-medium': !isActive,
    };
  }

  getPageClass(activePage: number, page: number): Record<string, boolean> {
    const isActive = activePage === page;
    return { 'bg-blue-600': isActive, 'text-white': isActive, 'text-slate-900': !isActive };
  }

  getQuantityClass(change: number): string {
    if (change > 0) return 'text-emerald-600';
    if (change < 0) return 'text-red-600';
    return 'text-slate-600';
  }
  formatQuantityChange(change: number): string { return change > 0 ? `+${change}` : `${change}`; }

  getUserAvatarClass(color: string): string {
    const map: Record<string, string> = {
      indigo: 'bg-indigo-100 text-indigo-600', purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600', teal: 'bg-teal-100 text-teal-600',
    };
    return map[color] ?? 'bg-slate-100 text-slate-600';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
  }
  formatNumber(value: number): string { return new Intl.NumberFormat('en-US').format(value); }

  // ── Settings ─────────────────────────────────────────────────────
  generalConfig = {
    warehouseName: '', warehouseCode: '', address: '',
    maxCapacity: 50000, currentOccupancy: '0%', squareFootage: 0,
  };
  warehouseStatus = { acceptIncoming: true, allowOutgoing: true };
  inventoryRules: InventoryRule[] = [
    { label: 'Low Stock Alerts', description: 'Notify managers when stock drops below minimum threshold.', enabled: true },
    { label: 'Auto-Replenishment', description: 'Automatically create purchase orders for low stock items.', enabled: false },
    { label: 'Strict Batch Tracking', description: 'Enforce batch number input for all inbound/outbound movements.', enabled: true },
  ];
  storageZones: StorageZone[] = [
    { name: 'Zone A - Heavy Duty', type: 'Pallet Racking', capacity: '2,000 Pallets' },
    { name: 'Zone B - Electronics', type: 'Secure Cage', capacity: '500 Units' },
    { name: 'Zone C - General', type: 'Shelving', capacity: '15,000 Units' },
  ];
  personnel: Personnel[] = [
    { name: 'John Doe', role: 'Manager', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHIO8CMGT-EM3Uutr0ZsANRYc-KdFVoYwGZAcpywhr_fy7knV3FjAS9Y8_ooCniZu6juiCNVeJiDYoGKyDa_hTp6hmEIk44gSwyFgNHYxvtau_frREl1oGxEdXU8g8uHDtn9Mqx9EUOwl_cDJ4zVSGTioq0BJrIZ1Q_uiGR-rivMEafhh2ZqoFWYsitJu6kw6NMt1soFCdq2xIhIdFcLaSAMGM1UM6X2dpMZHBwHFbCwlm9LmrVZJGKTYVNQSGPUtngCVZ0kMEmDEf' },
    { name: 'Jane Smith', role: 'Supervisor', initials: 'JS', avatarColor: 'purple' },
    { name: 'Mike Ross', role: 'Logistics Lead', initials: 'MR', avatarColor: 'orange' },
  ];

  getPersonnelAvatarClass(color: string | undefined): string {
    const map: Record<string, string> = {
      purple: 'bg-purple-100 text-purple-600', orange: 'bg-orange-100 text-orange-600',
      blue: 'bg-blue-100 text-blue-600', teal: 'bg-teal-100 text-teal-600',
    };
    return map[color ?? ''] ?? 'bg-slate-200 text-slate-600';
  }
  toggleRule(rule: InventoryRule): void { rule.enabled = !rule.enabled; }
  removePersonnel(person: Personnel): void { this.personnel = this.personnel.filter(p => p !== person); }

  // ── Adjustment Modal ──────────────────────────────────────────────
  showAdjustmentModal = false;
  modalStep: 1 | 2 | 3 = 1;

  modalForm = {
    productSearch: '', selectedProduct: null as null | { name: string; sku: string; imageUrl: string },
    adjustmentType: 'Physical Count' as string,
    adjustmentDate: new Date().toISOString().slice(0, 10),
    systemQty: 0, actualQty: 0, reason: '', notes: '',
  };

  modalAdjustmentTypes = [
    { value: 'Physical Count', label: 'Physical Count', icon: 'assignment_turned_in', iconColor: 'text-blue-600' },
    { value: 'Damage', label: 'Damage', icon: 'broken_image', iconColor: 'text-red-500' },
  ];

  private getAdjustmentTypeNumber(type: string): number {
    const map: Record<string, number> = { 'Physical Count': 1, 'Damage': 2, 'Found': 3, 'Theft/Loss': 4 };
    return map[type] ?? 1;
  }

  get modalProductResults() {
    const q = this.modalForm.productSearch.toLowerCase();
    if (!q) return this.allProducts.slice(0, 5);  // ← allProducts بدل inventory
    return this.allProducts.filter(p =>
      p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }
  get modalDifference(): number { return (this.modalForm.actualQty ?? 0) - (this.modalForm.systemQty ?? 0); }

  openAdjustmentModal(): void {
    this.modalStep = 1;
    this.modalForm = { productSearch: '', selectedProduct: null, adjustmentType: 'Physical Count', adjustmentDate: new Date().toISOString().slice(0, 10), systemQty: 0, actualQty: 0, reason: '', notes: '' };
    this.adjustmentError = '';
    this.adjustmentSuccess = false;
    this.showAdjustmentModal = true;
  }
  closeAdjustmentModal(): void { if (this.isSubmittingAdjustment) return; this.showAdjustmentModal = false; }

  selectModalProduct(item: WarehouseProduct): void {
    this.modalForm.selectedProduct = {
      name: item.name,
      sku: item.sku,
      imageUrl: item.imageUrl,
    };
    this.modalForm.productSearch = item.name;

    // ربط الـ systemQty بـ quantityOnHand من الـ inventory
    const inventoryItem = this.inventory.find(i => i.sku === item.sku);
    this.modalForm.systemQty = inventoryItem?.onHand ?? 0; // onHand = quantityOnHand
  }
  modalNext(): void { if (this.modalStep < 3) this.modalStep = (this.modalStep + 1) as 1 | 2 | 3; }
  modalBack(): void { if (this.modalStep > 1) this.modalStep = (this.modalStep - 1) as 1 | 2 | 3; }

  submitAdjustment(): void {
    if (!this.modalForm.selectedProduct) return;
    if (!this.warehouseId) { this.adjustmentError = 'No warehouse selected.'; return; }
    this.isSubmittingAdjustment = true;
    this.adjustmentError = '';
    this.warehouseService.adjustStock(this.warehouseId, {
      productSku: this.modalForm.selectedProduct.sku,
      type: this.getAdjustmentTypeNumber(this.modalForm.adjustmentType),
      quntity: this.modalForm.actualQty,
      reason: this.modalForm.reason,
    }).subscribe({
      next: () => {
        this.isSubmittingAdjustment = false;
        this.toast.success('Adjustment submitted successfully!');

        // reload من الـ API عشان البيانات تتحفظ وتظهر بعد الـ refresh
        this.loadInventory();
        this.loadStockMovements();

        setTimeout(() => this.closeAdjustmentModal(), 1500);
      },
      error: (err) => {
        this.isSubmittingAdjustment = false;
        this.toast.error(err?.error?.errors?.[0] ?? err?.error?.message ?? 'Failed to submit adjustment.', 'error');
      },
    });
  }

  getModalTypeClass(value: string): string {
    return this.modalForm.adjustmentType === value ? 'border-2 border-blue-600 bg-blue-50' : 'border border-slate-200 hover:border-blue-400 hover:bg-slate-50';
  }
  modalStepLabel(step: number): string { return ['Selection', 'Quantity', 'Reason'][step - 1]; }

  // ── Initialize Stock Modal ────────────────────────────────────────
  showInitStockModal = false;
  initStockForm = {
    productSearch: '',
    selectedProduct: null as null | WarehouseProduct,
    quantity: 0,
    unitCost: null as number | null
  };

  // ← Now searches allProducts (not inventory)
  get initStockProductResults(): WarehouseProduct[] {
    const q = this.initStockForm.productSearch.toLowerCase();
    if (!q) return this.allProducts.slice(0, 5);
    return this.allProducts.filter(p =>
      p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }

  get estimatedTotalValue(): number {
    return (this.initStockForm.quantity ?? 0) * (this.initStockForm.unitCost ?? 0);
  }

  openInitStockModal(): void {
    this.initStockForm = { productSearch: '', selectedProduct: null, quantity: 0, unitCost: null };
    this.initStockError = '';
    this.initStockSuccess = false;
    this.showInitStockModal = true;
  }
  closeInitStockModal(): void { if (this.isSubmittingInitStock) return; this.showInitStockModal = false; }

  selectInitStockProduct(item: WarehouseProduct): void {
    this.initStockForm.selectedProduct = item;
    this.initStockForm.productSearch = item.name;
    this.initStockForm.unitCost = item.sellingPrice;
  }

  incrementQty(): void { this.initStockForm.quantity = (this.initStockForm.quantity ?? 0) + 1; }
  decrementQty(): void { if ((this.initStockForm.quantity ?? 0) > 0) this.initStockForm.quantity--; }

  submitInitStock(): void {
    const p = this.initStockForm.selectedProduct;
    if (!p) return;
    if (!this.warehouseId) { this.initStockError = 'No warehouse selected.'; return; }
    if ((this.initStockForm.quantity ?? 0) <= 0) { this.initStockError = 'Quantity must be greater than 0.'; return; }

    this.isSubmittingInitStock = true;
    this.initStockError = '';

    // ✅ productId انتقل للـ body
    this.warehouseService.stockIn(this.warehouseId, {
      productId: p.productId,
      sku: p.sku,
      qty: this.initStockForm.quantity,
      refrence: `INIT-${Date.now().toString().slice(-6)}`,
    }).subscribe({
      next: () => {
        this.isSubmittingInitStock = false;
        this.toast.success('Stock initialized successfully!');
        setTimeout(() => {
          this.closeInitStockModal();
          this.loadInventory();
        }, 1500);
      },
      error: (err) => {
        this.isSubmittingInitStock = false;
        const msg = err?.error?.errors?.[0] ?? err?.error?.message ?? 'Failed to initialize stock.';
        this.toast.error(msg, 'error');
      },
    });
  }

  loadAdjustments(): void {
    this.warehouseService.getAdjustments().subscribe({
      next: (nodes) => {
        this.adjustments = nodes.map(n => {
          // استخرج الـ type والـ reason من الـ reference
          const referenceParts = n.reference?.split(':') ?? [];
          const typeRaw = referenceParts[0]?.trim() ?? '';
          const reason = referenceParts.slice(1).join(':').trim() ?? '';

          // map الـ type للـ AdjustmentType
          const typeMap: Record<string, AdjustmentType> = {
            'Damage': 'Damage',
            'Count Adjustment': 'Physical Count',
            'Found': 'Found',
            'Theft/Loss': 'Theft/Loss',
          };
          const adjustmentType: AdjustmentType = typeMap[typeRaw] ?? 'Physical Count';

          return {
            date: new Date(n.movementDate).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            }),
            time: new Date(n.movementDate).toLocaleTimeString('en-US', {
              hour: '2-digit', minute: '2-digit'
            }),
            productName: n.productName,
            sku: n.sku,
            imageUrl: '',
            type: adjustmentType,
            systemQty: 0,
            actualQty: n.quantity,
            difference: 0,
            reason: reason,
            approverInitials: 'JD',
            approverName: n.warehouseName,
          };
        });
        this.totalAdjustments = this.adjustments.length;
      },
      error: (err) => {
        console.error('Failed to load adjustments:', err);
      }
    });
  }

  // ── Increase Stock Modal ──────────────────────────────────────────
  showIncreaseStockModal = false;
  increaseStockForm = { productSearch: '', selectedProduct: null as null | WarehouseProduct, addQty: 0, unitCost: null as number | null };

  get increaseStockProductResults(): WarehouseProduct[] {
    const q = this.increaseStockForm.productSearch.toLowerCase();
    if (!q) return this.allProducts.slice(0, 5);
    return this.allProducts.filter(p =>
      p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }
  get increaseStockEstimatedValue(): number {
    return (this.increaseStockForm.addQty ?? 0) * (this.increaseStockForm.unitCost ?? 0);
  }

  openIncreaseStockModal(): void {
    this.increaseStockForm = { productSearch: '', selectedProduct: null, addQty: 0, unitCost: null };
    this.increaseStockError = ''; this.increaseStockSuccess = false; this.showIncreaseStockModal = true;
  }
  closeIncreaseStockModal(): void { if (this.isSubmittingIncreaseStock) return; this.showIncreaseStockModal = false; }
  selectIncreaseStockProduct(item: WarehouseProduct): void {
    this.increaseStockForm.selectedProduct = item;
    this.increaseStockForm.productSearch = item.name;
    this.increaseStockForm.unitCost = item.sellingPrice;
  }
  incrementAddQty(): void { this.increaseStockForm.addQty = (this.increaseStockForm.addQty ?? 0) + 1; }
  decrementAddQty(): void { if ((this.increaseStockForm.addQty ?? 0) > 0) this.increaseStockForm.addQty--; }

  getExistingQty(product: WarehouseProduct | null): string {
    if (!product) return '—';
    const inventoryItem = this.inventory.find(i => i.sku === product.sku);
    return inventoryItem ? this.formatNumber(inventoryItem.onHand) + ' units' : '0 units';
  }

  submitIncreaseStock(): void {
    const p = this.increaseStockForm.selectedProduct;
    if (!p || (this.increaseStockForm.addQty ?? 0) <= 0) return;
    if (!this.warehouseId) { this.increaseStockError = 'No warehouse selected.'; return; }

    this.isSubmittingIncreaseStock = true;
    this.increaseStockError = '';

    // ✅ productId انتقل للـ body
    this.warehouseService.stockIn(this.warehouseId, {
      productId: p.productId,
      sku: p.sku,
      qty: this.increaseStockForm.addQty,
      refrence: `PO-${Date.now().toString().slice(-6)}`,
    }).subscribe({
      next: () => {
        this.isSubmittingIncreaseStock = false;
        this.toast.success('Stock updated successfully!');
        setTimeout(() => {
          this.closeIncreaseStockModal();
          this.loadInventory();
        }, 1500);
      },
      error: (err) => {
        this.isSubmittingIncreaseStock = false;
        this.toast.error(err?.error?.errors?.[0] ?? err?.error?.message ?? 'Failed to update stock.', 'error')
      },
    });
  }
  // ── Decrease Stock Modal ──────────────────────────────────────────
  showDecreaseStockModal = false;
  decreaseStockForm = { productSearch: '', selectedProduct: null as null | InventoryItem, qty: 0, reference: '' };

  get decreaseStockProductResults(): InventoryItem[] {
    const q = this.decreaseStockForm.productSearch.toLowerCase();
    if (!q) return this.inventory.slice(0, 5);
    return this.inventory.filter(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
  }

  openDecreaseStockModal(): void {
    this.decreaseStockForm = { productSearch: '', selectedProduct: null, qty: 0, reference: '' };
    this.decreaseStockError = ''; this.decreaseStockSuccess = false; this.showDecreaseStockModal = true;
  }
  closeDecreaseStockModal(): void { if (this.isSubmittingDecreaseStock) return; this.showDecreaseStockModal = false; }
  selectDecreaseStockProduct(item: InventoryItem): void {
    if (!item.inventoryId) {
      this.decreaseStockError = 'This item has no inventory ID.';
      return;
    }
    this.decreaseStockError = '';
    this.decreaseStockForm.selectedProduct = item;
    this.decreaseStockForm.productSearch = item.name;
  }
  incrementDecreaseQty(): void { this.decreaseStockForm.qty++; }
  decrementDecreaseQty(): void { if (this.decreaseStockForm.qty > 0) this.decreaseStockForm.qty--; }

  submitDecreaseStock(): void {
    const p = this.decreaseStockForm.selectedProduct;
    if (!p || this.decreaseStockForm.qty <= 0) return;
    if (!this.warehouseId) { this.decreaseStockError = 'No warehouse selected.'; return; }
    if (!p.inventoryId) { this.decreaseStockError = 'Inventory ID not found.'; return; }

    // ✅ NEW: منع الـ negative stock
    if (this.decreaseStockForm.qty > p.available) {
      this.decreaseStockError = `Cannot decrease more than available stock (${p.available} units).`;
      return;
    }

    const refId = this.decreaseStockForm.reference || `OUT-${Date.now().toString().slice(-6)}`;
    this.isSubmittingDecreaseStock = true;
    this.decreaseStockError = '';

    this.warehouseService.decreaseStock(this.warehouseId, {
      inventoryId: p.inventoryId!,
      quantityToDecrease: this.decreaseStockForm.qty,
      reference: refId,
    }).subscribe({
      next: () => {
        this.isSubmittingDecreaseStock = false;
        this.toast.success('Stock decreased successfully!');
        const idx = this.inventory.findIndex(i => i.sku === p.sku);
        if (idx > -1) {
          const reduced = this.decreaseStockForm.qty;
          this.inventory[idx] = {
            ...this.inventory[idx],
            // ✅ NEW: Math.max عشان نأمن من negative values
            onHand: Math.max(0, this.inventory[idx].onHand - reduced),
            available: Math.max(0, this.inventory[idx].available - reduced),
          };
          this.stockMovements.unshift({
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            type: 'Stock Out', productName: p.name, sku: p.sku, imageUrl: '',
            quantityChange: -reduced, userInitials: 'JD', userName: this.warehouse.name,
            userAvatarColor: 'indigo', referenceId: refId,
          });
        }
        setTimeout(() => this.closeDecreaseStockModal(), 1500);
      },
      error: (err) => {
        this.isSubmittingDecreaseStock = false;
        this.toast.error(err?.error?.errors?.[0] ?? err?.error?.message ?? 'Failed to decrease stock.', 'error');
      },
    });
  }
}