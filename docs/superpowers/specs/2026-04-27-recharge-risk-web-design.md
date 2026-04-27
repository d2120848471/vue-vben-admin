# 商品管理充值风控前端设计

## 背景

后端项目 `/Users/denghong/Desktop/平时的项目/myjob` 已实现充值账号风控能力，接口域为 `/api/admin/recharge-risks`，权限码为 `order.recharge_risk`。后端能力包含风控规则的增删改查、启停、风控记录查询，以及开放下单命中风控后的本地失败订单和拦截流水记录。

前端仓库当前主要业务应用位于 `apps/web-ele`，商品管理模块已按 `views/myjob/products/*` 和 `api/modules/admin/products/*` 拆分。新增风控页面需要继续沿用该边界，不把新接口追加到旧式聚合 API 文件，也不把表格列、表单校验、payload 映射和页面状态堆到单个 SFC 中。

## 目标

- 在「商品管理」下新增一个菜单「风控管理」。
- 页面内部提供两个 tab：「风控管理」和「风控记录」。
- 「风控管理」支持规则列表、筛选、新增、编辑、删除和状态启停。
- 「风控记录」支持只读列表查询，按充值账号、商品关键词和拦截时间筛选。
- 前端路由和操作权限使用后端已有权限码 `order.recharge_risk`。
- 保持 API、schema、mapper、validator、组件和页面装配的职责边界清晰。

## 非目标

- 不修改后端接口、权限种子或数据库结构。
- 不新增导出、批量导入、批量删除、详情页、详情弹窗。
- 不把风控记录做成独立子菜单。
- 不改 `packages/`、`internal/`、`scripts/` 下代码。
- 不迁移无关商品模块旧逻辑。
- 不修改宽泛 API barrel 或旧式聚合 API 文件。

## 已确认决策

- 采用单路由单页面方案：`/products/recharge-risks` 页面内放两个 tab。
- 菜单挂在「商品管理」下，权限码仍使用 `order.recharge_risk`。
- 「风控记录」只读，不提供导出、删除、详情或二次操作。
- 新增规则默认启用，状态值为 `1`。
- 编辑规则直接用列表行数据回填，不额外请求详情。
- 状态切换走独立 `PATCH` 接口，不通过编辑接口间接修改。

## 方案选择

采用“商品管理单入口 + 页面内双 tab + 精确 API 域 + 拆分页面职责”方案。

该方案和参考截图一致，菜单入口简洁，也能和后端单一权限点保持一致。页面内会包含两个 Grid，因此需要拆出 `schemas.ts`、`mappers.ts`、`validators.ts` 和弹窗组件，避免 `index.vue` 变成大文件。

没有采用两个子菜单方案，因为它会让商品管理菜单更碎，并偏离参考交互。没有采用记录抽屉方案，因为风控记录是排查型列表，需要完整筛选和分页浏览。

## 文件边界

新增 API 域：

- `apps/web-ele/src/api/modules/admin/products/recharge-risks/api.ts`
- `apps/web-ele/src/api/modules/admin/products/recharge-risks/types.ts`
- `apps/web-ele/src/api/modules/admin/products/recharge-risks/index.ts`

新增页面域：

- `apps/web-ele/src/views/myjob/products/recharge-risks/index.vue`
- `apps/web-ele/src/views/myjob/products/recharge-risks/components/RechargeRiskRuleDialog.vue`
- `apps/web-ele/src/views/myjob/products/recharge-risks/schemas.ts`
- `apps/web-ele/src/views/myjob/products/recharge-risks/mappers.ts`
- `apps/web-ele/src/views/myjob/products/recharge-risks/validators.ts`
- `apps/web-ele/src/views/myjob/products/recharge-risks/types.ts`
- `apps/web-ele/src/views/myjob/products/recharge-risks/index.test.ts`
- `apps/web-ele/src/views/myjob/products/recharge-risks/mappers.test.ts`
- `apps/web-ele/src/views/myjob/products/recharge-risks/validators.test.ts`
- `apps/web-ele/src/views/myjob/products/recharge-risks/components/RechargeRiskRuleDialog.test.ts`

修改路由：

- `apps/web-ele/src/router/routes/modules/products.ts`
- `apps/web-ele/src/router/routes/modules/products.test.ts`

## API 设计

新增精确 API 域模块 `#/api/modules/admin/products/recharge-risks`。

规则接口：

- `getRechargeRiskRuleListApi(params)`：`GET /admin/recharge-risks/rules`
- `addRechargeRiskRuleApi(data)`：`POST /admin/recharge-risks/rules`
- `updateRechargeRiskRuleApi(id, data)`：`PUT /admin/recharge-risks/rules/{id}`
- `updateRechargeRiskRuleStatusApi(id, status)`：`PATCH /admin/recharge-risks/rules/{id}/status`
- `deleteRechargeRiskRuleApi(id)`：`DELETE /admin/recharge-risks/rules/{id}`

记录接口：

- `getRechargeRiskRecordListApi(params)`：`GET /admin/recharge-risks/records`

API 类型对齐后端字段：

- 规则列表项：`id`、`account`、`goods_keyword`、`reason`、`status`、`status_text`、`hit_count`、`created_by_name`、`updated_by_name`、`created_at`、`updated_at`。
- 规则 payload：`account`、`goods_keyword`、`reason`、`status`。
- 记录列表项：`id`、`rule_id`、`order_no`、`account`、`matched_keyword`、`goods_code`、`goods_name`、`reason`、`intercepted_at`。

## 路由与权限

在 `apps/web-ele/src/router/routes/modules/products.ts` 的商品管理子路由中新增：

- path：`/products/recharge-risks`
- name：`ProductRechargeRisks`
- title：`风控管理`
- authority：`['order.recharge_risk']`
- component：`#/views/myjob/products/recharge-risks/index.vue`

商品管理父路由 authority 同步追加 `order.recharge_risk`，确保有风控权限的用户能看到商品管理菜单入口。

该菜单虽然挂在商品管理下，但权限码不改名。这样前端授权和后端接口授权保持同一口径，避免引入需要后端配合的新权限点。

## 页面布局

页面使用现有 `Page + useVbenVxeGrid` 组合，外层通过 Element Plus tab 切换：

1. 「风控管理」tab
   - 顶部使用 Grid 内置筛选。
   - toolbar 提供「新增」按钮。
   - 表格提供状态开关、编辑、删除。
   - 规则弹窗挂在页面底部。

2. 「风控记录」tab
   - 顶部使用 Grid 内置筛选。
   - 不提供 toolbar 操作按钮。
   - 表格只展示记录字段。

`index.vue` 只保留页面装配、tab 状态、两个 Grid 的 API 调用编排和必要插槽。表格列、搜索 schema、查询参数构造、表单 payload 构造和校验逻辑拆到独立文件。

## 风控管理 Tab

筛选字段：

- 充值账号：映射 `account`。
- 商品关键词：映射 `goods_keyword`。
- 状态：全部 / 启用 / 停用，映射 `status`。

表格列：

- 充值账号
- 匹配关键词
- 已拦截次数
- 风控原因
- 状态
- 创建人
- 更新人
- 创建时间
- 更新时间
- 操作

操作：

- 新增：打开 `RechargeRiskRuleDialog`，默认状态启用。
- 编辑：用当前行回填弹窗。
- 删除：弹出确认框，确认后调用删除接口并刷新规则表。
- 状态启停：调用独立 `PATCH` 接口，并使用行级 loading map 防止重复点击。

## 规则弹窗

弹窗字段：

- 充值账号：必填，最多 255 字符。
- 商品关键词：必填，最多 255 字符。
- 风控原因：必填，最多 512 字符。
- 状态：启用 / 停用，只允许 `1` 或 `0`。

新增和编辑共用弹窗：

- 新增标题：`新增风控规则`。
- 编辑标题：`编辑风控规则`。
- 新增默认 `status = 1`。
- 提交前 trim 文本字段。
- 编辑保留后端已有 `hit_count`，不把展示字段提交回后端。

## 风控记录 Tab

筛选字段：

- 充值账号：映射 `account`。
- 商品关键词：映射 `goods_keyword`，后端按 `matched_keyword` 查询。
- 拦截时间：使用 `DatePicker` 的 `datetimerange`，映射 `start_time` 和 `end_time`。

表格列：

- 订单号
- 充值账号
- 拦截关键词
- 商品编码
- 商品名称
- 风控原因
- 规则 ID
- 拦截时间

记录 tab 不提供任何写操作。列表用于排查开放下单被拦截的历史流水。

## 数据流

规则列表查询：

1. Grid 触发查询。
2. `mappers.ts` 从 Grid 分页参数中解析 `page`、`page_size`。
3. trim `account` 和 `goods_keyword`，空值不传。
4. 状态为全部时不传 `status`；启用和停用传 `1` 或 `0`。
5. 调用 `getRechargeRiskRuleListApi`。
6. 使用 `toGridResult(result.list ?? [], result.pagination.total)` 返回给 Grid。

记录列表查询：

1. Grid 触发查询。
2. `mappers.ts` 解析分页参数。
3. trim `account` 和 `goods_keyword`，空值不传。
4. 使用现有 `extractDateRange` 生成 `start_time` 和 `end_time`。
5. 调用 `getRechargeRiskRecordListApi`。
6. 使用 `toGridResult(result.list ?? [], result.pagination.total)` 返回给 Grid。

规则保存：

1. 弹窗表单执行前端校验。
2. `mappers.ts` 统一构造 payload。
3. 新增调用 `POST`，编辑调用 `PUT`。
4. 成功后提示并关闭弹窗。
5. 页面刷新规则表。

## 错误处理

- 明显无效表单由前端校验拦截。
- 重复规则、时间格式错误、无权限等后端错误由现有请求层统一弹错。
- 删除确认取消不提示错误。
- 删除成功后刷新规则表。
- 状态切换失败后刷新规则表，以服务端状态为准。
- 记录查询失败不额外吞错，保持 Grid 默认失败行为和请求层提示。

## 测试设计

路由测试：

- 商品管理父级 authority 包含 `order.recharge_risk`。
- 商品管理子路由包含 `/products/recharge-risks`。
- 新路由 title 为 `风控管理`，authority 为 `order.recharge_risk`。

mapper 测试：

- 规则查询参数 trim，空值不传。
- 状态全部不传，启用 / 停用正确传参。
- 记录查询时间范围映射到 `start_time` / `end_time`。
- payload 构造会 trim 文本字段。
- 编辑回填只回填可编辑字段。

validator 测试：

- 充值账号、商品关键词、风控原因必填。
- 三个文本字段长度上限正确。
- 状态只允许 `0` 和 `1`。

页面测试：

- 默认激活「风控管理」tab。
- 两个 Grid 调用各自接口并正确传分页和筛选参数。
- 无 `order.recharge_risk` 权限时不展示新增和行操作。
- 状态切换调用 `PATCH` 接口。
- 删除确认后调用删除接口并刷新规则表。

弹窗测试：

- 新增默认启用。
- 编辑行数据正确回填。
- 提交时调用新增或编辑接口。
- 校验失败不提交接口。

## 验证命令

实现完成后按改动范围优先执行：

```bash
pnpm test:unit -- apps/web-ele/src/views/myjob/products/recharge-risks
pnpm test:unit -- apps/web-ele/src/router/routes/modules/products.test.ts
pnpm run check:type --filter=@vben/web-ele
```

如果命令参数与当前脚本不兼容，则改为执行对应测试文件或 `pnpm test:unit`，并在交付说明中明确实际执行命令。

## 风险与约束

- 前端菜单挂在商品管理下，但权限码属于后端订单域 `order.recharge_risk`。这是已确认决策，目的是保持后端权限一致。
- 参考截图中的部分字段名与后端当前字段不同，前端以真实后端字段为准。
- 页面内存在两个 Grid，必须保持 `index.vue` 只做装配，避免后续扩展时变成大 SFC。
- 如果后端后续新增导出或详情能力，本设计不预留复杂抽象，按 YAGNI 原则届时增量扩展。
