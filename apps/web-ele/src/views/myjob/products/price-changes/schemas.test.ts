import { describe, expect, it } from 'vitest';

import {
  buildPriceChangeColumns,
  buildPriceChangeFilterSchema,
  formatPriceChangeRange,
  PRICE_CHANGE_SOURCE_OPTIONS,
  resolvePriceChangeSourceText,
} from './schemas';

describe('price change schemas', () => {
  it('builds filter schema', () => {
    expect(buildPriceChangeFilterSchema()).toMatchObject([
      { fieldName: 'source', label: '来源' },
      { fieldName: 'keyword', label: '本地商品' },
      { fieldName: 'supplier_goods_no', label: '上游商品编号' },
      { fieldName: 'platform_id', label: '平台账号 ID' },
      { fieldName: 'date_range', label: '变动时间' },
    ]);
    expect(PRICE_CHANGE_SOURCE_OPTIONS).toEqual([
      { label: '全部', value: '' },
      { label: '监控', value: 'monitor' },
      { label: '推送', value: 'push' },
    ]);
  });

  it('builds audit columns', () => {
    expect(buildPriceChangeColumns().map((column) => column.field)).toEqual([
      'source',
      'platform',
      'goods',
      'supplier_goods',
      'source_cost_price_change',
      'cost_price_change',
      'effective_sell_price_change',
      'change_amount',
      'changed_at',
    ]);
  });

  it('formats source and price range text', () => {
    expect(resolvePriceChangeSourceText('monitor')).toBe('监控');
    expect(resolvePriceChangeSourceText('push')).toBe('推送');
    expect(resolvePriceChangeSourceText('manual')).toBe('manual');
    expect(resolvePriceChangeSourceText('')).toBe('--');
    expect(formatPriceChangeRange('10.0000', '12.0000')).toBe(
      '10.0000 -> 12.0000',
    );
    expect(formatPriceChangeRange('', '')).toBe('-- -> --');
  });
});
