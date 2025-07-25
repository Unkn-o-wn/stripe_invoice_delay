export enum InvoiceStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PAID = 'paid',
  UNCOLLECTIBLE = 'uncollectible',
  VOID = 'void',
}

export interface GetInvoicesOptions {
  start: number;
  end: number;
  needAll?: boolean;
  status: InvoiceStatus[];
}
