import { describe, expect, it } from 'vitest';

import {
  buildRechargeRiskRecordListQuery,
  buildRechargeRiskRuleListQuery,
  buildRechargeRiskRulePayload,
  toRechargeRiskRuleForm,
} from './mappers';

describe('recharge risk mappers', () => {
  it('builds trimmed rule list query params', () => {
    expect(
      buildRechargeRiskRuleListQuery(
        { page: { currentPage: 2, pageSize: 50 } },
        {
          account: ' risk-account-001 ',
          goods_keyword: ' 剪映 ',
          status: '1',
        },
      ),
    ).toEqual({
      account: 'risk-account-001',
      goods_keyword: '剪映',
      page: 2,
      page_size: 50,
      status: '1',
    });
  });

  it('omits empty rule filters and all-status filter', () => {
    expect(
      buildRechargeRiskRuleListQuery(
        { page: { currentPage: 1, pageSize: 20 } },
        { account: ' ', goods_keyword: '', status: '' },
      ),
    ).toEqual({
      page: 1,
      page_size: 20,
    });
  });

  it('builds record list query with time range', () => {
    expect(
      buildRechargeRiskRecordListQuery(
        { page: { currentPage: 3, pageSize: 30 } },
        {
          account: ' record-account ',
          date_range: ['2026-04-27 00:00:00', '2026-04-27 23:59:59'],
          goods_keyword: ' 微博 ',
        },
      ),
    ).toEqual({
      account: 'record-account',
      end_time: '2026-04-27 23:59:59',
      goods_keyword: '微博',
      page: 3,
      page_size: 30,
      start_time: '2026-04-27 00:00:00',
    });
  });

  it('builds trimmed payload and normalizes status', () => {
    expect(
      buildRechargeRiskRulePayload({
        account: ' risk-account-001 ',
        goods_keyword: ' 醒图 ',
        reason: ' 错误账号 ',
        status: '0' as unknown as number,
      }),
    ).toEqual({
      account: 'risk-account-001',
      goods_keyword: '醒图',
      reason: '错误账号',
      status: 0,
    });
  });

  it('creates default and editing form values', () => {
    expect(toRechargeRiskRuleForm()).toEqual({
      account: '',
      goods_keyword: '',
      reason: '',
      status: 1,
    });
    expect(
      toRechargeRiskRuleForm({
        account: 'risk-account-001',
        created_at: '2026-04-27 10:00:00',
        created_by_name: 'admin',
        goods_keyword: '剪映',
        hit_count: 3,
        id: 41,
        reason: '错误账号',
        status: 0,
        status_text: '停用',
        updated_at: '2026-04-27 11:00:00',
        updated_by_name: 'admin',
      }),
    ).toEqual({
      account: 'risk-account-001',
      goods_keyword: '剪映',
      reason: '错误账号',
      status: 0,
    });
  });
});
