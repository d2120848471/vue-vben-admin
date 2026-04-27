import type { GridPageParams } from '../../../shared';

import type {
  RechargeRiskRecordListItem,
  RechargeRiskRuleListItem,
} from '#/api/modules/admin/products/recharge-risks';

import { computed, reactive, ref, watch } from 'vue';

import { useAccessStore } from '@vben/stores';

import { ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteRechargeRiskRuleApi,
  getRechargeRiskRecordListApi,
  getRechargeRiskRuleListApi,
  updateRechargeRiskRuleStatusApi,
} from '#/api/modules/admin/products/recharge-risks';

import { MYJOB_GRID_CLASS, toGridResult } from '../../../shared';
import {
  buildRechargeRiskRecordListQuery,
  buildRechargeRiskRuleListQuery,
} from '../mappers';
import {
  buildRechargeRiskRecordColumns,
  buildRechargeRiskRecordFilterSchema,
  buildRechargeRiskRuleColumns,
  buildRechargeRiskRuleFilterSchema,
} from '../schemas';

const RECHARGE_RISK_AUTH_CODE = 'order.recharge_risk';

type RechargeRiskTabName = 'records' | 'rules';

/**
 * 充值风控页面的状态、请求编排和表格配置集中放在组合式函数中，
 * 让入口 SFC 只负责 tab、插槽和弹窗装配。
 */
export function useRechargeRiskPage() {
  const accessStore = useAccessStore();
  const canManage = computed(() =>
    accessStore.accessCodes.includes(RECHARGE_RISK_AUTH_CODE),
  );

  const activeTab = ref<RechargeRiskTabName>('rules');
  const dialogVisible = ref(false);
  const editingRule = ref<null | RechargeRiskRuleListItem>(null);
  const loadingStatusIds = reactive<Record<number, boolean>>({});
  const recordGridMounted = ref(false);

  watch(activeTab, (tabName) => {
    if (tabName === 'records') {
      recordGridMounted.value = true;
    }
  });

  function openCreateDialog() {
    editingRule.value = null;
    dialogVisible.value = true;
  }

  function openEditDialog(row: RechargeRiskRuleListItem) {
    editingRule.value = row;
    dialogVisible.value = true;
  }

  async function handleDelete(row: RechargeRiskRuleListItem) {
    await ElMessageBox.confirm(
      `确认删除风控规则 ${row.account} / ${row.goods_keyword} 吗？`,
      '删除确认',
      { type: 'warning' },
    );
    await deleteRechargeRiskRuleApi(row.id);
    ElMessage.success('风控规则已删除');
    await ruleGridApi.reload();
  }

  // 启停接口和列表刷新都完成后再清 loading，避免用户快速重复触发同一条规则。
  async function handleStatusChange(
    row: RechargeRiskRuleListItem,
    nextStatus: number | string,
  ) {
    if (loadingStatusIds[row.id]) {
      return;
    }
    const normalizedStatus = Number(nextStatus);
    if (normalizedStatus !== 0 && normalizedStatus !== 1) {
      return;
    }

    loadingStatusIds[row.id] = true;
    try {
      await updateRechargeRiskRuleStatusApi(row.id, normalizedStatus);
      ElMessage.success(
        normalizedStatus === 1 ? '风控规则已启用' : '风控规则已停用',
      );
    } finally {
      try {
        await ruleGridApi.reload();
      } finally {
        loadingStatusIds[row.id] = false;
      }
    }
  }

  function handleDialogVisibleChange(value: boolean) {
    dialogVisible.value = value;
    if (!value) {
      editingRule.value = null;
    }
  }

  async function handleDialogSaved() {
    await ruleGridApi.reload();
  }

  const [RuleGrid, ruleGridApi] = useVbenVxeGrid<RechargeRiskRuleListItem>({
    formOptions: {
      schema: buildRechargeRiskRuleFilterSchema(),
    },
    gridClass: MYJOB_GRID_CLASS,
    gridOptions: {
      columns: buildRechargeRiskRuleColumns(),
      pagerConfig: {},
      proxyConfig: {
        ajax: {
          query: async (
            params: GridPageParams,
            formValues: Record<string, any>,
          ) => {
            const result = await getRechargeRiskRuleListApi(
              buildRechargeRiskRuleListQuery(params, formValues),
            );
            return toGridResult(result.list ?? [], result.pagination.total);
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

  const [RecordGrid] = useVbenVxeGrid<RechargeRiskRecordListItem>({
    formOptions: {
      schema: buildRechargeRiskRecordFilterSchema(),
    },
    gridClass: MYJOB_GRID_CLASS,
    gridOptions: {
      columns: buildRechargeRiskRecordColumns(),
      pagerConfig: {},
      proxyConfig: {
        ajax: {
          query: async (
            params: GridPageParams,
            formValues: Record<string, any>,
          ) => {
            const result = await getRechargeRiskRecordListApi(
              buildRechargeRiskRecordListQuery(params, formValues),
            );
            return toGridResult(result.list ?? [], result.pagination.total);
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

  return {
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
  };
}
