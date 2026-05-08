import { describe, expect, it, vi } from 'vitest';

import {
  buildCustomerForgotPasswordSchema,
  buildCustomerLoginSchema,
  buildCustomerRegisterSchema,
} from './schemas';

describe('customer auth schemas', () => {
  it('builds login schema', () => {
    expect(buildCustomerLoginSchema().map((item) => item.fieldName)).toEqual([
      'phone',
      'password',
    ]);
  });

  it('builds register schema with sms suffix and agreement', () => {
    const schema = buildCustomerRegisterSchema({
      canSendSMS: true,
      countdownText: '',
      sending: false,
      sendSMS: vi.fn(),
    });
    expect(schema.map((item) => item.fieldName)).toEqual([
      'company_name',
      'phone',
      'sms_code',
      'password',
      'confirm_password',
      'pay_password',
      'confirm_pay_password',
      'agree_policy',
    ]);
    expect(
      schema.find((item) => item.fieldName === 'sms_code')?.suffix,
    ).toBeTypeOf('function');
  });

  it('compares register confirmation passwords after trimming values', () => {
    const schema = buildCustomerRegisterSchema({
      canSendSMS: true,
      countdownText: '',
      sending: false,
      sendSMS: vi.fn(),
    });
    const confirmPasswordRule = schema.find(
      (item) => item.fieldName === 'confirm_password',
    )?.dependencies?.rules as any;
    const confirmPayPasswordRule = schema.find(
      (item) => item.fieldName === 'confirm_pay_password',
    )?.dependencies?.rules as any;

    expect(
      confirmPasswordRule({ password: ' Abc_123 ' }).safeParse('Abc_123')
        .success,
    ).toBe(true);
    expect(
      confirmPayPasswordRule({ pay_password: ' 123456 ' }).safeParse('123456')
        .success,
    ).toBe(true);
  });

  it('builds forgot password schema with sms suffix', () => {
    const schema = buildCustomerForgotPasswordSchema({
      canSendSMS: false,
      countdownText: '59s',
      sending: true,
      sendSMS: vi.fn(),
    });
    expect(schema.map((item) => item.fieldName)).toEqual([
      'phone',
      'sms_code',
      'password',
      'confirm_password',
    ]);
    expect(
      schema.find((item) => item.fieldName === 'sms_code')?.suffix,
    ).toBeTypeOf('function');
  });

  it('compares forgot password confirmation after trimming values', () => {
    const schema = buildCustomerForgotPasswordSchema({
      canSendSMS: false,
      countdownText: '59s',
      sending: true,
      sendSMS: vi.fn(),
    });
    const confirmPasswordRule = schema.find(
      (item) => item.fieldName === 'confirm_password',
    )?.dependencies?.rules as any;

    expect(
      confirmPasswordRule({ password: ' New_123 ' }).safeParse('New_123')
        .success,
    ).toBe(true);
  });

  it('keeps company name max length validation message', () => {
    const schema = buildCustomerRegisterSchema({
      canSendSMS: true,
      countdownText: '',
      sending: false,
      sendSMS: vi.fn(),
    });
    const companyRule = schema.find((item) => item.fieldName === 'company_name')
      ?.rules as any;
    const result = companyRule.safeParse('测'.repeat(101));

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      '公司/店铺名称不能超过 100 个字符',
    );
  });
});
