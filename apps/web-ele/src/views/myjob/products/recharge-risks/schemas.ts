import { formatDateTime } from '../../shared';

export const RECHARGE_RISK_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '启用', value: '1' },
  { label: '停用', value: '0' },
];

export function resolveRechargeRiskStatusText(
  status: number,
  statusText?: string,
) {
  if (statusText) {
    return statusText;
  }
  return status === 1 ? '启用' : '停用';
}

export function buildRechargeRiskRuleFilterSchema() {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入充值账号',
      },
      fieldName: 'account',
      label: '充值账号',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入商品关键词',
      },
      fieldName: 'goods_keyword',
      label: '商品关键词',
    },
    {
      component: 'Select',
      componentProps: {
        options: RECHARGE_RISK_STATUS_OPTIONS,
        placeholder: '请选择状态',
      },
      fieldName: 'status',
      label: '状态',
    },
  ];
}

export function buildRechargeRiskRecordFilterSchema() {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入充值账号',
      },
      fieldName: 'account',
      label: '充值账号',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入商品关键词',
      },
      fieldName: 'goods_keyword',
      label: '商品关键词',
    },
    {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'date_range',
      label: '拦截时间',
    },
  ];
}

export function buildRechargeRiskRuleColumns() {
  return [
    { field: 'account', minWidth: 180, title: '充值账号' },
    { field: 'goods_keyword', minWidth: 160, title: '匹配关键词' },
    { field: 'hit_count', minWidth: 120, title: '已拦截次数' },
    { field: 'reason', minWidth: 220, title: '风控原因' },
    {
      field: 'status',
      minWidth: 140,
      slots: { default: 'status' },
      title: '状态',
    },
    { field: 'created_by_name', minWidth: 140, title: '创建人' },
    { field: 'updated_by_name', minWidth: 140, title: '更新人' },
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
      minWidth: 160,
      slots: { default: 'actions' },
      title: '操作',
    },
  ];
}

export function buildRechargeRiskRecordColumns() {
  return [
    { field: 'order_no', minWidth: 190, title: '订单号' },
    { field: 'account', minWidth: 180, title: '充值账号' },
    { field: 'matched_keyword', minWidth: 160, title: '拦截关键词' },
    { field: 'goods_code', minWidth: 140, title: '商品编码' },
    { field: 'goods_name', minWidth: 240, title: '商品名称' },
    { field: 'reason', minWidth: 220, title: '风控原因' },
    { field: 'rule_id', minWidth: 100, title: '规则 ID' },
    {
      field: 'intercepted_at',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatDateTime(cellValue),
      minWidth: 180,
      title: '拦截时间',
    },
  ];
}
