import { describe, expect, it } from 'vitest';

import {
  buildRechargeRiskRecordColumns,
  buildRechargeRiskRecordFilterSchema,
  buildRechargeRiskRuleColumns,
  buildRechargeRiskRuleFilterSchema,
  RECHARGE_RISK_STATUS_OPTIONS,
  resolveRechargeRiskStatusText,
} from './schemas';

describe('recharge risk schemas', () => {
  it('builds rule filter schema', () => {
    expect(buildRechargeRiskRuleFilterSchema()).toMatchObject([
      { fieldName: 'account', label: '充值账号' },
      { fieldName: 'goods_keyword', label: '商品关键词' },
      { fieldName: 'status', label: '状态' },
    ]);
    expect(RECHARGE_RISK_STATUS_OPTIONS).toEqual([
      { label: '全部', value: '' },
      { label: '启用', value: '1' },
      { label: '停用', value: '0' },
    ]);
  });

  it('builds rule columns with operation slots', () => {
    const columns = buildRechargeRiskRuleColumns();
    expect(columns.map((column) => column.field)).toEqual([
      'account',
      'goods_keyword',
      'hit_count',
      'reason',
      'status',
      'created_by_name',
      'updated_by_name',
      'created_at',
      'updated_at',
      'actions',
    ]);
    expect(columns.find((column) => column.field === 'status')).toMatchObject({
      slots: { default: 'status' },
    });
    expect(columns.find((column) => column.field === 'actions')).toMatchObject({
      fixed: 'right',
      slots: { default: 'actions' },
    });
  });

  it('builds record filter schema and columns', () => {
    expect(buildRechargeRiskRecordFilterSchema()).toMatchObject([
      { fieldName: 'account', label: '充值账号' },
      { fieldName: 'goods_keyword', label: '商品关键词' },
      { fieldName: 'date_range', label: '拦截时间' },
    ]);
    expect(
      buildRechargeRiskRecordColumns().map((column) => column.field),
    ).toEqual([
      'order_no',
      'account',
      'matched_keyword',
      'goods_code',
      'goods_name',
      'reason',
      'rule_id',
      'intercepted_at',
    ]);
  });

  it('resolves status text fallback', () => {
    expect(resolveRechargeRiskStatusText(1, '')).toBe('启用');
    expect(resolveRechargeRiskStatusText(0, '')).toBe('停用');
    expect(resolveRechargeRiskStatusText(1, '已启用')).toBe('已启用');
  });
});
