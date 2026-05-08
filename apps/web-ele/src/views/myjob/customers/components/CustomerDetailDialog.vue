<script lang="ts" setup>
import type { CustomerDetail } from '#/api/modules/admin/customers';

import { computed } from 'vue';

import { ElDescriptions, ElDescriptionsItem, ElDialog } from 'element-plus';

import { formatDateTime } from '../../shared';
import { resolveCustomerStatusText } from '../schemas';

const props = defineProps<{
  detail: CustomerDetail | null;
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});
</script>

<template>
  <ElDialog v-model="dialogVisible" title="客户详情" width="640px">
    <ElDescriptions v-if="detail" border :column="1">
      <ElDescriptionsItem label="ID">{{ detail.id }}</ElDescriptionsItem>
      <ElDescriptionsItem label="公司/店铺名称">
        {{ detail.company_name }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="手机号">{{ detail.phone }}</ElDescriptionsItem>
      <ElDescriptionsItem label="状态">
        {{ resolveCustomerStatusText(detail.status) }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="最后登录 IP">
        {{ detail.last_login_ip || '--' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="最后登录时间">
        {{ formatDateTime(detail.last_login_at) }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="创建时间">
        {{ formatDateTime(detail.created_at) }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="更新时间">
        {{ formatDateTime(detail.updated_at) }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>
