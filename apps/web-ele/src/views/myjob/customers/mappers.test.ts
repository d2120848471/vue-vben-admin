import { describe, expect, it } from 'vitest';

import {
  buildCustomerListQuery,
  buildCustomerPayload,
  buildCustomerTrashQuery,
  buildPasswordPayload,
  buildPayPasswordPayload,
  toCustomerFormValues,
} from './mappers';

describe('admin customer mappers', () => {
  it('builds list and trash queries', () => {
    expect(
      buildCustomerListQuery(
        { page: { currentPage: 2, pageSize: 30 } },
        { keyword: ' 测试 ', status: '1' },
      ),
    ).toEqual({
      keyword: '测试',
      page: 2,
      page_size: 30,
      status: 1,
    });
    expect(
      buildCustomerListQuery(
        { page: { currentPage: 1, pageSize: 20 } },
        { keyword: ' ', status: '' },
      ),
    ).toEqual({
      page: 1,
      page_size: 20,
    });
    expect(
      buildCustomerTrashQuery(
        { page: { currentPage: 3, pageSize: 10 } },
        { keyword: ' 回收 ' },
      ),
    ).toEqual({
      keyword: '回收',
      page: 3,
      page_size: 10,
    });
  });

  it('builds create payload with passwords and edit payload without passwords', () => {
    expect(
      buildCustomerPayload(
        {
          company_name: ' 测试公司 ',
          confirm_password: ' Abc_123 ',
          confirm_pay_password: ' 123456 ',
          password: ' Abc_123 ',
          pay_password: ' 123456 ',
          phone: ' 13800000000 ',
          status: 1,
        },
        'create',
      ),
    ).toEqual({
      company_name: '测试公司',
      confirm_password: 'Abc_123',
      confirm_pay_password: '123456',
      password: 'Abc_123',
      pay_password: '123456',
      phone: '13800000000',
      status: 1,
    });

    expect(
      buildCustomerPayload(
        {
          company_name: ' 编辑公司 ',
          confirm_password: 'should-drop',
          confirm_pay_password: 'should-drop',
          password: 'should-drop',
          pay_password: 'should-drop',
          phone: ' 13800000001 ',
          status: 0,
        },
        'edit',
      ),
    ).toEqual({
      company_name: '编辑公司',
      phone: '13800000001',
      status: 0,
    });
  });

  it('maps row to editable form and builds password payloads', () => {
    expect(
      toCustomerFormValues({
        company_name: '测试公司',
        created_at: '',
        id: 1,
        last_login_at: '',
        last_login_ip: '',
        phone: '13800000000',
        status: 1,
        updated_at: '',
      }),
    ).toEqual({
      company_name: '测试公司',
      confirm_password: '',
      confirm_pay_password: '',
      password: '',
      pay_password: '',
      phone: '13800000000',
      status: 1,
    });
    expect(
      buildPasswordPayload({
        confirm_password: ' New_123 ',
        password: ' New_123 ',
      }),
    ).toEqual({
      confirm_password: 'New_123',
      password: 'New_123',
    });
    expect(
      buildPayPasswordPayload({
        confirm_pay_password: ' 654321 ',
        pay_password: ' 654321 ',
      }),
    ).toEqual({
      confirm_pay_password: '654321',
      pay_password: '654321',
    });
  });
});
