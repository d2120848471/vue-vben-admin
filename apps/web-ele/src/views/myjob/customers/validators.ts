import type {
  CustomerFormState,
  CustomerPasswordFormState,
  CustomerPayPasswordFormState,
} from './types';

import { CUSTOMER_COMPANY_NAME_MAX_LENGTH, CUSTOMER_STATUS } from './constants';

type RuleCallback = (error?: Error) => void;

export const CUSTOMER_LOGIN_PASSWORD_MESSAGE =
  '登录密码必须字母开头，6-10 位，支持字母、数字、下划线';

/**
 * 客户公司/店铺名称和后端保持 100 字符上限，按字符数而不是字节数计算。
 */
export function validateCustomerCompanyName(value: unknown) {
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
 * 后台新增/编辑客户同样使用客户侧手机号格式，避免列表检索和认证账号不一致。
 */
export function validateCustomerPhone(value: unknown) {
  return /^1\d{10}$/.test(String(value ?? '').trim())
    ? ''
    : '请输入 1 开头的 11 位手机号';
}

/**
 * 登录密码规则与客户注册、忘记密码保持一致。
 */
export function validateCustomerLoginPassword(value: unknown) {
  return /^[A-Za-z][\dA-Za-z_]{5,9}$/.test(String(value ?? '').trim())
    ? ''
    : CUSTOMER_LOGIN_PASSWORD_MESSAGE;
}

/**
 * 支付密码固定为 6 位数字，编辑资料时不允许复用该字段。
 */
export function validateCustomerPayPassword(value: unknown) {
  return /^\d{6}$/.test(String(value ?? '').trim())
    ? ''
    : '支付密码必须是 6 位数字';
}

/**
 * 确认密码必须和原字段一致，后台表单没有 zod dependencies，只能通过闭包读取同一表单状态。
 */
function validateMatchingValue(
  value: unknown,
  expected: unknown,
  message: string,
) {
  return String(value ?? '').trim() === String(expected ?? '').trim()
    ? ''
    : message;
}

/**
 * 状态只允许启用/禁用两个后端枚举值。
 */
export function validateCustomerStatus(value: unknown) {
  const normalized = Number(value);
  return normalized === CUSTOMER_STATUS.ENABLED ||
    normalized === CUSTOMER_STATUS.DISABLED
    ? ''
    : '状态值错误';
}

function createRule(validator: (value: unknown) => string, trigger = 'blur') {
  return {
    trigger,
    validator: (_rule: unknown, value: unknown, callback: RuleCallback) => {
      const message = validator(value);
      callback(message ? new Error(message) : undefined);
    },
  };
}

function createMatchingRule(
  validator: (value: unknown) => string,
  getExpectedValue: () => unknown,
  mismatchMessage: string,
  trigger = 'blur',
) {
  return {
    trigger,
    validator: (_rule: unknown, value: unknown, callback: RuleCallback) => {
      const message =
        validator(value) ||
        validateMatchingValue(value, getExpectedValue(), mismatchMessage);
      callback(message ? new Error(message) : undefined);
    },
  };
}

/**
 * 新增客户需要校验登录密码和支付密码；编辑客户只允许编辑基础资料。
 */
export function buildCustomerFormRules(
  mode: 'create' | 'edit',
  form?: Pick<
    CustomerFormState,
    'confirm_password' | 'confirm_pay_password' | 'password' | 'pay_password'
  >,
) {
  return {
    company_name: [createRule(validateCustomerCompanyName)],
    confirm_password:
      mode === 'create'
        ? [
            createMatchingRule(
              validateCustomerLoginPassword,
              () => form?.password,
              '两次登录密码不一致',
            ),
          ]
        : [],
    confirm_pay_password:
      mode === 'create'
        ? [
            createMatchingRule(
              validateCustomerPayPassword,
              () => form?.pay_password,
              '两次支付密码不一致',
            ),
          ]
        : [],
    password:
      mode === 'create' ? [createRule(validateCustomerLoginPassword)] : [],
    pay_password:
      mode === 'create' ? [createRule(validateCustomerPayPassword)] : [],
    phone: [createRule(validateCustomerPhone)],
    status: [createRule(validateCustomerStatus, 'change')],
  };
}

/**
 * 登录密码重置弹窗独立维护规则，避免新增/编辑表单模式影响重置行为。
 */
export function buildCustomerPasswordRules(
  form?: Pick<CustomerPasswordFormState, 'confirm_password' | 'password'>,
) {
  return {
    confirm_password: [
      createMatchingRule(
        validateCustomerLoginPassword,
        () => form?.password,
        '两次登录密码不一致',
      ),
    ],
    password: [createRule(validateCustomerLoginPassword)],
  };
}

/**
 * 支付密码重置弹窗只校验 6 位数字，不触发客户登录态清理。
 */
export function buildCustomerPayPasswordRules(
  form?: Pick<
    CustomerPayPasswordFormState,
    'confirm_pay_password' | 'pay_password'
  >,
) {
  return {
    confirm_pay_password: [
      createMatchingRule(
        validateCustomerPayPassword,
        () => form?.pay_password,
        '两次支付密码不一致',
      ),
    ],
    pay_password: [createRule(validateCustomerPayPassword)],
  };
}
