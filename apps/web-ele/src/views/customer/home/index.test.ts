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
    storeMock.customer = {
      company_name: '测试公司',
      id: 8,
      phone: '13800000000',
      status: 1,
    };
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

  it('renders unknown status without treating it as disabled', async () => {
    storeMock.customer = {
      company_name: '状态异常客户',
      id: 9,
      phone: '13800000001',
      status: undefined,
    } as any;

    const view = await renderHome();

    expect(view.root.textContent).toContain('未知');
    expect(view.root.textContent).not.toContain('禁用');

    view.unmount();
  });
});
