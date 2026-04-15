import type { AuthApi } from './auth';

import { requestClient } from '#/api/request';

export namespace UserApi {
  export interface CurrentUserResult {
    permissions: string[];
    user: AuthApi.BackendUser;
  }
}

/**
 * 获取当前用户信息与权限码
 * GET /admin/auth/me
 */
export async function getUserInfoApi() {
  return requestClient.get<UserApi.CurrentUserResult>('/admin/auth/me');
}
