<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type {
  PurchaseLimitStrategyEnumItem,
  PurchaseLimitStrategyListItem,
  PurchaseLimitStrategyPayload,
} from '#/api';

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
  addPurchaseLimitStrategyApi,
  getPurchaseLimitStrategyEnumsApi,
  updatePurchaseLimitStrategyApi,
} from '#/api';

interface PurchaseLimitDialogState {
  limit_nums: number;
  limit_times: number;
  limit_type: number;
  name: string;
  period: number;
  period_type: number;
}

const props = defineProps<{
  editingStrategy: null | PurchaseLimitStrategyListItem;
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();

const formRef = ref<FormInstance>();
const dialogLoading = ref(false);
const limitTypeOptions = ref<PurchaseLimitStrategyEnumItem[]>([]);
const periodTypeOptions = ref<PurchaseLimitStrategyEnumItem[]>([]);

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const dialogTitle = computed(() =>
  props.editingStrategy ? '编辑限制策略' : '新增限制策略',
);

const dialogForm = reactive<PurchaseLimitDialogState>({
  limit_nums: 0,
  limit_times: 0,
  limit_type: 0,
  name: '',
  period: 1,
  period_type: 0,
});

function resetDialogForm() {
  dialogForm.limit_nums = 0;
  dialogForm.limit_times = 0;
  dialogForm.limit_type = 0;
  dialogForm.name = '';
  dialogForm.period = 1;
  dialogForm.period_type = 0;
}

function syncEnumDefaults() {
  if (
    !limitTypeOptions.value.some((item) => item.id === dialogForm.limit_type)
  ) {
    dialogForm.limit_type = limitTypeOptions.value[0]?.id ?? 0;
  }
  if (
    !periodTypeOptions.value.some((item) => item.id === dialogForm.period_type)
  ) {
    dialogForm.period_type = periodTypeOptions.value[0]?.id ?? 0;
  }
}

async function ensureEnumsLoaded() {
  if (limitTypeOptions.value.length > 0 && periodTypeOptions.value.length > 0) {
    return;
  }
  const result = await getPurchaseLimitStrategyEnumsApi();
  limitTypeOptions.value = result.limit_types ?? [];
  periodTypeOptions.value = result.period_types ?? [];
}

function validateEnumSelection(
  options: PurchaseLimitStrategyEnumItem[],
  emptyMessage: string,
  value: number,
  callback: (error?: Error) => void,
) {
  if (dialogLoading.value) {
    callback(new Error('限制策略枚举加载中，请稍后重试'));
    return;
  }
  if (!options.some((item) => item.id === value)) {
    callback(new Error(emptyMessage));
    return;
  }
  callback();
}

function applyEditingStrategy(row: PurchaseLimitStrategyListItem) {
  dialogForm.limit_nums = row.limit_nums;
  dialogForm.limit_times = row.limit_times;
  dialogForm.limit_type = row.limit_type;
  dialogForm.name = row.name;
  dialogForm.period = row.period;
  dialogForm.period_type = row.period_type;
}

async function initializeDialog() {
  resetDialogForm();
  if (props.editingStrategy) {
    applyEditingStrategy(props.editingStrategy);
  }
  try {
    await ensureEnumsLoaded();
    syncEnumDefaults();
  } catch {
    ElMessage.error('限制策略枚举加载失败，请稍后重试');
    emit('update:visible', false);
  }
}

function buildPayload(): PurchaseLimitStrategyPayload {
  return {
    limit_nums: dialogForm.limit_nums,
    limit_times: dialogForm.limit_times,
    limit_type: dialogForm.limit_type,
    name: dialogForm.name.trim(),
    period: dialogForm.period,
    period_type: dialogForm.period_type,
  };
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
    const payload = buildPayload();
    if (props.editingStrategy) {
      await updatePurchaseLimitStrategyApi(props.editingStrategy.id, payload);
      ElMessage.success('限制策略已更新');
    } else {
      await addPurchaseLimitStrategyApi(payload);
      ElMessage.success('限制策略已新增');
    }
    emit('saved');
    emit('update:visible', false);
  } finally {
    dialogLoading.value = false;
  }
}

watch(
  () => [props.visible, props.editingStrategy?.id] as const,
  async ([visible]) => {
    if (!visible) {
      resetDialogForm();
      dialogLoading.value = false;
      return;
    }
    // 先把枚举和编辑态值准备好，再开放保存，避免默认 0 被直接提交。
    dialogLoading.value = true;
    try {
      await initializeDialog();
    } finally {
      dialogLoading.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <ElDialog v-model="dialogVisible" :title="dialogTitle" width="640px">
    <ElForm ref="formRef" :model="dialogForm" label-width="112px">
      <ElFormItem
        label="策略名称"
        prop="name"
        :rules="[
          { required: true, message: '请输入策略名称', trigger: 'blur' },
        ]"
      >
        <ElInput
          v-model="dialogForm.name"
          data-test="strategy-name"
          placeholder="请输入策略名称"
        />
      </ElFormItem>
      <ElFormItem
        label="限制类型"
        prop="limit_type"
        :rules="[
          {
            trigger: 'change',
            validator: (
              _: unknown,
              value: number,
              callback: (error?: Error) => void,
            ) =>
              validateEnumSelection(
                limitTypeOptions,
                '请选择限制类型',
                value,
                callback,
              ),
          },
        ]"
      >
        <ElSelect v-model="dialogForm.limit_type" class="w-full">
          <ElOption
            v-for="item in limitTypeOptions"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem
        label="周期类型"
        prop="period_type"
        :rules="[
          {
            trigger: 'change',
            validator: (
              _: unknown,
              value: number,
              callback: (error?: Error) => void,
            ) =>
              validateEnumSelection(
                periodTypeOptions,
                '请选择周期类型',
                value,
                callback,
              ),
          },
        ]"
      >
        <ElSelect v-model="dialogForm.period_type" class="w-full">
          <ElOption
            v-for="item in periodTypeOptions"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem
        label="周期"
        prop="period"
        :rules="[
          {
            required: true,
            message: '请输入大于 0 的周期',
            trigger: 'change',
          },
        ]"
      >
        <ElInputNumber
          v-model="dialogForm.period"
          :min="1"
          class="w-full"
          data-test="strategy-period"
        />
      </ElFormItem>
      <ElFormItem label="限制数量" prop="limit_nums">
        <ElInputNumber
          v-model="dialogForm.limit_nums"
          :min="0"
          class="w-full"
          data-test="strategy-limit-nums"
        />
        <div class="mt-2 text-xs text-muted-foreground">0 表示不限制</div>
      </ElFormItem>
      <ElFormItem label="限制笔数" prop="limit_times">
        <ElInputNumber
          v-model="dialogForm.limit_times"
          :min="0"
          class="w-full"
          data-test="strategy-limit-times"
        />
        <div class="mt-2 text-xs text-muted-foreground">0 表示不限制</div>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="flex justify-end gap-3">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton
          :disabled="dialogLoading"
          :loading="dialogLoading"
          type="primary"
          @click="submitDialog"
        >
          确定
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>
