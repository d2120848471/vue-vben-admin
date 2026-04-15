import type { PagedResult } from '../../common';
import type {
  PurchaseLimitStrategyEnumsResult,
  PurchaseLimitStrategyListItem,
  PurchaseLimitStrategyListQuery,
  PurchaseLimitStrategyPayload,
} from './types';

import { requestClient } from '#/api/request';

import { patchAdminApi } from '../../common';

/**
 * 商品管理-购买限制策略：获取策略列表（分页/筛选）
 * GET /admin/purchase-limit-strategies
 */
export async function getPurchaseLimitStrategyListApi(
  params: PurchaseLimitStrategyListQuery,
) {
  return requestClient.get<PagedResult<PurchaseLimitStrategyListItem>>(
    '/admin/purchase-limit-strategies',
    {
      params,
    },
  );
}

/**
 * 商品管理-购买限制策略：获取枚举（限制类型/周期类型）
 * GET /admin/purchase-limit-strategies/enums
 */
export async function getPurchaseLimitStrategyEnumsApi() {
  return requestClient.get<PurchaseLimitStrategyEnumsResult>(
    '/admin/purchase-limit-strategies/enums',
  );
}

/**
 * 商品管理-购买限制策略：新增策略
 * POST /admin/purchase-limit-strategies
 */
export async function addPurchaseLimitStrategyApi(
  data: PurchaseLimitStrategyPayload,
) {
  return requestClient.post('/admin/purchase-limit-strategies', data);
}

/**
 * 商品管理-购买限制策略：编辑策略
 * PUT /admin/purchase-limit-strategies/:id
 */
export async function updatePurchaseLimitStrategyApi(
  id: number,
  data: PurchaseLimitStrategyPayload,
) {
  return requestClient.put(`/admin/purchase-limit-strategies/${id}`, data);
}

/**
 * 商品管理-购买限制策略：启用/禁用策略
 * PATCH /admin/purchase-limit-strategies/:id/status
 */
export async function updatePurchaseLimitStrategyStatusApi(
  id: number,
  status: number,
) {
  return patchAdminApi(`/admin/purchase-limit-strategies/${id}/status`, {
    status,
  });
}

/**
 * 商品管理-购买限制策略：删除策略
 * DELETE /admin/purchase-limit-strategies/:id
 */
export async function deletePurchaseLimitStrategyApi(id: number) {
  return requestClient.delete(`/admin/purchase-limit-strategies/${id}`);
}
