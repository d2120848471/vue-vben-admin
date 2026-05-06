import type { GridPageParams } from '../../shared';

import type {
  ProductGoodsChannelPriceChangeListQuery,
  ProductGoodsChannelPriceChangeSource,
} from '#/api/modules/admin/products/price-changes';

import dayjs from 'dayjs';

import { extractDateRange, resolvePageParams } from '../../shared';

function trimValue(value: unknown) {
  return String(value ?? '').trim();
}

function normalizePositiveInteger(value: unknown) {
  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return undefined;
  }
  return numericValue;
}

function isValidDateRange(range: unknown) {
  return (
    Array.isArray(range) &&
    range.length === 2 &&
    dayjs(range[0]).isValid() &&
    dayjs(range[1]).isValid()
  );
}

function normalizeSource(
  value: unknown,
): ProductGoodsChannelPriceChangeSource | undefined {
  const source = trimValue(value);
  return source === 'monitor' || source === 'push' ? source : undefined;
}

/**
 * 自动改价记录接口只接受明确筛选值；这里统一过滤空值和无效平台账号 ID，
 * 避免页面组件把空字符串、NaN 或 0 直接传给后端。
 */
export function buildPriceChangeListQuery(
  params: GridPageParams,
  formValues: Record<string, any>,
): ProductGoodsChannelPriceChangeListQuery {
  const { page, page_size } = resolvePageParams(params);
  const keyword = trimValue(formValues.keyword);
  const source = normalizeSource(formValues.source);
  const supplierGoodsNo = trimValue(formValues.supplier_goods_no);
  const platformId = normalizePositiveInteger(formValues.platform_id);
  const { end_time, start_time } = isValidDateRange(formValues.date_range)
    ? extractDateRange(formValues.date_range)
    : { end_time: '', start_time: '' };

  return {
    ...(end_time ? { end_at: end_time } : {}),
    ...(keyword ? { keyword } : {}),
    page,
    page_size,
    ...(platformId ? { platform_id: platformId } : {}),
    ...(source ? { source } : {}),
    ...(start_time ? { start_at: start_time } : {}),
    ...(supplierGoodsNo ? { supplier_goods_no: supplierGoodsNo } : {}),
  };
}
