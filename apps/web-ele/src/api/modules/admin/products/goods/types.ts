import type { ListQuery } from '../../common';

export interface ProductGoodsListQuery extends ListQuery {
  brand_id?: number;
  goods_type?: string;
  has_tax?: string;
  keyword?: string;
  status?: string;
}

export interface ProductGoodsListItem {
  brand_id: number;
  brand_icon: string;
  brand_name: string;
  bound_channel_count: number;
  bound_channels: string[];
  channel_auto_price_status: number;
  created_at: string;
  default_sell_price: string;
  exception_notify: number;
  goods_code: string;
  goods_type: string;
  has_tax: number;
  id: number;
  is_douyin: number;
  is_export: number;
  min_channel_cost: string;
  min_channel_effective_sell_price: string;
  name: string;
  primary_channel_name: string;
  product_template_id: number;
  product_template_title: string;
  purchase_limit_strategy_id: number;
  purchase_limit_strategy_name: string;
  status: number;
  subject_name?: string;
  supply_type: string;
  terminal_price_limit: string;
}

export interface ProductGoodsDetailResult {
  balance_limit: string;
  brand_id: number;
  brand_name: string;
  created_at: string;
  default_sell_price: string;
  exception_notify: number;
  goods_code: string;
  goods_type: string;
  has_tax: number;
  id: number;
  is_douyin: number;
  is_export: number;
  max_purchase_qty: number;
  min_purchase_qty: number;
  name: string;
  product_template_id: null | number;
  product_template_title: string;
  purchase_limit_strategy_id: null | number;
  purchase_limit_strategy_name: string;
  purchase_limit_strategy_status: number;
  purchase_notice: string;
  status: number;
  subject_id: null | number;
  subject_name: string;
  supply_type: string;
  terminal_price_limit: string;
  updated_at: string;
}

export interface ProductGoodsPayload {
  balance_limit: string;
  brand_id: number;
  default_sell_price: string;
  exception_notify: number;
  goods_type: string;
  has_tax: number;
  is_douyin: number;
  is_export: number;
  max_purchase_qty: number;
  min_purchase_qty: number;
  name: string;
  product_template_id: null | number;
  purchase_limit_strategy_id: null | number;
  purchase_notice: string;
  status: number;
  subject_id: null | number;
  supply_type: string;
  terminal_price_limit: string;
}

export interface ProductGoodsStatusFailedItem {
  id: number;
  reason: string;
}

export interface ProductGoodsStatusResult {
  failed: ProductGoodsStatusFailedItem[];
  failed_count: number;
  success_count: number;
  success_ids: number[];
}

export interface ProductGoodsBrandOption {
  children: ProductGoodsBrandOption[];
  id: number;
  is_leaf: boolean;
  name: string;
}

export interface ProductGoodsTemplateOption {
  id: number;
  title: string;
}

export interface ProductGoodsStrategyOption {
  id: number;
  name: string;
}

export interface ProductGoodsSubjectOption {
  id: number;
  name: string;
}

export interface ProductGoodsStringOption {
  label: string;
  value: string;
}

export interface ProductGoodsIntOption {
  label: string;
  value: number;
}

export interface ProductGoodsFormOptionsResult {
  boolean_options: ProductGoodsIntOption[];
  brands: ProductGoodsBrandOption[];
  goods_types: ProductGoodsStringOption[];
  purchase_limit_strategies: ProductGoodsStrategyOption[];
  status_options: ProductGoodsIntOption[];
  subjects: ProductGoodsSubjectOption[];
  supply_types: ProductGoodsStringOption[];
  templates: ProductGoodsTemplateOption[];
}
