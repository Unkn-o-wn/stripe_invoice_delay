// test/tools/validate-config.test.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { strict as assert } from 'node:assert';
import { after, describe, it } from 'node:test';
import 'reflect-metadata';
import { validateEnv } from './validate-config';

// Создаем тестовый класс для валидации
class TestConfig {
  @IsString()
  TEST_STRING!: string;

  @IsNumber()
  TEST_NUMBER!: number;

  @IsString()
  @IsOptional()
  TEST_OPTIONAL?: string;
}

describe('validateEnv', () => {
  it('should validate correct environment variables', () => {
    // Подготавливаем тестовые данные
    process.env.TEST_STRING = 'test-value';
    process.env.TEST_NUMBER = '123';

    const result = validateEnv(TestConfig);

    assert.strictEqual(result.TEST_STRING, 'test-value');
    assert.strictEqual(result.TEST_NUMBER, 123);
    assert.strictEqual(result.TEST_OPTIONAL, undefined);
  });

  it('should throw error for invalid environment variables', () => {
    // Подготавливаем неверные тестовые данные
    process.env.TEST_STRING = 'test-value';
    process.env.TEST_NUMBER = 'not-a-number';

    assert.throws(() => {
      validateEnv(TestConfig);
    }, Error);
  });

  it('should throw error for missing required environment variables', () => {
    // Удаляем обязательные переменные
    delete process.env.TEST_STRING;
    delete process.env.TEST_NUMBER;

    assert.throws(() => {
      validateEnv(TestConfig);
    }, Error);
  });

  // Очистка после тестов
  after(() => {
    delete process.env.TEST_STRING;
    delete process.env.TEST_NUMBER;
    delete process.env.TEST_OPTIONAL;
  });
});
