import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  BusinessProfile,
  Client,
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentMethod,
} from "@/lib/types";
import { seedData } from "@/lib/seed";

const STORAGE_KEY = "billable.store.v1";

type ClientInput = Omit<Client, "id" | "createdAt">;

type InvoiceInput = {
  number: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: Invoice["items"];
  taxRate: number;
  notes?: string;
};

type PaymentInput = {
  amount: number;
  date: string;
  method: PaymentMethod;
  note?: string;
};

interface StoreContextValue {
  clients: Client[];
  invoices: Invoice[];
  business: BusinessProfile;
  addClient: (input: ClientInput) => Client;
  updateClient: (id: string, input: ClientInput) => void;
  deleteClient: (id: string) => void;
  addInvoice: (input: InvoiceInput) => Invoice;
  updateInvoice: (id: string, input: InvoiceInput) => void;
  setInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  deleteInvoice: (id: string) => void;
  addPayment: (invoiceId: string, input: PaymentInput) => Payment;
  deletePayment: (invoiceId: string, paymentId: string) => void;
  updateBusiness: (input: BusinessProfile) => void;
  nextInvoiceNumber: () => string;
  resetData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const uid = (prefix: string): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const loadState = (): ReturnType<typeof seedData> => {
  if (typeof window === "undefined") return seedData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData();
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.clients) &&
      Array.isArray(parsed.invoices) &&
      parsed.business
    ) {
      return parsed as ReturnType<typeof seedData>;
    }
  } catch {
    /* Corrupt or unavailable storage — fall back to seed data. */
  }
  return seedData();
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* Storage may be unavailable (private mode, quota). Non-fatal. */
    }
  }, [state]);

  const addClient = useCallback((input: ClientInput): Client => {
    const client: Client = {
      ...input,
      id: uid("cl"),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({ ...prev, clients: [...prev.clients, client] }));
    return client;
  }, []);

  const updateClient = useCallback((id: string, input: ClientInput) => {
    setState((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => (c.id === id ? { ...c, ...input } : c)),
    }));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      clients: prev.clients.filter((c) => c.id !== id),
      invoices: prev.invoices.filter((i) => i.clientId !== id),
    }));
  }, []);

  const addInvoice = useCallback((input: InvoiceInput): Invoice => {
    const invoice: Invoice = {
      ...input,
      id: uid("inv"),
      payments: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({ ...prev, invoices: [invoice, ...prev.invoices] }));
    return invoice;
  }, []);

  const updateInvoice = useCallback((id: string, input: InvoiceInput) => {
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) =>
        i.id === id ? { ...i, ...input } : i,
      ),
    }));
  }, []);

  const setInvoiceStatus = useCallback((id: string, status: InvoiceStatus) => {
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) =>
        i.id === id ? { ...i, status } : i,
      ),
    }));
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.filter((i) => i.id !== id),
    }));
  }, []);

  const addPayment = useCallback(
    (invoiceId: string, input: PaymentInput): Payment => {
      const payment: Payment = { ...input, id: uid("pay") };
      setState((prev) => ({
        ...prev,
        invoices: prev.invoices.map((i) =>
          i.id === invoiceId
            ? { ...i, payments: [...i.payments, payment] }
            : i,
        ),
      }));
      return payment;
    },
    [],
  );

  const deletePayment = useCallback((invoiceId: string, paymentId: string) => {
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) =>
        i.id === invoiceId
          ? { ...i, payments: i.payments.filter((p) => p.id !== paymentId) }
          : i,
      ),
    }));
  }, []);

  const updateBusiness = useCallback((input: BusinessProfile) => {
    setState((prev) => ({ ...prev, business: input }));
  }, []);

  const nextInvoiceNumber = useCallback((): string => {
    const year = new Date().getFullYear();
    const prefix = `INV-${year % 100}`;
    const nums = state.invoices
      .map((i) => i.number)
      .filter((n) => n.startsWith(prefix))
      .map((n) => parseInt(n.slice(prefix.length + 1), 10))
      .filter((n) => !Number.isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 1076) + 1;
    return `${prefix}-${String(next).padStart(4, "0")}`;
  }, [state.invoices]);

  const resetData = useCallback(() => {
    setState(seedData());
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      clients: state.clients,
      invoices: state.invoices,
      business: state.business,
      addClient,
      updateClient,
      deleteClient,
      addInvoice,
      updateInvoice,
      setInvoiceStatus,
      deleteInvoice,
      addPayment,
      deletePayment,
      updateBusiness,
      nextInvoiceNumber,
      resetData,
    }),
    [
      addClient,
      updateClient,
      deleteClient,
      addInvoice,
      updateInvoice,
      setInvoiceStatus,
      deleteInvoice,
      addPayment,
      deletePayment,
      updateBusiness,
      nextInvoiceNumber,
      resetData,
      state,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

export const useStore = (): StoreContextValue => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
};
