# 订单模块设计

## 背景

后端项目 `/Users/denghong/Desktop/平时的项目/myjob` 已实现后台订单记录查询能力：

- 后台接口：`GET /api/admin/orders`
- 权限点：`order.manage`
- 后端菜单：`订单记录`
- 响应内容：订单列表、分页信息、今日/昨日订单数与交易额统计

前端 `apps/web-ele` 目前还没有订单模块入口。仓库当前重构方向要求新业务按 API 域、路由域、页面配置拆分，不继续堆到旧式聚合文件或单个大型 SFC 中。

## 目标

- 新增独立一级订单模块，提供只读订单列表。
- 支持后端已有的分页、搜索、筛选和时间范围查询。
- 展示后端返回的今日/昨日基础统计。
- 展示订单排查所需字段，包括订单号、商品、账号、金额、渠道、上游单号、状态、回执和时间。
- 保持实现边界清晰，符合 `apps/web-ele` 现有业务域拆分方式。

## 非目标

- 不新增或修改后端接口。
- 不做订单详情页。
- 不做订单人工处理、状态刷新、导出、退款、售后等操作。
- 不新增编辑弹窗或表单。
- 不迁移无关旧逻辑。
- 不修改 `packages/`、`internal/`、`scripts/` 下代码。

## 方案选择

采用“订单独立模块 + 精确 API 域 + 拆 `schemas/constants`”方案。

新增订单 API 域模块 `#/api/modules/admin/orders`，页面放在 `views/myjob/orders/index.vue`。搜索 schema、表格列定义、筛选常量拆出到同目录文件，避免页面 SFC 同时堆积请求、列配置和选项常量。

暂不拆 `composables/useOrdersPage.ts`。首版页面只有只读列表、顶部统计和 Grid 查询编排，页面状态较少，继续拆 composable 会增加不必要的间接层。后续如果加入详情、处理动作或复杂状态，再增量抽出组合式函数。

## 文件边界

新增文件：

- `apps/web-ele/src/api/modules/admin/orders/api.ts`
- `apps/web-ele/src/api/modules/admin/orders/types.ts`
- `apps/web-ele/src/api/modules/admin/orders/index.ts`
- `apps/web-ele/src/views/myjob/orders/index.vue`
- `apps/web-ele/src/views/myjob/orders/schemas.ts`
- `apps/web-ele/src/views/myjob/orders/constants.ts`
- `apps/web-ele/src/views/myjob/orders/index.test.ts`
- `apps/web-ele/src/router/routes/modules/orders.ts`
- `apps/web-ele/src/router/routes/modules/orders.test.ts`

修改文件：

- `apps/web-ele/src/api/myjob-api-contract.test.ts`

不修改文件：

- `apps/web-ele/src/api/modules/admin.ts`
- `packages/`
- `internal/`
- `scripts/`
- 当前已有商品模块文件

## API 设计

新增精确 API 域模块：

- `getOrderListApi(params: OrderListQuery)`
- 请求路径：`/admin/orders`
- 请求方式：`GET`
- 返回类型：`OrderListResult`

`OrderListQuery` 对齐后端 `OrderListReq`：

- `page`
- `page_size`
- `keyword`
- `keyword_by`
- `status`
- `has_tax`
- `channel_id`
- `is_card`
- `start_time`
- `end_time`
- `quick_range`

`OrderListResult` 包含：

- `list: OrderListItem[]`
- `pagination`
- `stats: OrderStats`

`OrderListItem` 对齐后端返回字段：

- `id`
- `sales_subject_name`
- `order_no`
- `goods_id`
- `goods_name`
- `account`
- `quantity`
- `order_amount`
- `cost_amount`
- `profit_amount`
- `current_channel_id`
- `current_channel_name`
- `supplier_order_no`
- `attempt_count`
- `last_receipt`
- `status_code`
- `status_text`
- `created_at`
- `updated_at`

## 路由与权限

新增独立一级路由模块 `orders.ts`：

- 父路由：`/orders`
- 父路由名称：`Orders`
- 父标题：`订单管理`
- 父权限：`order.manage`
- 图标：`lucide:receipt-text`
- 菜单排序：`order: 30`，放在商品管理之后、系统设置之前
- 子路由：`/orders/list`
- 子路由名称：`OrderList`
- 子标题：`订单记录`
- 子权限：`order.manage`
- 组件：`#/views/myjob/orders/index.vue`

权限只在前端路由 meta 中声明，不新增权限写入逻辑。后端已经存在 `order.manage` 权限点。

## 页面布局

采用紧凑运营表格布局：

1. 顶部统计区
   - 今日订单数
   - 今日交易额
   - 昨日订单数
   - 昨日交易额

2. Grid 搜索区
   - 使用 Vben Grid 内置表单。
   - 搜索 schema 由 `schemas.ts` 生成。

3. 订单表格
   - 使用现有 `useVbenVxeGrid`。
   - 表格列由 `schemas.ts` 生成。
   - 页面只负责请求编排、统计状态和模板插槽。

## 搜索筛选

搜索字段：

- 关键词类型：全部 / 订单号 / 充值账号 / 商品名称，对应 `keyword_by`
- 关键词：对应 `keyword`
- 订单状态：待提交 / 处理中 / 成功 / 失败 / 未知，对应 `status`
- 含税状态：全部 / 含税 / 未税，对应 `has_tax`
- 是否卡密：全部 / 是 / 否，对应 `is_card`
- 当前渠道 ID：对应 `channel_id`
- 快捷时间：昨天 / 今天 / 近 7 天 / 本月 / 近 3 个自然月，对应 `quick_range`
- 创建时间范围：拆成 `start_time` / `end_time`

当同时传入快捷时间和创建时间范围时，前端不做互斥拦截，按后端当前逻辑同时传参。后端会叠加过滤条件。后续如产品要求互斥，再在前端补交互约束。

## 表格字段

表格展示字段：

- 销售主体
- 订单号
- 对外商品 ID
- 商品名称
- 充值账号
- 购买数量
- 订单金额
- 成本金额
- 利润金额
- 当前渠道
- 上游订单号
- 尝试次数
- 状态
- 回执摘要
- 创建时间
- 更新时间

状态列用 `status_text` 展示，`status_code` 决定 tag 类型。未知状态使用普通灰色样式。

空值显示 `--`。金额直接使用后端返回字符串，不在前端重新格式化金额精度。

## 数据流

1. 用户进入 `/orders/list`。
2. Vben Grid 发起首次查询。
3. 页面读取 Grid 分页参数，转换为 `page`、`page_size`。
4. 页面读取搜索表单值，转换为 `OrderListQuery`。
5. 调用 `getOrderListApi`。
6. 接口成功后，页面更新顶部 `stats`。
7. 页面将 `result.list` 和 `result.pagination.total` 交给 `toGridResult`。
8. Grid 渲染订单列表和分页。

统计始终来自当前列表接口响应，保证和当前筛选条件一致。

## 错误处理

- 接口失败不在页面额外吞错，由 `requestClient` 统一错误处理展示提示。
- Grid 保持默认失败行为。
- 顶部统计初始值为 `0` 和 `0.0000`。
- 接口成功后再更新统计，避免失败时显示错误的新统计。
- 后端当前 `is_card=1` 会返回空结果，前端不额外拦截。

## 测试设计

API 契约测试：

- `getOrderListApi` 调用 `/admin/orders`。
- 筛选参数完整透传给 `requestClient.get`。

路由测试：

- 存在独立 `Orders` 父路由。
- 父子路由权限均为 `order.manage`。
- 子路由路径为 `/orders/list`。
- 菜单标题为 `订单管理` / `订单记录`。

页面测试：

- Grid 查询时将分页参数映射为 `page`、`page_size`。
- 将关键词、状态、含税、是否卡密、渠道 ID、快捷时间传入 API。
- 将日期范围拆成 `start_time`、`end_time`。
- 接口成功后更新顶部统计。
- schema 包含核心搜索字段和核心表格列。

实现后按改动范围执行：

- 订单相关 vitest
- `pnpm lint`
- `pnpm run check:type`
- 如改动影响范围扩大，再执行 `pnpm test:unit`

## 风险与约束

- 订单列表列较多，首版采用横向宽表格；如果实际屏宽体验不佳，可后续把订单/商品/履约信息合并成插槽列。
- `channel_id` 当前没有独立渠道下拉字典，首版使用数字输入，避免新增不必要接口依赖。
- `is_card=1` 当前后端会返回空结果，这是后端现状的兼容行为，不视为前端错误。
- 设计文档只定义只读列表；任何订单处理动作都需要单独设计。
