import type { GridPageParams } from '../../shared';

import type {
  CustomerDetail,
  CustomerListItem,
} from '#/api/modules/admin/customers';

import { computed, reactive, ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import { ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteCustomerApi,
  getCustomerDetailApi,
  getCustomerListApi,
  updateCustomerStatusApi,
} from '#/api/modules/admin/customers';

import { MYJOB_GRID_CLASS, toGridResult } from '../../shared';
import { CUSTOMER_MANAGE_AUTH_CODE } from '../constants';
import { buildCustomerListQuery } from '../mappers';
import { buildCustomerColumns, buildCustomerFilterSchema } from '../schemas';

/**
 * 客户列表页状态和请求编排集中在这里，页面 SFC 只保留 Grid 插槽和弹窗装配。
 */
export function useCustomerPage() {
  const accessStore = useAccessStore();
  const canManage = computed(() =>
    accessStore.accessCodes.includes(CUSTOMER_MANAGE_AUTH_CODE),
  );
  const dialogVisible = ref(false);
  const dialogMode = ref<'create' | 'edit'>('create');
  const editingCustomer = ref<CustomerListItem | null>(null);
  const detailVisible = ref(false);
  const detail = ref<CustomerDetail | null>(null);
  const resetPasswordVisible = ref(false);
  const resetPayPasswordVisible = ref(false);
  const selectedCustomer = ref<CustomerListItem | null>(null);
  const loadingStatusIds = reactive<Record<number, boolean>>({});

  function openCreateDialog() {
    dialogMode.value = 'create';
    editingCustomer.value = null;
    dialogVisible.value = true;
  }

  function openEditDialog(row: CustomerListItem) {
    dialogMode.value = 'edit';
    editingCustomer.value = row;
    dialogVisible.value = true;
  }

  async function openDetailDialog(row: CustomerListItem) {
    detail.value = await getCustomerDetailApi(row.id);
    detailVisible.value = true;
  }

  function openResetPasswordDialog(row: CustomerListItem) {
    selectedCustomer.value = row;
    resetPasswordVisible.value = true;
  }

  function openResetPayPasswordDialog(row: CustomerListItem) {
    selectedCustomer.value = row;
    resetPayPasswordVisible.value = true;
  }

  async function handleStatusChange(row: CustomerListItem, status: number) {
    if (loadingStatusIds[row.id]) {
      return;
    }
    const confirmed = await ElMessageBox.confirm(
      status === 1
        ? `确认启用客户 ${row.company_name} 吗？`
        : `确认禁用客户 ${row.company_name} 吗？禁用后客户旧登录态会失效。`,
      '状态确认',
      { type: 'warning' },
    )
      .then(() => true)
      .catch(() => false);
    if (!confirmed) {
      return;
    }
    loadingStatusIds[row.id] = true;
    try {
      await updateCustomerStatusApi(row.id, status);
      ElMessage.success(
        status === 1 ? '客户已启用' : '客户已禁用，旧登录态已失效',
      );
    } finally {
      try {
        await gridApi.reload();
      } finally {
        loadingStatusIds[row.id] = false;
      }
    }
  }

  async function handleDelete(row: CustomerListItem) {
    await ElMessageBox.confirm(
      `确认删除客户 ${row.company_name} 吗？删除后手机号仍会被占用。`,
      '删除确认',
      { type: 'warning' },
    );
    await deleteCustomerApi(row.id);
    ElMessage.success('客户已移入回收站');
    await gridApi.reload();
  }

  async function handleDialogSaved() {
    await gridApi.reload();
  }

  const [CustomerGrid, gridApi] = useVbenVxeGrid<CustomerListItem>({
    formOptions: { schema: buildCustomerFilterSchema() },
    gridClass: MYJOB_GRID_CLASS,
    gridOptions: {
      columns: buildCustomerColumns(),
      pagerConfig: {},
      proxyConfig: {
        ajax: {
          query: async (
            params: GridPageParams,
            formValues: Record<string, any>,
          ) => {
            const result = await getCustomerListApi(
              buildCustomerListQuery(params, formValues),
            );
            return toGridResult(
              result.list ?? [],
              result.pagination?.total ?? 0,
            );
          },
        },
      },
      toolbarConfig: { refresh: true, search: true, zoom: true },
    },
  });

  return {
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
  };
}
