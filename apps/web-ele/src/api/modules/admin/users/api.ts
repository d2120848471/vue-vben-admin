import type { PagedResult } from '../common';
import type { UserFormPayload, UserListItem, UserListQuery } from './types';

import { requestClient } from '#/api/request';

import { patchAdminApi } from '../common';

/**
 * 员工管理-员工列表：获取员工列表（分页）
 * GET /admin/users
 */
export async function getAdminUsersApi(params: UserListQuery) {
  return requestClient.get<PagedResult<UserListItem>>('/admin/users', {
    params,
  });
}

/**
 * 员工管理-员工列表：新增员工
 * POST /admin/users
 */
export async function addAdminUserApi(data: UserFormPayload) {
  return requestClient.post('/admin/users', data);
}

/**
 * 员工管理-员工列表：编辑员工
 * PUT /admin/users/:id
 */
export async function updateAdminUserApi(id: number, data: UserFormPayload) {
  return requestClient.put(`/admin/users/${id}`, data);
}

/**
 * 员工管理-员工列表：删除员工
 * DELETE /admin/users/:id
 */
export async function deleteAdminUserApi(id: number) {
  return requestClient.delete(`/admin/users/${id}`);
}

/**
 * 员工管理-员工列表：启用/禁用员工
 * PATCH /admin/users/:id/status
 */
export async function updateAdminUserStatusApi(id: number, status: number) {
  return patchAdminApi(`/admin/users/${id}/status`, { status });
}

/**
 * 员工管理-员工列表：余额提醒开关
 * PATCH /admin/users/:id/notify
 */
export async function updateAdminUserNotifyApi(
  id: number,
  balanceNotify: number,
) {
  return patchAdminApi(`/admin/users/${id}/notify`, {
    balance_notify: balanceNotify,
  });
}

/**
 * 员工管理-员工列表：批量设为商务账号
 * POST /admin/users/business
 */
export async function setAdminUserBusinessApi(ids: number[]) {
  return requestClient.post('/admin/users/business', { ids });
}

/**
 * 员工管理-员工列表：批量取消商务账号
 * DELETE /admin/users/business
 */
export async function cancelAdminUserBusinessApi(ids: number[]) {
  return requestClient.delete('/admin/users/business', {
    data: { ids },
  });
}

/**
 * 员工管理-回收站：获取回收站员工列表（分页）
 * GET /admin/users/trash
 */
export async function getAdminUserTrashApi(params: UserListQuery) {
  return requestClient.get<PagedResult<UserListItem>>('/admin/users/trash', {
    params,
  });
}

/**
 * 员工管理-回收站：恢复员工
 * PATCH /admin/users/:id/restore
 */
export async function restoreAdminUserApi(id: number) {
  return patchAdminApi(`/admin/users/${id}/restore`);
}
