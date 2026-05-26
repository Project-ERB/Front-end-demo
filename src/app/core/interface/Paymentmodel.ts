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
  transactions: Transaction[];
}

export interface MyPaymentsResponse {
  data: {
    myPayments: Payment[];
  };
  errors?: { message: string }[];
}

export interface PaymentSummary {
  totalInvoices: number;
  totalPaid: number;
  totalRemaining: number;
  totalAmount: number;
}