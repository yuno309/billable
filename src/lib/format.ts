export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

export const formatCurrencyExact = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

export const formatDate = (iso: string): string =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatShortDate = (iso: string): string =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const formatPercent = (value: number): string =>
  `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;

export const paymentMethodLabel = (method: string): string =>
  ({
    bank_transfer: "Bank transfer",
    credit_card: "Credit card",
    paypal: "PayPal",
    stripe: "Stripe",
    cash: "Cash",
    other: "Other",
  }[method] ?? method);

export const toISODate = (date: Date): string => {
  const t = new Date(date);
  t.setHours(0, 0, 0, 0);
  return t.toISOString().slice(0, 10);
};

export const todayISO = (): string => toISODate(new Date());
