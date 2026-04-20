<script lang="ts" setup>
import type {
  ProductGoodsChannelBindingItem,
  ProductGoodsChannelIntOption,
  ProductGoodsChannelPlatformAccountOption,
  ProductGoodsChannelTemplateOption,
} from '#/api/modules/admin/products/goods-channels';

import { computed, reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElSelect,
} from 'element-plus';

import {
  createProductGoodsChannelBindingApi,
  updateProductGoodsChannelBindingApi,
} from '#/api/modules/admin/products/goods-channels';

import { buildProductGoodsChannelBindingPayload } from './mappers';
import { isValidNonNegativeMoney, isValidTimeValue } from './validators';

interface ChannelBindingDialogState {
  dock_status: number;
  order_time_end: string;
  order_time_start: string;
  order_weight: string;
  platform_account_id: number;
  sort: number;
  source_cost_price: string;
  supplier_goods_name: string;
  supplier_goods_no: string;
  validate_template_id: null | number;
}

const props = defineProps<{
  dockStatusOptions: ProductGoodsChannelIntOption[];
  editingBinding: null | ProductGoodsChannelBindingItem;
  goodsId: null | number;
  platformAccounts: ProductGoodsChannelPlatformAccountOption[];
  validateTemplates: ProductGoodsChannelTemplateOption[];
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();

const formRef = ref<InstanceType<typeof ElForm>>();
const submitting = ref(false);

const dialogForm = reactive<ChannelBindingDialogState>({
  dock_status: 1,
  order_time_end: '',
  order_time_start: '',
  order_weight: '',
  platform_account_id: 0,
  sort: 0,
  source_cost_price: '',
  supplier_goods_name: '',
  supplier_goods_no: '',
  validate_template_id: null,
});

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const dialogTitle = computed(() =>
  props.editingBinding ? '编辑库存' : '新增库存',
);

function validateOrderWeight(
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void,
) {
  const normalized = String(value ?? '').trim();
  if (normalized && !isValidNonNegativeMoney(normalized)) {
    callback(new Error('下单权重格式错误'));
    return;
  }
  callback();
}

function validateOrderTimeField(
  label: '下单开始时段' | '下单结束时段',
  value: string,
  relatedValue: string,
  callback: (error?: Error) => void,
) {
  const normalized = String(value ?? '').trim();
  const relatedNormalized = String(relatedValue ?? '').trim();
  if (!normalized && !relatedNormalized) {
    callback();
    return;
  }
  if (!normalized || !relatedNormalized) {
    callback(new Error('下单开始时段和结束时段需同时填写'));
    return;
  }
  if (!isValidTimeValue(normalized)) {
    callback(new Error(`${label}格式错误`));
    return;
  }
  callback();
}

function resetDialogForm() {
  dialogForm.dock_status = props.dockStatusOptions[0]?.value ?? 1;
  dialogForm.order_time_end = '';
  dialogForm.order_time_start = '';
  dialogForm.order_weight = '';
  dialogForm.platform_account_id = 0;
  dialogForm.sort = 0;
  dialogForm.source_cost_price = '';
  dialogForm.supplier_goods_name = '';
  dialogForm.supplier_goods_no = '';
  dialogForm.validate_template_id = null;
}

function syncDialogForm() {
  if (!props.editingBinding) {
    resetDialogForm();
    return;
  }

  dialogForm.dock_status = props.editingBinding.dock_status;
  dialogForm.order_time_end = props.editingBinding.order_time_end;
  dialogForm.order_time_start = props.editingBinding.order_time_start;
  dialogForm.order_weight = props.editingBinding.order_weight;
  dialogForm.platform_account_id = props.editingBinding.platform_account_id;
  dialogForm.sort = props.editingBinding.sort;
  dialogForm.source_cost_price = props.editingBinding.source_cost_price;
  dialogForm.supplier_goods_name = props.editingBinding.supplier_goods_name;
  dialogForm.supplier_goods_no = props.editingBinding.supplier_goods_no;
  dialogForm.validate_template_id = props.editingBinding.validate_template_id;
}

watch(
  () => [props.visible, props.editingBinding] as const,
  ([visible]) => {
    if (!visible) {
      return;
    }
    syncDialogForm();
  },
  { immediate: true },
);

const formRules = {
  platform_account_id: [
    { required: true, message: '请选择渠道', trigger: 'change' },
    {
      validator: (
        _rule: unknown,
        value: number,
        callback: (error?: Error) => void,
      ) => {
        // 渠道下拉的空态会落成 0，必须显式拦住，避免把无效渠道编号提交给后端。
        if (Number(value) <= 0) {
          callback(new Error('请选择渠道'));
          return;
        }
        callback();
      },
      trigger: 'change',
    },
  ],
  source_cost_price: [
    { required: true, message: '请输入原始进货价', trigger: 'blur' },
    {
      validator: (
        _rule: unknown,
        value: string,
        callback: (error?: Error) => void,
      ) => {
        if (!isValidNonNegativeMoney(value)) {
          callback(new Error('原始进货价格式错误'));
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
  supplier_goods_name: [
    { required: true, message: '请输入对接商品名称', trigger: 'blur' },
  ],
  supplier_goods_no: [
    { required: true, message: '请输入对接商品编号', trigger: 'blur' },
  ],
  order_time_end: [
    {
      validator: (
        _rule: unknown,
        value: string,
        callback: (error?: Error) => void,
      ) =>
        validateOrderTimeField(
          '下单结束时段',
          value,
          dialogForm.order_time_start,
          callback,
        ),
      trigger: 'blur',
    },
  ],
  order_time_start: [
    {
      validator: (
        _rule: unknown,
        value: string,
        callback: (error?: Error) => void,
      ) =>
        validateOrderTimeField(
          '下单开始时段',
          value,
          dialogForm.order_time_end,
          callback,
        ),
      trigger: 'blur',
    },
  ],
  order_weight: [
    {
      validator: validateOrderWeight,
      trigger: 'blur',
    },
  ],
};

async function submitDialog() {
  if (!props.goodsId) {
    return;
  }
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    // 提交前统一走 mapper，确保数字和可空模板字段在新增/编辑两条链路里口径一致。
    const payload = buildProductGoodsChannelBindingPayload(dialogForm);
    if (props.editingBinding) {
      await updateProductGoodsChannelBindingApi(
        props.goodsId,
        props.editingBinding.id,
        payload,
      );
      ElMessage.success('库存已更新');
    } else {
      await createProductGoodsChannelBindingApi(props.goodsId, payload);
      ElMessage.success('库存已新增');
    }
    emit('saved');
    dialogVisible.value = false;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <ElDialog v-model="dialogVisible" :title="dialogTitle" width="720px">
    <ElForm ref="formRef" :model="dialogForm">
      <ElFormItem
        label="选择渠道"
        prop="platform_account_id"
        :rules="formRules.platform_account_id"
      >
        <ElSelect
          v-model="dialogForm.platform_account_id"
          data-test="channel-platform-account"
          class="w-full"
        >
          <ElOption
            v-for="item in platformAccounts"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem
        label="对接商品编号"
        prop="supplier_goods_no"
        :rules="formRules.supplier_goods_no"
      >
        <ElInput
          v-model="dialogForm.supplier_goods_no"
          data-test="channel-supplier-goods-no"
        />
      </ElFormItem>
      <ElFormItem
        label="原始进货价"
        prop="source_cost_price"
        :rules="formRules.source_cost_price"
      >
        <ElInput
          v-model="dialogForm.source_cost_price"
          data-test="channel-source-cost-price"
        />
      </ElFormItem>
      <ElFormItem
        label="对接商品名"
        prop="supplier_goods_name"
        :rules="formRules.supplier_goods_name"
      >
        <ElInput
          v-model="dialogForm.supplier_goods_name"
          data-test="channel-supplier-goods-name"
        />
      </ElFormItem>
      <ElFormItem label="充值匹配">
        <ElSelect
          v-model="dialogForm.validate_template_id"
          data-test="channel-validate-template"
          class="w-full"
        >
          <ElOption label="不设置" :value="0" />
          <ElOption
            v-for="item in validateTemplates"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="对接状态">
        <ElSelect
          v-model="dialogForm.dock_status"
          data-test="channel-dock-status"
          class="w-full"
        >
          <ElOption
            v-for="item in dockStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem
        label="下单权重"
        prop="order_weight"
        :rules="formRules.order_weight"
      >
        <ElInput
          v-model="dialogForm.order_weight"
          data-test="channel-order-weight"
        />
      </ElFormItem>
      <ElFormItem
        label="下单开始时段"
        prop="order_time_start"
        :rules="formRules.order_time_start"
      >
        <ElInput
          v-model="dialogForm.order_time_start"
          data-test="channel-order-time-start"
          placeholder="09:00"
        />
      </ElFormItem>
      <ElFormItem
        label="下单结束时段"
        prop="order_time_end"
        :rules="formRules.order_time_end"
      >
        <ElInput
          v-model="dialogForm.order_time_end"
          data-test="channel-order-time-end"
          placeholder="18:00"
        />
      </ElFormItem>
      <ElFormItem label="排序">
        <ElInputNumber v-model="dialogForm.sort" data-test="channel-sort" />
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
