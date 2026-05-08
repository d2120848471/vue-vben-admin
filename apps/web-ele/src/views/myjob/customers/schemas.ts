import { formatDateTime } from '../shared';
import { CUSTOMER_STATUS_TEXT } from './constants';

export const CUSTOMER_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' },
];

export function resolveCustomerStatusText(status: number) {
  return CUSTOMER_STATUS_TEXT[status] ?? '未知';
}

export function buildCustomerFilterSchema() {
  return [
    {
      component: 'Input',
      componentProps: { placeholder: '请输入公司/店铺名称或手机号' },
      fieldName: 'keyword',
      label: '关键字',
    },
    {
      component: 'Select',
      componentProps: {
        options: CUSTOMER_STATUS_OPTIONS,
        placeholder: '请选择状态',
      },
      fieldName: 'status',
      label: '状态',
    },
  ];
}

export function buildCustomerTrashFilterSchema() {
  return [
    {
      component: 'Input',
      componentProps: { placeholder: '请输入公司/店铺名称或手机号' },
      fieldName: 'keyword',
      label: '关键字',
    },
  ];
}

function buildBaseColumns() {
  return [
    { field: 'id', minWidth: 90, title: 'ID' },
    { field: 'company_name', minWidth: 220, title: '公司/店铺名称' },
    { field: 'phone', minWidth: 150, title: '手机号' },
    {
      field: 'status',
      minWidth: 110,
      slots: { default: 'status' },
      title: '状态',
    },
    { field: 'last_login_ip', minWidth: 150, title: '最后登录 IP' },
    {
      field: 'last_login_at',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatDateTime(cellValue),
      minWidth: 180,
      title: '最后登录时间',
    },
    {
      field: 'created_at',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatDateTime(cellValue),
      minWidth: 180,
      title: '创建时间',
    },
    {
      field: 'updated_at',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatDateTime(cellValue),
      minWidth: 180,
      title: '更新时间',
    },
    {
      field: 'actions',
      fixed: 'right' as const,
      minWidth: 260,
      slots: { default: 'actions' },
      title: '操作',
    },
  ];
}

/**
 * 客户列表列定义集中维护，页面只负责挂载操作插槽。
 */
export function buildCustomerColumns() {
  return buildBaseColumns();
}

/**
 * 回收站沿用基础列，但页面操作插槽只放恢复动作。
 */
export function buildCustomerTrashColumns() {
  return buildBaseColumns();
}
