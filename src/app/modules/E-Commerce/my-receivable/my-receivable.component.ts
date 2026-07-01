import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ECommerceService } from '../../../core/services/e-commerce/e-commerce.service';
import { ECommerceSidebarComponent } from '../../../shared/UI/e-commerce-sidebar/e-commerce-sidebar.component';
import { NavbarECommerceComponent } from "../../../shared/UI/navbar-e-commerce/navbar-e-commerce.component";

interface Transaction {
  amount: number;
  type: string;
  date: string;
  reference: string;
  notes: string;
}

interface ReceivableAccount {
  customerId: string;
  currency: string;
  openingBalance: number;
  creditLimit: number;
  isClosed: boolean;
  currentBalance: number;
  transactions: Transaction[];
}

@Component({
  selector: 'app-my-receivable',
  standalone: true,
  imports: [CommonModule, ECommerceSidebarComponent, NavbarECommerceComponent],
  templateUrl: './my-receivable.component.html',
  styleUrl: './my-receivable.component.scss',
})
export class MyReceivableComponent implements OnInit {

  isMobileSidebarOpen = false;

  // ✅ كل الداتا الأصلية (من غير فلترة)
  allAccounts: ReceivableAccount[] = [];

  // ✅ الداتا المعروضة فعليًا (بعد الفلترة)
  accounts = signal<ReceivableAccount[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);
  selectedAccount = signal<ReceivableAccount | null>(null);
  expandedTransactions = signal<Set<string>>(new Set());

  // ✅ مصطلح البحث الحالي
  searchTerm = '';

  constructor(private eCommerceService: ECommerceService) { }

  ngOnInit(): void {
    this.loadReceivables();
  }

  loadReceivables(): void {
    this.loading.set(true);
    this.error.set(null);

    this.eCommerceService.getReceivableAccounts().subscribe({
      next: (res) => {
        const data: ReceivableAccount[] = res?.data?.myReceivableAccounts?.nodes ?? [];
        this.allAccounts = data;           // ← خزّن النسخة الكاملة
        this.applyFilters();               // ← طبّق أي سيرش لسه موجود
        if (data.length > 0) {
          this.selectedAccount.set(data[0]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load receivable accounts.');
        this.loading.set(false);
      }
    });
  }

  // ─── Search ───────────────────────────────────────────────
  handleSearch(term: string): void {
    this.searchTerm = term.trim().toLowerCase();
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = [...this.allAccounts];

    if (this.searchTerm) {
      result = result.filter(acc =>
        acc.customerId?.toLowerCase().includes(this.searchTerm) ||
        acc.currency?.toLowerCase().includes(this.searchTerm)
      );
    }

    this.accounts.set(result);
  }

  selectAccount(account: ReceivableAccount): void {
    this.selectedAccount.set(account);
  }

  toggleTransactions(customerId: string): void {
    const current = this.expandedTransactions();
    const next = new Set(current);
    if (next.has(customerId)) {
      next.delete(customerId);
    } else {
      next.add(customerId);
    }
    this.expandedTransactions.set(next);
  }

  isExpanded(customerId: string): boolean {
    return this.expandedTransactions().has(customerId);
  }

  getBalancePercent(account: ReceivableAccount): number {
    if (!account.creditLimit) return 0;
    return Math.min(100, Math.round((account.currentBalance / account.creditLimit) * 100));
  }

  getTransactionIcon(type: string): string {
    const t = type?.toLowerCase();
    if (t === 'credit' || t === 'payment') return 'arrow_downward';
    if (t === 'debit' || t === 'invoice') return 'arrow_upward';
    return 'swap_horiz';
  }

  getTransactionColor(type: string): string {
    const t = type?.toLowerCase();
    if (t === 'credit' || t === 'payment') return 'text-emerald-400';
    if (t === 'debit' || t === 'invoice') return 'text-rose-400';
    return 'text-amber-400';
  }
}