<script lang="ts" setup>
import { ElButton, ElDescriptions, ElDescriptionsItem } from 'element-plus';

import { useCustomerAuthStore } from '#/store';

defineOptions({ name: 'CustomerHome' });

const customerAuthStore = useCustomerAuthStore();

function statusText(status?: number) {
  if (status === 1) {
    return '启用';
  }
  if (status === 0) {
    return '禁用';
  }
  return '未知';
}
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-10">
    <div class="mb-6 flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">客户中心</h1>
        <p class="mt-1 text-sm text-muted-foreground">账号资料</p>
      </div>
      <ElButton type="primary" @click="customerAuthStore.logout">
        退出登录
      </ElButton>
    </div>

    <ElDescriptions border :column="1" title="当前客户">
      <ElDescriptionsItem label="公司/店铺名称">
        {{ customerAuthStore.customer?.company_name || '--' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="手机号">
        {{ customerAuthStore.customer?.phone || '--' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="状态">
        {{ statusText(customerAuthStore.customer?.status) }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </main>
</template>
