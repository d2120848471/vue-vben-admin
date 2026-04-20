import type { ProductGoodsInventoryConfigSummary } from '#/api/modules/admin/products/goods-channels';

const DEFAULT_SUMMARY: ProductGoodsInventoryConfigSummary = {
  allow_loss_sale_enabled: 0,
  combo_goods_enabled: 0,
  max_loss_amount: '0.0000',
  order_strategy: 'fixed_order',
  reorder_timeout_enabled: 0,
  reorder_timeout_minutes: 0,
  smart_reorder_enabled: 0,
  sync_cost_price_enabled: 0,
  sync_goods_name_enabled: 0,
};

const ORDER_STRATEGY_LABELS: Record<string, string> = {
  fixed_order: '固定顺序',
  lowest_cost: '进价从低到高',
  random: '随机选择',
  time_window: '按时段提交',
  weighted_percent: '百分比分配',
};

function getSwitchText(value: number) {
  return value === 1 ? '开启' : '关闭';
}

export function getOrderStrategyLabel(value: string) {
  const normalized = String(value ?? '').trim();
  return ORDER_STRATEGY_LABELS[normalized] || normalized || '--';
}

/**
 * 渠道弹窗顶部只展示库存配置摘要，不复刻旧页图文卡片。
 * 这里集中做文案归一化，避免组件模板里散落业务判断。
 */
export function buildProductGoodsInventorySummaryItems(
  summary: null | ProductGoodsInventoryConfigSummary | undefined,
) {
  const normalized = {
    ...DEFAULT_SUMMARY,
    ...summary,
  };

  return [
    {
      label: '智能补单',
      value: getSwitchText(normalized.smart_reorder_enabled),
    },
    {
      label: '补单时间设置',
      value:
        normalized.reorder_timeout_enabled === 1
          ? `开启（${normalized.reorder_timeout_minutes}分钟）`
          : '关闭',
    },
    {
      label: '下单方式',
      value: getOrderStrategyLabel(normalized.order_strategy),
    },
    {
      label: '同步进价',
      value: getSwitchText(normalized.sync_cost_price_enabled),
    },
    {
      label: '同步商品名称',
      value: getSwitchText(normalized.sync_goods_name_enabled),
    },
    {
      label: '亏本销售',
      value:
        normalized.allow_loss_sale_enabled === 1
          ? `开启（${normalized.max_loss_amount}）`
          : '关闭',
    },
    {
      label: '组合商品',
      value: normalized.combo_goods_enabled === 1 ? '是' : '否',
    },
  ];
}
