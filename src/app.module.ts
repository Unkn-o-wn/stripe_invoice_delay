import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { StripeModule } from './api/stripe/stripe.module';
import * as configs from './configs';
import { StripeManagerModule } from './modules/stripe-manage/stripe-manager.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        customProps: () => ({
          context: 'HTTP',
        }),
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers["stripe-signature"]',
            'req.body.card',
            'req.body.payment_method',
          ],
          censor: '***REDACTED***',
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: Object.values(configs),
    }),
    ScheduleModule.forRoot(),
    StripeModule,
    StripeManagerModule,
  ],
})
export class AppModule {}
