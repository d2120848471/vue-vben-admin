/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import TemplatesPage from './index.vue';

const fixtures = vi.hoisted(() => ({
  rows: [
    {
      account_name: '即梦账号',
      created_at: '',
      id: 1,
      is_shared: 1,
      is_shared_label: '共享',
      title: '即梦ID',
      type: 'local',
      type_label: '本地模板',
      updated_at: '',
      validate_type: 6,
      validate_type_label: '纯数字',
    },
    {
      account_name: '手机号',
      created_at: '',
      id: 2,
      is_shared: 0,
      is_shared_label: '不共享',
      title: '手机号模板',
      type: 'local',
      type_label: '本地模板',
      updated_at: '',
      validate_type: 1,
      validate_type_label: '手机号',
    },
  ],
  validateTypes: [
    { id: 1, title: '手机号' },
    { id: 6, title: '纯数字' },
  ],
}));

const apiMocks = vi.hoisted(() => ({
  addProductTemplateApi: vi.fn(),
  batchDeleteProductTemplateApi: vi.fn(),
  deleteProductTemplateApi: vi.fn(),
  getProductTemplateListApi: vi.fn(),
  getProductTemplateValidateTypesApi: vi.fn(),
  updateProductTemplateApi: vi.fn(),
}));

const gridReloadMock = vi.hoisted(() => vi.fn());
const clearCheckboxReserveMock = vi.hoisted(() => vi.fn());
const clearCheckboxRowMock = vi.hoisted(() => vi.fn());
const testState = vi.hoisted(() => ({
  accessCodes: ['product.template'],
  reserveRows: [] as Array<{ id: number }>,
  selectedRows: [] as Array<{ id: number }>,
}));

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
    accessCodes: testState.accessCodes,
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
                h('div', { 'data-cell': 'actions' }, [
                  slots.actions?.({ row }),
                ]),
              ]),
            ),
          ]);
      },
    });

    return [
      Grid,
      {
        grid: {
          clearCheckboxReserve: clearCheckboxReserveMock,
          clearCheckboxRow: clearCheckboxRowMock,
          getCheckboxRecords: vi.fn(() => testState.selectedRows),
          getCheckboxReserveRecords: vi.fn(() => testState.reserveRows),
        },
        reload: gridReloadMock,
      },
    ];
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

  const ElForm = defineComponent({
    name: 'ElFormStub',
    setup(_, { expose, slots }) {
      expose({
        validate: vi.fn().mockResolvedValue(true),
      });
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
    emits: ['update:modelValue'],
    setup(props, { attrs, emit }) {
      return () =>
        h('input', {
          ...attrs,
          value: props.modelValue,
          onInput: (event: Event) =>
            emit('update:modelValue', (event.target as HTMLInputElement).value),
        });
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

  const ElSelect = defineComponent({
    name: 'ElSelectStub',
    props: {
      modelValue: {
        default: '',
        type: [Number, String],
      },
    },
    setup(props, { attrs, slots }) {
      return () =>
        h('div', { ...attrs, 'data-test': 'select' }, [
          h('div', { 'data-test': 'select-value' }, String(props.modelValue)),
          slots.default?.(),
        ]);
    },
  });

  return {
    ElButton,
    ElDialog,
    ElForm,
    ElFormItem,
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
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderPage() {
  const root = document.createElement('div');
  document.body.append(root);

  const app = createApp(TemplatesPage);
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

function findButton(root: HTMLElement, label: string) {
  const button = [...root.querySelectorAll('button')].find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  expect(button, `未找到 ${label} 按钮`).toBeTruthy();
  return button as HTMLButtonElement;
}

function findRowButton(root: HTMLElement, rowId: number, label: string) {
  const row = root.querySelector(`[data-row-id="${rowId}"]`);
  expect(row).toBeTruthy();
  if (!row) {
    throw new Error(`missing row ${rowId}`);
  }
  const button = [...row.querySelectorAll('button')].find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  expect(button, `未找到 ${label} 按钮`).toBeTruthy();
  return button as HTMLButtonElement;
}

function findInput(root: HTMLElement, selector: string) {
  const input = root.querySelector(selector);
  expect(input).toBeTruthy();
  return input as HTMLInputElement;
}

describe('product templates page', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    clearCheckboxReserveMock.mockReset();
    clearCheckboxRowMock.mockReset();
    gridReloadMock.mockReset();
    testState.accessCodes.splice(
      0,
      testState.accessCodes.length,
      'product.template',
    );
    testState.reserveRows = [];
    testState.selectedRows = [];
    apiMocks.getProductTemplateListApi.mockResolvedValue({
      list: fixtures.rows,
      pagination: { page: 1, page_size: 20, total: fixtures.rows.length },
    });
    apiMocks.getProductTemplateValidateTypesApi.mockResolvedValue({
      list: fixtures.validateTypes,
    });
  });

  afterEach(() => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('loads validate types when opening the create dialog', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    findButton(view.root, '添加').click();
    await flushPromises();
    await nextTick();

    expect(apiMocks.getProductTemplateValidateTypesApi).toHaveBeenCalledTimes(
      1,
    );
    expect(view.root.textContent).toContain('手机号');
    expect(view.root.textContent).toContain('纯数字');
  });

  it('creates a template with default local type and selected validate rule', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    findButton(view.root, '添加').click();
    await flushPromises();
    await nextTick();

    const titleInput = findInput(
      view.root,
      'input[data-test="template-title"]',
    );
    titleInput.value = '邮箱模板';
    titleInput.dispatchEvent(new Event('input'));

    const accountNameInput = findInput(
      view.root,
      'input[data-test="template-account-name"]',
    );
    accountNameInput.value = '邮箱账号';
    accountNameInput.dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.addProductTemplateApi).toHaveBeenCalledWith({
      account_name: '邮箱账号',
      is_shared: 0,
      title: '邮箱模板',
      type: 'local',
      validate_type: 1,
    });
    expect(gridReloadMock).toHaveBeenCalledTimes(1);
  });

  it('updates an existing template from the row payload', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    findRowButton(view.root, 1, '编辑').click();
    await flushPromises();
    await nextTick();

    const titleInput = findInput(
      view.root,
      'input[data-test="template-title"]',
    );
    titleInput.value = '即梦数字ID';
    titleInput.dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.updateProductTemplateApi).toHaveBeenCalledWith(1, {
      account_name: '即梦账号',
      is_shared: 1,
      title: '即梦数字ID',
      type: 'local',
      validate_type: 6,
    });
    expect(gridReloadMock).toHaveBeenCalledTimes(1);
  });

  it('deletes a template from the row actions', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    findRowButton(view.root, 2, '删除').click();
    await flushPromises();

    expect(apiMocks.deleteProductTemplateApi).toHaveBeenCalledWith(2);
    expect(gridReloadMock).toHaveBeenCalledTimes(1);
  });

  it('warns instead of batch deleting when nothing is selected', async () => {
    const { ElMessage } = await import('element-plus');
    const view = await renderPage();
    mountedRoots.push(view);

    findButton(view.root, '批量删除').click();
    await flushPromises();

    expect(ElMessage.warning).toHaveBeenCalledWith('请先选择充值模板');
    expect(apiMocks.batchDeleteProductTemplateApi).not.toHaveBeenCalled();
  });

  it('batch deletes selected rows', async () => {
    testState.selectedRows = [{ id: 1 }, { id: 2 }];
    const view = await renderPage();
    mountedRoots.push(view);

    findButton(view.root, '批量删除').click();
    await flushPromises();

    expect(apiMocks.batchDeleteProductTemplateApi).toHaveBeenCalledWith([1, 2]);
    expect(gridReloadMock).toHaveBeenCalledTimes(1);
  });

  it('batch deletes reserve rows from other pages as well', async () => {
    testState.selectedRows = [{ id: 1 }];
    testState.reserveRows = [{ id: 2 }, { id: 1 }];
    const view = await renderPage();
    mountedRoots.push(view);

    findButton(view.root, '批量删除').click();
    await flushPromises();

    expect(apiMocks.batchDeleteProductTemplateApi).toHaveBeenCalledWith([1, 2]);
    expect(clearCheckboxReserveMock).toHaveBeenCalledTimes(1);
    expect(clearCheckboxRowMock).toHaveBeenCalledTimes(1);
  });

  it('shows an error and keeps the create dialog closed when validate types fail', async () => {
    const { ElMessage } = await import('element-plus');
    apiMocks.getProductTemplateValidateTypesApi.mockRejectedValueOnce(
      new Error('load failed'),
    );
    const view = await renderPage();
    mountedRoots.push(view);

    findButton(view.root, '添加').click();
    await flushPromises();
    await nextTick();

    expect(ElMessage.error).toHaveBeenCalledWith(
      '验证方式加载失败，请稍后重试',
    );
    expect(view.root.querySelector('[data-test="dialog"]')).toBeNull();
  });

  it('shows an error and keeps the edit dialog closed when validate types fail', async () => {
    const { ElMessage } = await import('element-plus');
    apiMocks.getProductTemplateValidateTypesApi.mockRejectedValueOnce(
      new Error('load failed'),
    );
    const view = await renderPage();
    mountedRoots.push(view);

    findRowButton(view.root, 1, '编辑').click();
    await flushPromises();
    await nextTick();

    expect(ElMessage.error).toHaveBeenCalledWith(
      '验证方式加载失败，请稍后重试',
    );
    expect(view.root.querySelector('[data-test="dialog"]')).toBeNull();
  });

  it('hides management actions without product.template permission', async () => {
    testState.accessCodes.splice(0);
    const view = await renderPage();
    mountedRoots.push(view);

    expect(view.root.textContent).not.toContain('添加');
    expect(view.root.textContent).not.toContain('批量删除');
    expect(view.root.textContent).not.toContain('编辑');
    expect(view.root.textContent).not.toContain('删除');
  });
});
