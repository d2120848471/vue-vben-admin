<script lang="ts" setup>
import type { GridPageParams } from '../../shared';

import type {
  SupplierPlatformListItem,
  SupplierPlatformRefreshResult,
  SupplierPlatformTypeItem,
} from '#/api/modules/admin/products/suppliers';
import type { SubjectItem } from '#/api/modules/admin/subjects';

import { computed, onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import { ElButton, ElMessage, ElMessageBox, ElSwitch } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteSupplierPlatformApi,
  getSupplierPlatformDetailApi,
  getSupplierPlatformListApi,
  getSupplierPlatformTypesApi,
  refreshSupplierPlatformBalanceApi,
  updateSupplierPlatformApi,
} from '#/api/modules/admin/products/suppliers';
import { getSubjectsApi } from '#/api/modules/admin/subjects';

import {
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  toGridResult,
} from '../../shared';
import SupplierPlatformDialog from './components/SupplierPlatformDialog.vue';
import {
  buildSupplierPlatformListQuery,
  buildSupplierPlatformStatusPayload,
} from './mappers';
import {
  buildSupplierPlatformColumns,
  buildSupplierPlatformFilterOptions,
  buildSupplierPlatformFilterSchema,
} from './schemas';

const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('supplier.index'),
);

const dialogVisible = ref(false);
const editingPlatform = ref<null | SupplierPlatformListItem>(null);
const loadingBalanceIds = reactive<Record<number, boolean>>({});
const loadingStatusIds = reactive<Record<number, boolean>>({});
const platformTypeOptions = ref<SupplierPlatformTypeItem[]>([]);
const subjectOptions = ref<SubjectItem[]>([]);

function syncFilterOptions() {
  if (!gridApi.formApi?.updateSchema) {
    return;
  }
  const filterOptions = buildSupplierPlatformFilterOptions({
    platformTypeOptions: platformTypeOptions.value,
    subjectOptions: subjectOptions.value,
  });
  gridApi.formApi.updateSchema([
    {
      componentProps: {
        options: filterOptions.typeOptions,
        placeholder: '请选择平台类型',
      },
      fieldName: 'type_id',
    },
    {
      componentProps: {
        options: filterOptions.subjectOptions,
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

// 列表返回不带密钥和会员 ID，状态切换前先补详情，避免误把敏感字段清空。
async function handleStatusChange(
  row: SupplierPlatformListItem,
  nextStatus: number | string,
) {
  const normalizedStatus = Number(nextStatus);
  loadingStatusIds[row.id] = true;
  try {
    const detail = await getSupplierPlatformDetailApi(row.id);
    const payload = buildSupplierPlatformStatusPayload(
      detail,
      normalizedStatus,
    );
    await updateSupplierPlatformApi(row.id, payload);
    ElMessage.success(normalizedStatus === 1 ? '平台已启用' : '平台已停用');
    await gridApi.reload();
  } catch {
    ElMessage.error('平台状态更新失败，请稍后重试');
  } finally {
    loadingStatusIds[row.id] = false;
  }
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
    schema: buildSupplierPlatformFilterSchema({
      platformTypeOptions: platformTypeOptions.value,
      subjectOptions: subjectOptions.value,
    }),
  },
  gridClass: MYJOB_GRID_CLASS,
  gridOptions: {
    columns: buildSupplierPlatformColumns(),
    pagerConfig: {},
    proxyConfig: {
      ajax: {
        query: async (
          params: GridPageParams,
          formValues: Record<string, any>,
        ) => {
          const result = await getSupplierPlatformListApi(
            buildSupplierPlatformListQuery(params, formValues),
          );
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

      <template #status="{ row }">
        <ElSwitch
          v-if="canManage"
          :active-value="1"
          :inactive-value="0"
          :loading="loadingStatusIds[row.id]"
          :model-value="row.status"
          active-text="启用"
          inactive-text="停用"
          inline-prompt
          @change="(value) => handleStatusChange(row, Number(value))"
        />
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
