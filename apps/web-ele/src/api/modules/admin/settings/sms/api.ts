import type { SMSConfigPayload, SMSConfigResult } from './types';

import { requestClient } from '#/api/request';

/**
 * 系统设置-短信配置：读取短信配置
 * GET /admin/settings/sms
 */
export async function getSMSConfigApi() {
  return requestClient.get<SMSConfigResult>('/admin/settings/sms');
}

/**
 * 系统设置-短信配置：保存短信配置
 * PUT /admin/settings/sms
 */
export async function saveSMSConfigApi(data: SMSConfigPayload) {
  return requestClient.put('/admin/settings/sms', data);
}
