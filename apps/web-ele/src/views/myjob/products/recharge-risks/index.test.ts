/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RechargeRiskPage from './index.vue';

const gridConfigs = vi.hoisted(() => [] as any[]);
const reloadMocks = vi.hoisted(() => [] as any[]);

const apiMocks = vi.hoisted(() => ({
  deleteRechargeRiskRuleApi: vi.fn(),
  getRechargeRiskRecordListApi: vi.fn(),
  getRechargeRiskRuleListApi: vi.fn(),
  updateRechargeRiskRuleStatusApi: vi.fn(),
}));

const accessState = vi.hoisted(() => ({
  codes: ['order.recharge_risk'] as string[],
}));

vi.mock('@vben/common-ui', () => ({
  Page: defineComponent({
    name: 'PageStub',
    setup(_, { slots }) {
      return () => h('main', slots.default?.());
    },
  }),
}));

vi.mock('@vben/stores', () => ({
  useAccessStore: () => ({ accessCodes: accessState.codes }),
}));

vi.mock('#/adapter/vxe-table', () => ({
  useVbenVxeGrid: (config: any) => {
    const index = gridConfigs.length;
    gridConfigs.push(config);
    const reload = vi.fn();
    reloadMocks.push(reload);
    return [
      defineComponent({
        name: `GridStub${index}`,
        setup(_, { slots }) {
          return () =>
            h('section', { 'data-test': `grid-${index}` }, [
              slots['toolbar-actions']?.(),
              slots.status?.({
                row: {
                  id: 41,
                  status: 1,
                  status_text: '启用',
                },
              }),
              slots.actions?.({
                row: {
                  account: 'risk-account-001',
                  goods_keyword: '剪映',
                  id: 41,
                  reason: '错误账号',
                  status: 1,
                },
              }),
            ]);
        },
      }),
      { reload },
    ];
  },
}));

vi.mock('#/api/modules/admin/products/recharge-risks', () => apiMocks);

vi.mock('./components/RechargeRiskRuleDialog.vue', () => ({
  default: defineComponent({
    name: 'RechargeRiskRuleDialogStub',
    props: {
      visible: { default: false, type: Boolean },
    },
    setup(props) {
      return () =>
        props.visible ? h('div', { 'data-test': 'risk-dialog' }) : null;
    },
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
    props: { modelValue: { default: 1, type: Number } },
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

  const ElTabs = defineComponent({
    name: 'ElTabsStub',
    props: { modelValue: { default: '', type: String } },
    emits: ['update:modelValue'],
    setup(props, { emit, slots }) {
      return () =>
        h('div', { 'data-active-tab': props.modelValue, 'data-test': 'tabs' }, [
          h(
            'button',
            {
              'data-test': 'tab-rules',
              onClick: () => emit('update:modelValue', 'rules'),
            },
            '风控管理',
          ),
          h(
            'button',
            {
              'data-test': 'tab-records',
              onClick: () => emit('update:modelValue', 'records'),
            },
            '风控记录',
          ),
          slots.default?.(),
        ]);
    },
  });

  const ElTabPane = defineComponent({
    name: 'ElTabPaneStub',
    props: {
      label: { default: '', type: String },
      name: { default: '', type: String },
    },
    setup(props, { slots }) {
      return () =>
        h('section', { 'data-tab': props.name }, [
          h('h3', props.label),
          slots.default?.(),
        ]);
    },
  });

  return {
    ElButton,
    ElMessage: { success: vi.fn() },
    ElMessageBox: { confirm: vi.fn().mockResolvedValue(undefined) },
    ElSwitch,
    ElTabPane,
    ElTabs,
  };
});

async function renderPage() {
  const root = document.createElement('div');
  document.body.append(root);
  const app = createApp(RechargeRiskPage);
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

describe('RechargeRiskPage', () => {
  const mounted: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    gridConfigs.length = 0;
    reloadMocks.length = 0;
    accessState.codes = ['order.recharge_risk'];
    apiMocks.getRechargeRiskRuleListApi.mockResolvedValue({
      list: [],
      pagination: { total: 0 },
    });
    apiMocks.getRechargeRiskRecordListApi.mockResolvedValue({
      list: [],
      pagination: { total: 0 },
    });
    apiMocks.updateRechargeRiskRuleStatusApi.mockResolvedValue(undefined);
    apiMocks.deleteRechargeRiskRuleApi.mockResolvedValue(undefined);
  });

  afterEach(() => {
    while (mounted.length > 0) {
      mounted.pop()?.unmount();
    }
  });

  it('configures rule and record grids', async () => {
    const view = await renderPage();
    mounted.push(view);

    expect(view.root.textContent).toContain('风控管理');
    expect(view.root.textContent).toContain('风控记录');
    expect(gridConfigs).toHaveLength(2);
    expect(
      (view.root.querySelector('[data-test="tabs"]') as HTMLElement | null)
        ?.dataset.activeTab,
    ).toBe('rules');
    expect(view.root.querySelector('[data-test="grid-0"]')).toBeTruthy();
    expect(view.root.querySelector('[data-test="grid-1"]')).toBeFalsy();

    view.root
      .querySelector('[data-test="tab-records"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();
    expect(
      (view.root.querySelector('[data-test="tabs"]') as HTMLElement | null)
        ?.dataset.activeTab,
    ).toBe('records');
    expect(view.root.querySelector('[data-test="grid-1"]')).toBeTruthy();

    await gridConfigs[0].gridOptions.proxyConfig.ajax.query(
      { page: { currentPage: 2, pageSize: 30 } },
      { account: ' risk-account-001 ', goods_keyword: ' 剪映 ', status: '1' },
    );
    expect(apiMocks.getRechargeRiskRuleListApi).toHaveBeenCalledWith({
      account: 'risk-account-001',
      goods_keyword: '剪映',
      page: 2,
      page_size: 30,
      status: '1',
    });

    await gridConfigs[1].gridOptions.proxyConfig.ajax.query(
      { page: { currentPage: 1, pageSize: 20 } },
      {
        account: ' risk-account-001 ',
        date_range: ['2026-04-27 00:00:00', '2026-04-27 23:59:59'],
        goods_keyword: ' 微博 ',
      },
    );
    expect(apiMocks.getRechargeRiskRecordListApi).toHaveBeenCalledWith({
      account: 'risk-account-001',
      end_time: '2026-04-27 23:59:59',
      goods_keyword: '微博',
      page: 1,
      page_size: 20,
      start_time: '2026-04-27 00:00:00',
    });
  });

  it('opens create dialog and performs row actions with permission', async () => {
    const view = await renderPage();
    mounted.push(view);

    const buttons = [...view.root.querySelectorAll('button')];
    buttons.find((button) => button.textContent?.trim() === '新增')?.click();
    await nextTick();
    expect(view.root.querySelector('[data-test="risk-dialog"]')).toBeTruthy();

    view.root
      .querySelector('[data-test="status-switch"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flushPromises();
    expect(apiMocks.updateRechargeRiskRuleStatusApi).toHaveBeenCalledWith(
      41,
      0,
    );

    buttons.find((button) => button.textContent?.trim() === '删除')?.click();
    await flushPromises();
    expect(apiMocks.deleteRechargeRiskRuleApi).toHaveBeenCalledWith(41);
  });

  it('guards duplicate status changes while request and reload are pending', async () => {
    let resolveStatus!: () => void;
    let resolveReload!: () => void;
    apiMocks.updateRechargeRiskRuleStatusApi.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveStatus = resolve;
      }),
    );

    const view = await renderPage();
    mounted.push(view);
    reloadMocks[0].mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveReload = resolve;
      }),
    );

    const switchButton = view.root.querySelector('[data-test="status-switch"]');
    switchButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    switchButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(apiMocks.updateRechargeRiskRuleStatusApi).toHaveBeenCalledTimes(1);

    resolveStatus();
    await flushPromises();
    expect(reloadMocks[0]).toHaveBeenCalledTimes(1);

    resolveReload();
    await flushPromises();
  });

  it('hides management actions without permission', async () => {
    accessState.codes = [];
    const view = await renderPage();
    mounted.push(view);

    expect(view.root.textContent).not.toContain('新增');
    expect(view.root.textContent).not.toContain('编辑');
    expect(view.root.textContent).not.toContain('删除');
    expect(view.root.textContent).toContain('启用');
  });
});
