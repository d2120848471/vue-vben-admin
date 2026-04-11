import type { AuthApi } from './auth';

import { requestClient } from '#/api/request';

export namespace UserApi {
  export interface CurrentUserResult {
    permissions: string[];
    user: AuthApi.BackendUser;
  }
}

/** 获取当前用户信息 */
export async function getUserInfoApi() {
  return requestClient.post<UserApi.CurrentUserResult>('/api/admin/me');
}
