# AGENTS.md

本文件适用于整个仓库。除非任务明确要求，否则默认以 `apps/web-ele` 为主工作区，不要随意修改 `packages/`、`internal/`、`scripts/` 下的代码。

## 1. 仓库工作边界

- 这是一个 `pnpm workspace` + `turbo` 的 monorepo。
- 主要前端业务应用位于 `apps/web-ele`。
- 业务页面主要位于 `apps/web-ele/src/views/myjob`。
- 路由位于 `apps/web-ele/src/router/routes/modules`，按业务域拆分。
- API 应按业务域放在 `apps/web-ele/src/api/modules/admin/<domain>/`。
- `shared.ts` 只能放少量、强相关、低复杂度的共享逻辑，不能演变成杂物文件。

## 2. 执行任务前的要求

开始改动前，先在回复里简要说明：

1. 本次要改哪些文件。
2. 是否需要拆文件。
3. 是否涉及 API、路由、权限、表单、表格列定义、类型定义。

如果你准备把一个页面、一个 API 域、一个复杂表单、一个大段业务规则都写进同一个文件，必须先停止，并重新拆分方案。

## 3. 强制架构规则

### 3.1 禁止“全写一个文件里”

以下职责不能继续堆在同一个大文件中：

- 页面模板
- 弹窗状态管理
- 表格列定义
- 查询表单 schema
- 编辑表单 schema
- 校验器
- API 请求封装
- 权限判断
- payload 构造/服务端字段映射
- 纯工具函数

当一个页面同时包含以上 3 种及以上职责时，必须拆分。

### 3.2 页面拆分约定

对于 `apps/web-ele/src/views/myjob/<feature>/` 下的新功能或重构，优先按下面的结构组织：

- `index.vue`：页面入口，只保留页面装配、组件拼装、少量页面级生命周期。
- `components/`：当前功能专属组件。
- `composables/use<Feature>Page.ts`：页面状态、请求编排、事件处理。
- `schemas.ts`：表格列、搜索 schema、表单 schema。
- `validators.ts`：独立校验逻辑。
- `mappers.ts`：接口数据与表单数据的转换、payload 构造。
- `constants.ts`：选项、文案常量、枚举映射。
- `types.ts`：当前功能私有类型。
- `*.test.ts`：与上面文件同目录共置测试。

不要把 `schemas`、`validators`、`mappers`、`constants` 再塞回 `index.vue`。

### 3.3 文件体积阈值

以下为默认阈值，超过后优先拆分：

- `.vue` 页面文件：建议不超过 220 行；超过 350 行必须拆分。
- `shared.ts`：建议不超过 150 行或 6 个导出；超过 250 行必须按职责拆分。
- `api.ts`：单个业务域建议不超过 180 行；超过 250 行应继续按子域或资源拆分。
- 任意文件只要同时出现“请求 + 校验 + schema + 视图状态 + 数据转换”中的多项，也应拆分，即使行数还没超标。

## 4. API 约束

### 4.1 严禁继续扩写旧式聚合 API 文件

不要把新的业务 API、业务类型、业务枚举继续追加到旧式聚合文件中，尤其是：

- `apps/web-ele/src/api/modules/admin.ts`

该类文件只允许做以下两类工作：

- 兼容性维护
- 将旧逻辑逐步迁移到按域拆分的模块中

### 4.2 新 API 组织方式

新增或重构 API 时，使用以下模式：

- `apps/web-ele/src/api/modules/admin/<domain>/api.ts`
- `apps/web-ele/src/api/modules/admin/<domain>/types.ts`
- `apps/web-ele/src/api/modules/admin/<domain>/index.ts`

要求：

- `api.ts` 只放请求函数。
- `types.ts` 只放 DTO、VO、表单值、查询参数等类型。
- `index.ts` 只做精确导出。

### 4.3 页面导入规则

页面和组合式函数优先从精确域模块导入，例如：

- `#/api/modules/admin/groups`
- `#/api/modules/admin/users`
- `#/api/modules/admin/products`

除非任务明确要求维护统一导出，否则不要从宽泛 barrel（如 `#/api`）获取业务 API。

## 5. 路由约束

- 每个业务域的路由放在 `apps/web-ele/src/router/routes/modules/<domain>.ts`。
- 不要把不相关业务路由混写到同一个路由文件。
- 新页面新增路由时，要保持路由文件按业务域聚合，而不是按“本次需求”临时堆叠。
- 涉及权限 meta、title、icon、menu 排序时，要在提交说明里明确指出。

## 6. 注释规则

### 6.1 必须写注释的地方

以下位置必须有注释：

- 导出的组合式函数
- 导出的复杂工具函数
- 非直观的业务校验规则
- payload 构造和字段映射逻辑
- 权限判断和禁用条件
- 对后端返回结构的兼容处理
- 临时 workaround、兼容旧接口、历史包袱处理点

### 6.2 注释应该怎么写

优先写“为什么”和“约束条件”，不要只写“做了什么”。

合格示例：

- 说明某个字段为什么必须在提交前归一化。
- 说明某个开关为什么在编辑态和新增态规则不同。
- 说明某个数组为什么需要兼容后端返回的多种 shape。

不合格示例：

- `// 设置值`
- `// 请求接口`
- `// 提交表单`

### 6.3 注释形式

- 导出函数优先使用 TSDoc/JSDoc 风格。
- 复杂分支在分支前写 1~2 行行内注释即可。
- 注释要跟着代码移动和更新；无效注释要一并删除。

## 7. 命名与目录规则

- 新功能目录名使用稳定、明确的业务名，不要使用 `temp`、`newPage`、`test2` 之类命名。
- 新页面默认使用 `index.vue` 作为功能入口页。
- 同一语义不要同时混用 `index.vue` 与 `list.vue` 作为新代码入口。
- 特殊页面使用语义化命名，例如 `detail.vue`、`edit.vue`、`trash.vue`。
- 工具函数命名要体现业务含义，不要大量使用 `handleData`、`formatItem`、`doAction` 这类空泛名称。

## 8. shared 文件约束

`shared.ts` 不是垃圾桶。

出现以下任一情况时，必须拆分：

- 同时包含类型、常量、工具函数、UI 选项构造。
- 已经跨越多个子业务（例如品牌、行业、商品策略同时混在一起）。
- 需要被多个页面以不同目的复用。

拆分优先方向：

- `formatters.ts`
- `options.ts`
- `tree.ts`
- `selectors.ts`
- `permissions.ts`
- `constants.ts`
- `types.ts`

## 9. 表单、表格、弹窗规则

对于带表格和弹窗编辑的业务页：

- 表格列定义放 `schemas.ts`。
- 查询条件 schema 放 `schemas.ts` 或 `search-schema.ts`。
- 编辑表单 schema 和 rules 放 `form-schema.ts` / `validators.ts`。
- 弹窗开关、编辑态/新增态判断、提交状态放 `use<Feature>Page.ts`。
- `buildPayload`、`normalizeFormValues`、`toFormValues` 之类函数放 `mappers.ts`。

不要在页面 SFC 里同时内嵌：

- 所有 columns
- 所有 form rules
- 所有 submit payload 映射
- 所有 dialog 生命周期
- 所有 API 调用

## 10. 测试要求

以下场景必须补测试或同步更新测试：

- 提取了新工具函数
- 新增或修改了 schema 构造逻辑
- 新增或修改了校验规则
- 修改了路由 meta 或权限逻辑
- 修改了 API 参数/返回值映射
- 修复了明确可复现的 bug

优先测试被拆出来的纯函数、mappers、validators、composables，而不是继续把不可测试逻辑塞回大页面组件里。

## 11. 修改策略

- 优先做小步重构，不要为了一次需求顺手做大面积无关改名。
- 如果触碰旧的大文件，优先把“本次改动相关”的逻辑抽出，而不是继续往旧文件追加代码。
- 保持最小必要 diff，但不要为了 diff 小而牺牲模块边界。
- 避免复制粘贴已有业务逻辑；先找是否已有同类 schema、mapper、validator、API 封装。

## 12. 变更完成后的自检

至少根据改动范围执行对应检查：

- `pnpm lint`
- `pnpm run check:type`
- `pnpm test:unit`

如果改动范围较大、涉及多个包或全局约束，再考虑：

- `pnpm check`

不要在没有说明的情况下声称“已完成”但未做任何校验。

## 13. 最终回复格式要求

完成任务后，回复中必须明确给出：

1. 改了哪些文件。
2. 新增了哪些拆分文件。
3. 哪些旧逻辑被迁移出了大文件。
4. 跑了哪些检查命令。
5. 还有哪些风险或待补项。

## 14. 本仓库当前重构方向

本仓库已经存在“按业务域拆 API/路由/测试”的基础，因此后续新增代码必须顺着这个方向继续，而不是回退到以下做法：

- 新接口继续塞进单一 `admin.ts`
- 新页面继续做成超大 SFC
- 新业务继续堆进单个 `shared.ts`
- 页面继续直接依赖宽泛 barrel 导出

如果旧代码当前还没完全重构完，处理原则是：

- 新代码不继承旧坏味道。
- 旧代码只做增量迁移，不做无边界扩写。
