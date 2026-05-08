<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type { CustomerDialogMode } from '../types';

import type {
  CustomerCreatePayload,
  CustomerListItem,
  CustomerUpdatePayload,
} from '#/api/modules/admin/customers';

import { computed, reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
} from 'element-plus';

import {
  addCustomerApi,
  updateCustomerApi,
} from '#/api/modules/admin/customers';

import { buildCustomerPayload, toCustomerFormValues } from '../mappers';
import { buildCustomerFormRules } from '../validators';

const props = defineProps<{
  customer: CustomerListItem | null;
  mode: CustomerDialogMode;
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const form = reactive(toCustomerFormValues());
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});
const dialogTitle = computed(() =>
  props.mode === 'create' ? '新增客户' : '编辑客户',
);
const formRules = computed(() => buildCustomerFormRules(props.mode, form));

function resetForm() {
  Object.assign(form, toCustomerFormValues(props.customer ?? undefined));
}

async function submitDialog() {
  if (loading.value || !formRef.value) {
    return;
  }
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }
  try {
    loading.value = true;
    const payload = buildCustomerPayload(form, props.mode);
    if (props.mode === 'create') {
      await addCustomerApi(payload as CustomerCreatePayload);
      ElMessage.success('客户已新增');
    } else if (props.customer) {
      await updateCustomerApi(
        props.customer.id,
        payload as CustomerUpdatePayload,
      );
      ElMessage.success('客户已更新');
    }
    emit('saved');
    emit('update:visible', false);
  } finally {
    loading.value = false;
  }
}

watch(
  () => [props.visible, props.customer?.id, props.mode] as const,
  ([visible]) => {
    if (visible) {
      resetForm();
    }
  },
  { immediate: true },
);
</script>

<template>
  <ElDialog v-model="dialogVisible" :title="dialogTitle" width="640px">
    <ElForm ref="formRef" :model="form" :rules="formRules" label-width="120px">
      <ElFormItem label="公司/店铺名称" prop="company_name">
        <ElInput v-model="form.company_name" data-test="customer-company" />
      </ElFormItem>
      <ElFormItem label="手机号" prop="phone">
        <ElInput v-model="form.phone" data-test="customer-phone" />
      </ElFormItem>
      <template v-if="mode === 'create'">
        <ElFormItem label="登录密码" prop="password">
          <ElInput
            v-model="form.password"
            data-test="customer-password"
            type="password"
          />
        </ElFormItem>
        <ElFormItem label="确认登录密码" prop="confirm_password">
          <ElInput
            v-model="form.confirm_password"
            data-test="customer-confirm-password"
            type="password"
          />
        </ElFormItem>
        <ElFormItem label="支付密码" prop="pay_password">
          <ElInput
            v-model="form.pay_password"
            data-test="customer-pay-password"
            type="password"
          />
        </ElFormItem>
        <ElFormItem label="确认支付密码" prop="confirm_pay_password">
          <ElInput
            v-model="form.confirm_pay_password"
            data-test="customer-confirm-pay-password"
            type="password"
          />
        </ElFormItem>
      </template>
      <ElFormItem label="状态" prop="status">
        <ElSelect
          v-model="form.status"
          class="w-full"
          data-test="customer-status"
        >
          <ElOption label="启用" :value="1" />
          <ElOption label="禁用" :value="0" />
        </ElSelect>
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
