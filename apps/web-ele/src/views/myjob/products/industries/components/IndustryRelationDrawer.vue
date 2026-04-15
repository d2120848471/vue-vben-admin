<script lang="ts" setup>
import type { SortAction } from '#/api/modules/admin/common';
import type { BrandSelectorItem } from '#/api/modules/admin/products/brands';
import type {
  IndustryListItem,
  IndustryRelationBrandItem,
} from '#/api/modules/admin/products/industries';

import { computed, ref, watch } from 'vue';

import { useAppConfig } from '@vben/hooks';
import { createIconifyIcon } from '@vben/icons';

import {
  ElButton,
  ElDrawer,
  ElEmpty,
  ElImage,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
  ElTooltip,
} from 'element-plus';

import {
  addIndustryRelationBrandsApi,
  deleteIndustryRelationBrandsApi,
  getBrandSelectorApi,
  getIndustryRelationBrandsApi,
  sortIndustryRelationBrandApi,
} from '#/api/modules/admin/products/industries';

import {
  appendIndustrySelectorOptions,
  getAvailableBrandSortActions,
  getBrandSortActionItems,
  relationIdsFromItems,
  resolveProductImageUrl,
} from '../../shared';

const props = defineProps<{
  activeIndustry: IndustryListItem | null;
  visible: boolean;
}>();
const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();
const IndustrySortTopIcon = createIconifyIcon('lucide:chevrons-up');
const IndustrySortUpIcon = createIconifyIcon('lucide:arrow-up');
const IndustrySortDownIcon = createIconifyIcon('lucide:arrow-down');
const IndustrySortBottomIcon = createIconifyIcon('lucide:chevrons-down');
const IndustryDeleteIcon = createIconifyIcon('lucide:trash-2');
const INDUSTRY_SORT_ICON_MAP = {
  bottom: IndustrySortBottomIcon,
  down: IndustrySortDownIcon,
  top: IndustrySortTopIcon,
  up: IndustrySortUpIcon,
} as const;

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
const relationDrawerLoading = ref(false);
const relationSubmitting = ref(false);
const relationRows = ref<IndustryRelationBrandItem[]>([]);
const relationKeyword = ref('');
const relationSelectorOptions = ref<BrandSelectorItem[]>([]);
const pendingRelationBrandIds = ref<number[]>([]);

const drawerVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const drawerTitle = computed(() =>
  props.activeIndustry
    ? `${props.activeIndustry.name} - 关联品牌管理`
    : '关联品牌管理',
);

function mapRelationItemsToOptions(items: IndustryRelationBrandItem[]) {
  return items.map((item) => ({
    icon: item.brand_icon,
    id: item.brand_id,
    name: item.brand_name,
  }));
}

async function loadRelationRows(keyword = '') {
  if (!props.activeIndustry) {
    relationRows.value = [];
    return;
  }
  const result = await getIndustryRelationBrandsApi(
    props.activeIndustry.id,
    keyword ? { name: keyword } : {},
  );
  relationRows.value = result.list ?? [];
  relationSelectorOptions.value = appendIndustrySelectorOptions(
    mapRelationItemsToOptions(relationRows.value),
    relationSelectorOptions.value,
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

function resetDrawerState() {
  relationKeyword.value = '';
  pendingRelationBrandIds.value = [];
  relationRows.value = [];
  relationSelectorOptions.value = [];
}

async function initializeDrawer() {
  resetDrawerState();
  await loadRelationRows();
  await loadRelationSelectorOptions();
}

async function handleAddRelations() {
  if (!props.activeIndustry) {
    return;
  }
  if (pendingRelationBrandIds.value.length === 0) {
    ElMessage.warning('请先选择品牌');
    return;
  }

  try {
    relationSubmitting.value = true;
    await addIndustryRelationBrandsApi(
      props.activeIndustry.id,
      pendingRelationBrandIds.value,
    );
    pendingRelationBrandIds.value = [];
    await loadRelationRows(relationKeyword.value.trim());
    await loadRelationSelectorOptions();
    emit('saved');
    ElMessage.success('行业品牌关联已更新');
  } finally {
    relationSubmitting.value = false;
  }
}

async function handleDeleteRelation(row: IndustryRelationBrandItem) {
  if (!props.activeIndustry) {
    return;
  }
  await ElMessageBox.confirm(
    `确认移除行业下的品牌 ${row.brand_name} 吗？`,
    '移除确认',
    { type: 'warning' },
  );
  await deleteIndustryRelationBrandsApi(props.activeIndustry.id, [
    row.brand_id,
  ]);
  ElMessage.success('品牌关联已移除');
  await loadRelationRows(relationKeyword.value.trim());
  await loadRelationSelectorOptions();
  emit('saved');
}

async function handleSortRelation(
  row: IndustryRelationBrandItem,
  action: SortAction,
) {
  if (!props.activeIndustry) {
    return;
  }
  await sortIndustryRelationBrandApi(
    props.activeIndustry.id,
    row.brand_id,
    action,
  );
  ElMessage.success('行业内品牌排序已更新');
  await loadRelationRows(relationKeyword.value.trim());
}

function getRelationSortState(row: IndustryRelationBrandItem) {
  const index = relationRows.value.findIndex(
    (item) => item.brand_id === row.brand_id,
  );
  return getAvailableBrandSortActions(index, relationRows.value.length);
}

function getRelationSortButtons(row: IndustryRelationBrandItem) {
  return getBrandSortActionItems(getRelationSortState(row));
}

const availableRelationOptions = computed(() => {
  const relationIds = new Set(relationIdsFromItems(relationRows.value));
  return relationSelectorOptions.value.filter(
    (item) =>
      !relationIds.has(item.id) ||
      pendingRelationBrandIds.value.includes(item.id),
  );
});

function resolveImageUrl(url: string) {
  return resolveProductImageUrl(url, apiURL);
}

watch(
  () => [props.visible, props.activeIndustry?.id] as const,
  async ([visible]) => {
    if (!visible) {
      resetDrawerState();
      relationDrawerLoading.value = false;
      relationSubmitting.value = false;
      return;
    }
    relationDrawerLoading.value = true;
    try {
      await initializeDrawer();
    } catch {
      resetDrawerState();
      emit('update:visible', false);
    } finally {
      relationDrawerLoading.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <ElDrawer v-model="drawerVisible" :title="drawerTitle" size="640px">
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
            <ElOption
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
              :preview-src-list="[resolveImageUrl(item.brand_icon)]"
              :src="resolveImageUrl(item.brand_icon)"
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
          <div class="flex flex-wrap items-center gap-3">
            <div class="industry-action-group industry-action-group--sort">
              <ElTooltip
                v-for="action in getRelationSortButtons(item)"
                :key="action.action"
                :content="action.tooltip"
                placement="top"
              >
                <span class="industry-action-button__wrapper">
                  <ElButton
                    circle
                    plain
                    class="industry-action-button industry-action-button--sort"
                    :class="{
                      'industry-action-button--disabled': action.disabled,
                    }"
                    :disabled="action.disabled"
                    :title="action.tooltip"
                    @click="handleSortRelation(item, action.action)"
                  >
                    <component
                      :is="INDUSTRY_SORT_ICON_MAP[action.action]"
                      class="size-4"
                    />
                  </ElButton>
                </span>
              </ElTooltip>
            </div>
            <div class="industry-action-group industry-action-group--manage">
              <ElTooltip content="移除" placement="top">
                <span class="industry-action-button__wrapper">
                  <ElButton
                    circle
                    plain
                    class="industry-action-button industry-action-button--delete"
                    title="移除"
                    @click="handleDeleteRelation(item)"
                  >
                    <IndustryDeleteIcon class="size-4" />
                  </ElButton>
                </span>
              </ElTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ElDrawer>
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

.industry-action-button--delete {
  color: rgb(251 113 133 / 96%);
}

.industry-action-button--disabled {
  color: rgb(100 116 139 / 60%);
}
</style>
