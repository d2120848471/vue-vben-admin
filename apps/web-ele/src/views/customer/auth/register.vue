<script lang="ts" setup>
import { computed, onBeforeUnmount, ref } from 'vue';

import { AuthenticationRegister } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { sendCustomerSMSApi } from '#/api/modules/customer/auth';
import { useCustomerAuthStore } from '#/store';

import { CUSTOMER_AUTH_SMS_COUNTDOWN_SECONDS } from './constants';
import { buildCustomerRegisterPayload } from './mappers';
import { buildCustomerRegisterSchema } from './schemas';
import { validatePhone } from './validators';

defineOptions({ name: 'CustomerRegister' });

interface AuthenticationFormExpose {
  getFormApi: () => {
    getValues: () => Promise<Record<string, any>>;
  };
}

const customerAuthStore = useCustomerAuthStore();
const registerRef = ref<AuthenticationFormExpose>();
const sending = ref(false);
const countdown = ref(0);
let timer: number | undefined;

const canSendSMS = computed(() => countdown.value <= 0 && !sending.value);
const countdownText = computed(() =>
  countdown.value > 0 ? `${countdown.value}s` : '',
);
const formSchema = computed(() =>
  buildCustomerRegisterSchema({
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
  const values = await registerRef.value?.getFormApi().getValues();
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
    await sendCustomerSMSApi({ phone, scene: 'register' });
    startCountdown();
    ElMessage.success('验证码已发送，请注意查收短信');
  } finally {
    sending.value = false;
  }
}

async function handleSubmit(values: Record<string, any>) {
  await customerAuthStore.register(buildCustomerRegisterPayload(values));
}

onBeforeUnmount(() => {
  window.clearInterval(timer);
});
</script>

<template>
  <AuthenticationRegister
    ref="registerRef"
    :form-schema="formSchema"
    :loading="customerAuthStore.loading"
    login-path="/customer/auth/login"
    sub-title="填写资料并完成短信验证后进入客户中心"
    submit-button-text="注册并登录"
    title="客户注册"
    @submit="handleSubmit"
  />
</template>
