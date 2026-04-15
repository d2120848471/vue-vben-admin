import type { PagedResult, SortAction } from '../../common';

import type { BrandSelectorItem } from '../brands';
import type {
  IndustryListItem,
  IndustryListQuery,
  IndustryPayload,
  IndustryRelationListResult,
  IndustrySelectorQuery,
} from './types';

import { requestClient } from '#/api/request';

import { patchAdminApi } from '../../common';

/**
 * 商品管理-行业管理：获取行业列表（分页）
 * GET /admin/industries
 */
export async function getIndustryListApi(params: IndustryListQuery) {
  return requestClient.get<PagedResult<IndustryListItem>>('/admin/industries', {
    params,
  });
}

/**
 * 商品管理-行业管理：品牌选择器（行业弹窗/关联抽屉用）
 * GET /admin/industries/brand-selector
 */
export async function getBrandSelectorApi(params: IndustrySelectorQuery) {
  return requestClient.get<{ list: BrandSelectorItem[] }>(
    '/admin/industries/brand-selector',
    { params },
  );
}

/**
 * 商品管理-行业管理：获取行业已关联的品牌列表
 * GET /admin/industries/:id/brands
 */
export async function getIndustryRelationBrandsApi(
  id: number,
  params: IndustrySelectorQuery = {},
) {
  return requestClient.get<IndustryRelationListResult>(
    `/admin/industries/${id}/brands`,
    { params },
  );
}

/**
 * 商品管理-行业管理：新增行业
 * POST /admin/industries
 */
export async function addIndustryApi(data: IndustryPayload) {
  return requestClient.post('/admin/industries', data);
}

/**
 * 商品管理-行业管理：编辑行业
 * PUT /admin/industries/:id
 */
export async function updateIndustryApi(id: number, data: IndustryPayload) {
  return requestClient.put(`/admin/industries/${id}`, data);
}

/**
 * 商品管理-行业管理：删除行业
 * DELETE /admin/industries/:id
 */
export async function deleteIndustryApi(id: number) {
  return requestClient.delete(`/admin/industries/${id}`);
}

/**
 * 商品管理-行业管理：行业排序（置顶/上移/下移/置底）
 * PATCH /admin/industries/:id/sort
 */
export async function sortIndustryApi(id: number, action: SortAction) {
  return patchAdminApi(`/admin/industries/${id}/sort`, { action });
}

/**
 * 商品管理-行业管理：新增行业关联品牌
 * POST /admin/industries/:id/brands
 */
export async function addIndustryRelationBrandsApi(
  id: number,
  brandIds: number[],
) {
  return requestClient.post(`/admin/industries/${id}/brands`, {
    brand_ids: brandIds,
  });
}

/**
 * 商品管理-行业管理：删除行业关联品牌
 * DELETE /admin/industries/:id/brands
 */
export async function deleteIndustryRelationBrandsApi(
  id: number,
  brandIds: number[],
) {
  return requestClient.delete(`/admin/industries/${id}/brands`, {
    data: { brand_ids: brandIds },
  });
}

/**
 * 商品管理-行业管理：关联品牌排序（置顶/上移/下移/置底）
 * PATCH /admin/industries/:id/brands/:brandId/sort
 */
export async function sortIndustryRelationBrandApi(
  id: number,
  brandId: number,
  action: SortAction,
) {
  return patchAdminApi(`/admin/industries/${id}/brands/${brandId}/sort`, {
    action,
  });
}
