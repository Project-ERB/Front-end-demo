import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import {
  PaymentecommerceService,
  Payment,
  PaymentSummary,
} from '../../../core/services/Paymentecommerce/paymentecommerce.service';

Chart.register(...registerables);

@Component({
  selector: 'app-mypaymant-ecommerce',
  imports: [CommonModule],
  templateUrl: './mypaymant-ecommerce.component.html',
  styleUrl: './mypaymant-ecommerce.component.scss',
})
export class MypaymantEcommerceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('overviewChart') overviewChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;

  // ── State ──────────────────────────────────────────────────────────────────
  payments = signal<Payment[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  expandedCardId = signal<string | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  summary = computed<PaymentSummary>(() => {
    const list = this.payments();
    return {
      totalInvoices: list.length,
      totalAmount: list.reduce((s, p) => s + p.invoiceTotalAmount, 0),
      totalPaid: list.reduce((s, p) => s + p.totalPaid, 0),
      totalRemaining: list.reduce((s, p) => s + p.remainingAmount, 0),
    };
  });

  paidPercentage = computed(() => {
    const { totalAmount, totalPaid } = this.summary();
    return totalAmount ? Math.round((totalPaid / totalAmount) * 100) : 0;
  });

  allTransactions = computed(() =>
    this.payments()
      .flatMap((p) =>
        p.transactions.map((tx) => ({
          ...tx,
          currency: p.currency,
          invoiceId: p.invoiceId,
        }))
      )
      .sort(
        (a, b) =>
          new Date(a.transactionDate).getTime() -
          new Date(b.transactionDate).getTime()
      )
  );

  // ── Internal ───────────────────────────────────────────────────────────────
  private overviewChart: Chart | null = null;
  private trendChart: Chart | null = null;
  private destroy$ = new Subject<void>();
  private chartsReady = false;

  constructor(
    private paymentEcommerceService: PaymentecommerceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.chartsReady = true;
    if (this.payments().length) this.renderCharts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.overviewChart?.destroy();
    this.trendChart?.destroy();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ── Data Loading ─────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════

  loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.paymentEcommerceService
      .getMyPayments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (payments) => {
          this.payments.set(payments);
          this.isLoading.set(false);
          this.cdr.detectChanges();
          if (this.chartsReady) setTimeout(() => this.renderCharts(), 50);
        },
        error: (err: any) => {
          this.error.set(err.message ?? 'Something went wrong.');
          this.isLoading.set(false);
          this.cdr.detectChanges();
        },
      });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ── Card Helpers  (كل اللي القالب بيستدعيه) ─────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════

  toggleCard(id: string): void {
    this.expandedCardId.set(this.expandedCardId() === id ? null : id);
  }

  isExpanded(id: string): boolean {
    return this.expandedCardId() === id;
  }

  /** ✅ الاسم اللي في HTML: getPaymentProgress() */
  getPaymentProgress(payment: Payment): number {
    if (!payment.invoiceTotalAmount) return 0;
    return Math.min(
      100,
      Math.round((payment.totalPaid / payment.invoiceTotalAmount) * 100)
    );
  }

  /** ✅ ترجع string عشان ngClass يشتغل */
  getStatusClass(payment: Payment): string {
    const p = this.getPaymentProgress(payment);
    if (p >= 100) return 'status-paid';
    if (p > 0) return 'status-partial';
    return 'status-pending';
  }

  getStatusLabel(payment: Payment): string {
    const p = this.getPaymentProgress(payment);
    if (p >= 100) return 'Fully Paid';
    if (p > 0) return 'Partial';
    return 'Pending';
  }

  /** ✅ trackBy للـ payments اللي في *ngFor */
  trackByPaymentId(_: number, item: Payment): string {
    return item.id;
  }

  /** ✅ trackBy للـ transactions اللي في *ngFor */
  trackByTxId(_: number, item: { id: string }): string {
    return item.id;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ── Charts ───────────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════

  private renderCharts(): void {
    this.renderOverviewChart();
    this.renderTrendChart();
  }

  private renderOverviewChart(): void {
    if (!this.overviewChartRef) return;
    this.overviewChart?.destroy();

    const payments = this.payments();
    const labels = payments.map((p) => `#${p.invoiceId}`);

    this.overviewChart = new Chart(this.overviewChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Amount',
            data: payments.map((p) => p.invoiceTotalAmount),
            backgroundColor: 'rgba(212,175,100,.22)',
            borderColor: 'rgba(212,175,100,.8)',
            borderWidth: 2,
            borderRadius: 6,
          },
          {
            label: 'Paid',
            data: payments.map((p) => p.totalPaid),
            backgroundColor: 'rgba(80,200,150,.28)',
            borderColor: 'rgba(80,200,150,.9)',
            borderWidth: 2,
            borderRadius: 6,
          },
          {
            label: 'Remaining',
            data: payments.map((p) => p.remainingAmount),
            backgroundColor: 'rgba(224,92,92,.22)',
            borderColor: 'rgba(224,92,92,.7)',
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      },
      options: this.chartOptions(payments[0]?.currency ?? ''),
    });
  }

  private renderTrendChart(): void {
    if (!this.trendChartRef) return;
    this.trendChart?.destroy();

    const txs = this.allTransactions();
    let cumulative = 0;
    const cumulativeData = txs.map((tx) => {
      cumulative += tx.amount;
      return cumulative;
    });

    this.trendChart = new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: txs.map((tx) =>
          tx.transactionDate
            ? new Date(tx.transactionDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            : '—'
        ),
        datasets: [
          {
            label: 'Cumulative Paid',
            data: cumulativeData,
            borderColor: 'rgba(212,175,100,.9)',
            backgroundColor: 'rgba(212,175,100,.07)',
            pointBackgroundColor: '#d4af64',
            pointRadius: 5,
            pointHoverRadius: 8,
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Per Transaction',
            data: txs.map((tx) => tx.amount),
            borderColor: 'rgba(80,200,150,.7)',
            backgroundColor: 'rgba(80,200,150,.06)',
            pointBackgroundColor: '#50c896',
            pointRadius: 4,
            pointHoverRadius: 7,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: this.chartOptions(),
    });
  }

  private chartOptions(currency = ''): any {
    const tooltipCurrency = currency ? ` ${currency}` : '';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#b8bcc8',
            font: { family: 'Sora', size: 11 },
          },
        },
        tooltip: {
          backgroundColor: '#1a1d2e',
          borderColor: 'rgba(212,175,100,.3)',
          borderWidth: 1,
          titleColor: '#d4af64',
          bodyColor: '#b8bcc8',
          callbacks: {
            label: (ctx: any) =>
              ` ${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString()}${tooltipCurrency}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#6b7280', font: { family: 'Sora', size: 10 } },
          grid: { color: 'rgba(255,255,255,.04)' },
        },
        y: {
          ticks: { color: '#6b7280', font: { family: 'Sora', size: 10 } },
          grid: { color: 'rgba(255,255,255,.06)' },
        },
      },
    };
  }
}