import type {
  ProductGoodsChannelGoodsSummary,
  ProductGoodsInventoryConfigSummary,
} from '../goods-channels';

export interface ProductGoodsOrderStrategyOption {
  label: string;
  value: string;
}

export interface ProductGoodsInventoryConfigResult {
  config: ProductGoodsInventoryConfigSummary;
  goods: ProductGoodsChannelGoodsSummary;
  order_strategy_options: ProductGoodsOrderStrategyOption[];
}

export interface ProductGoodsInventoryConfigPayload {
  allow_loss_sale_enabled: number;
  combo_goods_enabled: number;
  max_loss_amount: string;
  order_strategy: string;
  reorder_timeout_enabled: number;
  reorder_timeout_minutes: number;
  smart_reorder_enabled: number;
  sync_cost_price_enabled: number;
  sync_goods_name_enabled: number;
}
