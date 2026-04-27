import type { GridPageParams } from '../../shared';
import type { RechargeRiskRuleFormState } from './types';

import type {
  RechargeRiskRecordListQuery,
  RechargeRiskRuleListItem,
  RechargeRiskRuleListQuery,
  RechargeRiskRulePayload,
} from '#/api/modules/admin/products/recharge-risks';

import { extractDateRange, resolvePageParams } from '../../shared';

function trimValue(value: unknown) {
  return String(value ?? '').trim();
}

export function buildRechargeRiskRuleListQuery(
  params: GridPageParams,
  formValues: Record<string, any>,
): RechargeRiskRuleListQuery {
  const { page, page_size } = resolvePageParams(params);
  const account = trimValue(formValues.account);
  const goodsKeyword = trimValue(formValues.goods_keyword);
  const status = trimValue(formValues.status);

  return {
    ...(account ? { account } : {}),
    ...(goodsKeyword ? { goods_keyword: goodsKeyword } : {}),
    page,
    page_size,
    ...(status === '0' || status === '1' ? { status } : {}),
  };
}

export function buildRechargeRiskRecordListQuery(
  params: GridPageParams,
  formValues: Record<string, any>,
): RechargeRiskRecordListQuery {
  const { page, page_size } = resolvePageParams(params);
  const account = trimValue(formValues.account);
  const goodsKeyword = trimValue(formValues.goods_keyword);
  const { end_time, start_time } = extractDateRange(formValues.date_range);

  return {
    ...(account ? { account } : {}),
    ...(end_time ? { end_time } : {}),
    ...(goodsKeyword ? { goods_keyword: goodsKeyword } : {}),
    page,
    page_size,
    ...(start_time ? { start_time } : {}),
  };
}

/**
 * 后端只接受可编辑字段；列表展示字段不能回传，避免误把统计和审计字段当成表单数据。
 */
export function buildRechargeRiskRulePayload(
  form: RechargeRiskRuleFormState,
): RechargeRiskRulePayload {
  return {
    account: trimValue(form.account),
    goods_keyword: trimValue(form.goods_keyword),
    reason: trimValue(form.reason),
    status: Number(form.status),
  };
}

export function toRechargeRiskRuleForm(
  row?: null | RechargeRiskRuleListItem,
): RechargeRiskRuleFormState {
  if (!row) {
    return {
      account: '',
      goods_keyword: '',
      reason: '',
      status: 1,
    };
  }

  return {
    account: row.account,
    goods_keyword: row.goods_keyword,
    reason: row.reason,
    status: row.status,
  };
}
