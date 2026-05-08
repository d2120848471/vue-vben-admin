import { describe, expect, it } from 'vitest';

import {
  buildCustomerForgotPasswordPayload,
  buildCustomerLoginPayload,
  buildCustomerRegisterPayload,
} from './mappers';

describe('customer auth mappers', () => {
  it('builds trimmed login payload', () => {
    expect(
      buildCustomerLoginPayload({
        password: ' Abc_123 ',
        phone: ' 13800000000 ',
      }),
    ).toEqual({
      password: 'Abc_123',
      phone: '13800000000',
    });
  });

  it('builds trimmed register payload without agreement field', () => {
    expect(
      buildCustomerRegisterPayload({
        agree_policy: true,
        company_name: ' 测试公司 ',
        confirm_password: ' Abc_123 ',
        confirm_pay_password: ' 123456 ',
        password: ' Abc_123 ',
        pay_password: ' 123456 ',
        phone: ' 13800000000 ',
        sms_code: ' 654321 ',
      }),
    ).toEqual({
      company_name: '测试公司',
      confirm_password: 'Abc_123',
      confirm_pay_password: '123456',
      password: 'Abc_123',
      pay_password: '123456',
      phone: '13800000000',
      sms_code: '654321',
    });
  });

  it('builds forgot password payload', () => {
    expect(
      buildCustomerForgotPasswordPayload({
        confirm_password: ' New_123 ',
        password: ' New_123 ',
        phone: ' 13800000000 ',
        sms_code: ' 123456 ',
      }),
    ).toEqual({
      confirm_password: 'New_123',
      password: 'New_123',
      phone: '13800000000',
      sms_code: '123456',
    });
  });
});
