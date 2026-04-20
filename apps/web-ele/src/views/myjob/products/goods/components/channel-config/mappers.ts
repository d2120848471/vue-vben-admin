import type { ProductGoodsChannelBindingItem } from '#/api/modules/admin/products/goods-channels';

import {
  isValidNonNegativeInteger,
  isValidNonNegativeMoney,
} from './validators';

function normalizeNumberValue(value: number | string) {
  const normalized = Number(String(value ?? '').trim());
  return Number.isFinite(normalized) ? normalized : 0;
}

function normalizeNullableId(value: null | number | string | undefined) {
  const normalized = normalizeNumberValue(value ?? '');
  return normalized > 0 ? normalized : null;
}

/**
 * 绑定弹窗提交前统一归一化 payload，避免空模板、空排序和首尾空格在多个组件里重复处理。
 */
export function buildProductGoodsChannelBindingPayload(input: {
  dock_status: number | string;
  order_time_end?: string;
  order_time_start?: string;
  order_weight?: string;
  platform_account_id: number | string;
  sort: number | string;
  source_cost_price: string;
  supplier_goods_name: string;
  supplier_goods_no: string;
  validate_template_id?: null | number | string;
}) {
  return {
    dock_status: normalizeNumberValue(input.dock_status),
    order_time_end: String(input.order_time_end ?? '').trim(),
    order_time_start: String(input.order_time_start ?? '').trim(),
    order_weight: String(input.order_weight ?? '').trim(),
    platform_account_id: normalizeNumberValue(input.platform_account_id),
    sort: normalizeNumberValue(input.sort),
    source_cost_price: String(input.source_cost_price ?? '').trim(),
    supplier_goods_name: String(input.supplier_goods_name ?? '').trim(),
    supplier_goods_no: String(input.supplier_goods_no ?? '').trim(),
    validate_template_id: normalizeNullableId(input.validate_template_id),
  };
}

/**
 * 行内开关更新只改单个字段，但 PATCH 仍要求整条绑定核心字段，这里统一从当前行回填。
 */
export function buildProductGoodsChannelBindingUpdatePayload(
  binding: Pick<
    ProductGoodsChannelBindingItem,
    | 'dock_status'
    | 'order_time_end'
    | 'order_time_start'
    | 'order_weight'
    | 'platform_account_id'
    | 'sort'
    | 'source_cost_price'
    | 'supplier_goods_name'
    | 'supplier_goods_no'
    | 'validate_template_id'
  >,
  overrides: Partial<{
    dock_status: number | string;
    order_time_end: string;
    order_time_start: string;
    order_weight: string;
    platform_account_id: number | string;
    sort: number | string;
    source_cost_price: string;
    supplier_goods_name: string;
    supplier_goods_no: string;
    validate_template_id: null | number | string;
  }> = {},
) {
  return buildProductGoodsChannelBindingPayload({
    dock_status: overrides.dock_status ?? binding.dock_status,
    order_time_end: overrides.order_time_end ?? binding.order_time_end,
    order_time_start: overrides.order_time_start ?? binding.order_time_start,
    order_weight: overrides.order_weight ?? binding.order_weight,
    platform_account_id:
      overrides.platform_account_id ?? binding.platform_account_id,
    sort: overrides.sort ?? binding.sort,
    source_cost_price: overrides.source_cost_price ?? binding.source_cost_price,
    supplier_goods_name:
      overrides.supplier_goods_name ?? binding.supplier_goods_name,
    supplier_goods_no: overrides.supplier_goods_no ?? binding.supplier_goods_no,
    validate_template_id:
      overrides.validate_template_id ?? binding.validate_template_id,
  });
}

/**
 * 自动改价关闭时后端会清空类型与利润值，这里在前端侧统一构造，避免组件各自散落判断。
 */
export function buildProductGoodsChannelAutoPricePayload(input: {
  add_type: string;
  default_price: string;
  is_auto_change: number | string;
}) {
  const isAutoChange = normalizeNumberValue(input.is_auto_change);
  if (isAutoChange === 0) {
    return {
      add_type: '',
      default_price: '0.0000',
      is_auto_change: 0,
    };
  }

  return {
    add_type: String(input.add_type ?? '')
      .trim()
      .toLowerCase(),
    default_price: String(input.default_price ?? '').trim(),
    is_auto_change: 1,
  };
}

function normalizeBooleanValue(value: number | string) {
  return normalizeNumberValue(value) > 0 ? 1 : 0;
}

function normalizeRequiredNonNegativeIntegerValue(value: number | string) {
  const normalized = String(value ?? '').trim();
  if (!isValidNonNegativeInteger(normalized)) {
    throw new TypeError('补单时间必须是非负整数分钟');
  }
  return Number(normalized);
}

function normalizeRequiredNonNegativeMoneyValue(value: string) {
  const normalized = String(value ?? '').trim();
  if (!isValidNonNegativeMoney(normalized)) {
    throw new TypeError('允许亏本金额格式错误');
  }
  return normalized;
}

/**
 * 商品级库存配置有一组联动字段：
 * 关闭补单时间时分钟数必须清零，关闭亏本销售时金额必须回落到后端默认值。
 * 这里统一归一化，避免组件里散落重复判断。
 */
export function buildProductGoodsInventoryConfigPayload(input: {
  allow_loss_sale_enabled: number | string;
  combo_goods_enabled: number | string;
  max_loss_amount: string;
  order_strategy: string;
  reorder_timeout_enabled: number | string;
  reorder_timeout_minutes: number | string;
  smart_reorder_enabled: number | string;
  sync_cost_price_enabled: number | string;
  sync_goods_name_enabled: number | string;
}) {
  const reorderTimeoutEnabled = normalizeBooleanValue(
    input.reorder_timeout_enabled,
  );
  const allowLossSaleEnabled = normalizeBooleanValue(
    input.allow_loss_sale_enabled,
  );

  return {
    allow_loss_sale_enabled: allowLossSaleEnabled,
    combo_goods_enabled: normalizeBooleanValue(input.combo_goods_enabled),
    max_loss_amount:
      allowLossSaleEnabled === 1
        ? normalizeRequiredNonNegativeMoneyValue(input.max_loss_amount)
        : '0.0000',
    order_strategy: String(input.order_strategy ?? '').trim(),
    reorder_timeout_enabled: reorderTimeoutEnabled,
    reorder_timeout_minutes:
      reorderTimeoutEnabled === 1
        ? normalizeRequiredNonNegativeIntegerValue(
            input.reorder_timeout_minutes,
          )
        : 0,
    smart_reorder_enabled: normalizeBooleanValue(input.smart_reorder_enabled),
    sync_cost_price_enabled: normalizeBooleanValue(
      input.sync_cost_price_enabled,
    ),
    sync_goods_name_enabled: normalizeBooleanValue(
      input.sync_goods_name_enabled,
    ),
  };
}
