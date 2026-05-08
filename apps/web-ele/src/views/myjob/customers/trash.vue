<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { ElButton, ElTag } from 'element-plus';

import { MYJOB_PAGE_CONTENT_CLASS } from '../shared';
import { useCustomerTrashPage } from './composables/useCustomerTrashPage';
import { resolveCustomerStatusText } from './schemas';

const { CustomerTrashGrid, handleRestore } = useCustomerTrashPage();
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <CustomerTrashGrid>
      <template #status="{ row }">
        <ElTag :type="row.status === 1 ? 'success' : 'info'">
          {{ resolveCustomerStatusText(row.status) }}
        </ElTag>
      </template>
      <template #actions="{ row }">
        <ElButton link type="primary" @click="handleRestore(row)">
          恢复
        </ElButton>
      </template>
    </CustomerTrashGrid>
  </Page>
</template>
