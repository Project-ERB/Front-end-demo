import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { Subscription } from 'rxjs';
import {
  WarehouseService,
  InventoryDashboardData,
  StockByWarehouseNode,
  TopMovingProductNode,
  LowStockItemNode,
  MovementTrendNode,
} from './../../../../core/services/warehouse/warehouse.service';
import { SiedbarWarehouseComponent } from "../../../../shared/UI/siedbar-warehouse/siedbar-warehouse/siedbar-warehouse.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-warehouse-dashboard',
  imports: [CommonModule, FormsModule, SiedbarWarehouseComponent, RouterLink],
  templateUrl: './warehouse-dashboard.component.html',
  styleUrl: './warehouse-dashboard.component.scss',
})
export class WarehouseDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('stockMovementChart') stockMovementCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('warehouseChart') warehouseCanvas!: ElementRef<HTMLCanvasElement>;

  private subscription = new Subscription();
  private movementChartInstance: Chart | null = null;
  private warehouseChartInstance: Chart | null = null;

  activeTimeRange: '7d' | '30d' | '90d' = '30d';
  searchProduct = '';
  searchLowStock = '';

  // ── Data from API ──
  kpis: InventoryDashboardData['kpis'] | null = null;
  warehouseRows: StockByWarehouseNode[] = [];
  topProducts: (TopMovingProductNode & { inPct: number; outPct: number })[] = [];
  lowStockItems: (LowStockItemNode & { status: 'critical' | 'warning' })[] = [];
  movementTrend: MovementTrendNode[] = [];

  // ── Loading / Error ──
  loading = true;
  error = '';

  constructor(private warehouseService: WarehouseService) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    // Charts are initialized after data loads (see loadDashboard)
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.movementChartInstance?.destroy();
    this.warehouseChartInstance?.destroy();
  }

  setTimeRange(range: '7d' | '30d' | '90d'): void {
    this.activeTimeRange = range;
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    this.loadDashboard(daysMap[range]);
  }

  loadDashboard(movementDays: number = 2): void {
    this.loading = true;
    this.error = '';

    this.subscription.add(
      this.warehouseService.getInventoryDashboard(movementDays).subscribe({
        next: (data) => {
          this.kpis = data.kpis;
          this.warehouseRows = data.stockByWarehouse;
          this.lowStockItems = data.lowStockItems.map((item) => ({
            ...item,
            status: item.quantityAvailable <= 10 ? 'critical' : 'warning',
          }));
          this.computeTopProducts(data.topMovingProducts);
          this.movementTrend = data.movementTrend;
          this.loading = false;

          // Render charts after view is ready and data exists
          requestAnimationFrame(() => {
            this.renderMovementChart();
            this.renderWarehouseChart();
          });
        },
        error: (err) => {
          this.error = 'Failed to load dashboard data.';
          this.loading = false;
          console.error(err);
        },
      })
    );
  }

  private computeTopProducts(products: TopMovingProductNode[]): void {
    this.topProducts = products.map((p) => {
      const total = p.totalIn + p.totalOut;
      return {
        ...p,
        inPct: total > 0 ? Math.round((p.totalIn / total) * 100) : 50,
        outPct: total > 0 ? Math.round((p.totalOut / total) * 100) : 50,
      };
    });
  }

  // ── Helpers for template ──

  get filteredProducts(): typeof this.topProducts {
    if (!this.searchProduct) return this.topProducts;
    const q = this.searchProduct.toLowerCase();
    return this.topProducts.filter((p) => p.productName.toLowerCase().includes(q));
  }

  get filteredLowStock(): typeof this.lowStockItems {
    if (!this.searchLowStock) return this.lowStockItems;
    const q = this.searchLowStock.toLowerCase();
    return this.lowStockItems.filter(
      (i) => i.productName.toLowerCase().includes(q) || i.warehouseName.toLowerCase().includes(q)
    );
  }

  formatNumber(n: number): string {
    return n.toLocaleString('en-US');
  }

  formatCurrency(n: number): string {
    if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'K';
    return '$' + n.toFixed(2);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  // ── Charts ──

  private renderMovementChart(): void {
    if (!this.stockMovementCanvas?.nativeElement || !this.movementTrend.length) return;
    this.movementChartInstance?.destroy();

    const ctx = this.stockMovementCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.movementTrend.map((d) => {
      try {
        return new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch {
        return d.date;
      }
    });

    this.movementChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total In',
            data: this.movementTrend.map((d) => d.totalIn),
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: 'Total Out',
            data: this.movementTrend.map((d) => d.totalOut),
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.05)',
            borderWidth: 2,
            tension: 0.3,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: { boxWidth: 12, usePointStyle: true, pointStyle: 'circle', font: { size: 11, family: 'Inter' } },
          },
          tooltip: {
            backgroundColor: 'rgba(27, 28, 28, 0.9)',
            titleFont: { size: 12, family: 'Inter' },
            bodyFont: { size: 11, family: 'JetBrains Mono' },
            padding: 10,
            cornerRadius: 4,
            displayColors: true,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 10 } },
          },
          y: {
            grid: { color: 'rgba(193, 198, 215, 0.15)' },
            border: { display: false },
            ticks: { font: { size: 10 }, maxTicksLimit: 5 },
          },
        },
      },
    });
  }

  private renderWarehouseChart(): void {
    if (!this.warehouseCanvas?.nativeElement || !this.warehouseRows.length) return;
    this.warehouseChartInstance?.destroy();

    const ctx = this.warehouseCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Capture component references so arrow functions can access them
    const warehouseRows = this.warehouseRows;
    const formatCurrency = this.formatCurrency.bind(this);
    const formatNumber = this.formatNumber.bind(this);

    this.warehouseChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: warehouseRows.map((w) => w.warehouseName),
        datasets: [{
          label: 'Total Quantity',
          data: warehouseRows.map((w) => w.totalQuantity),
          backgroundColor: '#0070f3',
          borderRadius: 4,
          barThickness: 'flex' as unknown as number,
          maxBarThickness: 40,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(27, 28, 28, 0.9)',
            titleFont: { size: 12, family: 'Inter' },
            bodyFont: { size: 11, family: 'JetBrains Mono' },
            padding: 10,
            cornerRadius: 4,
            callbacks: {
              afterBody: (context) => {
                const index = context[0].dataIndex;
                const row = warehouseRows[index];
                if (!row) return '';
                return `Value: ${formatCurrency(row.inventoryValue)}\nProducts: ${formatNumber(row.totalProducts)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 10 } },
          },
          y: {
            grid: { color: 'rgba(193, 198, 215, 0.15)' },
            border: { display: false },
            ticks: {
              font: { size: 10 },
              maxTicksLimit: 4,
              callback(tickValue: string | number): string {
                return Number(tickValue) / 1000 + 'k';
              },
            },
          },
        },
      },
    });
  }

}
