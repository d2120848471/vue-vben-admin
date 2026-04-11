<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed } from 'vue';

import {
  AuthenticationCodeLogin,
  AuthenticationLogin,
  z,
} from '@vben/common-ui';

import { ElAlert, ElButton, ElMessage } from 'element-plus';

import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

const loginSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入用户名',
      },
      fieldName: 'username',
      label: '用户名',
      rules: z.string().min(1, { message: '请输入用户名' }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: '请输入密码',
      },
      fieldName: 'password',
      label: '密码',
      rules: z.string().min(1, { message: '请输入密码' }),
    },
  ];
});

const smsSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        maxlength: 6,
        placeholder: '请输入 6 位短信验证码',
      },
      fieldName: 'sms_code',
      label: '短信验证码',
      rules: z.string().regex(/^\d{6}$/, { message: '请输入 6 位短信验证码' }),
    },
  ];
});

const smsReasonText = computed(() => {
  switch (authStore.smsState?.reason) {
    case 'first_login': {
      return '首次登录需要完成短信验证。';
    }
    case 'ip_changed': {
      return '检测到登录 IP 变更，请完成短信验证。';
    }
    default: {
      return '请输入短信验证码完成登录。';
    }
  }
});

async function handleSubmit(values: Record<string, string>) {
  const result = await authStore.authLogin(values);
  if (result.needSmsVerify) {
    await authStore.sendLoginSMS();
    ElMessage.success('验证码已发送，请注意查收短信。');
  }
}

async function handleResendSMS() {
  await authStore.sendLoginSMS();
  ElMessage.success('验证码已重新发送。');
}

async function handleVerifySMS(values: Record<string, string>) {
  await authStore.verifyLoginSMS(values.sms_code || '');
}
</script>

<template>
  <div v-if="!authStore.isSMSLoginStep">
    <AuthenticationLogin
      :form-schema="loginSchema"
      :loading="authStore.loginLoading"
      :show-code-login="false"
      :show-forget-password="false"
      :show-qrcode-login="false"
      :show-register="false"
      :show-third-party-login="false"
      sub-title="请输入账号密码登录 MyJob 后台"
      title="欢迎回来"
      @submit="handleSubmit"
    />
  </div>

  <div v-else class="space-y-4">
    <ElAlert
      :closable="false"
      :description="smsReasonText"
      show-icon
      title="短信安全验证"
      type="info"
    />
    <div
      class="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
    >
      <div>登录账号：{{ authStore.smsState?.username || '--' }}</div>
      <div>接收手机：{{ authStore.smsState?.phone || '--' }}</div>
    </div>
    <AuthenticationCodeLogin
      :form-schema="smsSchema"
      :loading="authStore.smsSubmitting"
      :show-back="false"
      submit-button-text="验证并登录"
      sub-title="验证码 6 位，有效期与发送间隔以后端配置为准"
      title="请输入短信验证码"
      @submit="handleVerifySMS"
    />
    <div class="flex items-center justify-between gap-3">
      <ElButton
        :loading="authStore.smsSending"
        link
        type="primary"
        @click="handleResendSMS"
      >
        重新发送验证码
      </ElButton>
      <ElButton link @click="authStore.backToCredentialStep()">
        返回账号密码登录
      </ElButton>
    </div>
  </div>
</template>
