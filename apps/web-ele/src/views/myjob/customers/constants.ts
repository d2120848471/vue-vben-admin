export const CUSTOMER_MANAGE_AUTH_CODE = 'customer.manage';
export const CUSTOMER_COMPANY_NAME_MAX_LENGTH = 100;

export const CUSTOMER_STATUS = {
  DISABLED: 0,
  ENABLED: 1,
} as const;

export const CUSTOMER_STATUS_TEXT: Record<number, string> = {
  [CUSTOMER_STATUS.DISABLED]: '禁用',
  [CUSTOMER_STATUS.ENABLED]: '启用',
};
