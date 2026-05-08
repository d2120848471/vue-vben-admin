import { z } from '@vben/common-ui';

import { CUSTOMER_COMPANY_NAME_MAX_LENGTH } from './constants';

export const CUSTOMER_LOGIN_PASSWORD_MESSAGE =
  '登录密码必须字母开头，6-10 位，支持字母、数字、下划线';

/**
 * 客户手机号沿用后端 V1 约束：1 开头的 11 位数字。
 */
export function validatePhone(value: unknown) {
  return /^1\d{10}$/.test(String(value ?? '').trim())
    ? ''
    : '请输入 1 开头的 11 位手机号';
}

/**
 * 短信验证码只接受 6 位数字，避免把空格或字母提交给后端。
 */
export function validateSMSCode(value: unknown) {
  return /^\d{6}$/.test(String(value ?? '').trim())
    ? ''
    : '请输入 6 位数字验证码';
}

/**
 * 登录密码必须字母开头，长度和字符集与后端校验保持一致。
 */
export function validateCustomerLoginPassword(value: unknown) {
  return /^[A-Za-z][\dA-Za-z_]{5,9}$/.test(String(value ?? '').trim())
    ? ''
    : CUSTOMER_LOGIN_PASSWORD_MESSAGE;
}

/**
 * 支付密码是交易安全字段，只允许固定 6 位数字。
 */
export function validatePayPassword(value: unknown) {
  return /^\d{6}$/.test(String(value ?? '').trim())
    ? ''
    : '支付密码必须是 6 位数字';
}

/**
 * 公司/店铺名称限制按字符数计算，避免中文名称被字节长度误伤。
 */
export function validateCompanyName(value: unknown) {
  const text = String(value ?? '').trim();
  if (!text) {
    return '请输入公司/店铺名称';
  }
  if ([...text].length > CUSTOMER_COMPANY_NAME_MAX_LENGTH) {
    return `公司/店铺名称不能超过 ${CUSTOMER_COMPANY_NAME_MAX_LENGTH} 个字符`;
  }
  return '';
}

/**
 * 确认密码类字段统一先 trim 再比较，避免用户复制时带空格导致误判。
 */
export function validateMatchingValue(
  value: unknown,
  expected: unknown,
  message: string,
) {
  return String(value ?? '').trim() === String(expected ?? '').trim()
    ? ''
    : message;
}

/**
 * 协议勾选只由前端限制，后端 V1 不保存该字段。
 */
export function validateAgreementAccepted(value: unknown) {
  return value === true ? '' : '请先同意服务协议';
}

function schemaFromValidator(
  validator: (value: unknown) => string,
  fallbackMessage: string,
) {
  return z.string().refine((value) => !validator(value), {
    message: fallbackMessage,
  });
}

export const phoneRule = schemaFromValidator(
  validatePhone,
  '请输入 1 开头的 11 位手机号',
);
export const smsCodeRule = schemaFromValidator(
  validateSMSCode,
  '请输入 6 位数字验证码',
);
export const loginPasswordRule = schemaFromValidator(
  validateCustomerLoginPassword,
  CUSTOMER_LOGIN_PASSWORD_MESSAGE,
);
export const payPasswordRule = schemaFromValidator(
  validatePayPassword,
  '支付密码必须是 6 位数字',
);
export const companyNameRule = z.string().superRefine((value, context) => {
  const message = validateCompanyName(value);
  if (message) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message,
    });
  }
});
