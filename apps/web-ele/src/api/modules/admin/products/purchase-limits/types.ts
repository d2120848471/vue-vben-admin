import type { ListQuery } from '../../common';

export interface PurchaseLimitStrategyListItem {
  created_at: string;
  id: number;
  limit_nums: number;
  limit_times: number;
  limit_type: number;
  limit_type_label: string;
  name: string;
  period: number;
  period_type: number;
  period_type_label: string;
  status: number;
}

export interface PurchaseLimitStrategyListQuery extends ListQuery {
  keyword?: string;
}

export interface PurchaseLimitStrategyPayload {
  limit_nums: number;
  limit_times: number;
  limit_type: number;
  name: string;
  period: number;
  period_type: number;
}

export interface PurchaseLimitStrategyEnumItem {
  id: number;
  title: string;
}

export interface PurchaseLimitStrategyEnumsResult {
  limit_types: PurchaseLimitStrategyEnumItem[];
  period_types: PurchaseLimitStrategyEnumItem[];
}
