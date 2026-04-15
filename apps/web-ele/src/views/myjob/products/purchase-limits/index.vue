<script lang="ts" setup>
import type { GridPageParams } from '../../shared';

import type { PurchaseLimitStrategyListItem } from '#/api';

import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import { ElButton, ElMessage, ElMessageBox, ElSwitch } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deletePurchaseLimitStrategyApi,
  getPurchaseLimitStrategyListApi,
  updatePurchaseLimitStrategyStatusApi,
} from '#/api';

import {
  formatDateTime,
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  resolvePageParams,
  toGridResult,
} from '../../shared';
import PurchaseLimitDialog from './components/PurchaseLimitDialog.vue';

const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('product.purchase_limit'),
);

const dialogVisible = ref(false);
const editingStrategy = ref<null | PurchaseLimitStrategyListItem>(null);
const loadingStatusIds = reactive<Record<number, boolean>>({});

async function openCreateDialog() {
  editingStrategy.value = null;
  dialogVisible.value = true;
}

function openEditDialog(row: PurchaseLimitStrategyListItem) {
  editingStrategy.value = row;
  dialogVisible.value = true;
}

async function handleDelete(row: PurchaseLimitStrategyListItem) {
  await ElMessageBox.confirm(`确认删除策略 ${row.name} 吗？`, '删除确认', {
    type: 'warning',
  });
  await deletePurchaseLimitStrategyApi(row.id);
  ElMessage.success('限制策略已删除');
  await gridApi.reload();
}

// 状态切换只走独立接口，避免编辑弹窗提交时误改启停状态。
async function handleStatusChange(
  row: PurchaseLimitStrategyListItem,
  nextStatus: number | string,
) {
  const normalizedStatus = Number(nextStatus);
  loadingStatusIds[row.id] = true;
  try {
    await updatePurchaseLimitStrategyStatusApi(row.id, normalizedStatus);
    ElMessage.success(
      normalizedStatus === 1 ? '限制策略已启用' : '限制策略已禁用',
    );
    await gridApi.reload();
  } finally {
    loadingStatusIds[row.id] = false;
  }
}

function handleDialogVisibleChange(value: boolean) {
  dialogVisible.value = value;
  if (!value) {
    editingStrategy.value = null;
  }
}

async function handleDialogSaved() {
  await gridApi.reload();
}

const [Grid, gridApi] = useVbenVxeGrid<PurchaseLimitStrategyListItem>({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: '策略名称',
        componentProps: {
          placeholder: '请输入策略名称',
        },
      },
    ],
  },
  gridClass: MYJOB_GRID_CLASS,
  gridOptions: {
    columns: [
      { field: 'id', title: 'ID', minWidth: 90 },
      { field: 'name', title: '策略名称', minWidth: 180 },
      { field: 'limit_type_label', title: '限制类型', minWidth: 160 },
      { field: 'period_type_label', title: '周期类型', minWidth: 160 },
      { field: 'period', title: '周期', minWidth: 100 },
      { field: 'limit_nums', title: '限制数量', minWidth: 120 },
      { field: 'limit_times', title: '限制笔数', minWidth: 120 },
      {
        field: 'status',
        minWidth: 140,
        slots: { default: 'status' },
        title: '状态',
      },
      {
        field: 'created_at',
        formatter: ({ cellValue }: { cellValue?: string }) =>
          formatDateTime(cellValue),
        title: '创建时间',
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
          const result = await getPurchaseLimitStrategyListApi({
            ...(keyword ? { keyword } : {}),
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
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <Grid>
      <template #toolbar-actions>
        <div v-if="canManage" class="flex gap-3">
          <ElButton type="primary" @click="openCreateDialog">新增策略</ElButton>
        </div>
      </template>

      <template #status="{ row }">
        <ElSwitch
          v-if="canManage"
          :active-value="1"
          :inactive-value="0"
          :loading="loadingStatusIds[row.id]"
          :model-value="row.status"
          inline-prompt
          @change="(value) => handleStatusChange(row, Number(value))"
        />
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

    <PurchaseLimitDialog
      :editing-strategy="editingStrategy"
      :visible="dialogVisible"
      @saved="handleDialogSaved"
      @update:visible="handleDialogVisibleChange"
    />
  </Page>
</template>
