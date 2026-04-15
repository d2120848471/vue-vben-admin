<script lang="ts" setup>
import type { GridPageParams } from '../../shared';

import type { SortAction } from '#/api/modules/admin/common';
import type { BrandListItem } from '#/api/modules/admin/products/brands';

import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAppConfig } from '@vben/hooks';
import { createIconifyIcon } from '@vben/icons';
import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElImage,
  ElMessage,
  ElMessageBox,
  ElSwitch,
  ElTag,
  ElTooltip,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteBrandApi,
  getBrandChildrenApi,
  getBrandListApi,
  sortBrandApi,
  toggleBrandVisibilityApi,
} from '#/api/modules/admin/products/brands';

import {
  formatDateTime,
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  resolvePageParams,
  toGridResult,
} from '../../shared';
import {
  buildBrandTree,
  findBrandTreeNode,
  getAvailableBrandSortActions,
  getBrandManageActionVisibility,
  getBrandSortActionItems,
  getBrandTreeDepth,
  getBrandTreeNodePresentation,
  getBrandTreePath,
  mergeBrandChildren,
  resolveProductImageUrl,
} from '../shared';
import BrandDialog from './components/BrandDialog.vue';

const BrandSortTopIcon = createIconifyIcon('lucide:chevrons-up');
const BrandSortUpIcon = createIconifyIcon('lucide:arrow-up');
const BrandSortDownIcon = createIconifyIcon('lucide:arrow-down');
const BrandSortBottomIcon = createIconifyIcon('lucide:chevrons-down');
const BrandCreateIcon = createIconifyIcon('lucide:plus');
const BrandEditIcon = createIconifyIcon('lucide:square-pen');
const BrandDeleteIcon = createIconifyIcon('lucide:trash-2');
const BRAND_SORT_ICON_MAP = {
  bottom: BrandSortBottomIcon,
  down: BrandSortDownIcon,
  top: BrandSortTopIcon,
  up: BrandSortUpIcon,
} as const;

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('product.brand'),
);

const dialogVisible = ref(false);
const editingBrand = ref<BrandListItem | null>(null);
const dialogParentId = ref(0);
const dialogParentName = ref('一级品牌');
const dialogCreateLevelLabel = ref('一级品牌');
const brandRoots = ref<BrandListItem[]>([]);
const childCache = reactive<Record<number, BrandListItem[]>>({});

function resolveParentName(parentId: number) {
  if (parentId === 0) {
    return '一级品牌';
  }
  return (
    findBrandTreeNode(brandRoots.value, parentId)?.name ?? `父品牌 #${parentId}`
  );
}

function syncBrandRoots(items: BrandListItem[]) {
  brandRoots.value = items.map((item) => {
    const cachedChildren = childCache[item.id];
    if (!cachedChildren) {
      return item;
    }
    return {
      ...item,
      children: cachedChildren,
      has_children: cachedChildren.length > 0 || item.has_children,
    };
  });
}

function openCreateRootDialog() {
  editingBrand.value = null;
  dialogParentId.value = 0;
  dialogParentName.value = '一级品牌';
  dialogCreateLevelLabel.value = '一级品牌';
  dialogVisible.value = true;
}

function openCreateChildDialog(row: BrandListItem) {
  editingBrand.value = null;
  dialogParentId.value = row.id;
  dialogParentName.value = row.name;
  dialogCreateLevelLabel.value = getCreateDialogLevelLabel(row.id);
  dialogVisible.value = true;
}

function openEditDialog(row: BrandListItem) {
  editingBrand.value = row;
  dialogParentId.value = row.parent_id;
  dialogParentName.value = resolveParentName(row.parent_id);
  dialogCreateLevelLabel.value = getCreateDialogLevelLabel(row.parent_id);
  dialogVisible.value = true;
}

async function refreshParentBranch(parentId: number) {
  const parentRow = findBrandTreeNode(brandRoots.value, parentId);
  if (!parentRow) {
    await gridApi.reload();
    return;
  }

  const expandPathIds = getBrandTreePath(brandRoots.value, parentId) ?? [
    parentId,
  ];
  const expandedTreeRows =
    (gridApi.grid?.getTreeExpandRecords?.() as BrandListItem[] | undefined) ??
    [];
  const expandedDescendantIds = expandedTreeRows
    .map((row) => row.id)
    .filter((id) => {
      const path = getBrandTreePath(brandRoots.value, id);
      return path ? path.includes(parentId) : false;
    });
  const result = await getBrandChildrenApi(parentId);
  const children = buildBrandTree(result.list ?? []);
  childCache[parentId] = children;
  const nextRoots = mergeBrandChildren(brandRoots.value, parentId, children);
  const expandIds = [
    ...new Set([...expandPathIds, ...expandedDescendantIds]),
  ].toSorted(
    (leftId, rightId) =>
      (getBrandTreeDepth(nextRoots, leftId) ?? 0) -
      (getBrandTreeDepth(nextRoots, rightId) ?? 0),
  );
  brandRoots.value = nextRoots;

  // 子级操作后直接重载当前树数据，避免只更新 lazy children 缓存时出现行引用不同步。
  await (gridApi.grid?.reloadData
    ? gridApi.grid.reloadData(nextRoots)
    : gridApi.reload());

  for (const rowId of expandIds) {
    const currentRow =
      gridApi.grid?.getRowById?.(rowId) ?? findBrandTreeNode(nextRoots, rowId);
    if (!currentRow) {
      continue;
    }
    await gridApi.grid?.setTreeExpand?.(currentRow, true);
  }
}

async function handleDelete(row: BrandListItem) {
  await ElMessageBox.confirm(`确认删除品牌 ${row.name} 吗？`, '删除确认', {
    type: 'warning',
  });
  await deleteBrandApi(row.id);
  ElMessage.success('品牌已删除');

  await (row.parent_id === 0
    ? gridApi.reload()
    : refreshParentBranch(row.parent_id));
}

async function handleSort(row: BrandListItem, action: SortAction) {
  await sortBrandApi(row.id, action);
  ElMessage.success('品牌排序已更新');

  await (row.parent_id === 0
    ? gridApi.reload()
    : refreshParentBranch(row.parent_id));
}

async function handleVisibilityChange(row: BrandListItem, value: boolean) {
  await toggleBrandVisibilityApi(row.id, value ? 1 : 0);
  row.is_visible = value ? 1 : 0;
  ElMessage.success('品牌显示状态已更新');
}

function getSiblingAvailability(row: BrandListItem) {
  const siblings =
    row.parent_id === 0 ? brandRoots.value : (childCache[row.parent_id] ?? []);
  const index = siblings.findIndex((item) => item.id === row.id);
  return getAvailableBrandSortActions(index, siblings.length);
}

function getBrandRowClassName({ row }: { row: BrandListItem }) {
  return row.parent_id === 0
    ? 'myjob-brand-row myjob-brand-row--root'
    : 'myjob-brand-row myjob-brand-row--child';
}

function getTreeNodeMeta(level = 0) {
  return getBrandTreeNodePresentation(level);
}

function getSortActionButtons(row: BrandListItem) {
  return getBrandSortActionItems(getSiblingAvailability(row));
}

function getBrandDepth(row: BrandListItem) {
  if (row.parent_id === 0) {
    return 1;
  }
  return getBrandTreeDepth(brandRoots.value, row.id) ?? 2;
}

function getManageActionState(row: BrandListItem) {
  return getBrandManageActionVisibility(getBrandDepth(row));
}

function getBrandInitial(name: string) {
  return name.trim().slice(0, 1) || '品';
}

function getCreateDialogLevelLabel(parentId: number) {
  if (parentId === 0) {
    return '一级品牌';
  }
  const parentDepth = getBrandTreeDepth(brandRoots.value, parentId) ?? 1;
  return getBrandTreeNodePresentation(parentDepth).levelLabel;
}

function handleDialogVisibleChange(value: boolean) {
  dialogVisible.value = value;
  if (!value) {
    editingBrand.value = null;
    dialogParentId.value = 0;
    dialogParentName.value = '一级品牌';
    dialogCreateLevelLabel.value = '一级品牌';
  }
}

async function handleDialogSaved(parentId: number) {
  await (parentId === 0 ? gridApi.reload() : refreshParentBranch(parentId));
}

const [Grid, gridApi] = useVbenVxeGrid<BrandListItem>({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: '品牌名称',
        componentProps: {
          placeholder: '请输入品牌名称关键词',
        },
      },
    ],
  },
  gridClass: `${MYJOB_GRID_CLASS} myjob-brand-grid`,
  gridOptions: {
    columns: [
      { field: 'id', title: 'ID', width: 80 },
      {
        field: 'name',
        title: '品牌名称',
        minWidth: 420,
        slots: { default: 'name' },
        showOverflow: false,
        treeNode: true,
      },
      { field: 'goods_count', title: '商品数', width: 100 },
      {
        field: 'is_visible',
        title: '显示状态',
        minWidth: 140,
        slots: { default: 'visibility' },
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
        slots: { default: 'sortActions' },
        title: '排序',
        width: 176,
      },
      {
        field: 'manage_actions',
        fixed: 'right',
        slots: { default: 'manageActions' },
        title: '管理',
        width: 142,
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
          const result = await getBrandListApi({
            ...(keyword ? { name: keyword } : {}),
            page,
            page_size,
          });
          const rows = buildBrandTree(result.list ?? []);
          syncBrandRoots(rows);
          return toGridResult(brandRoots.value, result.pagination.total);
        },
      },
    },
    rowClassName: getBrandRowClassName,
    toolbarConfig: {
      refresh: true,
      search: true,
      zoom: true,
    },
    treeConfig: {
      childrenField: 'children',
      hasChildField: 'has_children',
      lazy: true,
      line: true,
      loadMethod: async ({ row }: { row: BrandListItem }) => {
        if (childCache[row.id]) {
          return childCache[row.id];
        }
        const result = await getBrandChildrenApi(row.id);
        const children = buildBrandTree(result.list ?? []);
        childCache[row.id] = children;
        brandRoots.value = mergeBrandChildren(
          brandRoots.value,
          row.id,
          children,
        );
        return children;
      },
      rowField: 'id',
    },
  },
});

function resolveImageUrl(url: string) {
  return resolveProductImageUrl(url, apiURL);
}
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <Grid>
      <template #toolbar-actions>
        <ElButton v-if="canManage" type="primary" @click="openCreateRootDialog">
          新增一级品牌
        </ElButton>
      </template>

      <template #name="{ level = 0, row }">
        <div
          class="brand-tree-cell"
          :class="{
            'brand-tree-cell--nested': !getTreeNodeMeta(level).isRoot,
            'brand-tree-cell--root': getTreeNodeMeta(level).isRoot,
          }"
          :data-brand-depth="getTreeNodeMeta(level).depth"
        >
          <div
            v-if="getTreeNodeMeta(level).isRoot"
            class="brand-tree-cell__thumb"
          >
            <ElImage
              v-if="row.icon"
              :preview-src-list="[resolveImageUrl(row.icon)]"
              :src="resolveImageUrl(row.icon)"
              fit="cover"
              class="brand-tree-cell__thumb-image"
            />
            <span
              v-else
              class="brand-tree-cell__thumb brand-tree-cell__thumb--placeholder"
            >
              {{ getBrandInitial(row.name) }}
            </span>
          </div>
          <div
            class="brand-tree-cell__content"
            :style="{
              '--brand-extra-indent': `${getTreeNodeMeta(level).extraIndentPx}px`,
            }"
          >
            <div
              v-if="!getTreeNodeMeta(level).isRoot"
              class="brand-tree-cell__branch"
              aria-hidden="true"
            >
              <span class="brand-tree-cell__branch-line"></span>
              <span class="brand-tree-cell__branch-node"></span>
            </div>
            <div class="brand-tree-cell__text">
              <div class="brand-tree-cell__header">
                <span class="brand-tree-cell__name">
                  {{ row.name }}
                </span>
                <ElTag
                  size="small"
                  :type="
                    getTreeNodeMeta(level).isRoot
                      ? 'success'
                      : level === 1
                        ? 'warning'
                        : 'info'
                  "
                >
                  {{ getTreeNodeMeta(level).levelLabel }}
                </ElTag>
              </div>
              <p
                v-if="getTreeNodeMeta(level).isRoot && row.description"
                class="brand-tree-cell__description"
              >
                {{ row.description }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <template #visibility="{ row }">
        <ElSwitch
          :disabled="!canManage"
          :model-value="row.is_visible === 1"
          inline-prompt
          active-text="显示"
          inactive-text="隐藏"
          @change="(value) => handleVisibilityChange(row, Boolean(value))"
        />
      </template>

      <template #sortActions="{ row }">
        <div
          v-if="canManage"
          class="brand-action-group brand-action-group--sort"
        >
          <ElTooltip
            v-for="action in getSortActionButtons(row)"
            :key="action.action"
            :content="action.tooltip"
            placement="top"
          >
            <span class="brand-action-button__wrapper">
              <ElButton
                circle
                plain
                class="brand-action-button brand-action-button--sort"
                :class="[{ 'brand-action-button--disabled': action.disabled }]"
                :disabled="action.disabled"
                :title="action.tooltip"
                @click="handleSort(row, action.action)"
              >
                <component
                  :is="BRAND_SORT_ICON_MAP[action.action]"
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
          class="brand-action-group brand-action-group--manage"
        >
          <ElTooltip
            v-if="getManageActionState(row).createChild"
            :content="getManageActionState(row).createChildText"
            placement="top"
          >
            <span class="brand-action-button__wrapper">
              <ElButton
                circle
                plain
                class="brand-action-button brand-action-button--create"
                :title="getManageActionState(row).createChildText"
                @click="openCreateChildDialog(row)"
              >
                <BrandCreateIcon class="size-4" />
              </ElButton>
            </span>
          </ElTooltip>
          <ElTooltip
            v-if="getManageActionState(row).edit"
            content="编辑"
            placement="top"
          >
            <span class="brand-action-button__wrapper">
              <ElButton
                circle
                plain
                class="brand-action-button brand-action-button--edit"
                title="编辑"
                @click="openEditDialog(row)"
              >
                <BrandEditIcon class="size-4" />
              </ElButton>
            </span>
          </ElTooltip>
          <ElTooltip
            v-if="getManageActionState(row).delete"
            content="删除"
            placement="top"
          >
            <span class="brand-action-button__wrapper">
              <ElButton
                circle
                plain
                class="brand-action-button brand-action-button--delete"
                title="删除"
                @click="handleDelete(row)"
              >
                <BrandDeleteIcon class="size-4" />
              </ElButton>
            </span>
          </ElTooltip>
        </div>
      </template>
    </Grid>

    <BrandDialog
      :create-level-label="dialogCreateLevelLabel"
      :editing-brand="editingBrand"
      :parent-id="dialogParentId"
      :parent-name="dialogParentName"
      :visible="dialogVisible"
      @saved="handleDialogSaved"
      @update:visible="handleDialogVisibleChange"
    />
  </Page>
</template>

<style scoped>
.brand-tree-cell {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
  min-height: 54px;
}

.brand-tree-cell__thumb {
  display: flex;
  flex: 0 0 48px;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  overflow: hidden;
  background: rgb(15 23 42 / 48%);
  border-radius: 14px;
  box-shadow: inset 0 0 0 1px rgb(148 163 184 / 18%);
}

.brand-tree-cell__thumb-image {
  width: 100%;
  height: 100%;
}

.brand-tree-cell__thumb--placeholder {
  font-size: 18px;
  font-weight: 700;
  color: rgb(219 234 254 / 92%);
  letter-spacing: 0.08em;
}

.brand-tree-cell__content {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  padding-left: var(--brand-extra-indent, 0);
}

.brand-tree-cell__branch {
  position: relative;
  flex: 0 0 28px;
  height: 36px;
  margin-right: 4px;
}

.brand-tree-cell__branch-line {
  position: absolute;
  top: -8px;
  bottom: -8px;
  left: 11px;
  width: 1px;
  background: rgb(96 165 250 / 28%);
}

.brand-tree-cell__branch-node {
  position: absolute;
  top: 50%;
  left: 11px;
  width: 16px;
  height: 1px;
  background: rgb(96 165 250 / 42%);
  transform: translateY(-50%);
}

.brand-tree-cell__branch-node::after {
  position: absolute;
  top: 50%;
  right: -1px;
  width: 8px;
  height: 8px;
  content: '';
  background: rgb(96 165 250 / 78%);
  border-radius: 9999px;
  box-shadow: 0 0 0 3px rgb(59 130 246 / 14%);
  transform: translateY(-50%);
}

.brand-tree-cell__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.brand-tree-cell__header {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.brand-tree-cell__name {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: 600;
  color: rgb(248 250 252 / 96%);
  white-space: nowrap;
}

.brand-tree-cell--root .brand-tree-cell__name {
  font-size: 15px;
  font-weight: 700;
}

.brand-tree-cell__description {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  line-height: 1.3;
  color: rgb(191 219 254 / 74%);
  white-space: nowrap;
}

.brand-action-group {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.brand-action-button__wrapper {
  display: inline-flex;
}

.brand-action-button {
  color: rgb(148 163 184 / 96%);
}

.brand-action-button--sort {
  color: rgb(96 165 250 / 92%);
}

.brand-action-button--create {
  color: rgb(74 222 128 / 96%);
}

.brand-action-button--edit {
  color: rgb(45 212 191 / 96%);
}

.brand-action-button--delete {
  color: rgb(251 113 133 / 96%);
}

.brand-action-button--disabled {
  color: rgb(100 116 139 / 60%);
}

:deep(.myjob-brand-row--root > .vxe-body--column) {
  background: linear-gradient(
    90deg,
    rgb(15 23 42 / 94%),
    rgb(30 64 175 / 20%) 22%,
    rgb(15 23 42 / 90%)
  );
  border-bottom-color: rgb(96 165 250 / 20%);
}

:deep(.myjob-brand-row--root:hover > .vxe-body--column) {
  background: linear-gradient(
    90deg,
    rgb(15 23 42 / 98%),
    rgb(37 99 235 / 26%) 22%,
    rgb(15 23 42 / 94%)
  );
}

:deep(.myjob-brand-row--child > .vxe-body--column) {
  background: rgb(15 23 42 / 12%);
}

:deep(.myjob-brand-row--child:hover > .vxe-body--column) {
  background: rgb(30 41 59 / 28%);
}
</style>
