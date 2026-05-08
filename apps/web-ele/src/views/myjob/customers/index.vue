<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElSwitch,
} from 'element-plus';

import { MYJOB_PAGE_CONTENT_CLASS } from '../shared';
import CustomerDetailDialog from './components/CustomerDetailDialog.vue';
import CustomerDialog from './components/CustomerDialog.vue';
import ResetPasswordDialog from './components/ResetPasswordDialog.vue';
import ResetPayPasswordDialog from './components/ResetPayPasswordDialog.vue';
import { useCustomerPage } from './composables/useCustomerPage';

const {
  canManage,
  CustomerGrid,
  detail,
  detailVisible,
  dialogMode,
  dialogVisible,
  editingCustomer,
  handleDialogSaved,
  handleMoreAction,
  handleStatusSwitchChange,
  loadingStatusIds,
  openCreateDialog,
  openDetailDialog,
  openEditDialog,
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
        <ElSwitch
          :aria-label="row.status === 1 ? '禁用客户' : '启用客户'"
          :disabled="!canManage || loadingStatusIds[row.id]"
          :loading="loadingStatusIds[row.id]"
          :model-value="row.status === 1"
          @change="(value) => handleStatusSwitchChange(row, value === true)"
        />
      </template>
      <template #actions="{ row }">
        <div
          class="flex items-center gap-2 whitespace-nowrap"
          data-test="customer-row-actions"
        >
          <ElButton link type="primary" @click="openDetailDialog(row)">
            详情
          </ElButton>
          <template v-if="canManage">
            <ElButton link type="primary" @click="openEditDialog(row)">
              编辑
            </ElButton>
            <ElDropdown
              trigger="click"
              @command="(action) => handleMoreAction(row, action)"
            >
              <ElButton link type="primary">更多</ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="reset-password">
                    重置登录密码
                  </ElDropdownItem>
                  <ElDropdownItem command="reset-pay-password">
                    重置支付密码
                  </ElDropdownItem>
                  <ElDropdownItem command="delete" divided>
                    删除
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
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
