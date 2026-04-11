<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getOperationLogsApi } from '#/api';
import type { OperationLogItem } from '#/api';

import type { GridPageParams } from '../shared';

import {
  extractDateRange,
  formatDateTime,
  resolvePageParams,
  toGridResult,
} from '../shared';

const [Grid] = useVbenVxeGrid<OperationLogItem>({
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
        component: 'Input',
        fieldName: 'keyword',
        label: '关键词',
        componentProps: {
          placeholder: '请输入操作关键词',
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
      { field: 'description', title: '操作内容', minWidth: 260 },
      { field: 'ip', title: 'IP', minWidth: 140 },
      { field: 'ip_region', title: 'IP 归属地', minWidth: 160 },
      {
        field: 'created_at',
        formatter: ({ cellValue }: { cellValue?: string }) =>
          formatDateTime(cellValue),
        title: '操作时间',
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
          const result = await getOperationLogsApi({
            admin_id: formValues.admin_id,
            end_time,
            keyword: formValues.keyword,
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
  tableTitle: '操作日志',
});
</script>

<template>
  <Page description="支持管理员、关键词、时间范围和分页筛选。" title="操作日志">
    <Grid />
  </Page>
</template>
