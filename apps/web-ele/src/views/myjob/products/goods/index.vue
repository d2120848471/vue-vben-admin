<script lang="ts" setup>
import type { GridPageParams } from '../../shared';

import type {
  ProductGoodsBrandOption,
  ProductGoodsFormOptionsResult,
  ProductGoodsIntOption,
  ProductGoodsListItem,
  ProductGoodsStringOption,
  ProductGoodsTemplateOption,
} from '#/api';

import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';

import { ElButton, ElImage, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteProductGoodsApi,
  getProductGoodsFormOptionsApi,
  getProductGoodsListApi,
} from '#/api';

import {
  formatDateTime,
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
import GoodsDialog from './components/GoodsDialog.vue';

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
const editingGoods = ref<null | ProductGoodsListItem>(null);
const productRows = ref<ProductGoodsListItem[]>([]);
const formOptionsLoaded = ref(false);

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
  gridApi.formApi.updateSchema([
    {
      componentProps: {
        onVisibleChange: handleFilterOptionsVisible,
        options: [
          { label: '全部品牌', value: '' },
          ...brandFilterOptions.value,
        ],
        placeholder: '请选择品牌',
      },
      fieldName: 'brand_id',
    },
    {
      componentProps: {
        onVisibleChange: handleFilterOptionsVisible,
        options: [
          { label: '全部类型', value: '' },
          ...goodsTypeOptions.value.map((item) => ({
            label: item.label,
            value: item.value,
          })),
        ],
        placeholder: '请选择商品类型',
      },
      fieldName: 'goods_type',
    },
    {
      componentProps: {
        onVisibleChange: handleFilterOptionsVisible,
        options: [
          { label: '全部', value: '' },
          ...booleanOptions.value.map((item) => ({
            label: item.label,
            value: String(item.value),
          })),
        ],
        placeholder: '请选择是否含税',
      },
      fieldName: 'has_tax',
    },
    {
      componentProps: {
        onVisibleChange: handleFilterOptionsVisible,
        options: [
          { label: '全部', value: '' },
          ...statusOptions.value.map((item) => ({
            label: item.label,
            value: String(item.value),
          })),
        ],
        placeholder: '请选择状态',
      },
      fieldName: 'status',
    },
  ]);
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

const [Grid, gridApi] = useVbenVxeGrid<ProductGoodsListItem>({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: '关键词',
        componentProps: {
          placeholder: '商品名称 / 商品编码',
        },
      },
      {
        component: 'Select',
        fieldName: 'brand_id',
        label: '品牌',
        componentProps: {
          onVisibleChange: handleFilterOptionsVisible,
          options: [{ label: '全部品牌', value: '' }],
          placeholder: '请选择品牌',
        },
      },
      {
        component: 'Select',
        fieldName: 'goods_type',
        label: '商品类型',
        componentProps: {
          onVisibleChange: handleFilterOptionsVisible,
          options: [{ label: '全部类型', value: '' }],
          placeholder: '请选择商品类型',
        },
      },
      {
        component: 'Select',
        fieldName: 'has_tax',
        label: '是否含税',
        componentProps: {
          onVisibleChange: handleFilterOptionsVisible,
          options: [{ label: '全部', value: '' }],
          placeholder: '请选择是否含税',
        },
      },
      {
        component: 'Select',
        fieldName: 'status',
        label: '状态',
        componentProps: {
          onVisibleChange: handleFilterOptionsVisible,
          options: [{ label: '全部', value: '' }],
          placeholder: '请选择状态',
        },
      },
    ],
  },
  gridClass: `${MYJOB_GRID_CLASS} myjob-goods-grid`,
  gridOptions: {
    columns: [
      {
        className: 'goods-product-info-column',
        field: 'product_info',
        minWidth: 560,
        showOverflow: false,
        slots: { default: 'productInfo' },
        title: '商品信息',
      },
      {
        field: 'purchase_limit_strategy_name',
        formatter: ({ cellValue }: { cellValue?: string }) => cellValue || '--',
        minWidth: 180,
        title: '限制策略',
      },
      {
        field: 'default_sell_price',
        formatter: ({ cellValue }: { cellValue?: string }) =>
          formatAmount(cellValue ?? ''),
        minWidth: 120,
        title: '默认售价',
      },
      {
        field: 'terminal_price_limit',
        formatter: ({ cellValue }: { cellValue?: string }) =>
          formatAmount(cellValue ?? ''),
        minWidth: 120,
        title: '终端限价',
      },
      {
        field: 'status',
        minWidth: 100,
        slots: { default: 'status' },
        title: '状态',
      },
      {
        field: 'created_at',
        formatter: ({ cellValue }: { cellValue?: string }) =>
          formatDateTime(cellValue),
        minWidth: 180,
        title: '创建时间',
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

async function handleDialogSaved() {
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
        <span
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
</style>
