# 自动改价记录前端页面设计

日期：2026-05-06

## 背景

后端已经提供商品渠道自动改价记录查询接口：

- `GET /api/admin/product-goods-channel-price-changes`
- 前端请求路径使用现有 admin 前缀风格：`/admin/product-goods-channel-price-changes`
- 权限码：`product.price_change`

该页面用于在商品管理下查看由监控或供应商推送触发的渠道改价记录，帮助运营审计商品进价、比较成本和利润后价格的变化。

## 目标

在 `商品管理` 下新增一个只读页面：`自动改价记录`。

页面提供分页列表和筛选能力，展示精简审计字段，不提供配置、编辑、删除或详情抽屉。

## 非目标

本次不做以下内容：

- 不做自动改价规则配置入口。
- 不做详情抽屉或 raw payload 展示。
- 不做新增、编辑、删除、启停操作。
- 不额外引入平台账号下拉接口。

## 路由与权限

新增子路由：

- 路径：`/products/price-changes`
- 名称：`ProductPriceChanges`
- 标题：`自动改价记录`
- 权限：`product.price_change`
- 页面组件：商品管理自动改价记录页面入口

商品管理父级路由 authority 增加 `product.price_change`，保证仅拥有自动改价记录权限的用户也能看到商品管理父菜单。

## 文件边界

### 修改文件

- `apps/web-ele/src/router/routes/modules/products.ts`
  - 增加父级权限码。
  - 新增自动改价记录子路由。
- `apps/web-ele/src/router/routes/modules/products.test.ts`
  - 覆盖新增权限与子路由。
- `apps/web-ele/src/api/myjob-api-contract.test.ts`
  - 覆盖新接口路径和请求参数。

### 新增 API 域

- `apps/web-ele/src/api/modules/admin/products/price-changes/api.ts`
  - 只放自动改价记录列表请求函数。
- `apps/web-ele/src/api/modules/admin/products/price-changes/types.ts`
  - 只放查询参数、列表项类型。
- `apps/web-ele/src/api/modules/admin/products/price-changes/index.ts`
  - 精确导出 API 和类型。

### 新增页面目录

- `apps/web-ele/src/views/myjob/products/price-changes/index.vue`
  - 页面入口，只装配 Page 和 Grid。
- `apps/web-ele/src/views/myjob/products/price-changes/composables/usePriceChangePage.ts`
  - 表格状态、请求编排和 grid 配置。
- `apps/web-ele/src/views/myjob/products/price-changes/schemas.ts`
  - 搜索 schema、表格列、来源显示文案和价格变动 formatter。
- `apps/web-ele/src/views/myjob/products/price-changes/mappers.ts`
  - 表格分页与筛选表单到接口查询参数的映射。
- `apps/web-ele/src/views/myjob/products/price-changes/types.ts`
  - 当前页面私有类型。

### 新增测试

- `mappers.test.ts`
- `schemas.test.ts`
- `index.test.ts` 或组合式函数轻测

## API 设计

新增函数：

- `getProductGoodsChannelPriceChangeListApi(params)`

请求：

```ts
GET /admin/product-goods-channel-price-changes
```

查询参数：

- `page`
- `page_size`
- `source`
- `keyword`
- `supplier_goods_no`
- `platform_id`
- `start_at`
- `end_at`

返回类型沿用仓库已有分页结构：

- `list`
- `pagination.total`

列表项字段与后端保持一致，包含：

- `id`
- `source`
- `provider_code`
- `platform_account_id`
- `platform_account_name`
- `binding_id`
- `goods_id`
- `goods_code`
- `goods_name`
- `goods_icon`
- `supplier_goods_no`
- `supplier_goods_name`
- `old_source_cost_price`
- `new_source_cost_price`
- `old_cost_price`
- `new_cost_price`
- `old_effective_sell_price`
- `new_effective_sell_price`
- `change_amount`
- `description`
- `raw_payload`
- `changed_at`

页面首版不展示 `description` 和 `raw_payload`，但类型保留，避免接口类型不完整。

## 页面数据流

```text
筛选表单
  -> buildPriceChangeListQuery()
  -> getProductGoodsChannelPriceChangeListApi()
  -> toGridResult()
  -> VxeGrid 渲染
```

页面使用现有 `useVbenVxeGrid` 和 `MYJOB_GRID_CLASS`，保持商品管理下已有后台列表体验一致。

## 筛选设计

筛选项：

- `source`
  - 组件：Select
  - 选项：全部、监控、推送
  - 请求值：空、`monitor`、`push`
- `keyword`
  - 组件：Input
  - 含义：本地商品编号或名称
- `supplier_goods_no`
  - 组件：Input
  - 含义：上游商品编号
- `platform_id`
  - 组件：InputNumber
  - 含义：平台账号 ID
- `date_range`
  - 组件：DatePicker
  - 类型：`datetimerange`
  - 映射：`start_at` / `end_at`

## 参数映射规则

`buildPriceChangeListQuery(params, formValues)` 负责统一构造请求参数。

规则：

- `page` 和 `page_size` 来自 grid 分页。
- 字符串字段 trim 后为空则不传。
- `platform_id` 为空不传；能转成正数才传；非数字忽略。
- `date_range` 只有包含两个有效值时才映射到 `start_at` 和 `end_at`。

这样可以避免无效筛选值散落在页面和 API 调用处。

## 表格设计

表格采用精简审计列表。

列：

- 来源
- 平台账号
- 本地商品
- 上游商品
- 原始进价
- 比较成本
- 利润后价格
- 变化值
- 变动时间

格式：

- 来源显示为 `监控` / `推送`，未知值原样展示。
- 商品列展示商品编码与商品名称两行文本。
- 上游商品列展示上游编号与上游名称两行文本。
- 价格变动列使用统一 formatter：`旧值 -> 新值`。
- 时间列复用现有 `formatDateTime()`。

## 错误处理

- 列表请求异常不在页面吞掉，由现有 request 层和 grid 加载态处理。
- mapper 对无效筛选值做前端侧兜底，避免发送明显无效参数。
- 空列表沿用 grid 默认空态。

## 测试设计

### API contract 测试

覆盖：

- 请求路径是 `/admin/product-goods-channel-price-changes`。
- 请求参数包含分页、来源、关键词、上游商品编号、平台账号 ID 和时间范围。

### 路由测试

覆盖：

- 商品管理父级 authority 包含 `product.price_change`。
- 自动改价记录子路由存在。
- 子路由 title 为 `自动改价记录`。
- 子路由 authority 为 `product.price_change`。

### mapper 测试

覆盖：

- 分页字段映射。
- 空字符串筛选值不传。
- `platform_id` 正数映射。
- 非数字或非正数 `platform_id` 忽略。
- `date_range` 映射为 `start_at` 和 `end_at`。

### schema 测试

覆盖：

- 筛选 schema 包含 `source`、`keyword`、`supplier_goods_no`、`platform_id`、`date_range`。
- 来源选项包含全部、监控、推送。
- 表格列包含精简审计字段。
- 来源 formatter 和价格变动 formatter 可用。

### 页面轻测

覆盖：

- 页面能挂载 grid。
- grid 请求时调用自动改价记录接口。
- 返回数据能转换成 grid 结果。

## 验收标准

- 拥有 `product.price_change` 权限的用户能在商品管理下看到 `自动改价记录` 菜单。
- 页面进入后能分页请求 `/admin/product-goods-channel-price-changes`。
- 筛选项能正确映射到后端接口参数。
- 表格展示精简审计字段。
- 不出现新增、编辑、删除、启停、详情抽屉等超出本次范围的功能。
- 路由、API、mapper、schema 和页面测试通过。

## 风险与约束

- `platform_id` 首版为数字输入，不做平台账号下拉；用户需要知道平台账号 ID。
- `description` 和 `raw_payload` 首版不展示；如后续需要排查原始载荷，应单独增加详情抽屉。
- 来源枚举根据后端当前实现固定为 `monitor` 和 `push`；未知来源用原值兜底展示。
