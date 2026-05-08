import type { PagedResult } from '../common';
import type {
  CustomerCreatePayload,
  CustomerCreateResult,
  CustomerDetail,
  CustomerListItem,
  CustomerListQuery,
  CustomerPasswordResetPayload,
  CustomerPayPasswordResetPayload,
  CustomerTrashQuery,
  CustomerUpdatePayload,
} from './types';

import { requestClient } from '#/api/request';

import { patchAdminApi } from '../common';

/**
 * 客户管理-客户列表：获取未删除客户分页列表。
 */
export async function getCustomerListApi(params: CustomerListQuery) {
  return requestClient.get<PagedResult<CustomerListItem>>('/admin/customers', {
    params,
  });
}

/**
 * 客户管理-回收站：获取已删除客户分页列表。
 */
export async function getCustomerTrashApi(params: CustomerTrashQuery) {
  return requestClient.get<PagedResult<CustomerListItem>>(
    '/admin/customers/trash',
    { params },
  );
}

/**
 * 客户管理-客户详情：读取客户基础资料和最后登录信息。
 */
export async function getCustomerDetailApi(id: number) {
  return requestClient.get<CustomerDetail>(`/admin/customers/${id}`);
}

/**
 * 客户管理-新增客户：后台创建账号，不需要短信验证码。
 */
export async function addCustomerApi(data: CustomerCreatePayload) {
  return requestClient.post<CustomerCreateResult>('/admin/customers', data);
}

/**
 * 客户管理-编辑客户：只允许更新基础资料和状态。
 */
export async function updateCustomerApi(
  id: number,
  data: CustomerUpdatePayload,
) {
  return requestClient.put(`/admin/customers/${id}`, data);
}

/**
 * 客户管理-启停客户：禁用时后端会让客户旧 token 失效。
 */
export async function updateCustomerStatusApi(id: number, status: number) {
  return patchAdminApi(`/admin/customers/${id}/status`, { status });
}

/**
 * 客户管理-删除客户：软删除后进入回收站。
 */
export async function deleteCustomerApi(id: number) {
  return requestClient.delete(`/admin/customers/${id}`);
}

/**
 * 客户管理-恢复客户：后端恢复后保持禁用状态。
 */
export async function restoreCustomerApi(id: number) {
  return patchAdminApi(`/admin/customers/${id}/restore`);
}

/**
 * 客户管理-重置登录密码：成功后客户旧 token 会失效。
 */
export async function resetCustomerPasswordApi(
  id: number,
  data: CustomerPasswordResetPayload,
) {
  return patchAdminApi(`/admin/customers/${id}/password`, data);
}

/**
 * 客户管理-重置支付密码：不影响客户当前登录态。
 */
export async function resetCustomerPayPasswordApi(
  id: number,
  data: CustomerPayPasswordResetPayload,
) {
  return patchAdminApi(`/admin/customers/${id}/pay-password`, data);
}
