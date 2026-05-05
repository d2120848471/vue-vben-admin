# 自动改价记录前端页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `apps/web-ele` 的「商品管理」下新增只读的「自动改价记录」页面，支持分页、筛选和精简审计列表展示。

**Architecture:** 新增精确 API 域 `#/api/modules/admin/products/price-changes`，新增页面域 `views/myjob/products/price-changes`。页面 `index.vue` 只装配 `Page`、`Grid` 和少量展示插槽；查询参数映射放 `mappers.ts`，筛选 schema 与表格列放 `schemas.ts`，请求编排放 `composables/usePriceChangePage.ts`。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、Element Plus、Vben `Page`、`useVbenVxeGrid`、Vitest、pnpm workspace。

---

## File Structure

Create:

- `apps/web-ele/src/api/modules/admin/products/price-changes/api.ts`：自动改价记录列表接口函数。
- `apps/web-ele/src/api/modules/admin/products/price-changes/types.ts`：查询参数和列表项类型。
- `apps/web-ele/src/api/modules/admin/products/price-changes/index.ts`：精确导出。
- `apps/web-ele/src/views/myjob/products/price-changes/types.ts`：当前页面私有类型。
- `apps/web-ele/src/views/myjob/products/price-changes/mappers.ts`：Grid 分页与筛选表单到接口查询参数的映射。
- `apps/web-ele/src/views/myjob/products/price-changes/mappers.test.ts`：查询参数映射测试。
- `apps/web-ele/src/views/myjob/products/price-changes/schemas.ts`：搜索 schema、表格列、来源文案和价格变动 formatter。
- `apps/web-ele/src/views/myjob/products/price-changes/schemas.test.ts`：schema 和 formatter 测试。
- `apps/web-ele/src/views/myjob/products/price-changes/composables/usePriceChangePage.ts`：表格配置和请求编排。
- `apps/web-ele/src/views/myjob/products/price-changes/index.vue`：页面入口。
- `apps/web-ele/src/views/myjob/products/price-changes/index.test.ts`：页面挂载、Grid 配置和查询调用测试。

Modify:

- `apps/web-ele/src/api/myjob-api-contract.test.ts`：补充自动改价记录 API 合约测试。
- `apps/web-ele/src/router/routes/modules/products.ts`：商品管理下新增自动改价记录路由，并在父级 authority 加 `product.price_change`。
- `apps/web-ele/src/router/routes/modules/products.test.ts`：同步路由结构断言。
- `docs/superpowers/specs/2026-05-06-product-price-changes-design.md`：修正接口代码块格式，保持 spec 可读。

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
- Create: `apps/web-ele/src/api/modules/admin/products/price-changes/api.ts`
- Create: `apps/web-ele/src/api/modules/admin/products/price-changes/types.ts`
- Create: `apps/web-ele/src/api/modules/admin/products/price-changes/index.ts`

- [ ] **Step 1: Write the failing API contract test**

Add this import block near the other product API imports in `apps/web-ele/src/api/myjob-api-contract.test.ts`:

```ts
import { getProductGoodsChannelPriceChangeListApi } from '#/api/modules/admin/products/price-changes';
```

Add this test after the product goods channel binding endpoint test:

```ts
it('uses the product goods channel price change endpoint', async () => {
  expect(typeof getProductGoodsChannelPriceChangeListApi).toBe('function');

  requestClientMock.get.mockResolvedValueOnce({
    list: [
      {
        binding_id: 31,
        change_amount: '2.0000',
        changed_at: '2026-05-06 10:00:00',
        description: '变动前 10.0000，变动后 12.0000',
        goods_code: 'PRICE-CHANGE-001',
        goods_icon: '',
        goods_id: 21,
        goods_name: '自动改价测试商品',
        id: 1,
        new_cost_price: '12.0000',
        new_effective_sell_price: '22.0000',
        new_source_cost_price: '12.0000',
        old_cost_price: '10.0000',
        old_effective_sell_price: '20.0000',
        old_source_cost_price: '10.0000',
        platform_account_id: 101,
        platform_account_name: '卡卡云测试账号',
        provider_code: 'kakayun',
        raw_payload: '{}',
        source: 'push',
        supplier_goods_name: '上游测试商品',
        supplier_goods_no: '2582531',
      },
    ],
    pagination: { page: 1, page_size: 20, total: 1 },
  });

  await getProductGoodsChannelPriceChangeListApi({
    end_at: '2026-05-06 23:59:59',
    keyword: 'PRICE-CHANGE-001',
    page: 1,
    page_size: 20,
    platform_id: 101,
    source: 'push',
    start_at: '2026-05-06 00:00:00',
    supplier_goods_no: '2582531',
  });

  expect(requestClientMock.get).toHaveBeenCalledWith(
    '/admin/product-goods-channel-price-changes',
    {
      params: {
        end_at: '2026-05-06 23:59:59',
        keyword: 'PRICE-CHANGE-001',
        page: 1,
        page_size: 20,
        platform_id: 101,
        source: 'push',
        start_at: '2026-05-06 00:00:00',
        supplier_goods_no: '2582531',
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

Expected: FAIL with an import resolution error for `#/api/modules/admin/products/price-changes`.

- [ ] **Step 3: Create API types**

Create `apps/web-ele/src/api/modules/admin/products/price-changes/types.ts`:

```ts
import type { ListQuery } from '../../common';

export interface ProductGoodsChannelPriceChangeListQuery extends ListQuery {
  end_at?: string;
  keyword?: string;
  platform_id?: number;
  source?: string;
  start_at?: string;
  supplier_goods_no?: string;
}

export interface ProductGoodsChannelPriceChangeItem {
  binding_id: number;
  change_amount: string;
  changed_at: string;
  description: string;
  goods_code: string;
  goods_icon: string;
  goods_id: number;
  goods_name: string;
  id: number;
  new_cost_price: string;
  new_effective_sell_price: string;
  new_source_cost_price: string;
  old_cost_price: string;
  old_effective_sell_price: string;
  old_source_cost_price: string;
  platform_account_id: number;
  platform_account_name: string;
  provider_code: string;
  raw_payload: string;
  source: string;
  supplier_goods_name: string;
  supplier_goods_no: string;
}
```

- [ ] **Step 4: Create API function**

Create `apps/web-ele/src/api/modules/admin/products/price-changes/api.ts`:

```ts
import type { PagedResult } from '../../common';
import type {
  ProductGoodsChannelPriceChangeItem,
  ProductGoodsChannelPriceChangeListQuery,
} from './types';

import { requestClient } from '#/api/request';

/**
 * 商品管理-自动改价记录：分页查询监控或供应商推送触发的渠道改价记录。
 */
export async function getProductGoodsChannelPriceChangeListApi(
  params: ProductGoodsChannelPriceChangeListQuery,
) {
  return requestClient.get<PagedResult<ProductGoodsChannelPriceChangeItem>>(
    '/admin/product-goods-channel-price-changes',
    { params },
  );
}
```

- [ ] **Step 5: Create API barrel**

Create `apps/web-ele/src/api/modules/admin/products/price-changes/index.ts`:

```ts
export * from './api';
export * from './types';
```

- [ ] **Step 6: Run API contract test to verify it passes**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/api/myjob-api-contract.test.ts
```

Expected: PASS for `myjob api contract`.

- [ ] **Step 7: Commit API domain**

Run:

```bash
git add apps/web-ele/src/api/myjob-api-contract.test.ts apps/web-ele/src/api/modules/admin/products/price-changes
git commit -m "feat: add product price change api"
```

Expected: commit succeeds.

---

### Task 2: Mappers And Schemas

**Files:**

- Create: `apps/web-ele/src/views/myjob/products/price-changes/types.ts`
- Create: `apps/web-ele/src/views/myjob/products/price-changes/mappers.ts`
- Create: `apps/web-ele/src/views/myjob/products/price-changes/mappers.test.ts`
- Create: `apps/web-ele/src/views/myjob/products/price-changes/schemas.ts`
- Create: `apps/web-ele/src/views/myjob/products/price-changes/schemas.test.ts`

- [ ] **Step 1: Write failing mapper tests**

Create `apps/web-ele/src/views/myjob/products/price-changes/mappers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { buildPriceChangeListQuery } from './mappers';

describe('price change mappers', () => {
  it('builds trimmed list query params', () => {
    expect(
      buildPriceChangeListQuery(
        { page: { currentPage: 2, pageSize: 50 } },
        {
          date_range: ['2026-05-06 00:00:00', '2026-05-06 23:59:59'],
          keyword: ' PRICE-CHANGE-001 ',
          platform_id: '101',
          source: 'push',
          supplier_goods_no: ' 2582531 ',
        },
      ),
    ).toEqual({
      end_at: '2026-05-06 23:59:59',
      keyword: 'PRICE-CHANGE-001',
      page: 2,
      page_size: 50,
      platform_id: 101,
      source: 'push',
      start_at: '2026-05-06 00:00:00',
      supplier_goods_no: '2582531',
    });
  });

  it('omits empty filters and invalid platform id', () => {
    expect(
      buildPriceChangeListQuery(
        { page: { currentPage: 1, pageSize: 20 } },
        {
          date_range: ['2026-05-06 00:00:00'],
          keyword: ' ',
          platform_id: 'abc',
          source: '',
          supplier_goods_no: '',
        },
      ),
    ).toEqual({
      page: 1,
      page_size: 20,
    });
  });

  it('omits non-positive platform id', () => {
    expect(
      buildPriceChangeListQuery(
        { page: { currentPage: 1, pageSize: 20 } },
        {
          platform_id: 0,
        },
      ),
    ).toEqual({
      page: 1,
      page_size: 20,
    });
  });
});
```

- [ ] **Step 2: Run mapper tests to verify they fail**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/price-changes/mappers.test.ts
```

Expected: FAIL with an import resolution error for `./mappers`.

- [ ] **Step 3: Create page private types**

Create `apps/web-ele/src/views/myjob/products/price-changes/types.ts`:

```ts
export type PriceChangeSource = '' | 'monitor' | 'push';
```

- [ ] **Step 4: Create mapper implementation**

Create `apps/web-ele/src/views/myjob/products/price-changes/mappers.ts`:

```ts
import type { GridPageParams } from '../../shared';

import type { ProductGoodsChannelPriceChangeListQuery } from '#/api/modules/admin/products/price-changes';

import { extractDateRange, resolvePageParams } from '../../shared';

function trimValue(value: unknown) {
  return String(value ?? '').trim();
}

function normalizePositiveInteger(value: unknown) {
  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return undefined;
  }
  return numericValue;
}

/**
 * 自动改价记录接口只接受明确筛选值；这里统一过滤空值和无效平台账号 ID，
 * 避免页面组件把空字符串、NaN 或 0 直接传给后端。
 */
export function buildPriceChangeListQuery(
  params: GridPageParams,
  formValues: Record<string, any>,
): ProductGoodsChannelPriceChangeListQuery {
  const { page, page_size } = resolvePageParams(params);
  const keyword = trimValue(formValues.keyword);
  const source = trimValue(formValues.source);
  const supplierGoodsNo = trimValue(formValues.supplier_goods_no);
  const platformId = normalizePositiveInteger(formValues.platform_id);
  const { end_time, start_time } = extractDateRange(formValues.date_range);

  return {
    ...(end_time ? { end_at: end_time } : {}),
    ...(keyword ? { keyword } : {}),
    page,
    page_size,
    ...(platformId ? { platform_id: platformId } : {}),
    ...(source ? { source } : {}),
    ...(start_time ? { start_at: start_time } : {}),
    ...(supplierGoodsNo ? { supplier_goods_no: supplierGoodsNo } : {}),
  };
}
```

- [ ] **Step 5: Run mapper tests to verify they pass**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/price-changes/mappers.test.ts
```

Expected: PASS for `price change mappers`.

- [ ] **Step 6: Write failing schema tests**

Create `apps/web-ele/src/views/myjob/products/price-changes/schemas.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  buildPriceChangeColumns,
  buildPriceChangeFilterSchema,
  formatPriceChangeRange,
  PRICE_CHANGE_SOURCE_OPTIONS,
  resolvePriceChangeSourceText,
} from './schemas';

describe('price change schemas', () => {
  it('builds filter schema', () => {
    expect(buildPriceChangeFilterSchema()).toMatchObject([
      { fieldName: 'source', label: '来源' },
      { fieldName: 'keyword', label: '本地商品' },
      { fieldName: 'supplier_goods_no', label: '上游商品编号' },
      { fieldName: 'platform_id', label: '平台账号 ID' },
      { fieldName: 'date_range', label: '变动时间' },
    ]);
    expect(PRICE_CHANGE_SOURCE_OPTIONS).toEqual([
      { label: '全部', value: '' },
      { label: '监控', value: 'monitor' },
      { label: '推送', value: 'push' },
    ]);
  });

  it('builds audit columns', () => {
    expect(buildPriceChangeColumns().map((column) => column.field)).toEqual([
      'source',
      'platform',
      'goods',
      'supplier_goods',
      'source_cost_price_change',
      'cost_price_change',
      'effective_sell_price_change',
      'change_amount',
      'changed_at',
    ]);
  });

  it('formats source and price range text', () => {
    expect(resolvePriceChangeSourceText('monitor')).toBe('监控');
    expect(resolvePriceChangeSourceText('push')).toBe('推送');
    expect(resolvePriceChangeSourceText('manual')).toBe('manual');
    expect(resolvePriceChangeSourceText('')).toBe('--');
    expect(formatPriceChangeRange('10.0000', '12.0000')).toBe(
      '10.0000 -> 12.0000',
    );
    expect(formatPriceChangeRange('', '')).toBe('-- -> --');
  });
});
```

- [ ] **Step 7: Run schema tests to verify they fail**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/price-changes/schemas.test.ts
```

Expected: FAIL with an import resolution error for `./schemas`.

- [ ] **Step 8: Create schema implementation**

Create `apps/web-ele/src/views/myjob/products/price-changes/schemas.ts`:

```ts
import type { PriceChangeSource } from './types';

import { formatDateTime } from '../../shared';

export const PRICE_CHANGE_SOURCE_OPTIONS: Array<{
  label: string;
  value: PriceChangeSource;
}> = [
  { label: '全部', value: '' },
  { label: '监控', value: 'monitor' },
  { label: '推送', value: 'push' },
];

const PRICE_CHANGE_SOURCE_LABELS: Record<string, string> = {
  monitor: '监控',
  push: '推送',
};

export function resolvePriceChangeSourceText(source?: string) {
  if (!source) {
    return '--';
  }
  return PRICE_CHANGE_SOURCE_LABELS[source] ?? source;
}

export function formatPriceChangeRange(oldValue?: string, newValue?: string) {
  return `${oldValue || '--'} -> ${newValue || '--'}`;
}

export function buildPriceChangeFilterSchema() {
  return [
    {
      component: 'Select',
      componentProps: {
        options: PRICE_CHANGE_SOURCE_OPTIONS,
        placeholder: '请选择来源',
      },
      fieldName: 'source',
      label: '来源',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入商品编号或名称',
      },
      fieldName: 'keyword',
      label: '本地商品',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入上游商品编号',
      },
      fieldName: 'supplier_goods_no',
      label: '上游商品编号',
    },
    {
      component: 'InputNumber',
      componentProps: {
        controlsPosition: 'right',
        min: 1,
        placeholder: '请输入平台账号 ID',
        precision: 0,
      },
      fieldName: 'platform_id',
      label: '平台账号 ID',
    },
    {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'date_range',
      label: '变动时间',
    },
  ];
}

export function buildPriceChangeColumns() {
  return [
    {
      field: 'source',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        resolvePriceChangeSourceText(cellValue),
      minWidth: 100,
      title: '来源',
    },
    {
      field: 'platform',
      minWidth: 180,
      slots: { default: 'platform' },
      title: '平台账号',
    },
    {
      field: 'goods',
      minWidth: 240,
      slots: { default: 'goods' },
      title: '本地商品',
    },
    {
      field: 'supplier_goods',
      minWidth: 240,
      slots: { default: 'supplier_goods' },
      title: '上游商品',
    },
    {
      field: 'source_cost_price_change',
      formatter: ({ row }: { row: Record<string, string> }) =>
        formatPriceChangeRange(
          row.old_source_cost_price,
          row.new_source_cost_price,
        ),
      minWidth: 190,
      title: '原始进价',
    },
    {
      field: 'cost_price_change',
      formatter: ({ row }: { row: Record<string, string> }) =>
        formatPriceChangeRange(row.old_cost_price, row.new_cost_price),
      minWidth: 190,
      title: '比较成本',
    },
    {
      field: 'effective_sell_price_change',
      formatter: ({ row }: { row: Record<string, string> }) =>
        formatPriceChangeRange(
          row.old_effective_sell_price,
          row.new_effective_sell_price,
        ),
      minWidth: 210,
      title: '利润后价格',
    },
    { field: 'change_amount', minWidth: 130, title: '变化值' },
    {
      field: 'changed_at',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatDateTime(cellValue),
      minWidth: 180,
      title: '变动时间',
    },
  ];
}
```

- [ ] **Step 9: Run mapper and schema tests to verify they pass**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/price-changes/mappers.test.ts apps/web-ele/src/views/myjob/products/price-changes/schemas.test.ts
```

Expected: PASS for `price change mappers` and `price change schemas`.

- [ ] **Step 10: Commit mappers and schemas**

Run:

```bash
git add apps/web-ele/src/views/myjob/products/price-changes/types.ts apps/web-ele/src/views/myjob/products/price-changes/mappers.ts apps/web-ele/src/views/myjob/products/price-changes/mappers.test.ts apps/web-ele/src/views/myjob/products/price-changes/schemas.ts apps/web-ele/src/views/myjob/products/price-changes/schemas.test.ts
git commit -m "feat: add product price change grid schemas"
```

Expected: commit succeeds.

---

### Task 3: Route Registration

**Files:**

- Modify: `apps/web-ele/src/router/routes/modules/products.ts`
- Modify: `apps/web-ele/src/router/routes/modules/products.test.ts`

- [ ] **Step 1: Write the failing route test**

Update the expected route object in `apps/web-ele/src/router/routes/modules/products.test.ts`.

In the parent `authority` array, add `product.price_change` after `product.purchase_limit`:

```ts
authority: [
  'product.brand',
  'product.industry',
  'product.goods',
  'product.template',
  'product.purchase_limit',
  'product.price_change',
  'supplier.index',
  'order.recharge_risk',
],
```

Add this child route after `ProductPurchaseLimits`:

```ts
{
  component: expect.any(Function),
  meta: {
    authority: ['product.price_change'],
    title: '自动改价记录',
  },
  name: 'ProductPriceChanges',
  path: '/products/price-changes',
},
```

- [ ] **Step 2: Run route test to verify it fails**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/router/routes/modules/products.test.ts
```

Expected: FAIL because `products.ts` does not contain `product.price_change` or `ProductPriceChanges`.

- [ ] **Step 3: Implement route registration**

Modify `apps/web-ele/src/router/routes/modules/products.ts`.

In the parent `authority` array, add `product.price_change` after `product.purchase_limit`:

```ts
authority: [
  'product.brand',
  'product.industry',
  'product.goods',
  'product.template',
  'product.purchase_limit',
  'product.price_change',
  'supplier.index',
  'order.recharge_risk',
],
```

Add this child route after the purchase limit route:

```ts
{
  component: () =>
    import('#/views/myjob/products/price-changes/index.vue'),
  meta: {
    authority: ['product.price_change'],
    title: '自动改价记录',
  },
  name: 'ProductPriceChanges',
  path: '/products/price-changes',
},
```

- [ ] **Step 4: Run route test to verify it passes**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/router/routes/modules/products.test.ts
```

Expected: PASS for `products routes`.

- [ ] **Step 5: Commit route registration**

Run:

```bash
git add apps/web-ele/src/router/routes/modules/products.ts apps/web-ele/src/router/routes/modules/products.test.ts
git commit -m "feat: add product price change route"
```

Expected: commit succeeds.

---

### Task 4: Page And Grid

**Files:**

- Create: `apps/web-ele/src/views/myjob/products/price-changes/composables/usePriceChangePage.ts`
- Create: `apps/web-ele/src/views/myjob/products/price-changes/index.vue`
- Create: `apps/web-ele/src/views/myjob/products/price-changes/index.test.ts`

- [ ] **Step 1: Write the failing page test**

Create `apps/web-ele/src/views/myjob/products/price-changes/index.test.ts`:

```ts
/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PriceChangesPage from './index.vue';

const gridConfigState = vi.hoisted(() => ({
  latest: null as any,
}));

const apiMocks = vi.hoisted(() => ({
  getProductGoodsChannelPriceChangeListApi: vi.fn(),
}));

vi.mock('@vben/common-ui', () => ({
  Page: defineComponent({
    name: 'PageStub',
    setup(_, { slots }) {
      return () => h('main', { 'data-test': 'page' }, slots.default?.());
    },
  }),
}));

vi.mock('#/adapter/vxe-table', () => ({
  useVbenVxeGrid: (config: any) => {
    gridConfigState.latest = config;
    return [
      defineComponent({
        name: 'PriceChangeGridStub',
        setup(_, { slots }) {
          const row = {
            goods_code: 'PRICE-CHANGE-001',
            goods_name: '自动改价测试商品',
            platform_account_id: 101,
            platform_account_name: '卡卡云测试账号',
            supplier_goods_name: '上游测试商品',
            supplier_goods_no: '2582531',
          };
          return () =>
            h('section', { 'data-test': 'price-change-grid' }, [
              slots.platform?.({ row }),
              slots.goods?.({ row }),
              slots.supplier_goods?.({ row }),
            ]);
        },
      }),
      { reload: vi.fn() },
    ];
  },
}));

vi.mock('#/api/modules/admin/products/price-changes', () => apiMocks);

async function renderPage() {
  const root = document.createElement('div');
  document.body.append(root);
  const app = createApp(PriceChangesPage);
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

describe('PriceChangesPage', () => {
  const mounted: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    gridConfigState.latest = null;
    apiMocks.getProductGoodsChannelPriceChangeListApi.mockResolvedValue({
      list: [],
      pagination: { total: 0 },
    });
  });

  afterEach(() => {
    while (mounted.length > 0) {
      mounted.pop()?.unmount();
    }
  });

  it('configures grid and renders compact row slots', async () => {
    const view = await renderPage();
    mounted.push(view);

    expect(
      view.root.querySelector('[data-test="price-change-grid"]'),
    ).toBeTruthy();
    expect(view.root.textContent).toContain('卡卡云测试账号');
    expect(view.root.textContent).toContain('#101');
    expect(view.root.textContent).toContain('PRICE-CHANGE-001');
    expect(view.root.textContent).toContain('自动改价测试商品');
    expect(view.root.textContent).toContain('2582531');
    expect(view.root.textContent).toContain('上游测试商品');
    expect(
      gridConfigState.latest.formOptions.schema.map(
        (item: any) => item.fieldName,
      ),
    ).toEqual([
      'source',
      'keyword',
      'supplier_goods_no',
      'platform_id',
      'date_range',
    ]);
    expect(
      gridConfigState.latest.gridOptions.columns.map((item: any) => item.field),
    ).toEqual([
      'source',
      'platform',
      'goods',
      'supplier_goods',
      'source_cost_price_change',
      'cost_price_change',
      'effective_sell_price_change',
      'change_amount',
      'changed_at',
    ]);
  });

  it('queries list through mapper and converts grid result', async () => {
    apiMocks.getProductGoodsChannelPriceChangeListApi.mockResolvedValueOnce({
      list: [
        {
          id: 1,
          source: 'push',
        },
      ],
      pagination: { total: 1 },
    });

    const view = await renderPage();
    mounted.push(view);

    const result =
      await gridConfigState.latest.gridOptions.proxyConfig.ajax.query(
        { page: { currentPage: 2, pageSize: 30 } },
        {
          date_range: ['2026-05-06 00:00:00', '2026-05-06 23:59:59'],
          keyword: ' PRICE-CHANGE-001 ',
          platform_id: 101,
          source: 'push',
          supplier_goods_no: ' 2582531 ',
        },
      );

    expect(
      apiMocks.getProductGoodsChannelPriceChangeListApi,
    ).toHaveBeenCalledWith({
      end_at: '2026-05-06 23:59:59',
      keyword: 'PRICE-CHANGE-001',
      page: 2,
      page_size: 30,
      platform_id: 101,
      source: 'push',
      start_at: '2026-05-06 00:00:00',
      supplier_goods_no: '2582531',
    });
    expect(result).toEqual({
      items: [{ id: 1, source: 'push' }],
      total: 1,
    });
  });
});
```

- [ ] **Step 2: Run page test to verify it fails**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/price-changes/index.test.ts
```

Expected: FAIL with an import resolution error for `./index.vue`.

- [ ] **Step 3: Create page composable**

Create `apps/web-ele/src/views/myjob/products/price-changes/composables/usePriceChangePage.ts`:

```ts
import type { GridPageParams } from '../../../shared';

import type { ProductGoodsChannelPriceChangeItem } from '#/api/modules/admin/products/price-changes';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getProductGoodsChannelPriceChangeListApi } from '#/api/modules/admin/products/price-changes';

import { MYJOB_GRID_CLASS, toGridResult } from '../../../shared';
import { buildPriceChangeListQuery } from '../mappers';
import {
  buildPriceChangeColumns,
  buildPriceChangeFilterSchema,
} from '../schemas';

/**
 * 自动改价记录页面只读展示，不承载编辑状态；组合式函数只负责 Grid 配置和查询编排。
 */
export function usePriceChangePage() {
  const [PriceChangeGrid] = useVbenVxeGrid<ProductGoodsChannelPriceChangeItem>({
    formOptions: {
      schema: buildPriceChangeFilterSchema(),
    },
    gridClass: MYJOB_GRID_CLASS,
    gridOptions: {
      columns: buildPriceChangeColumns(),
      pagerConfig: {},
      proxyConfig: {
        ajax: {
          query: async (
            params: GridPageParams,
            formValues: Record<string, any>,
          ) => {
            const result = await getProductGoodsChannelPriceChangeListApi(
              buildPriceChangeListQuery(params, formValues),
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

  return {
    PriceChangeGrid,
  };
}
```

- [ ] **Step 4: Create page entry**

Create `apps/web-ele/src/views/myjob/products/price-changes/index.vue`:

```vue
<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { MYJOB_PAGE_CONTENT_CLASS } from '../../shared';
import { usePriceChangePage } from './composables/usePriceChangePage';

const { PriceChangeGrid } = usePriceChangePage();
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <PriceChangeGrid>
      <template #platform="{ row }">
        <div class="leading-5">
          <div>{{ row.platform_account_name || '--' }}</div>
          <div class="text-xs text-gray-500">
            #{{ row.platform_account_id }}
          </div>
        </div>
      </template>

      <template #goods="{ row }">
        <div class="leading-5">
          <div>{{ row.goods_code || '--' }}</div>
          <div class="text-xs text-gray-500">{{ row.goods_name || '--' }}</div>
        </div>
      </template>

      <template #supplier_goods="{ row }">
        <div class="leading-5">
          <div>{{ row.supplier_goods_no || '--' }}</div>
          <div class="text-xs text-gray-500">
            {{ row.supplier_goods_name || '--' }}
          </div>
        </div>
      </template>
    </PriceChangeGrid>
  </Page>
</template>
```

- [ ] **Step 5: Run page test to verify it passes**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/price-changes/index.test.ts
```

Expected: PASS for `PriceChangesPage`.

- [ ] **Step 6: Run focused price change tests**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/price-changes/mappers.test.ts apps/web-ele/src/views/myjob/products/price-changes/schemas.test.ts apps/web-ele/src/views/myjob/products/price-changes/index.test.ts
```

Expected: PASS for all price change page tests.

- [ ] **Step 7: Commit page and grid**

Run:

```bash
git add apps/web-ele/src/views/myjob/products/price-changes
git commit -m "feat: add product price change page"
```

Expected: commit succeeds.

---

### Task 5: Verification And Docs

**Files:**

- Modify: `docs/superpowers/specs/2026-05-06-product-price-changes-design.md`

- [ ] **Step 1: Verify spec code block formatting**

Run:

```bash
rg -n "GET / admin|product - goods" docs/superpowers/specs/2026-05-06-product-price-changes-design.md
rg -n "TO''DO|TB''D|FIX''ME" docs/superpowers/specs/2026-05-06-product-price-changes-design.md
```

Expected: command exits with code 1 and prints no matches.

- [ ] **Step 2: Run all focused tests**

Run:

```bash
pnpm test:unit -- apps/web-ele/src/api/myjob-api-contract.test.ts apps/web-ele/src/router/routes/modules/products.test.ts apps/web-ele/src/views/myjob/products/price-changes/mappers.test.ts apps/web-ele/src/views/myjob/products/price-changes/schemas.test.ts apps/web-ele/src/views/myjob/products/price-changes/index.test.ts
```

Expected: PASS for API contract, product routes, mappers, schemas and page tests.

- [ ] **Step 3: Run type check**

Run:

```bash
pnpm run check:type
```

Expected: typecheck passes.

- [ ] **Step 4: Run lint**

Run:

```bash
pnpm lint
```

Expected: lint passes.

- [ ] **Step 5: Inspect final diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: only files from this plan are modified or untracked before the final commit.

- [ ] **Step 6: Commit verification doc correction if present**

Run:

```bash
git add docs/superpowers/specs/2026-05-06-product-price-changes-design.md
git commit -m "docs: 修正自动改价记录设计文档"
```

Expected: commit succeeds if the spec formatting correction is still uncommitted. If Git prints `nothing to commit`, continue to Step 7.

- [ ] **Step 7: Report completion evidence**

Collect these outputs for the final response:

```bash
git log --oneline -5
git status --short
```

Expected: recent commits include API、schema、route、page and docs commits, and `git status --short` has no unrelated uncommitted changes created by this implementation.
