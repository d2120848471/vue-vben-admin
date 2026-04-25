import type { OrderListQuery, OrderListResult } from './types';

import { requestClient } from '#/api/request';

/**
 * 订单管理-订单记录：获取订单列表（分页/筛选/统计）
 * GET /admin/orders
 */
export async function getOrderListApi(params: OrderListQuery) {
  return requestClient.get<OrderListResult>('/admin/orders', {
    params,
  });
}
