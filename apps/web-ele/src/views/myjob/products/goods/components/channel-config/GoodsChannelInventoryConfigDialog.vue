<script lang="ts" setup>
import type { ProductGoodsOrderStrategyOption } from '#/api/modules/admin/products/goods-inventory-config';

import { computed, reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElSelect,
} from 'element-plus';

import {
  getProductGoodsInventoryConfigApi,
  saveProductGoodsInventoryConfigApi,
} from '#/api/modules/admin/products/goods-inventory-config';

import { buildProductGoodsInventoryConfigPayload } from './mappers';
import {
  isValidNonNegativeInteger,
  isValidNonNegativeMoney,
} from './validators';

interface GoodsChannelInventoryConfigDialogState {
  allow_loss_sale_enabled: number;
  combo_goods_enabled: number;
  max_loss_amount: string;
  order_strategy: string;
  reorder_timeout_enabled: number;
  reorder_timeout_minutes: number;
  smart_reorder_enabled: number;
  sync_cost_price_enabled: number;
  sync_goods_name_enabled: number;
}

const props = defineProps<{
  goodsId: null | number;
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();

const formRef = ref<InstanceType<typeof ElForm>>();
const loading = ref(false);
const loadErrorMessage = ref('');
const submitting = ref(false);
const orderStrategyOptions = ref<ProductGoodsOrderStrategyOption[]>([]);

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const DEFAULT_DIALOG_FORM: GoodsChannelInventoryConfigDialogState = {
  allow_loss_sale_enabled: 0,
  combo_goods_enabled: 0,
  max_loss_amount: '0.0000',
  order_strategy: 'fixed_order',
  reorder_timeout_enabled: 0,
  reorder_timeout_minutes: 0,
  smart_reorder_enabled: 0,
  sync_cost_price_enabled: 0,
  sync_goods_name_enabled: 0,
};

const dialogForm = reactive<GoodsChannelInventoryConfigDialogState>({
  ...DEFAULT_DIALOG_FORM,
});

function validateTimeoutMinutes(
  _rule: unknown,
  value: number | string,
  callback: (error?: Error) => void,
) {
  if (!isValidNonNegativeInteger(value)) {
    callback(new Error('补单时间需为非负整数分钟'));
    return;
  }
  callback();
}

function validateMaxLossAmount(
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void,
) {
  if (!isValidNonNegativeMoney(value)) {
    callback(new Error('允许亏本金额格式错误'));
    return;
  }
  callback();
}

const formRules = {
  max_loss_amount: [
    { required: true, message: '请输入允许亏本金额', trigger: 'blur' },
    {
      validator: validateMaxLossAmount,
      trigger: 'blur',
    },
  ],
  order_strategy: [
    { required: true, message: '请选择下单方式', trigger: 'change' },
  ],
  reorder_timeout_minutes: [
    { required: true, message: '请输入补单时间', trigger: 'blur' },
    {
      validator: validateTimeoutMinutes,
      trigger: 'blur',
    },
  ],
};

function resetDialogForm() {
  applyConfig(DEFAULT_DIALOG_FORM);
}

function applyConfig(
  config: Partial<GoodsChannelInventoryConfigDialogState> | undefined,
) {
  dialogForm.allow_loss_sale_enabled = Number(
    config?.allow_loss_sale_enabled ?? 0,
  );
  dialogForm.combo_goods_enabled = Number(config?.combo_goods_enabled ?? 0);
  dialogForm.max_loss_amount = String(config?.max_loss_amount ?? '0.0000');
  dialogForm.order_strategy =
    String(config?.order_strategy ?? '').trim() || 'fixed_order';
  dialogForm.reorder_timeout_enabled = Number(
    config?.reorder_timeout_enabled ?? 0,
  );
  dialogForm.reorder_timeout_minutes = Number(
    config?.reorder_timeout_minutes ?? 0,
  );
  dialogForm.smart_reorder_enabled = Number(config?.smart_reorder_enabled ?? 0);
  dialogForm.sync_cost_price_enabled = Number(
    config?.sync_cost_price_enabled ?? 0,
  );
  dialogForm.sync_goods_name_enabled = Number(
    config?.sync_goods_name_enabled ?? 0,
  );
}

async function loadConfig() {
  if (!props.visible || !props.goodsId) {
    return;
  }
  loading.value = true;
  loadErrorMessage.value = '';
  orderStrategyOptions.value = [];
  resetDialogForm();
  try {
    const result = await getProductGoodsInventoryConfigApi(props.goodsId);
    orderStrategyOptions.value = result.order_strategy_options ?? [];
    applyConfig(result.config);
  } catch {
    loadErrorMessage.value = '库存配置加载失败，请稍后重试';
    ElMessage.error(loadErrorMessage.value);
  } finally {
    loading.value = false;
  }
}

watch(
  () => [props.visible, props.goodsId] as const,
  async ([visible, goodsId]) => {
    if (!visible || !goodsId) {
      return;
    }
    await loadConfig();
  },
  { immediate: true },
);

async function submitDialog() {
  if (!props.goodsId || loading.value || loadErrorMessage.value) {
    return;
  }
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    const payload = buildProductGoodsInventoryConfigPayload(dialogForm);
    await saveProductGoodsInventoryConfigApi(props.goodsId, payload);
    ElMessage.success('库存配置已更新');
    emit('saved');
    dialogVisible.value = false;
  } catch {
    ElMessage.error('库存配置更新失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <ElDialog v-model="dialogVisible" title="修改库存配置" width="720px">
    <div v-if="loading" class="goods-channel-inventory-config__loading">
      加载中...
    </div>
    <div
      v-else-if="loadErrorMessage"
      class="goods-channel-inventory-config__error"
      data-test="inventory-config-load-error"
    >
      <div class="goods-channel-inventory-config__error-text">
        {{ loadErrorMessage }}
      </div>
      <ElButton type="primary" @click="loadConfig">重新加载</ElButton>
    </div>
    <ElForm v-else ref="formRef" :model="dialogForm" label-width="120px">
      <ElFormItem label="智能补单">
        <ElRadioGroup
          v-model="dialogForm.smart_reorder_enabled"
          data-test="inventory-smart-reorder-enabled"
        >
          <ElRadio :label="1">开启</ElRadio>
          <ElRadio :label="0">关闭</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="补单时间设置">
        <ElRadioGroup
          v-model="dialogForm.reorder_timeout_enabled"
          data-test="inventory-timeout-enabled"
        >
          <ElRadio :label="1">开启</ElRadio>
          <ElRadio :label="0">关闭</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem
        label="补单时间"
        prop="reorder_timeout_minutes"
        :rules="
          dialogForm.reorder_timeout_enabled === 1
            ? formRules.reorder_timeout_minutes
            : []
        "
      >
        <ElInput
          v-model="dialogForm.reorder_timeout_minutes"
          data-test="inventory-timeout-minutes"
          :disabled="dialogForm.reorder_timeout_enabled !== 1"
        />
      </ElFormItem>
      <ElFormItem
        label="下单方式"
        prop="order_strategy"
        :rules="formRules.order_strategy"
      >
        <ElSelect
          v-model="dialogForm.order_strategy"
          data-test="inventory-order-strategy"
          class="w-full"
        >
          <ElOption
            v-for="item in orderStrategyOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="同步进价">
        <ElRadioGroup
          v-model="dialogForm.sync_cost_price_enabled"
          data-test="inventory-sync-cost-enabled"
        >
          <ElRadio :label="1">开启</ElRadio>
          <ElRadio :label="0">关闭</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="同步商品名称">
        <ElRadioGroup
          v-model="dialogForm.sync_goods_name_enabled"
          data-test="inventory-sync-goods-name-enabled"
        >
          <ElRadio :label="1">开启</ElRadio>
          <ElRadio :label="0">关闭</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="亏本销售">
        <ElRadioGroup
          v-model="dialogForm.allow_loss_sale_enabled"
          data-test="inventory-loss-enabled"
        >
          <ElRadio :label="1">开启</ElRadio>
          <ElRadio :label="0">关闭</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem
        label="允许亏本金额"
        prop="max_loss_amount"
        :rules="
          dialogForm.allow_loss_sale_enabled === 1
            ? formRules.max_loss_amount
            : []
        "
      >
        <ElInput
          v-model="dialogForm.max_loss_amount"
          data-test="inventory-max-loss-amount"
          :disabled="dialogForm.allow_loss_sale_enabled !== 1"
        />
      </ElFormItem>
      <ElFormItem label="组合商品">
        <ElRadioGroup
          v-model="dialogForm.combo_goods_enabled"
          data-test="inventory-combo-goods-enabled"
        >
          <ElRadio :label="1">是</ElRadio>
          <ElRadio :label="0">否</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton
        :disabled="loading || Boolean(loadErrorMessage)"
        :loading="submitting"
        type="primary"
        @click="submitDialog"
      >
        确定
      </ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
.goods-channel-inventory-config__loading {
  padding: 24px 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.goods-channel-inventory-config__error {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding: 32px 0;
}

.goods-channel-inventory-config__error-text {
  font-size: 14px;
  color: var(--el-color-danger);
}
</style>
