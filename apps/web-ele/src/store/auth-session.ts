import type { UserInfo } from '@vben/types';

export interface BackendAuthUser {
  avatar?: string;
  group_id: number;
  group_name: string;
  id: number;
  is_business: number;
  real_name: string;
  username: string;
}

interface AuthenticatedPayload {
  permissions: string[];
  token: string;
  user: BackendAuthUser;
}

interface LoginSMSChallenge {
  login_token: string;
  need_sms_verify: true;
  phone: string;
  reason: string;
}

interface LoginSuccessPayload extends AuthenticatedPayload {
  need_sms_verify: false;
}

export type LoginResultPayload = LoginSMSChallenge | LoginSuccessPayload;

export interface CurrentUserPayload {
  permissions: string[];
  user: BackendAuthUser;
}

export interface AuthenticatedSession {
  accessCodes: string[];
  accessToken: string;
  userInfo: UserInfo;
}

export interface SMSChallengeState {
  loginToken: string;
  phone: string;
  reason: string;
}

const DEFAULT_HOME_PATH = '/home';

const FORCE_LOGOUT_MESSAGES = new Set([
  '用户组已被禁用',
  '账号已被禁用，请联系管理员',
]);

const FORBIDDEN_MESSAGES = new Set(['仅超级管理员可访问', '无权限访问']);

export function mapBackendUserToUserInfo(user: BackendAuthUser): UserInfo {
  return {
    avatar: user.avatar ?? '',
    groupId: String(user.group_id ?? ''),
    groupName: user.group_name ?? '',
    homePath: DEFAULT_HOME_PATH,
    isBusiness: user.is_business === 1,
    realName: user.real_name ?? '',
    roles: [],
    userId: String(user.id ?? ''),
    username: user.username ?? '',
  };
}

function buildAuthenticatedSession(
  payload: AuthenticatedPayload,
): AuthenticatedSession {
  return {
    accessCodes: payload.permissions ?? [],
    accessToken: payload.token,
    userInfo: mapBackendUserToUserInfo(payload.user),
  };
}

export function normalizeLoginResult(
  payload: LoginResultPayload,
):
  | { challenge: SMSChallengeState; type: 'sms' }
  | { session: AuthenticatedSession; type: 'authenticated' } {
  if (payload.need_sms_verify) {
    return {
      challenge: {
        loginToken: payload.login_token,
        phone: payload.phone,
        reason: payload.reason,
      },
      type: 'sms',
    };
  }

  return {
    session: buildAuthenticatedSession(payload),
    type: 'authenticated',
  };
}

export function normalizeCurrentUserResult(
  payload: CurrentUserPayload,
): Omit<AuthenticatedSession, 'accessToken'> {
  return {
    accessCodes: payload.permissions ?? [],
    userInfo: mapBackendUserToUserInfo(payload.user),
  };
}

export function classifyAuthFailure(
  status: number,
  message: string,
  businessCode?: number | string,
): 'forbidden' | 'force-logout' | 'none' | 'unauthenticated' {
  // 后端会用 HTTP 200 + code 401 表示 token 失效，前端必须按未登录处理。
  if (Number(businessCode) === 401 || status === 401) {
    return 'unauthenticated';
  }
  if (status !== 403) {
    return 'none';
  }
  if (FORCE_LOGOUT_MESSAGES.has(message)) {
    return 'force-logout';
  }
  if (FORBIDDEN_MESSAGES.has(message)) {
    return 'forbidden';
  }
  return 'none';
}
