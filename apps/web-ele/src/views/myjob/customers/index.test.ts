/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CustomersPage from './index.vue';

const gridConfigState = vi.hoisted(() => ({
  latest: null as any,
  reload: vi.fn(),
}));

const accessState = vi.hoisted(() => ({
  codes: ['customer.manage'] as string[],
}));

const apiMocks = vi.hoisted(() => ({
  deleteCustomerApi: vi.fn(),
  getCustomerDetailApi: vi.fn(),
  getCustomerListApi: vi.fn(),
  updateCustomerStatusApi: vi.fn(),
}));

vi.mock('@vben/common-ui', () => ({
  Page: defineComponent({
    name: 'PageStub',
    setup(_, { slots }) {
      return () => h('main', { 'data-test': 'page' }, slots.default?.());
    },
  }),
}));

vi.mock('@vben/stores', () => ({
  useAccessStore: () => ({ accessCodes: accessState.codes }),
}));

vi.mock('#/adapter/vxe-table', () => ({
  useVbenVxeGrid: (config: any) => {
    gridConfigState.latest = config;
    return [
      defineComponent({
        name: 'CustomerGridStub',
        setup(_, { slots }) {
          const row = {
            company_name: '测试客户',
            id: 7,
            phone: '13800000000',
            status: 1,
          };
          return () =>
            h('section', { 'data-test': 'customer-grid' }, [
              slots['toolbar-actions']?.(),
              slots.status?.({ row }),
              slots.actions?.({ row }),
            ]);
        },
      }),
      { reload: gridConfigState.reload },
    ];
  },
}));

vi.mock('#/api/modules/admin/customers', () => apiMocks);

vi.mock('./components/CustomerDialog.vue', () => ({
  default: defineComponent({
    name: 'CustomerDialogStub',
    setup: () => () => null,
  }),
}));
vi.mock('./components/CustomerDetailDialog.vue', () => ({
  default: defineComponent({
    name: 'CustomerDetailDialogStub',
    setup: () => () => null,
  }),
}));
vi.mock('./components/ResetPasswordDialog.vue', () => ({
  default: defineComponent({
    name: 'ResetPasswordDialogStub',
    setup: () => () => null,
  }),
}));
vi.mock('./components/ResetPayPasswordDialog.vue', () => ({
  default: defineComponent({
    name: 'ResetPayPasswordDialogStub',
    setup: () => () => null,
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
  const ElTag = defineComponent({
    name: 'ElTagStub',
    setup(_, { slots }) {
      return () => h('span', slots.default?.());
    },
  });
  return {
    ElButton,
    ElMessage: { success: vi.fn() },
    ElMessageBox: { confirm: vi.fn().mockResolvedValue(undefined) },
    ElSwitch,
    ElTag,
  };
});

async function renderPage() {
  const root = document.createElement('div');
  document.body.append(root);
  const app = createApp(CustomersPage);
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

function clickButton(root: HTMLElement, label: string) {
  const button = [...root.querySelectorAll('button')].find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  expect(button).toBeTruthy();
  button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('CustomersPage', () => {
  const mounted: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    gridConfigState.latest = null;
    apiMocks.getCustomerListApi.mockResolvedValue({
      list: [],
      pagination: { total: 0 },
    });
  });

  afterEach(() => {
    while (mounted.length > 0) {
      mounted.pop()?.unmount();
    }
  });

  it('configures customer list grid and actions', async () => {
    const view = await renderPage();
    mounted.push(view);

    expect(view.root.querySelector('[data-test="customer-grid"]')).toBeTruthy();
    expect(view.root.textContent).toContain('新增');
    expect(view.root.textContent).toContain('详情');
    expect(view.root.textContent).toContain('编辑');
    expect(view.root.textContent).toContain('重置登录密码');
    expect(view.root.textContent).toContain('重置支付密码');
    expect(
      gridConfigState.latest.formOptions.schema.map(
        (item: any) => item.fieldName,
      ),
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
  });

  it('shows status action text from the next operation', async () => {
    const view = await renderPage();
    mounted.push(view);

    expect(view.root.textContent).toContain('启用');
    expect(view.root.textContent).toContain('禁用');

    clickButton(view.root, '禁用');
    await flushPromises();

    expect(apiMocks.updateCustomerStatusApi).toHaveBeenCalledWith(7, 0);
    expect(gridConfigState.reload).toHaveBeenCalledTimes(1);
  });

  it('queries list through mapper and converts grid result', async () => {
    apiMocks.getCustomerListApi.mockResolvedValueOnce({
      list: [{ id: 7 }],
      pagination: { total: 1 },
    });
    const view = await renderPage();
    mounted.push(view);

    const result =
      await gridConfigState.latest.gridOptions.proxyConfig.ajax.query(
        { page: { currentPage: 2, pageSize: 30 } },
        { keyword: ' 测试 ', status: '1' },
      );

    expect(apiMocks.getCustomerListApi).toHaveBeenCalledWith({
      keyword: '测试',
      page: 2,
      page_size: 30,
      status: 1,
    });
    expect(result).toEqual({
      items: [{ id: 7 }],
      total: 1,
    });
  });
});
