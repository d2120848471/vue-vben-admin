# 客户管理 V1 前端设计

日期：2026-05-08

## 背景

后端项目 `/Users/denghong/Desktop/平时的项目/myjob` 已提供客户侧认证和后台客户管理接口，联调说明见 `customer-management-frontend.md`。

本次在 `apps/web-ele` 中实现客户管理 V1 前端，范围覆盖：

- 客户侧登录、注册、忘记密码。
- 客户侧最小首页占位。
- 后台客户列表、回收站、详情、新增、编辑、启停、删除、恢复、重置登录密码、重置支付密码。

后端代码只作为接口契约参考，本次不修改后端项目。

## 目标

1. 完整覆盖客户管理 V1 文档中的前端页面和交互。
2. 后台客户管理继续使用仓库现有 `Page + useVbenVxeGrid + Element Plus` 体验。
3. 客户侧认证页复用现有 `AuthPageLayout` 和认证表单能力。
4. 客户 token 与后台 admin token 隔离，避免权限和请求语义混用。
5. 新增代码按业务域拆分，不向旧式聚合 API 文件或大页面文件继续堆逻辑。

## 非目标

- 不实现客户侧真实业务首页，只提供登录成功后的最小占位页。
- 不新增客户侧完整业务请求层；当前 V1 只有认证接口需要调用。
- 不改后端接口、权限种子、数据库结构或运行配置。
- 不把新接口追加到旧式聚合 `admin.ts`。
- 不重构无关的员工管理、商品管理、后台登录逻辑。

## 路由与权限

### 后台客户管理

新增后台路由模块：

- 文件：`apps/web-ele/src/router/routes/modules/customers.ts`
- 父级路径：`/customers`
- 父级标题：`客户管理`
- 父级图标：`lucide:contact`
- 父级权限：`customer.manage`

子路由：

- `/customers/list`
  - 名称：`CustomerList`
  - 标题：`客户列表`
  - 权限：`customer.manage`
- `/customers/trash`
  - 名称：`CustomerTrash`
  - 标题：`客户回收站`
  - 权限：`customer.manage`

后台菜单只依赖后端已有权限码 `customer.manage`。

### 客户侧路由

新增独立客户侧路由组：

- `/customer/auth/login`
- `/customer/auth/register`
- `/customer/auth/forgot-password`
- `/customer/home`

客户侧路由不进入后台 `BasicLayout`，避免展示后台菜单和后台权限状态。认证页复用现有认证布局；客户首页使用最小独立页面。

轻量守卫规则：

- 已有 customer token 时访问 `/customer/auth/login`，跳转 `/customer/home`。
- 没有 customer token 时访问 `/customer/home`，跳转 `/customer/auth/login`。
- 忘记密码成功后清理客户登录态，并跳转 `/customer/auth/login`。

## API 设计

### 后台客户管理 API 域

新增精确 API 模块：

- `apps/web-ele/src/api/modules/admin/customers/api.ts`
- `apps/web-ele/src/api/modules/admin/customers/types.ts`
- `apps/web-ele/src/api/modules/admin/customers/index.ts`

接口函数：

- `getCustomerListApi(params)`
  - `GET /admin/customers`
- `getCustomerTrashApi(params)`
  - `GET /admin/customers/trash`
- `getCustomerDetailApi(id)`
  - `GET /admin/customers/:id`
- `addCustomerApi(data)`
  - `POST /admin/customers`
- `updateCustomerApi(id, data)`
  - `PUT /admin/customers/:id`
- `updateCustomerStatusApi(id, status)`
  - `PATCH /admin/customers/:id/status`
- `deleteCustomerApi(id)`
  - `DELETE /admin/customers/:id`
- `restoreCustomerApi(id)`
  - `PATCH /admin/customers/:id/restore`
- `resetCustomerPasswordApi(id, data)`
  - `PATCH /admin/customers/:id/password`
- `resetCustomerPayPasswordApi(id, data)`
  - `PATCH /admin/customers/:id/pay-password`

`PATCH` 接口复用现有 `patchAdminApi`。

### 客户侧认证 API 域

新增客户侧 API 模块：

- `apps/web-ele/src/api/modules/customer/auth/api.ts`
- `apps/web-ele/src/api/modules/customer/auth/types.ts`
- `apps/web-ele/src/api/modules/customer/auth/index.ts`

接口函数：

- `sendCustomerSMSApi(data)`
  - `POST /customer/auth/sms/send`
- `registerCustomerApi(data)`
  - `POST /customer/auth/register`
- `loginCustomerApi(data)`
  - `POST /customer/auth/login`
- `forgotCustomerPasswordApi(data)`
  - `POST /customer/auth/forgot-password`

客户侧认证接口暂不需要后台 token。当前使用现有 `requestClient` 调用即可；后续如果新增需要 customer token 的客户侧业务接口，再单独引入 `customerRequestClient`。

## 客户侧会话设计

新增独立 store，例如 `apps/web-ele/src/store/customer-auth.ts`。

状态：

```ts
interface CustomerAuthState {
  customer: null | {
    company_name: string;
    id: number;
    phone: string;
    status: number;
  };
  token: string;
}
```

本地存储 key：

- `MYJOB_CUSTOMER_TOKEN`
- `MYJOB_CUSTOMER_INFO`

行为：

- 登录成功：保存 token 和 customer，跳转 `/customer/home`。
- 注册成功：保存 token 和 customer，跳转 `/customer/home`。
- 忘记密码成功：清理 token 和 customer，跳转 `/customer/auth/login`。
- 退出客户侧登录：清理 token 和 customer，跳转 `/customer/auth/login`。

该 store 不使用后台 `accessStore.accessToken`，避免客户 token 被后台鉴权拦截器当成 admin token。

## 页面文件边界

### 后台客户管理页面域

新增目录：`apps/web-ele/src/views/myjob/customers/`

文件：

- `index.vue`
  - 客户列表入口，只装配 `Page`、`Grid`、弹窗和插槽。
- `trash.vue`
  - 回收站入口，只装配 `Page`、`Grid` 和恢复操作。
- `components/CustomerDialog.vue`
  - 新增/编辑客户弹窗。
- `components/CustomerDetailDialog.vue`
  - 客户详情只读弹窗。
- `components/ResetPasswordDialog.vue`
  - 重置登录密码弹窗。
- `components/ResetPayPasswordDialog.vue`
  - 重置支付密码弹窗。
- `composables/useCustomerPage.ts`
  - 列表页状态、请求编排、操作事件。
- `composables/useCustomerTrashPage.ts`
  - 回收站状态、请求编排、恢复事件。
- `schemas.ts`
  - 搜索 schema、表格列、状态显示。
- `validators.ts`
  - 手机号、密码、支付密码、公司名、确认字段校验。
- `mappers.ts`
  - 查询参数、表单值、提交 payload 映射。
- `constants.ts`
  - 状态选项、状态文案、长度限制。
- `types.ts`
  - 当前页面私有类型。
- `*.test.ts`
  - mapper、validator、schema、页面装配测试。

### 客户侧认证页面域

新增目录：`apps/web-ele/src/views/customer/`

文件：

- `auth/login.vue`
  - 客户手机号和登录密码登录。
- `auth/register.vue`
  - 客户注册。
- `auth/forgot-password.vue`
  - 忘记密码。
- `auth/schemas.ts`
  - 认证表单 schema。
- `auth/validators.ts`
  - 客户侧认证表单校验。
- `auth/mappers.ts`
  - 认证表单 payload 构造。
- `home/index.vue`
  - 客户侧最小占位首页。
- `*.test.ts`
  - validator、mapper、store、路由轻测。

## 后台页面交互

### 客户列表

筛选：

- 关键字：公司/店铺名称或手机号。
- 状态：全部、启用、禁用。

表格列：

- ID
- 公司/店铺名称
- 手机号
- 状态
- 最后登录 IP
- 最后登录时间
- 创建时间
- 更新时间
- 操作

行操作：

- 详情
- 编辑
- 启用或禁用
- 删除
- 重置登录密码
- 重置支付密码

删除前弹确认框。禁用和重置登录密码会使客户旧 token 失效，确认文案或成功文案中需要明确提示。

### 客户回收站

筛选：

- 关键字：公司/店铺名称或手机号。

表格列与客户列表保持一致，但操作只保留恢复。

回收站中不展示：

- 编辑
- 启用或禁用
- 删除
- 重置登录密码
- 重置支付密码

### 弹窗

`CustomerDialog`：

- 新增态字段：公司/店铺名称、手机号、登录密码、确认登录密码、支付密码、确认支付密码、状态。
- 编辑态字段：公司/店铺名称、手机号、状态。
- 新增态默认状态为启用。
- 编辑态不展示密码字段，避免误导用户以为可回填明文密码。

`CustomerDetailDialog`：

- 只读展示详情字段。
- 详情请求失败交给现有 request 层提示。

`ResetPasswordDialog`：

- 字段：新登录密码、确认新登录密码。
- 不展示、不回填明文密码。
- 成功后提示客户旧登录态已失效。

`ResetPayPasswordDialog`：

- 字段：新支付密码、确认支付密码。
- 支付密码必须是 6 位数字。
- 成功后提示支付密码已重置，不提示踢登录态。

## 客户侧认证交互

### 登录页

字段：

- 手机号
- 登录密码

成功后：

- 保存 customer token。
- 保存 customer 信息。
- 跳转 `/customer/home`。

### 注册页

字段：

- 公司/店铺名称
- 手机号
- 短信验证码
- 登录密码
- 确认登录密码
- 6 位数字支付密码
- 确认支付密码
- 协议勾选

发送验证码：

- 调用 `sendCustomerSMSApi`
- `scene=register`
- 成功后启动 60 秒倒计时。

成功后：

- 保存 customer token。
- 保存 customer 信息。
- 跳转 `/customer/home`。

### 忘记密码页

字段：

- 手机号
- 短信验证码
- 新登录密码
- 确认新登录密码

发送验证码：

- 调用 `sendCustomerSMSApi`
- `scene=forgot_password`
- 成功后启动 60 秒倒计时。

成功后：

- 清理旧客户登录态。
- 跳转 `/customer/auth/login`。

### 客户首页

最小占位内容：

- 当前客户公司/店铺名称。
- 手机号。
- 状态文案。
- 退出登录按钮。

该页面不新增业务入口，避免提前设计未确定的客户侧业务功能。

## 校验规则

通用校验：

- 手机号：`1` 开头 11 位数字。
- 短信验证码：6 位数字。
- 登录密码：字母开头，6-10 位，支持字母、数字、下划线。
- 支付密码：6 位数字。
- 公司/店铺名称：必填，最长 100 个字符。
- 确认密码字段必须与对应密码一致。

校验函数集中放在 `validators.ts`，schema 和弹窗只消费规则，不内联复杂校验。

## Mapper 规则

后台客户管理：

- `buildCustomerListQuery(params, formValues)`
  - 负责分页、关键字 trim、状态归一。
- `buildCustomerPayload(form, mode)`
  - 新增态包含登录密码和支付密码。
  - 编辑态只包含公司/店铺名称、手机号、状态。
- `toCustomerFormValues(row)`
  - 只把可编辑基础字段带入表单。

客户侧认证：

- `buildCustomerLoginPayload(form)`
- `buildCustomerRegisterPayload(form)`
- `buildCustomerForgotPasswordPayload(form)`

payload 构造处要有注释，说明为什么新增态和编辑态字段不同，以及为什么忘记密码成功后必须清理旧客户登录态。

## 错误处理

- 接口统一响应 `code/message/data`，`code != 0` 继续交给现有 request 层展示 `message`。
- 页面不吞掉接口错误。
- 表单只做明显前端校验，业务冲突如手机号已存在、账号禁用、验证码错误由后端 message 展示。
- 删除、恢复、启停、重置密码操作要避免重复提交。
- 短信验证码倒计时只在发送成功后开始。

## 测试设计

### API 合约测试

更新 `apps/web-ele/src/api/myjob-api-contract.test.ts`，覆盖：

- 后台客户管理接口路径和 method。
- 客户侧认证接口路径和 method。
- `PATCH` 接口通过 `requestClient.request` 发送。

### 路由测试

新增或更新路由测试，覆盖：

- 后台客户管理父级和子路由。
- 权限码 `customer.manage`。
- 客户侧认证路由和客户首页路由。

### Mapper 测试

覆盖：

- 列表分页与筛选参数。
- 空关键字不发送。
- 状态只接受 `0` 或 `1`。
- 新增 payload 包含密码字段。
- 编辑 payload 不包含密码字段。
- 客户侧认证 payload trim 和字段映射。

### Validator 测试

覆盖：

- 手机号格式。
- 6 位短信验证码。
- 登录密码规则。
- 6 位支付密码。
- 公司/店铺名称必填和最大长度。
- 登录密码确认、支付密码确认。

### 页面和 store 轻测

覆盖：

- 客户列表 Grid 查询调用。
- 回收站只暴露恢复操作。
- 客户 store 保存、恢复、清理登录态。
- 登录/注册成功后路由跳转目标。
- 忘记密码成功后清理旧客户登录态。

## 验证命令

按改动范围至少执行：

```bash
pnpm test:unit -- apps/web-ele/src/api/myjob-api-contract.test.ts
pnpm test:unit -- apps/web-ele/src/views/myjob/customers
pnpm test:unit -- apps/web-ele/src/views/customer
pnpm test:unit -- apps/web-ele/src/router/routes/modules
pnpm run check:type
```

如果实现过程中触碰共享请求层、全局路由守卫或 store 初始化，再追加：

```bash
pnpm test:unit -- apps/web-ele/src/store
pnpm lint
```

## 实施约束

- 不修改 `packages/`、`internal/`、`scripts/`。
- 不修改后端 `/Users/denghong/Desktop/平时的项目/myjob`。
- 不向旧式聚合 API 文件继续追加客户管理接口。
- 不把表格列、表单校验、payload 映射、弹窗状态全部塞进同一个 SFC。
- 核心导出函数和非直观业务映射必须写简体中文注释，解释约束和原因。
