/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PriceChangesPage from './index.vue';

const gridConfigState = vi.hoisted(() => ({
  latest: null as any,
}));

const apiMocks = vi.hoisted(() => ({
  getProductGoodsChannelPriceChangeListApi: vi.fn(),
}));

vi.mock('@vben/common-ui', () => ({
  Page: defineComponent({
    name: 'PageStub',
    setup(_, { slots }) {
      return () => h('main', { 'data-test': 'page' }, slots.default?.());
    },
  }),
}));

vi.mock('#/adapter/vxe-table', () => ({
  useVbenVxeGrid: (config: any) => {
    gridConfigState.latest = config;
    return [
      defineComponent({
        name: 'PriceChangeGridStub',
        setup(_, { slots }) {
          const rows = [
            {
              goods_code: 'PRICE-CHANGE-001',
              goods_name: '自动改价测试商品',
              platform_account_id: 101,
              platform_account_name: '卡卡云测试账号',
              supplier_goods_name: '上游测试商品',
              supplier_goods_no: '2582531',
            },
            {
              goods_code: '',
              goods_name: '',
              platform_account_id: undefined,
              platform_account_name: '',
              supplier_goods_name: '',
              supplier_goods_no: '',
            },
          ];
          return () =>
            h(
              'section',
              { 'data-test': 'price-change-grid' },
              rows.flatMap((row) => [
                slots.platform?.({ row }),
                slots.goods?.({ row }),
                slots.supplier_goods?.({ row }),
              ]),
            );
        },
      }),
      { reload: vi.fn() },
    ];
  },
}));

vi.mock('#/api/modules/admin/products/price-changes', () => apiMocks);

async function renderPage() {
  const root = document.createElement('div');
  document.body.append(root);
  const app = createApp(PriceChangesPage);
  app.mount(root);
  await nextTick();
  return {
    root,
    unmount() {
      app.unmount();
      root.remove();
    },
  };
}

describe('PriceChangesPage', () => {
  const mounted: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    gridConfigState.latest = null;
    apiMocks.getProductGoodsChannelPriceChangeListApi.mockResolvedValue({
      list: [],
      pagination: { total: 0 },
    });
  });

  afterEach(() => {
    while (mounted.length > 0) {
      mounted.pop()?.unmount();
    }
  });

  it('configures grid and renders compact row slots', async () => {
    const view = await renderPage();
    mounted.push(view);

    expect(
      view.root.querySelector('[data-test="price-change-grid"]'),
    ).toBeTruthy();
    expect(view.root.textContent).toContain('卡卡云测试账号');
    expect(view.root.textContent).toContain('#101');
    expect(view.root.textContent).toContain('PRICE-CHANGE-001');
    expect(view.root.textContent).toContain('自动改价测试商品');
    expect(view.root.textContent).toContain('2582531');
    expect(view.root.textContent).toContain('上游测试商品');
    expect(view.root.textContent).not.toContain('#undefined');
    expect(
      gridConfigState.latest.formOptions.schema.map(
        (item: any) => item.fieldName,
      ),
    ).toEqual([
      'source',
      'keyword',
      'supplier_goods_no',
      'platform_id',
      'date_range',
    ]);
    expect(
      gridConfigState.latest.gridOptions.columns.map((item: any) => item.field),
    ).toEqual([
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

  it('queries list through mapper and converts grid result', async () => {
    apiMocks.getProductGoodsChannelPriceChangeListApi.mockResolvedValueOnce({
      list: [
        {
          id: 1,
          source: 'push',
        },
      ],
      pagination: { total: 1 },
    });

    const view = await renderPage();
    mounted.push(view);

    const result =
      await gridConfigState.latest.gridOptions.proxyConfig.ajax.query(
        { page: { currentPage: 2, pageSize: 30 } },
        {
          date_range: ['2026-05-06 00:00:00', '2026-05-06 23:59:59'],
          keyword: ' PRICE-CHANGE-001 ',
          platform_id: 101,
          source: 'push',
          supplier_goods_no: ' 2582531 ',
        },
      );

    expect(
      apiMocks.getProductGoodsChannelPriceChangeListApi,
    ).toHaveBeenCalledWith({
      end_at: '2026-05-06 23:59:59',
      keyword: 'PRICE-CHANGE-001',
      page: 2,
      page_size: 30,
      platform_id: 101,
      source: 'push',
      start_at: '2026-05-06 00:00:00',
      supplier_goods_no: '2582531',
    });
    expect(result).toEqual({
      items: [{ id: 1, source: 'push' }],
      total: 1,
    });
  });

  it('falls back to zero total when pagination is missing', async () => {
    apiMocks.getProductGoodsChannelPriceChangeListApi.mockResolvedValueOnce({
      list: [],
    });

    const view = await renderPage();
    mounted.push(view);

    await expect(
      gridConfigState.latest.gridOptions.proxyConfig.ajax.query(
        { page: { currentPage: 1, pageSize: 20 } },
        {},
      ),
    ).resolves.toEqual({
      items: [],
      total: 0,
    });
  });
});
