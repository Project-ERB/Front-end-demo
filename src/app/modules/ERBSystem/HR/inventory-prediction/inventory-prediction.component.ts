import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PredictedProduct, WarehouseNode, WarehousePrediction, WarehouseService } from '../../../../core/services/warehouse/warehouse.service';
import { ProductService } from '../../../../core/services/products/product.service';

interface ProductMap {
  [id: string]: string;
}

@Component({
  selector: 'app-inventory-prediction',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-prediction.component.html',
  styleUrl: './inventory-prediction.component.scss',
})
export class InventoryPredictionComponent {

  private warehouseService = inject(WarehouseService);
  private productService = inject(ProductService);

  days: number = 30;
  loading = false;
  hasSearched = false;
  errorMessage = '';
  predictions: WarehousePrediction[] = [];

  private warehouseMap: { [id: string]: string } = {};
  private productMap: ProductMap = {};

  get totalAtRisk(): number {
    return this.predictions.reduce(
      (sum, w) => sum + (w.productsAtRisk?.length ?? 0), 0
    );
  }

  ngOnInit(): void {
    this.loadReferenceData();
  }

  /** Pre-load warehouses & products so we can resolve IDs → names */
  private loadReferenceData(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (nodes: WarehouseNode[]) => {
        this.warehouseMap = {};
        for (const w of nodes) {
          this.warehouseMap[w.id] = w.name;
        }
      },
    });

    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.productMap = {};
        const products = res?.data?.products?.nodes ?? [];
        for (const p of products) {
          this.productMap[p.id] = p.name;
        }
      },
    });
  }

  predict(): void {
    if (this.days < 1) return;
    this.loading = true;
    this.hasSearched = true;
    this.errorMessage = '';
    this.predictions = [];

    this.warehouseService.getInventoryPrediction(this.days).subscribe({
      next: (data: WarehousePrediction[]) => {
        // Resolve warehouse names & product names
        this.predictions = (data ?? []).map((w) => ({
          ...w,
          warehouseName: w.warehouseName || this.warehouseMap[w.warehouseId] || w.warehouseId,
          productsAtRisk: (w.productsAtRisk ?? []).map((p) => ({
            ...p,
            productName: p.productName || this.productMap[p.productId] || p.productId,
          })),
        }));
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage =
          err?.error?.message || err?.message || 'An unexpected error occurred. Please try again.';
        this.loading = false;
      },
    });
  }

  /* ─── Display Helpers ─── */


  /** Safely read a field from the product, tolerating different casings from the API */
  getFieldValue(product: PredictedProduct, field: string): number | null {
    // Cast to 'any' to safely bypass strict 'unknown' index signature checking
    const p = product as any;

    // Try exact match first
    const val = p[field];
    if (val !== undefined && val !== null) {
      const num = Number(val);
      if (!isNaN(num)) return num;
    }

    // Try common casing variations
    const variants: string[] = [];
    if (field === 'quantityAvailable') {
      variants.push('quantityavailable', 'QuantityAvailable', 'quantity_available');
    } else if (field === 'estimatedDaysLeft') {
      variants.push('estimateddaysleft', 'EstimatedDaysLeft', 'estimated_days_left', 'daysLeft', 'daysleft');
    }

    for (const v of variants) {
      const vVal = p[v];
      if (vVal !== undefined && vVal !== null) {
        const num = Number(vVal);
        if (!isNaN(num)) return num;
      }
    }

    return null;
  }

  formatNumber(val: number | null): string {
    if (val === null) return '—';
    return val.toLocaleString();
  }

  getQuantityColorClass(val: number | null): string {
    if (val === null) return 'text-[#64748b]';
    if (val === 0) return 'text-red-600';
    if (val <= 10) return 'text-orange-600';
    return 'text-[#0f172a]';
  }

  getDaysLeftBadgeClass(days: number | null): string {
    const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold';
    if (days === null) return `${base} bg-[#f1f5f9] text-[#64748b]`;
    if (days <= 3) return `${base} bg-red-100 text-red-700`;
    if (days <= 7) return `${base} bg-orange-100 text-orange-700`;
    if (days <= 14) return `${base} bg-amber-100 text-amber-700`;
    return `${base} bg-green-100 text-green-700`;
  }

  getWarehouseRiskLabel(products: PredictedProduct[] | undefined | null): string {
    if (!products?.length) return 'No Risk';
    const hasCritical = products.some((p) => this.getFieldValue(p, 'estimatedDaysLeft') !== null && this.getFieldValue(p, 'estimatedDaysLeft')! <= 3);
    if (hasCritical) return 'Critical';
    const hasHigh = products.some((p) => this.getFieldValue(p, 'estimatedDaysLeft') !== null && this.getFieldValue(p, 'estimatedDaysLeft')! <= 7);
    if (hasHigh) return 'High Risk';
    return 'Moderate';
  }

  getWarehouseRiskBadgeClass(products: PredictedProduct[] | undefined | null): string {
    if (!products?.length) return 'inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700';
    const hasCritical = products.some((p) => this.getFieldValue(p, 'estimatedDaysLeft') !== null && this.getFieldValue(p, 'estimatedDaysLeft')! <= 3);
    if (hasCritical) return 'inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700';
    const hasHigh = products.some((p) => this.getFieldValue(p, 'estimatedDaysLeft') !== null && this.getFieldValue(p, 'estimatedDaysLeft')! <= 7);
    if (hasHigh) return 'inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700';
    return 'inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700';
  }

  private isCritical(level: string | undefined): boolean {
    return level?.toLowerCase().includes('critical') ?? false;
  }

  private isHigh(level: string | undefined): boolean {
    return level?.toLowerCase().includes('high') ?? false;
  }




} 
