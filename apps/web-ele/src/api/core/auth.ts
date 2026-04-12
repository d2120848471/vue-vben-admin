import { requestClient } from '#/api/request';

export namespace AuthApi {
  export interface BackendUser {
    avatar?: string;
    group_id: number;
    group_name: string;
    id: number;
    is_business: number;
    real_name: string;
    username: string;
  }

  export interface LoginParams {
    password: string;
    username: string;
  }

  export interface LoginSMSChallenge {
    login_token: string;
    need_sms_verify: true;
    phone: string;
    reason: string;
  }

  export interface LoginSuccessResult {
    need_sms_verify: false;
    permissions: string[];
    token: string;
    user: BackendUser;
  }

  export type LoginResult = LoginSMSChallenge | LoginSuccessResult;

  export interface LoginSMSSendParams {
    login_token: string;
  }

  export interface LoginSMSVerifyParams {
    login_token: string;
    sms_code: string;
  }

  export interface LoginSMSVerifyResult {
    permissions: string[];
    token: string;
    user: BackendUser;
  }
}

/** 登录 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/admin/auth/login', data);
}

/** 发送登录验证码 */
export async function sendLoginSmsApi(data: AuthApi.LoginSMSSendParams) {
  return requestClient.post('/admin/auth/sms/send', data);
}

/** 校验短信验证码 */
export async function verifyLoginSmsApi(data: AuthApi.LoginSMSVerifyParams) {
  return requestClient.post<AuthApi.LoginSMSVerifyResult>(
    '/admin/auth/sms/verify',
    data,
  );
}

/** 退出登录 */
export async function logoutApi() {
  return requestClient.delete('/admin/auth/session');
}
