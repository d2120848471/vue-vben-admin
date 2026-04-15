import type { SystemSettingsResult, SystemSettingsSavePayload } from './types';

import { requestClient } from '#/api/request';

/**
 * 系统设置-系统参数：读取系统参数（分组/条目）
 * GET /admin/settings/system
 */
export async function getSystemSettingsApi() {
  return requestClient.get<SystemSettingsResult>('/admin/settings/system');
}

/**
 * 系统设置-系统参数：保存系统参数（批量）
 * PUT /admin/settings/system
 */
export async function saveSystemSettingsApi(data: SystemSettingsSavePayload) {
  return requestClient.put('/admin/settings/system', data);
}
