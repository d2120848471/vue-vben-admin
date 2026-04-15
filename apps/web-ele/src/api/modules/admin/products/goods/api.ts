import type { PagedResult } from '../../common';
import type {
  ProductGoodsDetailResult,
  ProductGoodsFormOptionsResult,
  ProductGoodsListItem,
  ProductGoodsListQuery,
  ProductGoodsPayload,
  ProductGoodsStatusResult,
} from './types';

import { requestClient } from '#/api/request';

import { patchAdminApi } from '../../common';

/**
 * 商品管理-商品列表：获取商品列表（分页/筛选）
 * GET /admin/products
 */
export async function getProductGoodsListApi(params: ProductGoodsListQuery) {
  return requestClient.get<PagedResult<ProductGoodsListItem>>(
    '/admin/products',
    {
      params,
    },
  );
}

/**
 * 商品管理-商品列表：获取商品详情（编辑弹窗回显）
 * GET /admin/products/:id
 */
export async function getProductGoodsDetailApi(id: number) {
  return requestClient.get<ProductGoodsDetailResult>(`/admin/products/${id}`);
}

/**
 * 商品管理-商品列表：获取表单选项（品牌/模板/策略/主体等）
 * GET /admin/products/form-options
 */
export async function getProductGoodsFormOptionsApi() {
  return requestClient.get<ProductGoodsFormOptionsResult>(
    '/admin/products/form-options',
  );
}

/**
 * 商品管理-商品列表：新增商品
 * POST /admin/products
 */
export async function addProductGoodsApi(data: ProductGoodsPayload) {
  return requestClient.post<{ goods_code: string; id: number }>(
    '/admin/products',
    data,
  );
}

/**
 * 商品管理-商品列表：编辑商品
 * PUT /admin/products/:id
 */
export async function updateProductGoodsApi(
  id: number,
  data: ProductGoodsPayload,
) {
  return requestClient.put(`/admin/products/${id}`, data);
}

/**
 * 商品管理-商品列表：启用/停用商品（批量）
 * PATCH /admin/products/status
 */
export async function updateProductGoodsStatusApi(
  ids: number[],
  status: number,
) {
  return patchAdminApi<ProductGoodsStatusResult>('/admin/products/status', {
    ids,
    status,
  });
}

/**
 * 商品管理-商品列表：删除商品
 * DELETE /admin/products/:id
 */
export async function deleteProductGoodsApi(id: number) {
  return requestClient.delete(`/admin/products/${id}`);
}
