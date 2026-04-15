import type { PagedResult } from '../common';
import type { LoginLogItem, LogQuery, OperationLogItem } from './types';

import { requestClient } from '#/api/request';

/**
 * 审计日志-操作日志：获取操作日志（分页/筛选）
 * GET /admin/logs/operations
 */
export async function getOperationLogsApi(params: LogQuery) {
  return requestClient.get<PagedResult<OperationLogItem>>(
    '/admin/logs/operations',
    {
      params,
    },
  );
}

/**
 * 审计日志-登录日志：获取登录日志（分页/筛选）
 * GET /admin/logs/logins
 */
export async function getLoginLogsApi(params: LogQuery) {
  return requestClient.get<PagedResult<LoginLogItem>>('/admin/logs/logins', {
    params,
  });
}
