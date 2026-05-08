import type { GridPageParams } from '../shared';
import type {
  CustomerDialogMode,
  CustomerFormState,
  CustomerPasswordFormState,
  CustomerPayPasswordFormState,
} from './types';

import type {
  CustomerCreatePayload,
  CustomerListItem,
  CustomerListQuery,
  CustomerPasswordResetPayload,
  CustomerPayPasswordResetPayload,
  CustomerTrashQuery,
  CustomerUpdatePayload,
} from '#/api/modules/admin/customers';

import { resolvePageParams } from '../shared';
import { CUSTOMER_STATUS } from './constants';

function trimValue(value: unknown) {
  return String(value ?? '').trim();
}

function normalizeStatus(value: unknown) {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    return undefined;
  }
  const status = Number(normalized);
  return status === CUSTOMER_STATUS.ENABLED ||
    status === CUSTOMER_STATUS.DISABLED
    ? status
    : undefined;
}

/**
 * 后台客户列表查询只传有效筛选项，避免空字符串覆盖后端默认筛选。
 */
export function buildCustomerListQuery(
  params: GridPageParams,
  formValues: Record<string, any>,
): CustomerListQuery {
  const { page, page_size } = resolvePageParams(params);
  const keyword = trimValue(formValues.keyword);
  const status = normalizeStatus(formValues.status);
  return {
    ...(keyword ? { keyword } : {}),
    page,
    page_size,
    ...(status === undefined ? {} : { status }),
  };
}

/**
 * 回收站不支持状态筛选，只保留关键字和分页参数。
 */
export function buildCustomerTrashQuery(
  params: GridPageParams,
  formValues: Record<string, any>,
): CustomerTrashQuery {
  const { page, page_size } = resolvePageParams(params);
  const keyword = trimValue(formValues.keyword);
  return {
    ...(keyword ? { keyword } : {}),
    page,
    page_size,
  };
}

/**
 * 新增客户需要初始化登录密码和支付密码；编辑客户只允许修改基础资料。
 */
export function buildCustomerPayload(
  form: CustomerFormState,
  mode: CustomerDialogMode,
): CustomerCreatePayload | CustomerUpdatePayload {
  const basePayload = {
    company_name: trimValue(form.company_name),
    phone: trimValue(form.phone),
    status: Number(form.status),
  };
  if (mode === 'edit') {
    return basePayload;
  }
  return {
    ...basePayload,
    confirm_password: trimValue(form.confirm_password),
    confirm_pay_password: trimValue(form.confirm_pay_password),
    password: trimValue(form.password),
    pay_password: trimValue(form.pay_password),
  };
}

/**
 * 列表行映射到弹窗表单时不回填任何密码字段，避免误展示或误提交敏感数据。
 */
export function toCustomerFormValues(
  row?: CustomerListItem,
): CustomerFormState {
  return {
    company_name: row?.company_name ?? '',
    confirm_password: '',
    confirm_pay_password: '',
    password: '',
    pay_password: '',
    phone: row?.phone ?? '',
    status: row?.status ?? CUSTOMER_STATUS.ENABLED,
  };
}

/**
 * 登录密码重置 payload 只保留后端需要的两个字段。
 */
export function buildPasswordPayload(
  form: CustomerPasswordFormState,
): CustomerPasswordResetPayload {
  return {
    confirm_password: trimValue(form.confirm_password),
    password: trimValue(form.password),
  };
}

/**
 * 支付密码重置 payload 独立构造，避免和登录密码字段混用。
 */
export function buildPayPasswordPayload(
  form: CustomerPayPasswordFormState,
): CustomerPayPasswordResetPayload {
  return {
    confirm_pay_password: trimValue(form.confirm_pay_password),
    pay_password: trimValue(form.pay_password),
  };
}
