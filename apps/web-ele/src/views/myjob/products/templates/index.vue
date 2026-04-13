<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type { GridPageParams } from '../../shared';

import type {
  ProductTemplateListItem,
  ProductTemplatePayload,
  ProductTemplateValidateTypeItem,
} from '#/api';

import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addProductTemplateApi,
  batchDeleteProductTemplateApi,
  deleteProductTemplateApi,
  getProductTemplateListApi,
  getProductTemplateValidateTypesApi,
  updateProductTemplateApi,
} from '#/api';

import {
  formatDateTime,
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  resolvePageParams,
  toGridResult,
} from '../../shared';

interface ProductTemplateDialogState {
  account_name: string;
  is_shared: number;
  title: string;
  type: string;
  validate_type: number;
}

const TEMPLATE_TYPE_OPTIONS = [{ label: '本地模板', value: 'local' }];
const SHARED_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '共享', value: '1' },
  { label: '不共享', value: '0' },
];
const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('product.template'),
);

const formRef = ref<FormInstance>();
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const editingTemplate = ref<null | ProductTemplateListItem>(null);
const validateTypeOptions = ref<ProductTemplateValidateTypeItem[]>([]);

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

async function ensureValidateTypesLoaded() {
  if (validateTypeOptions.value.length > 0) {
    return;
  }
  const result = await getProductTemplateValidateTypesApi();
  validateTypeOptions.value = result.list ?? [];
  const firstOption = validateTypeOptions.value[0];
  if (firstOption && !dialogForm.validate_type) {
    dialogForm.validate_type = firstOption.id;
  }
}

// 验证方式是模板表单的必填枚举，加载失败时阻止打开弹窗并给出明确提示。
async function prepareDialogOptions() {
  try {
    await ensureValidateTypesLoaded();
    syncDefaultValidateType();
    return true;
  } catch {
    ElMessage.error('验证方式加载失败，请稍后重试');
    return false;
  }
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
    const firstOption = validateTypeOptions.value[0];
    if (firstOption) {
      dialogForm.validate_type = firstOption.id;
    }
  }
}

async function openCreateDialog() {
  editingTemplate.value = null;
  resetDialogForm();
  const ready = await prepareDialogOptions();
  if (!ready) {
    return;
  }
  dialogVisible.value = true;
}

async function openEditDialog(row: ProductTemplateListItem) {
  resetDialogForm();
  dialogForm.account_name = row.account_name;
  dialogForm.is_shared = row.is_shared;
  dialogForm.title = row.title;
  dialogForm.type = row.type;
  dialogForm.validate_type = row.validate_type;
  const ready = await prepareDialogOptions();
  if (!ready) {
    resetDialogForm();
    editingTemplate.value = null;
    return;
  }
  editingTemplate.value = row;
  dialogVisible.value = true;
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
  if (!formRef.value) {
    return;
  }
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  const payload = buildPayload();
  try {
    dialogLoading.value = true;
    if (editingTemplate.value) {
      await updateProductTemplateApi(editingTemplate.value.id, payload);
      ElMessage.success('充值模板已更新');
    } else {
      await addProductTemplateApi(payload);
      ElMessage.success('充值模板已新增');
    }
    dialogVisible.value = false;
    await gridApi.reload();
  } finally {
    dialogLoading.value = false;
  }
}

async function handleDelete(row: ProductTemplateListItem) {
  await ElMessageBox.confirm(`确认删除充值模板 ${row.title} 吗？`, '删除确认', {
    type: 'warning',
  });
  await deleteProductTemplateApi(row.id);
  ElMessage.success('充值模板已删除');
  await gridApi.reload();
}

function getSelectedIds() {
  // 批量删除要合并当前页和 reserve 选中，避免跨页勾选后漏删。
  const currentRows =
    (gridApi.grid?.getCheckboxRecords?.() as
      | ProductTemplateListItem[]
      | undefined) ?? [];
  const reserveRows =
    (gridApi.grid?.getCheckboxReserveRecords?.() as
      | ProductTemplateListItem[]
      | undefined) ?? [];

  return [...new Set([...currentRows, ...reserveRows].map((item) => item.id))];
}

function clearSelectedRows() {
  void gridApi.grid?.clearCheckboxReserve?.();
  void gridApi.grid?.clearCheckboxRow?.();
}

async function handleBatchDelete() {
  const ids = getSelectedIds();
  if (ids.length === 0) {
    ElMessage.warning('请先选择充值模板');
    return;
  }
  await ElMessageBox.confirm(
    `确认批量删除已选中的 ${ids.length} 个充值模板吗？`,
    '删除确认',
    { type: 'warning' },
  );
  await batchDeleteProductTemplateApi(ids);
  clearSelectedRows();
  ElMessage.success('充值模板已批量删除');
  await gridApi.reload();
}

const [Grid, gridApi] = useVbenVxeGrid<ProductTemplateListItem>({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: '关键词',
        componentProps: {
          placeholder: '模板名称 / 充值账号名称',
        },
      },
      {
        component: 'Select',
        fieldName: 'type',
        label: '模板类型',
        componentProps: {
          options: [{ label: '全部', value: '' }, ...TEMPLATE_TYPE_OPTIONS],
          placeholder: '请选择模板类型',
        },
      },
      {
        component: 'Select',
        fieldName: 'is_shared',
        label: '共享状态',
        componentProps: {
          options: SHARED_STATUS_OPTIONS,
          placeholder: '请选择共享状态',
        },
      },
    ],
  },
  gridClass: MYJOB_GRID_CLASS,
  gridOptions: {
    checkboxConfig: {
      reserve: true,
    },
    columns: [
      { type: 'checkbox', width: 48 },
      { field: 'title', title: '模板名称', minWidth: 180 },
      { field: 'type_label', title: '类型', minWidth: 120 },
      { field: 'is_shared_label', title: '共享状态', minWidth: 120 },
      { field: 'account_name', title: '充值账号名称', minWidth: 180 },
      { field: 'validate_type_label', title: '验证方式', minWidth: 180 },
      {
        field: 'updated_at',
        formatter: ({ cellValue }: { cellValue?: string }) =>
          formatDateTime(cellValue),
        title: '更新时间',
        minWidth: 180,
      },
      {
        field: 'actions',
        fixed: 'right',
        minWidth: 180,
        slots: { default: 'actions' },
        title: '操作',
      },
    ],
    pagerConfig: {},
    proxyConfig: {
      ajax: {
        query: async (
          params: GridPageParams,
          formValues: Record<string, any>,
        ) => {
          const { page, page_size } = resolvePageParams(params);
          const keyword = String(formValues.keyword ?? '').trim();
          const type = String(formValues.type ?? '').trim();
          const is_shared = String(formValues.is_shared ?? '').trim();
          const result = await getProductTemplateListApi({
            ...(keyword ? { keyword } : {}),
            ...(type ? { type } : {}),
            ...(is_shared ? { is_shared } : {}),
            page,
            page_size,
          });
          return toGridResult(result.list ?? [], result.pagination.total);
        },
      },
    },
    toolbarConfig: {
      refresh: true,
      search: true,
      zoom: true,
    },
  },
});

const dialogTitle = computed(() =>
  editingTemplate.value ? '编辑充值模板' : '新增充值模板',
);
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <Grid>
      <template #toolbar-actions>
        <div v-if="canManage" class="flex gap-3">
          <ElButton type="primary" @click="openCreateDialog">添加</ElButton>
          <ElButton type="danger" @click="handleBatchDelete">批量删除</ElButton>
        </div>
      </template>

      <template #actions="{ row }">
        <div v-if="canManage" class="flex items-center gap-3">
          <ElButton link type="primary" @click="openEditDialog(row)">
            编辑
          </ElButton>
          <ElButton link type="danger" @click="handleDelete(row)">
            删除
          </ElButton>
        </div>
      </template>
    </Grid>

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
        <ElFormItem label="验证方式">
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
            :loading="dialogLoading"
            type="primary"
            @click="submitDialog"
          >
            确定
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </Page>
</template>
