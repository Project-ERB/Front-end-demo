import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';

export interface PaymentTransactionRaw {
  id?: string;
  amount?: number;
  transactionDate?: string;
  relatedTransactionId?: string;
  method?: string;
}
 
export interface PaymentRaw {
  id?: string;
  invoiceId?: string;
  currency?: string;
  invoiceTotalAmount?: number;
  totalPaid?: number;
  remainingAmount?: number;
  transactions?: PaymentTransactionRaw[];
}
 
export interface PaymentsResponse {
  nodes: PaymentRaw[];
}
 
// ── Normalized types used by components ─────────────────────────────────────
 
export interface PaymentTransaction {
  id: string;
  amount: number;
  transactionDate: string;
  method: string;
  relatedTransactionId: string | null;
}
 
export interface Payment {
  id: string;
  invoiceId: string;
  currency: string;
  invoiceTotalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  transactions: PaymentTransaction[];
}
 
// ── GraphQL Query ────────────────────────────────────────────────────────────
 
const GET_PAYMENTS = gql`
  query GetPayments {
    payments {
      nodes {
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
          relatedTransactionId
          method
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  
constructor(private apollo: Apollo) {}
 
  getPayments() {
    return this.apollo
      .query<{ payments: PaymentsResponse }>({
        query: GET_PAYMENTS,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => {
          const nodes = result.data?.payments?.nodes ?? [];
          return nodes.map((raw) => this.normalize(raw));
        })
      );
  }
 
  // ── Helpers ────────────────────────────────────────────────────────────────
 
  private normalize(raw: PaymentRaw): Payment {
    return {
      id:                 raw.id                 ?? '',
      invoiceId:          raw.invoiceId          ?? '',
      currency:           raw.currency           ?? 'EGP',
      invoiceTotalAmount: raw.invoiceTotalAmount  ?? 0,
      totalPaid:          raw.totalPaid           ?? 0,
      remainingAmount:    raw.remainingAmount     ?? 0,
      transactions: (raw.transactions ?? []).map((tx) => ({
        id:                   tx.id                   ?? '',
        amount:               tx.amount               ?? 0,
        transactionDate:      tx.transactionDate       ?? '',
        method:               tx.method               ?? 'Unknown',
        relatedTransactionId: tx.relatedTransactionId  ?? null,
      })),
    };
  }
}
 

