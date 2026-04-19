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
  platform_account_id: number | string;
  sort: number | string;
  source_cost_price: string;
  supplier_goods_name: string;
  supplier_goods_no: string;
  validate_template_id?: null | number | string;
}) {
  return {
    dock_status: normalizeNumberValue(input.dock_status),
    platform_account_id: normalizeNumberValue(input.platform_account_id),
    sort: normalizeNumberValue(input.sort),
    source_cost_price: String(input.source_cost_price ?? '').trim(),
    supplier_goods_name: String(input.supplier_goods_name ?? '').trim(),
    supplier_goods_no: String(input.supplier_goods_no ?? '').trim(),
    validate_template_id: normalizeNullableId(input.validate_template_id),
  };
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
