import type { GridPageParams } from '../../../shared';

import type { ProductGoodsChannelPriceChangeItem } from '#/api/modules/admin/products/price-changes';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getProductGoodsChannelPriceChangeListApi } from '#/api/modules/admin/products/price-changes';

import { MYJOB_GRID_CLASS, toGridResult } from '../../../shared';
import { buildPriceChangeListQuery } from '../mappers';
import {
  buildPriceChangeColumns,
  buildPriceChangeFilterSchema,
} from '../schemas';

/**
 * 自动改价记录页面只读展示，不承载编辑状态；组合式函数只负责 Grid 配置和查询编排。
 */
export function usePriceChangePage() {
  const [PriceChangeGrid] = useVbenVxeGrid<ProductGoodsChannelPriceChangeItem>({
    formOptions: {
      schema: buildPriceChangeFilterSchema(),
    },
    gridClass: MYJOB_GRID_CLASS,
    gridOptions: {
      columns: buildPriceChangeColumns(),
      pagerConfig: {},
      proxyConfig: {
        ajax: {
          query: async (
            params: GridPageParams,
            formValues: Record<string, any>,
          ) => {
            const result = await getProductGoodsChannelPriceChangeListApi(
              buildPriceChangeListQuery(params, formValues),
            );
            return toGridResult(
              result.list ?? [],
              result.pagination?.total ?? 0,
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

  return {
    PriceChangeGrid,
  };
}
