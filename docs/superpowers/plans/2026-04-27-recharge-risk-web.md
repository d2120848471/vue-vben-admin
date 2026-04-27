# 商品管理充值风控前端 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `apps/web-ele` 的「商品管理」下新增「风控管理」菜单，页面内提供风控规则管理和风控记录查询两个 tab。

**Architecture:** 新增精确 API 域 `#/api/modules/admin/products/recharge-risks`，新增页面域 `views/myjob/products/recharge-risks`。页面 `index.vue` 只做 tab、Grid 和弹窗装配；列表查询映射、表格列、表单校验和弹窗提交分别放到 `mappers.ts`、`schemas.ts`、`validators.ts` 和 `components/RechargeRiskRuleDialog.vue`。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、Element Plus、Vben `Page`、`useVbenVxeGrid`、Vitest、pnpm workspace。

---

## File Structure

Create:

- `apps/web-ele/src/api/modules/admin/products/recharge-risks/api.ts`：风控规则和风控记录接口函数。
- `apps/web-ele/src/api/modules/admin/products/recharge-risks/types.ts`：后端 DTO、查询参数和 payload 类型。
- `apps/web-ele/src/api/modules/admin/products/recharge-risks/index.ts`：精确导出。
- `apps/web-ele/src/views/myjob/products/recharge-risks/types.ts`：当前页面私有表单状态类型。
- `apps/web-ele/src/views/myjob/products/recharge-risks/validators.ts`：规则弹窗字段校验与 Element Plus rules 构造。
- `apps/web-ele/src/views/myjob/products/recharge-risks/validators.test.ts`：校验规则测试。
- `apps/web-ele/src/views/myjob/products/recharge-risks/mappers.ts`：列表查询参数、表单 payload、编辑回填映射。
- `apps/web-ele/src/views/myjob/products/recharge-risks/mappers.test.ts`：映射测试。
- `apps/web-ele/src/views/myjob/products/recharge-risks/schemas.ts`：两个 tab 的搜索 schema 和表格列。
- `apps/web-ele/src/views/myjob/products/recharge-risks/schemas.test.ts`：schema 构造测试。
- `apps/web-ele/src/views/myjob/products/recharge-risks/components/RechargeRiskRuleDialog.vue`：新增/编辑规则弹窗。
- `apps/web-ele/src/views/myjob/products/recharge-risks/components/RechargeRiskRuleDialog.test.ts`：弹窗提交和回填测试。
- `apps/web-ele/src/views/myjob/products/recharge-risks/index.vue`：页面装配。
- `apps/web-ele/src/views/myjob/products/recharge-risks/index.test.ts`：页面 Grid、权限、删除和状态切换测试。

Modify:

- `apps/web-ele/src/api/myjob-api-contract.test.ts`：补充风控 API 合约测试。
- `apps/web-ele/src/router/routes/modules/products.ts`：商品管理下新增风控菜单路由，并在父级 authority 加 `order.recharge_risk`。
- `apps/web-ele/src/router/routes/modules/products.test.ts`：同步路由结构断言。

Do not modify:

- `apps/web-ele/src/api/modules/admin.ts`
- `packages/`
- `internal/`
- `scripts/`
- 后端项目 `/Users/denghong/Desktop/平时的项目/myjob`

---

### Task 1: API Domain

**Files:**

- Modify: `apps/web-ele/src/api/myjob-api-contract.test.ts`
- Create: `apps/web-ele/src/api/modules/admin/products/recharge-risks/api.ts`
- Create: `apps/web-ele/src/api/modules/admin/products/recharge-risks/types.ts`
- Create: `apps/web-ele/src/api/modules/admin/products/recharge-risks/index.ts`

- [ ] **Step 1: Write the failing API contract test**

Add this import block near the other product API imports in `apps/web-ele/src/api/myjob-api-contract.test.ts`:

```ts
import {
  addRechargeRiskRuleApi,
  deleteRechargeRiskRuleApi,
  getRechargeRiskRecordListApi,
  getRechargeRiskRuleListApi,
  updateRechargeRiskRuleApi,
  updateRechargeRiskRuleStatusApi,
} from '#/api/modules/admin/products/recharge-risks';
```

Add this test after the purchase limit endpoint test:

```ts
it('uses the recharge risk endpoints', async () => {
  requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
  requestClientMock.post.mockResolvedValueOnce({ id: 41 });
  requestClientMock.put.mockResolvedValueOnce(undefined);
  requestClientMock.request.mockResolvedValueOnce(undefined);
  requestClientMock.delete.mockResolvedValueOnce(undefined);
  requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });

  await getRechargeRiskRuleListApi({
    account: 'risk-account-001',
    goods_keyword: '剪映',
    page: 1,
    page_size: 20,
    status: '1',
  });
  await addRechargeRiskRuleApi({
    account: 'risk-account-001',
    goods_keyword: '剪映',
    reason: '客户多次提交错误账号',
    status: 1,
  });
  await updateRechargeRiskRuleApi(41, {
    account: 'risk-account-001',
    goods_keyword: '醒图',
    reason: '更新后的风控原因',
    status: 0,
  });
  await updateRechargeRiskRuleStatusApi(41, 1);
  await deleteRechargeRiskRuleApi(41);
  await getRechargeRiskRecordListApi({
    account: 'risk-account-001',
    end_time: '2026-04-27 23:59:59',
    goods_keyword: '醒图',
    page: 2,
    page_size: 30,
    start_time: '2026-04-27 00:00:00',
  });

  expect(requestClientMock.get).toHaveBeenNthCalledWith(
    1,
    '/admin/recharge-risks/rules',
    {
      params: {
        account: 'risk-account-001',
        goods_keyword: '剪映',
        page: 1,
        page_size: 20,
        status: '1',
      },
    },
  );
  expect(requestClientMock.post).toHaveBeenCalledWith(
    '/admin/recharge-risks/rules',
    {
      account: 'risk-account-001',
      goods_keyword: '剪映',
      reason: '客户多次提交错误账号',
      status: 1,
    },
  );
  expect(requestClientMock.put).toHaveBeenCalledWith(
    '/admin/recharge-risks/rules/41',
    {
      account: 'risk-account-001',
      goods_keyword: '醒图',
      reason: '更新后的风控原因',
      status: 0,
    },
  );
  expect(requestClientMock.request).toHaveBeenCalledWith(
    '/admin/recharge-risks/rules/41/status',
    {
      data: { status: 1 },
      method: 'PATCH',
    },
  );
  expect(requestClientMock.delete).toHaveBeenCalledWith(
    '/admin/recharge-risks/rules/41',
  );
  expect(requestClientMock.get).toHaveBeenNthCalledWith(
    2,
    '/admin/recharge-risks/records',
    {
      params: {
        account: 'risk-account-001',
        end_time: '2026-04-27 23:59:59',
        goods_keyword: '醒图',
        page: 2,
        page_size: 30,
        start_time: '2026-04-27 00:00:00',
      },
    },
  );
});
```

- [ ] **Step 2: Run the failing API contract test**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/api/myjob-api-contract.test.ts
```

Expected: FAIL with an import resolution error for `#/api/modules/admin/products/recharge-risks`.

- [ ] **Step 3: Create API types**

Create `apps/web-ele/src/api/modules/admin/products/recharge-risks/types.ts`:

```ts
import type { ListQuery } from '../../common';

export interface RechargeRiskRuleListQuery extends ListQuery {
  account?: string;
  goods_keyword?: string;
  status?: string;
}

export interface RechargeRiskRuleListItem {
  account: string;
  created_at: string;
  created_by_name: string;
  goods_keyword: string;
  hit_count: number;
  id: number;
  reason: string;
  status: number;
  status_text: string;
  updated_at: string;
  updated_by_name: string;
}

export interface RechargeRiskRulePayload {
  account: string;
  goods_keyword: string;
  reason: string;
  status: number;
}

export interface RechargeRiskRecordListQuery extends ListQuery {
  account?: string;
  end_time?: string;
  goods_keyword?: string;
  start_time?: string;
}

export interface RechargeRiskRecordListItem {
  account: string;
  goods_code: string;
  goods_name: string;
  id: number;
  intercepted_at: string;
  matched_keyword: string;
  order_no: string;
  reason: string;
  rule_id: number;
}
```

- [ ] **Step 4: Create API functions**

Create `apps/web-ele/src/api/modules/admin/products/recharge-risks/api.ts`:

```ts
import type { PagedResult } from '../../common';
import type {
  RechargeRiskRecordListItem,
  RechargeRiskRecordListQuery,
  RechargeRiskRuleListItem,
  RechargeRiskRuleListQuery,
  RechargeRiskRulePayload,
} from './types';

import { requestClient } from '#/api/request';

import { patchAdminApi } from '../../common';

/**
 * 商品管理-充值风控：获取规则列表（分页/筛选）。
 * GET /admin/recharge-risks/rules
 */
export async function getRechargeRiskRuleListApi(
  params: RechargeRiskRuleListQuery,
) {
  return requestClient.get<PagedResult<RechargeRiskRuleListItem>>(
    '/admin/recharge-risks/rules',
    { params },
  );
}

/**
 * 商品管理-充值风控：新增规则。
 * POST /admin/recharge-risks/rules
 */
export async function addRechargeRiskRuleApi(data: RechargeRiskRulePayload) {
  return requestClient.post<{ id: number }>(
    '/admin/recharge-risks/rules',
    data,
  );
}

/**
 * 商品管理-充值风控：编辑规则。
 * PUT /admin/recharge-risks/rules/:id
 */
export async function updateRechargeRiskRuleApi(
  id: number,
  data: RechargeRiskRulePayload,
) {
  return requestClient.put(`/admin/recharge-risks/rules/${id}`, data);
}

/**
 * 商品管理-充值风控：启用或停用规则。
 * PATCH /admin/recharge-risks/rules/:id/status
 */
export async function updateRechargeRiskRuleStatusApi(
  id: number,
  status: number,
) {
  return patchAdminApi(`/admin/recharge-risks/rules/${id}/status`, {
    status,
  });
}

/**
 * 商品管理-充值风控：删除规则。
 * DELETE /admin/recharge-risks/rules/:id
 */
export async function deleteRechargeRiskRuleApi(id: number) {
  return requestClient.delete(`/admin/recharge-risks/rules/${id}`);
}

/**
 * 商品管理-充值风控：获取拦截记录列表（分页/筛选）。
 * GET /admin/recharge-risks/records
 */
export async function getRechargeRiskRecordListApi(
  params: RechargeRiskRecordListQuery,
) {
  return requestClient.get<PagedResult<RechargeRiskRecordListItem>>(
    '/admin/recharge-risks/records',
    { params },
  );
}
```

- [ ] **Step 5: Create API index**

Create `apps/web-ele/src/api/modules/admin/products/recharge-risks/index.ts`:

```ts
export * from './api';
export * from './types';
```

- [ ] **Step 6: Run API contract test**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/api/myjob-api-contract.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit API domain**

Run:

```bash
git add apps/web-ele/src/api/myjob-api-contract.test.ts apps/web-ele/src/api/modules/admin/products/recharge-risks
git commit -m "feat: add recharge risk api module"
```

---

### Task 2: Validators and Page Types

**Files:**

- Create: `apps/web-ele/src/views/myjob/products/recharge-risks/types.ts`
- Create: `apps/web-ele/src/views/myjob/products/recharge-risks/validators.ts`
- Create: `apps/web-ele/src/views/myjob/products/recharge-risks/validators.test.ts`

- [ ] **Step 1: Write validator tests**

Create `apps/web-ele/src/views/myjob/products/recharge-risks/validators.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';

import {
  RECHARGE_RISK_ACCOUNT_MAX_LENGTH,
  RECHARGE_RISK_GOODS_KEYWORD_MAX_LENGTH,
  RECHARGE_RISK_REASON_MAX_LENGTH,
  buildRechargeRiskRuleFormRules,
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
    expect((callback.mock.calls[0]?.[0] as Error).message).toBe(
      '充值账号不能为空',
    );
  });
});
```

- [ ] **Step 2: Run validator tests to verify failure**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/recharge-risks/validators.test.ts
```

Expected: FAIL because `./validators` does not exist.

- [ ] **Step 3: Create local page types**

Create `apps/web-ele/src/views/myjob/products/recharge-risks/types.ts`:

```ts
export interface RechargeRiskRuleFormState {
  account: string;
  goods_keyword: string;
  reason: string;
  status: number;
}
```

- [ ] **Step 4: Implement validators**

Create `apps/web-ele/src/views/myjob/products/recharge-risks/validators.ts`:

```ts
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
  const normalized = Number(value);
  if (normalized !== 0 && normalized !== 1) {
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
```

- [ ] **Step 5: Run validator tests**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/recharge-risks/validators.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit validators**

Run:

```bash
git add apps/web-ele/src/views/myjob/products/recharge-risks/types.ts apps/web-ele/src/views/myjob/products/recharge-risks/validators.ts apps/web-ele/src/views/myjob/products/recharge-risks/validators.test.ts
git commit -m "feat: add recharge risk validators"
```

---

### Task 3: Query and Payload Mappers

**Files:**

- Create: `apps/web-ele/src/views/myjob/products/recharge-risks/mappers.ts`
- Create: `apps/web-ele/src/views/myjob/products/recharge-risks/mappers.test.ts`

- [ ] **Step 1: Write mapper tests**

Create `apps/web-ele/src/views/myjob/products/recharge-risks/mappers.test.ts`:

```ts
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
```

- [ ] **Step 2: Run mapper tests to verify failure**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/recharge-risks/mappers.test.ts
```

Expected: FAIL because `./mappers` does not exist.

- [ ] **Step 3: Implement mappers**

Create `apps/web-ele/src/views/myjob/products/recharge-risks/mappers.ts`:

```ts
import type { GridPageParams } from '../../shared';

import type {
  RechargeRiskRecordListQuery,
  RechargeRiskRuleListItem,
  RechargeRiskRuleListQuery,
  RechargeRiskRulePayload,
} from '#/api/modules/admin/products/recharge-risks';

import type { RechargeRiskRuleFormState } from './types';

import { extractDateRange, resolvePageParams } from '../../shared';

function trimValue(value: unknown) {
  return String(value ?? '').trim();
}

export function buildRechargeRiskRuleListQuery(
  params: GridPageParams,
  formValues: Record<string, any>,
): RechargeRiskRuleListQuery {
  const { page, page_size } = resolvePageParams(params);
  const account = trimValue(formValues.account);
  const goodsKeyword = trimValue(formValues.goods_keyword);
  const status = trimValue(formValues.status);

  return {
    ...(account ? { account } : {}),
    ...(goodsKeyword ? { goods_keyword: goodsKeyword } : {}),
    page,
    page_size,
    ...(status === '0' || status === '1' ? { status } : {}),
  };
}

export function buildRechargeRiskRecordListQuery(
  params: GridPageParams,
  formValues: Record<string, any>,
): RechargeRiskRecordListQuery {
  const { page, page_size } = resolvePageParams(params);
  const account = trimValue(formValues.account);
  const goodsKeyword = trimValue(formValues.goods_keyword);
  const { end_time, start_time } = extractDateRange(formValues.date_range);

  return {
    ...(account ? { account } : {}),
    ...(end_time ? { end_time } : {}),
    ...(goodsKeyword ? { goods_keyword: goodsKeyword } : {}),
    page,
    page_size,
    ...(start_time ? { start_time } : {}),
  };
}

/**
 * 后端只接受可编辑字段；列表展示字段不能回传，避免误把统计和审计字段当成表单数据。
 */
export function buildRechargeRiskRulePayload(
  form: RechargeRiskRuleFormState,
): RechargeRiskRulePayload {
  return {
    account: trimValue(form.account),
    goods_keyword: trimValue(form.goods_keyword),
    reason: trimValue(form.reason),
    status: Number(form.status),
  };
}

export function toRechargeRiskRuleForm(
  row?: RechargeRiskRuleListItem | null,
): RechargeRiskRuleFormState {
  if (!row) {
    return {
      account: '',
      goods_keyword: '',
      reason: '',
      status: 1,
    };
  }

  return {
    account: row.account,
    goods_keyword: row.goods_keyword,
    reason: row.reason,
    status: row.status,
  };
}
```

- [ ] **Step 4: Run mapper tests**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/recharge-risks/mappers.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit mappers**

Run:

```bash
git add apps/web-ele/src/views/myjob/products/recharge-risks/mappers.ts apps/web-ele/src/views/myjob/products/recharge-risks/mappers.test.ts
git commit -m "feat: add recharge risk mappers"
```

---

### Task 4: Schemas

**Files:**

- Create: `apps/web-ele/src/views/myjob/products/recharge-risks/schemas.ts`
- Create: `apps/web-ele/src/views/myjob/products/recharge-risks/schemas.test.ts`

- [ ] **Step 1: Write schema tests**

Create `apps/web-ele/src/views/myjob/products/recharge-risks/schemas.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  RECHARGE_RISK_STATUS_OPTIONS,
  buildRechargeRiskRecordColumns,
  buildRechargeRiskRecordFilterSchema,
  buildRechargeRiskRuleColumns,
  buildRechargeRiskRuleFilterSchema,
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
```

- [ ] **Step 2: Run schema tests to verify failure**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/recharge-risks/schemas.test.ts
```

Expected: FAIL because `./schemas` does not exist.

- [ ] **Step 3: Implement schemas**

Create `apps/web-ele/src/views/myjob/products/recharge-risks/schemas.ts`:

```ts
import { formatDateTime } from '../../shared';

export const RECHARGE_RISK_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '启用', value: '1' },
  { label: '停用', value: '0' },
];

export function resolveRechargeRiskStatusText(
  status: number,
  statusText?: string,
) {
  if (statusText) {
    return statusText;
  }
  return status === 1 ? '启用' : '停用';
}

export function buildRechargeRiskRuleFilterSchema() {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入充值账号',
      },
      fieldName: 'account',
      label: '充值账号',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入商品关键词',
      },
      fieldName: 'goods_keyword',
      label: '商品关键词',
    },
    {
      component: 'Select',
      componentProps: {
        options: RECHARGE_RISK_STATUS_OPTIONS,
        placeholder: '请选择状态',
      },
      fieldName: 'status',
      label: '状态',
    },
  ];
}

export function buildRechargeRiskRecordFilterSchema() {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入充值账号',
      },
      fieldName: 'account',
      label: '充值账号',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入商品关键词',
      },
      fieldName: 'goods_keyword',
      label: '商品关键词',
    },
    {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'date_range',
      label: '拦截时间',
    },
  ];
}

export function buildRechargeRiskRuleColumns() {
  return [
    { field: 'account', minWidth: 180, title: '充值账号' },
    { field: 'goods_keyword', minWidth: 160, title: '匹配关键词' },
    { field: 'hit_count', minWidth: 120, title: '已拦截次数' },
    { field: 'reason', minWidth: 220, title: '风控原因' },
    {
      field: 'status',
      minWidth: 140,
      slots: { default: 'status' },
      title: '状态',
    },
    { field: 'created_by_name', minWidth: 140, title: '创建人' },
    { field: 'updated_by_name', minWidth: 140, title: '更新人' },
    {
      field: 'created_at',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatDateTime(cellValue),
      minWidth: 180,
      title: '创建时间',
    },
    {
      field: 'updated_at',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatDateTime(cellValue),
      minWidth: 180,
      title: '更新时间',
    },
    {
      field: 'actions',
      fixed: 'right' as const,
      minWidth: 160,
      slots: { default: 'actions' },
      title: '操作',
    },
  ];
}

export function buildRechargeRiskRecordColumns() {
  return [
    { field: 'order_no', minWidth: 190, title: '订单号' },
    { field: 'account', minWidth: 180, title: '充值账号' },
    { field: 'matched_keyword', minWidth: 160, title: '拦截关键词' },
    { field: 'goods_code', minWidth: 140, title: '商品编码' },
    { field: 'goods_name', minWidth: 240, title: '商品名称' },
    { field: 'reason', minWidth: 220, title: '风控原因' },
    { field: 'rule_id', minWidth: 100, title: '规则 ID' },
    {
      field: 'intercepted_at',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatDateTime(cellValue),
      minWidth: 180,
      title: '拦截时间',
    },
  ];
}
```

- [ ] **Step 4: Run schema tests**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/recharge-risks/schemas.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit schemas**

Run:

```bash
git add apps/web-ele/src/views/myjob/products/recharge-risks/schemas.ts apps/web-ele/src/views/myjob/products/recharge-risks/schemas.test.ts
git commit -m "feat: add recharge risk schemas"
```

---

### Task 5: Product Route

**Files:**

- Modify: `apps/web-ele/src/router/routes/modules/products.ts`
- Modify: `apps/web-ele/src/router/routes/modules/products.test.ts`

- [ ] **Step 1: Update route test first**

Modify `apps/web-ele/src/router/routes/modules/products.test.ts` so the expected parent authority includes `order.recharge_risk`:

```ts
          authority: [
            'product.brand',
            'product.industry',
            'product.goods',
            'product.template',
            'product.purchase_limit',
            'supplier.index',
            'order.recharge_risk',
          ],
```

Add the expected child route after the purchase limits route and before suppliers:

```ts
          {
            component: expect.any(Function),
            meta: {
              authority: ['order.recharge_risk'],
              title: '风控管理',
            },
            name: 'ProductRechargeRisks',
            path: '/products/recharge-risks',
          },
```

- [ ] **Step 2: Run route test to verify failure**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/router/routes/modules/products.test.ts
```

Expected: FAIL because `products.ts` does not include the new route.

- [ ] **Step 3: Implement route**

Modify `apps/web-ele/src/router/routes/modules/products.ts` parent authority:

```ts
      authority: [
        'product.brand',
        'product.industry',
        'product.goods',
        'product.template',
        'product.purchase_limit',
        'supplier.index',
        'order.recharge_risk',
      ],
```

Add this child route after purchase limits and before suppliers:

```ts
      {
        component: () =>
          import('#/views/myjob/products/recharge-risks/index.vue'),
        meta: {
          authority: ['order.recharge_risk'],
          title: '风控管理',
        },
        name: 'ProductRechargeRisks',
        path: '/products/recharge-risks',
      },
```

- [ ] **Step 4: Run route test**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/router/routes/modules/products.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit route**

Run:

```bash
git add apps/web-ele/src/router/routes/modules/products.ts apps/web-ele/src/router/routes/modules/products.test.ts
git commit -m "feat: add recharge risk route"
```

---

### Task 6: Rule Dialog

**Files:**

- Create: `apps/web-ele/src/views/myjob/products/recharge-risks/components/RechargeRiskRuleDialog.vue`
- Create: `apps/web-ele/src/views/myjob/products/recharge-risks/components/RechargeRiskRuleDialog.test.ts`

- [ ] **Step 1: Write dialog tests**

Create `apps/web-ele/src/views/myjob/products/recharge-risks/components/RechargeRiskRuleDialog.test.ts`:

```ts
/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RechargeRiskRuleDialog from './RechargeRiskRuleDialog.vue';

const apiMocks = vi.hoisted(() => ({
  addRechargeRiskRuleApi: vi.fn(),
  updateRechargeRiskRuleApi: vi.fn(),
}));

vi.mock('#/api/modules/admin/products/recharge-risks', () => apiMocks);

vi.mock('element-plus', () => {
  const ElButton = defineComponent({
    name: 'ElButtonStub',
    emits: ['click'],
    setup(_, { attrs, emit, slots }) {
      return () =>
        h(
          'button',
          { ...attrs, onClick: (event: Event) => emit('click', event) },
          slots.default?.(),
        );
    },
  });

  const ElDialog = defineComponent({
    name: 'ElDialogStub',
    props: { modelValue: Boolean, title: { default: '', type: String } },
    setup(props, { slots }) {
      return () =>
        props.modelValue
          ? h('section', { 'data-test': 'dialog' }, [
              h('h2', props.title),
              slots.default?.(),
              slots.footer?.(),
            ])
          : null;
    },
  });

  const ElForm = defineComponent({
    name: 'ElFormStub',
    setup(_, { expose, slots }) {
      expose({ validate: vi.fn().mockResolvedValue(true) });
      return () => h('form', slots.default?.());
    },
  });

  const ElFormItem = defineComponent({
    name: 'ElFormItemStub',
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    },
  });

  const ElInput = defineComponent({
    name: 'ElInputStub',
    props: { modelValue: { default: '', type: String } },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit }) {
      return () =>
        h('input', {
          ...attrs,
          value: props.modelValue,
          onInput: (event: Event) =>
            emit('update:modelValue', (event.target as HTMLInputElement).value),
        });
    },
  });

  const ElOption = defineComponent({
    name: 'ElOptionStub',
    props: { label: { default: '', type: String } },
    setup(props) {
      return () => h('option', props.label);
    },
  });

  const ElSelect = defineComponent({
    name: 'ElSelectStub',
    props: { modelValue: { default: 1, type: Number } },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit, slots }) {
      return () =>
        h(
          'select',
          {
            ...attrs,
            value: String(props.modelValue),
            onChange: (event: Event) =>
              emit(
                'update:modelValue',
                Number((event.target as HTMLSelectElement).value),
              ),
          },
          slots.default?.(),
        );
    },
  });

  return {
    ElButton,
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElMessage: { success: vi.fn() },
    ElOption,
    ElSelect,
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderDialog(
  options: {
    editingRule?: any;
    visible?: boolean;
  } = {},
) {
  const root = document.createElement('div');
  document.body.append(root);
  const visible = ref(options.visible ?? true);

  const Wrapper = defineComponent({
    setup() {
      return () =>
        h(RechargeRiskRuleDialog, {
          editingRule: options.editingRule ?? null,
          onSaved: vi.fn(),
          'onUpdate:visible': (value: boolean) => {
            visible.value = value;
          },
          visible: visible.value,
        });
    },
  });

  const app = createApp(Wrapper);
  app.mount(root);
  await nextTick();
  return {
    root,
    unmount() {
      app.unmount();
      root.remove();
    },
  };
}

function input(root: HTMLElement, testId: string) {
  const element = root.querySelector(`[data-test="${testId}"]`);
  expect(element).toBeTruthy();
  return element as HTMLInputElement;
}

function clickButton(root: HTMLElement, label: string) {
  const button = [...root.querySelectorAll('button')].find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  expect(button).toBeTruthy();
  button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('RechargeRiskRuleDialog', () => {
  const mounted: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.addRechargeRiskRuleApi.mockResolvedValue({ id: 41 });
    apiMocks.updateRechargeRiskRuleApi.mockResolvedValue(undefined);
  });

  afterEach(() => {
    while (mounted.length > 0) {
      mounted.pop()?.unmount();
    }
  });

  it('creates enabled rule by default with trimmed payload', async () => {
    const view = await renderDialog();
    mounted.push(view);

    input(view.root, 'risk-account').value = ' risk-account-001 ';
    input(view.root, 'risk-account').dispatchEvent(
      new Event('input', { bubbles: true }),
    );
    input(view.root, 'risk-keyword').value = ' 剪映 ';
    input(view.root, 'risk-keyword').dispatchEvent(
      new Event('input', { bubbles: true }),
    );
    input(view.root, 'risk-reason').value = ' 错误账号 ';
    input(view.root, 'risk-reason').dispatchEvent(
      new Event('input', { bubbles: true }),
    );

    clickButton(view.root, '保存');
    await flushPromises();

    expect(apiMocks.addRechargeRiskRuleApi).toHaveBeenCalledWith({
      account: 'risk-account-001',
      goods_keyword: '剪映',
      reason: '错误账号',
      status: 1,
    });
  });

  it('updates editing rule with row values', async () => {
    const view = await renderDialog({
      editingRule: {
        account: 'old-account',
        created_at: '2026-04-27 10:00:00',
        created_by_name: 'admin',
        goods_keyword: '微博',
        hit_count: 1,
        id: 42,
        reason: '旧原因',
        status: 0,
        status_text: '停用',
        updated_at: '2026-04-27 11:00:00',
        updated_by_name: 'admin',
      },
    });
    mounted.push(view);

    expect(input(view.root, 'risk-account').value).toBe('old-account');
    input(view.root, 'risk-reason').value = ' 新原因 ';
    input(view.root, 'risk-reason').dispatchEvent(
      new Event('input', { bubbles: true }),
    );

    clickButton(view.root, '保存');
    await flushPromises();

    expect(apiMocks.updateRechargeRiskRuleApi).toHaveBeenCalledWith(42, {
      account: 'old-account',
      goods_keyword: '微博',
      reason: '新原因',
      status: 0,
    });
  });
});
```

- [ ] **Step 2: Run dialog tests to verify failure**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/recharge-risks/components/RechargeRiskRuleDialog.test.ts
```

Expected: FAIL because `RechargeRiskRuleDialog.vue` does not exist.

- [ ] **Step 3: Implement rule dialog**

Create `apps/web-ele/src/views/myjob/products/recharge-risks/components/RechargeRiskRuleDialog.vue`:

```vue
<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type { RechargeRiskRuleListItem } from '#/api/modules/admin/products/recharge-risks';

import { computed, reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
} from 'element-plus';

import {
  addRechargeRiskRuleApi,
  updateRechargeRiskRuleApi,
} from '#/api/modules/admin/products/recharge-risks';

import {
  buildRechargeRiskRulePayload,
  toRechargeRiskRuleForm,
} from '../mappers';
import { buildRechargeRiskRuleFormRules } from '../validators';

const props = defineProps<{
  editingRule: RechargeRiskRuleListItem | null;
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();

const formRef = ref<FormInstance>();
const dialogLoading = ref(false);
const formRules = buildRechargeRiskRuleFormRules();
const dialogForm = reactive(toRechargeRiskRuleForm());

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const dialogTitle = computed(() =>
  props.editingRule ? '编辑风控规则' : '新增风控规则',
);

function resetDialogForm() {
  Object.assign(dialogForm, toRechargeRiskRuleForm(props.editingRule));
}

async function submitDialog() {
  if (dialogLoading.value || !formRef.value) {
    return;
  }
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  try {
    dialogLoading.value = true;
    const payload = buildRechargeRiskRulePayload(dialogForm);
    if (props.editingRule) {
      await updateRechargeRiskRuleApi(props.editingRule.id, payload);
      ElMessage.success('风控规则已更新');
    } else {
      await addRechargeRiskRuleApi(payload);
      ElMessage.success('风控规则已新增');
    }
    emit('saved');
    emit('update:visible', false);
  } finally {
    dialogLoading.value = false;
  }
}

watch(
  () => [props.visible, props.editingRule?.id] as const,
  ([visible]) => {
    if (!visible) {
      Object.assign(dialogForm, toRechargeRiskRuleForm());
      dialogLoading.value = false;
      return;
    }
    resetDialogForm();
  },
  { immediate: true },
);
</script>

<template>
  <ElDialog v-model="dialogVisible" :title="dialogTitle" width="640px">
    <ElForm
      ref="formRef"
      :model="dialogForm"
      :rules="formRules"
      label-width="108px"
    >
      <ElFormItem label="充值账号" prop="account">
        <ElInput
          v-model="dialogForm.account"
          data-test="risk-account"
          placeholder="请输入充值账号"
        />
      </ElFormItem>
      <ElFormItem label="商品关键词" prop="goods_keyword">
        <ElInput
          v-model="dialogForm.goods_keyword"
          data-test="risk-keyword"
          placeholder="请输入商品关键词"
        />
      </ElFormItem>
      <ElFormItem label="风控原因" prop="reason">
        <ElInput
          v-model="dialogForm.reason"
          data-test="risk-reason"
          :rows="4"
          placeholder="请输入风控原因"
          type="textarea"
        />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElSelect
          v-model="dialogForm.status"
          class="w-full"
          data-test="risk-status"
        >
          <ElOption label="启用" :value="1" />
          <ElOption label="停用" :value="0" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="dialogLoading" @click="submitDialog">
        保存
      </ElButton>
    </template>
  </ElDialog>
</template>
```

- [ ] **Step 4: Run dialog tests**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/recharge-risks/components/RechargeRiskRuleDialog.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit dialog**

Run:

```bash
git add apps/web-ele/src/views/myjob/products/recharge-risks/components/RechargeRiskRuleDialog.vue apps/web-ele/src/views/myjob/products/recharge-risks/components/RechargeRiskRuleDialog.test.ts
git commit -m "feat: add recharge risk rule dialog"
```

---

### Task 7: Recharge Risk Page

**Files:**

- Create: `apps/web-ele/src/views/myjob/products/recharge-risks/index.vue`
- Create: `apps/web-ele/src/views/myjob/products/recharge-risks/index.test.ts`

- [ ] **Step 1: Write page tests**

Create `apps/web-ele/src/views/myjob/products/recharge-risks/index.test.ts`:

```ts
/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RechargeRiskPage from './index.vue';

const gridConfigs = vi.hoisted(() => [] as any[]);
const reloadMocks = vi.hoisted(() => [] as any[]);

const apiMocks = vi.hoisted(() => ({
  deleteRechargeRiskRuleApi: vi.fn(),
  getRechargeRiskRecordListApi: vi.fn(),
  getRechargeRiskRuleListApi: vi.fn(),
  updateRechargeRiskRuleStatusApi: vi.fn(),
}));

const accessState = vi.hoisted(() => ({
  codes: ['order.recharge_risk'] as string[],
}));

vi.mock('@vben/common-ui', () => ({
  Page: defineComponent({
    name: 'PageStub',
    setup(_, { slots }) {
      return () => h('main', slots.default?.());
    },
  }),
}));

vi.mock('@vben/stores', () => ({
  useAccessStore: () => ({ accessCodes: accessState.codes }),
}));

vi.mock('#/adapter/vxe-table', () => ({
  useVbenVxeGrid: (config: any) => {
    const index = gridConfigs.length;
    gridConfigs.push(config);
    const reload = vi.fn();
    reloadMocks.push(reload);
    return [
      defineComponent({
        name: `GridStub${index}`,
        setup(_, { slots }) {
          return () =>
            h('section', { 'data-test': `grid-${index}` }, [
              slots['toolbar-actions']?.(),
              slots.status?.({
                row: {
                  id: 41,
                  status: 1,
                  status_text: '启用',
                },
              }),
              slots.actions?.({
                row: {
                  account: 'risk-account-001',
                  goods_keyword: '剪映',
                  id: 41,
                  reason: '错误账号',
                  status: 1,
                },
              }),
            ]);
        },
      }),
      { reload },
    ];
  },
}));

vi.mock('#/api/modules/admin/products/recharge-risks', () => apiMocks);

vi.mock('./components/RechargeRiskRuleDialog.vue', () => ({
  default: defineComponent({
    name: 'RechargeRiskRuleDialogStub',
    props: ['visible'],
    setup(props) {
      return () =>
        props.visible ? h('div', { 'data-test': 'risk-dialog' }) : null;
    },
  }),
}));

vi.mock('element-plus', () => {
  const ElButton = defineComponent({
    name: 'ElButtonStub',
    emits: ['click'],
    setup(_, { attrs, emit, slots }) {
      return () =>
        h(
          'button',
          { ...attrs, onClick: (event: Event) => emit('click', event) },
          slots.default?.(),
        );
    },
  });

  const ElSwitch = defineComponent({
    name: 'ElSwitchStub',
    props: { modelValue: { default: 1, type: Number } },
    emits: ['change'],
    setup(_, { attrs, emit }) {
      return () =>
        h(
          'button',
          {
            ...attrs,
            'data-test': 'status-switch',
            onClick: () => emit('change', 0),
          },
          'switch',
        );
    },
  });

  const ElTabs = defineComponent({
    name: 'ElTabsStub',
    props: { modelValue: { default: '', type: String } },
    setup(_, { slots }) {
      return () => h('div', { 'data-test': 'tabs' }, slots.default?.());
    },
  });

  const ElTabPane = defineComponent({
    name: 'ElTabPaneStub',
    props: { label: String, name: String },
    setup(props, { slots }) {
      return () =>
        h('section', { 'data-tab': props.name }, [
          h('h3', props.label),
          slots.default?.(),
        ]);
    },
  });

  return {
    ElButton,
    ElMessage: { success: vi.fn() },
    ElMessageBox: { confirm: vi.fn().mockResolvedValue(undefined) },
    ElSwitch,
    ElTabPane,
    ElTabs,
  };
});

async function renderPage() {
  const root = document.createElement('div');
  document.body.append(root);
  const app = createApp(RechargeRiskPage);
  app.mount(root);
  await nextTick();
  return {
    root,
    unmount() {
      app.unmount();
      root.remove();
    },
  };
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('RechargeRiskPage', () => {
  const mounted: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    gridConfigs.length = 0;
    reloadMocks.length = 0;
    accessState.codes = ['order.recharge_risk'];
    apiMocks.getRechargeRiskRuleListApi.mockResolvedValue({
      list: [],
      pagination: { total: 0 },
    });
    apiMocks.getRechargeRiskRecordListApi.mockResolvedValue({
      list: [],
      pagination: { total: 0 },
    });
    apiMocks.updateRechargeRiskRuleStatusApi.mockResolvedValue(undefined);
    apiMocks.deleteRechargeRiskRuleApi.mockResolvedValue(undefined);
  });

  afterEach(() => {
    while (mounted.length > 0) {
      mounted.pop()?.unmount();
    }
  });

  it('configures rule and record grids', async () => {
    const view = await renderPage();
    mounted.push(view);

    expect(view.root.textContent).toContain('风控管理');
    expect(view.root.textContent).toContain('风控记录');
    expect(gridConfigs).toHaveLength(2);

    await gridConfigs[0].gridOptions.proxyConfig.ajax.query(
      { page: { currentPage: 2, pageSize: 30 } },
      { account: ' risk-account-001 ', goods_keyword: ' 剪映 ', status: '1' },
    );
    expect(apiMocks.getRechargeRiskRuleListApi).toHaveBeenCalledWith({
      account: 'risk-account-001',
      goods_keyword: '剪映',
      page: 2,
      page_size: 30,
      status: '1',
    });

    await gridConfigs[1].gridOptions.proxyConfig.ajax.query(
      { page: { currentPage: 1, pageSize: 20 } },
      {
        account: ' risk-account-001 ',
        date_range: ['2026-04-27 00:00:00', '2026-04-27 23:59:59'],
        goods_keyword: ' 微博 ',
      },
    );
    expect(apiMocks.getRechargeRiskRecordListApi).toHaveBeenCalledWith({
      account: 'risk-account-001',
      end_time: '2026-04-27 23:59:59',
      goods_keyword: '微博',
      page: 1,
      page_size: 20,
      start_time: '2026-04-27 00:00:00',
    });
  });

  it('opens create dialog and performs row actions with permission', async () => {
    const view = await renderPage();
    mounted.push(view);

    const buttons = [...view.root.querySelectorAll('button')];
    buttons.find((button) => button.textContent?.trim() === '新增')?.click();
    await nextTick();
    expect(view.root.querySelector('[data-test="risk-dialog"]')).toBeTruthy();

    view.root
      .querySelector('[data-test="status-switch"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flushPromises();
    expect(apiMocks.updateRechargeRiskRuleStatusApi).toHaveBeenCalledWith(
      41,
      0,
    );

    buttons.find((button) => button.textContent?.trim() === '删除')?.click();
    await flushPromises();
    expect(apiMocks.deleteRechargeRiskRuleApi).toHaveBeenCalledWith(41);
  });

  it('hides management actions without permission', async () => {
    accessState.codes = [];
    const view = await renderPage();
    mounted.push(view);

    expect(view.root.textContent).not.toContain('新增');
    expect(view.root.textContent).not.toContain('编辑');
    expect(view.root.textContent).not.toContain('删除');
    expect(view.root.textContent).toContain('启用');
  });
});
```

- [ ] **Step 2: Run page tests to verify failure**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/recharge-risks/index.test.ts
```

Expected: FAIL because `index.vue` does not exist.

- [ ] **Step 3: Implement page**

Create `apps/web-ele/src/views/myjob/products/recharge-risks/index.vue`:

```vue
<script lang="ts" setup>
import type { GridPageParams } from '../../shared';

import type { RechargeRiskRuleListItem } from '#/api/modules/admin/products/recharge-risks';

import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElMessage,
  ElMessageBox,
  ElSwitch,
  ElTabPane,
  ElTabs,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteRechargeRiskRuleApi,
  getRechargeRiskRecordListApi,
  getRechargeRiskRuleListApi,
  updateRechargeRiskRuleStatusApi,
} from '#/api/modules/admin/products/recharge-risks';

import {
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  toGridResult,
} from '../../shared';
import RechargeRiskRuleDialog from './components/RechargeRiskRuleDialog.vue';
import {
  buildRechargeRiskRecordListQuery,
  buildRechargeRiskRuleListQuery,
} from './mappers';
import {
  buildRechargeRiskRecordColumns,
  buildRechargeRiskRecordFilterSchema,
  buildRechargeRiskRuleColumns,
  buildRechargeRiskRuleFilterSchema,
  resolveRechargeRiskStatusText,
} from './schemas';

const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('order.recharge_risk'),
);

const activeTab = ref('rules');
const dialogVisible = ref(false);
const editingRule = ref<RechargeRiskRuleListItem | null>(null);
const loadingStatusIds = reactive<Record<number, boolean>>({});

function openCreateDialog() {
  editingRule.value = null;
  dialogVisible.value = true;
}

function openEditDialog(row: RechargeRiskRuleListItem) {
  editingRule.value = row;
  dialogVisible.value = true;
}

async function handleDelete(row: RechargeRiskRuleListItem) {
  await ElMessageBox.confirm(
    `确认删除风控规则 ${row.account} / ${row.goods_keyword} 吗？`,
    '删除确认',
    { type: 'warning' },
  );
  await deleteRechargeRiskRuleApi(row.id);
  ElMessage.success('风控规则已删除');
  await ruleGridApi.reload();
}

// 启停状态走独立接口，并在结束后刷新列表，确保失败时回到服务端真实状态。
async function handleStatusChange(
  row: RechargeRiskRuleListItem,
  nextStatus: number | string,
) {
  const normalizedStatus = Number(nextStatus);
  loadingStatusIds[row.id] = true;
  try {
    await updateRechargeRiskRuleStatusApi(row.id, normalizedStatus);
    ElMessage.success(
      normalizedStatus === 1 ? '风控规则已启用' : '风控规则已停用',
    );
  } finally {
    loadingStatusIds[row.id] = false;
    await ruleGridApi.reload();
  }
}

function handleDialogVisibleChange(value: boolean) {
  dialogVisible.value = value;
  if (!value) {
    editingRule.value = null;
  }
}

async function handleDialogSaved() {
  await ruleGridApi.reload();
}

const [RuleGrid, ruleGridApi] = useVbenVxeGrid<RechargeRiskRuleListItem>({
  formOptions: {
    schema: buildRechargeRiskRuleFilterSchema(),
  },
  gridClass: MYJOB_GRID_CLASS,
  gridOptions: {
    columns: buildRechargeRiskRuleColumns(),
    pagerConfig: {},
    proxyConfig: {
      ajax: {
        query: async (
          params: GridPageParams,
          formValues: Record<string, any>,
        ) => {
          const result = await getRechargeRiskRuleListApi(
            buildRechargeRiskRuleListQuery(params, formValues),
          );
          return toGridResult(result.list ?? [], result.pagination.total);
        },
      },
    },
    toolbarConfig: {
      refresh: true,
      search: true,
      zoom: true,
    },
  },
});

const [RecordGrid] = useVbenVxeGrid({
  formOptions: {
    schema: buildRechargeRiskRecordFilterSchema(),
  },
  gridClass: MYJOB_GRID_CLASS,
  gridOptions: {
    columns: buildRechargeRiskRecordColumns(),
    pagerConfig: {},
    proxyConfig: {
      ajax: {
        query: async (
          params: GridPageParams,
          formValues: Record<string, any>,
        ) => {
          const result = await getRechargeRiskRecordListApi(
            buildRechargeRiskRecordListQuery(params, formValues),
          );
          return toGridResult(result.list ?? [], result.pagination.total);
        },
      },
    },
    toolbarConfig: {
      refresh: true,
      search: true,
      zoom: true,
    },
  },
});
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <ElTabs v-model="activeTab">
      <ElTabPane label="风控管理" name="rules">
        <RuleGrid>
          <template #toolbar-actions>
            <ElButton v-if="canManage" type="primary" @click="openCreateDialog">
              新增
            </ElButton>
          </template>

          <template #status="{ row }">
            <ElSwitch
              v-if="canManage"
              :active-value="1"
              :inactive-value="0"
              :loading="loadingStatusIds[row.id]"
              :model-value="row.status"
              active-text="启用"
              inactive-text="停用"
              inline-prompt
              @change="(value) => handleStatusChange(row, Number(value))"
            />
            <span v-else>
              {{ resolveRechargeRiskStatusText(row.status, row.status_text) }}
            </span>
          </template>

          <template #actions="{ row }">
            <div v-if="canManage" class="flex items-center gap-3">
              <ElButton link type="primary" @click="openEditDialog(row)">
                编辑
              </ElButton>
              <ElButton link type="danger" @click="handleDelete(row)">
                删除
              </ElButton>
            </div>
          </template>
        </RuleGrid>
      </ElTabPane>

      <ElTabPane label="风控记录" name="records">
        <RecordGrid />
      </ElTabPane>
    </ElTabs>

    <RechargeRiskRuleDialog
      :editing-rule="editingRule"
      :visible="dialogVisible"
      @saved="handleDialogSaved"
      @update:visible="handleDialogVisibleChange"
    />
  </Page>
</template>
```

- [ ] **Step 4: Run page tests**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/recharge-risks/index.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit page**

Run:

```bash
git add apps/web-ele/src/views/myjob/products/recharge-risks/index.vue apps/web-ele/src/views/myjob/products/recharge-risks/index.test.ts
git commit -m "feat: add recharge risk page"
```

---

### Task 8: Focused Verification

**Files:**

- No new files.
- Verify all files created or modified in Tasks 1-7.

- [ ] **Step 1: Run recharge risk unit tests**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/recharge-risks
```

Expected: PASS for validator, mapper, schema, dialog and page tests.

- [ ] **Step 2: Run API and route focused tests**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/api/myjob-api-contract.test.ts apps/web-ele/src/router/routes/modules/products.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run web-ele typecheck**

Run:

```bash
pnpm --filter @vben/web-ele typecheck
```

Expected: PASS.

- [ ] **Step 4: Run lint for touched code**

Run:

```bash
pnpm lint
```

Expected: PASS. If lint reports unrelated existing files, record the exact unrelated failures and do not change unrelated files.

- [ ] **Step 5: Inspect git diff**

Run:

```bash
git status --short
git diff --stat
git diff -- apps/web-ele/src/router/routes/modules/products.ts apps/web-ele/src/router/routes/modules/products.test.ts
```

Expected: only recharge risk API, page, tests, and product route files are changed.

- [ ] **Step 6: Commit verification-safe final state if needed**

If Tasks 1-7 were committed individually, no additional commit is needed. If any verification fixes were made, commit them:

```bash
git add apps/web-ele/src/api/myjob-api-contract.test.ts apps/web-ele/src/api/modules/admin/products/recharge-risks apps/web-ele/src/router/routes/modules/products.ts apps/web-ele/src/router/routes/modules/products.test.ts apps/web-ele/src/views/myjob/products/recharge-risks
git commit -m "test: verify recharge risk frontend"
```

---

## Self-Review Checklist

- Spec coverage: API 域、路由、权限、双 tab、规则 CRUD、状态启停、记录只读查询、错误处理和测试都映射到 Task 1-8。
- File boundary: 新接口没有进入 `admin.ts`，页面没有把 schema、mapper、validator 和弹窗堆进 `index.vue`。
- Test coverage: API contract、route、schema、mapper、validator、dialog 和 page 行为都有对应测试。
- Type consistency: 权限码统一为 `order.recharge_risk`；筛选字段统一为 `account`、`goods_keyword`、`status`、`date_range`；后端时间参数统一为 `start_time`、`end_time`。
- Scope: 不包含导出、详情、批量操作、后端变更或无关重构。
