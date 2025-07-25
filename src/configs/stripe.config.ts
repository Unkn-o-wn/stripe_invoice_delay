import { validateEnv } from '@/tools/validate-config';
import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
class StripeConfigEnvVariables {
  @IsString()
  STRIPE_API_KEY!: string;

  @IsString()
  STRIPE_API_ENDPOINT!: string;
}

export const StripeConfig = registerAs('STRIPE_CONFIG', () => {
  const env = validateEnv(StripeConfigEnvVariables);

  return {
    apiKey: env.STRIPE_API_KEY,
    endPoint: env.STRIPE_API_ENDPOINT,
  };
});
