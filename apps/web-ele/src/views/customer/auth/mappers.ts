import type {
  CustomerForgotPasswordPayload,
  CustomerLoginPayload,
  CustomerRegisterPayload,
} from '#/api/modules/customer/auth';

function trimValue(value: unknown) {
  return String(value ?? '').trim();
}

/**
 * 登录接口只接收手机号和登录密码，提交前统一去掉首尾空格。
 */
export function buildCustomerLoginPayload(
  formValues: Record<string, any>,
): CustomerLoginPayload {
  return {
    password: trimValue(formValues.password),
    phone: trimValue(formValues.phone),
  };
}

/**
 * 协议勾选只由前端限制，后端 V1 不接收该字段，所以构造 payload 时必须剔除。
 */
export function buildCustomerRegisterPayload(
  formValues: Record<string, any>,
): CustomerRegisterPayload {
  return {
    company_name: trimValue(formValues.company_name),
    confirm_password: trimValue(formValues.confirm_password),
    confirm_pay_password: trimValue(formValues.confirm_pay_password),
    password: trimValue(formValues.password),
    pay_password: trimValue(formValues.pay_password),
    phone: trimValue(formValues.phone),
    sms_code: trimValue(formValues.sms_code),
  };
}

/**
 * 找回密码只提交短信验证码和新登录密码，不携带客户登录态字段。
 */
export function buildCustomerForgotPasswordPayload(
  formValues: Record<string, any>,
): CustomerForgotPasswordPayload {
  return {
    confirm_password: trimValue(formValues.confirm_password),
    password: trimValue(formValues.password),
    phone: trimValue(formValues.phone),
    sms_code: trimValue(formValues.sms_code),
  };
}
