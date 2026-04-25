<script lang="ts" setup>
import type { GridPageParams } from '../shared';

import type { OrderListItem, OrderStats } from '#/api/modules/admin/orders';

import { reactive } from 'vue';

import { Page } from '@vben/common-ui';

import { ElTag } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getOrderListApi } from '#/api/modules/admin/orders';

import {
  extractDateRange,
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  resolvePageParams,
  toGridResult,
} from '../shared';
import { resolveOrderStatusTagType } from './constants';
import { buildOrderColumns, buildOrderFilterSchema } from './schemas';

const stats = reactive<OrderStats>({
  today_order_amount: '0.0000',
  today_order_count: 0,
  yesterday_order_amount: '0.0000',
  yesterday_order_count: 0,
});

function displayText(value?: number | string) {
  if (value === undefined || value === null || value === '') {
    return '--';
  }
  return value;
}

const statCards = [
  { field: 'today_order_count', label: '今日订单数' },
  { field: 'today_order_amount', label: '今日交易额' },
  { field: 'yesterday_order_count', label: '昨日订单数' },
  { field: 'yesterday_order_amount', label: '昨日交易额' },
] as const;

const [Grid] = useVbenVxeGrid<OrderListItem>({
  formOptions: {
    schema: buildOrderFilterSchema(),
  },
  gridClass: MYJOB_GRID_CLASS,
  gridOptions: {
    columns: buildOrderColumns(),
    pagerConfig: {},
    proxyConfig: {
      ajax: {
        query: async (
          params: GridPageParams,
          formValues: Record<string, any>,
        ) => {
          const { page, page_size } = resolvePageParams(params);
          const { end_time, start_time } = extractDateRange(
            formValues.date_range,
          );
          const result = await getOrderListApi({
            channel_id: formValues.channel_id,
            end_time,
            has_tax: formValues.has_tax,
            is_card: formValues.is_card,
            keyword: formValues.keyword,
            keyword_by: formValues.keyword_by,
            page,
            page_size,
            quick_range: formValues.quick_range,
            start_time,
            status: formValues.status,
          });
          Object.assign(stats, result.stats);
          return toGridResult(result.list, result.pagination.total);
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
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <div class="grid grid-cols-1 gap-3 pb-3 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="item in statCards"
        :key="item.field"
        class="rounded border border-gray-200 bg-white px-4 py-3"
      >
        <div class="text-sm text-gray-500">{{ item.label }}</div>
        <div class="mt-1 text-xl font-semibold text-gray-900">
          {{ stats[item.field] }}
        </div>
      </div>
    </div>
    <Grid>
      <template #status="{ row }">
        <ElTag :type="resolveOrderStatusTagType(row.status_code)">
          {{ displayText(row.status_text) }}
        </ElTag>
      </template>
    </Grid>
  </Page>
</template>
