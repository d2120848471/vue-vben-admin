import type { PagedResult } from '../../common';
import type {
  SupplierPlatformDetailResult,
  SupplierPlatformListItem,
  SupplierPlatformListQuery,
  SupplierPlatformPayload,
  SupplierPlatformRefreshResult,
  SupplierPlatformTypeItem,
} from './types';

import { requestClient } from '#/api/request';

/**
 * 商品管理-第三方平台：获取平台列表（分页/筛选）
 * GET /admin/supplier-platforms
 */
export async function getSupplierPlatformListApi(
  params: SupplierPlatformListQuery,
) {
  return requestClient.get<PagedResult<SupplierPlatformListItem>>(
    '/admin/supplier-platforms',
    {
      params,
    },
  );
}

/**
 * 商品管理-第三方平台：获取平台类型枚举
 * GET /admin/supplier-platform-types
 */
export async function getSupplierPlatformTypesApi() {
  return requestClient.get<{ list: SupplierPlatformTypeItem[] }>(
    '/admin/supplier-platform-types',
  );
}

/**
 * 商品管理-第三方平台：获取平台详情（编辑弹窗回显）
 * GET /admin/supplier-platforms/:id
 */
export async function getSupplierPlatformDetailApi(id: number) {
  return requestClient.get<SupplierPlatformDetailResult>(
    `/admin/supplier-platforms/${id}`,
  );
}

/**
 * 商品管理-第三方平台：新增平台
 * POST /admin/supplier-platforms
 */
export async function addSupplierPlatformApi(data: SupplierPlatformPayload) {
  return requestClient.post('/admin/supplier-platforms', data);
}

/**
 * 商品管理-第三方平台：编辑平台
 * PUT /admin/supplier-platforms/:id
 */
export async function updateSupplierPlatformApi(
  id: number,
  data: SupplierPlatformPayload,
) {
  return requestClient.put(`/admin/supplier-platforms/${id}`, data);
}

/**
 * 商品管理-第三方平台：删除平台
 * DELETE /admin/supplier-platforms/:id
 */
export async function deleteSupplierPlatformApi(id: number) {
  return requestClient.delete(`/admin/supplier-platforms/${id}`);
}

/**
 * 商品管理-第三方平台：刷新平台余额
 * POST /admin/supplier-platforms/:id/balance/refresh
 */
export async function refreshSupplierPlatformBalanceApi(id: number) {
  return requestClient.post<SupplierPlatformRefreshResult>(
    `/admin/supplier-platforms/${id}/balance/refresh`,
    {},
  );
}
