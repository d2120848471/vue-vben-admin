<script lang="ts" setup>
import type { GridPageParams } from '../../shared';

import type { IndustryListItem, SortAction } from '#/api';

import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';
import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElMessage,
  ElMessageBox,
  ElTag,
  ElTooltip,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteIndustryApi, getIndustryListApi, sortIndustryApi } from '#/api';

import {
  formatDateTime,
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  resolvePageParams,
  toGridResult,
} from '../../shared';
import {
  getAvailableBrandSortActions,
  getBrandSortActionItems,
} from '../shared';
import IndustryDialog from './components/IndustryDialog.vue';
import IndustryRelationDrawer from './components/IndustryRelationDrawer.vue';

const IndustrySortTopIcon = createIconifyIcon('lucide:chevrons-up');
const IndustrySortUpIcon = createIconifyIcon('lucide:arrow-up');
const IndustrySortDownIcon = createIconifyIcon('lucide:arrow-down');
const IndustrySortBottomIcon = createIconifyIcon('lucide:chevrons-down');
const IndustryEditIcon = createIconifyIcon('lucide:square-pen');
const IndustryRelationIcon = createIconifyIcon('lucide:link-2');
const IndustryDeleteIcon = createIconifyIcon('lucide:trash-2');
const INDUSTRY_SORT_ICON_MAP = {
  bottom: IndustrySortBottomIcon,
  down: IndustrySortDownIcon,
  top: IndustrySortTopIcon,
  up: IndustrySortUpIcon,
} as const;

const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('product.industry'),
);

const dialogVisible = ref(false);
const editingIndustry = ref<IndustryListItem | null>(null);
const industryRows = ref<IndustryListItem[]>([]);

const relationDrawerVisible = ref(false);
const activeIndustry = ref<IndustryListItem | null>(null);

function openCreateDialog() {
  editingIndustry.value = null;
  dialogVisible.value = true;
}

function openEditDialog(row: IndustryListItem) {
  editingIndustry.value = row;
  dialogVisible.value = true;
}

function openRelationDrawer(row: IndustryListItem) {
  activeIndustry.value = row;
  relationDrawerVisible.value = true;
}

async function handleDelete(row: IndustryListItem) {
  await ElMessageBox.confirm(`确认删除行业 ${row.name} 吗？`, '删除确认', {
    type: 'warning',
  });
  await deleteIndustryApi(row.id);
  ElMessage.success('行业已删除');
  await gridApi.reload();
}

async function handleSortIndustry(row: IndustryListItem, action: SortAction) {
  await sortIndustryApi(row.id, action);
  ElMessage.success('行业排序已更新');
  await gridApi.reload();
}

function getIndustrySortState(row: IndustryListItem) {
  const index = industryRows.value.findIndex((item) => item.id === row.id);
  return getAvailableBrandSortActions(index, industryRows.value.length);
}

function getIndustrySortButtons(row: IndustryListItem) {
  return getBrandSortActionItems(getIndustrySortState(row));
}

function handleDialogVisibleChange(value: boolean) {
  dialogVisible.value = value;
  if (!value) {
    editingIndustry.value = null;
  }
}

function handleDrawerVisibleChange(value: boolean) {
  relationDrawerVisible.value = value;
  if (!value) {
    activeIndustry.value = null;
  }
}

async function handleDialogSaved() {
  await gridApi.reload();
}

async function handleRelationSaved() {
  await gridApi.reload();
}

const [Grid, gridApi] = useVbenVxeGrid<IndustryListItem>({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: '行业名称',
        componentProps: {
          placeholder: '请输入行业名称关键词',
        },
      },
    ],
  },
  gridClass: MYJOB_GRID_CLASS,
  gridOptions: {
    columns: [
      { field: 'id', title: 'ID', width: 80 },
      { field: 'name', title: '行业名称', minWidth: 220 },
      {
        field: 'brand_count',
        title: '关联品牌数',
        minWidth: 120,
        slots: { default: 'brandCount' },
      },
      {
        field: 'updated_at',
        formatter: ({ cellValue }: { cellValue?: string }) =>
          formatDateTime(cellValue),
        title: '更新时间',
        minWidth: 180,
      },
      {
        field: 'sort_actions',
        fixed: 'right',
        minWidth: 160,
        slots: { default: 'sortActions' },
        title: '排序',
      },
      {
        field: 'manage_actions',
        fixed: 'right',
        minWidth: 180,
        slots: { default: 'manageActions' },
        title: '管理',
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
          const result = await getIndustryListApi({
            ...(keyword ? { name: keyword } : {}),
            page,
            page_size,
          });
          industryRows.value = result.list ?? [];
          return toGridResult(industryRows.value, result.pagination.total);
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
        <ElButton v-if="canManage" type="primary" @click="openCreateDialog">
          新增行业
        </ElButton>
      </template>

      <template #brandCount="{ row }">
        <ElTag :type="row.brand_count > 0 ? 'success' : 'info'">
          {{ row.brand_count }} 个品牌
        </ElTag>
      </template>

      <template #sortActions="{ row }">
        <div
          v-if="canManage"
          class="industry-action-group industry-action-group--sort"
        >
          <ElTooltip
            v-for="action in getIndustrySortButtons(row)"
            :key="action.action"
            :content="action.tooltip"
            placement="top"
          >
            <span class="industry-action-button__wrapper">
              <ElButton
                circle
                plain
                class="industry-action-button industry-action-button--sort"
                :class="{ 'industry-action-button--disabled': action.disabled }"
                :disabled="action.disabled"
                :title="action.tooltip"
                @click="handleSortIndustry(row, action.action)"
              >
                <component
                  :is="INDUSTRY_SORT_ICON_MAP[action.action]"
                  class="size-4"
                />
              </ElButton>
            </span>
          </ElTooltip>
        </div>
      </template>

      <template #manageActions="{ row }">
        <div
          v-if="canManage"
          class="industry-action-group industry-action-group--manage"
        >
          <ElTooltip content="编辑" placement="top">
            <span class="industry-action-button__wrapper">
              <ElButton
                circle
                plain
                class="industry-action-button industry-action-button--edit"
                title="编辑"
                @click="openEditDialog(row)"
              >
                <IndustryEditIcon class="size-4" />
              </ElButton>
            </span>
          </ElTooltip>
          <ElTooltip content="关联品牌" placement="top">
            <span class="industry-action-button__wrapper">
              <ElButton
                circle
                plain
                class="industry-action-button industry-action-button--relation"
                title="关联品牌"
                @click="openRelationDrawer(row)"
              >
                <IndustryRelationIcon class="size-4" />
              </ElButton>
            </span>
          </ElTooltip>
          <ElTooltip content="删除" placement="top">
            <span class="industry-action-button__wrapper">
              <ElButton
                circle
                plain
                class="industry-action-button industry-action-button--delete"
                title="删除"
                @click="handleDelete(row)"
              >
                <IndustryDeleteIcon class="size-4" />
              </ElButton>
            </span>
          </ElTooltip>
        </div>
      </template>
    </Grid>

    <IndustryDialog
      :editing-industry="editingIndustry"
      :visible="dialogVisible"
      @saved="handleDialogSaved"
      @update:visible="handleDialogVisibleChange"
    />

    <IndustryRelationDrawer
      :active-industry="activeIndustry"
      :visible="relationDrawerVisible"
      @saved="handleRelationSaved"
      @update:visible="handleDrawerVisibleChange"
    />
  </Page>
</template>

<style scoped>
.industry-action-group {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.industry-action-button__wrapper {
  display: inline-flex;
}

.industry-action-button {
  color: rgb(148 163 184 / 96%);
}

.industry-action-button--sort {
  color: rgb(96 165 250 / 92%);
}

.industry-action-button--edit {
  color: rgb(45 212 191 / 96%);
}

.industry-action-button--relation {
  color: rgb(250 204 21 / 96%);
}

.industry-action-button--delete {
  color: rgb(251 113 133 / 96%);
}

.industry-action-button--disabled {
  color: rgb(100 116 139 / 60%);
}
</style>
