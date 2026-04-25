<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type { ProductGoodsStrategySelectOption } from '../../shared';

import type {
  ProductGoodsBrandOption,
  ProductGoodsDetailResult,
  ProductGoodsIntOption,
  ProductGoodsListItem,
  ProductGoodsPayload,
  ProductGoodsStringOption,
  ProductGoodsSubjectOption,
  ProductGoodsTemplateOption,
} from '#/api/modules/admin/products/goods';

import { computed, reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElCascader,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElSelect,
} from 'element-plus';

import {
  addProductGoodsApi,
  getProductGoodsDetailApi,
  updateProductGoodsApi,
} from '#/api/modules/admin/products/goods';
import { getSubjectsApi } from '#/api/modules/admin/subjects';

import {
  buildProductGoodsStrategySelectOptions,
  getProductGoodsBrandPath,
} from '../../shared';

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

type BrandCascaderOption = {
  children: BrandCascaderOption[];
  disabled: boolean;
  label: string;
  value: number;
};

const props = defineProps<{
  booleanOptions: ProductGoodsIntOption[];
  brandCascaderOptions: BrandCascaderOption[];
  brandTreeOptions: ProductGoodsBrandOption[];
  editingGoods: null | ProductGoodsListItem;
  goodsTypeOptions: ProductGoodsStringOption[];
  statusOptions: ProductGoodsIntOption[];
  strategyOptions: Array<{ id: number; name: string }>;
  supplyTypeOptions: ProductGoodsStringOption[];
  templateOptions: ProductGoodsTemplateOption[];
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();

const formRef = ref<FormInstance>();
const dialogLoading = ref(false);
const subjectOptionsLoaded = ref(false);
const subjectOptions = ref<ProductGoodsSubjectOption[]>([]);
const currentStrategy = ref<CurrentStrategyState | undefined>(undefined);

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const dialogTitle = computed(() =>
  props.editingGoods ? '编辑商品' : '新增商品',
);

const dialogStrategyOptions = computed<ProductGoodsStrategySelectOption[]>(() =>
  buildProductGoodsStrategySelectOptions(
    props.strategyOptions,
    currentStrategy.value,
  ),
);

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
    !props.goodsTypeOptions.some((item) => item.value === dialogForm.goods_type)
  ) {
    dialogForm.goods_type = props.goodsTypeOptions[0]?.value ?? '';
  }
  if (
    !props.supplyTypeOptions.some(
      (item) => item.value === dialogForm.supply_type,
    )
  ) {
    dialogForm.supply_type = props.supplyTypeOptions[0]?.value ?? 'channel';
  }
  if (
    !props.booleanOptions.some((item) => item.value === dialogForm.is_export)
  ) {
    dialogForm.is_export = 1;
  }
  if (
    !props.booleanOptions.some((item) => item.value === dialogForm.is_douyin)
  ) {
    dialogForm.is_douyin = 0;
  }
  if (!props.booleanOptions.some((item) => item.value === dialogForm.has_tax)) {
    dialogForm.has_tax = 0;
  }
  if (
    !props.booleanOptions.some(
      (item) => item.value === dialogForm.exception_notify,
    )
  ) {
    dialogForm.exception_notify = 1;
  }
  if (!props.statusOptions.some((item) => item.value === dialogForm.status)) {
    dialogForm.status = 1;
  }
  if (
    dialogForm.has_tax !== 1 ||
    !subjectOptions.value.some((item) => item.id === dialogForm.subject_id)
  ) {
    dialogForm.subject_id = '';
  }
}

async function ensureSubjectOptionsLoaded() {
  if (subjectOptionsLoaded.value) {
    return;
  }
  const result = await getSubjectsApi();
  subjectOptions.value = (result.list ?? [])
    .filter((item) => item.has_tax === 1)
    .map((item) => ({
      id: item.id,
      name: item.name,
    }));
  subjectOptionsLoaded.value = true;
  syncDialogDefaults();
}

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
  const selectedBrand = findBrandNode(props.brandTreeOptions, selectedId);
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

async function applyDetail(detail: ProductGoodsDetailResult) {
  dialogForm.balance_limit = detail.balance_limit || '0.0000';
  dialogForm.brand_path = getProductGoodsBrandPath(
    props.brandTreeOptions,
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

async function initializeDialog() {
  resetDialogForm();
  currentStrategy.value = undefined;
  await ensureSubjectOptionsLoaded();
  syncDialogDefaults();
  if (!props.editingGoods) {
    return;
  }
  const detail = await getProductGoodsDetailApi(props.editingGoods.id);
  await applyDetail(detail);
}

async function submitDialog() {
  if (dialogLoading.value || !formRef.value) {
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
    if (props.editingGoods) {
      await updateProductGoodsApi(props.editingGoods.id, payload);
      ElMessage.success('商品已更新');
    } else {
      await addProductGoodsApi(payload);
      ElMessage.success('商品已新增');
    }
    emit('saved');
    emit('update:visible', false);
  } finally {
    dialogLoading.value = false;
  }
}

watch(
  () => dialogForm.has_tax,
  (value) => {
    if (value !== 1) {
      dialogForm.subject_id = '';
    }
  },
);

watch(
  () => [props.visible, props.editingGoods?.id] as const,
  async ([visible]) => {
    if (!visible) {
      resetDialogForm();
      currentStrategy.value = undefined;
      dialogLoading.value = false;
      return;
    }
    // 编辑态详情和主体选项准备完成前锁住提交，避免空表单覆盖原商品。
    dialogLoading.value = true;
    try {
      await initializeDialog();
    } catch {
      ElMessage.error(
        props.editingGoods
          ? '商品详情加载失败，请稍后重试'
          : '主体选项加载失败，请稍后重试',
      );
      emit('update:visible', false);
    } finally {
      dialogLoading.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <ElDialog v-model="dialogVisible" :title="dialogTitle" width="920px">
    <ElForm ref="formRef" :model="dialogForm" label-width="112px">
      <div class="goods-dialog">
        <div v-if="editingGoods" class="goods-dialog__section">
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
                filterable
                placeholder="请选择末级品牌"
              />
            </ElFormItem>
            <ElFormItem
              label="商品名称"
              prop="name"
              required
              :rules="[
                { required: true, message: '请输入商品名称', trigger: 'blur' },
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
              <ElSelect v-model="dialogForm.product_template_id" class="w-full">
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
          :disabled="dialogLoading"
          :loading="dialogLoading"
          type="primary"
          @click="submitDialog"
        >
          确定
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
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
