<script lang="ts" setup>
import type { ProductGoodsInventoryConfigSummary } from '#/api/modules/admin/products/goods-channels';

import { computed } from 'vue';

import { ElButton } from 'element-plus';

import { buildProductGoodsInventorySummaryItems } from './constants';

const props = defineProps<{
  summary: null | ProductGoodsInventoryConfigSummary | undefined;
}>();

const emit = defineEmits<{
  edit: [];
}>();

const summaryItems = computed(() =>
  buildProductGoodsInventorySummaryItems(props.summary),
);
</script>

<template>
  <div class="goods-channel-inventory-summary">
    <div class="goods-channel-inventory-summary__items">
      <span
        v-for="item in summaryItems"
        :key="item.label"
        class="goods-channel-inventory-summary__item"
      >
        {{ item.label }}：{{ item.value }}
      </span>
    </div>
    <ElButton type="primary" @click="emit('edit')">修改配置</ElButton>
  </div>
</template>

<style scoped>
.goods-channel-inventory-summary {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.goods-channel-inventory-summary__items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.goods-channel-inventory-summary__item {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
