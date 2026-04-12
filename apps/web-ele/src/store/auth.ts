import type { Recordable, UserInfo } from '@vben/types';

import type { SMSChallengeState } from './auth-session';

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import {
  getUserInfoApi,
  loginApi,
  logoutApi,
  sendLoginSmsApi,
  verifyLoginSmsApi,
} from '#/api';
import { $t } from '#/locales';
import { resetRoutes } from '#/router';

import {
  normalizeCurrentUserResult,
  normalizeLoginResult,
} from './auth-session';

interface SMSLoginState extends SMSChallengeState {
  username: string;
}

function createEmptySMSState(): null | SMSLoginState {
  return null;
}

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);
  const smsSending = ref(false);
  const smsSubmitting = ref(false);
  const smsState = ref<null | SMSLoginState>(createEmptySMSState());

  const isSMSLoginStep = computed(() => !!smsState.value?.loginToken);

  async function redirectAfterLogin(userInfo: UserInfo) {
    const redirect = router.currentRoute.value.query.redirect as
      | string
      | undefined;
    const target = decodeURIComponent(
      redirect || userInfo.homePath || preferences.app.defaultHomePath,
    );
    await router.push(target);
  }

  async function applyCurrentSession(
    session: {
      accessCodes: string[];
      accessToken?: string;
      userInfo: UserInfo;
    },
    onSuccess?: () => Promise<void> | void,
  ) {
    if (session.accessToken) {
      accessStore.setAccessToken(session.accessToken);
    }

    // 这里统一刷新用户信息和权限码，确保路由与按钮权限同步更新。
    userStore.setUserInfo(session.userInfo);
    accessStore.setAccessCodes(session.accessCodes);
    accessStore.setIsAccessChecked(false);
    accessStore.setLoginExpired(false);
    resetRoutes();

    await (onSuccess ? onSuccess() : redirectAfterLogin(session.userInfo));

    if (session.userInfo.realName) {
      ElNotification({
        message: `${$t('authentication.loginSuccessDesc')}:${session.userInfo.realName}`,
        title: $t('authentication.loginSuccess'),
        type: 'success',
      });
    }
  }

  function backToCredentialStep() {
    smsState.value = createEmptySMSState();
  }

  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    try {
      loginLoading.value = true;
      const result = normalizeLoginResult(
        await loginApi({
          password: String(params.password ?? ''),
          username: String(params.username ?? ''),
        }),
      );

      if (result.type === 'sms') {
        smsState.value = {
          ...result.challenge,
          username: String(params.username ?? ''),
        };
        return {
          needSmsVerify: true,
          userInfo: null,
        };
      }

      await applyCurrentSession(result.session, onSuccess);
      smsState.value = createEmptySMSState();
      return {
        needSmsVerify: false,
        userInfo: result.session.userInfo,
      };
    } finally {
      loginLoading.value = false;
    }
  }

  async function sendLoginSMS() {
    if (!smsState.value?.loginToken) {
      return;
    }

    try {
      smsSending.value = true;
      await sendLoginSmsApi({
        login_token: smsState.value.loginToken,
      });
    } finally {
      smsSending.value = false;
    }
  }

  async function verifyLoginSMS(
    smsCode: string,
    onSuccess?: () => Promise<void> | void,
  ) {
    if (!smsState.value?.loginToken) {
      return null;
    }

    try {
      smsSubmitting.value = true;
      const result = await verifyLoginSmsApi({
        login_token: smsState.value.loginToken,
        sms_code: smsCode,
      });
      const session = {
        accessCodes: result.permissions ?? [],
        accessToken: result.token,
        userInfo: normalizeCurrentUserResult({
          permissions: result.permissions ?? [],
          user: result.user,
        }).userInfo,
      };
      await applyCurrentSession(session, onSuccess);
      smsState.value = createEmptySMSState();
      return session.userInfo;
    } finally {
      smsSubmitting.value = false;
    }
  }

  async function fetchUserInfo() {
    const result = normalizeCurrentUserResult(await getUserInfoApi());

    userStore.setUserInfo(result.userInfo);
    accessStore.setAccessCodes(result.accessCodes);
    return result.userInfo;
  }

  async function syncCurrentSession() {
    const result = normalizeCurrentUserResult(await getUserInfoApi());

    userStore.setUserInfo(result.userInfo);
    accessStore.setAccessCodes(result.accessCodes);
    accessStore.setIsAccessChecked(false);
    resetRoutes();
    return result;
  }

  async function logout(
    redirect: boolean = true,
    notifyServer: boolean = true,
  ) {
    if (notifyServer) {
      try {
        await logoutApi();
      } catch {
        // 退出接口失败时仍然清理本地登录态，避免页面卡死在失效状态。
      }
    }

    resetAllStores();
    resetRoutes();
    accessStore.setLoginExpired(false);
    smsState.value = createEmptySMSState();

    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  function $reset() {
    loginLoading.value = false;
    smsSending.value = false;
    smsSubmitting.value = false;
    smsState.value = createEmptySMSState();
  }

  return {
    $reset,
    authLogin,
    backToCredentialStep,
    fetchUserInfo,
    isSMSLoginStep,
    loginLoading,
    logout,
    sendLoginSMS,
    smsSending,
    smsState,
    smsSubmitting,
    syncCurrentSession,
    verifyLoginSMS,
  };
});
