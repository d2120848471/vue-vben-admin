import type { ListQuery, Pagination } from '../common';

export interface OrderListQuery extends ListQuery {
  channel_id?: number | string;
  end_time?: string;
  has_tax?: string;
  is_card?: string;
  keyword?: string;
  keyword_by?: string;
  quick_range?: string;
  start_time?: string;
  status?: string;
}

export interface OrderStats {
  today_order_amount: string;
  today_order_count: number;
  yesterday_order_amount: string;
  yesterday_order_count: number;
}

export interface OrderListItem {
  account: string;
  attempt_count: number;
  cost_amount: string;
  created_at: string;
  current_channel_id: number;
  current_channel_name: string;
  goods_id: string;
  goods_name: string;
  id: number;
  last_receipt: string;
  order_amount: string;
  order_no: string;
  profit_amount: string;
  quantity: number;
  sales_subject_name: string;
  status_code: string;
  status_text: string;
  supplier_order_no: string;
  updated_at: string;
}

export interface OrderListResult {
  list: OrderListItem[];
  pagination: Pagination;
  stats: OrderStats;
}
