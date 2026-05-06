import type { ListQuery } from '../../common';

export type ProductGoodsChannelPriceChangeSource = 'monitor' | 'push';

export interface ProductGoodsChannelPriceChangeListQuery extends ListQuery {
  end_at?: string;
  keyword?: string;
  platform_id?: number;
  source?: ProductGoodsChannelPriceChangeSource;
  start_at?: string;
  supplier_goods_no?: string;
}

export interface ProductGoodsChannelPriceChangeItem {
  binding_id: number;
  change_amount: string;
  changed_at: string;
  description: string;
  goods_code: string;
  goods_icon: string;
  goods_id: number;
  goods_name: string;
  id: number;
  new_cost_price: string;
  new_effective_sell_price: string;
  new_source_cost_price: string;
  old_cost_price: string;
  old_effective_sell_price: string;
  old_source_cost_price: string;
  platform_account_id: number;
  platform_account_name: string;
  provider_code: string;
  raw_payload: string;
  source: string;
  supplier_goods_name: string;
  supplier_goods_no: string;
}
