<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { MYJOB_PAGE_CONTENT_CLASS } from '../../shared';
import { usePriceChangePage } from './composables/usePriceChangePage';

const { PriceChangeGrid } = usePriceChangePage();
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <PriceChangeGrid>
      <template #platform="{ row }">
        <div class="leading-5">
          <div>{{ row.platform_account_name || '--' }}</div>
          <div class="text-xs text-gray-500">
            {{ row.platform_account_id ? `#${row.platform_account_id}` : '--' }}
          </div>
        </div>
      </template>

      <template #goods="{ row }">
        <div class="leading-5">
          <div>{{ row.goods_code || '--' }}</div>
          <div class="text-xs text-gray-500">{{ row.goods_name || '--' }}</div>
        </div>
      </template>

      <template #supplier_goods="{ row }">
        <div class="leading-5">
          <div>{{ row.supplier_goods_no || '--' }}</div>
          <div class="text-xs text-gray-500">
            {{ row.supplier_goods_name || '--' }}
          </div>
        </div>
      </template>
    </PriceChangeGrid>
  </Page>
</template>
