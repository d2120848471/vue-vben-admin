import { describe, expect, it } from 'vitest';

import {
  validateAgreementAccepted,
  validateCompanyName,
  validateCustomerLoginPassword,
  validateMatchingValue,
  validatePayPassword,
  validatePhone,
  validateSMSCode,
} from './validators';

describe('customer auth validators', () => {
  it('validates phone format', () => {
    expect(validatePhone('13800000000')).toBe('');
    expect(validatePhone('23800000000')).toBe('请输入 1 开头的 11 位手机号');
    expect(validatePhone('1380000000')).toBe('请输入 1 开头的 11 位手机号');
  });

  it('validates sms code and pay password', () => {
    expect(validateSMSCode('123456')).toBe('');
    expect(validateSMSCode('12345a')).toBe('请输入 6 位数字验证码');
    expect(validatePayPassword('654321')).toBe('');
    expect(validatePayPassword('65432a')).toBe('支付密码必须是 6 位数字');
  });

  it('validates login password rule', () => {
    expect(validateCustomerLoginPassword('Abc_123')).toBe('');
    expect(validateCustomerLoginPassword('1bc_123')).toBe(
      '登录密码必须字母开头，6-10 位，支持字母、数字、下划线',
    );
    expect(validateCustomerLoginPassword('Abc-123')).toBe(
      '登录密码必须字母开头，6-10 位，支持字母、数字、下划线',
    );
  });

  it('validates company name and matching values', () => {
    expect(validateCompanyName('测试公司')).toBe('');
    expect(validateCompanyName('')).toBe('请输入公司/店铺名称');
    expect(validateCompanyName('测'.repeat(101))).toBe(
      '公司/店铺名称不能超过 100 个字符',
    );
    expect(
      validateMatchingValue('Abc_123', 'Abc_123', '两次登录密码不一致'),
    ).toBe('');
    expect(
      validateMatchingValue('Abc_123', 'Abc_124', '两次登录密码不一致'),
    ).toBe('两次登录密码不一致');
  });

  it('validates agreement checkbox', () => {
    expect(validateAgreementAccepted(true)).toBe('');
    expect(validateAgreementAccepted(false)).toBe('请先同意服务协议');
  });
});
