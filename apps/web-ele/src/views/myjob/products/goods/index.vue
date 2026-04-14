<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type { GridPageParams } from '../../shared';
import type { ProductGoodsStrategySelectOption } from '../shared';

import type {
  ProductGoodsBrandOption,
  ProductGoodsDetailResult,
  ProductGoodsFormOptionsResult,
  ProductGoodsIntOption,
  ProductGoodsListItem,
  ProductGoodsPayload,
  ProductGoodsStringOption,
  ProductGoodsSubjectOption,
  ProductGoodsTemplateOption,
} from '#/api';

import { computed, reactive, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElCascader,
  ElDialog,
  ElForm,
  ElFormItem,
  ElImage,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addProductGoodsApi,
  deleteProductGoodsApi,
  getProductGoodsDetailApi,
  getProductGoodsFormOptionsApi,
  getProductGoodsListApi,
  getSubjectsApi,
  updateProductGoodsApi,
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
  buildProductGoodsStrategySelectOptions,
  getProductGoodsBrandPath,
  resolveProductImageUrl,
} from '../shared';

const DEFAULT_GOODS_TYPE_LABELS = new Map([
  ['card_secret', '卡密'],
  ['direct_recharge', '直充'],
]);

type GoodsCardTagTone = 'flag' | 'subject' | 'template' | 'type';

interface GoodsCardTag {
  label: string;
  tone: GoodsCardTagTone;
}

interface GoodsDialogState {
  balance_limit: string;
  brand_path: number[];
  default_sell_price: string;
  exception_notify: number;
  goods_code: string;
  goods_type: string;
  has_tax: number;
  is_douyin: number;
  is_export: number;
  max_purchase_qty: number;
  min_purchase_qty: number;
  name: string;
  product_template_id: '' | number;
  purchase_limit_strategy_id: '' | number;
  purchase_notice: string;
  status: number;
  subject_id: '' | number;
  supply_type: string;
  terminal_price_limit: string;
}

interface CurrentStrategyState {
  id: null | number;
  name: string;
  status: number;
}

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('product.goods'),
);

const formRef = ref<FormInstance>();
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const editingGoodsId = ref<null | number>(null);
const productRows = ref<ProductGoodsListItem[]>([]);
const formOptionsLoaded = ref(false);
const subjectOptionsLoaded = ref(false);

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
const subjectOptions = ref<ProductGoodsSubjectOption[]>([]);
const currentStrategy = ref<CurrentStrategyState | undefined>(undefined);

const dialogForm = reactive<GoodsDialogState>({
  balance_limit: '0.0000',
  brand_path: [],
  default_sell_price: '',
  exception_notify: 1,
  goods_code: '',
  goods_type: '',
  has_tax: 0,
  is_douyin: 0,
  is_export: 1,
  max_purchase_qty: 1,
  min_purchase_qty: 1,
  name: '',
  product_template_id: '',
  purchase_limit_strategy_id: '',
  purchase_notice: '',
  status: 1,
  subject_id: '',
  supply_type: 'channel',
  terminal_price_limit: '',
});

const dialogStrategyOptions = computed<ProductGoodsStrategySelectOption[]>(() =>
  buildProductGoodsStrategySelectOptions(
    strategyOptions.value,
    currentStrategy.value,
  ),
);

const goodsTypeLabelMap = computed(() =>
  goodsTypeOptions.value.length > 0
    ? new Map(goodsTypeOptions.value.map((item) => [item.value, item.label]))
    : DEFAULT_GOODS_TYPE_LABELS,
);

function resetDialogForm() {
  dialogForm.balance_limit = '0.0000';
  dialogForm.brand_path = [];
  dialogForm.default_sell_price = '';
  dialogForm.exception_notify = 1;
  dialogForm.goods_code = '';
  dialogForm.goods_type = '';
  dialogForm.has_tax = 0;
  dialogForm.is_douyin = 0;
  dialogForm.is_export = 1;
  dialogForm.max_purchase_qty = 1;
  dialogForm.min_purchase_qty = 1;
  dialogForm.name = '';
  dialogForm.product_template_id = '';
  dialogForm.purchase_limit_strategy_id = '';
  dialogForm.purchase_notice = '';
  dialogForm.status = 1;
  dialogForm.subject_id = '';
  dialogForm.supply_type = 'channel';
  dialogForm.terminal_price_limit = '';
}

function syncDialogDefaults() {
  if (
    !goodsTypeOptions.value.some((item) => item.value === dialogForm.goods_type)
  ) {
    dialogForm.goods_type = goodsTypeOptions.value[0]?.value ?? '';
  }
  if (
    !supplyTypeOptions.value.some(
      (item) => item.value === dialogForm.supply_type,
    )
  ) {
    dialogForm.supply_type = supplyTypeOptions.value[0]?.value ?? 'channel';
  }
  if (
    !booleanOptions.value.some((item) => item.value === dialogForm.is_export)
  ) {
    dialogForm.is_export = 1;
  }
  if (
    !booleanOptions.value.some((item) => item.value === dialogForm.is_douyin)
  ) {
    dialogForm.is_douyin = 0;
  }
  if (!booleanOptions.value.some((item) => item.value === dialogForm.has_tax)) {
    dialogForm.has_tax = 0;
  }
  if (
    !booleanOptions.value.some(
      (item) => item.value === dialogForm.exception_notify,
    )
  ) {
    dialogForm.exception_notify = 1;
  }
  if (!statusOptions.value.some((item) => item.value === dialogForm.status)) {
    dialogForm.status = 1;
  }
  if (
    dialogForm.has_tax !== 1 ||
    !subjectOptions.value.some((item) => item.id === dialogForm.subject_id)
  ) {
    dialogForm.subject_id = '';
  }
}

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
  syncDialogDefaults();
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

// 主体配置来自员工管理的主体接口，按弹窗打开时机单独加载，避免列表首屏就预取这类弹窗数据。
async function ensureSubjectOptionsLoaded() {
  if (subjectOptionsLoaded.value) {
    return true;
  }
  try {
    const result = await getSubjectsApi();
    subjectOptions.value = (result.list ?? [])
      .filter((item) => item.has_tax === 1)
      .map((item) => ({
        id: item.id,
        name: item.name,
      }));
    subjectOptionsLoaded.value = true;
    syncDialogDefaults();
    return true;
  } catch {
    ElMessage.error('主体选项加载失败，请稍后重试');
    return false;
  }
}

// 含税和主体强绑定，切回未税时立即清空主体，避免旧值残留提交。
watch(
  () => dialogForm.has_tax,
  (value) => {
    if (value !== 1) {
      dialogForm.subject_id = '';
    }
  },
);

function findBrandNode(
  items: ProductGoodsBrandOption[],
  brandId: number,
): null | ProductGoodsBrandOption {
  for (const item of items) {
    if (item.id === brandId) {
      return item;
    }
    const childNode = findBrandNode(item.children ?? [], brandId);
    if (childNode) {
      return childNode;
    }
  }
  return null;
}

function getSelectedLeafBrandId() {
  const selectedId = dialogForm.brand_path[dialogForm.brand_path.length - 1];
  if (!selectedId) {
    return null;
  }
  const selectedBrand = findBrandNode(brandTreeOptions.value, selectedId);
  if (!selectedBrand?.is_leaf) {
    return null;
  }
  return selectedId;
}

function normalizeOptionalId(value: '' | null | number) {
  if (typeof value !== 'number' || value <= 0) {
    return null;
  }
  return value;
}

function normalizeMoneyInput(value: string, fallback = '') {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
}

function validateGoodsName(
  _: unknown,
  value: string,
  callback: (error?: Error) => void,
) {
  if (!String(value ?? '').trim()) {
    callback(new Error('请输入商品名称'));
    return;
  }
  callback();
}

function validateLeafBrand(
  _: unknown,
  value: number[],
  callback: (error?: Error) => void,
) {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !getSelectedLeafBrandId()
  ) {
    callback(new Error('请选择末级品牌'));
    return;
  }
  callback();
}

function validateOptionalMoney(
  fieldLabel: string,
  value: string,
  callback: (error?: Error) => void,
) {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    callback();
    return;
  }
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    callback(new Error(`${fieldLabel}格式错误`));
    return;
  }
  callback();
}

function validateTaxSubject(
  _: unknown,
  value: '' | number,
  callback: (error?: Error) => void,
) {
  if (dialogForm.has_tax !== 1) {
    callback();
    return;
  }
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value <= 0 ||
    !subjectOptions.value.some((item) => item.id === value)
  ) {
    callback(new Error('含税商品必须选择主体'));
    return;
  }
  callback();
}

function validateMinPurchaseQty(
  _: unknown,
  value: number,
  callback: (error?: Error) => void,
) {
  if (!Number.isFinite(value) || value < 1) {
    callback(new Error('最小购买数量必须大于等于 1'));
    return;
  }
  callback();
}

function validateMaxPurchaseQty(
  _: unknown,
  value: number,
  callback: (error?: Error) => void,
) {
  if (!Number.isFinite(value) || value < 1) {
    callback(new Error('最大购买数量必须大于等于 1'));
    return;
  }
  if (value < dialogForm.min_purchase_qty) {
    callback(new Error('最大购买数量不能小于最小购买数量'));
    return;
  }
  callback();
}

function buildPayload(): null | ProductGoodsPayload {
  const brandId = getSelectedLeafBrandId();
  if (!brandId) {
    ElMessage.warning('请选择末级品牌');
    return null;
  }
  const subject_id =
    dialogForm.has_tax === 1
      ? normalizeOptionalId(dialogForm.subject_id)
      : null;
  return {
    balance_limit: normalizeMoneyInput(dialogForm.balance_limit, '0.0000'),
    brand_id: brandId,
    default_sell_price: normalizeMoneyInput(dialogForm.default_sell_price),
    exception_notify: dialogForm.exception_notify,
    goods_type: dialogForm.goods_type,
    has_tax: dialogForm.has_tax,
    is_douyin: dialogForm.is_douyin,
    is_export: dialogForm.is_export,
    max_purchase_qty: dialogForm.max_purchase_qty,
    min_purchase_qty: dialogForm.min_purchase_qty,
    name: dialogForm.name.trim(),
    product_template_id: normalizeOptionalId(dialogForm.product_template_id),
    purchase_limit_strategy_id: normalizeOptionalId(
      dialogForm.purchase_limit_strategy_id,
    ),
    purchase_notice: dialogForm.purchase_notice.trim(),
    status: dialogForm.status,
    subject_id,
    supply_type: dialogForm.supply_type,
    terminal_price_limit: normalizeMoneyInput(dialogForm.terminal_price_limit),
  };
}

async function openCreateDialog() {
  resetDialogForm();
  currentStrategy.value = undefined;
  editingGoodsId.value = null;
  const [formReady, subjectReady] = await Promise.all([
    ensureFormOptionsLoaded(),
    ensureSubjectOptionsLoaded(),
  ]);
  if (!formReady || !subjectReady) {
    return;
  }
  syncDialogDefaults();
  dialogVisible.value = true;
}

async function applyDetail(detail: ProductGoodsDetailResult) {
  dialogForm.balance_limit = detail.balance_limit || '0.0000';
  dialogForm.brand_path = getProductGoodsBrandPath(
    brandTreeOptions.value,
    detail.brand_id,
  ) ?? [detail.brand_id];
  dialogForm.default_sell_price = detail.default_sell_price;
  dialogForm.exception_notify = detail.exception_notify;
  dialogForm.goods_code = detail.goods_code;
  dialogForm.goods_type = detail.goods_type;
  dialogForm.has_tax = detail.has_tax;
  dialogForm.is_douyin = detail.is_douyin;
  dialogForm.is_export = detail.is_export;
  dialogForm.max_purchase_qty = detail.max_purchase_qty;
  dialogForm.min_purchase_qty = detail.min_purchase_qty;
  dialogForm.name = detail.name;
  dialogForm.product_template_id = detail.product_template_id ?? '';
  dialogForm.purchase_limit_strategy_id =
    detail.purchase_limit_strategy_id ?? '';
  dialogForm.purchase_notice = detail.purchase_notice;
  dialogForm.status = detail.status;
  dialogForm.subject_id = detail.subject_id ?? '';
  dialogForm.supply_type = detail.supply_type;
  dialogForm.terminal_price_limit = detail.terminal_price_limit;
  currentStrategy.value = {
    id: detail.purchase_limit_strategy_id,
    name: detail.purchase_limit_strategy_name,
    status: detail.purchase_limit_strategy_status,
  };
  syncDialogDefaults();
}

async function openEditDialog(row: ProductGoodsListItem) {
  resetDialogForm();
  editingGoodsId.value = null;
  currentStrategy.value = undefined;
  const [formReady, subjectReady] = await Promise.all([
    ensureFormOptionsLoaded(),
    ensureSubjectOptionsLoaded(),
  ]);
  if (!formReady || !subjectReady) {
    return;
  }
  try {
    const detail = await getProductGoodsDetailApi(row.id);
    editingGoodsId.value = row.id;
    await applyDetail(detail);
    dialogVisible.value = true;
  } catch {
    ElMessage.error('商品详情加载失败，请稍后重试');
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
  const payload = buildPayload();
  if (!payload) {
    return;
  }
  try {
    dialogLoading.value = true;
    if (editingGoodsId.value) {
      await updateProductGoodsApi(editingGoodsId.value, payload);
      ElMessage.success('商品已更新');
    } else {
      await addProductGoodsApi(payload);
      ElMessage.success('商品已新增');
    }
    dialogVisible.value = false;
    await gridApi.reload();
  } finally {
    dialogLoading.value = false;
  }
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

const dialogTitle = computed(() =>
  editingGoodsId.value ? '编辑商品' : '新增商品',
);
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

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="920px">
      <ElForm ref="formRef" :model="dialogForm" label-width="112px">
        <div class="goods-dialog">
          <div v-if="editingGoodsId" class="goods-dialog__section">
            <div class="goods-dialog__section-title">系统信息</div>
            <ElFormItem label="商品编码">
              <ElInput
                v-model="dialogForm.goods_code"
                data-test="goods-code"
                disabled
              />
            </ElFormItem>
          </div>

          <div class="goods-dialog__section">
            <div class="goods-dialog__section-title">基础信息</div>
            <div class="goods-dialog__grid">
              <ElFormItem
                label="商品品牌"
                prop="brand_path"
                :rules="[
                  {
                    required: true,
                    message: '请选择末级品牌',
                    trigger: 'change',
                  },
                  { trigger: 'change', validator: validateLeafBrand },
                ]"
              >
                <ElCascader
                  v-model="dialogForm.brand_path"
                  :options="brandCascaderOptions"
                  class="w-full"
                  data-test="goods-brand-path"
                  placeholder="请选择末级品牌"
                />
              </ElFormItem>
              <ElFormItem
                label="商品名称"
                prop="name"
                required
                :rules="[
                  {
                    required: true,
                    message: '请输入商品名称',
                    trigger: 'blur',
                  },
                  { trigger: 'blur', validator: validateGoodsName },
                ]"
              >
                <ElInput
                  v-model="dialogForm.name"
                  data-test="goods-name"
                  placeholder="请输入商品名称"
                />
              </ElFormItem>
              <ElFormItem label="商品类型">
                <ElSelect v-model="dialogForm.goods_type" class="w-full">
                  <ElOption
                    v-for="item in goodsTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="供货方式">
                <ElSelect
                  v-model="dialogForm.supply_type"
                  :disabled="supplyTypeOptions.length <= 1"
                  class="w-full"
                >
                  <ElOption
                    v-for="item in supplyTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="商品模板">
                <ElSelect
                  v-model="dialogForm.product_template_id"
                  class="w-full"
                >
                  <ElOption label="不设置" value="" />
                  <ElOption
                    v-for="item in templateOptions"
                    :key="item.id"
                    :label="item.title"
                    :value="item.id"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="限制策略">
                <ElSelect
                  v-model="dialogForm.purchase_limit_strategy_id"
                  class="w-full"
                >
                  <ElOption label="不设置" value="" />
                  <ElOption
                    v-for="item in dialogStrategyOptions"
                    :key="item.value"
                    :disabled="item.disabled"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </div>
            <ElFormItem label="购买须知">
              <ElInput
                v-model="dialogForm.purchase_notice"
                data-test="goods-purchase-notice"
                placeholder="请输入购买须知"
                type="textarea"
              />
            </ElFormItem>
          </div>

          <div class="goods-dialog__section">
            <div class="goods-dialog__section-title">业务开关</div>
            <div class="goods-dialog__grid">
              <ElFormItem label="可导出">
                <ElSelect v-model="dialogForm.is_export" class="w-full">
                  <ElOption
                    v-for="item in booleanOptions"
                    :key="`export-${item.value}`"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="可抖音">
                <ElSelect v-model="dialogForm.is_douyin" class="w-full">
                  <ElOption
                    v-for="item in booleanOptions"
                    :key="`douyin-${item.value}`"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="异常提醒">
                <ElSelect v-model="dialogForm.exception_notify" class="w-full">
                  <ElOption
                    v-for="item in booleanOptions"
                    :key="`notify-${item.value}`"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="是否含税">
                <ElSelect
                  v-model="dialogForm.has_tax"
                  class="w-full"
                  data-test="goods-has-tax"
                >
                  <ElOption
                    v-for="item in booleanOptions"
                    :key="`tax-${item.value}`"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem
                v-if="dialogForm.has_tax === 1"
                label="主体"
                prop="subject_id"
                required
                :rules="[{ trigger: 'change', validator: validateTaxSubject }]"
              >
                <ElSelect
                  v-model="dialogForm.subject_id"
                  class="w-full"
                  data-test="goods-subject-id"
                  placeholder="请选择主体"
                >
                  <ElOption
                    v-for="item in subjectOptions"
                    :key="`subject-${item.id}`"
                    :label="item.name"
                    :value="item.id"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="状态">
                <ElSelect v-model="dialogForm.status" class="w-full">
                  <ElOption
                    v-for="item in statusOptions"
                    :key="`status-${item.value}`"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </div>
          </div>

          <div class="goods-dialog__section">
            <div class="goods-dialog__section-title">价格与数量</div>
            <div class="goods-dialog__grid">
              <!-- 表单层先兜住品牌、金额和数量区间，避免请求发出后才收到后端 400。 -->
              <ElFormItem
                label="默认售价"
                prop="default_sell_price"
                :rules="[
                  {
                    trigger: 'blur',
                    validator: (
                      _: unknown,
                      value: string,
                      callback: (error?: Error) => void,
                    ) => validateOptionalMoney('默认售价', value, callback),
                  },
                ]"
              >
                <ElInput
                  v-model="dialogForm.default_sell_price"
                  data-test="goods-default-sell-price"
                  placeholder="请输入默认售价"
                />
              </ElFormItem>
              <ElFormItem
                label="终端限价"
                prop="terminal_price_limit"
                :rules="[
                  {
                    trigger: 'blur',
                    validator: (
                      _: unknown,
                      value: string,
                      callback: (error?: Error) => void,
                    ) => validateOptionalMoney('终端限价', value, callback),
                  },
                ]"
              >
                <ElInput
                  v-model="dialogForm.terminal_price_limit"
                  data-test="goods-terminal-price-limit"
                  placeholder="请输入终端限价"
                />
              </ElFormItem>
              <ElFormItem
                label="限制余额"
                prop="balance_limit"
                :rules="[
                  {
                    trigger: 'blur',
                    validator: (
                      _: unknown,
                      value: string,
                      callback: (error?: Error) => void,
                    ) => validateOptionalMoney('限制余额', value, callback),
                  },
                ]"
              >
                <ElInput
                  v-model="dialogForm.balance_limit"
                  data-test="goods-balance-limit"
                  placeholder="0 表示不限制"
                />
              </ElFormItem>
              <ElFormItem
                label="最小购买数量"
                prop="min_purchase_qty"
                :rules="[
                  { trigger: 'change', validator: validateMinPurchaseQty },
                ]"
              >
                <ElInputNumber
                  v-model="dialogForm.min_purchase_qty"
                  :min="1"
                  class="w-full"
                  data-test="goods-min-purchase-qty"
                />
              </ElFormItem>
              <ElFormItem
                label="最大购买数量"
                prop="max_purchase_qty"
                :rules="[
                  { trigger: 'change', validator: validateMaxPurchaseQty },
                ]"
              >
                <ElInputNumber
                  v-model="dialogForm.max_purchase_qty"
                  :min="1"
                  class="w-full"
                  data-test="goods-max-purchase-qty"
                />
              </ElFormItem>
            </div>
          </div>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-3">
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton
            :loading="dialogLoading"
            type="primary"
            @click="submitDialog"
          >
            确定
          </ElButton>
        </div>
      </template>
    </ElDialog>
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

.goods-dialog {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.goods-dialog__section {
  padding: 18px 20px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--el-fill-color-light) 72%, transparent),
    var(--el-bg-color-overlay)
  );
  border: 1px solid var(--el-border-color);
  border-radius: 16px;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 8%),
    0 12px 28px rgb(15 23 42 / 12%);
}

.goods-dialog__section-title {
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.goods-dialog__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.goods-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.goods-dialog
  :deep(
    .el-form-item.is-required:not(.is-no-asterisk).asterisk-left
      > .el-form-item__label-wrap
      > .el-form-item__label::before
  ) {
  color: var(--el-color-danger);
}

.goods-dialog :deep(.el-textarea__inner) {
  min-height: 96px;
}

:global(.dark) .goods-dialog__section {
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 4%),
    0 16px 32px rgb(0 0 0 / 22%);
}

@media (max-width: 960px) {
  .goods-dialog__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
