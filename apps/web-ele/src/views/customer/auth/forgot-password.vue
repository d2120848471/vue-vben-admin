<script lang="ts" setup>
import { computed, onBeforeUnmount, ref } from 'vue';

import { AuthenticationForgetPassword } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { sendCustomerSMSApi } from '#/api/modules/customer/auth';
import { useCustomerAuthStore } from '#/store';

import { CUSTOMER_AUTH_SMS_COUNTDOWN_SECONDS } from './constants';
import { buildCustomerForgotPasswordPayload } from './mappers';
import { buildCustomerForgotPasswordSchema } from './schemas';
import { validatePhone } from './validators';

defineOptions({ name: 'CustomerForgotPassword' });

interface AuthenticationFormExpose {
  getFormApi: () => {
    getValues: () => Promise<Record<string, any>>;
  };
}

const customerAuthStore = useCustomerAuthStore();
const forgotPasswordRef = ref<AuthenticationFormExpose>();
const sending = ref(false);
const countdown = ref(0);
let timer: number | undefined;

const canSendSMS = computed(() => countdown.value <= 0 && !sending.value);
const countdownText = computed(() =>
  countdown.value > 0 ? `${countdown.value}s` : '',
);
const formSchema = computed(() =>
  buildCustomerForgotPasswordSchema({
    canSendSMS: canSendSMS.value,
    countdownText: countdownText.value,
    sending: sending.value,
    sendSMS: handleSendSMS,
  }),
);

function startCountdown() {
  countdown.value = CUSTOMER_AUTH_SMS_COUNTDOWN_SECONDS;
  window.clearInterval(timer);
  timer = window.setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      window.clearInterval(timer);
    }
  }, 1000);
}

async function handleSendSMS() {
  if (!canSendSMS.value) {
    return;
  }
  const values = await forgotPasswordRef.value?.getFormApi().getValues();
  const phone = String(values?.phone ?? '').trim();
  if (!phone) {
    ElMessage.warning('请先输入手机号');
    return;
  }
  const phoneMessage = validatePhone(phone);
  if (phoneMessage) {
    ElMessage.warning(phoneMessage);
    return;
  }
  try {
    sending.value = true;
    await sendCustomerSMSApi({ phone, scene: 'forgot_password' });
    startCountdown();
    ElMessage.success('验证码已发送，请注意查收短信');
  } finally {
    sending.value = false;
  }
}

async function handleSubmit(values: Record<string, any>) {
  await customerAuthStore.forgotPassword(
    buildCustomerForgotPasswordPayload(values),
  );
  ElMessage.success('登录密码已重置，请重新登录');
}

onBeforeUnmount(() => {
  window.clearInterval(timer);
});
</script>

<template>
  <AuthenticationForgetPassword
    ref="forgotPasswordRef"
    :form-schema="formSchema"
    :loading="customerAuthStore.loading"
    login-path="/customer/auth/login"
    sub-title="通过短信验证码重置客户登录密码"
    submit-button-text="重置登录密码"
    title="忘记密码"
    @submit="handleSubmit"
  />
</template>
