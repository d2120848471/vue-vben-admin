import type { ListQuery, PagedResult } from '../common';

import type {
  GroupAuthResult,
  GroupListItem,
  GroupPayload,
  MenuTreeResult,
} from './types';

import { requestClient } from '#/api/request';

import { patchAdminApi } from '../common';

/**
 * 用户组与授权-用户组列表：获取用户组列表（分页）
 * GET /admin/groups
 */
export async function getGroupsApi(params: ListQuery) {
  return requestClient.get<PagedResult<GroupListItem>>('/admin/groups', {
    params,
  });
}

/**
 * 用户组与授权：新增用户组
 * POST /admin/groups
 */
export async function addGroupApi(data: GroupPayload) {
  return requestClient.post('/admin/groups', data);
}

/**
 * 用户组与授权：编辑用户组
 * PUT /admin/groups/:id
 */
export async function updateGroupApi(id: number, data: GroupPayload) {
  return requestClient.put(`/admin/groups/${id}`, data);
}

/**
 * 用户组与授权：删除用户组
 * DELETE /admin/groups/:id
 */
export async function deleteGroupApi(id: number) {
  return requestClient.delete(`/admin/groups/${id}`);
}

/**
 * 用户组与授权：启用/禁用用户组
 * PATCH /admin/groups/:id/status
 */
export async function updateGroupStatusApi(id: number, status: number) {
  return patchAdminApi(`/admin/groups/${id}/status`, { status });
}

/**
 * 用户组与授权-权限配置：获取用户组权限（菜单 ID 列表）
 * GET /admin/groups/:id/permissions
 */
export async function getGroupAuthApi(id: number) {
  return requestClient.get<GroupAuthResult>(`/admin/groups/${id}/permissions`);
}

/**
 * 用户组与授权-权限配置：保存用户组权限（菜单 ID 列表）
 * PATCH /admin/groups/:id/permissions
 */
export async function saveGroupAuthApi(id: number, menuIds: number[]) {
  return patchAdminApi(`/admin/groups/${id}/permissions`, {
    menu_ids: menuIds,
  });
}

/**
 * 用户组与授权-权限配置：获取完整菜单树（用于授权树）
 * GET /admin/menus/tree
 */
export async function getPermissionTreeApi() {
  return requestClient
    .get<MenuTreeResult>('/admin/menus/tree')
    .then((result) => result.list ?? []);
}
