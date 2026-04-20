import type {
  ProductGoodsChannelBindingFormOptionsResult,
  ProductGoodsChannelBindingItem,
  ProductGoodsChannelBindingsResult,
} from '#/api/modules/admin/products/goods-channels';

import { computed, reactive, ref, watch } from 'vue';

import { ElMessage, ElMessageBox } from 'element-plus';

import {
  deleteProductGoodsChannelBindingApi,
  getProductGoodsChannelBindingFormOptionsApi,
  getProductGoodsChannelBindingsApi,
  updateProductGoodsChannelAutoPriceApi,
  updateProductGoodsChannelBindingApi,
} from '#/api/modules/admin/products/goods-channels';

import {
  buildProductGoodsChannelAutoPricePayload,
  buildProductGoodsChannelBindingUpdatePayload,
} from './mappers';

interface GoodsChannelDialogProps {
  goodsId: null | number;
  visible: boolean;
}

type GoodsChannelDialogEmit = (
  event: 'saved' | 'update:visible',
  value?: boolean,
) => void;

/**
 * 渠道弹窗同时编排绑定列表、表单选项、自动改价和商品级库存配置 3 套子交互。
 * 把状态集中到组合式函数里，避免入口组件继续膨胀。
 */
export function useGoodsChannelDialog(
  props: GoodsChannelDialogProps,
  emit: GoodsChannelDialogEmit,
) {
  const bindingDialogVisible = ref(false);
  const autoPriceDialogVisible = ref(false);
  const inventoryConfigDialogVisible = ref(false);
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
    // 表单选项按商品维度缓存，切换商品时必须刷新，避免把上一商品的渠道/模板串到当前弹窗。
    formOptions.value = await getProductGoodsChannelBindingFormOptionsApi(
      props.goodsId,
    );
    formOptionsGoodsId.value = props.goodsId;
  }

  function resetChildDialogs() {
    bindingDialogVisible.value = false;
    autoPriceDialogVisible.value = false;
    inventoryConfigDialogVisible.value = false;
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

  function openInventoryConfigDialog() {
    if (!props.goodsId) {
      return;
    }
    inventoryConfigDialogVisible.value = true;
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

  return {
    autoPriceDialogVisible,
    autoPriceLoadingIds,
    bindingDialogVisible,
    bindingListLoading,
    bindings,
    currentBinding,
    dialogVisible,
    dockStatusLoadingIds,
    formOptions,
    goodsSummary,
    handleAutoPriceSwitch,
    handleDelete,
    handleDockStatusChange,
    handleSaved,
    inventoryConfigDialogVisible,
    openAutoPriceDialog,
    openCreateDialog,
    openEditDialog,
    openInventoryConfigDialog,
  };
}
