import type { PriceChangeSource } from './types';

import { formatDateTime } from '../../shared';

export const PRICE_CHANGE_SOURCE_OPTIONS: Array<{
  label: string;
  value: PriceChangeSource;
}> = [
  { label: '全部', value: '' },
  { label: '监控', value: 'monitor' },
  { label: '推送', value: 'push' },
];

const PRICE_CHANGE_SOURCE_LABELS: Record<string, string> = {
  monitor: '监控',
  push: '推送',
};

export function resolvePriceChangeSourceText(source?: string) {
  if (!source) {
    return '--';
  }
  return PRICE_CHANGE_SOURCE_LABELS[source] ?? source;
}

export function formatPriceChangeRange(oldValue?: string, newValue?: string) {
  return `${oldValue || '--'} -> ${newValue || '--'}`;
}

export function buildPriceChangeFilterSchema() {
  return [
    {
      component: 'Select',
      componentProps: {
        options: PRICE_CHANGE_SOURCE_OPTIONS,
        placeholder: '请选择来源',
      },
      fieldName: 'source',
      label: '来源',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入商品编号或名称',
      },
      fieldName: 'keyword',
      label: '本地商品',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入上游商品编号',
      },
      fieldName: 'supplier_goods_no',
      label: '上游商品编号',
    },
    {
      component: 'InputNumber',
      componentProps: {
        controlsPosition: 'right',
        min: 1,
        placeholder: '请输入平台账号 ID',
        precision: 0,
      },
      fieldName: 'platform_id',
      label: '平台账号 ID',
    },
    {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'date_range',
      label: '变动时间',
    },
  ];
}

export function buildPriceChangeColumns() {
  return [
    {
      field: 'source',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        resolvePriceChangeSourceText(cellValue),
      minWidth: 100,
      title: '来源',
    },
    {
      field: 'platform',
      minWidth: 180,
      slots: { default: 'platform' },
      title: '平台账号',
    },
    {
      field: 'goods',
      minWidth: 240,
      slots: { default: 'goods' },
      title: '本地商品',
    },
    {
      field: 'supplier_goods',
      minWidth: 240,
      slots: { default: 'supplier_goods' },
      title: '上游商品',
    },
    {
      field: 'source_cost_price_change',
      formatter: ({ row }: { row: Record<string, string> }) =>
        formatPriceChangeRange(
          row.old_source_cost_price,
          row.new_source_cost_price,
        ),
      minWidth: 190,
      title: '原始进价',
    },
    {
      field: 'cost_price_change',
      formatter: ({ row }: { row: Record<string, string> }) =>
        formatPriceChangeRange(row.old_cost_price, row.new_cost_price),
      minWidth: 190,
      title: '比较成本',
    },
    {
      field: 'effective_sell_price_change',
      formatter: ({ row }: { row: Record<string, string> }) =>
        formatPriceChangeRange(
          row.old_effective_sell_price,
          row.new_effective_sell_price,
        ),
      minWidth: 210,
      title: '利润后价格',
    },
    { field: 'change_amount', minWidth: 130, title: '变化值' },
    {
      field: 'changed_at',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatDateTime(cellValue),
      minWidth: 180,
      title: '变动时间',
    },
  ];
}
