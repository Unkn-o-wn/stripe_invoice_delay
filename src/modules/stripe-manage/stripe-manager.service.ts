import { StripeService } from '@/api/stripe/stripe.service';
import { InvoiceStatus } from '@/api/stripe/types/get-invoices';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  addDays,
  endOfDay,
  getUnixTime,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
  startOfDay,
} from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import type Stripe from 'stripe';
import { TIMEZONE } from './types/time-zone';

@Injectable()
export class StripeManagerService {
  constructor(
    private readonly stripeService: StripeService,
    @InjectPinoLogger(StripeManagerService.name) private readonly logger: PinoLogger,
  ) {}

  async processInvoiceDelays(): Promise<void> {
    this.logger.info('Starting invoice delay process');
    try {
      const datePeriod = this.getTodayTimestamps();
      const dailyGrossVolume = await this.getDailyGrossVolume(datePeriod);

      if (dailyGrossVolume >= 30) {
        const unpaidInvoices = await this.getUnpaidInvoices(datePeriod);
        await this.delayInvoices(unpaidInvoices);
      }
      this.logger.info('Invoice delay process completed');
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error in invoice delay process',
        error,
      });
    }
  }

  private async getDailyGrossVolume(datePeriod: { start: number; end: number }): Promise<number> {
    try {
      const paymentIntents = await this.stripeService.getBalanseHistory({
        ...datePeriod,
        needAll: false,
      });

      return this.calculateVolumes(paymentIntents);
    } catch (error) {
      throw error;
    }
  }

  private getTodayTimestamps(): { start: number; end: number } {
    const nowInTimezone = toZonedTime(new Date(), TIMEZONE);

    const startOfDayInTimezone = startOfDay(nowInTimezone);
    const endOfDayInTimezone = endOfDay(nowInTimezone);

    const startUtc = fromZonedTime(startOfDayInTimezone, TIMEZONE);
    const endUtc = fromZonedTime(endOfDayInTimezone, TIMEZONE);

    return {
      start: getUnixTime(startUtc),
      end: getUnixTime(endUtc),
    };
  }

  private async calculateVolumes(transactions: Stripe.BalanceTransaction[]): Promise<number> {
    let totalVolume = 0;
    let netVolume = 0;
    for await (const txn of transactions) {
      if (txn.type === 'charge') {
        totalVolume += txn.amount;
      }
      netVolume += txn.amount;
    }

    return totalVolume;
  }

  private async getUnpaidInvoices(datePeriod: {
    start: number;
    end: number;
  }): Promise<Stripe.Invoice[]> {
    try {
      return await this.stripeService.getInvoices({
        ...datePeriod,
        needAll: false,
        status: [InvoiceStatus.DRAFT, InvoiceStatus.OPEN],
      });
    } catch (error) {
      throw error;
    }
  }

  private async delayInvoices(invoices: Stripe.Invoice[]): Promise<void> {
    try {
      let shiftDays = 1;
      for (const invoice of invoices) {
        if (!invoice || !invoice.id) continue;
        const updatedInvoice = await this.stripeService.updateInvoice({
          invoiceId: invoice.id,
          dueDate: this.getNewDueDate(shiftDays),
        });
        shiftDays = shiftDays + 2;
      }
    } catch (error) {
      throw error;
    }
  }

  private getNewDueDate(shift: number): number {
    const nowInDubai = toZonedTime(new Date(), TIMEZONE);
    const todayStart = startOfDay(nowInDubai);

    let dueInDubai = addDays(todayStart, shift);

    dueInDubai = setHours(dueInDubai, 12);
    dueInDubai = setMinutes(dueInDubai, 0);
    dueInDubai = setSeconds(dueInDubai, 0);
    dueInDubai = setMilliseconds(dueInDubai, 0);

    const dueUtc = fromZonedTime(dueInDubai, TIMEZONE);

    return getUnixTime(dueUtc);
  }
}
