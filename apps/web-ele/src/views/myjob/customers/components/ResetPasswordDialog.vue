<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type { CustomerListItem } from '#/api/modules/admin/customers';

import { computed, reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
} from 'element-plus';

import { resetCustomerPasswordApi } from '#/api/modules/admin/customers';

import { buildPasswordPayload } from '../mappers';
import { buildCustomerPasswordRules } from '../validators';

const props = defineProps<{
  customer: CustomerListItem | null;
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const form = reactive({
  confirm_password: '',
  password: '',
});
const formRules = buildCustomerPasswordRules(form);
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

function resetForm() {
  form.password = '';
  form.confirm_password = '';
}

async function submitDialog() {
  if (loading.value || !formRef.value || !props.customer) {
    return;
  }
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }
  try {
    loading.value = true;
    await resetCustomerPasswordApi(
      props.customer.id,
      buildPasswordPayload(form),
    );
    ElMessage.success('客户登录密码已重置，旧登录态已失效');
    emit('saved');
    emit('update:visible', false);
  } finally {
    loading.value = false;
  }
}

watch(
  () => [props.visible, props.customer?.id] as const,
  ([visible]) => {
    if (visible) {
      resetForm();
    }
  },
  { immediate: true },
);
</script>

<template>
  <ElDialog v-model="dialogVisible" title="重置登录密码" width="520px">
    <ElForm ref="formRef" :model="form" :rules="formRules" label-width="120px">
      <ElFormItem label="新登录密码" prop="password">
        <ElInput
          v-model="form.password"
          data-test="customer-reset-password"
          type="password"
        />
      </ElFormItem>
      <ElFormItem label="确认登录密码" prop="confirm_password">
        <ElInput
          v-model="form.confirm_password"
          data-test="customer-reset-confirm-password"
          type="password"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton :loading="loading" type="primary" @click="submitDialog">
        保存
      </ElButton>
    </template>
  </ElDialog>
</template>
