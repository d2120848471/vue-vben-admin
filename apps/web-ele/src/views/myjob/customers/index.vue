<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { ElButton, ElTag } from 'element-plus';

import { MYJOB_PAGE_CONTENT_CLASS } from '../shared';
import CustomerDetailDialog from './components/CustomerDetailDialog.vue';
import CustomerDialog from './components/CustomerDialog.vue';
import ResetPasswordDialog from './components/ResetPasswordDialog.vue';
import ResetPayPasswordDialog from './components/ResetPayPasswordDialog.vue';
import { useCustomerPage } from './composables/useCustomerPage';
import { resolveCustomerStatusText } from './schemas';

const {
  canManage,
  CustomerGrid,
  detail,
  detailVisible,
  dialogMode,
  dialogVisible,
  editingCustomer,
  handleDelete,
  handleDialogSaved,
  handleStatusChange,
  loadingStatusIds,
  openCreateDialog,
  openDetailDialog,
  openEditDialog,
  openResetPasswordDialog,
  openResetPayPasswordDialog,
  resetPasswordVisible,
  resetPayPasswordVisible,
  selectedCustomer,
} = useCustomerPage();
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <CustomerGrid>
      <template #toolbar-actions>
        <ElButton v-if="canManage" type="primary" @click="openCreateDialog">
          新增
        </ElButton>
      </template>
      <template #status="{ row }">
        <ElTag :type="row.status === 1 ? 'success' : 'info'">
          {{ resolveCustomerStatusText(row.status) }}
        </ElTag>
      </template>
      <template #actions="{ row }">
        <div class="flex flex-wrap items-center gap-2">
          <ElButton link type="primary" @click="openDetailDialog(row)">
            详情
          </ElButton>
          <template v-if="canManage">
            <ElButton link type="primary" @click="openEditDialog(row)">
              编辑
            </ElButton>
            <ElButton
              link
              :loading="loadingStatusIds[row.id]"
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="handleStatusChange(row, row.status === 1 ? 0 : 1)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </ElButton>
            <ElButton link type="primary" @click="openResetPasswordDialog(row)">
              重置登录密码
            </ElButton>
            <ElButton
              link
              type="primary"
              @click="openResetPayPasswordDialog(row)"
            >
              重置支付密码
            </ElButton>
            <ElButton link type="danger" @click="handleDelete(row)">
              删除
            </ElButton>
          </template>
        </div>
      </template>
    </CustomerGrid>

    <CustomerDialog
      v-model:visible="dialogVisible"
      :customer="editingCustomer"
      :mode="dialogMode"
      @saved="handleDialogSaved"
    />
    <CustomerDetailDialog v-model:visible="detailVisible" :detail="detail" />
    <ResetPasswordDialog
      v-model:visible="resetPasswordVisible"
      :customer="selectedCustomer"
      @saved="handleDialogSaved"
    />
    <ResetPayPasswordDialog
      v-model:visible="resetPayPasswordVisible"
      :customer="selectedCustomer"
      @saved="handleDialogSaved"
    />
  </Page>
</template>
