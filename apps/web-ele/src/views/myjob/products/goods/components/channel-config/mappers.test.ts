import { describe, expect, it } from 'vitest';

import {
  buildProductGoodsChannelAutoPricePayload,
  buildProductGoodsChannelBindingPayload,
} from './mappers';
import { isValidNonNegativeMoney } from './validators';

describe('product goods channel mappers', () => {
  it('normalizes the binding payload before submit', () => {
    expect(
      buildProductGoodsChannelBindingPayload({
        dock_status: '1',
        platform_account_id: '101',
        sort: '20',
        source_cost_price: ' 10.2500 ',
        supplier_goods_name: ' 腾讯周卡 ',
        supplier_goods_no: ' SKU-001 ',
        validate_template_id: '7',
      }),
    ).toEqual({
      dock_status: 1,
      platform_account_id: 101,
      sort: 20,
      source_cost_price: '10.2500',
      supplier_goods_name: '腾讯周卡',
      supplier_goods_no: 'SKU-001',
      validate_template_id: 7,
    });
  });

  it('falls back to null template and zero sort for blank binding values', () => {
    expect(
      buildProductGoodsChannelBindingPayload({
        dock_status: 0,
        platform_account_id: 12,
        sort: '',
        source_cost_price: '0',
        supplier_goods_name: '测试商品',
        supplier_goods_no: 'SKU-002',
        validate_template_id: '',
      }),
    ).toEqual({
      dock_status: 0,
      platform_account_id: 12,
      sort: 0,
      source_cost_price: '0',
      supplier_goods_name: '测试商品',
      supplier_goods_no: 'SKU-002',
      validate_template_id: null,
    });
  });

  it('builds the enabled auto price payload with trimmed values', () => {
    expect(
      buildProductGoodsChannelAutoPricePayload({
        add_type: ' percent ',
        default_price: ' 10.5000 ',
        is_auto_change: '1',
      }),
    ).toEqual({
      add_type: 'percent',
      default_price: '10.5000',
      is_auto_change: 1,
    });
  });

  it('clears add type and default price when auto price is disabled', () => {
    expect(
      buildProductGoodsChannelAutoPricePayload({
        add_type: 'fixed',
        default_price: '8.0000',
        is_auto_change: 0,
      }),
    ).toEqual({
      add_type: '',
      default_price: '0.0000',
      is_auto_change: 0,
    });
  });
});

describe('product goods channel validators', () => {
  it('accepts non-negative money with up to four decimals', () => {
    expect(isValidNonNegativeMoney('0')).toBe(true);
    expect(isValidNonNegativeMoney('10.5')).toBe(true);
    expect(isValidNonNegativeMoney('10.2500')).toBe(true);
  });

  it('rejects negative money and over-precision', () => {
    expect(isValidNonNegativeMoney('-1')).toBe(false);
    expect(isValidNonNegativeMoney('10.12345')).toBe(false);
    expect(isValidNonNegativeMoney('abc')).toBe(false);
  });
});
