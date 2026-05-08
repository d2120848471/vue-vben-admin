import { describe, expect, it } from 'vitest';

import {
  buildCustomerFormRules,
  buildCustomerPasswordRules,
  buildCustomerPayPasswordRules,
  validateCustomerCompanyName,
  validateCustomerLoginPassword,
  validateCustomerPayPassword,
  validateCustomerPhone,
  validateCustomerStatus,
} from './validators';

function validateRule(rule: any, value: unknown) {
  return new Promise<Error | undefined>((resolve) => {
    rule.validator({}, value, resolve);
  });
}

describe('admin customer validators', () => {
  it('validates editable customer fields', () => {
    expect(validateCustomerCompanyName('测试公司')).toBe('');
    expect(validateCustomerCompanyName('')).toBe('请输入公司/店铺名称');
    expect(validateCustomerPhone('13800000000')).toBe('');
    expect(validateCustomerPhone('1380000000')).toBe(
      '请输入 1 开头的 11 位手机号',
    );
    expect(validateCustomerStatus(1)).toBe('');
    expect(validateCustomerStatus(0)).toBe('');
    expect(validateCustomerStatus(2)).toBe('状态值错误');
  });

  it('validates password fields', () => {
    expect(validateCustomerLoginPassword('Abc_123')).toBe('');
    expect(validateCustomerLoginPassword('1bc_123')).toBe(
      '登录密码必须字母开头，6-10 位，支持字母、数字、下划线',
    );
    expect(validateCustomerPayPassword('123456')).toBe('');
    expect(validateCustomerPayPassword('12345a')).toBe(
      '支付密码必须是 6 位数字',
    );
  });

  it('validates create customer confirmation fields against source passwords', async () => {
    const rules = buildCustomerFormRules('create', {
      confirm_password: 'Abc_124',
      confirm_pay_password: '654321',
      password: 'Abc_123',
      pay_password: '123456',
    });

    await expect(
      validateRule(rules.confirm_password[0], 'Abc_124'),
    ).resolves.toMatchObject({ message: '两次登录密码不一致' });
    await expect(
      validateRule(rules.confirm_pay_password[0], '654321'),
    ).resolves.toMatchObject({ message: '两次支付密码不一致' });
  });

  it('validates reset password confirmation fields', async () => {
    const passwordRules = buildCustomerPasswordRules({
      confirm_password: 'New_124',
      password: 'New_123',
    });
    const payPasswordRules = buildCustomerPayPasswordRules({
      confirm_pay_password: '654320',
      pay_password: '654321',
    });

    await expect(
      validateRule(passwordRules.confirm_password[0], 'New_124'),
    ).resolves.toMatchObject({ message: '两次登录密码不一致' });
    await expect(
      validateRule(payPasswordRules.confirm_pay_password[0], '654320'),
    ).resolves.toMatchObject({ message: '两次支付密码不一致' });
  });
});
