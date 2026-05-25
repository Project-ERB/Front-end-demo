import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { catchError, forkJoin, of, Subject, takeUntil } from 'rxjs';
import {
  Invoice,
  InvoiceService,
} from '../../../../core/services/invoice/invoice.service';
import {
  Payment,
  PaymentService,
} from '../../../../core/services/payment/payment.service';
import {
  CustomerRaw,
  ReceivableAccountRaw,
  ReceivableService,
} from '../../../../core/services/Receivable/receivable.service';
import { SidebaSalesComponent } from '../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component';
import { RouterLink } from '@angular/router';

Chart.register(...registerables);

// ── KPI card type ────────────────────────────────────────────────────────────

export interface KpiCard {
  label: string;
  value: string;
  sub: string;
  icon: string;
  type: 'default' | 'success' | 'warning' | 'danger';
}

// ── Recent payment row (for table) ───────────────────────────────────────────

export interface RecentPaymentRow {
  date: string;
  invoiceNumber: string;
  amount: string;
  method: string;
  currency: string;
}

// ── Recent invoice row (for table) ───────────────────────────────────────────

export interface RecentInvoiceRow {
  number: string;
  customerName: string;
  total: string;
  remaining: string;
  status: Invoice['status'];
  currency: string;
}

// ── Receivable row ────────────────────────────────────────────────────────────

export interface ReceivableRow {
  customerId: string;
  customerName: string;
  currency: string;
  currentBalance: string;
  creditLimit: string;
  openingBalance: string;
  accountCount: number;
  isClosed: boolean;
}

@Component({
  selector: 'app-financial-overview',
  imports: [CommonModule, SidebaSalesComponent,RouterLink],
  templateUrl: './financial-overview.component.html',
  styleUrl: './financial-overview.component.scss',
})
export class FinancialOverviewComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;

  loading = true;
  error: string | null = null;

  kpiCards: KpiCard[] = [];
  recentInvoices: RecentInvoiceRow[] = [];
  recentPayments: RecentPaymentRow[] = [];
  receivableRows: ReceivableRow[] = [];

  donutSegments: { label: string; percent: number; color: string }[] = [];

  private monthlyPayments: number[] = [];
  private monthlyLabels: string[] = [];
  private customerMap = new Map<string, string>();

  private donutChart: Chart | null = null;
  private barChart: Chart | null = null;
  private viewReady = false;
  private dataReady = false;

  private destroy$ = new Subject<void>();
  private invoiceMap = new Map<string, string>();

  constructor(
    private receivableService: ReceivableService,
    private paymentService: PaymentService,
    private invoiceService: InvoiceService,
  ) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadAll();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.dataReady) this.initCharts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.donutChart?.destroy();
    this.barChart?.destroy();
  }

  // ── Data loading ───────────────────────────────────────────────────────────

  private loadAll(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      customers: this.receivableService.getCustomers().pipe(
        catchError((err) => {
          console.error('[FO] customers error:', err);
          return of([]);
        }),
      ),
      receivables: this.receivableService.getReceivableAccounts(20).pipe(
        catchError((err) => {
          console.error('[FO] receivables error:', err);
          return of(null);
        }),
      ),
      invoices: this.invoiceService.getInvoices().pipe(
        catchError((err) => {
          console.error('[FO] invoices error:', err);
          return of([]);
        }),
      ),
      payments: this.paymentService.getPayments().pipe(
        catchError((err) => {
          console.error('[FO] payments error:', err);
          return of([]);
        }),
      ),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ customers, receivables, invoices, payments }) => {
          this.processData(
            customers ?? [],
            invoices ?? [],
            payments ?? [],
            receivables?.nodes ?? [],
          );
        
          this.loading = false;
          this.dataReady = true;
          if (this.viewReady) {
            setTimeout(() => {
              this.initCharts();
            }, 0); // 0 ملي ثانية كافية جداً إنها تخليها تشتغل بعد الـ DOM Update
          }
          // if (this.viewReady) this.initCharts();
        },
        error: (err) => {
          console.error('[FinancialOverview] load error:', err);
          this.error =
            err?.message ?? 'Failed to load financial data. Please try again.';
          this.loading = false;
        },
      });
  }

  retry(): void {
    this.loadAll();
  }

  // ── Data processing ────────────────────────────────────────────────────────

  private processData(
    customers: CustomerRaw[],
    invoices: Invoice[],
    payments: Payment[],
    receivables: ReceivableAccountRaw[],
  ): void {
    // Build customer name map
    // customers.forEach((c) => this.customerMap.set(c.id ?? '', c.name ?? c.id ?? ''));
    customers.forEach((c) => {
      if (c.id) {
        this.customerMap.set(c.id.trim().toLowerCase(), c.name ?? c.id);
      }
    });

    // Build invoice lookup map
    invoices.forEach((inv) => this.invoiceMap.set(inv.id, inv.invoiceNumber));

    // ── KPI calculation ────────────────────────────────────────────────────

    const totalInvoiced = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0);
    const totalRemain = invoices.reduce((s, i) => s + i.remainingAmount, 0);

    const overdueCount = invoices.filter((i) => i.status === 'overdue').length;
    const unpaidCount = invoices.filter(
      (i) => i.status === 'unpaid' || i.status === 'partial',
    ).length;
    const paidCount = invoices.filter((i) => i.status === 'paid').length;

    const currency = invoices[0]?.currency ?? 'EGP';

    this.kpiCards = [
      {
        label: 'Total Invoiced',
        value: this.fmt(totalInvoiced, currency),
        sub: `${invoices.length} invoices`,
        icon: 'receipt',
        type: 'default',
      },
      {
        label: 'Total Collected',
        value: this.fmt(totalPaid, currency),
        sub: `${paidCount} paid invoices`,
        icon: 'circle-check',
        type: 'success',
      },
      {
        label: 'Outstanding',
        value: this.fmt(totalRemain, currency),
        sub: `${unpaidCount} incomplete invoices`,
        icon: 'clock',
        type: 'warning',
      },
      {
        label: 'Overdue',
        value: this.fmt(
          invoices
            .filter((i) => i.status === 'overdue')
            .reduce((s, i) => s + i.remainingAmount, 0),
          currency,
        ),
        sub: `${overdueCount} invoices · action required`,
        icon: 'alert-triangle',
        type: 'danger',
      },
    ];

    // ── Donut segments ─────────────────────────────────────────────────────

    const total = invoices.length || 1;
    const paidPct = Math.round((paidCount / total) * 100);
    const unpaidPct = Math.round((unpaidCount / total) * 100);
    const overduePct = 100 - paidPct - unpaidPct;

    this.donutSegments = [
      { label: 'Paid', percent: paidPct, color: '#639922' },
      { label: 'Incomplete', percent: unpaidPct, color: '#BA7517' },
      { label: 'Overdue', percent: overduePct, color: '#E24B4A' },
    ];

    // ── Monthly payments bar chart ─────────────────────────────────────────

    const monthBuckets = this.bucketByMonth(payments);
    this.monthlyLabels = monthBuckets.map((b) => b.label);
    this.monthlyPayments = monthBuckets.map((b) => b.total);

    // ── Recent invoices (last 5) ───────────────────────────────────────────

    this.recentInvoices = [...invoices]
      .sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate))
      .slice(0, 5)
      .map((inv) => ({
        number: inv.invoiceNumber || inv.id.slice(-6),
        // customerName: this.customerMap.get(inv.customerId) ?? inv.customerId,
        customerName:
          this.customerMap.get((inv.customerId ?? '').trim().toLowerCase()) ??
          inv.customerId,
        total: this.fmt(inv.totalAmount, inv.currency),
        remaining: this.fmt(inv.remainingAmount, inv.currency),
        status: inv.status,
        currency: inv.currency,
      }));

    // ── Recent payments (last 5 transactions) ─────────────────────────────

    const allTx = payments.flatMap((p) =>
      p.transactions.map((tx) => ({
        date: tx.transactionDate,
        invoiceNumber:
          this.invoiceMap.get(p.invoiceId) ?? p.invoiceId.slice(-6),
        amount: this.fmt(tx.amount, p.currency),
        method: tx.method,
        currency: p.currency,
      })),
    );

    this.recentPayments = allTx
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .map((row) => ({ ...row, date: this.formatDate(row.date) }));

    // ── Receivable Accounts (grouped by customerId) ────────────────────────
    console.log('Processing receivables:', receivables);

    const grouped = new Map<string, ReceivableAccountRaw[]>();
    (receivables ?? []).forEach((r) => {
      const key = r.customerId ?? '';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(r);
    });

    this.receivableRows = [...grouped.entries()].map(
      ([customerId, accounts]) => {
        console.log(
          'Processing receivable for customerId:',
          customerId,
          'with accounts:',
          accounts,
        );
        const totalCurrent = accounts.reduce(
          (s, a) => s + (a.currentBalance ?? 0),
          0,
        );
        const totalOpening = accounts.reduce(
          (s, a) => s + (a.openingBalance ?? 0),
          0,
        );
        const creditLimit = accounts[0]?.creditLimit ?? 0;
        const cur = accounts[0]?.currency ?? 'EGP';
        const isClosed = accounts.every((a) => a.isClosed);

        return {
          customerId,
          // customerName: this.customerMap.get(customerId) ?? customerId,
          customerName:
            this.customerMap.get((customerId ?? '').trim().toLowerCase()) ??
            customerId,
          currency: cur,
          currentBalance: this.fmt(totalCurrent, cur),
          creditLimit: this.fmt(creditLimit, cur),
          openingBalance: this.fmt(totalOpening, cur),
          accountCount: accounts.length,
          isClosed,
        };
      },
    );
  }

  // ── Chart initialisation ───────────────────────────────────────────────────

  private initCharts(): void {
    this.donutChart?.destroy();
    this.barChart?.destroy();

    const isDark = matchMedia('(prefers-color-scheme: dark)').matches;

    // Donut
    this.donutChart = new Chart(this.donutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.donutSegments.map((s) => s.label),
        datasets: [
          {
            data: this.donutSegments.map((s) => s.percent),
            backgroundColor: this.donutSegments.map((s) => s.color),
            borderWidth: 3,
            borderColor: isDark ? '#242422' : '#ffffff',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.parsed}%` } },
        },
      },
    });

    // Bar
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const tickColor = '#888780';

    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.monthlyLabels,
        datasets: [
          {
            label: 'المدفوعات',
            data: this.monthlyPayments,
            backgroundColor: '#185FA5',
            borderRadius: 5,
            barPercentage: 0.55,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tickColor, font: { size: 11 } },
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { size: 11 },
              callback: (v) => {
                const n = +v;
                return n >= 1_000_000
                  ? (n / 1_000_000).toFixed(1) + 'M'
                  : n >= 1_000
                    ? (n / 1_000).toFixed(0) + 'k'
                    : String(n);
              },
            },
          },
        },
      },
    });
  }

  // ── Template helpers ───────────────────────────────────────────────────────

  getStatusLabel(status: Invoice['status']): string {
    const map: Record<Invoice['status'], string> = {
      paid: 'Paid',
      partial: 'Partial',
      unpaid: 'Unpaid',
      overdue: 'Overdue',
      draft: 'Draft',
      cancelled: 'Cancelled',
    };
    return map[status] ?? status;
  }

  getMethodLabel(method: string): string {
    const map: Record<string, string> = {
      CASH: 'Cash',
      BANK_TRANSFER: 'Transfer',
      CARD: 'Card',
      CHECK: 'Check',
    };
    return map[method?.toUpperCase()] ?? method;
  }

  // ── Private utilities ──────────────────────────────────────────────────────

  private fmt(amount: number, currency = 'EGP'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private formatDate(iso: string): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      });
    } catch {
      return iso;
    }
  }

  private bucketByMonth(
    payments: Payment[],
  ): { label: string; total: number }[] {
    const buckets = new Map<string, number>();

    payments.forEach((p) => {
      p.transactions.forEach((tx) => {
        if (!tx.transactionDate) return;
        const d = new Date(tx.transactionDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        buckets.set(key, (buckets.get(key) ?? 0) + tx.amount);
      });
    });

    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, total]) => {
        const [year, month] = key.split('-');
        const label = new Date(+year, +month - 1, 1).toLocaleDateString(
          'en-US',
          { month: 'short' },
        );
        return { label, total };
      });
  }
}
