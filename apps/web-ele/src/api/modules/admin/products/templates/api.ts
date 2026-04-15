import type { PagedResult } from '../../common';
import type {
  ProductTemplateListItem,
  ProductTemplateListQuery,
  ProductTemplatePayload,
  ProductTemplateValidateTypeItem,
} from './types';

import { requestClient } from '#/api/request';

/**
 * 商品管理-充值模板：获取模板列表（分页/筛选）
 * GET /admin/product-templates
 */
export async function getProductTemplateListApi(
  params: ProductTemplateListQuery,
) {
  return requestClient.get<PagedResult<ProductTemplateListItem>>(
    '/admin/product-templates',
    {
      params,
    },
  );
}

/**
 * 商品管理-充值模板：获取后端校验类型枚举
 * GET /admin/product-templates/validate-types
 */
export async function getProductTemplateValidateTypesApi() {
  return requestClient.get<{ list: ProductTemplateValidateTypeItem[] }>(
    '/admin/product-templates/validate-types',
  );
}

/**
 * 商品管理-充值模板：新增模板
 * POST /admin/product-templates
 */
export async function addProductTemplateApi(data: ProductTemplatePayload) {
  return requestClient.post('/admin/product-templates', data);
}

/**
 * 商品管理-充值模板：编辑模板
 * PUT /admin/product-templates/:id
 */
export async function updateProductTemplateApi(
  id: number,
  data: ProductTemplatePayload,
) {
  return requestClient.put(`/admin/product-templates/${id}`, data);
}

/**
 * 商品管理-充值模板：删除模板
 * DELETE /admin/product-templates/:id
 */
export async function deleteProductTemplateApi(id: number) {
  return requestClient.delete(`/admin/product-templates/${id}`);
}

/**
 * 商品管理-充值模板：批量删除模板
 * DELETE /admin/product-templates
 */
export async function batchDeleteProductTemplateApi(ids: number[]) {
  return requestClient.delete('/admin/product-templates', {
    data: { ids },
  });
}
