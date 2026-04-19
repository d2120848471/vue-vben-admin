import type { GridPageParams } from '../../shared';

import type {
  SupplierPlatformDetailResult,
  SupplierPlatformListQuery,
  SupplierPlatformPayload,
} from '#/api/modules/admin/products/suppliers';

import { resolvePageParams } from '../../shared';

/**
 * 统一收口 suppliers 页的筛选参数归一化，避免列表刷新和测试断言出现两套口径。
 */
export function buildSupplierPlatformListQuery(
  params: GridPageParams,
  formValues: Record<string, any>,
): SupplierPlatformListQuery {
  const { page, page_size } = resolvePageParams(params);
  const keyword = String(formValues.keyword ?? '').trim();
  const typeID = Number.parseInt(String(formValues.type_id ?? '').trim(), 10);
  const subjectID = Number.parseInt(
    String(formValues.subject_id ?? '').trim(),
    10,
  );
  const hasTax = String(formValues.has_tax ?? '').trim();
  const status = String(formValues.status ?? '').trim();
  const connectStatus = String(formValues.connect_status ?? '').trim();

  return {
    ...(connectStatus ? { connect_status: connectStatus } : {}),
    ...(hasTax ? { has_tax: hasTax } : {}),
    ...(keyword ? { keyword } : {}),
    page,
    page_size,
    ...(status ? { status } : {}),
    ...(Number.isFinite(subjectID) ? { subject_id: subjectID } : {}),
    ...(Number.isFinite(typeID) ? { type_id: typeID } : {}),
  };
}

/**
 * 列表行缺少密钥与账号字段，切换状态前必须基于详情补齐编辑接口要求的完整载荷。
 */
export function buildSupplierPlatformStatusPayload(
  detail: SupplierPlatformDetailResult,
  status: number,
): SupplierPlatformPayload {
  return {
    backup_domain: detail.backup_domain,
    crowd_name: detail.crowd_name,
    domain: detail.domain,
    has_tax: detail.has_tax,
    name: detail.name,
    secret_key: detail.secret_key,
    sort: detail.sort,
    status,
    subject_id: detail.subject_id,
    threshold_amount: detail.threshold_amount,
    token_id: detail.token_id,
    type_id: detail.type_id,
  };
}
