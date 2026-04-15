/* eslint-disable vue/one-component-per-file */

import {
  createApp,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  toRaw,
} from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BrandsPage from './index.vue';

const fixtures = vi.hoisted(() => ({
  listResult: {
    list: [
      {
        children: [
          {
            children: [
              {
                children: [],
                created_at: '',
                credential_image: '',
                description: '',
                goods_count: 6,
                has_children: false,
                icon: '',
                id: 3,
                is_visible: 1,
                name: '连续包月',
                parent_id: 2,
                sort: 1,
                updated_at: '',
              },
            ],
            created_at: '',
            credential_image: '',
            description: '',
            goods_count: 18,
            has_children: true,
            icon: '',
            id: 2,
            is_visible: 1,
            name: 'VIP月卡',
            parent_id: 1,
            sort: 1,
            updated_at: '',
          },
        ],
        created_at: '',
        credential_image: '',
        description: '腾讯视频会员主品牌',
        goods_count: 62,
        has_children: true,
        icon: '/uploads/brands/tencent.png',
        id: 1,
        is_visible: 1,
        name: '腾讯视频',
        parent_id: 0,
        sort: 1,
        updated_at: '',
      },
      {
        children: [],
        created_at: '',
        credential_image: '',
        description: '爱奇艺视频业务',
        goods_count: 28,
        has_children: false,
        icon: '/uploads/brands/iqiyi.png',
        id: 4,
        is_visible: 1,
        name: '爱奇艺',
        parent_id: 0,
        sort: 2,
        updated_at: '',
      },
    ],
    pagination: {
      total: 2,
    },
  },
}));

const apiMocks = vi.hoisted(() => ({
  addBrandApi: vi.fn(),
  deleteBrandApi: vi.fn(),
  getBrandChildrenApi: vi.fn(),
  getBrandListApi: vi.fn(),
  sortBrandApi: vi.fn(),
  toggleBrandVisibilityApi: vi.fn(),
  updateBrandApi: vi.fn(),
  uploadBrandImageApi: vi.fn(),
}));

const gridReloadMock = vi.hoisted(() => vi.fn());

function cloneRows<T>(value: T): T {
  return structuredClone(toRaw(value));
}

vi.mock('#/api/modules/admin/products/brands', () => apiMocks);

vi.mock('@vben/common-ui', () => ({
  Page: defineComponent({
    name: 'PageStub',
    setup(_, { slots }) {
      return () => h('div', { 'data-test': 'page' }, slots.default?.());
    },
  }),
}));

vi.mock('@vben/hooks', () => ({
  useAppConfig: () => ({
    apiURL: 'http://127.0.0.1:8080/api',
  }),
}));

vi.mock('@vben/stores', () => ({
  useAccessStore: () => ({
    accessCodes: ['product.brand'],
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
  useVbenVxeGrid: (config: Record<string, any>) => {
    const rows = ref<any[]>([]);
    const expandedIds = ref<number[]>([]);

    const findCurrentRow = (items: any[], rowId: number): any | null => {
      for (const item of items) {
        if (item.id === rowId) {
          return item;
        }
        const childRow = findCurrentRow(item.children ?? [], rowId);
        if (childRow) {
          return childRow;
        }
      }
      return null;
    };

    const collectExpandedIds = (items: any[]): number[] =>
      items.flatMap((item) => [
        ...(item.children?.length ? [item.id] : []),
        ...collectExpandedIds(item.children ?? []),
      ]);

    const isExpanded = (row: any) => expandedIds.value.includes(row.id);
    const grid = {
      commitProxy: vi.fn(
        async (_action: string, formValues?: Record<string, any>) => {
          const result = await config.gridOptions.proxyConfig.ajax.query(
            { page: { currentPage: 1, pageSize: 20 } },
            formValues ?? {},
          );
          const nextRows = cloneRows(result.items ?? []);
          const firstSourceRow = (result.items ?? [])[0];
          if (firstSourceRow && config.gridOptions.treeConfig?.loadMethod) {
            const childRows = await config.gridOptions.treeConfig.loadMethod({
              row: firstSourceRow,
            });
            if (nextRows[0]) {
              nextRows[0].children = cloneRows(childRows);
            }
          }
          rows.value = nextRows;
          expandedIds.value = collectExpandedIds(nextRows);
        },
      ),
      getRowById: vi.fn((rowId: number) => findCurrentRow(rows.value, rowId)),
      getTreeExpandRecords: vi.fn(() =>
        expandedIds.value
          .map((rowId) => findCurrentRow(rows.value, rowId))
          .filter(Boolean),
      ),
      isTreeExpandByRow: vi.fn((row: any) => isExpanded(row)),
      loadTreeChildren: vi.fn(async (_row: any, childRows: any[]) => {
        return childRows;
      }),
      reloadData: vi.fn(async (datas: any[]) => {
        rows.value = cloneRows(datas);
        expandedIds.value = [];
      }),
      setTreeExpand: vi.fn(async (row: any, expanded: boolean) => {
        const currentRow = findCurrentRow(rows.value, row.id);
        if (!currentRow) {
          return;
        }
        if (
          expanded &&
          currentRow.has_children &&
          config.gridOptions.treeConfig?.loadMethod
        ) {
          const childRows = await config.gridOptions.treeConfig.loadMethod({
            row: currentRow,
          });
          const patchChildren = (items: any[]): any[] =>
            items.map((item) => {
              if (item.id === currentRow.id) {
                return {
                  ...item,
                  children: cloneRows(childRows),
                };
              }
              return {
                ...item,
                children: patchChildren(item.children ?? []),
              };
            });
          rows.value = patchChildren(rows.value);
        }
        const ids = new Set(expandedIds.value);
        if (expanded) {
          ids.add(currentRow.id);
        } else {
          ids.delete(currentRow.id);
        }
        expandedIds.value = [...ids];
      }),
    };

    const flattenRows = (
      items: any[],
      level = 0,
    ): Array<{ level: number; row: any }> =>
      items.flatMap((item) => [
        { level, row: item },
        ...(isExpanded(item)
          ? flattenRows(item.children ?? [], level + 1)
          : []),
      ]);

    const Grid = defineComponent({
      name: 'GridStub',
      setup(_, { slots }) {
        onMounted(async () => {
          await grid.commitProxy('query', {});
        });

        return () =>
          h('div', { 'data-test': 'grid' }, [
            slots['toolbar-actions']?.(),
            ...flattenRows(rows.value).map(({ row, level }) => {
              const rowClassName =
                config.gridOptions.rowClassName?.({ row }) ?? '';
              return h(
                'div',
                {
                  class: rowClassName,
                  key: row.id,
                  'data-row-id': String(row.id),
                  'data-row-level': String(level),
                },
                [
                  h(
                    'div',
                    { 'data-cell': 'name' },
                    slots.name?.({ row, level }),
                  ),
                  h(
                    'div',
                    { 'data-cell': 'sort-actions' },
                    slots.sortActions?.({ row }),
                  ),
                  h(
                    'div',
                    { 'data-cell': 'manage-actions' },
                    slots.manageActions?.({ row }),
                  ),
                ],
              );
            }),
          ]);
      },
    });

    return [Grid, { grid, reload: gridReloadMock }];
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

  const ElImage = defineComponent({
    name: 'ElImageStub',
    props: {
      src: {
        default: '',
        type: String,
      },
    },
    setup(props) {
      return () => h('img', { src: props.src });
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
    setup(props, { emit }) {
      return () =>
        h('input', {
          value: props.modelValue,
          onInput: (event: Event) =>
            emit('update:modelValue', (event.target as HTMLInputElement).value),
        });
    },
  });

  const ElSwitch = defineComponent({
    name: 'ElSwitchStub',
    props: {
      disabled: Boolean,
      modelValue: {
        default: false,
        type: [Boolean, Number],
      },
    },
    emits: ['change', 'update:modelValue'],
    setup(props, { emit }) {
      return () =>
        h('input', {
          checked: props.modelValue,
          disabled: props.disabled,
          type: 'checkbox',
          onChange: (event: Event) => {
            const value = (event.target as HTMLInputElement).checked;
            emit('update:modelValue', value);
            emit('change', value);
          },
        });
    },
  });

  const ElTag = defineComponent({
    name: 'ElTagStub',
    setup(_, { attrs, slots }) {
      return () => h('span', attrs, slots.default?.());
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

  const ElUpload = defineComponent({
    name: 'ElUploadStub',
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    },
  });

  return {
    ElButton,
    ElDialog,
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
    ElSwitch,
    ElTag,
    ElTooltip,
    ElUpload,
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function flushUi() {
  for (const _ of [0, 1, 2, 3]) {
    await flushPromises();
    await nextTick();
  }
}

async function renderPage() {
  const root = document.createElement('div');
  document.body.append(root);

  const app = createApp(BrandsPage);
  app.directive('loading', {});
  app.config.errorHandler = () => {};
  app.mount(root);
  await flushPromises();
  await nextTick();

  return {
    root,
    unmount() {
      app.unmount();
      root.remove();
    },
  };
}

function findRow(root: HTMLElement, rowId: number) {
  const row = root.querySelector(`[data-row-id="${rowId}"]`);
  expect(row, `未找到行 ${rowId}`).toBeTruthy();
  if (!row) {
    throw new Error(`missing row ${rowId}`);
  }
  return row as HTMLElement;
}

function findButtonByTooltip(row: HTMLElement, tooltip: string) {
  const button = [...row.querySelectorAll('button')].find(
    (candidate) => candidate.getAttribute('title') === tooltip,
  );
  expect(button, `未找到 ${tooltip} 图标按钮`).toBeTruthy();
  if (!button) {
    throw new Error(`missing ${tooltip} button`);
  }
  return button as HTMLButtonElement;
}

describe('brands page', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    gridReloadMock.mockReset();
    apiMocks.getBrandListApi.mockResolvedValue(
      structuredClone(fixtures.listResult),
    );
    apiMocks.getBrandChildrenApi.mockResolvedValue({
      list: cloneRows(fixtures.listResult.list[0]?.children ?? []),
    });
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('renders root rows as grouped headers and descendants with nested depth markers', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    const rootRow = findRow(view.root, 1);
    expect(rootRow.className).toContain('myjob-brand-row--root');
    expect(rootRow.querySelector('[data-brand-depth="1"]')).toBeTruthy();
    expect(rootRow.textContent).toContain('一级品牌');

    const childRow = findRow(view.root, 2);
    expect(childRow.querySelector('[data-brand-depth="2"]')).toBeTruthy();
    expect(childRow.textContent).toContain('二级品牌');

    const grandChildRow = findRow(view.root, 3);
    expect(grandChildRow.querySelector('[data-brand-depth="3"]')).toBeTruthy();
    expect(grandChildRow.textContent).toContain('三级品牌');
  });

  it('shows add-child icons for root and secondary rows only', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    const rootRow = findRow(view.root, 1);
    expect(findButtonByTooltip(rootRow, '新增二级')).toBeTruthy();
    expect(findButtonByTooltip(rootRow, '编辑')).toBeTruthy();
    expect(findButtonByTooltip(rootRow, '删除')).toBeTruthy();

    const childRow = findRow(view.root, 2);
    expect(findButtonByTooltip(childRow, '新增三级')).toBeTruthy();
    expect(findButtonByTooltip(childRow, '编辑')).toBeTruthy();
    expect(findButtonByTooltip(childRow, '删除')).toBeTruthy();

    const grandChildRow = findRow(view.root, 3);
    expect(
      [...grandChildRow.querySelectorAll('button')].some(
        (button) =>
          button.getAttribute('title') === '新增二级' ||
          button.getAttribute('title') === '新增三级',
      ),
    ).toBe(false);
  });

  it('disables sort icons according to sibling position', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    const firstRootRow = findRow(view.root, 1);
    expect(
      findButtonByTooltip(firstRootRow, '置顶').hasAttribute('disabled'),
    ).toBe(true);
    expect(
      findButtonByTooltip(firstRootRow, '上移').hasAttribute('disabled'),
    ).toBe(true);
    expect(
      findButtonByTooltip(firstRootRow, '下移').hasAttribute('disabled'),
    ).toBe(false);
    expect(
      findButtonByTooltip(firstRootRow, '置底').hasAttribute('disabled'),
    ).toBe(false);

    const lastRootRow = findRow(view.root, 4);
    expect(
      findButtonByTooltip(lastRootRow, '置顶').hasAttribute('disabled'),
    ).toBe(false);
    expect(
      findButtonByTooltip(lastRootRow, '上移').hasAttribute('disabled'),
    ).toBe(false);
    expect(
      findButtonByTooltip(lastRootRow, '下移').hasAttribute('disabled'),
    ).toBe(true);
    expect(
      findButtonByTooltip(lastRootRow, '置底').hasAttribute('disabled'),
    ).toBe(true);
  });

  it('refreshes rendered child order after sorting a secondary brand', async () => {
    const sortableChildren = [
      {
        children: [],
        created_at: '',
        credential_image: '',
        description: '',
        goods_count: 18,
        has_children: false,
        icon: '',
        id: 2,
        is_visible: 1,
        name: 'VIP月卡',
        parent_id: 1,
        sort: 1,
        updated_at: '',
      },
      {
        children: [],
        created_at: '',
        credential_image: '',
        description: '',
        goods_count: 6,
        has_children: false,
        icon: '',
        id: 3,
        is_visible: 1,
        name: '连续包月',
        parent_id: 1,
        sort: 2,
        updated_at: '',
      },
    ];
    const [firstRoot, secondRoot] = fixtures.listResult.list;
    const [firstChild, secondChild] = sortableChildren;
    expect(firstRoot).toBeTruthy();
    expect(secondRoot).toBeTruthy();
    expect(firstChild).toBeTruthy();
    expect(secondChild).toBeTruthy();
    if (!firstRoot || !secondRoot || !firstChild || !secondChild) {
      throw new Error('missing sortable fixtures');
    }
    apiMocks.getBrandListApi.mockResolvedValue({
      list: [
        {
          ...cloneRows(firstRoot),
          children: cloneRows(sortableChildren),
        },
        cloneRows(secondRoot),
      ],
      pagination: {
        total: 2,
      },
    });
    apiMocks.sortBrandApi.mockResolvedValue(undefined);
    apiMocks.getBrandChildrenApi
      .mockResolvedValueOnce({
        list: cloneRows(sortableChildren),
      })
      .mockResolvedValueOnce({
        list: cloneRows([secondChild, firstChild]),
      });

    const view = await renderPage();
    mountedRoots.push(view);

    expect(
      [...view.root.querySelectorAll<HTMLElement>('[data-row-id]')].map(
        (row) => row.dataset.rowId,
      ),
    ).toEqual(['1', '2', '3', '4']);

    findButtonByTooltip(findRow(view.root, 2), '下移').click();
    await flushUi();

    expect(apiMocks.sortBrandApi).toHaveBeenCalledWith(2, 'down');
    expect(apiMocks.getBrandChildrenApi).toHaveBeenLastCalledWith(1);
  });

  it('creates a tertiary brand under the selected secondary node', async () => {
    apiMocks.addBrandApi.mockResolvedValue(undefined);
    apiMocks.getBrandChildrenApi
      .mockResolvedValueOnce({
        list: cloneRows(fixtures.listResult.list[0]?.children ?? []),
      })
      .mockResolvedValueOnce({
        list: [
          cloneRows(fixtures.listResult.list[0]?.children[0]?.children[0]),
          {
            children: [],
            created_at: '',
            credential_image: '',
            description: '',
            goods_count: 0,
            has_children: false,
            icon: '',
            id: 5,
            is_visible: 1,
            name: '学生季卡',
            parent_id: 2,
            sort: 2,
            updated_at: '',
          },
        ],
      });

    const view = await renderPage();
    mountedRoots.push(view);

    findButtonByTooltip(findRow(view.root, 2), '新增三级').click();
    await flushPromises();
    await nextTick();

    const dialog = view.root.querySelector('[data-test="dialog"]');
    expect(dialog?.textContent).toContain('新增三级品牌');
    const inputs = dialog?.querySelectorAll('input') ?? [];
    expect(inputs[0]).toBeTruthy();
    expect((inputs[0] as HTMLInputElement).value).toBe('VIP月卡');
    (inputs[1] as HTMLInputElement).value = '学生季卡';
    inputs[1]?.dispatchEvent(new Event('input'));
    await flushPromises();
    await nextTick();

    [...(dialog?.querySelectorAll('button') ?? [])]
      .find((button) => button.textContent?.includes('保存'))
      ?.click();
    await flushUi();

    expect(apiMocks.addBrandApi).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '学生季卡',
        parent_id: 2,
      }),
    );
    expect(apiMocks.getBrandChildrenApi).toHaveBeenLastCalledWith(2);
  });

  it('keeps expanded tertiary rows visible after editing a secondary brand', async () => {
    apiMocks.updateBrandApi.mockResolvedValue(undefined);
    apiMocks.getBrandChildrenApi
      .mockResolvedValueOnce({
        list: cloneRows(fixtures.listResult.list[0]?.children ?? []),
      })
      .mockResolvedValueOnce({
        list: [
          {
            ...cloneRows(fixtures.listResult.list[0]?.children[0]),
            name: 'VIP月卡新版',
            children: [],
          },
        ],
      })
      .mockResolvedValueOnce({
        list: cloneRows(
          fixtures.listResult.list[0]?.children[0]?.children ?? [],
        ),
      });

    const view = await renderPage();
    mountedRoots.push(view);

    expect(
      [...view.root.querySelectorAll<HTMLElement>('[data-row-id]')].map(
        (row) => row.dataset.rowId,
      ),
    ).toEqual(['1', '2', '3', '4']);

    findButtonByTooltip(findRow(view.root, 2), '编辑').click();
    await flushPromises();
    await nextTick();

    (
      [
        ...(view.root.querySelectorAll('[data-test="dialog"] button') ?? []),
      ].find((button) => button.textContent?.includes('保存')) as
        | HTMLButtonElement
        | undefined
    )?.click();
    await flushPromises();
    await nextTick();

    expect(
      [...view.root.querySelectorAll<HTMLElement>('[data-row-id]')].map(
        (row) => row.dataset.rowId,
      ),
    ).toEqual(['1', '2', '3', '4']);
  });
});
