import { requestClient } from '#/api/request';

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
}

export interface ListQuery {
  page?: number;
  page_size?: number;
}

export interface PagedResult<T> {
  list: T[];
  pagination: Pagination;
}

export type SortAction = 'bottom' | 'down' | 'top' | 'up';

// 后端这批状态/授权接口统一切到了 PATCH，这里集中走底层 request。
export function patchAdminApi<T = unknown>(url: string, data?: unknown) {
  return requestClient.request<T>(url, {
    ...(data === undefined ? {} : { data }),
    method: 'PATCH',
  });
}
