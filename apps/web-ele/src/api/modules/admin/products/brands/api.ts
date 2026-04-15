import type { PagedResult, SortAction } from '../../common';
import type {
  BrandCreatePayload,
  BrandListItem,
  BrandListQuery,
  BrandUpdatePayload,
  BrandUploadResult,
} from './types';

import { requestClient } from '#/api/request';

import { patchAdminApi } from '../../common';

/**
 * 商品管理-品牌管理：获取品牌列表（分页）
 * GET /admin/brands
 */
export async function getBrandListApi(params: BrandListQuery) {
  return requestClient.get<PagedResult<BrandListItem>>('/admin/brands', {
    params,
  });
}

/**
 * 商品管理-品牌管理：获取品牌子级列表
 * GET /admin/brands/:id/children
 */
export async function getBrandChildrenApi(id: number) {
  return requestClient.get<{ list: BrandListItem[] }>(
    `/admin/brands/${id}/children`,
  );
}

/**
 * 商品管理-品牌管理：新增品牌/子品牌
 * POST /admin/brands
 */
export async function addBrandApi(data: BrandCreatePayload) {
  return requestClient.post('/admin/brands', data);
}

/**
 * 商品管理-品牌管理：编辑品牌
 * PUT /admin/brands/:id
 */
export async function updateBrandApi(id: number, data: BrandUpdatePayload) {
  return requestClient.put(`/admin/brands/${id}`, data);
}

/**
 * 商品管理-品牌管理：删除品牌
 * DELETE /admin/brands/:id
 */
export async function deleteBrandApi(id: number) {
  return requestClient.delete(`/admin/brands/${id}`);
}

/**
 * 商品管理-品牌管理：品牌排序（置顶/上移/下移/置底）
 * PATCH /admin/brands/:id/sort
 */
export async function sortBrandApi(id: number, action: SortAction) {
  return patchAdminApi(`/admin/brands/${id}/sort`, { action });
}

/**
 * 商品管理-品牌管理：设置品牌可见性
 * PATCH /admin/brands/:id/visibility
 */
export async function toggleBrandVisibilityApi(id: number, isVisible: number) {
  return patchAdminApi(`/admin/brands/${id}/visibility`, {
    is_visible: isVisible,
  });
}

/**
 * 商品管理-品牌管理：上传品牌图片（icon/credential_image）
 * POST /admin/brands/upload (multipart/form-data)
 */
export async function uploadBrandImageApi(data: FormData) {
  return requestClient.post<BrandUploadResult>('/admin/brands/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
