<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type { GridPageParams } from '../../shared';

import type {
  BrandSelectorItem,
  IndustryListItem,
  IndustryPayload,
  IndustryRelationBrandItem,
  SortAction,
} from '#/api';

import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElDialog,
  ElDrawer,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElImage,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElSelect,
  ElTag,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addIndustryApi,
  addIndustryRelationBrandsApi,
  deleteIndustryApi,
  deleteIndustryRelationBrandsApi,
  getBrandSelectorApi,
  getIndustryListApi,
  getIndustryRelationBrandsApi,
  sortIndustryApi,
  sortIndustryRelationBrandApi,
  updateIndustryApi,
} from '#/api';

import {
  formatDateTime,
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  resolvePageParams,
  toGridResult,
} from '../../shared';
import {
  appendIndustrySelectorOptions,
  getAvailableBrandSortActions,
  relationIdsFromItems,
} from '../shared';

interface IndustryDialogState {
  brand_ids: number[];
  name: string;
}

const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('product.industry'),
);

const formRef = ref<FormInstance>();
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const editingIndustry = ref<IndustryListItem | null>(null);
const industryRows = ref<IndustryListItem[]>([]);
const selectorOptions = ref<BrandSelectorItem[]>([]);

const relationDrawerVisible = ref(false);
const relationDrawerLoading = ref(false);
const relationSubmitting = ref(false);
const activeIndustry = ref<IndustryListItem | null>(null);
const relationRows = ref<IndustryRelationBrandItem[]>([]);
const relationKeyword = ref('');
const relationSelectorOptions = ref<BrandSelectorItem[]>([]);
const pendingRelationBrandIds = ref<number[]>([]);

const dialogForm = reactive<IndustryDialogState>({
  brand_ids: [],
  name: '',
});

// 行业编辑依赖异步拉取关联品牌，先清空上一次状态才能避免失败时串数据。
function resetEditDialogState() {
  resetDialogForm();
  selectorOptions.value = [];
  dialogVisible.value = false;
}

function resetDialogForm() {
  dialogForm.brand_ids = [];
  dialogForm.name = '';
}

function mapRelationItemsToOptions(items: IndustryRelationBrandItem[]) {
  return items.map((item) => ({
    icon: item.brand_icon,
    id: item.brand_id,
    name: item.brand_name,
  }));
}

async function loadSelectorOptions(
  keyword = '',
  preserved: BrandSelectorItem[] = [],
) {
  const result = await getBrandSelectorApi(keyword ? { name: keyword } : {});
  selectorOptions.value = appendIndustrySelectorOptions(
    preserved,
    result.list ?? [],
  );
}

async function loadRelationSelectorOptions(keyword = '') {
  const preserved = appendIndustrySelectorOptions(
    relationSelectorOptions.value.filter((item) =>
      pendingRelationBrandIds.value.includes(item.id),
    ),
    mapRelationItemsToOptions(relationRows.value),
  );
  const result = await getBrandSelectorApi(keyword ? { name: keyword } : {});
  relationSelectorOptions.value = appendIndustrySelectorOptions(
    preserved,
    result.list ?? [],
  );
}

function openCreateDialog() {
  editingIndustry.value = null;
  resetEditDialogState();
  dialogVisible.value = true;
  void loadSelectorOptions();
}

async function openEditDialog(row: IndustryListItem) {
  editingIndustry.value = row;
  resetEditDialogState();
  dialogForm.name = row.name;
  dialogLoading.value = true;
  try {
    const result = await getIndustryRelationBrandsApi(row.id);
    dialogForm.brand_ids = relationIdsFromItems(result.list ?? []);
    await loadSelectorOptions('', mapRelationItemsToOptions(result.list ?? []));
    dialogVisible.value = true;
  } finally {
    dialogLoading.value = false;
  }
}

async function submitDialog() {
  if (!formRef.value) {
    return;
  }
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  const payload: IndustryPayload = {
    brand_ids: [...dialogForm.brand_ids],
    name: dialogForm.name.trim(),
  };

  try {
    dialogLoading.value = true;
    if (editingIndustry.value) {
      await updateIndustryApi(editingIndustry.value.id, payload);
      ElMessage.success('行业已更新');
    } else {
      await addIndustryApi(payload);
      ElMessage.success('行业已新增');
    }
    dialogVisible.value = false;
    await gridApi.reload();
  } finally {
    dialogLoading.value = false;
  }
}

async function loadRelationRows(keyword = '') {
  if (!activeIndustry.value) {
    relationRows.value = [];
    return;
  }
  const result = await getIndustryRelationBrandsApi(
    activeIndustry.value.id,
    keyword ? { name: keyword } : {},
  );
  relationRows.value = result.list ?? [];
  relationSelectorOptions.value = appendIndustrySelectorOptions(
    mapRelationItemsToOptions(relationRows.value),
    relationSelectorOptions.value,
  );
}

// 关联抽屉也要先把旧行业的列表和待选项清掉，避免请求失败时仍操作旧数据。
function resetRelationDrawerState() {
  relationKeyword.value = '';
  pendingRelationBrandIds.value = [];
  relationRows.value = [];
  relationSelectorOptions.value = [];
  relationDrawerVisible.value = false;
}

async function openRelationDrawer(row: IndustryListItem) {
  activeIndustry.value = row;
  resetRelationDrawerState();
  relationDrawerLoading.value = true;
  try {
    await loadRelationRows();
    await loadRelationSelectorOptions();
    relationDrawerVisible.value = true;
  } finally {
    relationDrawerLoading.value = false;
  }
}

async function handleAddRelations() {
  if (!activeIndustry.value) {
    return;
  }
  if (pendingRelationBrandIds.value.length === 0) {
    ElMessage.warning('请先选择品牌');
    return;
  }

  try {
    relationSubmitting.value = true;
    await addIndustryRelationBrandsApi(
      activeIndustry.value.id,
      pendingRelationBrandIds.value,
    );
    pendingRelationBrandIds.value = [];
    await loadRelationRows(relationKeyword.value.trim());
    await loadRelationSelectorOptions();
    await gridApi.reload();
    ElMessage.success('行业品牌关联已更新');
  } finally {
    relationSubmitting.value = false;
  }
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

async function handleDeleteRelation(row: IndustryRelationBrandItem) {
  if (!activeIndustry.value) {
    return;
  }
  await ElMessageBox.confirm(
    `确认移除行业下的品牌 ${row.brand_name} 吗？`,
    '移除确认',
    { type: 'warning' },
  );
  await deleteIndustryRelationBrandsApi(activeIndustry.value.id, [
    row.brand_id,
  ]);
  ElMessage.success('品牌关联已移除');
  await loadRelationRows(relationKeyword.value.trim());
  await loadRelationSelectorOptions();
  await gridApi.reload();
}

async function handleSortRelation(
  row: IndustryRelationBrandItem,
  action: SortAction,
) {
  if (!activeIndustry.value) {
    return;
  }
  await sortIndustryRelationBrandApi(
    activeIndustry.value.id,
    row.brand_id,
    action,
  );
  ElMessage.success('行业内品牌排序已更新');
  await loadRelationRows(relationKeyword.value.trim());
}

function getIndustrySortState(row: IndustryListItem) {
  const index = industryRows.value.findIndex((item) => item.id === row.id);
  return getAvailableBrandSortActions(index, industryRows.value.length);
}

function getRelationSortState(row: IndustryRelationBrandItem) {
  const index = relationRows.value.findIndex(
    (item) => item.brand_id === row.brand_id,
  );
  return getAvailableBrandSortActions(index, relationRows.value.length);
}

const availableRelationOptions = computed(() => {
  const relationIds = new Set(relationIdsFromItems(relationRows.value));
  return relationSelectorOptions.value.filter(
    (item) =>
      !relationIds.has(item.id) ||
      pendingRelationBrandIds.value.includes(item.id),
  );
});

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
        field: 'actions',
        fixed: 'right',
        minWidth: 420,
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

const dialogTitle = computed(() =>
  editingIndustry.value ? '编辑行业' : '新增行业',
);
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

      <template #actions="{ row }">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <ElButton
            v-if="canManage"
            link
            type="primary"
            @click="openEditDialog(row)"
          >
            编辑
          </ElButton>
          <ElButton
            v-if="canManage"
            link
            type="warning"
            @click="openRelationDrawer(row)"
          >
            关联品牌
          </ElButton>
          <ElButton
            v-if="canManage"
            link
            type="primary"
            :disabled="!getIndustrySortState(row).top"
            @click="handleSortIndustry(row, 'top')"
          >
            置顶
          </ElButton>
          <ElButton
            v-if="canManage"
            link
            type="primary"
            :disabled="!getIndustrySortState(row).up"
            @click="handleSortIndustry(row, 'up')"
          >
            上移
          </ElButton>
          <ElButton
            v-if="canManage"
            link
            type="primary"
            :disabled="!getIndustrySortState(row).down"
            @click="handleSortIndustry(row, 'down')"
          >
            下移
          </ElButton>
          <ElButton
            v-if="canManage"
            link
            type="primary"
            :disabled="!getIndustrySortState(row).bottom"
            @click="handleSortIndustry(row, 'bottom')"
          >
            置底
          </ElButton>
          <ElButton
            v-if="canManage"
            link
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </ElButton>
        </div>
      </template>
    </Grid>

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="640px">
      <ElForm ref="formRef" :model="dialogForm" label-width="96px">
        <ElFormItem
          label="行业名称"
          prop="name"
          :rules="[
            { required: true, message: '请输入行业名称', trigger: 'blur' },
          ]"
        >
          <ElInput v-model="dialogForm.name" placeholder="请输入行业名称" />
        </ElFormItem>
        <ElFormItem label="初始品牌">
          <ElSelect
            v-model="dialogForm.brand_ids"
            class="w-full"
            collapse-tags
            collapse-tags-tooltip
            filterable
            multiple
            remote
            reserve-keyword
            placeholder="可直接选择一批初始品牌"
            :remote-method="
              (keyword: string) => loadSelectorOptions(keyword, selectorOptions)
            "
          >
            <el-option
              v-for="item in selectorOptions"
              :key="item.id"
              :label="item.name"
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
            保存
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDrawer
      v-model="relationDrawerVisible"
      :title="
        activeIndustry
          ? `${activeIndustry.name} - 关联品牌管理`
          : '关联品牌管理'
      "
      size="640px"
    >
      <div class="flex flex-col gap-4" v-loading="relationDrawerLoading">
        <div class="rounded-lg border border-border p-4">
          <div class="mb-3 text-sm font-medium">批量新增品牌关联</div>
          <div class="flex flex-col gap-3 md:flex-row">
            <ElSelect
              v-model="pendingRelationBrandIds"
              class="w-full"
              collapse-tags
              collapse-tags-tooltip
              filterable
              multiple
              remote
              reserve-keyword
              placeholder="搜索可关联的一级品牌"
              :remote-method="loadRelationSelectorOptions"
            >
              <el-option
                v-for="item in availableRelationOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </ElSelect>
            <ElButton
              :loading="relationSubmitting"
              type="primary"
              @click="handleAddRelations"
            >
              添加关联
            </ElButton>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <ElInput
            v-model="relationKeyword"
            placeholder="搜索已关联品牌名称"
            @keyup.enter="loadRelationRows(relationKeyword.trim())"
          />
          <ElButton @click="loadRelationRows(relationKeyword.trim())">
            搜索
          </ElButton>
        </div>

        <div
          v-if="relationRows.length === 0"
          class="rounded-lg border border-dashed border-border py-8"
        >
          <ElEmpty description="当前行业暂无品牌关联" />
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in relationRows"
            :key="item.brand_id"
            class="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
          >
            <div class="flex items-center gap-3">
              <ElImage
                v-if="item.brand_icon"
                :preview-src-list="[item.brand_icon]"
                :src="item.brand_icon"
                fit="cover"
                class="h-12 w-12 rounded-md"
              />
              <div
                v-else
                class="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-xs text-text-secondary"
              >
                无图标
              </div>
              <div>
                <div class="font-medium text-foreground">
                  {{ item.brand_name }}
                </div>
                <div class="text-xs text-text-secondary">
                  品牌 ID：{{ item.brand_id }}
                </div>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <ElButton
                link
                type="primary"
                :disabled="!getRelationSortState(item).top"
                @click="handleSortRelation(item, 'top')"
              >
                置顶
              </ElButton>
              <ElButton
                link
                type="primary"
                :disabled="!getRelationSortState(item).up"
                @click="handleSortRelation(item, 'up')"
              >
                上移
              </ElButton>
              <ElButton
                link
                type="primary"
                :disabled="!getRelationSortState(item).down"
                @click="handleSortRelation(item, 'down')"
              >
                下移
              </ElButton>
              <ElButton
                link
                type="primary"
                :disabled="!getRelationSortState(item).bottom"
                @click="handleSortRelation(item, 'bottom')"
              >
                置底
              </ElButton>
              <ElButton link type="danger" @click="handleDeleteRelation(item)">
                移除
              </ElButton>
            </div>
          </div>
        </div>
      </div>
    </ElDrawer>
  </Page>
</template>
