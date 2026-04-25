/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ORDER_HAS_TAX_OPTIONS,
  ORDER_IS_CARD_OPTIONS,
  ORDER_KEYWORD_BY_OPTIONS,
  ORDER_QUICK_RANGE_OPTIONS,
  ORDER_STATUS_OPTIONS,
  resolveOrderStatusTagType,
} from './constants';
import OrdersPage from './index.vue';
import {
  buildOrderColumns,
  buildOrderFilterSchema,
  formatOrderCellText,
} from './schemas';

const apiMocks = vi.hoisted(() => ({
  getOrderListApi: vi.fn(),
}));

const gridConfigState = vi.hoisted(() => ({
  latest: null as any,
}));

vi.mock('#/api/modules/admin/orders', () => apiMocks);

vi.mock('@vben/common-ui', () => ({
  Page: defineComponent({
    name: 'PageStub',
    setup(_, { slots }) {
      return () => h('div', { 'data-test': 'page' }, slots.default?.());
    },
  }),
}));

vi.mock('#/adapter/vxe-table', () => ({
  useVbenVxeGrid: (config: any) => {
    gridConfigState.latest = config;
    const Grid = defineComponent({
      name: 'GridStub',
      setup(_, { slots }) {
        return () =>
          h('div', { 'data-test': 'grid' }, [
            slots.status?.({
              row: {
                status_code: 'success',
                status_text: '成功',
              },
            }),
          ]);
      },
    });

    return [Grid];
  },
}));

vi.mock('element-plus', () => ({
  ElTag: defineComponent({
    name: 'ElTagStub',
    props: {
      type: {
        default: '',
        type: String,
      },
    },
    setup(props, { slots }) {
      return () =>
        h(
          'span',
          {
            'data-test': 'status-tag',
            'data-type': props.type,
          },
          slots.default?.(),
        );
    },
  }),
}));

function mountPage() {
  const root = document.createElement('div');
  document.body.append(root);
  const app = createApp(OrdersPage);
  app.mount(root);
  return {
    app,
    root,
    unmount: () => {
      app.unmount();
      root.remove();
    },
  };
}

describe('orders schemas', () => {
  it('defines the order filter schema fields', () => {
    const schema = buildOrderFilterSchema();

    expect(schema.map((item) => item.fieldName)).toEqual([
      'keyword_by',
      'keyword',
      'status',
      'has_tax',
      'is_card',
      'channel_id',
      'quick_range',
      'date_range',
    ]);
  });

  it('defines order columns for operational troubleshooting fields', () => {
    const columns = buildOrderColumns();

    expect(columns.map((item) => item.field)).toEqual([
      'sales_subject_name',
      'order_no',
      'goods_id',
      'goods_name',
      'account',
      'quantity',
      'order_amount',
      'cost_amount',
      'profit_amount',
      'current_channel_name',
      'supplier_order_no',
      'attempt_count',
      'status_code',
      'last_receipt',
      'created_at',
      'updated_at',
    ]);
  });

  it('keeps filter options aligned with the backend contract', () => {
    expect(ORDER_KEYWORD_BY_OPTIONS).toContainEqual({
      label: '订单号',
      value: 'order_no',
    });
    expect(ORDER_STATUS_OPTIONS).toContainEqual({
      label: '成功',
      value: 'success',
    });
    expect(ORDER_HAS_TAX_OPTIONS).toEqual([
      { label: '全部', value: '' },
      { label: '含税', value: '1' },
      { label: '未税', value: '0' },
    ]);
    expect(ORDER_IS_CARD_OPTIONS).toEqual([
      { label: '全部', value: '' },
      { label: '是', value: '1' },
      { label: '否', value: '0' },
    ]);
    expect(ORDER_QUICK_RANGE_OPTIONS).toContainEqual({
      label: '近 3 个自然月',
      value: 'three_months',
    });
    expect(resolveOrderStatusTagType('success')).toBe('success');
    expect(resolveOrderStatusTagType('unknown-status')).toBe('info');
  });

  it('formats empty table cells as placeholders', () => {
    const columns = buildOrderColumns();
    const supplierOrderColumn = columns.find(
      (item) => item.field === 'supplier_order_no',
    );
    const lastReceiptColumn = columns.find(
      (item) => item.field === 'last_receipt',
    );

    expect(formatOrderCellText('')).toBe('--');
    expect(formatOrderCellText(undefined)).toBe('--');
    expect(formatOrderCellText('S202604250001')).toBe('S202604250001');
    expect(supplierOrderColumn?.formatter?.({ cellValue: '' })).toBe('--');
    expect(lastReceiptColumn?.formatter?.({ cellValue: '' })).toBe('--');
  });
});

describe('orders page', () => {
  let wrapper: ReturnType<typeof mountPage> | undefined;

  beforeEach(() => {
    vi.resetAllMocks();
    gridConfigState.latest = null;
    apiMocks.getOrderListApi.mockResolvedValue({
      list: [
        {
          account: '13800000000',
          attempt_count: 1,
          cost_amount: '8.0000',
          created_at: '2026-04-25 10:00:00',
          current_channel_id: 21,
          current_channel_name: '星权益',
          goods_id: 'G10001',
          goods_name: '话费充值',
          id: 1,
          last_receipt: '充值成功',
          order_amount: '10.0000',
          order_no: 'O202604250001',
          profit_amount: '2.0000',
          quantity: 1,
          sales_subject_name: '聚权益',
          status_code: 'success',
          status_text: '成功',
          supplier_order_no: 'S202604250001',
          updated_at: '2026-04-25 10:01:00',
        },
      ],
      pagination: { page: 2, page_size: 30, total: 1 },
      stats: {
        today_order_amount: '10.0000',
        today_order_count: 1,
        yesterday_order_amount: '20.0000',
        yesterday_order_count: 2,
      },
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  it('maps grid query values to the orders API and updates stats', async () => {
    wrapper = mountPage();

    const result =
      await gridConfigState.latest.gridOptions.proxyConfig.ajax.query(
        { page: { currentPage: 2, pageSize: 30 } },
        {
          channel_id: 21,
          date_range: ['2026-04-25 00:00:00', '2026-04-25 23:59:59'],
          has_tax: '1',
          is_card: '0',
          keyword: 'O202604250001',
          keyword_by: 'order_no',
          quick_range: 'today',
          status: 'success',
        },
      );
    await nextTick();

    expect(apiMocks.getOrderListApi).toHaveBeenCalledWith({
      channel_id: 21,
      end_time: '2026-04-25 23:59:59',
      has_tax: '1',
      is_card: '0',
      keyword: 'O202604250001',
      keyword_by: 'order_no',
      page: 2,
      page_size: 30,
      quick_range: 'today',
      start_time: '2026-04-25 00:00:00',
      status: 'success',
    });
    expect(result).toEqual({
      items: expect.any(Array),
      total: 1,
    });
    expect(wrapper.root.textContent).toContain('今日订单数');
    expect(wrapper.root.textContent).toContain('1');
    expect(wrapper.root.textContent).toContain('今日交易额');
    expect(wrapper.root.textContent).toContain('10.0000');
    const statusTag = wrapper.root.querySelector(
      '[data-test="status-tag"]',
    ) as HTMLElement | null;
    expect(statusTag?.textContent).toContain('成功');
    expect(statusTag?.dataset.type).toBe('success');
  });
});
