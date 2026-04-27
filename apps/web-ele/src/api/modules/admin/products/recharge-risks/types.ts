import type { ListQuery } from '../../common';

export interface RechargeRiskRuleListQuery extends ListQuery {
  account?: string;
  goods_keyword?: string;
  status?: string;
}

export interface RechargeRiskRuleListItem {
  account: string;
  created_at: string;
  created_by_name: string;
  goods_keyword: string;
  hit_count: number;
  id: number;
  reason: string;
  status: number;
  status_text: string;
  updated_at: string;
  updated_by_name: string;
}

export interface RechargeRiskRulePayload {
  account: string;
  goods_keyword: string;
  reason: string;
  status: number;
}

export interface RechargeRiskRecordListQuery extends ListQuery {
  account?: string;
  end_time?: string;
  goods_keyword?: string;
  start_time?: string;
}

export interface RechargeRiskRecordListItem {
  account: string;
  goods_code: string;
  goods_name: string;
  id: number;
  intercepted_at: string;
  matched_keyword: string;
  order_no: string;
  reason: string;
  rule_id: number;
}
