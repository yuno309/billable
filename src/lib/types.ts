export type InvoiceStatus = "draft" | "sent" | "paid";

export type PaymentMethod =
  | "bank_transfer"
  | "credit_card"
  | "paypal"
  | "stripe"
  | "cash"
  | "other";

export interface Client {
  id: string;
  name: string;
  contactName?: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  note?: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceLineItem[];
  taxRate: number;
  notes?: string;
  payments: Payment[];
  createdAt: string;
}

export interface BusinessProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  address: string;
}

export interface StoreState {
  clients: Client[];
  invoices: Invoice[];
  business: BusinessProfile;
}
