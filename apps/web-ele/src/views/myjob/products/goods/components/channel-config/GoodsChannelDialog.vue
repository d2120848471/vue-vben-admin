<script lang="ts" setup>
import type {
  ProductGoodsChannelBindingFormOptionsResult,
  ProductGoodsChannelBindingItem,
  ProductGoodsChannelBindingsResult,
} from '#/api/modules/admin/products/goods-channels';

import { computed, ref, watch } from 'vue';

import { ElButton, ElDialog, ElMessage, ElMessageBox } from 'element-plus';

import {
  deleteProductGoodsChannelBindingApi,
  getProductGoodsChannelBindingFormOptionsApi,
  getProductGoodsChannelBindingsApi,
  updateProductGoodsChannelAutoPriceApi,
} from '#/api/modules/admin/products/goods-channels';

import GoodsChannelAutoPriceDialog from './GoodsChannelAutoPriceDialog.vue';
import GoodsChannelBindingDialog from './GoodsChannelBindingDialog.vue';
import { buildProductGoodsChannelAutoPricePayload } from './mappers';

const props = defineProps<{
  goodsId: null | number;
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();

const bindingDialogVisible = ref(false);
const autoPriceDialogVisible = ref(false);
const bindingListLoading = ref(false);
const formOptionsGoodsId = ref<null | number>(null);
const currentBinding = ref<null | ProductGoodsChannelBindingItem>(null);
const goodsSummary = ref<null | ProductGoodsChannelBindingsResult['goods']>(
  null,
);
const bindings = ref<ProductGoodsChannelBindingItem[]>([]);
const formOptions = ref<ProductGoodsChannelBindingFormOptionsResult>({
  auto_price_type_options: [],
  dock_status_options: [],
  platform_accounts: [],
  validate_templates: [],
});

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

async function loadBindings() {
  if (!props.goodsId) {
    return;
  }
  bindingListLoading.value = true;
  try {
    const result = await getProductGoodsChannelBindingsApi(props.goodsId);
    goodsSummary.value = result.goods;
    bindings.value = result.list ?? [];
  } finally {
    bindingListLoading.value = false;
  }
}

async function ensureFormOptionsLoaded() {
  if (!props.goodsId || formOptionsGoodsId.value === props.goodsId) {
    return;
  }
  // 表单选项接口按商品维度取数，goodsId 变了就必须重新拉取，不能复用上一商品的缓存。
  formOptions.value = await getProductGoodsChannelBindingFormOptionsApi(
    props.goodsId,
  );
  formOptionsGoodsId.value = props.goodsId;
}

function resetChildDialogs() {
  bindingDialogVisible.value = false;
  autoPriceDialogVisible.value = false;
  currentBinding.value = null;
}

watch(
  () => [props.visible, props.goodsId] as const,
  async ([visible, goodsId]) => {
    if (!visible || !goodsId) {
      if (!visible) {
        resetChildDialogs();
        formOptionsGoodsId.value = null;
      }
      return;
    }
    await loadBindings();
  },
  { immediate: true },
);

async function openCreateDialog() {
  await ensureFormOptionsLoaded();
  currentBinding.value = null;
  bindingDialogVisible.value = true;
}

async function openEditDialog(binding: ProductGoodsChannelBindingItem) {
  await ensureFormOptionsLoaded();
  currentBinding.value = binding;
  bindingDialogVisible.value = true;
}

async function openAutoPriceDialog(binding: ProductGoodsChannelBindingItem) {
  await ensureFormOptionsLoaded();
  currentBinding.value = binding;
  autoPriceDialogVisible.value = true;
}

async function closeAutoPriceDirect(binding: ProductGoodsChannelBindingItem) {
  if (!props.goodsId) {
    return;
  }
  await updateProductGoodsChannelAutoPriceApi(
    props.goodsId,
    binding.id,
    buildProductGoodsChannelAutoPricePayload({
      add_type: binding.add_type,
      default_price: binding.default_price,
      is_auto_change: 0,
    }),
  );
  ElMessage.success('自动改价已关闭');
  await handleSaved();
}

async function handleDelete(binding: ProductGoodsChannelBindingItem) {
  if (!props.goodsId) {
    return;
  }
  await ElMessageBox.confirm(
    `确认删除渠道绑定 ${binding.display_name} 吗？`,
    '删除确认',
    { type: 'warning' },
  );
  await deleteProductGoodsChannelBindingApi(props.goodsId, binding.id);
  ElMessage.success('渠道绑定已删除');
  await handleSaved();
}

async function handleSaved() {
  resetChildDialogs();
  await loadBindings();
  emit('saved');
}

function taxText(value: number | undefined) {
  return value === 1 ? '含税' : '未税';
}

function dockStatusText(value: number) {
  return value === 1 ? '正常' : '关闭';
}

function validateTemplateText(value: string) {
  return value || '--';
}
</script>

<template>
  <ElDialog v-model="dialogVisible" title="渠道配置" width="1080px">
    <div class="goods-channel-dialog">
      <div v-if="goodsSummary" class="goods-channel-dialog__summary">
        <div class="goods-channel-dialog__summary-title">
          {{ goodsSummary.name }}
        </div>
        <div class="goods-channel-dialog__summary-meta">
          <span>{{ goodsSummary.brand_name || '--' }}</span>
          <span>{{ goodsSummary.subject_name || '--' }}</span>
          <span>{{ taxText(goodsSummary.has_tax) }}</span>
          <span>默认售价 {{ goodsSummary.default_sell_price || '--' }}</span>
          <span>{{ goodsSummary.goods_code }}</span>
        </div>
      </div>

      <div class="goods-channel-dialog__toolbar">
        <ElButton type="primary" @click="openCreateDialog">新增库存</ElButton>
      </div>

      <div v-if="bindingListLoading" class="goods-channel-dialog__empty">
        加载中...
      </div>
      <div
        v-else-if="bindings.length === 0"
        class="goods-channel-dialog__empty"
      >
        暂无渠道绑定
      </div>
      <div v-else class="goods-channel-dialog__list">
        <div
          v-for="binding in bindings"
          :key="binding.id"
          class="goods-channel-dialog__row"
        >
          <div class="goods-channel-dialog__main">
            <div class="goods-channel-dialog__name">
              {{ binding.display_name }}
            </div>
            <div class="goods-channel-dialog__meta">
              <span>对接状态 {{ dockStatusText(binding.dock_status) }}</span>
              <span>对接编号 {{ binding.supplier_goods_no }}</span>
              <span>进货价 {{ binding.cost_price }}</span>
              <span>
                充值匹配
                {{ validateTemplateText(binding.validate_template_title) }}
              </span>
              <span>排序 {{ binding.sort }}</span>
              <span>
                自动改价
                {{ binding.is_auto_change === 1 ? '已开启' : '未开启' }}
              </span>
            </div>
          </div>
          <div class="goods-channel-dialog__actions">
            <ElButton link type="primary" @click="openEditDialog(binding)">
              编辑
            </ElButton>
            <ElButton
              v-if="binding.is_auto_change === 1"
              link
              type="primary"
              @click="openAutoPriceDialog(binding)"
            >
              编辑自动改价
            </ElButton>
            <ElButton
              v-else
              link
              type="primary"
              @click="openAutoPriceDialog(binding)"
            >
              开启自动改价
            </ElButton>
            <ElButton
              v-if="binding.is_auto_change === 1"
              link
              type="warning"
              @click="closeAutoPriceDirect(binding)"
            >
              关闭自动改价
            </ElButton>
            <ElButton link type="danger" @click="handleDelete(binding)">
              删除
            </ElButton>
          </div>
        </div>
      </div>
    </div>

    <GoodsChannelBindingDialog
      :dock-status-options="formOptions.dock_status_options"
      :editing-binding="currentBinding"
      :goods-id="goodsId"
      :platform-accounts="formOptions.platform_accounts"
      :validate-templates="formOptions.validate_templates"
      :visible="bindingDialogVisible"
      @saved="handleSaved"
      @update:visible="bindingDialogVisible = $event"
    />

    <GoodsChannelAutoPriceDialog
      :auto-price-type-options="formOptions.auto_price_type_options"
      :binding="currentBinding"
      :goods-id="goodsId"
      :visible="autoPriceDialogVisible"
      @saved="handleSaved"
      @update:visible="autoPriceDialogVisible = $event"
    />
  </ElDialog>
</template>

<style scoped>
.goods-channel-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.goods-channel-dialog__summary {
  padding: 16px;
  background: color-mix(in srgb, var(--el-fill-color-light) 92%, transparent);
  border-radius: 16px;
}

.goods-channel-dialog__summary-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.goods-channel-dialog__summary-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.goods-channel-dialog__toolbar {
  display: flex;
  gap: 12px;
}

.goods-channel-dialog__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goods-channel-dialog__row {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
}

.goods-channel-dialog__main {
  min-width: 0;
}

.goods-channel-dialog__name {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.goods-channel-dialog__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.goods-channel-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-end;
}

.goods-channel-dialog__empty {
  padding: 32px 0;
  color: var(--el-text-color-secondary);
  text-align: center;
}
</style>
