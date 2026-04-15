<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type {
  ProductTemplateListItem,
  ProductTemplatePayload,
  ProductTemplateValidateTypeItem,
} from '#/api/modules/admin/products/templates';

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
  addProductTemplateApi,
  getProductTemplateValidateTypesApi,
  updateProductTemplateApi,
} from '#/api/modules/admin/products/templates';

interface ProductTemplateDialogState {
  account_name: string;
  is_shared: number;
  title: string;
  type: string;
  validate_type: number;
}

const props = defineProps<{
  editingTemplate: null | ProductTemplateListItem;
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();

const TEMPLATE_TYPE_OPTIONS = [{ label: '本地模板', value: 'local' }];

const formRef = ref<FormInstance>();
const dialogLoading = ref(false);
const validateTypeOptions = ref<ProductTemplateValidateTypeItem[]>([]);

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const dialogTitle = computed(() =>
  props.editingTemplate ? '编辑充值模板' : '新增充值模板',
);

const dialogForm = reactive<ProductTemplateDialogState>({
  account_name: '',
  is_shared: 0,
  title: '',
  type: 'local',
  validate_type: 0,
});

function resetDialogForm() {
  dialogForm.account_name = '';
  dialogForm.is_shared = 0;
  dialogForm.title = '';
  dialogForm.type = 'local';
  dialogForm.validate_type = 0;
}

function syncDefaultValidateType() {
  if (validateTypeOptions.value.length === 0) {
    dialogForm.validate_type = 0;
    return;
  }
  const matched = validateTypeOptions.value.some(
    (item) => item.id === dialogForm.validate_type,
  );
  if (!matched) {
    dialogForm.validate_type = validateTypeOptions.value[0]?.id ?? 0;
  }
}

function hasValidValidateType(value: number) {
  return validateTypeOptions.value.some((item) => item.id === value);
}

async function ensureValidateTypesLoaded() {
  if (validateTypeOptions.value.length > 0) {
    return;
  }
  const result = await getProductTemplateValidateTypesApi();
  validateTypeOptions.value = result.list ?? [];
  syncDefaultValidateType();
}

function applyEditingTemplate(row: ProductTemplateListItem) {
  dialogForm.account_name = row.account_name;
  dialogForm.is_shared = row.is_shared;
  dialogForm.title = row.title;
  dialogForm.type = row.type;
  dialogForm.validate_type = row.validate_type;
}

async function initializeDialog() {
  resetDialogForm();
  if (props.editingTemplate) {
    applyEditingTemplate(props.editingTemplate);
  }
  try {
    await ensureValidateTypesLoaded();
    syncDefaultValidateType();
  } catch {
    ElMessage.error('验证方式加载失败，请稍后重试');
    emit('update:visible', false);
  }
}

function validateValidateType(
  _: unknown,
  value: number,
  callback: (error?: Error) => void,
) {
  if (dialogLoading.value) {
    callback(new Error('验证方式加载中，请稍后重试'));
    return;
  }
  if (!hasValidValidateType(value)) {
    callback(new Error('请选择验证方式'));
    return;
  }
  callback();
}

function buildPayload(): ProductTemplatePayload {
  return {
    account_name: dialogForm.account_name.trim(),
    is_shared: dialogForm.is_shared,
    title: dialogForm.title.trim(),
    type: dialogForm.type,
    validate_type: dialogForm.validate_type,
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
    if (props.editingTemplate) {
      await updateProductTemplateApi(props.editingTemplate.id, payload);
      ElMessage.success('充值模板已更新');
    } else {
      await addProductTemplateApi(payload);
      ElMessage.success('充值模板已新增');
    }
    emit('saved');
    emit('update:visible', false);
  } finally {
    dialogLoading.value = false;
  }
}

watch(
  () => [props.visible, props.editingTemplate?.id] as const,
  async ([visible]) => {
    if (!visible) {
      resetDialogForm();
      dialogLoading.value = false;
      return;
    }
    // 弹窗打开后先锁提交，直到枚举和编辑态回填完成，避免默认值被误提交。
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
    <ElForm ref="formRef" :model="dialogForm" label-width="108px">
      <ElFormItem
        label="模板名称"
        prop="title"
        :rules="[
          { required: true, message: '请输入模板名称', trigger: 'blur' },
        ]"
      >
        <ElInput
          v-model="dialogForm.title"
          data-test="template-title"
          placeholder="请输入模板名称"
        />
      </ElFormItem>
      <ElFormItem label="模板类型">
        <ElSelect v-model="dialogForm.type" class="w-full">
          <ElOption
            v-for="item in TEMPLATE_TYPE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="共享状态">
        <ElSelect v-model="dialogForm.is_shared" class="w-full">
          <ElOption label="共享" :value="1" />
          <ElOption label="不共享" :value="0" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem
        label="充值账号名称"
        prop="account_name"
        :rules="[
          {
            required: true,
            message: '请输入充值账号名称',
            trigger: 'blur',
          },
        ]"
      >
        <ElInput
          v-model="dialogForm.account_name"
          data-test="template-account-name"
          placeholder="请输入充值账号名称"
        />
      </ElFormItem>
      <ElFormItem
        label="验证方式"
        prop="validate_type"
        :rules="[{ trigger: 'change', validator: validateValidateType }]"
      >
        <ElSelect v-model="dialogForm.validate_type" class="w-full">
          <ElOption
            v-for="item in validateTypeOptions"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </ElSelect>
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
