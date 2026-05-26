import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
 
// ── Raw types (as returned from GraphQL) ────────────────────────────────────
 
export interface TransactionRaw {
  id?: string;
  amount?: number;
  transactionDate?: string;
}
 
export interface PaymentRaw {
  id?: string;
  invoiceId?: string;
  currency?: string;
  invoiceTotalAmount?: number;
  totalPaid?: number;
  remainingAmount?: number;
  transactions?: TransactionRaw[];
}
 
// ── Normalized types used by components ─────────────────────────────────────
 
export type PaymentStatus = 'paid' | 'partial' | 'pending';
 
export interface Transaction {
  id: string;
  amount: number;
  transactionDate: string;
}
 
export interface Payment {
  id: string;
  invoiceId: string;
  currency: string;
  invoiceTotalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  status: PaymentStatus;
  transactions: Transaction[];
}
 
export interface PaymentSummary {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
}
 
// ── GraphQL Query ────────────────────────────────────────────────────────────
 
const GET_MY_PAYMENTS = gql`
  query GetMyPayments {
    myPayments {
      id
      invoiceId
      currency
      invoiceTotalAmount
      totalPaid
      remainingAmount
      transactions {
        id
        amount
        transactionDate
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class PaymentecommerceService {
   
 constructor(private apollo: Apollo) {}
 
  getMyPayments() {
    return this.apollo
      .query<{ myPayments: PaymentRaw[] }>({
        query: GET_MY_PAYMENTS,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => {
          const nodes = result.data?.myPayments ?? [];
          return nodes.map((raw) => this.normalize(raw));
        })
      );
  }
 
  // ── Helpers ────────────────────────────────────────────────────────────────
 
  private normalize(raw: PaymentRaw): Payment {
    const totalPaid = raw.totalPaid ?? 0;
    const totalAmount = raw.invoiceTotalAmount ?? 0;
 
    return {
      id: raw.id ?? '',
      invoiceId: raw.invoiceId ?? '',
      currency: raw.currency ?? 'EGP',
      invoiceTotalAmount: totalAmount,
      totalPaid: totalPaid,
      remainingAmount: raw.remainingAmount ?? 0,
      status: this.mapStatus(totalPaid, totalAmount),
      transactions: (raw.transactions ?? []).map((t) => ({
        id: t.id ?? '',
        amount: t.amount ?? 0,
        transactionDate: t.transactionDate ?? '',
      })),
    };
  }
 
  private mapStatus(paid: number, total: number): PaymentStatus {
    if (total === 0 || paid === 0) return 'pending';
    if (paid >= total) return 'paid';
    return 'partial';
  }
}
