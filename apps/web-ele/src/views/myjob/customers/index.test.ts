/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, inject, nextTick, provide } from 'vue';

import { ElMessageBox } from 'element-plus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CustomersPage from './index.vue';

const gridConfigState = vi.hoisted(() => ({
  latest: null as any,
  reload: vi.fn(),
  rowStatus: 1,
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
            status: gridConfigState.rowStatus,
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
  const dropdownCommandKey = Symbol('dropdown-command');
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
    props: {
      modelValue: {
        default: false,
        type: Boolean,
      },
    },
    emits: ['change'],
    setup(props, { attrs, emit }) {
      return () =>
        h(
          'button',
          {
            ...attrs,
            'data-test': 'status-switch',
            onClick: () => emit('change', !props.modelValue),
          },
          props.modelValue ? '启用' : '禁用',
        );
    },
  });
  const ElDropdown = defineComponent({
    name: 'ElDropdownStub',
    emits: ['command'],
    setup(_, { emit, slots }) {
      provide(dropdownCommandKey, (command: string) =>
        emit('command', command),
      );
      return () =>
        h('div', { 'data-test': 'customer-more-actions' }, [
          slots.default?.(),
          slots.dropdown?.(),
        ]);
    },
  });
  const ElDropdownMenu = defineComponent({
    name: 'ElDropdownMenuStub',
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    },
  });
  const ElDropdownItem = defineComponent({
    name: 'ElDropdownItemStub',
    props: {
      command: {
        required: true,
        type: String,
      },
    },
    setup(props, { attrs, slots }) {
      const dispatch = inject<(command: string) => void>(
        dropdownCommandKey,
        () => {},
      );
      return () =>
        h(
          'button',
          { ...attrs, onClick: () => dispatch(props.command) },
          slots.default?.(),
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
    ElDropdown,
    ElDropdownItem,
    ElDropdownMenu,
    ElMessage: { success: vi.fn() },
    ElMessageBox: { confirm: vi.fn().mockResolvedValue(undefined) },
    ElSwitch,
    ElTag,
  };
});

async function renderPage() {
  const root = document.createElement('div');
  const errors: unknown[] = [];
  document.body.append(root);
  const app = createApp(CustomersPage);
  app.config.errorHandler = (error) => {
    errors.push(error);
  };
  app.mount(root);
  await nextTick();
  return {
    errors,
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
    gridConfigState.rowStatus = 1;
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
    expect(view.root.textContent).toContain('更多');
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

  it('changes enabled customer status from the status switch', async () => {
    const view = await renderPage();
    mounted.push(view);

    const switchButton = view.root.querySelector('[data-test="status-switch"]');

    expect(switchButton).toBeTruthy();
    expect(switchButton?.getAttribute('aria-label')).toBe('禁用客户');
    switchButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flushPromises();

    expect(apiMocks.updateCustomerStatusApi).toHaveBeenCalledWith(7, 0);
    expect(gridConfigState.reload).toHaveBeenCalledTimes(1);
  });

  it('keeps row actions in one visible line', async () => {
    const view = await renderPage();
    mounted.push(view);

    const actionGroup = view.root.querySelector(
      '[data-test="customer-row-actions"]',
    );

    expect(actionGroup).toBeTruthy();
    const directButtons = [...(actionGroup?.children ?? [])]
      .filter((child) => child.tagName === 'BUTTON')
      .map((child) => child.textContent?.trim());

    expect(directButtons).toEqual(['详情', '编辑']);
    expect(actionGroup?.textContent).toContain('更多');
  });

  it('enables disabled customer from row action', async () => {
    gridConfigState.rowStatus = 0;
    const view = await renderPage();
    mounted.push(view);

    const switchButton = view.root.querySelector('[data-test="status-switch"]');

    expect(switchButton).toBeTruthy();
    expect(switchButton?.getAttribute('aria-label')).toBe('启用客户');
    switchButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flushPromises();

    expect(apiMocks.updateCustomerStatusApi).toHaveBeenCalledWith(7, 1);
    expect(gridConfigState.reload).toHaveBeenCalledTimes(1);
  });

  it('deletes customer after confirmation and reloads list', async () => {
    const view = await renderPage();
    mounted.push(view);

    clickButton(view.root, '删除');
    await flushPromises();

    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确认删除客户 测试客户 吗？删除后手机号仍会被占用。',
      '删除确认',
      { type: 'warning' },
    );
    expect(apiMocks.deleteCustomerApi).toHaveBeenCalledWith(7);
    expect(gridConfigState.reload).toHaveBeenCalledTimes(1);
  });

  it('does not delete or surface an error when delete confirmation is cancelled', async () => {
    vi.mocked(ElMessageBox.confirm).mockRejectedValueOnce(new Error('cancel'));
    const view = await renderPage();
    mounted.push(view);

    clickButton(view.root, '删除');
    await flushPromises();

    expect(apiMocks.deleteCustomerApi).not.toHaveBeenCalled();
    expect(gridConfigState.reload).not.toHaveBeenCalled();
    expect(view.errors).toEqual([]);
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
