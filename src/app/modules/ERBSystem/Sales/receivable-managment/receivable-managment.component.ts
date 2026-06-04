import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebaSalesComponent } from "../../../../shared/UI/sidebar-sales/sideba-sales/sideba-sales.component";
import { forkJoin, Subscription } from 'rxjs';
import {
  CustomerRaw,
  ReceivableAccountRaw,
  ReceivableService,
} from '../../../../core/services/Receivable/receivable.service';

export type AccountStatus = 'Active' | 'Warning' | 'Critical' | 'Overdue' | 'Closed';
export type TabFilter = 'all' | 'overdue' | 'nearLimit';

export interface LedgerEntry {
  date: string;
  type: string;
  reference: string;
  notes: string;
  amount: number | null;
  balance: number;
}

export interface ReceivableAccount {
  id: string;
  customerName: string;
  customerId: string;
  openingBalance: number;
  creditLimit: number;
  currentBalance: number;
  status: AccountStatus;
  currency: string;
  isClosed: boolean;
  ledger: LedgerEntry[];
}

@Component({
  selector: 'app-receivable-managment',
  imports: [CommonModule, FormsModule, SidebaSalesComponent],
  templateUrl: './receivable-managment.component.html',
  styleUrl: './receivable-managment.component.scss',
})
export class ReceivableManagmentComponent implements OnInit, OnDestroy {
  searchQuery = '';
  activeTab: TabFilter = 'all';

  // <--- تم الإضافة
  isMobileSidebarOpen: boolean = false;

  // <--- تم الإضافة
  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  // Server-side pagination
  pageSize = 8;
  endCursor: string | null = null;
  startCursor: string | null = null;
  hasNextPage = false;
  hasPreviousPage = false;
  currentPage = 1;
  // Track cursor history for "previous"
  private cursorHistory: string[] = [null as unknown as string];

  showModal = false;
  selectedAccount: ReceivableAccount | null = null;

  accounts: ReceivableAccount[] = [];
  loading = true;
  error: string | null = null;
  private subscription!: Subscription;

  private customerMap = new Map<string, CustomerRaw>();


  constructor(private receivableService: ReceivableService) { }

  ngOnInit(): void {
    this.loading = true;
    this.error = null;
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private loadCustomers(): void {
    this.receivableService.getCustomers().subscribe({
      next: (customers) => {
        console.log('[ReceivableComponent] customers loaded:', customers.length);

        this.customerMap.clear();
        customers.forEach((c) => {
          if (c.id) {
            this.customerMap.set(
              c.id.trim().toLowerCase(),
              c
            );
          }
        });

        // Customers ready → now load accounts
        this.loadAccounts();
      },
      error: (err) => {
        console.error('[ReceivableComponent] error loading customers:', err);
        this.error = 'Failed to load data. Please try again.';
        this.loading = false;
      },
    });
  }



  private loadAccounts(after?: string): void {
    this.subscription?.unsubscribe();

    this.receivableService
      .getReceivableAccounts(this.pageSize, after)
      .subscribe({
        next: (response) => {
          if (!response) {
            this.accounts = [];
            this.loading = false;
            return;
          }

          const { nodes, pageInfo } = response;

          this.endCursor = pageInfo.endCursor ?? null;
          this.startCursor = pageInfo.startCursor ?? null;
          this.hasNextPage = pageInfo.hasNextPage ?? false;
          this.hasPreviousPage = pageInfo.hasPreviousPage ?? false;

          const validAccounts = nodes.filter(
            (raw) => raw.customerId != null
          );

          this.accounts = validAccounts.map((raw, index) =>
            this.transformAccount(raw, index)
          );

          this.loading = false;
        },
        error: (err) => {
          console.error('[ReceivableComponent] error loading accounts:', err);
          this.error = 'Failed to load accounts. Please try again.';
          this.loading = false;
        },
      });
  }


  // ── Pagination Methods ──────────────────────────────────

  nextPage(): void {
    if (!this.hasNextPage) return;
    // Save current cursor for back navigation
    this.cursorHistory.push(this.endCursor!);
    this.currentPage++;
    this.loadAccounts(this.endCursor!);
  }

  prevPage(): void {
    if (!this.hasPreviousPage || this.currentPage <= 1) return;
    // Go back: remove last cursor, use the one before it
    if (this.cursorHistory.length > 1) {
      this.cursorHistory.pop(); // remove current
      const previousCursor = this.cursorHistory[this.cursorHistory.length - 1];
      this.currentPage--;
      // Use "last" + "before" for going backwards if API supports it
      // Otherwise reload from start and navigate — simpler approach:
      this.loadAccounts(previousCursor || undefined);
    }
  }

  goToPage(page: number): void {
    if (page === this.currentPage) return;
    // Cursor-based doesn't support random access easily
    // Reset and paginate forward
    if (page < this.currentPage) {
      this.currentPage = 1;
      this.cursorHistory = [null as unknown as string];
      this.loadAccounts();
    } else {
      while (this.currentPage < page && this.hasNextPage) {
        this.cursorHistory.push(this.endCursor!);
        this.currentPage++;
      }
      this.loadAccounts(this.endCursor!);
    }
  }

  get totalEntries(): number {
    return this.accounts.length;
  }

  get pageStart(): number {
    if (this.accounts.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    if (this.accounts.length === 0) return 0;
    return this.pageStart + this.accounts.length - 1;
  }

  get visiblePages(): (number | '...')[] {
    const pages: (number | '...')[] = [this.currentPage];
    if (this.hasNextPage) pages.push(this.currentPage + 1);
    if (this.currentPage > 1) pages.unshift(this.currentPage - 1);
    // Always show first page if not current
    if (pages[0] !== 1) pages.unshift(1);
    // Add ... separator
    if (pages.length > 3) {
      pages.splice(1, 0, '...');
      // Keep max 5 items
      if (pages.length > 5) {
        pages.splice(4, pages.length - 5);
      }
    }
    return pages;
  }

  // ── Transform ───────────────────────────────────────────

  private transformAccount(
    raw: ReceivableAccountRaw,
    index: number
  ): ReceivableAccount {
    const customerId = (raw.customerId || '').trim().toLowerCase();

    const customer = this.customerMap.get(customerId);

    const customerName =
      customer?.name?.trim() || '[Deleted Customer]';
    const currency = raw.currency || 'EGP';
    const openingBalance = raw.openingBalance ?? 0;
    const creditLimit = raw.creditLimit ?? 0;
    const currentBalance = raw.currentBalance ?? 0;
    const isClosed = raw.isClosed ?? false;
    const transactions = raw.transactions ?? [];

    const ledger: LedgerEntry[] = [];
    let runningBalance = openingBalance;

    const firstDate =
      transactions.length > 0 && transactions[0].date
        ? this.formatDate(transactions[0].date!)
        : this.formatDate(new Date().toISOString());

    ledger.push({
      date: firstDate,
      type: 'Opening',
      reference: '-',
      notes: 'Balance brought forward',
      amount: null,
      balance: runningBalance,
    });

    transactions
      .filter((tx) => tx.reference?.toUpperCase() !== 'OPENING')
      .forEach((tx) => {
        const rawAmount = tx.amount ?? 0;
        const isCredit = (tx.type || '').toUpperCase() === 'CREDIT';
        const signedAmount = isCredit ? -rawAmount : rawAmount;
        runningBalance += signedAmount;

        ledger.push({
          date: tx.date ? this.formatDate(tx.date) : '',
          type: this.mapTransactionType(tx.type),
          reference: tx.reference || '-',
          notes: tx.notes || '—',
          amount: signedAmount,
          balance: runningBalance,
        });
      });

    const utilization = this.calculateUtilization(currentBalance, creditLimit);
    const status = this.determineStatus(isClosed, utilization);

    return {
      id: `#RCV-${8821 + (this.currentPage - 1) * this.pageSize + index}`,
      customerName,
      customerId: raw.customerId!,
      openingBalance,
      creditLimit,
      currentBalance,
      status,
      currency,
      isClosed,
      ledger,
    };
  }

  private formatDate(isoDate: string): string {
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoDate;
    }
  }

  private mapTransactionType(type: string | undefined): string {
    if (!type) return 'Unknown';
    const typeMap: Record<string, string> = {
      DEBIT: 'Debit',
      CREDIT: 'Credit',
      INVOICE: 'Invoice',
      PAYMENT: 'Payment',
      CREDIT_NOTE: 'Credit Note',
      DEBIT_NOTE: 'Debit Note',
      OPENING: 'Opening',
    };
    return typeMap[type.toUpperCase()] || type;
  }

  private calculateUtilization(
    currentBalance: number,
    creditLimit: number
  ): number {
    if (!creditLimit || creditLimit === 0) return 0;
    return Math.round((currentBalance / creditLimit) * 100);
  }

  private determineStatus(
    isClosed: boolean,
    utilization: number
  ): AccountStatus {
    if (isClosed) return 'Closed';
    if (utilization >= 90) return 'Critical';
    if (utilization >= 75) return 'Warning';
    return 'Active';
  }

  // ── Tabs (client-side on current page) ──────────────────

  get tabs() {
    const allCount = this.accounts.length;
    const overdueCount = this.accounts.filter(
      (a) => a.status === 'Overdue' || a.status === 'Critical'
    ).length;
    const nearLimitCount = this.accounts.filter(
      (a) => this.utilizationPct(a) >= 80
    ).length;

    return [
      { key: 'all' as TabFilter, label: 'All Accounts', count: allCount },
      { key: 'overdue' as TabFilter, label: 'Overdue', count: overdueCount },
      {
        key: 'nearLimit' as TabFilter,
        label: 'Near Limit',
        count: nearLimitCount,
      },
    ];
  }

  get filteredAccounts(): ReceivableAccount[] {
    let list = this.accounts;

    if (this.activeTab === 'overdue') {
      list = list.filter(
        (a) => a.status === 'Overdue' || a.status === 'Critical'
      );
    }
    if (this.activeTab === 'nearLimit') {
      list = list.filter((a) => this.utilizationPct(a) >= 80);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.customerName.toLowerCase().includes(q) ||
          a.customerId.toLowerCase().includes(q)
      );
    }
    return list;
  }

  // ── Display Helpers ─────────────────────────────────────

  utilizationPct(a: ReceivableAccount): number {
    return this.calculateUtilization(a.currentBalance, a.creditLimit);
  }

  getStatusClass(status: AccountStatus): string {
    const map: Record<AccountStatus, string> = {
      Critical: 'bg-red-100 text-red-800',
      Warning: 'bg-yellow-100 text-yellow-800',
      Active: 'bg-green-100 text-green-700',
      Overdue: 'bg-orange-100 text-orange-800',
      Closed: 'bg-gray-100 text-gray-600',
    };
    return map[status];
  }

  getBarClass(pct: number): string {
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 75) return 'bg-yellow-400';
    return 'bg-indigo-500';
  }

  getPctTextClass(pct: number): string {
    if (pct >= 90) return 'text-red-600 font-semibold';
    if (pct >= 75) return 'text-yellow-600 font-semibold';
    return 'text-slate-500';
  }

  getLedgerTypeClass(type: string): string {
    const map: Record<string, string> = {
      Opening: 'bg-slate-100 text-slate-600',
      Invoice: 'bg-blue-100 text-blue-700',
      Payment: 'bg-green-100 text-green-700',
      'Credit Note': 'bg-purple-100 text-purple-700',
      'Debit Note': 'bg-orange-100 text-orange-700',
      Debit: 'bg-red-100 text-red-700',
      Credit: 'bg-green-100 text-green-700',
    };
    return map[type] || 'bg-slate-100 text-slate-600';
  }

  getAmountClass(amount: number | null): string {
    if (amount === null) return 'text-slate-400';
    return amount > 0 ? 'text-red-600' : 'text-green-700';
  }

  formatAmount(amount: number | null, signed = false): string {
    if (amount === null) return '—';
    const abs = Math.abs(amount);
    const currency = this.selectedAccount?.currency || 'EGP';
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(abs);
    if (!signed) return formatted;
    return amount > 0 ? `+${formatted}` : `-${formatted}`;
  }

  // ── Modal ───────────────────────────────────────────────

  openStatement(account: ReceivableAccount): void {
    this.selectedAccount = account;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedAccount = null;
  }

  get ledgerSummary() {
    if (!this.selectedAccount) return null;
    const { ledger, openingBalance, currentBalance } = this.selectedAccount;
    const charges = ledger
      .filter((e) => (e.amount ?? 0) > 0)
      .reduce((s, e) => s + (e.amount ?? 0), 0);
    const payments = ledger
      .filter((e) => (e.amount ?? 0) < 0)
      .reduce((s, e) => s + (e.amount ?? 0), 0);
    return {
      openingBalance,
      charges,
      payments: Math.abs(payments),
      closingBalance: currentBalance,
    };
  }

  retry(): void {
    this.currentPage = 1;
    this.cursorHistory = [null as unknown as string];
    this.loadAccounts();
  }
}