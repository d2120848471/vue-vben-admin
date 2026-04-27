<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type { RechargeRiskRuleListItem } from '#/api/modules/admin/products/recharge-risks';

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
  addRechargeRiskRuleApi,
  updateRechargeRiskRuleApi,
} from '#/api/modules/admin/products/recharge-risks';

import {
  buildRechargeRiskRulePayload,
  toRechargeRiskRuleForm,
} from '../mappers';
import { buildRechargeRiskRuleFormRules } from '../validators';

const props = defineProps<{
  editingRule: null | RechargeRiskRuleListItem;
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();

const formRef = ref<FormInstance>();
const dialogLoading = ref(false);
const formRules = buildRechargeRiskRuleFormRules();
const dialogForm = reactive(toRechargeRiskRuleForm());

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const dialogTitle = computed(() =>
  props.editingRule ? '编辑风控规则' : '新增风控规则',
);

function resetDialogForm() {
  Object.assign(dialogForm, toRechargeRiskRuleForm(props.editingRule));
}

async function submitDialog() {
  if (dialogLoading.value || !formRef.value) {
    return;
  }
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  try {
    dialogLoading.value = true;
    const payload = buildRechargeRiskRulePayload(dialogForm);
    if (props.editingRule) {
      await updateRechargeRiskRuleApi(props.editingRule.id, payload);
      ElMessage.success('风控规则已更新');
    } else {
      await addRechargeRiskRuleApi(payload);
      ElMessage.success('风控规则已新增');
    }
    emit('saved');
    emit('update:visible', false);
  } finally {
    dialogLoading.value = false;
  }
}

watch(
  () => [props.visible, props.editingRule?.id] as const,
  ([visible]) => {
    if (!visible) {
      Object.assign(dialogForm, toRechargeRiskRuleForm());
      dialogLoading.value = false;
      return;
    }
    resetDialogForm();
  },
  { immediate: true },
);
</script>

<template>
  <ElDialog v-model="dialogVisible" :title="dialogTitle" width="640px">
    <ElForm
      ref="formRef"
      :model="dialogForm"
      :rules="formRules"
      label-width="108px"
    >
      <ElFormItem label="充值账号" prop="account">
        <ElInput
          v-model="dialogForm.account"
          data-test="risk-account"
          placeholder="请输入充值账号"
        />
      </ElFormItem>
      <ElFormItem label="商品关键词" prop="goods_keyword">
        <ElInput
          v-model="dialogForm.goods_keyword"
          data-test="risk-keyword"
          placeholder="请输入商品关键词"
        />
      </ElFormItem>
      <ElFormItem label="风控原因" prop="reason">
        <ElInput
          v-model="dialogForm.reason"
          :rows="4"
          data-test="risk-reason"
          placeholder="请输入风控原因"
          type="textarea"
        />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElSelect
          v-model="dialogForm.status"
          class="w-full"
          data-test="risk-status"
        >
          <ElOption label="启用" :value="1" />
          <ElOption label="停用" :value="0" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton :loading="dialogLoading" type="primary" @click="submitDialog">
        保存
      </ElButton>
    </template>
  </ElDialog>
</template>
