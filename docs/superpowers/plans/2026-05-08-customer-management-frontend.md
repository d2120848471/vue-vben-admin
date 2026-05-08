# 客户管理 V1 前端 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `apps/web-ele` 中实现客户管理 V1：客户侧登录、注册、忘记密码、最小客户首页，以及后台客户列表、回收站、详情、新增、编辑、启停、删除、恢复和重置密码。

**Architecture:** 新增两个精确 API 域：后台 `#/api/modules/admin/customers` 和客户侧 `#/api/modules/customer/auth`。后台页面放在 `views/myjob/customers`，入口 SFC 只装配 Page、Grid、弹窗和插槽，复杂逻辑拆到 composables、schemas、mappers、validators。客户侧认证使用独立 `customer-auth` store 和 `/customer/*` core routes，customer token 不进入后台 `accessStore`。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、Pinia、Vue Router、Vben `AuthPageLayout` / `AuthenticationLogin` / `AuthenticationRegister` / `AuthenticationForgetPassword`、Vben `useVbenVxeGrid`、Element Plus、Vitest、pnpm workspace。

---

## Scope Check

本 plan 覆盖一个 V1 功能包，包含后台客户管理和客户侧认证。两块通过同一个后端 customer 领域关联，且客户侧只做认证和最小首页，不引入真实客户业务后台；因此保留在一个实施计划中，但任务按 API、客户侧、后台侧分开，确保每个任务可独立测试和提交。

## File Structure

Create:

- `apps/web-ele/src/api/modules/admin/customers/api.ts`：后台客户管理请求函数。
- `apps/web-ele/src/api/modules/admin/customers/types.ts`：后台客户 DTO、查询参数、payload 类型。
- `apps/web-ele/src/api/modules/admin/customers/index.ts`：精确导出。
- `apps/web-ele/src/api/modules/customer/auth/api.ts`：客户侧认证请求函数。
- `apps/web-ele/src/api/modules/customer/auth/types.ts`：客户侧认证 DTO 和 payload 类型。
- `apps/web-ele/src/api/modules/customer/auth/index.ts`：精确导出。
- `apps/web-ele/src/store/customer-auth.ts`：客户侧 token、客户信息和登录态动作。
- `apps/web-ele/src/store/customer-auth.test.ts`：客户侧 store 测试。
- `apps/web-ele/src/router/routes/modules/customers.ts`：后台客户管理菜单路由。
- `apps/web-ele/src/router/routes/modules/customers.test.ts`：后台客户管理路由测试。
- `apps/web-ele/src/router/routes/core.test.ts`：客户侧 core routes 测试。
- `apps/web-ele/src/views/customer/auth/constants.ts`：客户侧认证存储 key、倒计时秒数。
- `apps/web-ele/src/views/customer/auth/validators.ts`：客户侧认证校验函数和 zod 规则。
- `apps/web-ele/src/views/customer/auth/validators.test.ts`：客户侧认证校验测试。
- `apps/web-ele/src/views/customer/auth/mappers.ts`：客户侧认证 payload 构造。
- `apps/web-ele/src/views/customer/auth/mappers.test.ts`：客户侧认证 mapper 测试。
- `apps/web-ele/src/views/customer/auth/schemas.ts`：客户侧认证表单 schema。
- `apps/web-ele/src/views/customer/auth/schemas.test.ts`：客户侧认证 schema 测试。
- `apps/web-ele/src/views/customer/auth/login.vue`：客户登录页。
- `apps/web-ele/src/views/customer/auth/register.vue`：客户注册页。
- `apps/web-ele/src/views/customer/auth/forgot-password.vue`：客户忘记密码页。
- `apps/web-ele/src/views/customer/home/index.vue`：客户侧最小首页。
- `apps/web-ele/src/views/customer/home/index.test.ts`：客户首页轻测。
- `apps/web-ele/src/views/myjob/customers/constants.ts`：后台客户状态选项、文案和字段限制。
- `apps/web-ele/src/views/myjob/customers/types.ts`：后台客户页面私有类型。
- `apps/web-ele/src/views/myjob/customers/validators.ts`：后台客户表单校验。
- `apps/web-ele/src/views/myjob/customers/validators.test.ts`：后台客户校验测试。
- `apps/web-ele/src/views/myjob/customers/mappers.ts`：后台客户 query 和 payload 映射。
- `apps/web-ele/src/views/myjob/customers/mappers.test.ts`：后台客户 mapper 测试。
- `apps/web-ele/src/views/myjob/customers/schemas.ts`：后台客户筛选 schema、表格列、状态文案。
- `apps/web-ele/src/views/myjob/customers/schemas.test.ts`：后台客户 schema 测试。
- `apps/web-ele/src/views/myjob/customers/components/CustomerDialog.vue`：后台新增/编辑客户弹窗。
- `apps/web-ele/src/views/myjob/customers/components/CustomerDetailDialog.vue`：后台客户详情弹窗。
- `apps/web-ele/src/views/myjob/customers/components/ResetPasswordDialog.vue`：后台重置登录密码弹窗。
- `apps/web-ele/src/views/myjob/customers/components/ResetPayPasswordDialog.vue`：后台重置支付密码弹窗。
- `apps/web-ele/src/views/myjob/customers/components/CustomerDialog.test.ts`：新增/编辑弹窗测试。
- `apps/web-ele/src/views/myjob/customers/components/ResetPasswordDialog.test.ts`：重置登录密码弹窗测试。
- `apps/web-ele/src/views/myjob/customers/components/ResetPayPasswordDialog.test.ts`：重置支付密码弹窗测试。
- `apps/web-ele/src/views/myjob/customers/composables/useCustomerPage.ts`：客户列表状态和请求编排。
- `apps/web-ele/src/views/myjob/customers/composables/useCustomerTrashPage.ts`：回收站状态和请求编排。
- `apps/web-ele/src/views/myjob/customers/index.vue`：后台客户列表入口。
- `apps/web-ele/src/views/myjob/customers/trash.vue`：后台客户回收站入口。
- `apps/web-ele/src/views/myjob/customers/index.test.ts`：客户列表页面轻测。
- `apps/web-ele/src/views/myjob/customers/trash.test.ts`：回收站页面轻测。

Modify:

- `apps/web-ele/src/api/myjob-api-contract.test.ts`：补充客户管理和客户认证 API 合约。
- `apps/web-ele/src/router/routes/core.ts`：新增客户侧 core routes。
- `apps/web-ele/src/router/guard.ts`：新增客户侧轻量守卫。
- `apps/web-ele/src/store/index.ts`：导出 `customer-auth` store。

Do not modify:

- `apps/web-ele/src/api/modules/admin.ts`
- `packages/`
- `internal/`
- `scripts/`
- 后端项目 `/Users/denghong/Desktop/平时的项目/myjob`

---

### Task 1: API Domains And Contract Tests

**Files:**

- Modify: `apps/web-ele/src/api/myjob-api-contract.test.ts`
- Create: `apps/web-ele/src/api/modules/admin/customers/api.ts`
- Create: `apps/web-ele/src/api/modules/admin/customers/types.ts`
- Create: `apps/web-ele/src/api/modules/admin/customers/index.ts`
- Create: `apps/web-ele/src/api/modules/customer/auth/api.ts`
- Create: `apps/web-ele/src/api/modules/customer/auth/types.ts`
- Create: `apps/web-ele/src/api/modules/customer/auth/index.ts`

- [ ] **Step 1: Write failing API contract imports**

Add these imports to `apps/web-ele/src/api/myjob-api-contract.test.ts` near the existing admin API imports:

```ts
import {
  addCustomerApi,
  deleteCustomerApi,
  getCustomerDetailApi,
  getCustomerListApi,
  getCustomerTrashApi,
  resetCustomerPasswordApi,
  resetCustomerPayPasswordApi,
  restoreCustomerApi,
  updateCustomerApi,
  updateCustomerStatusApi,
} from '#/api/modules/admin/customers';
import {
  forgotCustomerPasswordApi,
  loginCustomerApi,
  registerCustomerApi,
  sendCustomerSMSApi,
} from '#/api/modules/customer/auth';
```

- [ ] **Step 2: Write failing API contract tests**

Add these tests after the existing user endpoint test in `apps/web-ele/src/api/myjob-api-contract.test.ts`:

```ts
it('uses the customer management endpoints', async () => {
  requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
  requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
  requestClientMock.get.mockResolvedValueOnce({ id: 7 });
  requestClientMock.post.mockResolvedValueOnce({ id: 7 });
  requestClientMock.put.mockResolvedValueOnce(undefined);
  requestClientMock.request.mockResolvedValueOnce(undefined);
  requestClientMock.delete.mockResolvedValueOnce(undefined);
  requestClientMock.request.mockResolvedValueOnce(undefined);
  requestClientMock.request.mockResolvedValueOnce(undefined);
  requestClientMock.request.mockResolvedValueOnce(undefined);

  await getCustomerListApi({
    keyword: '测试',
    page: 1,
    page_size: 20,
    status: 1,
  });
  await getCustomerTrashApi({ keyword: '回收', page: 2, page_size: 10 });
  await getCustomerDetailApi(7);
  await addCustomerApi({
    company_name: '测试公司',
    confirm_password: 'Abc_123',
    confirm_pay_password: '123456',
    password: 'Abc_123',
    pay_password: '123456',
    phone: '13800000000',
    status: 1,
  });
  await updateCustomerApi(7, {
    company_name: '编辑公司',
    phone: '13800000001',
    status: 0,
  });
  await updateCustomerStatusApi(7, 0);
  await deleteCustomerApi(7);
  await restoreCustomerApi(7);
  await resetCustomerPasswordApi(7, {
    confirm_password: 'New_123',
    password: 'New_123',
  });
  await resetCustomerPayPasswordApi(7, {
    confirm_pay_password: '654321',
    pay_password: '654321',
  });

  expect(requestClientMock.get).toHaveBeenNthCalledWith(1, '/admin/customers', {
    params: { keyword: '测试', page: 1, page_size: 20, status: 1 },
  });
  expect(requestClientMock.get).toHaveBeenNthCalledWith(
    2,
    '/admin/customers/trash',
    {
      params: { keyword: '回收', page: 2, page_size: 10 },
    },
  );
  expect(requestClientMock.get).toHaveBeenNthCalledWith(
    3,
    '/admin/customers/7',
  );
  expect(requestClientMock.post).toHaveBeenCalledWith('/admin/customers', {
    company_name: '测试公司',
    confirm_password: 'Abc_123',
    confirm_pay_password: '123456',
    password: 'Abc_123',
    pay_password: '123456',
    phone: '13800000000',
    status: 1,
  });
  expect(requestClientMock.put).toHaveBeenCalledWith('/admin/customers/7', {
    company_name: '编辑公司',
    phone: '13800000001',
    status: 0,
  });
  expect(requestClientMock.request).toHaveBeenNthCalledWith(
    1,
    '/admin/customers/7/status',
    {
      data: { status: 0 },
      method: 'PATCH',
    },
  );
  expect(requestClientMock.delete).toHaveBeenCalledWith('/admin/customers/7');
  expect(requestClientMock.request).toHaveBeenNthCalledWith(
    2,
    '/admin/customers/7/restore',
    {
      method: 'PATCH',
    },
  );
  expect(requestClientMock.request).toHaveBeenNthCalledWith(
    3,
    '/admin/customers/7/password',
    {
      data: { confirm_password: 'New_123', password: 'New_123' },
      method: 'PATCH',
    },
  );
  expect(requestClientMock.request).toHaveBeenNthCalledWith(
    4,
    '/admin/customers/7/pay-password',
    {
      data: { confirm_pay_password: '654321', pay_password: '654321' },
      method: 'PATCH',
    },
  );
});

it('uses the customer auth endpoints', async () => {
  requestClientMock.post.mockResolvedValueOnce(undefined);
  requestClientMock.post.mockResolvedValueOnce({
    customer: {
      company_name: '注册公司',
      id: 10,
      phone: '13800000000',
      status: 1,
    },
    token: 'customer-token-register',
  });
  requestClientMock.post.mockResolvedValueOnce({
    customer: {
      company_name: '注册公司',
      id: 10,
      phone: '13800000000',
      status: 1,
    },
    token: 'customer-token-login',
  });
  requestClientMock.post.mockResolvedValueOnce(undefined);

  await sendCustomerSMSApi({
    phone: '13800000000',
    scene: 'register',
  });
  await registerCustomerApi({
    company_name: '注册公司',
    confirm_password: 'Abc_123',
    confirm_pay_password: '123456',
    password: 'Abc_123',
    pay_password: '123456',
    phone: '13800000000',
    sms_code: '123456',
  });
  await loginCustomerApi({
    password: 'Abc_123',
    phone: '13800000000',
  });
  await forgotCustomerPasswordApi({
    confirm_password: 'New_123',
    password: 'New_123',
    phone: '13800000000',
    sms_code: '654321',
  });

  expect(requestClientMock.post).toHaveBeenNthCalledWith(
    1,
    '/customer/auth/sms/send',
    {
      phone: '13800000000',
      scene: 'register',
    },
  );
  expect(requestClientMock.post).toHaveBeenNthCalledWith(
    2,
    '/customer/auth/register',
    {
      company_name: '注册公司',
      confirm_password: 'Abc_123',
      confirm_pay_password: '123456',
      password: 'Abc_123',
      pay_password: '123456',
      phone: '13800000000',
      sms_code: '123456',
    },
  );
  expect(requestClientMock.post).toHaveBeenNthCalledWith(
    3,
    '/customer/auth/login',
    {
      password: 'Abc_123',
      phone: '13800000000',
    },
  );
  expect(requestClientMock.post).toHaveBeenNthCalledWith(
    4,
    '/customer/auth/forgot-password',
    {
      confirm_password: 'New_123',
      password: 'New_123',
      phone: '13800000000',
      sms_code: '654321',
    },
  );
});
```

- [ ] **Step 3: Run API contract test and verify failure**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/api/myjob-api-contract.test.ts
```

Expected: FAIL with import resolution errors for `#/api/modules/admin/customers` and `#/api/modules/customer/auth`.

- [ ] **Step 4: Create admin customer API types**

Create `apps/web-ele/src/api/modules/admin/customers/types.ts`:

```ts
import type { ListQuery } from '../common';

export interface CustomerListQuery extends ListQuery {
  keyword?: string;
  status?: number;
}

export interface CustomerTrashQuery extends ListQuery {
  keyword?: string;
}

export interface CustomerListItem {
  company_name: string;
  created_at: string;
  id: number;
  last_login_at: string;
  last_login_ip: string;
  phone: string;
  status: number;
  updated_at: string;
}

export type CustomerDetail = CustomerListItem;

export interface CustomerCreatePayload {
  company_name: string;
  confirm_password: string;
  confirm_pay_password: string;
  password: string;
  pay_password: string;
  phone: string;
  status: number;
}

export interface CustomerUpdatePayload {
  company_name: string;
  phone: string;
  status: number;
}

export interface CustomerPasswordPayload {
  confirm_password: string;
  password: string;
}

export interface CustomerPayPasswordPayload {
  confirm_pay_password: string;
  pay_password: string;
}
```

- [ ] **Step 5: Create admin customer API functions**

Create `apps/web-ele/src/api/modules/admin/customers/api.ts`:

```ts
import type { PagedResult } from '../common';
import type {
  CustomerCreatePayload,
  CustomerDetail,
  CustomerListItem,
  CustomerListQuery,
  CustomerPasswordPayload,
  CustomerPayPasswordPayload,
  CustomerTrashQuery,
  CustomerUpdatePayload,
} from './types';

import { requestClient } from '#/api/request';

import { patchAdminApi } from '../common';

/**
 * 客户管理：分页查询未删除客户列表。
 */
export async function getCustomerListApi(params: CustomerListQuery) {
  return requestClient.get<PagedResult<CustomerListItem>>('/admin/customers', {
    params,
  });
}

/**
 * 客户管理：分页查询回收站客户列表。
 */
export async function getCustomerTrashApi(params: CustomerTrashQuery) {
  return requestClient.get<PagedResult<CustomerListItem>>(
    '/admin/customers/trash',
    { params },
  );
}

export async function getCustomerDetailApi(id: number) {
  return requestClient.get<CustomerDetail>(`/admin/customers/${id}`);
}

export async function addCustomerApi(data: CustomerCreatePayload) {
  return requestClient.post<{ id: number }>('/admin/customers', data);
}

export async function updateCustomerApi(
  id: number,
  data: CustomerUpdatePayload,
) {
  return requestClient.put(`/admin/customers/${id}`, data);
}

export async function updateCustomerStatusApi(id: number, status: number) {
  return patchAdminApi(`/admin/customers/${id}/status`, { status });
}

export async function deleteCustomerApi(id: number) {
  return requestClient.delete(`/admin/customers/${id}`);
}

export async function restoreCustomerApi(id: number) {
  return patchAdminApi(`/admin/customers/${id}/restore`);
}

export async function resetCustomerPasswordApi(
  id: number,
  data: CustomerPasswordPayload,
) {
  return patchAdminApi(`/admin/customers/${id}/password`, data);
}

export async function resetCustomerPayPasswordApi(
  id: number,
  data: CustomerPayPasswordPayload,
) {
  return patchAdminApi(`/admin/customers/${id}/pay-password`, data);
}
```

- [ ] **Step 6: Create admin customer API barrel**

Create `apps/web-ele/src/api/modules/admin/customers/index.ts`:

```ts
export * from './api';
export * from './types';
```

- [ ] **Step 7: Create customer auth API types**

Create `apps/web-ele/src/api/modules/customer/auth/types.ts`:

```ts
export type CustomerSMSScene = 'forgot_password' | 'register';

export interface CustomerLoginUser {
  company_name: string;
  id: number;
  phone: string;
  status: number;
}

export interface CustomerAuthResult {
  customer: CustomerLoginUser;
  token: string;
}

export interface CustomerSMSSendPayload {
  phone: string;
  scene: CustomerSMSScene;
}

export interface CustomerLoginPayload {
  password: string;
  phone: string;
}

export interface CustomerRegisterPayload {
  company_name: string;
  confirm_password: string;
  confirm_pay_password: string;
  password: string;
  pay_password: string;
  phone: string;
  sms_code: string;
}

export interface CustomerForgotPasswordPayload {
  confirm_password: string;
  password: string;
  phone: string;
  sms_code: string;
}
```

- [ ] **Step 8: Create customer auth API functions**

Create `apps/web-ele/src/api/modules/customer/auth/api.ts`:

```ts
import type {
  CustomerAuthResult,
  CustomerForgotPasswordPayload,
  CustomerLoginPayload,
  CustomerRegisterPayload,
  CustomerSMSSendPayload,
} from './types';

import { requestClient } from '#/api/request';

export async function sendCustomerSMSApi(data: CustomerSMSSendPayload) {
  return requestClient.post('/customer/auth/sms/send', data);
}

export async function registerCustomerApi(data: CustomerRegisterPayload) {
  return requestClient.post<CustomerAuthResult>(
    '/customer/auth/register',
    data,
  );
}

export async function loginCustomerApi(data: CustomerLoginPayload) {
  return requestClient.post<CustomerAuthResult>('/customer/auth/login', data);
}

export async function forgotCustomerPasswordApi(
  data: CustomerForgotPasswordPayload,
) {
  return requestClient.post('/customer/auth/forgot-password', data);
}
```

- [ ] **Step 9: Create customer auth API barrel**

Create `apps/web-ele/src/api/modules/customer/auth/index.ts`:

```ts
export * from './api';
export * from './types';
```

- [ ] **Step 10: Run API contract test and verify pass**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/api/myjob-api-contract.test.ts
```

Expected: PASS.

- [ ] **Step 11: Commit API domains**

Run:

```bash
git add apps/web-ele/src/api/myjob-api-contract.test.ts apps/web-ele/src/api/modules/admin/customers apps/web-ele/src/api/modules/customer/auth
git commit -m "feat: add customer api domains"
```

Expected: commit succeeds.

---

### Task 2: Customer Auth Pure Functions And Schemas

**Files:**

- Create: `apps/web-ele/src/views/customer/auth/constants.ts`
- Create: `apps/web-ele/src/views/customer/auth/validators.ts`
- Create: `apps/web-ele/src/views/customer/auth/validators.test.ts`
- Create: `apps/web-ele/src/views/customer/auth/mappers.ts`
- Create: `apps/web-ele/src/views/customer/auth/mappers.test.ts`
- Create: `apps/web-ele/src/views/customer/auth/schemas.ts`
- Create: `apps/web-ele/src/views/customer/auth/schemas.test.ts`

- [ ] **Step 1: Write failing customer auth validator tests**

Create `apps/web-ele/src/views/customer/auth/validators.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  validateAgreementAccepted,
  validateCompanyName,
  validateCustomerLoginPassword,
  validateMatchingValue,
  validatePayPassword,
  validatePhone,
  validateSMSCode,
} from './validators';

describe('customer auth validators', () => {
  it('validates phone format', () => {
    expect(validatePhone('13800000000')).toBe('');
    expect(validatePhone('23800000000')).toBe('请输入 1 开头的 11 位手机号');
    expect(validatePhone('1380000000')).toBe('请输入 1 开头的 11 位手机号');
  });

  it('validates sms code and pay password', () => {
    expect(validateSMSCode('123456')).toBe('');
    expect(validateSMSCode('12345a')).toBe('请输入 6 位数字验证码');
    expect(validatePayPassword('654321')).toBe('');
    expect(validatePayPassword('65432a')).toBe('支付密码必须是 6 位数字');
  });

  it('validates login password rule', () => {
    expect(validateCustomerLoginPassword('Abc_123')).toBe('');
    expect(validateCustomerLoginPassword('1bc_123')).toBe(
      '登录密码必须字母开头，6-10 位，支持字母、数字、下划线',
    );
    expect(validateCustomerLoginPassword('Abc-123')).toBe(
      '登录密码必须字母开头，6-10 位，支持字母、数字、下划线',
    );
  });

  it('validates company name and matching values', () => {
    expect(validateCompanyName('测试公司')).toBe('');
    expect(validateCompanyName('')).toBe('请输入公司/店铺名称');
    expect(validateCompanyName('测'.repeat(101))).toBe(
      '公司/店铺名称不能超过 100 个字符',
    );
    expect(
      validateMatchingValue('Abc_123', 'Abc_123', '两次登录密码不一致'),
    ).toBe('');
    expect(
      validateMatchingValue('Abc_123', 'Abc_124', '两次登录密码不一致'),
    ).toBe('两次登录密码不一致');
  });

  it('validates agreement checkbox', () => {
    expect(validateAgreementAccepted(true)).toBe('');
    expect(validateAgreementAccepted(false)).toBe('请先同意服务协议');
  });
});
```

- [ ] **Step 2: Write failing customer auth mapper tests**

Create `apps/web-ele/src/views/customer/auth/mappers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  buildCustomerForgotPasswordPayload,
  buildCustomerLoginPayload,
  buildCustomerRegisterPayload,
} from './mappers';

describe('customer auth mappers', () => {
  it('builds trimmed login payload', () => {
    expect(
      buildCustomerLoginPayload({
        password: ' Abc_123 ',
        phone: ' 13800000000 ',
      }),
    ).toEqual({
      password: 'Abc_123',
      phone: '13800000000',
    });
  });

  it('builds trimmed register payload without agreement field', () => {
    expect(
      buildCustomerRegisterPayload({
        agree_policy: true,
        company_name: ' 测试公司 ',
        confirm_password: ' Abc_123 ',
        confirm_pay_password: ' 123456 ',
        password: ' Abc_123 ',
        pay_password: ' 123456 ',
        phone: ' 13800000000 ',
        sms_code: ' 654321 ',
      }),
    ).toEqual({
      company_name: '测试公司',
      confirm_password: 'Abc_123',
      confirm_pay_password: '123456',
      password: 'Abc_123',
      pay_password: '123456',
      phone: '13800000000',
      sms_code: '654321',
    });
  });

  it('builds forgot password payload', () => {
    expect(
      buildCustomerForgotPasswordPayload({
        confirm_password: ' New_123 ',
        password: ' New_123 ',
        phone: ' 13800000000 ',
        sms_code: ' 123456 ',
      }),
    ).toEqual({
      confirm_password: 'New_123',
      password: 'New_123',
      phone: '13800000000',
      sms_code: '123456',
    });
  });
});
```

- [ ] **Step 3: Write failing customer auth schema tests**

Create `apps/web-ele/src/views/customer/auth/schemas.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';

import {
  buildCustomerForgotPasswordSchema,
  buildCustomerLoginSchema,
  buildCustomerRegisterSchema,
} from './schemas';

describe('customer auth schemas', () => {
  it('builds login schema', () => {
    expect(buildCustomerLoginSchema().map((item) => item.fieldName)).toEqual([
      'phone',
      'password',
    ]);
  });

  it('builds register schema with sms suffix and agreement', () => {
    const schema = buildCustomerRegisterSchema({
      canSendSMS: true,
      countdownText: '',
      sending: false,
      sendSMS: vi.fn(),
    });
    expect(schema.map((item) => item.fieldName)).toEqual([
      'company_name',
      'phone',
      'sms_code',
      'password',
      'confirm_password',
      'pay_password',
      'confirm_pay_password',
      'agree_policy',
    ]);
    expect(schema.find((item) => item.fieldName === 'sms_code')?.suffix).toBe(
      expect.any(Function),
    );
  });

  it('builds forgot password schema with sms suffix', () => {
    const schema = buildCustomerForgotPasswordSchema({
      canSendSMS: false,
      countdownText: '59s',
      sending: true,
      sendSMS: vi.fn(),
    });
    expect(schema.map((item) => item.fieldName)).toEqual([
      'phone',
      'sms_code',
      'password',
      'confirm_password',
    ]);
    expect(schema.find((item) => item.fieldName === 'sms_code')?.suffix).toBe(
      expect.any(Function),
    );
  });
});
```

- [ ] **Step 4: Run pure customer auth tests and verify failure**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/customer/auth
```

Expected: FAIL because `constants.ts`, `validators.ts`, `mappers.ts`, and `schemas.ts` do not exist.

- [ ] **Step 5: Create customer auth constants**

Create `apps/web-ele/src/views/customer/auth/constants.ts`:

```ts
export const CUSTOMER_AUTH_SMS_COUNTDOWN_SECONDS = 60;
export const CUSTOMER_COMPANY_NAME_MAX_LENGTH = 100;
export const CUSTOMER_INFO_STORAGE_KEY = 'MYJOB_CUSTOMER_INFO';
export const CUSTOMER_TOKEN_STORAGE_KEY = 'MYJOB_CUSTOMER_TOKEN';
```

- [ ] **Step 6: Create customer auth validators**

Create `apps/web-ele/src/views/customer/auth/validators.ts`:

```ts
import { z } from '@vben/common-ui';

import { CUSTOMER_COMPANY_NAME_MAX_LENGTH } from './constants';

export const CUSTOMER_LOGIN_PASSWORD_MESSAGE =
  '登录密码必须字母开头，6-10 位，支持字母、数字、下划线';

export function validatePhone(value: unknown) {
  return /^1\d{10}$/.test(String(value ?? '').trim())
    ? ''
    : '请输入 1 开头的 11 位手机号';
}

export function validateSMSCode(value: unknown) {
  return /^\d{6}$/.test(String(value ?? '').trim())
    ? ''
    : '请输入 6 位数字验证码';
}

export function validateCustomerLoginPassword(value: unknown) {
  return /^[A-Za-z][A-Za-z0-9_]{5,9}$/.test(String(value ?? '').trim())
    ? ''
    : CUSTOMER_LOGIN_PASSWORD_MESSAGE;
}

export function validatePayPassword(value: unknown) {
  return /^\d{6}$/.test(String(value ?? '').trim())
    ? ''
    : '支付密码必须是 6 位数字';
}

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

export function validateMatchingValue(
  value: unknown,
  expected: unknown,
  message: string,
) {
  return String(value ?? '').trim() === String(expected ?? '').trim()
    ? ''
    : message;
}

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
export const companyNameRule = z
  .string()
  .refine((value) => !validateCompanyName(value), {
    message: '请输入公司/店铺名称',
  });
```

- [ ] **Step 7: Create customer auth mappers**

Create `apps/web-ele/src/views/customer/auth/mappers.ts`:

```ts
import type {
  CustomerForgotPasswordPayload,
  CustomerLoginPayload,
  CustomerRegisterPayload,
} from '#/api/modules/customer/auth';

function trimValue(value: unknown) {
  return String(value ?? '').trim();
}

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
```

- [ ] **Step 8: Create customer auth schemas**

Create `apps/web-ele/src/views/customer/auth/schemas.ts`:

```ts
import type { VbenFormSchema } from '@vben/common-ui';

import { h } from 'vue';

import { z } from '@vben/common-ui';

import { ElButton } from 'element-plus';

import {
  companyNameRule,
  loginPasswordRule,
  payPasswordRule,
  phoneRule,
  smsCodeRule,
} from './validators';

interface SMSActionOptions {
  canSendSMS: boolean;
  countdownText: string;
  sending: boolean;
  sendSMS: () => void;
}

function buildSMSSuffix(options: SMSActionOptions) {
  return () =>
    h(
      ElButton,
      {
        disabled: !options.canSendSMS,
        link: true,
        loading: options.sending,
        type: 'primary',
        onClick: options.sendSMS,
      },
      () => options.countdownText || '发送验证码',
    );
}

export function buildCustomerLoginSchema(): VbenFormSchema[] {
  return [
    {
      component: 'VbenInput',
      componentProps: { placeholder: '请输入手机号' },
      fieldName: 'phone',
      label: '手机号',
      rules: phoneRule,
    },
    {
      component: 'VbenInputPassword',
      componentProps: { placeholder: '请输入登录密码' },
      fieldName: 'password',
      label: '登录密码',
      rules: loginPasswordRule,
    },
  ];
}

export function buildCustomerRegisterSchema(
  smsOptions: SMSActionOptions,
): VbenFormSchema[] {
  return [
    {
      component: 'VbenInput',
      componentProps: { placeholder: '请输入公司或店铺名称' },
      fieldName: 'company_name',
      label: '公司/店铺名称',
      rules: companyNameRule,
    },
    {
      component: 'VbenInput',
      componentProps: { placeholder: '请输入手机号' },
      fieldName: 'phone',
      label: '手机号',
      rules: phoneRule,
    },
    {
      component: 'VbenInput',
      componentProps: { maxlength: 6, placeholder: '请输入 6 位验证码' },
      fieldName: 'sms_code',
      label: '短信验证码',
      rules: smsCodeRule,
      suffix: buildSMSSuffix(smsOptions),
    },
    {
      component: 'VbenInputPassword',
      componentProps: { placeholder: '字母开头，6-10 位' },
      fieldName: 'password',
      label: '登录密码',
      rules: loginPasswordRule,
    },
    {
      component: 'VbenInputPassword',
      componentProps: { placeholder: '请再次输入登录密码' },
      dependencies: {
        rules(values) {
          return z.string().refine((value) => value === values.password, {
            message: '两次登录密码不一致',
          });
        },
        triggerFields: ['password'],
      },
      fieldName: 'confirm_password',
      label: '确认登录密码',
    },
    {
      component: 'VbenInputPassword',
      componentProps: { maxlength: 6, placeholder: '请输入 6 位支付密码' },
      fieldName: 'pay_password',
      label: '支付密码',
      rules: payPasswordRule,
    },
    {
      component: 'VbenInputPassword',
      componentProps: { maxlength: 6, placeholder: '请再次输入支付密码' },
      dependencies: {
        rules(values) {
          return z.string().refine((value) => value === values.pay_password, {
            message: '两次支付密码不一致',
          });
        },
        triggerFields: ['pay_password'],
      },
      fieldName: 'confirm_pay_password',
      label: '确认支付密码',
    },
    {
      component: 'Checkbox',
      fieldName: 'agree_policy',
      renderComponentContent: () => ({
        default: () => '我已阅读并同意服务协议',
      }),
      rules: z.boolean().refine((value) => value === true, {
        message: '请先同意服务协议',
      }),
    },
  ];
}

export function buildCustomerForgotPasswordSchema(
  smsOptions: SMSActionOptions,
): VbenFormSchema[] {
  return [
    {
      component: 'VbenInput',
      componentProps: { placeholder: '请输入手机号' },
      fieldName: 'phone',
      label: '手机号',
      rules: phoneRule,
    },
    {
      component: 'VbenInput',
      componentProps: { maxlength: 6, placeholder: '请输入 6 位验证码' },
      fieldName: 'sms_code',
      label: '短信验证码',
      rules: smsCodeRule,
      suffix: buildSMSSuffix(smsOptions),
    },
    {
      component: 'VbenInputPassword',
      componentProps: { placeholder: '字母开头，6-10 位' },
      fieldName: 'password',
      label: '新登录密码',
      rules: loginPasswordRule,
    },
    {
      component: 'VbenInputPassword',
      componentProps: { placeholder: '请再次输入新登录密码' },
      dependencies: {
        rules(values) {
          return z.string().refine((value) => value === values.password, {
            message: '两次登录密码不一致',
          });
        },
        triggerFields: ['password'],
      },
      fieldName: 'confirm_password',
      label: '确认新密码',
    },
  ];
}
```

- [ ] **Step 9: Run customer auth pure tests and verify pass**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/customer/auth
```

Expected: PASS.

- [ ] **Step 10: Commit customer auth pure functions**

Run:

```bash
git add apps/web-ele/src/views/customer/auth/constants.ts apps/web-ele/src/views/customer/auth/validators.ts apps/web-ele/src/views/customer/auth/validators.test.ts apps/web-ele/src/views/customer/auth/mappers.ts apps/web-ele/src/views/customer/auth/mappers.test.ts apps/web-ele/src/views/customer/auth/schemas.ts apps/web-ele/src/views/customer/auth/schemas.test.ts
git commit -m "feat: add customer auth form helpers"
```

Expected: commit succeeds.

---

### Task 3: Customer Auth Store And Customer Routes

**Files:**

- Create: `apps/web-ele/src/store/customer-auth.ts`
- Create: `apps/web-ele/src/store/customer-auth.test.ts`
- Modify: `apps/web-ele/src/store/index.ts`
- Modify: `apps/web-ele/src/router/routes/core.ts`
- Create: `apps/web-ele/src/router/routes/core.test.ts`
- Modify: `apps/web-ele/src/router/guard.ts`

- [ ] **Step 1: Write failing customer auth store test**

Create `apps/web-ele/src/store/customer-auth.test.ts`:

```ts
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCustomerAuthStore } from './customer-auth';

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
}));

const apiMocks = vi.hoisted(() => ({
  forgotCustomerPasswordApi: vi.fn(),
  loginCustomerApi: vi.fn(),
  registerCustomerApi: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRouter: () => routerMock,
}));

vi.mock('#/api/modules/customer/auth', () => apiMocks);

describe('customer-auth store', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('logs in and persists customer session separately from admin token', async () => {
    apiMocks.loginCustomerApi.mockResolvedValue({
      customer: {
        company_name: '测试公司',
        id: 9,
        phone: '13800000000',
        status: 1,
      },
      token: 'customer-token',
    });

    const store = useCustomerAuthStore();
    await store.login({
      password: 'Abc_123',
      phone: '13800000000',
    });

    expect(apiMocks.loginCustomerApi).toHaveBeenCalledWith({
      password: 'Abc_123',
      phone: '13800000000',
    });
    expect(store.token).toBe('customer-token');
    expect(store.customer?.company_name).toBe('测试公司');
    expect(localStorage.getItem('MYJOB_CUSTOMER_TOKEN')).toBe('customer-token');
    expect(routerMock.push).toHaveBeenCalledWith('/customer/home');
  });

  it('registers and persists customer session', async () => {
    apiMocks.registerCustomerApi.mockResolvedValue({
      customer: {
        company_name: '注册公司',
        id: 10,
        phone: '13800000001',
        status: 1,
      },
      token: 'register-token',
    });

    const store = useCustomerAuthStore();
    await store.register({
      company_name: '注册公司',
      confirm_password: 'Abc_123',
      confirm_pay_password: '123456',
      password: 'Abc_123',
      pay_password: '123456',
      phone: '13800000001',
      sms_code: '123456',
    });

    expect(store.token).toBe('register-token');
    expect(store.customer?.phone).toBe('13800000001');
    expect(routerMock.push).toHaveBeenCalledWith('/customer/home');
  });

  it('clears old customer session after forgot password', async () => {
    localStorage.setItem('MYJOB_CUSTOMER_TOKEN', 'old-token');
    localStorage.setItem(
      'MYJOB_CUSTOMER_INFO',
      JSON.stringify({
        company_name: '旧客户',
        id: 1,
        phone: '13800000002',
        status: 1,
      }),
    );
    apiMocks.forgotCustomerPasswordApi.mockResolvedValue(undefined);

    const store = useCustomerAuthStore();
    expect(store.token).toBe('old-token');

    await store.forgotPassword({
      confirm_password: 'New_123',
      password: 'New_123',
      phone: '13800000002',
      sms_code: '123456',
    });

    expect(store.token).toBe('');
    expect(store.customer).toBeNull();
    expect(localStorage.getItem('MYJOB_CUSTOMER_TOKEN')).toBeNull();
    expect(routerMock.push).toHaveBeenCalledWith('/customer/auth/login');
  });

  it('logs out customer locally', async () => {
    localStorage.setItem('MYJOB_CUSTOMER_TOKEN', 'old-token');
    const store = useCustomerAuthStore();

    await store.logout();

    expect(store.token).toBe('');
    expect(store.customer).toBeNull();
    expect(routerMock.push).toHaveBeenCalledWith('/customer/auth/login');
  });
});
```

- [ ] **Step 2: Write failing customer core routes test**

Create `apps/web-ele/src/router/routes/core.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { coreRoutes } from './core';

describe('core routes', () => {
  it('defines customer auth and home routes outside admin menu routes', () => {
    const customerAuth = coreRoutes.find(
      (route) => route.name === 'CustomerAuthentication',
    );
    expect(customerAuth).toMatchObject({
      meta: { hideInTab: true, title: '客户认证' },
      path: '/customer/auth',
      redirect: '/customer/auth/login',
    });
    expect(customerAuth?.children?.map((route) => route.path)).toEqual([
      'login',
      'register',
      'forgot-password',
    ]);

    const customerHome = coreRoutes.find(
      (route) => route.name === 'CustomerHome',
    );
    expect(customerHome).toMatchObject({
      meta: { hideInBreadcrumb: true, hideInMenu: true, title: '客户首页' },
      path: '/customer/home',
    });
  });
});
```

- [ ] **Step 3: Run store and route tests and verify failure**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/store/customer-auth.test.ts apps/web-ele/src/router/routes/core.test.ts
```

Expected: FAIL because `customer-auth.ts` and customer routes do not exist.

- [ ] **Step 4: Create customer auth store**

Create `apps/web-ele/src/store/customer-auth.ts`:

```ts
import type {
  CustomerAuthResult,
  CustomerForgotPasswordPayload,
  CustomerLoginPayload,
  CustomerLoginUser,
  CustomerRegisterPayload,
} from '#/api/modules/customer/auth';

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { defineStore } from 'pinia';

import {
  forgotCustomerPasswordApi,
  loginCustomerApi,
  registerCustomerApi,
} from '#/api/modules/customer/auth';
import {
  CUSTOMER_INFO_STORAGE_KEY,
  CUSTOMER_TOKEN_STORAGE_KEY,
} from '#/views/customer/auth/constants';

function readStoredCustomer() {
  const rawValue = localStorage.getItem(CUSTOMER_INFO_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }
  try {
    return JSON.parse(rawValue) as CustomerLoginUser;
  } catch {
    localStorage.removeItem(CUSTOMER_INFO_STORAGE_KEY);
    return null;
  }
}

function persistCustomerSession(result: CustomerAuthResult) {
  localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, result.token);
  localStorage.setItem(
    CUSTOMER_INFO_STORAGE_KEY,
    JSON.stringify(result.customer),
  );
}

function clearStoredCustomerSession() {
  localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
  localStorage.removeItem(CUSTOMER_INFO_STORAGE_KEY);
}

export const useCustomerAuthStore = defineStore('customer-auth', () => {
  const router = useRouter();
  const token = ref(localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY) ?? '');
  const customer = ref<null | CustomerLoginUser>(readStoredCustomer());
  const loading = ref(false);
  const isLoggedIn = computed(() => !!token.value);

  async function applySession(result: CustomerAuthResult) {
    token.value = result.token;
    customer.value = result.customer;
    persistCustomerSession(result);
    await router.push('/customer/home');
  }

  function clearSession() {
    token.value = '';
    customer.value = null;
    clearStoredCustomerSession();
  }

  async function login(payload: CustomerLoginPayload) {
    try {
      loading.value = true;
      await applySession(await loginCustomerApi(payload));
    } finally {
      loading.value = false;
    }
  }

  async function register(payload: CustomerRegisterPayload) {
    try {
      loading.value = true;
      await applySession(await registerCustomerApi(payload));
    } finally {
      loading.value = false;
    }
  }

  async function forgotPassword(payload: CustomerForgotPasswordPayload) {
    try {
      loading.value = true;
      await forgotCustomerPasswordApi(payload);
      // 找回密码会使旧客户 token 失效，前端必须同步清理本地客户登录态。
      clearSession();
      await router.push('/customer/auth/login');
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    clearSession();
    await router.push('/customer/auth/login');
  }

  return {
    clearSession,
    customer,
    forgotPassword,
    isLoggedIn,
    loading,
    login,
    logout,
    register,
    token,
  };
});
```

- [ ] **Step 5: Export customer auth store**

Modify `apps/web-ele/src/store/index.ts`:

```ts
export * from './auth';
export * from './customer-auth';
```

- [ ] **Step 6: Add customer core routes**

Modify `apps/web-ele/src/router/routes/core.ts` by adding these route records before the `/forbidden` route:

```ts
  {
    component: AuthPageLayout,
    meta: {
      hideInTab: true,
      title: '客户认证',
    },
    name: 'CustomerAuthentication',
    path: '/customer/auth',
    redirect: '/customer/auth/login',
    children: [
      {
        component: () => import('#/views/customer/auth/login.vue'),
        meta: { title: '客户登录' },
        name: 'CustomerLogin',
        path: 'login',
      },
      {
        component: () => import('#/views/customer/auth/register.vue'),
        meta: { title: '客户注册' },
        name: 'CustomerRegister',
        path: 'register',
      },
      {
        component: () => import('#/views/customer/auth/forgot-password.vue'),
        meta: { title: '忘记密码' },
        name: 'CustomerForgotPassword',
        path: 'forgot-password',
      },
    ],
  },
  {
    component: () => import('#/views/customer/home/index.vue'),
    meta: {
      hideInBreadcrumb: true,
      hideInMenu: true,
      hideInTab: true,
      title: '客户首页',
    },
    name: 'CustomerHome',
    path: '/customer/home',
  },
```

- [ ] **Step 7: Add customer route guard**

Modify `apps/web-ele/src/router/guard.ts`.

Add this import:

```ts
import { useAuthStore, useCustomerAuthStore } from '#/store';
```

Replace the existing `useAuthStore` import line with the combined import above.

Add this function before `setupAccessGuard`:

```ts
function setupCustomerGuard(router: Router) {
  router.beforeEach((to) => {
    const customerAuthStore = useCustomerAuthStore();
    const isCustomerAuthRoute = to.path.startsWith('/customer/auth');
    const isCustomerHomeRoute = to.path === '/customer/home';

    if (to.path === '/customer/auth/login' && customerAuthStore.token) {
      return { path: '/customer/home', replace: true };
    }

    if (isCustomerHomeRoute && !customerAuthStore.token) {
      return { path: '/customer/auth/login', replace: true };
    }

    if (isCustomerAuthRoute || isCustomerHomeRoute) {
      return true;
    }

    return true;
  });
}
```

Update `createRouterGuard`:

```ts
function createRouterGuard(router: Router) {
  setupCommonGuard(router);
  setupCustomerGuard(router);
  setupAccessGuard(router);
}
```

- [ ] **Step 8: Run store and route tests and verify pass**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/store/customer-auth.test.ts apps/web-ele/src/router/routes/core.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit customer store and routes**

Run:

```bash
git add apps/web-ele/src/store/customer-auth.ts apps/web-ele/src/store/customer-auth.test.ts apps/web-ele/src/store/index.ts apps/web-ele/src/router/routes/core.ts apps/web-ele/src/router/routes/core.test.ts apps/web-ele/src/router/guard.ts
git commit -m "feat: add customer auth session routes"
```

Expected: commit succeeds.

---

### Task 4: Customer Auth Pages And Customer Home

**Files:**

- Create: `apps/web-ele/src/views/customer/auth/login.vue`
- Create: `apps/web-ele/src/views/customer/auth/register.vue`
- Create: `apps/web-ele/src/views/customer/auth/forgot-password.vue`
- Create: `apps/web-ele/src/views/customer/home/index.vue`
- Create: `apps/web-ele/src/views/customer/home/index.test.ts`

- [ ] **Step 1: Write failing customer home test**

Create `apps/web-ele/src/views/customer/home/index.test.ts`:

```ts
/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import CustomerHome from './index.vue';

const storeMock = vi.hoisted(() => ({
  customer: {
    company_name: '测试公司',
    id: 8,
    phone: '13800000000',
    status: 1,
  },
  logout: vi.fn(),
}));

vi.mock('#/store', () => ({
  useCustomerAuthStore: () => storeMock,
}));

vi.mock('element-plus', () => ({
  ElButton: defineComponent({
    name: 'ElButtonStub',
    emits: ['click'],
    setup(_, { emit, slots }) {
      return () =>
        h(
          'button',
          { onClick: (event: Event) => emit('click', event) },
          slots.default?.(),
        );
    },
  }),
  ElDescriptions: defineComponent({
    name: 'ElDescriptionsStub',
    setup(_, { slots }) {
      return () => h('dl', slots.default?.());
    },
  }),
  ElDescriptionsItem: defineComponent({
    name: 'ElDescriptionsItemStub',
    props: { label: { default: '', type: String } },
    setup(props, { slots }) {
      return () => h('div', [h('dt', props.label), h('dd', slots.default?.())]);
    },
  }),
}));

async function renderHome() {
  const root = document.createElement('div');
  document.body.append(root);
  const app = createApp(CustomerHome);
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

describe('CustomerHome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders current customer and supports local logout', async () => {
    const view = await renderHome();

    expect(view.root.textContent).toContain('测试公司');
    expect(view.root.textContent).toContain('13800000000');
    expect(view.root.textContent).toContain('启用');

    view.root
      .querySelector('button')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(storeMock.logout).toHaveBeenCalledTimes(1);

    view.unmount();
  });
});
```

- [ ] **Step 2: Run customer page tests and verify failure**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/customer/home/index.test.ts
```

Expected: FAIL because `home/index.vue` does not exist.

- [ ] **Step 3: Create customer login page**

Create `apps/web-ele/src/views/customer/auth/login.vue`:

```vue
<script lang="ts" setup>
import { computed } from 'vue';

import { AuthenticationLogin } from '@vben/common-ui';

import { useCustomerAuthStore } from '#/store';

import { buildCustomerLoginPayload } from './mappers';
import { buildCustomerLoginSchema } from './schemas';

defineOptions({ name: 'CustomerLogin' });

const customerAuthStore = useCustomerAuthStore();
const formSchema = computed(() => buildCustomerLoginSchema());

async function handleSubmit(values: Record<string, any>) {
  await customerAuthStore.login(buildCustomerLoginPayload(values));
}
</script>

<template>
  <AuthenticationLogin
    :forget-password-path="'/customer/auth/forgot-password'"
    :form-schema="formSchema"
    :loading="customerAuthStore.loading"
    :register-path="'/customer/auth/register'"
    :show-code-login="false"
    :show-forget-password="true"
    :show-qrcode-login="false"
    :show-register="true"
    :show-remember-me="false"
    :show-third-party-login="false"
    sub-title="请输入手机号和登录密码登录客户中心"
    title="客户登录"
    @submit="handleSubmit"
  />
</template>
```

- [ ] **Step 4: Create customer register page**

Create `apps/web-ele/src/views/customer/auth/register.vue`:

```vue
<script lang="ts" setup>
import { computed, onBeforeUnmount, ref } from 'vue';

import { AuthenticationRegister } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { sendCustomerSMSApi } from '#/api/modules/customer/auth';
import { useCustomerAuthStore } from '#/store';

import { CUSTOMER_AUTH_SMS_COUNTDOWN_SECONDS } from './constants';
import { buildCustomerRegisterPayload } from './mappers';
import { buildCustomerRegisterSchema } from './schemas';

defineOptions({ name: 'CustomerRegister' });

const customerAuthStore = useCustomerAuthStore();
const sending = ref(false);
const countdown = ref(0);
let timer: ReturnType<typeof window.setInterval> | undefined;

const canSendSMS = computed(() => countdown.value <= 0 && !sending.value);
const countdownText = computed(() =>
  countdown.value > 0 ? `${countdown.value}s` : '',
);
const formSchema = computed(() =>
  buildCustomerRegisterSchema({
    canSendSMS: canSendSMS.value,
    countdownText: countdownText.value,
    sending: sending.value,
    sendSMS: handleSendSMS,
  }),
);

function startCountdown() {
  countdown.value = CUSTOMER_AUTH_SMS_COUNTDOWN_SECONDS;
  window.clearInterval(timer);
  timer = window.setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      window.clearInterval(timer);
    }
  }, 1000);
}

async function handleSendSMS() {
  if (!canSendSMS.value) {
    return;
  }
  const phone = window.prompt('请输入接收验证码的手机号')?.trim();
  if (!phone) {
    ElMessage.warning('请先输入手机号');
    return;
  }
  try {
    sending.value = true;
    await sendCustomerSMSApi({ phone, scene: 'register' });
    startCountdown();
    ElMessage.success('验证码已发送，请注意查收短信');
  } finally {
    sending.value = false;
  }
}

async function handleSubmit(values: Record<string, any>) {
  await customerAuthStore.register(buildCustomerRegisterPayload(values));
}

onBeforeUnmount(() => {
  window.clearInterval(timer);
});
</script>

<template>
  <AuthenticationRegister
    :form-schema="formSchema"
    :loading="customerAuthStore.loading"
    login-path="/customer/auth/login"
    sub-title="填写资料并完成短信验证后进入客户中心"
    submit-button-text="注册并登录"
    title="客户注册"
    @submit="handleSubmit"
  />
</template>
```

Implementation note: the first implementation may use `window.prompt` to keep the SMS action independent of Vben internal form APIs. After tests pass, the engineer may replace it with `AuthenticationRegister.getFormApi()` if the component ref proves stable; keep the payload and countdown behavior unchanged.

- [ ] **Step 5: Create customer forgot password page**

Create `apps/web-ele/src/views/customer/auth/forgot-password.vue`:

```vue
<script lang="ts" setup>
import { computed, onBeforeUnmount, ref } from 'vue';

import { AuthenticationForgetPassword } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { sendCustomerSMSApi } from '#/api/modules/customer/auth';
import { useCustomerAuthStore } from '#/store';

import { CUSTOMER_AUTH_SMS_COUNTDOWN_SECONDS } from './constants';
import { buildCustomerForgotPasswordPayload } from './mappers';
import { buildCustomerForgotPasswordSchema } from './schemas';

defineOptions({ name: 'CustomerForgotPassword' });

const customerAuthStore = useCustomerAuthStore();
const sending = ref(false);
const countdown = ref(0);
let timer: ReturnType<typeof window.setInterval> | undefined;

const canSendSMS = computed(() => countdown.value <= 0 && !sending.value);
const countdownText = computed(() =>
  countdown.value > 0 ? `${countdown.value}s` : '',
);
const formSchema = computed(() =>
  buildCustomerForgotPasswordSchema({
    canSendSMS: canSendSMS.value,
    countdownText: countdownText.value,
    sending: sending.value,
    sendSMS: handleSendSMS,
  }),
);

function startCountdown() {
  countdown.value = CUSTOMER_AUTH_SMS_COUNTDOWN_SECONDS;
  window.clearInterval(timer);
  timer = window.setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      window.clearInterval(timer);
    }
  }, 1000);
}

async function handleSendSMS() {
  if (!canSendSMS.value) {
    return;
  }
  const phone = window.prompt('请输入接收验证码的手机号')?.trim();
  if (!phone) {
    ElMessage.warning('请先输入手机号');
    return;
  }
  try {
    sending.value = true;
    await sendCustomerSMSApi({ phone, scene: 'forgot_password' });
    startCountdown();
    ElMessage.success('验证码已发送，请注意查收短信');
  } finally {
    sending.value = false;
  }
}

async function handleSubmit(values: Record<string, any>) {
  await customerAuthStore.forgotPassword(
    buildCustomerForgotPasswordPayload(values),
  );
  ElMessage.success('登录密码已重置，请重新登录');
}

onBeforeUnmount(() => {
  window.clearInterval(timer);
});
</script>

<template>
  <AuthenticationForgetPassword
    :form-schema="formSchema"
    :loading="customerAuthStore.loading"
    login-path="/customer/auth/login"
    sub-title="通过短信验证码重置客户登录密码"
    submit-button-text="重置登录密码"
    title="忘记密码"
    @submit="handleSubmit"
  />
</template>
```

- [ ] **Step 6: Create customer home page**

Create `apps/web-ele/src/views/customer/home/index.vue`:

```vue
<script lang="ts" setup>
import { ElButton, ElDescriptions, ElDescriptionsItem } from 'element-plus';

import { useCustomerAuthStore } from '#/store';

defineOptions({ name: 'CustomerHome' });

const customerAuthStore = useCustomerAuthStore();

function statusText(status?: number) {
  return status === 1 ? '启用' : '禁用';
}
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-10">
    <div class="mb-6 flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">客户中心</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          当前仅提供登录态信息展示。
        </p>
      </div>
      <ElButton type="primary" @click="customerAuthStore.logout">
        退出登录
      </ElButton>
    </div>

    <ElDescriptions border :column="1" title="当前客户">
      <ElDescriptionsItem label="公司/店铺名称">
        {{ customerAuthStore.customer?.company_name || '--' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="手机号">
        {{ customerAuthStore.customer?.phone || '--' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="状态">
        {{ statusText(customerAuthStore.customer?.status) }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </main>
</template>
```

- [ ] **Step 7: Run customer page tests and customer auth pure tests**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/customer apps/web-ele/src/store/customer-auth.test.ts apps/web-ele/src/router/routes/core.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit customer auth pages**

Run:

```bash
git add apps/web-ele/src/views/customer
git commit -m "feat: add customer auth pages"
```

Expected: commit succeeds.

---

### Task 5: Admin Customer Pure Functions And Schemas

**Files:**

- Create: `apps/web-ele/src/views/myjob/customers/constants.ts`
- Create: `apps/web-ele/src/views/myjob/customers/types.ts`
- Create: `apps/web-ele/src/views/myjob/customers/validators.ts`
- Create: `apps/web-ele/src/views/myjob/customers/validators.test.ts`
- Create: `apps/web-ele/src/views/myjob/customers/mappers.ts`
- Create: `apps/web-ele/src/views/myjob/customers/mappers.test.ts`
- Create: `apps/web-ele/src/views/myjob/customers/schemas.ts`
- Create: `apps/web-ele/src/views/myjob/customers/schemas.test.ts`

- [ ] **Step 1: Write failing admin customer validator tests**

Create `apps/web-ele/src/views/myjob/customers/validators.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  validateCustomerCompanyName,
  validateCustomerLoginPassword,
  validateCustomerPayPassword,
  validateCustomerPhone,
  validateCustomerStatus,
} from './validators';

describe('admin customer validators', () => {
  it('validates editable customer fields', () => {
    expect(validateCustomerCompanyName('测试公司')).toBe('');
    expect(validateCustomerCompanyName('')).toBe('请输入公司/店铺名称');
    expect(validateCustomerPhone('13800000000')).toBe('');
    expect(validateCustomerPhone('1380000000')).toBe(
      '请输入 1 开头的 11 位手机号',
    );
    expect(validateCustomerStatus(1)).toBe('');
    expect(validateCustomerStatus(0)).toBe('');
    expect(validateCustomerStatus(2)).toBe('状态值错误');
  });

  it('validates password fields', () => {
    expect(validateCustomerLoginPassword('Abc_123')).toBe('');
    expect(validateCustomerLoginPassword('1bc_123')).toBe(
      '登录密码必须字母开头，6-10 位，支持字母、数字、下划线',
    );
    expect(validateCustomerPayPassword('123456')).toBe('');
    expect(validateCustomerPayPassword('12345a')).toBe(
      '支付密码必须是 6 位数字',
    );
  });
});
```

- [ ] **Step 2: Write failing admin customer mapper tests**

Create `apps/web-ele/src/views/myjob/customers/mappers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  buildCustomerListQuery,
  buildCustomerPayload,
  buildCustomerTrashQuery,
  buildPasswordPayload,
  buildPayPasswordPayload,
  toCustomerFormValues,
} from './mappers';

describe('admin customer mappers', () => {
  it('builds list and trash queries', () => {
    expect(
      buildCustomerListQuery(
        { page: { currentPage: 2, pageSize: 30 } },
        { keyword: ' 测试 ', status: '1' },
      ),
    ).toEqual({
      keyword: '测试',
      page: 2,
      page_size: 30,
      status: 1,
    });
    expect(
      buildCustomerListQuery(
        { page: { currentPage: 1, pageSize: 20 } },
        { keyword: ' ', status: '' },
      ),
    ).toEqual({
      page: 1,
      page_size: 20,
    });
    expect(
      buildCustomerTrashQuery(
        { page: { currentPage: 3, pageSize: 10 } },
        { keyword: ' 回收 ' },
      ),
    ).toEqual({
      keyword: '回收',
      page: 3,
      page_size: 10,
    });
  });

  it('builds create payload with passwords and edit payload without passwords', () => {
    expect(
      buildCustomerPayload(
        {
          company_name: ' 测试公司 ',
          confirm_password: ' Abc_123 ',
          confirm_pay_password: ' 123456 ',
          password: ' Abc_123 ',
          pay_password: ' 123456 ',
          phone: ' 13800000000 ',
          status: 1,
        },
        'create',
      ),
    ).toEqual({
      company_name: '测试公司',
      confirm_password: 'Abc_123',
      confirm_pay_password: '123456',
      password: 'Abc_123',
      pay_password: '123456',
      phone: '13800000000',
      status: 1,
    });

    expect(
      buildCustomerPayload(
        {
          company_name: ' 编辑公司 ',
          confirm_password: 'should-drop',
          confirm_pay_password: 'should-drop',
          password: 'should-drop',
          pay_password: 'should-drop',
          phone: ' 13800000001 ',
          status: 0,
        },
        'edit',
      ),
    ).toEqual({
      company_name: '编辑公司',
      phone: '13800000001',
      status: 0,
    });
  });

  it('maps row to editable form and builds password payloads', () => {
    expect(
      toCustomerFormValues({
        company_name: '测试公司',
        created_at: '',
        id: 1,
        last_login_at: '',
        last_login_ip: '',
        phone: '13800000000',
        status: 1,
        updated_at: '',
      }),
    ).toEqual({
      company_name: '测试公司',
      confirm_password: '',
      confirm_pay_password: '',
      password: '',
      pay_password: '',
      phone: '13800000000',
      status: 1,
    });
    expect(
      buildPasswordPayload({
        confirm_password: ' New_123 ',
        password: ' New_123 ',
      }),
    ).toEqual({
      confirm_password: 'New_123',
      password: 'New_123',
    });
    expect(
      buildPayPasswordPayload({
        confirm_pay_password: ' 654321 ',
        pay_password: ' 654321 ',
      }),
    ).toEqual({
      confirm_pay_password: '654321',
      pay_password: '654321',
    });
  });
});
```

- [ ] **Step 3: Write failing admin customer schema tests**

Create `apps/web-ele/src/views/myjob/customers/schemas.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  buildCustomerColumns,
  buildCustomerFilterSchema,
  buildCustomerTrashColumns,
  buildCustomerTrashFilterSchema,
  CUSTOMER_STATUS_OPTIONS,
  resolveCustomerStatusText,
} from './schemas';

describe('admin customer schemas', () => {
  it('builds filters and status options', () => {
    expect(buildCustomerFilterSchema().map((item) => item.fieldName)).toEqual([
      'keyword',
      'status',
    ]);
    expect(
      buildCustomerTrashFilterSchema().map((item) => item.fieldName),
    ).toEqual(['keyword']);
    expect(CUSTOMER_STATUS_OPTIONS).toEqual([
      { label: '全部', value: '' },
      { label: '启用', value: '1' },
      { label: '禁用', value: '0' },
    ]);
  });

  it('builds list and trash columns', () => {
    expect(buildCustomerColumns().map((column) => column.field)).toEqual([
      'id',
      'company_name',
      'phone',
      'status',
      'last_login_ip',
      'last_login_at',
      'created_at',
      'updated_at',
      'actions',
    ]);
    expect(buildCustomerTrashColumns().map((column) => column.field)).toEqual([
      'id',
      'company_name',
      'phone',
      'status',
      'last_login_ip',
      'last_login_at',
      'created_at',
      'updated_at',
      'actions',
    ]);
  });

  it('resolves status text', () => {
    expect(resolveCustomerStatusText(1)).toBe('启用');
    expect(resolveCustomerStatusText(0)).toBe('禁用');
    expect(resolveCustomerStatusText(2)).toBe('未知');
  });
});
```

- [ ] **Step 4: Run admin pure tests and verify failure**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/customers
```

Expected: FAIL because pure files do not exist.

- [ ] **Step 5: Create admin customer constants and types**

Create `apps/web-ele/src/views/myjob/customers/constants.ts`:

```ts
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
```

Create `apps/web-ele/src/views/myjob/customers/types.ts`:

```ts
export type CustomerDialogMode = 'create' | 'edit';

export interface CustomerFormState {
  company_name: string;
  confirm_password: string;
  confirm_pay_password: string;
  password: string;
  pay_password: string;
  phone: string;
  status: number;
}

export interface CustomerPasswordFormState {
  confirm_password: string;
  password: string;
}

export interface CustomerPayPasswordFormState {
  confirm_pay_password: string;
  pay_password: string;
}
```

- [ ] **Step 6: Create admin customer validators**

Create `apps/web-ele/src/views/myjob/customers/validators.ts`:

```ts
import { CUSTOMER_COMPANY_NAME_MAX_LENGTH, CUSTOMER_STATUS } from './constants';

type RuleCallback = (error?: Error) => void;

export const CUSTOMER_LOGIN_PASSWORD_MESSAGE =
  '登录密码必须字母开头，6-10 位，支持字母、数字、下划线';

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

export function validateCustomerPhone(value: unknown) {
  return /^1\d{10}$/.test(String(value ?? '').trim())
    ? ''
    : '请输入 1 开头的 11 位手机号';
}

export function validateCustomerLoginPassword(value: unknown) {
  return /^[A-Za-z][A-Za-z0-9_]{5,9}$/.test(String(value ?? '').trim())
    ? ''
    : CUSTOMER_LOGIN_PASSWORD_MESSAGE;
}

export function validateCustomerPayPassword(value: unknown) {
  return /^\d{6}$/.test(String(value ?? '').trim())
    ? ''
    : '支付密码必须是 6 位数字';
}

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

export function buildCustomerFormRules(mode: 'create' | 'edit') {
  return {
    company_name: [createRule(validateCustomerCompanyName)],
    confirm_password:
      mode === 'create' ? [createRule(validateCustomerLoginPassword)] : [],
    confirm_pay_password:
      mode === 'create' ? [createRule(validateCustomerPayPassword)] : [],
    password:
      mode === 'create' ? [createRule(validateCustomerLoginPassword)] : [],
    pay_password:
      mode === 'create' ? [createRule(validateCustomerPayPassword)] : [],
    phone: [createRule(validateCustomerPhone)],
    status: [createRule(validateCustomerStatus, 'change')],
  };
}

export function buildCustomerPasswordRules() {
  return {
    confirm_password: [createRule(validateCustomerLoginPassword)],
    password: [createRule(validateCustomerLoginPassword)],
  };
}

export function buildCustomerPayPasswordRules() {
  return {
    confirm_pay_password: [createRule(validateCustomerPayPassword)],
    pay_password: [createRule(validateCustomerPayPassword)],
  };
}
```

- [ ] **Step 7: Create admin customer mappers**

Create `apps/web-ele/src/views/myjob/customers/mappers.ts`:

```ts
import type { GridPageParams } from '../shared';
import type {
  CustomerCreatePayload,
  CustomerListItem,
  CustomerListQuery,
  CustomerPasswordPayload,
  CustomerPayPasswordPayload,
  CustomerTrashQuery,
  CustomerUpdatePayload,
} from '#/api/modules/admin/customers';

import type {
  CustomerDialogMode,
  CustomerFormState,
  CustomerPasswordFormState,
  CustomerPayPasswordFormState,
} from './types';

import { resolvePageParams } from '../shared';
import { CUSTOMER_STATUS } from './constants';

function trimValue(value: unknown) {
  return String(value ?? '').trim();
}

function normalizeStatus(value: unknown) {
  const status = Number(value);
  return status === CUSTOMER_STATUS.ENABLED ||
    status === CUSTOMER_STATUS.DISABLED
    ? status
    : undefined;
}

export function buildCustomerListQuery(
  params: GridPageParams,
  formValues: Record<string, any>,
): CustomerListQuery {
  const { page, page_size } = resolvePageParams(params);
  const keyword = trimValue(formValues.keyword);
  const status = normalizeStatus(formValues.status);
  return {
    ...(keyword ? { keyword } : {}),
    page,
    page_size,
    ...(status === undefined ? {} : { status }),
  };
}

export function buildCustomerTrashQuery(
  params: GridPageParams,
  formValues: Record<string, any>,
): CustomerTrashQuery {
  const { page, page_size } = resolvePageParams(params);
  const keyword = trimValue(formValues.keyword);
  return {
    ...(keyword ? { keyword } : {}),
    page,
    page_size,
  };
}

/**
 * 新增客户需要初始化登录密码和支付密码；编辑客户只允许修改基础资料。
 */
export function buildCustomerPayload(
  form: CustomerFormState,
  mode: CustomerDialogMode,
): CustomerCreatePayload | CustomerUpdatePayload {
  const basePayload = {
    company_name: trimValue(form.company_name),
    phone: trimValue(form.phone),
    status: Number(form.status),
  };
  if (mode === 'edit') {
    return basePayload;
  }
  return {
    ...basePayload,
    confirm_password: trimValue(form.confirm_password),
    confirm_pay_password: trimValue(form.confirm_pay_password),
    password: trimValue(form.password),
    pay_password: trimValue(form.pay_password),
  };
}

export function toCustomerFormValues(
  row?: CustomerListItem,
): CustomerFormState {
  return {
    company_name: row?.company_name ?? '',
    confirm_password: '',
    confirm_pay_password: '',
    password: '',
    pay_password: '',
    phone: row?.phone ?? '',
    status: row?.status ?? CUSTOMER_STATUS.ENABLED,
  };
}

export function buildPasswordPayload(
  form: CustomerPasswordFormState,
): CustomerPasswordPayload {
  return {
    confirm_password: trimValue(form.confirm_password),
    password: trimValue(form.password),
  };
}

export function buildPayPasswordPayload(
  form: CustomerPayPasswordFormState,
): CustomerPayPasswordPayload {
  return {
    confirm_pay_password: trimValue(form.confirm_pay_password),
    pay_password: trimValue(form.pay_password),
  };
}
```

- [ ] **Step 8: Create admin customer schemas**

Create `apps/web-ele/src/views/myjob/customers/schemas.ts`:

```ts
import { formatDateTime } from '../shared';
import { CUSTOMER_STATUS_TEXT } from './constants';

export const CUSTOMER_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' },
];

export function resolveCustomerStatusText(status: number) {
  return CUSTOMER_STATUS_TEXT[status] ?? '未知';
}

export function buildCustomerFilterSchema() {
  return [
    {
      component: 'Input',
      componentProps: { placeholder: '请输入公司/店铺名称或手机号' },
      fieldName: 'keyword',
      label: '关键字',
    },
    {
      component: 'Select',
      componentProps: {
        options: CUSTOMER_STATUS_OPTIONS,
        placeholder: '请选择状态',
      },
      fieldName: 'status',
      label: '状态',
    },
  ];
}

export function buildCustomerTrashFilterSchema() {
  return [
    {
      component: 'Input',
      componentProps: { placeholder: '请输入公司/店铺名称或手机号' },
      fieldName: 'keyword',
      label: '关键字',
    },
  ];
}

function buildBaseColumns() {
  return [
    { field: 'id', minWidth: 90, title: 'ID' },
    { field: 'company_name', minWidth: 220, title: '公司/店铺名称' },
    { field: 'phone', minWidth: 150, title: '手机号' },
    {
      field: 'status',
      minWidth: 110,
      slots: { default: 'status' },
      title: '状态',
    },
    { field: 'last_login_ip', minWidth: 150, title: '最后登录 IP' },
    {
      field: 'last_login_at',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatDateTime(cellValue),
      minWidth: 180,
      title: '最后登录时间',
    },
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
      minWidth: 260,
      slots: { default: 'actions' },
      title: '操作',
    },
  ];
}

export function buildCustomerColumns() {
  return buildBaseColumns();
}

export function buildCustomerTrashColumns() {
  return buildBaseColumns();
}
```

- [ ] **Step 9: Run admin pure tests and verify pass**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/customers/validators.test.ts apps/web-ele/src/views/myjob/customers/mappers.test.ts apps/web-ele/src/views/myjob/customers/schemas.test.ts
```

Expected: PASS.

- [ ] **Step 10: Commit admin customer pure helpers**

Run:

```bash
git add apps/web-ele/src/views/myjob/customers/constants.ts apps/web-ele/src/views/myjob/customers/types.ts apps/web-ele/src/views/myjob/customers/validators.ts apps/web-ele/src/views/myjob/customers/validators.test.ts apps/web-ele/src/views/myjob/customers/mappers.ts apps/web-ele/src/views/myjob/customers/mappers.test.ts apps/web-ele/src/views/myjob/customers/schemas.ts apps/web-ele/src/views/myjob/customers/schemas.test.ts
git commit -m "feat: add customer management helpers"
```

Expected: commit succeeds.

---

### Task 6: Admin Customer Dialogs

**Files:**

- Create: `apps/web-ele/src/views/myjob/customers/components/CustomerDialog.vue`
- Create: `apps/web-ele/src/views/myjob/customers/components/CustomerDetailDialog.vue`
- Create: `apps/web-ele/src/views/myjob/customers/components/ResetPasswordDialog.vue`
- Create: `apps/web-ele/src/views/myjob/customers/components/ResetPayPasswordDialog.vue`
- Create: `apps/web-ele/src/views/myjob/customers/components/CustomerDialog.test.ts`
- Create: `apps/web-ele/src/views/myjob/customers/components/ResetPasswordDialog.test.ts`
- Create: `apps/web-ele/src/views/myjob/customers/components/ResetPayPasswordDialog.test.ts`

- [ ] **Step 1: Write CustomerDialog failing test**

Create `apps/web-ele/src/views/myjob/customers/components/CustomerDialog.test.ts` using the same stub style as `RechargeRiskRuleDialog.test.ts`. Include these assertions:

```ts
expect(apiMocks.addCustomerApi).toHaveBeenCalledWith({
  company_name: '新增客户',
  confirm_password: 'Abc_123',
  confirm_pay_password: '123456',
  password: 'Abc_123',
  pay_password: '123456',
  phone: '13800000000',
  status: 1,
});
expect(apiMocks.updateCustomerApi).toHaveBeenCalledWith(7, {
  company_name: '编辑客户',
  phone: '13800000001',
  status: 0,
});
```

The test must stub `ElDialog`, `ElForm`, `ElFormItem`, `ElInput`, `ElOption`, `ElSelect`, and `ElButton`, then mount `CustomerDialog` twice: once with `mode="create"` and once with `mode="edit"` plus a row.

- [ ] **Step 2: Write reset dialog failing tests**

Create `apps/web-ele/src/views/myjob/customers/components/ResetPasswordDialog.test.ts` with this core assertion:

```ts
expect(apiMocks.resetCustomerPasswordApi).toHaveBeenCalledWith(7, {
  confirm_password: 'New_123',
  password: 'New_123',
});
```

Create `apps/web-ele/src/views/myjob/customers/components/ResetPayPasswordDialog.test.ts` with this core assertion:

```ts
expect(apiMocks.resetCustomerPayPasswordApi).toHaveBeenCalledWith(7, {
  confirm_pay_password: '654321',
  pay_password: '654321',
});
```

Both tests must assert `saved` is emitted and the dialog closes after a successful submit.

- [ ] **Step 3: Run dialog tests and verify failure**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/customers/components
```

Expected: FAIL because dialog components do not exist.

- [ ] **Step 4: Create CustomerDialog**

Create `apps/web-ele/src/views/myjob/customers/components/CustomerDialog.vue` with this behavior:

```vue
<script lang="ts" setup>
import type { FormInstance } from 'element-plus';
import type { CustomerListItem } from '#/api/modules/admin/customers';
import type { CustomerDialogMode } from '../types';

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
  addCustomerApi,
  updateCustomerApi,
} from '#/api/modules/admin/customers';

import { buildCustomerPayload, toCustomerFormValues } from '../mappers';
import { buildCustomerFormRules } from '../validators';

const props = defineProps<{
  customer: CustomerListItem | null;
  mode: CustomerDialogMode;
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const form = reactive(toCustomerFormValues());
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});
const dialogTitle = computed(() =>
  props.mode === 'create' ? '新增客户' : '编辑客户',
);
const formRules = computed(() => buildCustomerFormRules(props.mode));

function resetForm() {
  Object.assign(form, toCustomerFormValues(props.customer ?? undefined));
}

async function submitDialog() {
  if (loading.value || !formRef.value) {
    return;
  }
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }
  try {
    loading.value = true;
    const payload = buildCustomerPayload(form, props.mode);
    if (props.mode === 'create') {
      await addCustomerApi(payload as any);
      ElMessage.success('客户已新增');
    } else if (props.customer) {
      await updateCustomerApi(props.customer.id, payload as any);
      ElMessage.success('客户已更新');
    }
    emit('saved');
    emit('update:visible', false);
  } finally {
    loading.value = false;
  }
}

watch(
  () => [props.visible, props.customer?.id, props.mode] as const,
  ([visible]) => {
    if (visible) {
      resetForm();
    }
  },
  { immediate: true },
);
</script>

<template>
  <ElDialog v-model="dialogVisible" :title="dialogTitle" width="640px">
    <ElForm ref="formRef" :model="form" :rules="formRules" label-width="120px">
      <ElFormItem label="公司/店铺名称" prop="company_name">
        <ElInput v-model="form.company_name" data-test="customer-company" />
      </ElFormItem>
      <ElFormItem label="手机号" prop="phone">
        <ElInput v-model="form.phone" data-test="customer-phone" />
      </ElFormItem>
      <template v-if="mode === 'create'">
        <ElFormItem label="登录密码" prop="password">
          <ElInput
            v-model="form.password"
            data-test="customer-password"
            type="password"
          />
        </ElFormItem>
        <ElFormItem label="确认登录密码" prop="confirm_password">
          <ElInput
            v-model="form.confirm_password"
            data-test="customer-confirm-password"
            type="password"
          />
        </ElFormItem>
        <ElFormItem label="支付密码" prop="pay_password">
          <ElInput
            v-model="form.pay_password"
            data-test="customer-pay-password"
            type="password"
          />
        </ElFormItem>
        <ElFormItem label="确认支付密码" prop="confirm_pay_password">
          <ElInput
            v-model="form.confirm_pay_password"
            data-test="customer-confirm-pay-password"
            type="password"
          />
        </ElFormItem>
      </template>
      <ElFormItem label="状态" prop="status">
        <ElSelect
          v-model="form.status"
          class="w-full"
          data-test="customer-status"
        >
          <ElOption label="启用" :value="1" />
          <ElOption label="禁用" :value="0" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton :loading="loading" type="primary" @click="submitDialog">
        保存
      </ElButton>
    </template>
  </ElDialog>
</template>
```

- [ ] **Step 5: Create reset dialogs**

Create `ResetPasswordDialog.vue` and `ResetPayPasswordDialog.vue` using the same structure as `CustomerDialog`: props `{ customer: CustomerListItem | null; visible: boolean }`, emits `saved` and `update:visible`, Element Plus form, submit button.

For `ResetPasswordDialog.vue`, call:

```ts
await resetCustomerPasswordApi(props.customer.id, buildPasswordPayload(form));
ElMessage.success('客户登录密码已重置，旧登录态已失效');
```

For `ResetPayPasswordDialog.vue`, call:

```ts
await resetCustomerPayPasswordApi(
  props.customer.id,
  buildPayPasswordPayload(form),
);
ElMessage.success('客户支付密码已重置');
```

Create `CustomerDetailDialog.vue` as a read-only dialog that receives `detail: CustomerDetail | null` and renders `ElDescriptions` fields: ID、公司/店铺名称、手机号、状态、最后登录 IP、最后登录时间、创建时间、更新时间.

- [ ] **Step 6: Run dialog tests and verify pass**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/customers/components
```

Expected: PASS.

- [ ] **Step 7: Commit admin customer dialogs**

Run:

```bash
git add apps/web-ele/src/views/myjob/customers/components
git commit -m "feat: add customer management dialogs"
```

Expected: commit succeeds.

---

### Task 7: Admin Customer Pages And Routes

**Files:**

- Create: `apps/web-ele/src/router/routes/modules/customers.ts`
- Create: `apps/web-ele/src/router/routes/modules/customers.test.ts`
- Create: `apps/web-ele/src/views/myjob/customers/composables/useCustomerPage.ts`
- Create: `apps/web-ele/src/views/myjob/customers/composables/useCustomerTrashPage.ts`
- Create: `apps/web-ele/src/views/myjob/customers/index.vue`
- Create: `apps/web-ele/src/views/myjob/customers/trash.vue`
- Create: `apps/web-ele/src/views/myjob/customers/index.test.ts`
- Create: `apps/web-ele/src/views/myjob/customers/trash.test.ts`

- [ ] **Step 1: Write failing customers route test**

Create `apps/web-ele/src/router/routes/modules/customers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import routes from './customers';

describe('customers routes', () => {
  it('defines customer management routes with customer.manage authority', () => {
    expect(routes).toEqual([
      {
        meta: {
          authority: ['customer.manage'],
          icon: 'lucide:contact',
          order: 40,
          title: '客户管理',
        },
        name: 'Customers',
        path: '/customers',
        children: [
          {
            component: expect.any(Function),
            meta: {
              authority: ['customer.manage'],
              title: '客户列表',
            },
            name: 'CustomerList',
            path: '/customers/list',
          },
          {
            component: expect.any(Function),
            meta: {
              authority: ['customer.manage'],
              title: '客户回收站',
            },
            name: 'CustomerTrash',
            path: '/customers/trash',
          },
        ],
      },
    ]);
  });
});
```

- [ ] **Step 2: Write failing list and trash page tests**

Create `apps/web-ele/src/views/myjob/customers/index.test.ts` following `price-changes/index.test.ts` style. The test must mock `useVbenVxeGrid`, `Page`, Element Plus button/switch, and customer APIs. Assert:

```ts
expect(
  gridConfigState.latest.formOptions.schema.map((item: any) => item.fieldName),
).toEqual(['keyword', 'status']);
expect(
  gridConfigState.latest.gridOptions.columns.map((item: any) => item.field),
).toEqual([
  'id',
  'company_name',
  'phone',
  'status',
  'last_login_ip',
  'last_login_at',
  'created_at',
  'updated_at',
  'actions',
]);
```

Also call the grid query and assert:

```ts
expect(apiMocks.getCustomerListApi).toHaveBeenCalledWith({
  keyword: '测试',
  page: 2,
  page_size: 30,
  status: 1,
});
```

Create `apps/web-ele/src/views/myjob/customers/trash.test.ts` with the same style. Assert the query calls:

```ts
expect(apiMocks.getCustomerTrashApi).toHaveBeenCalledWith({
  keyword: '回收',
  page: 1,
  page_size: 20,
});
```

Assert rendered text does not include `编辑`, `禁用`, `重置登录密码`, or `重置支付密码` in the trash page action slot.

- [ ] **Step 3: Run route and page tests and verify failure**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/router/routes/modules/customers.test.ts apps/web-ele/src/views/myjob/customers/index.test.ts apps/web-ele/src/views/myjob/customers/trash.test.ts
```

Expected: FAIL because routes, composables, and pages do not exist.

- [ ] **Step 4: Create customers route module**

Create `apps/web-ele/src/router/routes/modules/customers.ts`:

```ts
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      authority: ['customer.manage'],
      icon: 'lucide:contact',
      order: 40,
      title: '客户管理',
    },
    name: 'Customers',
    path: '/customers',
    children: [
      {
        component: () => import('#/views/myjob/customers/index.vue'),
        meta: {
          authority: ['customer.manage'],
          title: '客户列表',
        },
        name: 'CustomerList',
        path: '/customers/list',
      },
      {
        component: () => import('#/views/myjob/customers/trash.vue'),
        meta: {
          authority: ['customer.manage'],
          title: '客户回收站',
        },
        name: 'CustomerTrash',
        path: '/customers/trash',
      },
    ],
  },
];

export default routes;
```

- [ ] **Step 5: Create customer list composable**

Create `apps/web-ele/src/views/myjob/customers/composables/useCustomerPage.ts`:

```ts
import type { GridPageParams } from '../../shared';
import type {
  CustomerDetail,
  CustomerListItem,
} from '#/api/modules/admin/customers';

import { computed, reactive, ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import { ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteCustomerApi,
  getCustomerDetailApi,
  getCustomerListApi,
  updateCustomerStatusApi,
} from '#/api/modules/admin/customers';

import { MYJOB_GRID_CLASS, toGridResult } from '../../shared';
import { CUSTOMER_MANAGE_AUTH_CODE } from '../constants';
import { buildCustomerListQuery } from '../mappers';
import { buildCustomerColumns, buildCustomerFilterSchema } from '../schemas';

export function useCustomerPage() {
  const accessStore = useAccessStore();
  const canManage = computed(() =>
    accessStore.accessCodes.includes(CUSTOMER_MANAGE_AUTH_CODE),
  );
  const dialogVisible = ref(false);
  const dialogMode = ref<'create' | 'edit'>('create');
  const editingCustomer = ref<CustomerListItem | null>(null);
  const detailVisible = ref(false);
  const detail = ref<CustomerDetail | null>(null);
  const resetPasswordVisible = ref(false);
  const resetPayPasswordVisible = ref(false);
  const selectedCustomer = ref<CustomerListItem | null>(null);
  const loadingStatusIds = reactive<Record<number, boolean>>({});

  function openCreateDialog() {
    dialogMode.value = 'create';
    editingCustomer.value = null;
    dialogVisible.value = true;
  }

  function openEditDialog(row: CustomerListItem) {
    dialogMode.value = 'edit';
    editingCustomer.value = row;
    dialogVisible.value = true;
  }

  async function openDetailDialog(row: CustomerListItem) {
    detail.value = await getCustomerDetailApi(row.id);
    detailVisible.value = true;
  }

  function openResetPasswordDialog(row: CustomerListItem) {
    selectedCustomer.value = row;
    resetPasswordVisible.value = true;
  }

  function openResetPayPasswordDialog(row: CustomerListItem) {
    selectedCustomer.value = row;
    resetPayPasswordVisible.value = true;
  }

  async function handleStatusChange(row: CustomerListItem, status: number) {
    if (loadingStatusIds[row.id]) {
      return;
    }
    await ElMessageBox.confirm(
      status === 1
        ? `确认启用客户 ${row.company_name} 吗？`
        : `确认禁用客户 ${row.company_name} 吗？禁用后客户旧登录态会失效。`,
      '状态确认',
      { type: 'warning' },
    );
    loadingStatusIds[row.id] = true;
    try {
      await updateCustomerStatusApi(row.id, status);
      ElMessage.success(
        status === 1 ? '客户已启用' : '客户已禁用，旧登录态已失效',
      );
    } finally {
      try {
        await gridApi.reload();
      } finally {
        loadingStatusIds[row.id] = false;
      }
    }
  }

  async function handleDelete(row: CustomerListItem) {
    await ElMessageBox.confirm(
      `确认删除客户 ${row.company_name} 吗？删除后手机号仍会被占用。`,
      '删除确认',
      { type: 'warning' },
    );
    await deleteCustomerApi(row.id);
    ElMessage.success('客户已移入回收站');
    await gridApi.reload();
  }

  async function handleDialogSaved() {
    await gridApi.reload();
  }

  const [CustomerGrid, gridApi] = useVbenVxeGrid<CustomerListItem>({
    formOptions: { schema: buildCustomerFilterSchema() },
    gridClass: MYJOB_GRID_CLASS,
    gridOptions: {
      columns: buildCustomerColumns(),
      pagerConfig: {},
      proxyConfig: {
        ajax: {
          query: async (
            params: GridPageParams,
            formValues: Record<string, any>,
          ) => {
            const result = await getCustomerListApi(
              buildCustomerListQuery(params, formValues),
            );
            return toGridResult(
              result.list ?? [],
              result.pagination?.total ?? 0,
            );
          },
        },
      },
      toolbarConfig: { refresh: true, search: true, zoom: true },
    },
  });

  return {
    canManage,
    CustomerGrid,
    detail,
    detailVisible,
    dialogMode,
    dialogVisible,
    editingCustomer,
    handleDelete,
    handleDialogSaved,
    handleStatusChange,
    loadingStatusIds,
    openCreateDialog,
    openDetailDialog,
    openEditDialog,
    openResetPasswordDialog,
    openResetPayPasswordDialog,
    resetPasswordVisible,
    resetPayPasswordVisible,
    selectedCustomer,
  };
}
```

- [ ] **Step 6: Create customer trash composable**

Create `apps/web-ele/src/views/myjob/customers/composables/useCustomerTrashPage.ts`:

```ts
import type { GridPageParams } from '../../shared';
import type { CustomerListItem } from '#/api/modules/admin/customers';

import { ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getCustomerTrashApi,
  restoreCustomerApi,
} from '#/api/modules/admin/customers';

import { MYJOB_GRID_CLASS, toGridResult } from '../../shared';
import { buildCustomerTrashQuery } from '../mappers';
import {
  buildCustomerTrashColumns,
  buildCustomerTrashFilterSchema,
} from '../schemas';

export function useCustomerTrashPage() {
  async function handleRestore(row: CustomerListItem) {
    await ElMessageBox.confirm(
      `确认恢复客户 ${row.company_name} 吗？恢复后客户保持禁用状态。`,
      '恢复确认',
      { type: 'warning' },
    );
    await restoreCustomerApi(row.id);
    ElMessage.success('客户已恢复');
    await gridApi.reload();
  }

  const [CustomerTrashGrid, gridApi] = useVbenVxeGrid<CustomerListItem>({
    formOptions: { schema: buildCustomerTrashFilterSchema() },
    gridClass: MYJOB_GRID_CLASS,
    gridOptions: {
      columns: buildCustomerTrashColumns(),
      pagerConfig: {},
      proxyConfig: {
        ajax: {
          query: async (
            params: GridPageParams,
            formValues: Record<string, any>,
          ) => {
            const result = await getCustomerTrashApi(
              buildCustomerTrashQuery(params, formValues),
            );
            return toGridResult(
              result.list ?? [],
              result.pagination?.total ?? 0,
            );
          },
        },
      },
      toolbarConfig: { refresh: true, search: true, zoom: true },
    },
  });

  return {
    CustomerTrashGrid,
    handleRestore,
  };
}
```

- [ ] **Step 7: Create customer list page**

Create `apps/web-ele/src/views/myjob/customers/index.vue`:

```vue
<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { ElButton, ElSwitch, ElTag } from 'element-plus';

import { MYJOB_PAGE_CONTENT_CLASS } from '../shared';
import CustomerDetailDialog from './components/CustomerDetailDialog.vue';
import CustomerDialog from './components/CustomerDialog.vue';
import ResetPasswordDialog from './components/ResetPasswordDialog.vue';
import ResetPayPasswordDialog from './components/ResetPayPasswordDialog.vue';
import { useCustomerPage } from './composables/useCustomerPage';
import { resolveCustomerStatusText } from './schemas';

const {
  canManage,
  CustomerGrid,
  detail,
  detailVisible,
  dialogMode,
  dialogVisible,
  editingCustomer,
  handleDelete,
  handleDialogSaved,
  handleStatusChange,
  loadingStatusIds,
  openCreateDialog,
  openDetailDialog,
  openEditDialog,
  openResetPasswordDialog,
  openResetPayPasswordDialog,
  resetPasswordVisible,
  resetPayPasswordVisible,
  selectedCustomer,
} = useCustomerPage();
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <CustomerGrid>
      <template #toolbar-actions>
        <ElButton v-if="canManage" type="primary" @click="openCreateDialog">
          新增
        </ElButton>
      </template>
      <template #status="{ row }">
        <ElTag :type="row.status === 1 ? 'success' : 'info'">
          {{ resolveCustomerStatusText(row.status) }}
        </ElTag>
      </template>
      <template #actions="{ row }">
        <div class="flex flex-wrap items-center gap-2">
          <ElButton link type="primary" @click="openDetailDialog(row)">
            详情
          </ElButton>
          <template v-if="canManage">
            <ElButton link type="primary" @click="openEditDialog(row)">
              编辑
            </ElButton>
            <ElSwitch
              :active-value="1"
              :inactive-value="0"
              :loading="loadingStatusIds[row.id]"
              :model-value="row.status"
              active-text="启用"
              inactive-text="禁用"
              inline-prompt
              @change="(value) => handleStatusChange(row, Number(value))"
            />
            <ElButton link type="primary" @click="openResetPasswordDialog(row)">
              重置登录密码
            </ElButton>
            <ElButton
              link
              type="primary"
              @click="openResetPayPasswordDialog(row)"
            >
              重置支付密码
            </ElButton>
            <ElButton link type="danger" @click="handleDelete(row)">
              删除
            </ElButton>
          </template>
        </div>
      </template>
    </CustomerGrid>

    <CustomerDialog
      v-model:visible="dialogVisible"
      :customer="editingCustomer"
      :mode="dialogMode"
      @saved="handleDialogSaved"
    />
    <CustomerDetailDialog v-model:visible="detailVisible" :detail="detail" />
    <ResetPasswordDialog
      v-model:visible="resetPasswordVisible"
      :customer="selectedCustomer"
      @saved="handleDialogSaved"
    />
    <ResetPayPasswordDialog
      v-model:visible="resetPayPasswordVisible"
      :customer="selectedCustomer"
      @saved="handleDialogSaved"
    />
  </Page>
</template>
```

- [ ] **Step 8: Create customer trash page**

Create `apps/web-ele/src/views/myjob/customers/trash.vue`:

```vue
<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { ElButton, ElTag } from 'element-plus';

import { MYJOB_PAGE_CONTENT_CLASS } from '../shared';
import { useCustomerTrashPage } from './composables/useCustomerTrashPage';
import { resolveCustomerStatusText } from './schemas';

const { CustomerTrashGrid, handleRestore } = useCustomerTrashPage();
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <CustomerTrashGrid>
      <template #status="{ row }">
        <ElTag :type="row.status === 1 ? 'success' : 'info'">
          {{ resolveCustomerStatusText(row.status) }}
        </ElTag>
      </template>
      <template #actions="{ row }">
        <ElButton link type="primary" @click="handleRestore(row)">
          恢复
        </ElButton>
      </template>
    </CustomerTrashGrid>
  </Page>
</template>
```

- [ ] **Step 9: Run customer admin route and page tests**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/router/routes/modules/customers.test.ts apps/web-ele/src/views/myjob/customers/index.test.ts apps/web-ele/src/views/myjob/customers/trash.test.ts
```

Expected: PASS.

- [ ] **Step 10: Commit customer admin pages**

Run:

```bash
git add apps/web-ele/src/router/routes/modules/customers.ts apps/web-ele/src/router/routes/modules/customers.test.ts apps/web-ele/src/views/myjob/customers/composables apps/web-ele/src/views/myjob/customers/index.vue apps/web-ele/src/views/myjob/customers/trash.vue apps/web-ele/src/views/myjob/customers/index.test.ts apps/web-ele/src/views/myjob/customers/trash.test.ts
git commit -m "feat: add customer management pages"
```

Expected: commit succeeds.

---

### Task 8: Final Verification And Cleanup

**Files:**

- Review: all files changed in Tasks 1-7.

- [ ] **Step 1: Run targeted API test**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/api/myjob-api-contract.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run targeted customer tests**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/customer apps/web-ele/src/store/customer-auth.test.ts apps/web-ele/src/router/routes/core.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run targeted admin customer tests**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/customers apps/web-ele/src/router/routes/modules/customers.test.ts
```

Expected: PASS.

- [ ] **Step 4: Run existing route module tests**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/router/routes/modules
```

Expected: PASS.

- [ ] **Step 5: Run typecheck**

Run:

```bash
pnpm run check:type
```

Expected: PASS.

- [ ] **Step 6: Inspect final diff**

Run:

```bash
git status --short
git diff --stat HEAD
```

Expected: only customer management V1 frontend files are changed. No changes under `packages/`, `internal/`, `scripts/`, or the backend project.

- [ ] **Step 7: Commit verification fixes if any**

If Step 1-5 required small fixes, stage only those files and commit:

```bash
git add apps/web-ele/src
git commit -m "fix: complete customer management frontend verification"
```

Expected: commit succeeds when fixes exist. If no fixes exist, do not create an empty commit.

## Self-Review Notes

- Spec coverage: Task 1 covers API domains; Tasks 2-4 cover customer auth, token isolation, routes, and minimal home; Tasks 5-7 cover admin list, trash, dialogs, schemas, mappers, validators, routes, and permissions; Task 8 covers requested verification commands.
- Red flag scan: no placeholder markers or unspecified validation steps remain in this plan.
- Type consistency: API type names from Task 1 are used by mappers, store, composables, dialogs, and tests in later tasks.
