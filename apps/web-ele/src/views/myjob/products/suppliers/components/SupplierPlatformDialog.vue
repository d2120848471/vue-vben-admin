<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type {
  SupplierPlatformDetailResult,
  SupplierPlatformListItem,
  SupplierPlatformPayload,
  SupplierPlatformTypeItem,
} from '#/api/modules/admin/products/suppliers';
import type { SubjectItem } from '#/api/modules/admin/subjects';

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
  addSupplierPlatformApi,
  getSupplierPlatformDetailApi,
  updateSupplierPlatformApi,
} from '#/api/modules/admin/products/suppliers';

interface SupplierPlatformDialogState {
  backup_domain: string;
  crowd_name: string;
  domain: string;
  has_tax: number;
  name: string;
  secret_key: string;
  sort: number;
  subject_id: number;
  threshold_amount: string;
  token_id: string;
  type_id: number;
}

const props = defineProps<{
  editingPlatform: null | SupplierPlatformListItem;
  platformTypeOptions: SupplierPlatformTypeItem[];
  subjectOptions: SubjectItem[];
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();

const formRef = ref<FormInstance>();
const dialogLoading = ref(false);

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const dialogTitle = computed(() =>
  props.editingPlatform ? '编辑第三方平台' : '新增第三方平台',
);

const dialogForm = reactive<SupplierPlatformDialogState>({
  backup_domain: '',
  crowd_name: '',
  domain: '',
  has_tax: 1,
  name: '',
  secret_key: '',
  sort: 0,
  subject_id: 0,
  threshold_amount: '0.0000',
  token_id: '',
  type_id: 0,
});

function resetDialogForm() {
  dialogForm.backup_domain = '';
  dialogForm.crowd_name = '';
  dialogForm.domain = '';
  dialogForm.has_tax = 1;
  dialogForm.name = '';
  dialogForm.secret_key = '';
  dialogForm.sort = 0;
  dialogForm.subject_id = 0;
  dialogForm.threshold_amount = '0.0000';
  dialogForm.token_id = '';
  dialogForm.type_id = 0;
}

function syncDialogDefaults() {
  if (
    !props.platformTypeOptions.some((item) => item.id === dialogForm.type_id)
  ) {
    dialogForm.type_id = props.platformTypeOptions[0]?.id ?? 0;
  }
  if (!props.subjectOptions.some((item) => item.id === dialogForm.subject_id)) {
    dialogForm.subject_id = props.subjectOptions[0]?.id ?? 0;
  }
}

function applyDetailToDialog(detail: SupplierPlatformDetailResult) {
  dialogForm.backup_domain = detail.backup_domain;
  dialogForm.crowd_name = detail.crowd_name;
  dialogForm.domain = detail.domain;
  dialogForm.has_tax = detail.has_tax;
  dialogForm.name = detail.name;
  dialogForm.secret_key = detail.secret_key;
  dialogForm.sort = detail.sort;
  dialogForm.subject_id = detail.subject_id;
  dialogForm.threshold_amount = detail.threshold_amount;
  dialogForm.token_id = detail.token_id;
  dialogForm.type_id = detail.type_id;
}

async function initializeDialog() {
  resetDialogForm();
  syncDialogDefaults();
  if (!props.editingPlatform) {
    return;
  }
  try {
    const detail = await getSupplierPlatformDetailApi(props.editingPlatform.id);
    applyDetailToDialog(detail);
    syncDialogDefaults();
  } catch {
    resetDialogForm();
    ElMessage.error('平台详情加载失败，请稍后重试');
    emit('update:visible', false);
  }
}

function buildPayload(): SupplierPlatformPayload {
  return {
    backup_domain: dialogForm.backup_domain.trim(),
    crowd_name: dialogForm.crowd_name.trim(),
    domain: dialogForm.domain.trim(),
    has_tax: dialogForm.has_tax,
    name: dialogForm.name.trim(),
    secret_key: dialogForm.secret_key.trim(),
    sort: dialogForm.sort,
    subject_id: dialogForm.subject_id,
    threshold_amount: dialogForm.threshold_amount.trim(),
    token_id: dialogForm.token_id.trim(),
    type_id: dialogForm.type_id,
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
    if (props.editingPlatform) {
      await updateSupplierPlatformApi(props.editingPlatform.id, payload);
      ElMessage.success('第三方平台已更新');
    } else {
      await addSupplierPlatformApi(payload);
      ElMessage.success('第三方平台已新增');
    }
    emit('saved');
    emit('update:visible', false);
  } finally {
    dialogLoading.value = false;
  }
}

watch(
  () => [props.visible, props.editingPlatform?.id] as const,
  async ([visible]) => {
    if (!visible) {
      resetDialogForm();
      dialogLoading.value = false;
      return;
    }
    // 编辑态详情未回填前禁止提交，避免默认值覆盖已有平台配置。
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
  <ElDialog v-model="dialogVisible" :title="dialogTitle" width="680px">
    <ElForm ref="formRef" :model="dialogForm" label-width="108px">
      <ElFormItem
        label="平台名称"
        prop="name"
        :rules="[
          { required: true, message: '请输入平台名称', trigger: 'blur' },
        ]"
      >
        <ElInput
          v-model="dialogForm.name"
          data-test="supplier-name"
          placeholder="请输入平台名称"
        />
      </ElFormItem>
      <ElFormItem
        label="下单域名"
        prop="domain"
        :rules="[
          { required: true, message: '请输入下单域名', trigger: 'blur' },
        ]"
      >
        <ElInput
          v-model="dialogForm.domain"
          data-test="supplier-domain"
          placeholder="请输入供货方域名，不包含 http:// 或 https://"
        />
      </ElFormItem>
      <ElFormItem
        label="备用域名"
        prop="backup_domain"
        :rules="[
          { required: true, message: '请输入备用域名', trigger: 'blur' },
        ]"
      >
        <ElInput
          v-model="dialogForm.backup_domain"
          data-test="supplier-backup-domain"
          placeholder="请输入备用域名，不包含 http:// 或 https://"
        />
      </ElFormItem>
      <ElFormItem
        label="平台类型"
        prop="type_id"
        :rules="[
          { required: true, message: '请选择平台类型', trigger: 'change' },
        ]"
      >
        <ElSelect v-model="dialogForm.type_id" class="w-full">
          <ElOption
            v-for="item in platformTypeOptions"
            :key="item.id"
            :label="item.type_name"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem
        label="主体名称"
        prop="subject_id"
        :rules="[{ required: true, message: '请选择主体', trigger: 'change' }]"
      >
        <ElSelect v-model="dialogForm.subject_id" class="w-full">
          <ElOption
            v-for="item in subjectOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="含税/未税" prop="has_tax">
        <ElSelect v-model="dialogForm.has_tax" class="w-full">
          <ElOption :value="1" label="含税" />
          <ElOption :value="0" label="未税" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem
        label="会员 ID"
        prop="token_id"
        :rules="[{ required: true, message: '请输入会员 ID', trigger: 'blur' }]"
      >
        <ElInput
          v-model="dialogForm.token_id"
          data-test="supplier-token-id"
          placeholder="请输入平台账号 ID / TokenID"
        />
      </ElFormItem>
      <ElFormItem
        label="密钥"
        prop="secret_key"
        :rules="[
          { required: true, message: '请输入平台密钥', trigger: 'blur' },
        ]"
      >
        <ElInput
          v-model="dialogForm.secret_key"
          data-test="supplier-secret-key"
          placeholder="请输入平台密钥"
        />
      </ElFormItem>
      <ElFormItem
        label="余额阈值"
        prop="threshold_amount"
        :rules="[
          { required: true, message: '请输入余额阈值', trigger: 'blur' },
        ]"
      >
        <ElInput
          v-model="dialogForm.threshold_amount"
          data-test="supplier-threshold-amount"
          placeholder="请输入余额阈值"
        />
      </ElFormItem>
      <ElFormItem label="排列顺序" prop="sort">
        <ElInputNumber
          v-model="dialogForm.sort"
          :min="0"
          class="w-full"
          data-test="supplier-sort"
        />
      </ElFormItem>
      <ElFormItem label="群名 / 备注" prop="crowd_name">
        <ElInput
          v-model="dialogForm.crowd_name"
          data-test="supplier-crowd-name"
          placeholder="请输入群名或备注"
        />
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
