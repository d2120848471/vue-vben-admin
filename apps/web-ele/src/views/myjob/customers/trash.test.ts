/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CustomerTrashPage from './trash.vue';

const gridConfigState = vi.hoisted(() => ({
  latest: null as any,
  reload: vi.fn(),
}));

const apiMocks = vi.hoisted(() => ({
  getCustomerTrashApi: vi.fn(),
  restoreCustomerApi: vi.fn(),
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
        name: 'CustomerTrashGridStub',
        setup(_, { slots }) {
          const row = {
            company_name: '回收客户',
            id: 8,
            phone: '13800000001',
            status: 1,
          };
          return () =>
            h('section', { 'data-test': 'customer-trash-grid' }, [
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
    ElTag,
  };
});

async function renderPage() {
  const root = document.createElement('div');
  document.body.append(root);
  const app = createApp(CustomerTrashPage);
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

describe('CustomerTrashPage', () => {
  const mounted: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    gridConfigState.latest = null;
    apiMocks.getCustomerTrashApi.mockResolvedValue({
      list: [],
      pagination: { total: 0 },
    });
  });

  afterEach(() => {
    while (mounted.length > 0) {
      mounted.pop()?.unmount();
    }
  });

  it('queries trash list and only renders restore action', async () => {
    const view = await renderPage();
    mounted.push(view);

    expect(
      view.root.querySelector('[data-test="customer-trash-grid"]'),
    ).toBeTruthy();
    expect(view.root.textContent).toContain('恢复');
    expect(view.root.textContent).not.toContain('编辑');
    expect(view.root.textContent).not.toContain('禁用');
    expect(view.root.textContent).not.toContain('重置登录密码');
    expect(view.root.textContent).not.toContain('重置支付密码');

    await gridConfigState.latest.gridOptions.proxyConfig.ajax.query(
      { page: { currentPage: 1, pageSize: 20 } },
      { keyword: ' 回收 ' },
    );
    expect(apiMocks.getCustomerTrashApi).toHaveBeenCalledWith({
      keyword: '回收',
      page: 1,
      page_size: 20,
    });
  });
});
