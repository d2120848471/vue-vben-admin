import type { SupplierPlatformOption } from './constants';

import type { SupplierPlatformTypeItem } from '#/api/modules/admin/products/suppliers';
import type { SubjectItem } from '#/api/modules/admin/subjects';

import { formatDateTime } from '../../shared';
import {
  CONNECT_STATUS_OPTIONS,
  STATUS_OPTIONS,
  TAX_OPTIONS,
} from './constants';

function buildFilterTypeOptions(
  platformTypeOptions: SupplierPlatformTypeItem[],
) {
  return [
    { label: '全部', value: '' },
    ...platformTypeOptions.map((item) => ({
      label: item.type_name,
      value: String(item.id),
    })),
  ];
}

function buildFilterSubjectOptions(subjectOptions: SubjectItem[]) {
  return [
    { label: '全部', value: '' },
    ...subjectOptions.map((item) => ({
      label: item.name,
      value: String(item.id),
    })),
  ];
}

/**
 * suppliers 页的筛选 schema 统一从这里生成，确保页面初始化和远端字典回填时字段配置一致。
 */
export function buildSupplierPlatformFilterSchema(options: {
  platformTypeOptions: SupplierPlatformTypeItem[];
  subjectOptions: SubjectItem[];
}) {
  const typeOptions = buildFilterTypeOptions(options.platformTypeOptions);
  const subjectOptions = buildFilterSubjectOptions(options.subjectOptions);

  return [
    {
      component: 'Input',
      fieldName: 'keyword',
      label: '平台名称',
      componentProps: {
        placeholder: '请输入平台名称',
      },
    },
    {
      component: 'Select',
      fieldName: 'type_id',
      label: '平台类型',
      componentProps: {
        options: typeOptions,
        placeholder: '请选择平台类型',
      },
    },
    {
      component: 'Select',
      fieldName: 'subject_id',
      label: '主体',
      componentProps: {
        options: subjectOptions,
        placeholder: '请选择主体',
      },
    },
    {
      component: 'Select',
      fieldName: 'has_tax',
      label: '含税状态',
      componentProps: {
        options: TAX_OPTIONS,
        placeholder: '请选择含税状态',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '渠道状态',
      componentProps: {
        options: STATUS_OPTIONS,
        placeholder: '请选择渠道状态',
      },
    },
    {
      component: 'Select',
      fieldName: 'connect_status',
      label: '对接状态',
      componentProps: {
        options: CONNECT_STATUS_OPTIONS,
        placeholder: '请选择对接状态',
      },
    },
  ];
}

/**
 * 这里集中定义 suppliers 列表列，避免页面 SFC 同时堆积列配置和动作处理。
 */
export function buildSupplierPlatformColumns() {
  return [
    { field: 'name', title: '平台名称', minWidth: 200 },
    { field: 'domain', title: '主域名', minWidth: 180 },
    { field: 'backup_domain', title: '备用域名', minWidth: 180 },
    { field: 'type_name', title: '平台类型', minWidth: 140 },
    { field: 'subject_name', title: '主体名称', minWidth: 140 },
    {
      field: 'has_tax',
      minWidth: 110,
      slots: { default: 'hasTax' },
      title: '含税状态',
    },
    {
      field: 'status',
      minWidth: 140,
      slots: { default: 'status' },
      title: '渠道状态',
    },
    {
      field: 'last_balance',
      minWidth: 150,
      slots: { default: 'balance' },
      title: '平台余额',
    },
    { field: 'threshold_amount', title: '余额阈值', minWidth: 140 },
    {
      field: 'connect_status_text',
      minWidth: 120,
      slots: { default: 'connectStatus' },
      title: '对接状态',
    },
    { field: 'last_balance_message', title: '最近结果说明', minWidth: 180 },
    {
      field: 'last_balance_at',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatDateTime(cellValue),
      title: '最近刷新时间',
      minWidth: 180,
    },
    { field: 'sort', title: '排序', minWidth: 100 },
    { field: 'crowd_name', title: '群名/备注', minWidth: 160 },
    {
      field: 'actions',
      fixed: 'right' as const,
      minWidth: 220,
      slots: { default: 'actions' },
      title: '操作',
    },
  ];
}

export function buildSupplierPlatformFilterOptions(options: {
  platformTypeOptions: SupplierPlatformTypeItem[];
  subjectOptions: SubjectItem[];
}): Record<'subjectOptions' | 'typeOptions', SupplierPlatformOption[]> {
  return {
    subjectOptions: buildFilterSubjectOptions(options.subjectOptions),
    typeOptions: buildFilterTypeOptions(options.platformTypeOptions),
  };
}
