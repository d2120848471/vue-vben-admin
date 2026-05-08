<script lang="ts" setup>
import { computed } from 'vue';

import { AuthenticationLogin } from '@vben/common-ui';

import { useCustomerAuthStore } from '#/store';

import { buildCustomerLoginPayload } from './mappers';
import { buildCustomerLoginSchema } from './schemas';

defineOptions({ name: 'CustomerLogin' });

const customerAuthStore = useCustomerAuthStore();
const formSchema = computed(() => buildCustomerLoginSchema());

async function handleSubmit(values: Record<string, any>) {
  await customerAuthStore.login(buildCustomerLoginPayload(values));
}
</script>

<template>
  <AuthenticationLogin
    forget-password-path="/customer/auth/forgot-password"
    :form-schema="formSchema"
    :loading="customerAuthStore.loading"
    register-path="/customer/auth/register"
    :show-code-login="false"
    :show-forget-password="true"
    :show-qrcode-login="false"
    :show-register="true"
    :show-remember-me="false"
    :show-third-party-login="false"
    sub-title="请输入手机号和登录密码登录客户中心"
    title="客户登录"
    @submit="handleSubmit"
  />
</template>
