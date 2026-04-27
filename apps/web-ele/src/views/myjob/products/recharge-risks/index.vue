<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { ElButton, ElSwitch, ElTabPane, ElTabs } from 'element-plus';

import { MYJOB_PAGE_CONTENT_CLASS } from '../../shared';
import RechargeRiskRuleDialog from './components/RechargeRiskRuleDialog.vue';
import { useRechargeRiskPage } from './composables/useRechargeRiskPage';
import { resolveRechargeRiskStatusText } from './schemas';

const {
  activeTab,
  canManage,
  dialogVisible,
  editingRule,
  handleDelete,
  handleDialogSaved,
  handleDialogVisibleChange,
  handleStatusChange,
  loadingStatusIds,
  openCreateDialog,
  openEditDialog,
  recordGridMounted,
  RecordGrid,
  RuleGrid,
} = useRechargeRiskPage();
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <ElTabs v-model="activeTab">
      <ElTabPane label="风控管理" name="rules">
        <RuleGrid>
          <template #toolbar-actions>
            <ElButton v-if="canManage" type="primary" @click="openCreateDialog">
              新增
            </ElButton>
          </template>

          <template #status="{ row }">
            <ElSwitch
              v-if="canManage"
              :active-value="1"
              :inactive-value="0"
              :loading="loadingStatusIds[row.id]"
              :model-value="row.status"
              active-text="启用"
              inactive-text="停用"
              inline-prompt
              @change="(value) => handleStatusChange(row, Number(value))"
            />
            <span v-else>
              {{ resolveRechargeRiskStatusText(row.status, row.status_text) }}
            </span>
          </template>

          <template #actions="{ row }">
            <div v-if="canManage" class="flex items-center gap-3">
              <ElButton link type="primary" @click="openEditDialog(row)">
                编辑
              </ElButton>
              <ElButton link type="danger" @click="handleDelete(row)">
                删除
              </ElButton>
            </div>
          </template>
        </RuleGrid>
      </ElTabPane>

      <ElTabPane label="风控记录" name="records">
        <RecordGrid v-if="recordGridMounted" />
      </ElTabPane>
    </ElTabs>

    <RechargeRiskRuleDialog
      :editing-rule="editingRule"
      :visible="dialogVisible"
      @saved="handleDialogSaved"
      @update:visible="handleDialogVisibleChange"
    />
  </Page>
</template>
