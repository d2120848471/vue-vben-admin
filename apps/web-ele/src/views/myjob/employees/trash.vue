<script lang="ts" setup>
import type { GridPageParams } from '../shared';

import type { UserListItem } from '#/api/modules/admin/users';

import { computed } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import { ElButton, ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getAdminUserTrashApi,
  restoreAdminUserApi,
} from '#/api/modules/admin/users';

import {
  keywordMatch,
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  resolvePageParams,
  toGridResult,
} from '../shared';

const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('admin.list'),
);

async function handleRestore(row: UserListItem) {
  await restoreAdminUserApi(row.id);
  ElMessage.success('员工已恢复，默认状态为禁用');
  await gridApi.reload();
}

const [Grid, gridApi] = useVbenVxeGrid<UserListItem>({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: '关键词',
        componentProps: {
          placeholder: '用户名 / 姓名 / 手机号',
        },
      },
    ],
  },
  gridClass: MYJOB_GRID_CLASS,
  gridOptions: {
    columns: [
      { field: 'id', title: 'ID', width: 80 },
      { field: 'username', title: '用户名', minWidth: 160 },
      { field: 'real_name', title: '姓名', minWidth: 120 },
      { field: 'phone', title: '手机号', minWidth: 140 },
      { field: 'group_name', title: '用户组', minWidth: 140 },
      {
        field: 'actions',
        fixed: 'right',
        minWidth: 140,
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
          const result = await getAdminUserTrashApi({ page, page_size });
          const keyword = String(formValues.keyword ?? '').trim();
          const filtered = keyword
            ? result.list.filter((item) =>
                keywordMatch(keyword, [
                  item.username,
                  item.real_name,
                  item.phone,
                ]),
              )
            : result.list;
          return toGridResult(
            filtered,
            keyword ? filtered.length : result.pagination.total,
          );
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
    <Grid>
      <template #actions="{ row }">
        <ElButton
          v-if="canManage"
          link
          type="primary"
          @click="handleRestore(row)"
        >
          恢复
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>
