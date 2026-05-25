import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';

const GET_RECEIVABLE_ACCOUNTS = gql`
  query GetReceivableAccounts($first: Int, $after: String) {
    receivableAccounts(first: $first, after: $after) {
      nodes {
        customerId
        currency
        openingBalance
        creditLimit
        isClosed
        currentBalance
        transactions {
          type
          amount
          date
          reference
          notes
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const GET_CUSTOMERS = gql`
  query GetCustomers {
    customers {
      nodes {
        id
        name
        phone
        isActive
        creditLimitAmount
        currency
      }
    }
  }
`;

export interface ReceivableAccountRaw {
  customerId?: string;
  currency?: string;
  openingBalance?: number;
  creditLimit?: number;
  isClosed?: boolean;
  currentBalance?: number;
  transactions?: TransactionRaw[];
}

export interface TransactionRaw {
  type?: string;
  amount?: number;
  date?: string;
  reference?: string;
  notes?: string;
}

export interface CustomerRaw {
  id?: string;
  name?: string;
  phone?: string;
  isActive?: boolean;
  creditLimitAmount?: number;
  currency?: string;
}

export interface PageInfo {
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface ReceivableAccountsResponse {
  nodes: ReceivableAccountRaw[];
  pageInfo: PageInfo;
}

@Injectable({
  providedIn: 'root',
})
export class ReceivableService {
  constructor(private apollo: Apollo) { }

  getReceivableAccounts(first: number, after?: string) {
    return this.apollo
      .query<{ receivableAccounts: ReceivableAccountsResponse }>({
        query: GET_RECEIVABLE_ACCOUNTS,
        fetchPolicy: 'network-only',
        variables: {
          first,
          after: after || null,
        },
      })
      .pipe(
        map((result) => result.data?.receivableAccounts)
      );
  }

  getCustomers() {
    return this.apollo
      .query<{ customers: { nodes: CustomerRaw[] } }>({
        query: GET_CUSTOMERS,
         fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.customers?.nodes ?? [])
      );
  }
}