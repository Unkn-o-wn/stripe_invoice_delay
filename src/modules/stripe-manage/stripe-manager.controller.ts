import { Controller, Post } from '@nestjs/common';
import { StripeManagerService } from './stripe-manager.service';

@Controller('stripe-manager')
export class StripeManagerController {
  constructor(private readonly stripeStripeManagerService: StripeManagerService) {}

  @Post('process-invoice-delays')
  async processInvoiceDelays(): Promise<string> {
    await this.stripeStripeManagerService.processInvoiceDelays();

    return 'ok';
  }
}
