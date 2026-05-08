import { describe, expect, it } from 'vitest';

import {
  buildCustomerColumns,
  buildCustomerFilterSchema,
  buildCustomerTrashColumns,
  buildCustomerTrashFilterSchema,
  CUSTOMER_STATUS_OPTIONS,
  resolveCustomerStatusText,
} from './schemas';

describe('admin customer schemas', () => {
  it('builds filters and status options', () => {
    expect(buildCustomerFilterSchema().map((item) => item.fieldName)).toEqual([
      'keyword',
      'status',
    ]);
    expect(
      buildCustomerTrashFilterSchema().map((item) => item.fieldName),
    ).toEqual(['keyword']);
    expect(CUSTOMER_STATUS_OPTIONS).toEqual([
      { label: '全部', value: '' },
      { label: '启用', value: '1' },
      { label: '禁用', value: '0' },
    ]);
  });

  it('builds list and trash columns', () => {
    expect(buildCustomerColumns().map((column) => column.field)).toEqual([
      'id',
      'company_name',
      'phone',
      'status',
      'last_login_ip',
      'last_login_at',
      'created_at',
      'updated_at',
      'actions',
    ]);
    expect(buildCustomerTrashColumns().map((column) => column.field)).toEqual([
      'id',
      'company_name',
      'phone',
      'status',
      'last_login_ip',
      'last_login_at',
      'created_at',
      'updated_at',
      'actions',
    ]);
  });

  it('resolves status text', () => {
    expect(resolveCustomerStatusText(1)).toBe('启用');
    expect(resolveCustomerStatusText(0)).toBe('禁用');
    expect(resolveCustomerStatusText(2)).toBe('未知');
  });
});
