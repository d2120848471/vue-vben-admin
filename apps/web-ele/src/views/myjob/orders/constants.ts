import type { TagProps } from 'element-plus';

export interface OrderOption {
  label: string;
  value: string;
}

export const ORDER_KEYWORD_BY_OPTIONS: OrderOption[] = [
  { label: '全部', value: '' },
  { label: '订单号', value: 'order_no' },
  { label: '充值账号', value: 'account' },
  { label: '商品名称', value: 'goods_name' },
];

export const ORDER_STATUS_OPTIONS: OrderOption[] = [
  { label: '全部', value: '' },
  { label: '待提交', value: 'pending_submit' },
  { label: '处理中', value: 'processing' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
  { label: '未知', value: 'unknown' },
];

export const ORDER_HAS_TAX_OPTIONS: OrderOption[] = [
  { label: '全部', value: '' },
  { label: '含税', value: '1' },
  { label: '未税', value: '0' },
];

export const ORDER_IS_CARD_OPTIONS: OrderOption[] = [
  { label: '全部', value: '' },
  { label: '是', value: '1' },
  { label: '否', value: '0' },
];

export const ORDER_QUICK_RANGE_OPTIONS: OrderOption[] = [
  { label: '全部', value: '' },
  { label: '昨天', value: 'yesterday' },
  { label: '今天', value: 'today' },
  { label: '近 7 天', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '近 3 个自然月', value: 'three_months' },
];

const ORDER_STATUS_TAG_TYPE_MAP: Record<string, TagProps['type']> = {
  failed: 'danger',
  pending_submit: 'warning',
  processing: 'primary',
  success: 'success',
  unknown: 'info',
};

export function resolveOrderStatusTagType(statusCode?: string) {
  return ORDER_STATUS_TAG_TYPE_MAP[statusCode ?? ''] ?? 'info';
}
