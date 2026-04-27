import type { PagedResult } from '../../common';
import type {
  RechargeRiskRecordListItem,
  RechargeRiskRecordListQuery,
  RechargeRiskRuleListItem,
  RechargeRiskRuleListQuery,
  RechargeRiskRulePayload,
} from './types';

import { requestClient } from '#/api/request';

import { patchAdminApi } from '../../common';

/**
 * 商品管理-充值风控：获取规则列表（分页/筛选）。
 * GET /admin/recharge-risks/rules
 */
export async function getRechargeRiskRuleListApi(
  params: RechargeRiskRuleListQuery,
) {
  return requestClient.get<PagedResult<RechargeRiskRuleListItem>>(
    '/admin/recharge-risks/rules',
    { params },
  );
}

/**
 * 商品管理-充值风控：新增规则。
 * POST /admin/recharge-risks/rules
 */
export async function addRechargeRiskRuleApi(data: RechargeRiskRulePayload) {
  return requestClient.post<{ id: number }>(
    '/admin/recharge-risks/rules',
    data,
  );
}

/**
 * 商品管理-充值风控：编辑规则。
 * PUT /admin/recharge-risks/rules/:id
 */
export async function updateRechargeRiskRuleApi(
  id: number,
  data: RechargeRiskRulePayload,
) {
  return requestClient.put(`/admin/recharge-risks/rules/${id}`, data);
}

/**
 * 商品管理-充值风控：启用或停用规则。
 * PATCH /admin/recharge-risks/rules/:id/status
 */
export async function updateRechargeRiskRuleStatusApi(
  id: number,
  status: number,
) {
  return patchAdminApi(`/admin/recharge-risks/rules/${id}/status`, {
    status,
  });
}

/**
 * 商品管理-充值风控：删除规则。
 * DELETE /admin/recharge-risks/rules/:id
 */
export async function deleteRechargeRiskRuleApi(id: number) {
  return requestClient.delete(`/admin/recharge-risks/rules/${id}`);
}

/**
 * 商品管理-充值风控：获取拦截记录列表（分页/筛选）。
 * GET /admin/recharge-risks/records
 */
export async function getRechargeRiskRecordListApi(
  params: RechargeRiskRecordListQuery,
) {
  return requestClient.get<PagedResult<RechargeRiskRecordListItem>>(
    '/admin/recharge-risks/records',
    { params },
  );
}
