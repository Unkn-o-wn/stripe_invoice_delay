import { StripeConfig } from '@/configs';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import { Stripe } from 'stripe';
import type { GetBalanceHistoryOptions } from './types/get-balanse-history';
import { InvoiceStatus, type GetInvoicesOptions } from './types/get-invoices';

@Injectable()
export class StripeService {
  // @ts-expect-error
  private stripe: Stripe;
  constructor(
    @Inject(StripeConfig.KEY) private readonly stripeConfig: ConfigType<typeof StripeConfig>,
    @InjectPinoLogger(StripeService.name) private readonly logger: PinoLogger,
  ) {}
  async onModuleInit(): Promise<void> {
    this.stripe = new Stripe(this.stripeConfig.apiKey, {
      apiVersion: '2025-06-30.basil',
    });
    this.logger.info('Stripe service initialized');
  }

  async getBalanseHistory(opts: GetBalanceHistoryOptions): Promise<Stripe.BalanceTransaction[]> {
    let hasMore = opts.needAll;
    let startingAfter: string | undefined;
    const allTransactions: Stripe.BalanceTransaction[] = [];
    do {
      const balanceTransactions = await this.stripe.balanceTransactions.list({
        limit: 100,
        created: {
          gte: opts.start,
          lte: opts.end,
        },
        currency: 'AED',
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });
      allTransactions.push(...balanceTransactions.data);
      hasMore = balanceTransactions.has_more;
      startingAfter =
        balanceTransactions.data.length > 0
          ? balanceTransactions.data[balanceTransactions.data.length - 1].id
          : undefined;
    } while (hasMore);

    return allTransactions;
  }

  async getInvoices(opts: GetInvoicesOptions): Promise<Stripe.Invoice[]> {
    this.logger.info({ opts }, 'Fetching invoices from Stripe');

    let hasMore = opts.needAll;
    let startingAfterDraftInvoices: string | undefined;
    const allInvoices: Stripe.Invoice[] = [];
    do {
      try {
        // @Todo: refactor
        const [draftInvoices] = await Promise.all([
          this.stripe.invoices.list({
            limit: 100,
            created: {
              gte: opts.start,
              lte: opts.end,
            },
            status: InvoiceStatus.DRAFT,
            ...(startingAfterDraftInvoices ? { starting_after: startingAfterDraftInvoices } : {}),
          }),
        ]);

        allInvoices.push(...[...draftInvoices.data]);
        hasMore = draftInvoices.has_more ? draftInvoices.has_more : false;
        startingAfterDraftInvoices =
          draftInvoices.data.length > 0
            ? draftInvoices.data[draftInvoices.data.length - 1].id
            : undefined;
        // startingAfteropenInvoices =
        //   openInvoices.data.length > 0
        //     ? openInvoices.data[openInvoices.data.length - 1].id
        //     : undefined;
      } catch (error) {
        throw new InternalServerErrorException({
          message: 'Failed to fetch invoices',
          error,
        });
      }
      this.logger.debug({ countDraft: allInvoices.length, hasMore }, 'Fetched batch of invoices');
    } while (hasMore);
    this.logger.debug({ count: allInvoices.length, hasMore }, 'Fetched batch of invoices');

    return allInvoices;
  }

  async updateInvoice(opts: { invoiceId: string; dueDate: number }): Promise<Stripe.Invoice> {
    try {
      const updatedInvoice = await this.stripe.invoices.update(opts.invoiceId, {
        due_date: opts.dueDate,
      });

      this.logger.info(
        { invoiceId: opts.invoiceId, daysAdded: opts.dueDate },
        'Successfully updated invoice due date',
      );
      return updatedInvoice;
    } catch (error) {
      this.logger.error(
        { invoiceId: opts.invoiceId, error: error },
        'Failed to update invoice due date',
      );
      throw new InternalServerErrorException({
        message: 'Failed to update invoice due date',
        error,
      });
    }
  }
}
