import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';

export type InvoiceStatusRaw =
  | 'DRAFT'
  | 'SENT'
  | 'PAID'
  | 'PARTIAL'
  | 'OVERDUE'
  | 'CANCELLED'
  | string;
 
export interface InvoiceLineRaw {
  productId?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  taxAmount?: number;
  discountAmount?: number;
  lineTotal?: number;
}
 
export interface InvoiceRaw {
  id?: string;
  invoiceNumber?: string;
  customerId?: string;
  salesOrderId?: string;
  invoiceDate?: string;
  status?: InvoiceStatusRaw;
  defaultCurrency?: string;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  lines?: InvoiceLineRaw[];
}
 
// ── Normalized types used by components ─────────────────────────────────────
 
export type InvoiceStatus = 'paid' | 'partial' | 'unpaid' | 'overdue' | 'draft' | 'cancelled';
 
export interface InvoiceLine {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  discountAmount: number;
  lineTotal: number;
}
 
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  salesOrderId: string;
  invoiceDate: string;
  status: InvoiceStatus;
  currency: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  lines: InvoiceLine[];
}
 
// ── GraphQL Query ────────────────────────────────────────────────────────────
 
const GET_INVOICES = gql`
  query GetInvoices {
    invoices {
      nodes {
        id
        invoiceNumber
        customerId
        salesOrderId
        invoiceDate
        status
        defaultCurrency
        totalAmount
        paidAmount
        remainingAmount
        lines {
          productId
          description
          quantity
          unitPrice
          taxAmount
          discountAmount
          lineTotal
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  constructor(private apollo: Apollo) {}
 
  getInvoices() {
    return this.apollo
      .query<{ invoices: { nodes: InvoiceRaw[] } }>({
        query: GET_INVOICES,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => {
          const nodes = result.data?.invoices?.nodes ?? [];
          return nodes.map((raw) => this.normalize(raw));
        })
      );
  }
 
  // ── Helpers ────────────────────────────────────────────────────────────────
 
  private normalize(raw: InvoiceRaw): Invoice {
    return {
      id:              raw.id              ?? '',
      invoiceNumber:   raw.invoiceNumber   ?? '',
      customerId:      raw.customerId      ?? '',
      salesOrderId:    raw.salesOrderId    ?? '',
      invoiceDate:     raw.invoiceDate     ?? '',
      status:          this.mapStatus(raw.status),
      currency:        raw.defaultCurrency ?? 'EGP',
      totalAmount:     raw.totalAmount     ?? 0,
      paidAmount:      raw.paidAmount      ?? 0,
      remainingAmount: raw.remainingAmount ?? 0,
      lines: (raw.lines ?? []).map((l) => ({
        productId:      l.productId      ?? '',
        description:    l.description    ?? '',
        quantity:       l.quantity       ?? 0,
        unitPrice:      l.unitPrice      ?? 0,
        taxAmount:      l.taxAmount      ?? 0,
        discountAmount: l.discountAmount ?? 0,
        lineTotal:      l.lineTotal      ?? 0,
      })),
    };
  }
 
  private mapStatus(raw?: InvoiceStatusRaw): InvoiceStatus {
    const map: Record<string, InvoiceStatus> = {
      PAID:      'paid',
      PARTIAL:   'partial',
      SENT:      'unpaid',
      DRAFT:     'draft',
      OVERDUE:   'overdue',
      CANCELLED: 'cancelled',
    };
    return map[(raw ?? '').toUpperCase()] ?? 'unpaid';
  }
}
