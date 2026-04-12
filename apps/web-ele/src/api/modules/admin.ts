import type { MenuTreeItem } from '../core/menu';

import { requestClient } from '#/api/request';

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
}

export interface PagedResult<T> {
  list: T[];
  pagination: Pagination;
}

export interface UserListItem {
  balance_notify: number;
  group_id: number;
  group_name: string;
  id: number;
  is_business: number;
  phone: string;
  real_name: string;
  status: number;
  username: string;
}

export interface UserListQuery {
  page?: number;
  page_size?: number;
}

export interface UserFormPayload {
  confirm_password?: string;
  confirm_username?: string;
  group_id: number;
  password?: string;
  phone: string;
  real_name: string;
  username?: string;
}

export interface SubjectItem {
  created_at: string;
  has_tax: number;
  id: number;
  name: string;
  updated_at: string;
}

export interface SubjectPayload {
  has_tax: number;
  name: string;
}

export interface GroupListItem {
  description: string;
  id: number;
  name: string;
  status: number;
  user_count: number;
}

export interface GroupPayload {
  description: string;
  name: string;
}

export interface GroupAuthResult {
  menu_ids: number[];
}

interface MenuTreeResult {
  list: MenuTreeItem[];
}

export interface OperationLogItem {
  admin_id: number;
  admin_name: string;
  created_at: string;
  description: string;
  id: number;
  ip: string;
  ip_region: string;
}

export interface LoginLogItem {
  admin_id: number;
  admin_name: string;
  created_at: string;
  id: number;
  ip: string;
  ip_region: string;
}

export interface LogQuery {
  admin_id?: string;
  end_time?: string;
  keyword?: string;
  page?: number;
  page_size?: number;
  start_time?: string;
}

export interface SMSConfigResult {
  access_key_configured: boolean;
  access_key_masked: string;
  access_key_secret_configured: boolean;
  access_key_secret_masked: string;
  expire_minutes: number;
  interval_minutes: number;
  sign_name: string;
  template_code: string;
  updated_at?: string;
}

export interface SMSConfigPayload {
  access_key: string;
  access_key_secret: string;
  expire_minutes: number;
  interval_minutes: number;
  keep_access_key: boolean;
  keep_access_key_secret: boolean;
  sign_name: string;
  template_code: string;
}

// 后端这批状态/授权接口统一切到了 PATCH，这里集中走底层 request。
function patchApi<T = unknown>(url: string, data?: unknown) {
  return requestClient.request<T>(url, {
    ...(data === undefined ? {} : { data }),
    method: 'PATCH',
  });
}

export async function getAdminUsersApi(params: UserListQuery) {
  return requestClient.get<PagedResult<UserListItem>>('/admin/users', {
    params,
  });
}

export async function addAdminUserApi(data: UserFormPayload) {
  return requestClient.post('/admin/users', data);
}

export async function updateAdminUserApi(id: number, data: UserFormPayload) {
  return requestClient.put(`/admin/users/${id}`, data);
}

export async function deleteAdminUserApi(id: number) {
  return requestClient.delete(`/admin/users/${id}`);
}

export async function updateAdminUserStatusApi(id: number, status: number) {
  return patchApi(`/admin/users/${id}/status`, { status });
}

export async function updateAdminUserNotifyApi(
  id: number,
  balanceNotify: number,
) {
  return patchApi(`/admin/users/${id}/notify`, {
    balance_notify: balanceNotify,
  });
}

export async function setAdminUserBusinessApi(ids: number[]) {
  return requestClient.post('/admin/users/business', { ids });
}

export async function cancelAdminUserBusinessApi(ids: number[]) {
  return requestClient.delete('/admin/users/business', {
    data: { ids },
  });
}

export async function getAdminUserTrashApi(params: UserListQuery) {
  return requestClient.get<PagedResult<UserListItem>>('/admin/users/trash', {
    params,
  });
}

export async function restoreAdminUserApi(id: number) {
  return patchApi(`/admin/users/${id}/restore`);
}

export async function getSubjectsApi() {
  return requestClient.get<{ list: SubjectItem[] }>('/admin/subjects');
}

export async function addSubjectApi(data: SubjectPayload) {
  return requestClient.post('/admin/subjects', data);
}

export async function updateSubjectApi(id: number, data: SubjectPayload) {
  return requestClient.put(`/admin/subjects/${id}`, data);
}

export async function getGroupsApi(params: UserListQuery) {
  return requestClient.get<PagedResult<GroupListItem>>('/admin/groups', {
    params,
  });
}

export async function addGroupApi(data: GroupPayload) {
  return requestClient.post('/admin/groups', data);
}

export async function updateGroupApi(id: number, data: GroupPayload) {
  return requestClient.put(`/admin/groups/${id}`, data);
}

export async function deleteGroupApi(id: number) {
  return requestClient.delete(`/admin/groups/${id}`);
}

export async function updateGroupStatusApi(id: number, status: number) {
  return patchApi(`/admin/groups/${id}/status`, { status });
}

export async function getGroupAuthApi(id: number) {
  return requestClient.get<GroupAuthResult>(`/admin/groups/${id}/permissions`);
}

export async function saveGroupAuthApi(id: number, menuIds: number[]) {
  return patchApi(`/admin/groups/${id}/permissions`, {
    menu_ids: menuIds,
  });
}

export async function getPermissionTreeApi() {
  return requestClient
    .get<MenuTreeResult>('/admin/menus/tree')
    .then((result) => result.list ?? []);
}

export async function getOperationLogsApi(params: LogQuery) {
  return requestClient.get<PagedResult<OperationLogItem>>(
    '/admin/logs/operations',
    {
      params,
    },
  );
}

export async function getLoginLogsApi(params: LogQuery) {
  return requestClient.get<PagedResult<LoginLogItem>>('/admin/logs/logins', {
    params,
  });
}

export async function getSMSConfigApi() {
  return requestClient.get<SMSConfigResult>('/admin/settings/sms');
}

export async function saveSMSConfigApi(data: SMSConfigPayload) {
  return requestClient.put('/admin/settings/sms', data);
}
