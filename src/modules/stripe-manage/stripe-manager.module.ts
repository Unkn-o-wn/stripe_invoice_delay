import { StripeModule } from '@/api/stripe/stripe.module';
import { Module } from '@nestjs/common';
import { StripeManagerController } from './stripe-manager.controller';
import { StripeManagerService } from './stripe-manager.service';

@Module({
  imports: [StripeModule],
  controllers: [StripeManagerController],
  providers: [StripeManagerService],
})
export class StripeManagerModule {}
