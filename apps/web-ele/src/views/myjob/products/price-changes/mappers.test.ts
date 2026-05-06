import { describe, expect, it } from 'vitest';

import { buildPriceChangeListQuery } from './mappers';

describe('price change mappers', () => {
  it('builds trimmed list query params', () => {
    expect(
      buildPriceChangeListQuery(
        { page: { currentPage: 2, pageSize: 50 } },
        {
          date_range: ['2026-05-06 00:00:00', '2026-05-06 23:59:59'],
          keyword: ' PRICE-CHANGE-001 ',
          platform_id: '101',
          source: 'push',
          supplier_goods_no: ' 2582531 ',
        },
      ),
    ).toEqual({
      end_at: '2026-05-06 23:59:59',
      keyword: 'PRICE-CHANGE-001',
      page: 2,
      page_size: 50,
      platform_id: 101,
      source: 'push',
      start_at: '2026-05-06 00:00:00',
      supplier_goods_no: '2582531',
    });
  });

  it('omits empty filters and invalid platform id', () => {
    expect(
      buildPriceChangeListQuery(
        { page: { currentPage: 1, pageSize: 20 } },
        {
          date_range: ['2026-05-06 00:00:00'],
          keyword: ' ',
          platform_id: 'abc',
          source: '',
          supplier_goods_no: '',
        },
      ),
    ).toEqual({
      page: 1,
      page_size: 20,
    });
  });

  it('omits non-positive platform id', () => {
    expect(
      buildPriceChangeListQuery(
        { page: { currentPage: 1, pageSize: 20 } },
        {
          platform_id: 0,
        },
      ),
    ).toEqual({
      page: 1,
      page_size: 20,
    });
  });

  it('omits invalid date range values', () => {
    expect(
      buildPriceChangeListQuery(
        { page: { currentPage: 1, pageSize: 20 } },
        {
          date_range: ['bad-date', '2026-05-06 23:59:59'],
        },
      ),
    ).toEqual({
      page: 1,
      page_size: 20,
    });
  });

  it('omits unsupported source values', () => {
    expect(
      buildPriceChangeListQuery(
        { page: { currentPage: 1, pageSize: 20 } },
        {
          source: 'manual',
        },
      ),
    ).toEqual({
      page: 1,
      page_size: 20,
    });
  });
});
