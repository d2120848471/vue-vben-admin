<script lang="ts" setup>
import type { GridPageParams } from '../../shared';

import type {
  ProductGoodsBrandOption,
  ProductGoodsFormOptionsResult,
  ProductGoodsIntOption,
  ProductGoodsListItem,
  ProductGoodsStringOption,
  ProductGoodsTemplateOption,
} from '#/api/modules/admin/products/goods';

import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElImage,
  ElMessage,
  ElMessageBox,
  ElSwitch,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteProductGoodsApi,
  getProductGoodsFormOptionsApi,
  getProductGoodsListApi,
  updateProductGoodsStatusApi,
} from '#/api/modules/admin/products/goods';

import {
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  resolvePageParams,
  toGridResult,
} from '../../shared';
import {
  buildProductGoodsBrandCascaderOptions,
  buildProductGoodsBrandFilterOptions,
  resolveProductImageUrl,
} from '../shared';
import GoodsChannelDialog from './components/channel-config/GoodsChannelDialog.vue';
import GoodsDialog from './components/GoodsDialog.vue';
import {
  buildProductGoodsColumns,
  buildProductGoodsFilterSchema,
} from './schemas';

const DEFAULT_GOODS_TYPE_LABELS = new Map([
  ['card_secret', '卡密'],
  ['direct_recharge', '直充'],
]);

type GoodsCardTagTone = 'flag' | 'subject' | 'template' | 'type';

interface GoodsCardTag {
  label: string;
  tone: GoodsCardTagTone;
}

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('product.goods'),
);

const dialogVisible = ref(false);
const channelDialogGoodsId = ref<null | number>(null);
const channelDialogVisible = ref(false);
const editingGoods = ref<null | ProductGoodsListItem>(null);
const productRows = ref<ProductGoodsListItem[]>([]);
const formOptionsLoaded = ref(false);
const loadingStatusIds = reactive<Record<number, boolean>>({});

const brandTreeOptions = ref<ProductGoodsBrandOption[]>([]);
const brandFilterOptions = ref<Array<{ label: string; value: number }>>([]);
const brandCascaderOptions = ref<
  Array<{
    children: any[];
    disabled: boolean;
    label: string;
    value: number;
  }>
>([]);
const goodsTypeOptions = ref<ProductGoodsStringOption[]>([]);
const supplyTypeOptions = ref<ProductGoodsStringOption[]>([]);
const booleanOptions = ref<ProductGoodsIntOption[]>([]);
const statusOptions = ref<ProductGoodsIntOption[]>([]);
const templateOptions = ref<ProductGoodsTemplateOption[]>([]);
const strategyOptions = ref<Array<{ id: number; name: string }>>([]);

const goodsTypeLabelMap = computed(() =>
  goodsTypeOptions.value.length > 0
    ? new Map(goodsTypeOptions.value.map((item) => [item.value, item.label]))
    : DEFAULT_GOODS_TYPE_LABELS,
);

function syncFilterOptions() {
  if (!gridApi.formApi?.updateSchema) {
    return;
  }
  gridApi.formApi.updateSchema(
    buildProductGoodsFilterSchema({
      booleanOptions: [
        { label: '全部', value: '' },
        ...booleanOptions.value.map((item) => ({
          label: item.label,
          value: String(item.value),
        })),
      ],
      brandOptions: [
        { label: '全部品牌', value: '' },
        ...brandFilterOptions.value,
      ],
      goodsTypeOptions: [
        { label: '全部类型', value: '' },
        ...goodsTypeOptions.value.map((item) => ({
          label: item.label,
          value: item.value,
        })),
      ],
      onVisibleChange: handleFilterOptionsVisible,
      statusOptions: [
        { label: '全部', value: '' },
        ...statusOptions.value.map((item) => ({
          label: item.label,
          value: String(item.value),
        })),
      ],
    }),
  );
}

function applyFormOptions(result: ProductGoodsFormOptionsResult) {
  brandTreeOptions.value = result.brands ?? [];
  brandFilterOptions.value = buildProductGoodsBrandFilterOptions(
    brandTreeOptions.value,
  );
  brandCascaderOptions.value = buildProductGoodsBrandCascaderOptions(
    brandTreeOptions.value,
  );
  goodsTypeOptions.value = result.goods_types ?? [];
  supplyTypeOptions.value = result.supply_types ?? [];
  booleanOptions.value = result.boolean_options ?? [];
  statusOptions.value = result.status_options ?? [];
  templateOptions.value = result.templates ?? [];
  strategyOptions.value = result.purchase_limit_strategies ?? [];
  syncFilterOptions();
}

// 商品表单和列表筛选都复用这份聚合选项，但改成懒加载，避免页面首屏就预取弹窗数据。
async function ensureFormOptionsLoaded() {
  if (formOptionsLoaded.value) {
    return true;
  }
  try {
    const result = await getProductGoodsFormOptionsApi();
    applyFormOptions(result);
    formOptionsLoaded.value = true;
    return true;
  } catch {
    ElMessage.error('商品表单选项加载失败，请稍后重试');
    return false;
  }
}

async function handleFilterOptionsVisible(visible: boolean) {
  if (!visible) {
    return;
  }
  await ensureFormOptionsLoaded();
}

async function openCreateDialog() {
  editingGoods.value = null;
  const formReady = await ensureFormOptionsLoaded();
  if (!formReady) {
    return;
  }
  dialogVisible.value = true;
}

async function openEditDialog(row: ProductGoodsListItem) {
  const formReady = await ensureFormOptionsLoaded();
  if (!formReady) {
    return;
  }
  editingGoods.value = row;
  dialogVisible.value = true;
}

async function handleDelete(row: ProductGoodsListItem) {
  await ElMessageBox.confirm(`确认删除商品 ${row.name} 吗？`, '删除确认', {
    type: 'warning',
  });
  await deleteProductGoodsApi(row.id);
  ElMessage.success('商品已删除');
  await gridApi.reload();
}

// 状态切换只走独立接口，避免编辑弹窗提交时误改启停状态。
async function handleStatusChange(
  row: ProductGoodsListItem,
  nextStatus: number | string,
) {
  const normalizedStatus = Number(nextStatus);
  loadingStatusIds[row.id] = true;
  try {
    const result = await updateProductGoodsStatusApi(
      [row.id],
      normalizedStatus,
    );
    if ((result?.failed_count ?? 0) > 0) {
      ElMessage.error(result.failed?.[0]?.reason || '商品状态更新失败');
    } else {
      ElMessage.success(normalizedStatus === 1 ? '商品已启用' : '商品已停用');
    }
    await gridApi.reload();
  } finally {
    loadingStatusIds[row.id] = false;
  }
}

function formatAmount(value: string) {
  return value || '--';
}

function getGoodsTypeLabel(value: string) {
  const label = goodsTypeLabelMap.value.get(value) ?? value;
  return label || '--';
}

function getGoodsBrandImageUrl(url: string) {
  return resolveProductImageUrl(url, apiURL);
}

function getGoodsCardTags(row: ProductGoodsListItem): GoodsCardTag[] {
  const tags: GoodsCardTag[] = [
    {
      label: getGoodsTypeLabel(row.goods_type),
      tone: 'type',
    },
  ];

  if (row.subject_name) {
    tags.push({
      label: row.subject_name,
      tone: 'subject',
    });
  }
  if (row.product_template_title) {
    tags.push({
      label: row.product_template_title,
      tone: 'template',
    });
  }
  if (row.is_export === 1) {
    tags.push({
      label: '可导出',
      tone: 'flag',
    });
  }
  if (row.is_douyin === 1) {
    tags.push({
      label: '抖音',
      tone: 'flag',
    });
  }
  if (row.exception_notify === 1) {
    tags.push({
      label: '异常提醒',
      tone: 'flag',
    });
  }

  return tags;
}

function getGoodsCardImageFallback(row: ProductGoodsListItem) {
  const brandName = String(row.brand_name ?? '').trim();
  return brandName.slice(0, 2) || '商品';
}

function getPrimaryChannelSummary(row: ProductGoodsListItem) {
  if ((row.bound_channel_count ?? 0) <= 0) {
    return '未绑定';
  }

  const primaryName =
    String(row.primary_channel_name ?? '').trim() ||
    row.bound_channels?.[0] ||
    '按规则选路';
  if ((row.bound_channel_count ?? 0) === 1) {
    return primaryName;
  }

  return `${primaryName} +${Math.max((row.bound_channel_count ?? 1) - 1, 0)}`;
}

function getChannelCostSummary(row: ProductGoodsListItem) {
  if ((row.bound_channel_count ?? 0) <= 0) {
    return '点击配置渠道';
  }
  return `最低进价 ${formatAmount(row.min_channel_cost ?? '')}`;
}

function openChannelDialog(row: ProductGoodsListItem) {
  channelDialogGoodsId.value = row.id;
  channelDialogVisible.value = true;
}

const [Grid, gridApi] = useVbenVxeGrid<ProductGoodsListItem>({
  formOptions: {
    schema: buildProductGoodsFilterSchema({
      booleanOptions: [{ label: '全部', value: '' }],
      brandOptions: [{ label: '全部品牌', value: '' }],
      goodsTypeOptions: [{ label: '全部类型', value: '' }],
      onVisibleChange: handleFilterOptionsVisible,
      statusOptions: [{ label: '全部', value: '' }],
    }),
  },
  gridClass: `${MYJOB_GRID_CLASS} myjob-goods-grid`,
  gridOptions: {
    columns: buildProductGoodsColumns(formatAmount),
    pagerConfig: {},
    proxyConfig: {
      ajax: {
        query: async (
          params: GridPageParams,
          formValues: Record<string, any>,
        ) => {
          const { page, page_size } = resolvePageParams(params);
          const keyword = String(formValues.keyword ?? '').trim();
          const goods_type = String(formValues.goods_type ?? '').trim();
          const has_tax = String(formValues.has_tax ?? '').trim();
          const status = String(formValues.status ?? '').trim();
          const brandValue = String(formValues.brand_id ?? '').trim();
          const brand_id = brandValue ? Number(brandValue) : undefined;
          const result = await getProductGoodsListApi({
            ...(brand_id ? { brand_id } : {}),
            ...(goods_type ? { goods_type } : {}),
            ...(has_tax ? { has_tax } : {}),
            ...(keyword ? { keyword } : {}),
            ...(status ? { status } : {}),
            page,
            page_size,
          });
          productRows.value = result.list ?? [];
          return toGridResult(productRows.value, result.pagination.total);
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

function handleDialogVisibleChange(value: boolean) {
  dialogVisible.value = value;
  if (!value) {
    editingGoods.value = null;
  }
}

function handleChannelDialogVisibleChange(value: boolean) {
  channelDialogVisible.value = value;
  if (!value) {
    channelDialogGoodsId.value = null;
  }
}

async function handleDialogSaved() {
  await gridApi.reload();
}

async function handleChannelDialogSaved() {
  await gridApi.reload();
}
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <Grid>
      <template #toolbar-actions>
        <div v-if="canManage" class="flex gap-3">
          <ElButton type="primary" @click="openCreateDialog">新增商品</ElButton>
        </div>
      </template>

      <template #productInfo="{ row }">
        <div class="goods-card">
          <div class="goods-card__media">
            <div
              class="goods-card__image-shell"
              :class="row.has_tax === 1 ? 'goods-card__image-shell--taxed' : ''"
            >
              <span
                v-if="row.has_tax === 1"
                :data-test="`goods-tax-badge-${row.id}`"
                class="goods-card__tax-badge"
              >
                含税
              </span>
              <ElImage
                v-if="row.brand_icon"
                :data-test="`goods-brand-image-${row.id}`"
                :src="getGoodsBrandImageUrl(row.brand_icon)"
                class="goods-card__image"
                fit="cover"
              >
                <template #error>
                  <div class="goods-card__image-fallback">
                    {{ getGoodsCardImageFallback(row) }}
                  </div>
                </template>
              </ElImage>
              <div v-else class="goods-card__image-fallback">
                {{ getGoodsCardImageFallback(row) }}
              </div>
            </div>
          </div>
          <div class="goods-card__body">
            <div class="goods-card__header">
              <span class="goods-card__name">{{ row.name }}</span>
              <span class="goods-card__code">{{ row.goods_code }}</span>
            </div>
            <div class="goods-card__meta">
              <span class="goods-card__brand">{{ row.brand_name }}</span>
            </div>
            <div class="goods-card__tags">
              <span
                v-for="tag in getGoodsCardTags(row)"
                :key="`${row.id}-${tag.tone}-${tag.label}`"
                class="goods-card__tag"
                :class="`goods-card__tag--${tag.tone}`"
              >
                {{ tag.label }}
              </span>
            </div>
          </div>
        </div>
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
        <span
          v-else
          class="goods-status"
          :class="
            row.status === 1
              ? 'goods-status--enabled'
              : 'goods-status--disabled'
          "
        >
          {{ row.status === 1 ? '启用' : '停用' }}
        </span>
      </template>

      <template #channelConfig="{ row }">
        <button
          class="goods-channel-button"
          type="button"
          @click="openChannelDialog(row)"
        >
          <span class="goods-channel-button__primary">
            {{ getPrimaryChannelSummary(row) }}
          </span>
          <span class="goods-channel-button__secondary">
            {{ getChannelCostSummary(row) }}
          </span>
          <span
            v-if="row.channel_auto_price_status === 1"
            class="goods-channel-button__tag"
          >
            自动改价
          </span>
        </button>
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

    <GoodsDialog
      :boolean-options="booleanOptions"
      :brand-cascader-options="brandCascaderOptions"
      :brand-tree-options="brandTreeOptions"
      :editing-goods="editingGoods"
      :goods-type-options="goodsTypeOptions"
      :status-options="statusOptions"
      :strategy-options="strategyOptions"
      :supply-type-options="supplyTypeOptions"
      :template-options="templateOptions"
      :visible="dialogVisible"
      @saved="handleDialogSaved"
      @update:visible="handleDialogVisibleChange"
    />

    <GoodsChannelDialog
      :goods-id="channelDialogGoodsId"
      :visible="channelDialogVisible"
      @saved="handleChannelDialogSaved"
      @update:visible="handleChannelDialogVisibleChange"
    />
  </Page>
</template>

<style scoped>
.goods-card {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 8px 0;
}

.goods-card__media {
  position: relative;
}

.goods-card__image-shell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgb(255 255 255 / 72%), transparent 55%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--el-fill-color-light) 92%, transparent),
      color-mix(in srgb, var(--el-fill-color) 84%, transparent)
    );
  border: 1px solid color-mix(in srgb, var(--el-border-color) 72%, white);
  border-radius: 20px;
  box-shadow: 0 12px 24px rgb(15 23 42 / 10%);
}

.goods-card__image-shell--taxed {
  border-color: rgb(239 68 68 / 24%);
}

.goods-card__tax-badge {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  color: white;
  background: linear-gradient(135deg, rgb(244 63 94), rgb(239 68 68));
  border-radius: 18px 0 14px;
}

.goods-card__image {
  width: 100%;
  height: 100%;
}

.goods-card :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goods-card__image-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 12px;
  font-size: 20px;
  font-weight: 700;
  color: color-mix(in srgb, var(--el-text-color-primary) 78%, transparent);
  letter-spacing: 1px;
}

.goods-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.goods-card__header {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  align-items: center;
}

.goods-card__name {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}

.goods-card__code {
  padding: 2px 8px;
  font-size: 12px;
  line-height: 20px;
  color: var(--el-text-color-secondary);
  background: color-mix(in srgb, var(--el-fill-color) 86%, transparent);
  border-radius: 999px;
}

.goods-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.goods-card__brand {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.goods-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.goods-card__tag {
  padding: 3px 10px;
  font-size: 12px;
  line-height: 20px;
  border-radius: 999px;
}

.goods-card__tag--type {
  color: rgb(29 78 216);
  background: rgb(59 130 246 / 14%);
}

.goods-card__tag--subject {
  color: rgb(190 24 93);
  background: rgb(244 114 182 / 16%);
}

.goods-card__tag--template {
  color: rgb(180 83 9);
  background: rgb(245 158 11 / 16%);
}

.goods-card__tag--flag {
  color: var(--el-text-color-secondary);
  background: color-mix(in srgb, var(--el-fill-color-light) 92%, transparent);
}

:deep(.myjob-goods-grid .goods-product-info-column .vxe-cell) {
  max-height: none;
  overflow: visible;
  white-space: normal;
}

/* 空列表时给 vxe-table 的占位区保留可读高度，避免“暂无数据”被压扁 */
:deep(.myjob-goods-grid.is--empty .vxe-table--body-wrapper) {
  min-height: 180px;
}

:deep(.myjob-goods-grid .vxe-table--empty-block),
:deep(.myjob-goods-grid .vxe-table--empty-placeholder),
:deep(.myjob-goods-grid .vxe-table--empty-place-wrapper) {
  min-height: 180px;
}

:deep(.myjob-goods-grid .vxe-table--empty-content) {
  width: auto;
  min-width: 160px;
}

.goods-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  padding: 2px 10px;
  font-size: 12px;
  line-height: 20px;
  border-radius: 999px;
}

.goods-status--enabled {
  color: rgb(21 128 61);
  background: rgb(34 197 94 / 14%);
}

.goods-status--disabled {
  color: rgb(71 85 105);
  background: rgb(148 163 184 / 18%);
}

.goods-channel-button {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  width: 100%;
  padding: 0;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.goods-channel-button__primary {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.goods-channel-button__secondary {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.goods-channel-button__tag {
  padding: 2px 8px;
  font-size: 12px;
  line-height: 18px;
  color: rgb(180 83 9);
  background: rgb(245 158 11 / 16%);
  border-radius: 999px;
}
</style>
