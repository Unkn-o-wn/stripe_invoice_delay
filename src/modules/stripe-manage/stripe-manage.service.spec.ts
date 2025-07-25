// src/modules/stripe-manage/stripe-manager.service.spec.ts

import { StripeService } from '@/api/stripe/stripe.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getUnixTime } from 'date-fns';
import MockDate from 'mockdate';
import { getLoggerToken } from 'nestjs-pino';
import Stripe from 'stripe';
import { StripeManagerService } from './stripe-manager.service';
jest.mock('@/configs', () => ({
  StripeConfig: {
    KEY: 'STRIPE_CONFIG',
  },
}));

describe('StripeManagerService', () => {
  let service: StripeManagerService;
  // Мокаем зависимости
  const mockStripeService = {
    getBalanseHistory: jest.fn(),
    getInvoices: jest.fn(),
    updateInvoice: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeManagerService,
        { provide: StripeService, useValue: mockStripeService },
        {
          provide: getLoggerToken(StripeManagerService.name),
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<StripeManagerService>(StripeManagerService);

    // Сбрасываем вызовы моков перед каждым тестом
    jest.clearAllMocks();

    MockDate.set('2023-10-15T12:00:00Z');
  });

  afterEach(() => {
    MockDate.reset();
  });

  describe('getTodayTimestamps', () => {
    it('should return start and end timestamps for the current day in the specified timezone', () => {
      // Устанавливаем фиксированную дату для теста
      const mockDate = new Date('2023-10-15T12:00:00Z'); // GMT время
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);

      // Вызываем тестируемый метод
      const result = service['getTodayTimestamps']();

      // Проверяем результат
      expect(result).toHaveProperty('start');
      expect(result).toHaveProperty('end');

      // Рассчитываем ожидаемые значения для проверки
      // UTC+4 для 15 октября 2023 означает:
      // start: 15 октября 2023 00:00:00 GMT+4 => 14 октября 2023 20:00:00 UTC
      // end: 15 октября 2023 23:59:59.999 GMT+4 => 15 октября 2023 19:59:59.999 UTC
      const expectedStartDate = new Date('2023-10-14T20:00:00Z');
      const expectedEndDate = new Date('2023-10-15T19:59:59.999Z');

      expect(result.start).toBe(getUnixTime(expectedStartDate));
      expect(result.end).toBe(getUnixTime(expectedEndDate));

      // Восстанавливаем original Date
      jest.spyOn(global, 'Date').mockRestore();
    });
  });

  // Продолжение файла src/modules/stripe-manage/stripe-manager.service.spec.ts

  describe('calculateVolumes', () => {
    it('should correctly calculate total volume from balance transactions', async () => {
      // paste test data here
      const mockTransactions = [
        { id: 'txn_1', type: 'charge', amount: 1000, currency: 'aed' },
        { id: 'txn_2', type: 'charge', amount: 2000, currency: 'aed' },
        { id: 'txn_3', type: 'refund', amount: -500, currency: 'aed' },
        { id: 'txn_4', type: 'charge', amount: 3000, currency: 'aed' },
        { id: 'txn_5', type: 'payout', amount: -5000, currency: 'aed' },
      ] as Stripe.BalanceTransaction[];

      const result = await service['calculateVolumes'](mockTransactions);

      // Проверяем, что только транзакции типа 'charge' учтены в totalVolume
      expect(result).toBe(6000); // 1000 + 2000 + 3000
    });

    it('should return 0 when no charge transactions exist', async () => {
      const mockTransactions = [
        { id: 'txn_1', type: 'payout', amount: -1000, currency: 'aed' },
        { id: 'txn_2', type: 'refund', amount: -500, currency: 'aed' },
      ] as Stripe.BalanceTransaction[];

      const result = await service['calculateVolumes'](mockTransactions);

      expect(result).toBe(0);
    });

    it('should handle empty transactions array', async () => {
      const result = await service['calculateVolumes']([]);

      expect(result).toBe(0);
    });
  });
  // Продолжение файла src/modules/stripe-manage/stripe-manager.service.spec.ts

  describe('getNewDueDate', () => {
    it('should calculate the correct due date with shift days', () => {
      // Получаем фактические результаты
      const shift1 = service['getNewDueDate'](1);
      const shift3 = service['getNewDueDate'](3);
      const shift5 = service['getNewDueDate'](5);

      const date1 = new Date(shift1 * 1000);
      const date3 = new Date(shift3 * 1000);
      const date5 = new Date(shift5 * 1000);

      // Проверяем, что разница между датами соответствует ожиданиям
      expect(shift1).not.toBe(shift3);
      expect(shift3).not.toBe(shift5);

      // Проверяем, что даты увеличиваются
      expect(date3.getTime()).toBeGreaterThan(date1.getTime());
      expect(date5.getTime()).toBeGreaterThan(date3.getTime());

      // Проверяем, что время установлено на 8 UTC (12 GMT+4)
      expect(date1.getUTCHours()).toBe(8);
      expect(date3.getUTCHours()).toBe(8);
      expect(date5.getUTCHours()).toBe(8);
    });
  });
});
