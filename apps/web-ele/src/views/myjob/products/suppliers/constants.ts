export interface SupplierPlatformOption {
  label: string;
  value: string;
}

export const TAX_OPTIONS: SupplierPlatformOption[] = [
  { label: '全部', value: '' },
  { label: '含税', value: '1' },
  { label: '未税', value: '0' },
];

export const STATUS_OPTIONS: SupplierPlatformOption[] = [
  { label: '全部', value: '' },
  { label: '启用', value: '1' },
  { label: '停用', value: '0' },
];

export const CONNECT_STATUS_OPTIONS: SupplierPlatformOption[] = [
  { label: '全部', value: '' },
  { label: '未验证', value: '0' },
  { label: '正常', value: '1' },
  { label: '异常', value: '2' },
];
