import type { Type as ClassConstructor } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import 'reflect-metadata';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export const validateEnv = <T>(cls: ClassConstructor<T>): T => {
  const validatedConfig = plainToInstance(cls, process.env, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig as unknown as object, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
};
