<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type { GridPageParams } from '../../shared';

import type {
  SubjectItem,
  SupplierPlatformDetailResult,
  SupplierPlatformListItem,
  SupplierPlatformPayload,
  SupplierPlatformRefreshResult,
  SupplierPlatformTypeItem,
} from '#/api';

import { computed, onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addSupplierPlatformApi,
  deleteSupplierPlatformApi,
  getSubjectsApi,
  getSupplierPlatformDetailApi,
  getSupplierPlatformListApi,
  getSupplierPlatformTypesApi,
  refreshSupplierPlatformBalanceApi,
  updateSupplierPlatformApi,
} from '#/api';

import {
  formatDateTime,
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  resolvePageParams,
  toGridResult,
} from '../../shared';

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

const TAX_OPTIONS = [
  { label: '全部', value: '' },
  { label: '含税', value: '1' },
  { label: '未税', value: '0' },
];
const CONNECT_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '未验证', value: '0' },
  { label: '正常', value: '1' },
  { label: '异常', value: '2' },
];

const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('supplier.index'),
);

const formRef = ref<FormInstance>();
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const editingPlatform = ref<null | SupplierPlatformListItem>(null);
const loadingBalanceIds = reactive<Record<number, boolean>>({});
const platformTypeOptions = ref<SupplierPlatformTypeItem[]>([]);
const subjectOptions = ref<SubjectItem[]>([]);

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
    !platformTypeOptions.value.some((item) => item.id === dialogForm.type_id)
  ) {
    dialogForm.type_id = platformTypeOptions.value[0]?.id ?? 0;
  }
  if (!subjectOptions.value.some((item) => item.id === dialogForm.subject_id)) {
    dialogForm.subject_id = subjectOptions.value[0]?.id ?? 0;
  }
}

function buildFilterTypeOptions() {
  return [
    { label: '全部', value: '' },
    ...platformTypeOptions.value.map((item) => ({
      label: item.type_name,
      value: String(item.id),
    })),
  ];
}

function buildFilterSubjectOptions() {
  return [
    { label: '全部', value: '' },
    ...subjectOptions.value.map((item) => ({
      label: item.name,
      value: String(item.id),
    })),
  ];
}

function syncFilterOptions() {
  if (!gridApi.formApi?.updateSchema) {
    return;
  }
  gridApi.formApi.updateSchema([
    {
      componentProps: {
        options: buildFilterTypeOptions(),
        placeholder: '请选择平台类型',
      },
      fieldName: 'type_id',
    },
    {
      componentProps: {
        options: buildFilterSubjectOptions(),
        placeholder: '请选择主体',
      },
      fieldName: 'subject_id',
    },
  ]);
}

async function loadReferenceOptions() {
  const [typesResult, subjectsResult] = await Promise.all([
    getSupplierPlatformTypesApi(),
    getSubjectsApi(),
  ]);
  platformTypeOptions.value = typesResult.list ?? [];
  subjectOptions.value = subjectsResult.list ?? [];
  syncDialogDefaults();
  syncFilterOptions();
}

// 筛选区和弹窗共用同一份平台/主体字典，统一预加载，避免两处口径漂移。
async function ensureReferenceOptionsLoaded() {
  if (platformTypeOptions.value.length > 0 && subjectOptions.value.length > 0) {
    return true;
  }
  try {
    await loadReferenceOptions();
    return true;
  } catch {
    ElMessage.error('平台类型和主体加载失败，请稍后重试');
    return false;
  }
}

onMounted(async () => {
  await ensureReferenceOptionsLoaded();
});

async function openCreateDialog() {
  editingPlatform.value = null;
  resetDialogForm();
  const ready = await ensureReferenceOptionsLoaded();
  if (!ready) {
    return;
  }
  syncDialogDefaults();
  dialogVisible.value = true;
}

async function applyDetailToDialog(detail: SupplierPlatformDetailResult) {
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

async function openEditDialog(row: SupplierPlatformListItem) {
  resetDialogForm();
  const ready = await ensureReferenceOptionsLoaded();
  if (!ready) {
    return;
  }
  try {
    const detail = await getSupplierPlatformDetailApi(row.id);
    await applyDetailToDialog(detail);
    editingPlatform.value = row;
    dialogVisible.value = true;
  } catch {
    resetDialogForm();
    editingPlatform.value = null;
    ElMessage.error('平台详情加载失败，请稍后重试');
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
  if (!formRef.value) {
    return;
  }
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  try {
    dialogLoading.value = true;
    const payload = buildPayload();
    if (editingPlatform.value) {
      await updateSupplierPlatformApi(editingPlatform.value.id, payload);
      ElMessage.success('第三方平台已更新');
    } else {
      await addSupplierPlatformApi(payload);
      ElMessage.success('第三方平台已新增');
    }
    dialogVisible.value = false;
    await gridApi.reload();
  } finally {
    dialogLoading.value = false;
  }
}

async function handleDelete(row: SupplierPlatformListItem) {
  await ElMessageBox.confirm(
    `确认删除第三方平台 ${row.name} 吗？`,
    '删除确认',
    {
      type: 'warning',
    },
  );
  await deleteSupplierPlatformApi(row.id);
  ElMessage.success('第三方平台已删除');
  await gridApi.reload();
}

function applyBalanceWarning(row: SupplierPlatformListItem, balance: string) {
  const thresholdAmount = Number(row.threshold_amount);
  const balanceAmount = Number(balance);
  row.balance_warning = Number(
    thresholdAmount > 0 &&
      Number.isFinite(thresholdAmount) &&
      Number.isFinite(balanceAmount) &&
      balanceAmount < thresholdAmount,
  );
}

function applyRefreshResult(
  row: SupplierPlatformListItem,
  result: SupplierPlatformRefreshResult,
) {
  row.last_balance = result.balance;
  row.connect_status = result.connect_status;
  row.connect_status_text = result.connect_status_text;
  row.last_balance_message = result.message;
  row.last_balance_at = result.refreshed_at;
  applyBalanceWarning(row, result.balance);
}

// 余额刷新是一期核心动作，只补当前行状态，避免整表重刷打断筛选和阅读位置。
async function handleRefreshBalance(row: SupplierPlatformListItem) {
  loadingBalanceIds[row.id] = true;
  try {
    const result = await refreshSupplierPlatformBalanceApi(row.id);
    applyRefreshResult(row, result);
    if (result.connect_status === 1) {
      ElMessage.success(result.message);
    } else {
      ElMessage.error(result.message);
    }
  } finally {
    loadingBalanceIds[row.id] = false;
  }
}

function hasTaxText(hasTax: number) {
  return hasTax === 1 ? '含税' : '未税';
}

function connectStatusStyle(status: number) {
  switch (status) {
    case 1: {
      return { color: '#16a34a', fontWeight: '600' };
    }
    case 2: {
      return { color: '#dc2626', fontWeight: '600' };
    }
    default: {
      return { color: '#6b7280' };
    }
  }
}

function balanceStyle(row: SupplierPlatformListItem) {
  if (row.balance_warning === 1) {
    return { color: '#d97706', fontWeight: '600' };
  }
  return {};
}

const [Grid, gridApi] = useVbenVxeGrid<SupplierPlatformListItem>({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: '平台名称',
        componentProps: {
          placeholder: '请输入平台名称',
        },
      },
      {
        component: 'Select',
        fieldName: 'type_id',
        label: '平台类型',
        componentProps: {
          options: buildFilterTypeOptions(),
          placeholder: '请选择平台类型',
        },
      },
      {
        component: 'Select',
        fieldName: 'subject_id',
        label: '主体',
        componentProps: {
          options: buildFilterSubjectOptions(),
          placeholder: '请选择主体',
        },
      },
      {
        component: 'Select',
        fieldName: 'has_tax',
        label: '含税状态',
        componentProps: {
          options: TAX_OPTIONS,
          placeholder: '请选择含税状态',
        },
      },
      {
        component: 'Select',
        fieldName: 'connect_status',
        label: '对接状态',
        componentProps: {
          options: CONNECT_STATUS_OPTIONS,
          placeholder: '请选择对接状态',
        },
      },
    ],
  },
  gridClass: MYJOB_GRID_CLASS,
  gridOptions: {
    columns: [
      { field: 'name', title: '平台名称', minWidth: 200 },
      { field: 'domain', title: '主域名', minWidth: 180 },
      { field: 'backup_domain', title: '备用域名', minWidth: 180 },
      { field: 'type_name', title: '平台类型', minWidth: 140 },
      { field: 'subject_name', title: '主体名称', minWidth: 140 },
      {
        field: 'has_tax',
        minWidth: 110,
        slots: { default: 'hasTax' },
        title: '含税状态',
      },
      {
        field: 'last_balance',
        minWidth: 150,
        slots: { default: 'balance' },
        title: '平台余额',
      },
      { field: 'threshold_amount', title: '余额阈值', minWidth: 140 },
      {
        field: 'connect_status_text',
        minWidth: 120,
        slots: { default: 'connectStatus' },
        title: '对接状态',
      },
      { field: 'last_balance_message', title: '最近结果说明', minWidth: 180 },
      {
        field: 'last_balance_at',
        formatter: ({ cellValue }: { cellValue?: string }) =>
          formatDateTime(cellValue),
        title: '最近刷新时间',
        minWidth: 180,
      },
      { field: 'sort', title: '排序', minWidth: 100 },
      { field: 'crowd_name', title: '群名/备注', minWidth: 160 },
      {
        field: 'actions',
        fixed: 'right',
        minWidth: 220,
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
          const typeID = Number.parseInt(
            String(formValues.type_id ?? '').trim(),
            10,
          );
          const subjectID = Number.parseInt(
            String(formValues.subject_id ?? '').trim(),
            10,
          );
          const hasTax = String(formValues.has_tax ?? '').trim();
          const connectStatus = String(formValues.connect_status ?? '').trim();
          const result = await getSupplierPlatformListApi({
            ...(connectStatus ? { connect_status: connectStatus } : {}),
            ...(hasTax ? { has_tax: hasTax } : {}),
            ...(keyword ? { keyword } : {}),
            page,
            page_size,
            ...(Number.isFinite(subjectID) ? { subject_id: subjectID } : {}),
            ...(Number.isFinite(typeID) ? { type_id: typeID } : {}),
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
  editingPlatform.value ? '编辑第三方平台' : '新增第三方平台',
);
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <Grid>
      <template #toolbar-actions>
        <div v-if="canManage" class="flex gap-3">
          <ElButton type="primary" @click="openCreateDialog">
            新增平台
          </ElButton>
        </div>
      </template>

      <template #hasTax="{ row }">
        <span>{{ hasTaxText(row.has_tax) }}</span>
      </template>

      <template #balance="{ row }">
        <span :style="balanceStyle(row)">
          {{ row.last_balance || '--' }}
        </span>
      </template>

      <template #connectStatus="{ row }">
        <span :style="connectStatusStyle(row.connect_status)">
          {{ row.connect_status_text || '未验证' }}
        </span>
      </template>

      <template #actions="{ row }">
        <div v-if="canManage" class="flex items-center gap-3">
          <ElButton
            :loading="loadingBalanceIds[row.id]"
            link
            type="primary"
            @click="handleRefreshBalance(row)"
          >
            余额查询
          </ElButton>
          <ElButton link type="primary" @click="openEditDialog(row)">
            编辑
          </ElButton>
          <ElButton link type="danger" @click="handleDelete(row)">
            删除
          </ElButton>
        </div>
      </template>
    </Grid>

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
          :rules="[
            { required: true, message: '请选择主体', trigger: 'change' },
          ]"
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
          :rules="[
            { required: true, message: '请输入会员 ID', trigger: 'blur' },
          ]"
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
