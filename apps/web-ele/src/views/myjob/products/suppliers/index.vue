<script lang="ts" setup>
import type { GridPageParams } from '../../shared';

import type {
  SubjectItem,
  SupplierPlatformListItem,
  SupplierPlatformRefreshResult,
  SupplierPlatformTypeItem,
} from '#/api';

import { computed, onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import { ElButton, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteSupplierPlatformApi,
  getSubjectsApi,
  getSupplierPlatformListApi,
  getSupplierPlatformTypesApi,
  refreshSupplierPlatformBalanceApi,
} from '#/api';

import {
  formatDateTime,
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  resolvePageParams,
  toGridResult,
} from '../../shared';
import SupplierPlatformDialog from './components/SupplierPlatformDialog.vue';

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

const dialogVisible = ref(false);
const editingPlatform = ref<null | SupplierPlatformListItem>(null);
const loadingBalanceIds = reactive<Record<number, boolean>>({});
const platformTypeOptions = ref<SupplierPlatformTypeItem[]>([]);
const subjectOptions = ref<SubjectItem[]>([]);

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
  const ready = await ensureReferenceOptionsLoaded();
  if (!ready) {
    return;
  }
  dialogVisible.value = true;
}

async function openEditDialog(row: SupplierPlatformListItem) {
  const ready = await ensureReferenceOptionsLoaded();
  if (!ready) {
    return;
  }
  editingPlatform.value = row;
  dialogVisible.value = true;
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

function handleDialogVisibleChange(value: boolean) {
  dialogVisible.value = value;
  if (!value) {
    editingPlatform.value = null;
  }
}

async function handleDialogSaved() {
  await gridApi.reload();
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

    <SupplierPlatformDialog
      :editing-platform="editingPlatform"
      :platform-type-options="platformTypeOptions"
      :subject-options="subjectOptions"
      :visible="dialogVisible"
      @saved="handleDialogSaved"
      @update:visible="handleDialogVisibleChange"
    />
  </Page>
</template>
