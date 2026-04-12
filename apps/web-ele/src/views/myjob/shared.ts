import dayjs from 'dayjs';

// MyJob 后台页面只做局部间距收口，避免影响公共 Page/Grid 默认布局。
export const MYJOB_GRID_CLASS = 'p-0';
export const MYJOB_PAGE_CONTENT_CLASS = 'p-0';

export interface GridPageParams {
  page?: {
    currentPage?: number;
    pageSize?: number;
  };
}

export function resolvePageParams(params: GridPageParams) {
  return {
    page: params.page?.currentPage ?? 1,
    page_size: params.page?.pageSize ?? 20,
  };
}

export function toGridResult<T>(items: T[], total: number) {
  return {
    items,
    total,
  };
}

export function keywordMatch(
  keyword: string | undefined,
  values: Array<null | number | string | undefined>,
) {
  const normalizedKeyword = String(keyword ?? '')
    .trim()
    .toLowerCase();
  if (!normalizedKeyword) {
    return true;
  }
  return values.some((value) =>
    String(value ?? '')
      .toLowerCase()
      .includes(normalizedKeyword),
  );
}

export function formatDateTime(value?: string) {
  if (!value) {
    return '--';
  }
  return dayjs(value).isValid()
    ? dayjs(value).format('YYYY-MM-DD HH:mm:ss')
    : value;
}

export function extractDateRange(range?: string[]) {
  if (!range || range.length !== 2) {
    return {
      end_time: '',
      start_time: '',
    };
  }
  return {
    end_time: dayjs(range[1]).format('YYYY-MM-DD HH:mm:ss'),
    start_time: dayjs(range[0]).format('YYYY-MM-DD HH:mm:ss'),
  };
}
