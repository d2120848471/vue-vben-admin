import { describe, expect, it } from 'vitest';

import {
  buildProductGoodsChannelAutoPricePayload,
  buildProductGoodsChannelBindingPayload,
  buildProductGoodsChannelBindingUpdatePayload,
  buildProductGoodsInventoryConfigPayload,
} from './mappers';
import {
  isValidNonNegativeInteger,
  isValidNonNegativeMoney,
  isValidTimeValue,
} from './validators';

describe('product goods channel mappers', () => {
  it('normalizes the binding payload before submit', () => {
    expect(
      buildProductGoodsChannelBindingPayload({
        dock_status: '1',
        order_time_end: ' 18:00 ',
        order_time_start: ' 09:00 ',
        order_weight: ' 60.0000 ',
        platform_account_id: '101',
        sort: '20',
        source_cost_price: ' 10.2500 ',
        supplier_goods_name: ' 腾讯周卡 ',
        supplier_goods_no: ' SKU-001 ',
        validate_template_id: '7',
      }),
    ).toEqual({
      dock_status: 1,
      order_time_end: '18:00',
      order_time_start: '09:00',
      order_weight: '60.0000',
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
        order_time_end: '',
        order_time_start: '',
        order_weight: '',
        platform_account_id: 12,
        sort: '',
        source_cost_price: '0',
        supplier_goods_name: '测试商品',
        supplier_goods_no: 'SKU-002',
        validate_template_id: '',
      }),
    ).toEqual({
      dock_status: 0,
      order_time_end: '',
      order_time_start: '',
      order_weight: '',
      platform_account_id: 12,
      sort: 0,
      source_cost_price: '0',
      supplier_goods_name: '测试商品',
      supplier_goods_no: 'SKU-002',
      validate_template_id: null,
    });
  });

  it('builds a binding update payload from an existing binding row', () => {
    expect(
      buildProductGoodsChannelBindingUpdatePayload(
        {
          dock_status: 0,
          order_time_end: '18:00',
          order_time_start: '09:00',
          order_weight: '60.0000',
          platform_account_id: 101,
          sort: 20,
          source_cost_price: '10.2500',
          supplier_goods_name: '腾讯周卡',
          supplier_goods_no: 'SKU-001',
          validate_template_id: 7,
        },
        { dock_status: 1 },
      ),
    ).toEqual({
      dock_status: 1,
      order_time_end: '18:00',
      order_time_start: '09:00',
      order_weight: '60.0000',
      platform_account_id: 101,
      sort: 20,
      source_cost_price: '10.2500',
      supplier_goods_name: '腾讯周卡',
      supplier_goods_no: 'SKU-001',
      validate_template_id: 7,
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

  it('normalizes inventory config linked fields before save', () => {
    expect(
      buildProductGoodsInventoryConfigPayload({
        allow_loss_sale_enabled: '0',
        combo_goods_enabled: '1',
        max_loss_amount: ' 9.9000 ',
        order_strategy: ' weighted_percent ',
        reorder_timeout_enabled: '0',
        reorder_timeout_minutes: '45',
        smart_reorder_enabled: '1',
        sync_cost_price_enabled: '1',
        sync_goods_name_enabled: '0',
      }),
    ).toEqual({
      allow_loss_sale_enabled: 0,
      combo_goods_enabled: 1,
      max_loss_amount: '0.0000',
      order_strategy: 'weighted_percent',
      reorder_timeout_enabled: 0,
      reorder_timeout_minutes: 0,
      smart_reorder_enabled: 1,
      sync_cost_price_enabled: 1,
      sync_goods_name_enabled: 0,
    });
  });

  it('throws when enabled timeout minutes is not a non-negative integer', () => {
    expect(() =>
      buildProductGoodsInventoryConfigPayload({
        allow_loss_sale_enabled: '0',
        combo_goods_enabled: '1',
        max_loss_amount: '0.0000',
        order_strategy: 'fixed_order',
        reorder_timeout_enabled: '1',
        reorder_timeout_minutes: 'abc',
        smart_reorder_enabled: '1',
        sync_cost_price_enabled: '1',
        sync_goods_name_enabled: '0',
      }),
    ).toThrowError(/补单时间/);
  });

  it('throws when enabled max loss amount is invalid', () => {
    expect(() =>
      buildProductGoodsInventoryConfigPayload({
        allow_loss_sale_enabled: '1',
        combo_goods_enabled: '1',
        max_loss_amount: '-1',
        order_strategy: 'fixed_order',
        reorder_timeout_enabled: '0',
        reorder_timeout_minutes: '0',
        smart_reorder_enabled: '1',
        sync_cost_price_enabled: '1',
        sync_goods_name_enabled: '0',
      }),
    ).toThrowError(/亏本金额/);
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

  it('accepts non-negative integers for timeout minutes', () => {
    expect(isValidNonNegativeInteger('0')).toBe(true);
    expect(isValidNonNegativeInteger('45')).toBe(true);
    expect(isValidNonNegativeInteger(1440)).toBe(true);
  });

  it('rejects invalid non-negative integers', () => {
    expect(isValidNonNegativeInteger('-1')).toBe(false);
    expect(isValidNonNegativeInteger('1.5')).toBe(false);
    expect(isValidNonNegativeInteger('abc')).toBe(false);
  });

  it('accepts time values in HH:mm format', () => {
    expect(isValidTimeValue('09:00')).toBe(true);
    expect(isValidTimeValue('23:59')).toBe(true);
  });

  it('rejects invalid time values', () => {
    expect(isValidTimeValue('9:00')).toBe(false);
    expect(isValidTimeValue('24:00')).toBe(false);
    expect(isValidTimeValue('23:60')).toBe(false);
    expect(isValidTimeValue('ab:cd')).toBe(false);
  });
});
