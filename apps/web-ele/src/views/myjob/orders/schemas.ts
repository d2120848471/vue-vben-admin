import { formatDateTime } from '../shared';
import {
  ORDER_HAS_TAX_OPTIONS,
  ORDER_IS_CARD_OPTIONS,
  ORDER_KEYWORD_BY_OPTIONS,
  ORDER_QUICK_RANGE_OPTIONS,
  ORDER_STATUS_OPTIONS,
} from './constants';

/**
 * 后端会把部分可选展示字段返回为空字符串，列表统一兜底成 `--`，避免空白单元格被误读为渲染异常。
 */
export function formatOrderCellText(value?: number | string) {
  if (value === undefined || value === null || value === '') {
    return '--';
  }
  return value;
}

/**
 * 订单筛选 schema 和后端 OrderListReq 一一对应，避免页面里散落字段名。
 */
export function buildOrderFilterSchema() {
  return [
    {
      component: 'Select',
      componentProps: {
        options: ORDER_KEYWORD_BY_OPTIONS,
        placeholder: '请选择关键词类型',
      },
      fieldName: 'keyword_by',
      label: '关键词类型',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '订单号 / 充值账号 / 商品名称',
      },
      fieldName: 'keyword',
      label: '关键词',
    },
    {
      component: 'Select',
      componentProps: {
        options: ORDER_STATUS_OPTIONS,
        placeholder: '请选择订单状态',
      },
      fieldName: 'status',
      label: '订单状态',
    },
    {
      component: 'Select',
      componentProps: {
        options: ORDER_HAS_TAX_OPTIONS,
        placeholder: '请选择含税状态',
      },
      fieldName: 'has_tax',
      label: '含税状态',
    },
    {
      component: 'Select',
      componentProps: {
        options: ORDER_IS_CARD_OPTIONS,
        placeholder: '请选择是否卡密',
      },
      fieldName: 'is_card',
      label: '是否卡密',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 1,
        placeholder: '请输入渠道 ID',
      },
      fieldName: 'channel_id',
      label: '当前渠道 ID',
    },
    {
      component: 'Select',
      componentProps: {
        options: ORDER_QUICK_RANGE_OPTIONS,
        placeholder: '请选择快捷时间',
      },
      fieldName: 'quick_range',
      label: '快捷时间',
    },
    {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'date_range',
      label: '创建时间',
    },
  ];
}

/**
 * 订单列表列集中定义，页面只保留插槽和请求编排。
 */
export function buildOrderColumns() {
  return [
    {
      field: 'sales_subject_name',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatOrderCellText(cellValue),
      minWidth: 140,
      title: '销售主体',
    },
    {
      field: 'order_no',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatOrderCellText(cellValue),
      minWidth: 190,
      title: '订单号',
    },
    {
      field: 'goods_id',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatOrderCellText(cellValue),
      minWidth: 140,
      title: '对外商品 ID',
    },
    {
      field: 'goods_name',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatOrderCellText(cellValue),
      minWidth: 220,
      title: '商品名称',
    },
    {
      field: 'account',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatOrderCellText(cellValue),
      minWidth: 160,
      title: '充值账号',
    },
    { field: 'quantity', minWidth: 100, title: '数量' },
    {
      field: 'order_amount',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatOrderCellText(cellValue),
      minWidth: 120,
      title: '订单金额',
    },
    {
      field: 'cost_amount',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatOrderCellText(cellValue),
      minWidth: 120,
      title: '成本金额',
    },
    {
      field: 'profit_amount',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatOrderCellText(cellValue),
      minWidth: 120,
      title: '利润金额',
    },
    {
      field: 'current_channel_name',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatOrderCellText(cellValue),
      minWidth: 170,
      title: '当前渠道',
    },
    {
      field: 'supplier_order_no',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatOrderCellText(cellValue),
      minWidth: 180,
      title: '上游订单号',
    },
    { field: 'attempt_count', minWidth: 100, title: '尝试次数' },
    {
      field: 'status_code',
      minWidth: 110,
      slots: { default: 'status' },
      title: '状态',
    },
    {
      field: 'last_receipt',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatOrderCellText(cellValue),
      minWidth: 240,
      title: '回执摘要',
    },
    {
      field: 'created_at',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatDateTime(cellValue),
      minWidth: 180,
      title: '创建时间',
    },
    {
      field: 'updated_at',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatDateTime(cellValue),
      minWidth: 180,
      title: '更新时间',
    },
  ];
}
