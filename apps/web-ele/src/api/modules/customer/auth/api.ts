import type {
  CustomerAuthResult,
  CustomerForgotPasswordPayload,
  CustomerLoginPayload,
  CustomerRegisterPayload,
  CustomerSMSPayload,
} from './types';

import { customerAuthRequestClient } from '#/api/request';

/**
 * 客户侧认证：发送注册或忘记密码短信验证码。
 */
export async function sendCustomerSMSApi(data: CustomerSMSPayload) {
  return customerAuthRequestClient.post('/customer/auth/sms/send', data);
}

/**
 * 客户侧认证：注册成功后返回客户 token 和基础信息。
 */
export async function registerCustomerApi(data: CustomerRegisterPayload) {
  return customerAuthRequestClient.post<CustomerAuthResult>(
    '/customer/auth/register',
    data,
  );
}

/**
 * 客户侧认证：手机号和登录密码登录。
 */
export async function loginCustomerApi(data: CustomerLoginPayload) {
  return customerAuthRequestClient.post<CustomerAuthResult>(
    '/customer/auth/login',
    data,
  );
}

/**
 * 客户侧认证：短信验证码重置登录密码。
 */
export async function forgotCustomerPasswordApi(
  data: CustomerForgotPasswordPayload,
) {
  return customerAuthRequestClient.post('/customer/auth/forgot-password', data);
}
