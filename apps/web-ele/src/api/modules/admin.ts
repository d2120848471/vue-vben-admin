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

export interface SystemSettingsItem {
  configured: boolean;
  key: string;
  label: string;
  required: boolean;
  unit?: string;
  updated_at?: string;
  value: string;
  value_type: string;
}

export interface SystemSettingsGroup {
  group: string;
  items: SystemSettingsItem[];
  label?: string;
}

export interface SystemSettingsResult {
  group?: string;
  groups?: SystemSettingsGroup[];
  items?: SystemSettingsItem[];
  label?: string;
}

export interface SystemSettingsSaveItem {
  key: string;
  value: string;
}

export interface SystemSettingsSaveGroup {
  group: string;
  items: SystemSettingsSaveItem[];
}

export interface SystemSettingsSavePayload {
  groups: SystemSettingsSaveGroup[];
}

export type SortAction = 'bottom' | 'down' | 'top' | 'up';

export interface BrandListItem {
  children: BrandListItem[];
  created_at: string;
  credential_image: string;
  description: string;
  goods_count: number;
  has_children: boolean;
  icon: string;
  id: number;
  is_visible: number;
  name: string;
  parent_id: number;
  sort: number;
  updated_at: string;
}

export interface BrandListQuery extends UserListQuery {
  name?: string;
}

export interface BrandCreatePayload {
  credential_image: string;
  description: string;
  icon: string;
  is_visible: number;
  name: string;
  parent_id: number;
}

export interface BrandUpdatePayload {
  credential_image: string;
  description: string;
  icon: string;
  is_visible: number;
  name: string;
}

export interface BrandUploadResult {
  file_name: string;
  size: number;
  url: string;
}

export interface BrandSelectorItem {
  icon: string;
  id: number;
  name: string;
}

export interface IndustryListItem {
  brand_count: number;
  created_at: string;
  id: number;
  name: string;
  sort: number;
  updated_at: string;
}

export interface IndustryListQuery extends UserListQuery {
  name?: string;
}

export interface IndustryPayload {
  brand_ids: number[];
  name: string;
}

export interface IndustrySelectorQuery {
  name?: string;
}

export interface IndustryRelationBrandItem {
  brand_icon: string;
  brand_id: number;
  brand_name: string;
  id: number;
  sort: number;
}

export interface IndustryRelationListResult {
  industry_id: number;
  industry_name: string;
  list: IndustryRelationBrandItem[];
}

export interface ProductTemplateListItem {
  account_name: string;
  created_at: string;
  id: number;
  is_shared: number;
  is_shared_label: string;
  title: string;
  type: string;
  type_label: string;
  updated_at: string;
  validate_type: number;
  validate_type_label: string;
}

export interface ProductTemplateListQuery extends UserListQuery {
  is_shared?: string;
  keyword?: string;
  type?: string;
}

export interface ProductTemplatePayload {
  account_name: string;
  is_shared: number;
  title: string;
  type: string;
  validate_type: number;
}

export interface ProductTemplateValidateTypeItem {
  id: number;
  title: string;
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

export async function getSystemSettingsApi() {
  return requestClient.get<SystemSettingsResult>('/admin/settings/system');
}

export async function saveSystemSettingsApi(data: SystemSettingsSavePayload) {
  return requestClient.put('/admin/settings/system', data);
}

export async function getBrandListApi(params: BrandListQuery) {
  return requestClient.get<PagedResult<BrandListItem>>('/admin/brands', {
    params,
  });
}

export async function getBrandChildrenApi(id: number) {
  return requestClient.get<{ list: BrandListItem[] }>(
    `/admin/brands/${id}/children`,
  );
}

export async function addBrandApi(data: BrandCreatePayload) {
  return requestClient.post('/admin/brands', data);
}

export async function updateBrandApi(id: number, data: BrandUpdatePayload) {
  return requestClient.put(`/admin/brands/${id}`, data);
}

export async function deleteBrandApi(id: number) {
  return requestClient.delete(`/admin/brands/${id}`);
}

export async function sortBrandApi(id: number, action: SortAction) {
  return patchApi(`/admin/brands/${id}/sort`, { action });
}

export async function toggleBrandVisibilityApi(id: number, isVisible: number) {
  return patchApi(`/admin/brands/${id}/visibility`, {
    is_visible: isVisible,
  });
}

export async function uploadBrandImageApi(data: FormData) {
  return requestClient.post<BrandUploadResult>('/admin/brands/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function getIndustryListApi(params: IndustryListQuery) {
  return requestClient.get<PagedResult<IndustryListItem>>('/admin/industries', {
    params,
  });
}

export async function getBrandSelectorApi(params: IndustrySelectorQuery) {
  return requestClient.get<{ list: BrandSelectorItem[] }>(
    '/admin/industries/brand-selector',
    { params },
  );
}

export async function getIndustryRelationBrandsApi(
  id: number,
  params: IndustrySelectorQuery = {},
) {
  return requestClient.get<IndustryRelationListResult>(
    `/admin/industries/${id}/brands`,
    { params },
  );
}

export async function addIndustryApi(data: IndustryPayload) {
  return requestClient.post('/admin/industries', data);
}

export async function updateIndustryApi(id: number, data: IndustryPayload) {
  return requestClient.put(`/admin/industries/${id}`, data);
}

export async function deleteIndustryApi(id: number) {
  return requestClient.delete(`/admin/industries/${id}`);
}

export async function sortIndustryApi(id: number, action: SortAction) {
  return patchApi(`/admin/industries/${id}/sort`, { action });
}

export async function addIndustryRelationBrandsApi(
  id: number,
  brandIds: number[],
) {
  return requestClient.post(`/admin/industries/${id}/brands`, {
    brand_ids: brandIds,
  });
}

export async function deleteIndustryRelationBrandsApi(
  id: number,
  brandIds: number[],
) {
  return requestClient.delete(`/admin/industries/${id}/brands`, {
    data: { brand_ids: brandIds },
  });
}

export async function sortIndustryRelationBrandApi(
  id: number,
  brandId: number,
  action: SortAction,
) {
  return patchApi(`/admin/industries/${id}/brands/${brandId}/sort`, {
    action,
  });
}

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

export async function getProductTemplateValidateTypesApi() {
  return requestClient.get<{ list: ProductTemplateValidateTypeItem[] }>(
    '/admin/product-templates/validate-types',
  );
}

export async function addProductTemplateApi(data: ProductTemplatePayload) {
  return requestClient.post('/admin/product-templates', data);
}

export async function updateProductTemplateApi(
  id: number,
  data: ProductTemplatePayload,
) {
  return requestClient.put(`/admin/product-templates/${id}`, data);
}

export async function deleteProductTemplateApi(id: number) {
  return requestClient.delete(`/admin/product-templates/${id}`);
}

export async function batchDeleteProductTemplateApi(ids: number[]) {
  return requestClient.delete('/admin/product-templates', {
    data: { ids },
  });
}
