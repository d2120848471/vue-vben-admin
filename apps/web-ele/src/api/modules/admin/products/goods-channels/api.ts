import type {
  ProductGoodsChannelAutoPricePayload,
  ProductGoodsChannelBindingFormOptionsResult,
  ProductGoodsChannelBindingPayload,
  ProductGoodsChannelBindingsResult,
} from './types';

import { requestClient } from '#/api/request';

import { patchAdminApi } from '../../common';

/**
 * 商品管理-渠道配置：读取指定商品的渠道绑定摘要和列表。
 */
export async function getProductGoodsChannelBindingsApi(goodsId: number) {
  return requestClient.get<ProductGoodsChannelBindingsResult>(
    `/admin/products/${goodsId}/channel-bindings`,
  );
}

/**
 * 商品管理-渠道配置：读取渠道绑定表单选项。
 */
export async function getProductGoodsChannelBindingFormOptionsApi(
  goodsId: number,
) {
  return requestClient.get<ProductGoodsChannelBindingFormOptionsResult>(
    `/admin/products/${goodsId}/channel-bindings/form-options`,
  );
}

/**
 * 商品管理-渠道配置：新增一条渠道绑定。
 */
export async function createProductGoodsChannelBindingApi(
  goodsId: number,
  data: ProductGoodsChannelBindingPayload,
) {
  return requestClient.post<{ id: number }>(
    `/admin/products/${goodsId}/channel-bindings`,
    data,
  );
}

/**
 * 商品管理-渠道配置：编辑一条渠道绑定。
 */
export async function updateProductGoodsChannelBindingApi(
  goodsId: number,
  bindingId: number,
  data: ProductGoodsChannelBindingPayload,
) {
  return patchAdminApi(
    `/admin/products/${goodsId}/channel-bindings/${bindingId}`,
    data,
  );
}

/**
 * 商品管理-渠道配置：删除一条渠道绑定。
 */
export async function deleteProductGoodsChannelBindingApi(
  goodsId: number,
  bindingId: number,
) {
  return requestClient.delete(
    `/admin/products/${goodsId}/channel-bindings/${bindingId}`,
  );
}

/**
 * 商品管理-渠道配置：编辑自动改价规则。
 */
export async function updateProductGoodsChannelAutoPriceApi(
  goodsId: number,
  bindingId: number,
  data: ProductGoodsChannelAutoPricePayload,
) {
  return patchAdminApi(
    `/admin/products/${goodsId}/channel-bindings/${bindingId}/auto-price`,
    data,
  );
}
