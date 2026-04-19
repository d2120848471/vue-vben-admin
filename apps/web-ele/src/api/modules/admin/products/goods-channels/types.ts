export interface ProductGoodsChannelGoodsSummary {
  brand_name: string;
  default_sell_price: string;
  goods_code: string;
  has_tax: number;
  id: number;
  name: string;
  subject_id: null | number;
  subject_name: string;
}

export interface ProductGoodsChannelBindingItem {
  add_type: string;
  connect_status: number;
  connect_status_text: string;
  cost_price: string;
  created_at: string;
  default_price: string;
  display_name: string;
  dock_status: number;
  effective_sell_price: string;
  id: number;
  is_auto_change: number;
  platform_account_id: number;
  platform_account_name: string;
  platform_has_tax: number;
  sort: number;
  source_cost_price: string;
  supplier_goods_name: string;
  supplier_goods_no: string;
  tax_adjust_amount: string;
  tax_adjust_direction: string;
  tax_adjust_rate: string;
  updated_at: string;
  validate_template_id: null | number;
  validate_template_title: string;
}

export interface ProductGoodsChannelBindingsResult {
  goods: ProductGoodsChannelGoodsSummary;
  list: ProductGoodsChannelBindingItem[];
}

export interface ProductGoodsChannelPlatformAccountOption {
  connect_status: number;
  connect_status_text: string;
  has_tax: number;
  id: number;
  name: string;
  subject_id: number;
  subject_name: string;
}

export interface ProductGoodsChannelTemplateOption {
  id: number;
  title: string;
}

export interface ProductGoodsChannelIntOption {
  label: string;
  value: number;
}

export interface ProductGoodsChannelStringOption {
  label: string;
  value: string;
}

export interface ProductGoodsChannelBindingFormOptionsResult {
  auto_price_type_options: ProductGoodsChannelStringOption[];
  dock_status_options: ProductGoodsChannelIntOption[];
  platform_accounts: ProductGoodsChannelPlatformAccountOption[];
  validate_templates: ProductGoodsChannelTemplateOption[];
}

export interface ProductGoodsChannelBindingPayload {
  dock_status: number;
  platform_account_id: number;
  sort: number;
  source_cost_price: string;
  supplier_goods_name: string;
  supplier_goods_no: string;
  validate_template_id: null | number;
}

export interface ProductGoodsChannelAutoPricePayload {
  add_type: string;
  default_price: string;
  is_auto_change: number;
}
