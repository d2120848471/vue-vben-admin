import type { GridPageParams } from '../../shared';

import type { CustomerListItem } from '#/api/modules/admin/customers';

import { ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getCustomerTrashApi,
  restoreCustomerApi,
} from '#/api/modules/admin/customers';

import { MYJOB_GRID_CLASS, toGridResult } from '../../shared';
import { buildCustomerTrashQuery } from '../mappers';
import {
  buildCustomerTrashColumns,
  buildCustomerTrashFilterSchema,
} from '../schemas';

/**
 * 客户回收站只提供查询和恢复，不暴露编辑、启停、重置密码等普通列表动作。
 */
export function useCustomerTrashPage() {
  async function handleRestore(row: CustomerListItem) {
    await ElMessageBox.confirm(
      `确认恢复客户 ${row.company_name} 吗？恢复后客户保持禁用状态。`,
      '恢复确认',
      { type: 'warning' },
    );
    await restoreCustomerApi(row.id);
    ElMessage.success('客户已恢复');
    await gridApi.reload();
  }

  const [CustomerTrashGrid, gridApi] = useVbenVxeGrid<CustomerListItem>({
    formOptions: { schema: buildCustomerTrashFilterSchema() },
    gridClass: MYJOB_GRID_CLASS,
    gridOptions: {
      columns: buildCustomerTrashColumns(),
      pagerConfig: {},
      proxyConfig: {
        ajax: {
          query: async (
            params: GridPageParams,
            formValues: Record<string, any>,
          ) => {
            const result = await getCustomerTrashApi(
              buildCustomerTrashQuery(params, formValues),
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
    CustomerTrashGrid,
    handleRestore,
  };
}
