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

import { resetCustomerPayPasswordApi } from '#/api/modules/admin/customers';

import { buildPayPasswordPayload } from '../mappers';
import { buildCustomerPayPasswordRules } from '../validators';

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
  confirm_pay_password: '',
  pay_password: '',
});
const formRules = buildCustomerPayPasswordRules(form);
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

function resetForm() {
  form.pay_password = '';
  form.confirm_pay_password = '';
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
    await resetCustomerPayPasswordApi(
      props.customer.id,
      buildPayPasswordPayload(form),
    );
    ElMessage.success('客户支付密码已重置');
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
  <ElDialog v-model="dialogVisible" title="重置支付密码" width="520px">
    <ElForm ref="formRef" :model="form" :rules="formRules" label-width="120px">
      <ElFormItem label="新支付密码" prop="pay_password">
        <ElInput
          v-model="form.pay_password"
          data-test="customer-reset-pay-password"
          type="password"
        />
      </ElFormItem>
      <ElFormItem label="确认支付密码" prop="confirm_pay_password">
        <ElInput
          v-model="form.confirm_pay_password"
          data-test="customer-reset-confirm-pay-password"
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
