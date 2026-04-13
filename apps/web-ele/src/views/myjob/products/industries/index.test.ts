/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import IndustriesPage from './index.vue';

const fixtures = vi.hoisted(() => ({
  rows: [
    {
      brand_count: 1,
      created_at: '',
      id: 1,
      name: '视频娱乐',
      sort: 1,
      updated_at: '',
    },
    {
      brand_count: 0,
      created_at: '',
      id: 2,
      name: '音频娱乐',
      sort: 2,
      updated_at: '',
    },
  ],
}));

const apiMocks = vi.hoisted(() => ({
  addIndustryApi: vi.fn(),
  addIndustryRelationBrandsApi: vi.fn(),
  deleteIndustryApi: vi.fn(),
  deleteIndustryRelationBrandsApi: vi.fn(),
  getBrandSelectorApi: vi.fn(),
  getIndustryListApi: vi.fn(),
  getIndustryRelationBrandsApi: vi.fn(),
  sortIndustryApi: vi.fn(),
  sortIndustryRelationBrandApi: vi.fn(),
  updateIndustryApi: vi.fn(),
}));

const gridReloadMock = vi.hoisted(() => vi.fn());

vi.mock('#/api', () => apiMocks);

vi.mock('@vben/common-ui', () => ({
  Page: defineComponent({
    name: 'PageStub',
    setup(_, { slots }) {
      return () => h('div', { 'data-test': 'page' }, slots.default?.());
    },
  }),
}));

vi.mock('@vben/stores', () => ({
  useAccessStore: () => ({
    accessCodes: ['product.industry'],
  }),
}));

vi.mock('@vben/icons', () => ({
  createIconifyIcon: (name: string) =>
    defineComponent({
      name: `IconStub-${name}`,
      setup() {
        return () => h('span', { 'data-test-icon': name });
      },
    }),
}));

vi.mock('#/adapter/vxe-table', () => ({
  useVbenVxeGrid: () => {
    const Grid = defineComponent({
      name: 'GridStub',
      setup(_, { slots }) {
        return () =>
          h('div', { 'data-test': 'grid' }, [
            slots['toolbar-actions']?.(),
            ...fixtures.rows.map((row) =>
              h('div', { 'data-row-id': String(row.id) }, [
                h('div', { 'data-cell': 'sort-actions' }, [
                  slots.sortActions?.({ row }),
                ]),
                h('div', { 'data-cell': 'manage-actions' }, [
                  slots.manageActions?.({ row }),
                ]),
                h('div', { 'data-cell': 'actions' }, [
                  slots.actions?.({ row }),
                ]),
              ]),
            ),
          ]);
      },
    });

    return [Grid, { reload: gridReloadMock }];
  },
}));

vi.mock('element-plus', () => {
  const ElButton = defineComponent({
    name: 'ElButtonStub',
    emits: ['click'],
    setup(_, { attrs, emit, slots }) {
      return () =>
        h(
          'button',
          {
            ...attrs,
            onClick: (event: Event) => emit('click', event),
          },
          slots.default?.(),
        );
    },
  });

  const ElDialog = defineComponent({
    name: 'ElDialogStub',
    props: {
      modelValue: Boolean,
      title: {
        default: '',
        type: String,
      },
    },
    emits: ['update:modelValue'],
    setup(props, { emit, slots }) {
      return () =>
        props.modelValue
          ? h('section', { 'data-test': 'dialog' }, [
              h('h2', props.title),
              slots.default?.(),
              slots.footer?.(),
              h(
                'button',
                {
                  'data-test': 'dialog-close',
                  onClick: () => emit('update:modelValue', false),
                },
                'close',
              ),
            ])
          : null;
    },
  });

  const ElDrawer = defineComponent({
    name: 'ElDrawerStub',
    props: {
      modelValue: Boolean,
      title: {
        default: '',
        type: String,
      },
    },
    emits: ['update:modelValue'],
    setup(props, { emit, slots }) {
      return () =>
        props.modelValue
          ? h('section', { 'data-test': 'drawer' }, [
              h('h2', props.title),
              slots.default?.(),
              h(
                'button',
                {
                  'data-test': 'drawer-close',
                  onClick: () => emit('update:modelValue', false),
                },
                'close',
              ),
            ])
          : null;
    },
  });

  const ElForm = defineComponent({
    name: 'ElFormStub',
    setup(_, { slots }) {
      return () => h('form', slots.default?.());
    },
  });

  const ElFormItem = defineComponent({
    name: 'ElFormItemStub',
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    },
  });

  const ElInput = defineComponent({
    name: 'ElInputStub',
    props: {
      modelValue: {
        default: '',
        type: String,
      },
    },
    emits: ['update:modelValue', 'keyup.enter'],
    setup(props, { emit }) {
      return () =>
        h('input', {
          value: props.modelValue,
          onInput: (event: Event) =>
            emit('update:modelValue', (event.target as HTMLInputElement).value),
        });
    },
  });

  const ElSelect = defineComponent({
    name: 'ElSelectStub',
    props: {
      modelValue: {
        default: () => [],
        type: [Array, Number, String],
      },
    },
    setup(props, { slots }) {
      return () =>
        h('div', { 'data-test': 'select' }, [
          h(
            'div',
            { 'data-test': 'select-value' },
            JSON.stringify(props.modelValue),
          ),
          slots.default?.(),
        ]);
    },
  });

  const ElOption = defineComponent({
    name: 'ElOptionStub',
    props: {
      label: {
        default: '',
        type: String,
      },
      value: {
        default: '',
        type: [Number, String],
      },
    },
    setup(props) {
      return () =>
        h(
          'div',
          {
            'data-test': 'select-option',
            'data-value': String(props.value),
          },
          props.label,
        );
    },
  });

  const ElTag = defineComponent({
    name: 'ElTagStub',
    setup(_, { slots }) {
      return () => h('span', slots.default?.());
    },
  });

  const ElTooltip = defineComponent({
    name: 'ElTooltipStub',
    props: {
      content: {
        default: '',
        type: String,
      },
    },
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    },
  });

  const ElImage = defineComponent({
    name: 'ElImageStub',
    setup() {
      return () => h('img');
    },
  });

  const ElEmpty = defineComponent({
    name: 'ElEmptyStub',
    props: {
      description: {
        default: '',
        type: String,
      },
    },
    setup(props) {
      return () => h('div', props.description);
    },
  });

  return {
    ElButton,
    ElDialog,
    ElDrawer,
    ElEmpty,
    ElForm,
    ElFormItem,
    ElImage,
    ElInput,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue(undefined),
    },
    ElOption,
    ElSelect,
    ElTag,
    ElTooltip,
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderPage() {
  const root = document.createElement('div');
  document.body.append(root);

  const app = createApp(IndustriesPage);
  app.directive('loading', {});
  app.config.errorHandler = () => {};
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

function findRowButton(root: HTMLElement, rowId: number, label: string) {
  const row = root.querySelector(`[data-row-id="${rowId}"]`);
  expect(row).toBeTruthy();
  if (!row) {
    throw new Error(`missing row ${rowId}`);
  }

  const button = [...row.querySelectorAll('button')].find(
    (candidate) =>
      candidate.textContent?.trim() === label ||
      candidate.getAttribute('title') === label,
  );
  expect(button, `未找到 ${label} 按钮`).toBeTruthy();
  return button as HTMLButtonElement;
}

function findButton(root: HTMLElement, label: string) {
  const button = [...root.querySelectorAll('button')].find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  expect(button, `未找到 ${label} 按钮`).toBeTruthy();
  return button as HTMLButtonElement;
}

function findButtonByTitle(root: HTMLElement, title: string) {
  const button = [...root.querySelectorAll('button')].find(
    (candidate) => candidate.getAttribute('title') === title,
  );
  expect(button, `未找到 ${title} 图标按钮`).toBeTruthy();
  return button as HTMLButtonElement;
}

describe('industries page', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    gridReloadMock.mockReset();
    apiMocks.getBrandSelectorApi.mockResolvedValue({ list: [] });
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('renders selector options in the create dialog from brand-selector results', async () => {
    apiMocks.getBrandSelectorApi.mockResolvedValueOnce({
      list: [{ icon: '', id: 101, name: '腾讯视频' }],
    });

    const view = await renderPage();
    mountedRoots.push(view);

    findButton(view.root, '新增行业').click();
    await flushPromises();
    await nextTick();

    expect(view.root.textContent).toContain('腾讯视频');
  });

  it('renders selector options in the relation drawer from brand-selector results', async () => {
    apiMocks.getBrandSelectorApi.mockResolvedValueOnce({
      list: [{ icon: '', id: 202, name: '优酷视频' }],
    });
    apiMocks.getIndustryRelationBrandsApi.mockResolvedValueOnce({ list: [] });

    const view = await renderPage();
    mountedRoots.push(view);

    findRowButton(view.root, 1, '关联品牌').click();
    await flushPromises();
    await nextTick();

    expect(view.root.textContent).toContain('优酷视频');
  });

  it('renders list row actions as icon buttons with split sort and manage groups', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    const row = view.root.querySelector('[data-row-id="1"]');
    expect(row).toBeTruthy();
    if (!row) {
      throw new Error('missing row 1');
    }

    expect(
      row.querySelector('[data-cell="sort-actions"] button[title="置顶"]'),
    ).toBeTruthy();
    expect(
      row.querySelector('[data-cell="sort-actions"] button[title="下移"]'),
    ).toBeTruthy();
    expect(
      row.querySelector('[data-cell="manage-actions"] button[title="编辑"]'),
    ).toBeTruthy();
    expect(
      row.querySelector(
        '[data-cell="manage-actions"] button[title="关联品牌"]',
      ),
    ).toBeTruthy();
  });

  it('renders relation drawer actions as icon buttons', async () => {
    apiMocks.getIndustryRelationBrandsApi.mockResolvedValueOnce({
      list: [
        {
          brand_icon: '',
          brand_id: 201,
          brand_name: '爱奇艺',
          id: 9,
          sort: 1,
        },
      ],
    });

    const view = await renderPage();
    mountedRoots.push(view);

    findRowButton(view.root, 1, '关联品牌').click();
    await flushPromises();
    await nextTick();

    expect(findButtonByTitle(view.root, '置顶')).toBeTruthy();
    expect(findButtonByTitle(view.root, '下移')).toBeTruthy();
    expect(findButtonByTitle(view.root, '移除')).toBeTruthy();
  });

  it('keeps the edit dialog closed when loading a different industry fails', async () => {
    apiMocks.getIndustryRelationBrandsApi
      .mockResolvedValueOnce({
        list: [
          {
            brand_icon: '',
            brand_id: 101,
            brand_name: '腾讯视频',
            id: 1,
            sort: 1,
          },
        ],
      })
      .mockRejectedValueOnce(new Error('load industry brands failed'));

    const view = await renderPage();
    mountedRoots.push(view);

    findRowButton(view.root, 1, '编辑').click();
    await flushPromises();
    await nextTick();
    expect(view.root.querySelector('[data-test="dialog"]')).toBeTruthy();

    (
      view.root.querySelector('[data-test="dialog-close"]') as HTMLButtonElement
    ).click();
    await nextTick();
    findRowButton(view.root, 2, '编辑').click();
    await flushPromises();
    await nextTick();

    expect(view.root.querySelector('[data-test="dialog"]')).toBeNull();
    expect(view.root.textContent).not.toContain('腾讯视频');
  });

  it('keeps the relation drawer closed when loading a different industry fails', async () => {
    apiMocks.getIndustryRelationBrandsApi
      .mockResolvedValueOnce({
        list: [
          {
            brand_icon: '',
            brand_id: 201,
            brand_name: '爱奇艺',
            id: 9,
            sort: 1,
          },
        ],
      })
      .mockRejectedValueOnce(new Error('load relation drawer failed'));

    const view = await renderPage();
    mountedRoots.push(view);

    findRowButton(view.root, 1, '关联品牌').click();
    await flushPromises();
    await nextTick();
    expect(view.root.querySelector('[data-test="drawer"]')).toBeTruthy();
    expect(view.root.textContent).toContain('爱奇艺');

    (
      view.root.querySelector('[data-test="drawer-close"]') as HTMLButtonElement
    ).click();
    await nextTick();
    findRowButton(view.root, 2, '关联品牌').click();
    await flushPromises();
    await nextTick();

    expect(view.root.querySelector('[data-test="drawer"]')).toBeNull();
    expect(view.root.textContent).not.toContain('爱奇艺');
  });
});
