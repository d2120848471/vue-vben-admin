<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getLoginLogsApi } from '#/api';
import type { LoginLogItem } from '#/api';

import type { GridPageParams } from '../shared';

import {
  extractDateRange,
  formatDateTime,
  resolvePageParams,
  toGridResult,
} from '../shared';

const [Grid] = useVbenVxeGrid<LoginLogItem>({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'admin_id',
        label: '管理员 ID',
        componentProps: {
          placeholder: '请输入管理员 ID',
        },
      },
      {
        component: 'DatePicker',
        fieldName: 'date_range',
        label: '时间范围',
        componentProps: {
          type: 'datetimerange',
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
        },
      },
    ],
  },
  gridOptions: {
    columns: [
      { field: 'id', title: 'ID', width: 80 },
      { field: 'admin_id', title: '管理员 ID', width: 110 },
      { field: 'admin_name', title: '管理员', minWidth: 140 },
      { field: 'ip', title: 'IP', minWidth: 140 },
      { field: 'ip_region', title: 'IP 归属地', minWidth: 160 },
      {
        field: 'created_at',
        formatter: ({ cellValue }: { cellValue?: string }) =>
          formatDateTime(cellValue),
        title: '登录时间',
        minWidth: 180,
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
          const { end_time, start_time } = extractDateRange(
            formValues.date_range,
          );
          const result = await getLoginLogsApi({
            admin_id: formValues.admin_id,
            end_time,
            page,
            page_size,
            start_time,
          });
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
  tableTitle: '登录日志',
});
</script>

<template>
  <Page description="支持管理员和时间范围筛选。" title="登录日志">
    <Grid />
  </Page>
</template>
