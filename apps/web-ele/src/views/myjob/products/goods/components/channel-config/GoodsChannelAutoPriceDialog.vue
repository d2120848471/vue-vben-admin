<script lang="ts" setup>
import type {
  ProductGoodsChannelBindingItem,
  ProductGoodsChannelStringOption,
} from '#/api/modules/admin/products/goods-channels';

import { computed, reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElRadio,
  ElRadioGroup,
  ElSwitch,
} from 'element-plus';

import { updateProductGoodsChannelAutoPriceApi } from '#/api/modules/admin/products/goods-channels';

import { buildProductGoodsChannelAutoPricePayload } from './mappers';
import { isValidNonNegativeMoney } from './validators';

interface ChannelAutoPriceDialogState {
  add_type: string;
  default_price: string;
  is_auto_change: number;
}

const props = defineProps<{
  autoPriceTypeOptions: ProductGoodsChannelStringOption[];
  binding: null | ProductGoodsChannelBindingItem;
  goodsId: null | number;
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();

const formRef = ref<InstanceType<typeof ElForm>>();
const submitting = ref(false);

const dialogForm = reactive<ChannelAutoPriceDialogState>({
  add_type: 'fixed',
  default_price: '',
  is_auto_change: 0,
});

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

watch(
  () => [props.visible, props.binding] as const,
  ([visible]) => {
    if (!visible || !props.binding) {
      return;
    }
    dialogForm.add_type =
      props.binding.add_type || props.autoPriceTypeOptions[0]?.value || 'fixed';
    dialogForm.default_price =
      props.binding.is_auto_change === 1 ? props.binding.default_price : '';
    dialogForm.is_auto_change = props.binding.is_auto_change;
  },
  { immediate: true },
);

const formRules = {
  add_type: [{ required: true, message: '请选择加价类型', trigger: 'change' }],
  default_price: [
    { required: true, message: '请输入利润值', trigger: 'blur' },
    {
      validator: (
        _rule: unknown,
        value: string,
        callback: (error?: Error) => void,
      ) => {
        // 自动改价和进货价共用 money 口径，避免非法利润值直接进入 PATCH 请求。
        if (!isValidNonNegativeMoney(value)) {
          callback(new Error('利润值格式错误'));
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
};

async function submitDialog() {
  if (!props.goodsId || !props.binding) {
    return;
  }
  if (dialogForm.is_auto_change === 1) {
    try {
      await formRef.value?.validate();
    } catch {
      return;
    }
  }

  submitting.value = true;
  try {
    const payload = buildProductGoodsChannelAutoPricePayload(dialogForm);
    await updateProductGoodsChannelAutoPriceApi(
      props.goodsId,
      props.binding.id,
      payload,
    );
    ElMessage.success(
      payload.is_auto_change === 1 ? '自动改价已更新' : '自动改价已关闭',
    );
    emit('saved');
    dialogVisible.value = false;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <ElDialog v-model="dialogVisible" title="利润设置" width="520px">
    <ElForm ref="formRef" :model="dialogForm">
      <ElFormItem label="自动改价">
        <ElSwitch
          v-model="dialogForm.is_auto_change"
          data-test="channel-auto-price-enabled"
          :active-value="1"
          :inactive-value="0"
        />
      </ElFormItem>
      <ElFormItem
        v-if="dialogForm.is_auto_change === 1"
        label="加价类型"
        prop="add_type"
        :rules="formRules.add_type"
      >
        <ElRadioGroup
          v-model="dialogForm.add_type"
          data-test="channel-auto-price-type"
        >
          <ElRadio
            v-for="item in autoPriceTypeOptions"
            :key="item.value"
            :label="item.value"
          >
            {{ item.label }}
          </ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem
        v-if="dialogForm.is_auto_change === 1"
        label="利润值"
        prop="default_price"
        :rules="formRules.default_price"
      >
        <ElInput
          v-model="dialogForm.default_price"
          data-test="channel-auto-price-value"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton :loading="submitting" type="primary" @click="submitDialog">
        确定
      </ElButton>
    </template>
  </ElDialog>
</template>
