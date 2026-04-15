<script lang="ts" setup>
import type { GridPageParams } from '../../shared';

import type { ProductTemplateListItem } from '#/api';

import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import { ElButton, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeleteProductTemplateApi,
  deleteProductTemplateApi,
  getProductTemplateListApi,
} from '#/api';

import {
  formatDateTime,
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  resolvePageParams,
  toGridResult,
} from '../../shared';
import ProductTemplateDialog from './components/ProductTemplateDialog.vue';

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

const dialogVisible = ref(false);
const editingTemplate = ref<null | ProductTemplateListItem>(null);

async function openCreateDialog() {
  editingTemplate.value = null;
  dialogVisible.value = true;
}

function openEditDialog(row: ProductTemplateListItem) {
  editingTemplate.value = row;
  dialogVisible.value = true;
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

function handleDialogVisibleChange(value: boolean) {
  dialogVisible.value = value;
  if (!value) {
    editingTemplate.value = null;
  }
}

async function handleDialogSaved() {
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

    <ProductTemplateDialog
      :editing-template="editingTemplate"
      :visible="dialogVisible"
      @saved="handleDialogSaved"
      @update:visible="handleDialogVisibleChange"
    />
  </Page>
</template>
