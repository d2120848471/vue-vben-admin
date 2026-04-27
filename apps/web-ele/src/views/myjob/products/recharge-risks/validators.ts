export const RECHARGE_RISK_ACCOUNT_MAX_LENGTH = 255;
export const RECHARGE_RISK_GOODS_KEYWORD_MAX_LENGTH = 255;
export const RECHARGE_RISK_REASON_MAX_LENGTH = 512;

type RuleCallback = (error?: Error) => void;

export function validateRechargeRiskText(
  value: unknown,
  label: string,
  maxLength: number,
) {
  const text = String(value ?? '').trim();
  if (!text) {
    return `${label}不能为空`;
  }
  if ([...text].length > maxLength) {
    return `${label}不能超过${maxLength}个字符`;
  }
  return '';
}

export function validateRechargeRiskStatus(value: unknown) {
  const normalized = String(value ?? '').trim();
  if (normalized !== '0' && normalized !== '1') {
    return '状态值错误';
  }
  return '';
}

function createTextRule(label: string, maxLength: number) {
  return {
    trigger: 'blur',
    validator: (_rule: unknown, value: unknown, callback: RuleCallback) => {
      const message = validateRechargeRiskText(value, label, maxLength);
      callback(message ? new Error(message) : undefined);
    },
  };
}

function createStatusRule() {
  return {
    trigger: 'change',
    validator: (_rule: unknown, value: unknown, callback: RuleCallback) => {
      const message = validateRechargeRiskStatus(value);
      callback(message ? new Error(message) : undefined);
    },
  };
}

/**
 * 规则弹窗的校验规则集中维护，确保新增和编辑使用同一套前端约束。
 */
export function buildRechargeRiskRuleFormRules() {
  return {
    account: [createTextRule('充值账号', RECHARGE_RISK_ACCOUNT_MAX_LENGTH)],
    goods_keyword: [
      createTextRule('商品关键词', RECHARGE_RISK_GOODS_KEYWORD_MAX_LENGTH),
    ],
    reason: [createTextRule('风控原因', RECHARGE_RISK_REASON_MAX_LENGTH)],
    status: [createStatusRule()],
  };
}
