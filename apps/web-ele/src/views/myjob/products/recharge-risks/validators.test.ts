import { describe, expect, it, vi } from 'vitest';

import {
  buildRechargeRiskRuleFormRules,
  RECHARGE_RISK_ACCOUNT_MAX_LENGTH,
  RECHARGE_RISK_GOODS_KEYWORD_MAX_LENGTH,
  RECHARGE_RISK_REASON_MAX_LENGTH,
  validateRechargeRiskStatus,
  validateRechargeRiskText,
} from './validators';

describe('recharge risk validators', () => {
  it('requires trimmed text values', () => {
    expect(validateRechargeRiskText('   ', '充值账号', 255)).toBe(
      '充值账号不能为空',
    );
    expect(validateRechargeRiskText(' abc ', '充值账号', 255)).toBe('');
  });

  it('enforces rune length limits', () => {
    expect(
      validateRechargeRiskText(
        'a'.repeat(RECHARGE_RISK_ACCOUNT_MAX_LENGTH + 1),
        '充值账号',
        RECHARGE_RISK_ACCOUNT_MAX_LENGTH,
      ),
    ).toBe('充值账号不能超过255个字符');
    expect(
      validateRechargeRiskText(
        '剪'.repeat(RECHARGE_RISK_GOODS_KEYWORD_MAX_LENGTH + 1),
        '商品关键词',
        RECHARGE_RISK_GOODS_KEYWORD_MAX_LENGTH,
      ),
    ).toBe('商品关键词不能超过255个字符');
    expect(
      validateRechargeRiskText(
        '错'.repeat(RECHARGE_RISK_REASON_MAX_LENGTH + 1),
        '风控原因',
        RECHARGE_RISK_REASON_MAX_LENGTH,
      ),
    ).toBe('风控原因不能超过512个字符');
  });

  it('allows only enabled and disabled status values', () => {
    expect(validateRechargeRiskStatus(1)).toBe('');
    expect(validateRechargeRiskStatus(0)).toBe('');
    expect(validateRechargeRiskStatus('1')).toBe('');
    expect(validateRechargeRiskStatus('0')).toBe('');
    expect(validateRechargeRiskStatus('')).toBe('状态值错误');
    expect(validateRechargeRiskStatus(2)).toBe('状态值错误');
  });

  it('builds element-plus rules that report validation errors', () => {
    const callback = vi.fn();
    const rules = buildRechargeRiskRuleFormRules();

    rules.account[0]?.validator?.({}, '   ', callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error));
    expect(callback.mock.calls[0]?.[0]).toMatchObject({
      message: '充值账号不能为空',
    });
  });
});
