<script lang="ts" setup>
import type {
  ProductGoodsChannelBindingFormOptionsResult,
  ProductGoodsChannelBindingItem,
  ProductGoodsChannelBindingsResult,
} from '#/api/modules/admin/products/goods-channels';

import { computed, reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElMessage,
  ElMessageBox,
  ElSwitch,
} from 'element-plus';

import {
  deleteProductGoodsChannelBindingApi,
  getProductGoodsChannelBindingFormOptionsApi,
  getProductGoodsChannelBindingsApi,
  updateProductGoodsChannelAutoPriceApi,
  updateProductGoodsChannelBindingApi,
} from '#/api/modules/admin/products/goods-channels';

import GoodsChannelAutoPriceDialog from './GoodsChannelAutoPriceDialog.vue';
import GoodsChannelBindingDialog from './GoodsChannelBindingDialog.vue';
import {
  buildProductGoodsChannelAutoPricePayload,
  buildProductGoodsChannelBindingUpdatePayload,
} from './mappers';
import { buildProductGoodsChannelDialogColumns } from './schemas';

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
const dockStatusLoadingIds = reactive<Record<number, boolean>>({});
const autoPriceLoadingIds = reactive<Record<number, boolean>>({});
const formOptions = ref<ProductGoodsChannelBindingFormOptionsResult>({
  auto_price_type_options: [],
  dock_status_options: [],
  platform_accounts: [],
  validate_templates: [],
});
const tableColumns = buildProductGoodsChannelDialogColumns();

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

async function openAutoPriceDialog(
  binding: ProductGoodsChannelBindingItem,
  options?: {
    forceEnable?: boolean;
  },
) {
  await ensureFormOptionsLoaded();
  currentBinding.value = options?.forceEnable
    ? {
        ...binding,
        add_type:
          binding.add_type ||
          formOptions.value.auto_price_type_options[0]?.value ||
          'fixed',
        default_price:
          binding.is_auto_change === 1 ? binding.default_price : '',
        is_auto_change: 1,
      }
    : binding;
  autoPriceDialogVisible.value = true;
}

async function handleDockStatusChange(
  binding: ProductGoodsChannelBindingItem,
  nextStatus: number | string,
) {
  if (!props.goodsId) {
    return;
  }
  const normalizedStatus = Number(nextStatus);
  dockStatusLoadingIds[binding.id] = true;
  try {
    await updateProductGoodsChannelBindingApi(
      props.goodsId,
      binding.id,
      buildProductGoodsChannelBindingUpdatePayload(binding, {
        dock_status: normalizedStatus,
      }),
    );
    ElMessage.success(
      normalizedStatus === 1 ? '对接状态已开启' : '对接状态已关闭',
    );
    await handleSaved();
  } catch {
    ElMessage.error('对接状态更新失败，请稍后重试');
  } finally {
    dockStatusLoadingIds[binding.id] = false;
  }
}

async function handleAutoPriceSwitch(
  binding: ProductGoodsChannelBindingItem,
  nextStatus: number | string,
) {
  if (!props.goodsId) {
    return;
  }
  const normalizedStatus = Number(nextStatus);
  if (normalizedStatus === 1) {
    await openAutoPriceDialog(binding, { forceEnable: true });
    return;
  }

  autoPriceLoadingIds[binding.id] = true;
  try {
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
  } catch {
    ElMessage.error('自动改价更新失败，请稍后重试');
  } finally {
    autoPriceLoadingIds[binding.id] = false;
  }
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

/**
 * 渠道展示名约定是“商品名 渠道标签 平台标签”这类空格分段格式。
 * 这里统一拆成标题和标签，避免模板里重复 split/filter，也便于后续兼容旧接口格式。
 */
function parseBindingName(displayName: string) {
  const parts = String(displayName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    tags: parts.slice(1),
    title: parts[0] || '--',
  };
}

function formatCellValue(value: null | number | string | undefined) {
  const normalized = String(value ?? '').trim();
  return normalized || '--';
}
</script>

<template>
  <ElDialog v-model="dialogVisible" title="渠道配置" width="1200px">
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
      <div
        v-else
        class="goods-channel-dialog__table"
        data-test="bindings-table-scroll"
      >
        <table class="goods-channel-dialog__plain-table">
          <colgroup>
            <col
              v-for="column in tableColumns"
              :key="column.field"
              :data-col-field="column.field"
              :style="{
                minWidth: column.minWidth,
                width: column.minWidth,
              }"
              data-test="bindings-grid-col"
            />
          </colgroup>
          <thead>
            <tr>
              <th
                v-for="column in tableColumns"
                :key="column.field"
                :data-col-field="column.field"
                data-test="bindings-grid-header"
              >
                {{ column.title }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="binding in bindings"
              :key="binding.id"
              :data-row-id="String(binding.id)"
            >
              <td data-cell-field="display_name">
                <div class="goods-channel-dialog__name-cell">
                  <div class="goods-channel-dialog__name-title">
                    {{ parseBindingName(binding.display_name).title }}
                  </div>
                  <div
                    v-if="
                      parseBindingName(binding.display_name).tags.length > 0
                    "
                    class="goods-channel-dialog__name-tags"
                  >
                    <span
                      v-for="(tag, index) in parseBindingName(
                        binding.display_name,
                      ).tags"
                      :key="`${binding.id}-${tag}`"
                      class="goods-channel-dialog__name-tag"
                      :class="
                        index === 0
                          ? 'goods-channel-dialog__name-tag--accent'
                          : 'goods-channel-dialog__name-tag--muted'
                      "
                      data-test="binding-name-tag"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </td>
              <td data-cell-field="dock_status">
                <ElSwitch
                  :active-value="1"
                  :inactive-value="0"
                  :loading="dockStatusLoadingIds[binding.id]"
                  :model-value="binding.dock_status"
                  data-test="channel-dock-status-switch"
                  inline-prompt
                  @change="
                    (value) => handleDockStatusChange(binding, Number(value))
                  "
                />
              </td>
              <td data-cell-field="supplier_goods_no">
                {{ formatCellValue(binding.supplier_goods_no) }}
              </td>
              <td data-cell-field="cost_price">
                {{ formatCellValue(binding.cost_price) }}
              </td>
              <td data-cell-field="effective_sell_price">
                {{ formatCellValue(binding.effective_sell_price) }}
              </td>
              <td data-cell-field="validate_template_title">
                {{ formatCellValue(binding.validate_template_title) }}
              </td>
              <td data-cell-field="is_auto_change">
                <ElSwitch
                  :active-value="1"
                  :inactive-value="0"
                  :loading="autoPriceLoadingIds[binding.id]"
                  :model-value="binding.is_auto_change"
                  data-test="channel-auto-price-switch"
                  inline-prompt
                  @change="
                    (value) => handleAutoPriceSwitch(binding, Number(value))
                  "
                />
              </td>
              <td data-cell-field="actions">
                <div class="goods-channel-dialog__actions">
                  <ElButton
                    link
                    type="primary"
                    @click="openEditDialog(binding)"
                  >
                    编辑
                  </ElButton>
                  <ElButton
                    link
                    type="primary"
                    @click="openAutoPriceDialog(binding)"
                  >
                    利润设置
                  </ElButton>
                  <ElButton link type="danger" @click="handleDelete(binding)">
                    删除
                  </ElButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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

.goods-channel-dialog__table {
  overflow: auto hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
}

.goods-channel-dialog__plain-table {
  width: max-content;
  min-width: 100%;
  table-layout: auto;
  border-collapse: collapse;
}

.goods-channel-dialog__plain-table th,
.goods-channel-dialog__plain-table td {
  padding: 16px;
  font-size: 14px;
  vertical-align: middle;
  text-align: center;
  white-space: nowrap;
  border-bottom: 1px solid var(--el-border-color-light);
}

.goods-channel-dialog__plain-table th {
  font-weight: 600;
  color: var(--el-text-color-secondary);
  background: color-mix(in srgb, var(--el-fill-color-light) 92%, transparent);
}

.goods-channel-dialog__plain-table td {
  color: var(--el-text-color-primary);
}

.goods-channel-dialog__name-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.goods-channel-dialog__name-title {
  font-weight: 600;
}

.goods-channel-dialog__name-tags {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.goods-channel-dialog__name-tag {
  padding: 3px 10px;
  font-size: 12px;
  line-height: 20px;
  border-radius: 999px;
}

.goods-channel-dialog__name-tag--accent {
  color: rgb(180 83 9);
  background: rgb(245 158 11 / 16%);
}

.goods-channel-dialog__name-tag--muted {
  color: var(--el-text-color-secondary);
  background: color-mix(in srgb, var(--el-fill-color-light) 92%, transparent);
}

.goods-channel-dialog__actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.goods-channel-dialog__empty {
  padding: 32px 0;
  color: var(--el-text-color-secondary);
  text-align: center;
}
</style>
