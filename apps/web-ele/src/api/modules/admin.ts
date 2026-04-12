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

export async function getAdminUsersApi(params: UserListQuery) {
  return requestClient.get<PagedResult<UserListItem>>('/admin/user/list', {
    params,
  });
}

export async function addAdminUserApi(data: UserFormPayload) {
  return requestClient.post('/admin/user/add', data);
}

export async function updateAdminUserApi(id: number, data: UserFormPayload) {
  return requestClient.put(`/admin/user/${id}`, data);
}

export async function deleteAdminUserApi(id: number) {
  return requestClient.delete(`/admin/user/${id}`);
}

export async function updateAdminUserStatusApi(id: number, status: number) {
  return requestClient.put(`/admin/user/${id}/status`, { status });
}

export async function updateAdminUserNotifyApi(
  id: number,
  balanceNotify: number,
) {
  return requestClient.put(`/admin/user/${id}/notify`, {
    balance_notify: balanceNotify,
  });
}

export async function setAdminUserBusinessApi(ids: number[]) {
  return requestClient.post('/admin/user/setBusiness', { ids });
}

export async function cancelAdminUserBusinessApi(ids: number[]) {
  return requestClient.post('/admin/user/cancelBusiness', { ids });
}

export async function getAdminUserTrashApi(params: UserListQuery) {
  return requestClient.get<PagedResult<UserListItem>>('/admin/user/trash', {
    params,
  });
}

export async function restoreAdminUserApi(id: number) {
  return requestClient.put(`/admin/user/${id}/restore`);
}

export async function getSubjectsApi() {
  return requestClient.get<{ list: SubjectItem[] }>('/admin/subject/list');
}

export async function addSubjectApi(data: SubjectPayload) {
  return requestClient.post('/admin/subject/add', data);
}

export async function updateSubjectApi(id: number, data: SubjectPayload) {
  return requestClient.put(`/admin/subject/${id}`, data);
}

export async function getGroupsApi(params: UserListQuery) {
  return requestClient.get<PagedResult<GroupListItem>>('/admin/group/list', {
    params,
  });
}

export async function addGroupApi(data: GroupPayload) {
  return requestClient.post('/admin/group/add', data);
}

export async function updateGroupApi(id: number, data: GroupPayload) {
  return requestClient.put(`/admin/group/${id}`, data);
}

export async function deleteGroupApi(id: number) {
  return requestClient.delete(`/admin/group/${id}`);
}

export async function updateGroupStatusApi(id: number, status: number) {
  return requestClient.put(`/admin/group/${id}/status`, { status });
}

export async function getGroupAuthApi(id: number) {
  return requestClient.get<GroupAuthResult>(`/admin/group/${id}/auth`);
}

export async function saveGroupAuthApi(id: number, menuIds: number[]) {
  return requestClient.put(`/admin/group/${id}/auth`, {
    menu_ids: menuIds,
  });
}

export async function getPermissionTreeApi() {
  return requestClient.get<MenuTreeItem[]>('/admin/menu/tree');
}

export async function getOperationLogsApi(params: LogQuery) {
  return requestClient.get<PagedResult<OperationLogItem>>(
    '/admin/log/operation',
    {
      params,
    },
  );
}

export async function getLoginLogsApi(params: LogQuery) {
  return requestClient.get<PagedResult<LoginLogItem>>('/admin/log/login', {
    params,
  });
}

export async function getSMSConfigApi() {
  return requestClient.get<SMSConfigResult>('/admin/config/sms');
}

export async function saveSMSConfigApi(data: SMSConfigPayload) {
  return requestClient.put('/admin/config/sms', data);
}
