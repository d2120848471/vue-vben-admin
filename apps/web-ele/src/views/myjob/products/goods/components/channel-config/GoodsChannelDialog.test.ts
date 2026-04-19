/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GoodsChannelDialog from './GoodsChannelDialog.vue';

const apiMocks = vi.hoisted(() => ({
  deleteProductGoodsChannelBindingApi: vi.fn(),
  getProductGoodsChannelBindingFormOptionsApi: vi.fn(),
  getProductGoodsChannelBindingsApi: vi.fn(),
  updateProductGoodsChannelBindingApi: vi.fn(),
  updateProductGoodsChannelAutoPriceApi: vi.fn(),
}));

const childDialogState = vi.hoisted(() => ({
  autoPriceProps: null as any,
  bindingProps: null as any,
}));

vi.mock('#/api/modules/admin/products/goods-channels', () => apiMocks);
vi.mock('./GoodsChannelBindingDialog.vue', () => ({
  default: defineComponent({
    name: 'GoodsChannelBindingDialogStub',
    props: {
      editingBinding: {
        default: null,
        type: Object,
      },
      visible: Boolean,
    },
    emits: ['saved', 'update:visible'],
    setup(props) {
      childDialogState.bindingProps = props;
      return () =>
        props.visible
          ? h(
              'div',
              { 'data-test': 'binding-dialog-stub' },
              props.editingBinding ? 'edit-binding' : 'create-binding',
            )
          : null;
    },
  }),
}));
vi.mock('./GoodsChannelAutoPriceDialog.vue', () => ({
  default: defineComponent({
    name: 'GoodsChannelAutoPriceDialogStub',
    props: {
      binding: {
        default: null,
        type: Object,
      },
      visible: Boolean,
    },
    emits: ['saved', 'update:visible'],
    setup(props) {
      childDialogState.autoPriceProps = props;
      return () =>
        props.visible
          ? h(
              'div',
              { 'data-test': 'auto-price-dialog-stub' },
              String(props.binding?.id ?? ''),
            )
          : null;
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
    props: { modelValue: Boolean, title: { default: '', type: String } },
    emits: ['update:modelValue'],
    setup(props, { slots }) {
      return () =>
        props.modelValue
          ? h('section', { 'data-test': 'dialog' }, [
              h('h2', props.title),
              slots.default?.(),
              slots.footer?.(),
            ])
          : null;
    },
  });

  const ElSwitch = defineComponent({
    name: 'ElSwitchStub',
    props: {
      activeValue: {
        default: 1,
        type: Number,
      },
      inactiveValue: {
        default: 0,
        type: Number,
      },
      loading: Boolean,
      modelValue: {
        default: 0,
        type: Number,
      },
    },
    emits: ['change'],
    setup(props, { attrs, emit }) {
      return () =>
        h(
          'button',
          {
            ...attrs,
            'data-loading': String(props.loading),
            'data-value': String(props.modelValue),
            onClick: () =>
              emit(
                'change',
                props.modelValue === props.activeValue
                  ? props.inactiveValue
                  : props.activeValue,
              ),
          },
          props.modelValue === props.activeValue ? 'on' : 'off',
        );
    },
  });

  return {
    ElButton,
    ElDialog,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn(),
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue(undefined),
    },
    ElSwitch,
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderDialog(initialGoodsId = 21) {
  const root = document.createElement('div');
  document.body.append(root);

  const goodsIdRef = ref(initialGoodsId);
  const visibleRef = ref(true);
  const events = {
    saved: vi.fn(),
  };

  const Wrapper = defineComponent({
    setup() {
      return () =>
        h(GoodsChannelDialog, {
          goodsId: goodsIdRef.value,
          visible: visibleRef.value,
          'onUpdate:visible': (value: boolean) => {
            visibleRef.value = value;
          },
          onSaved: events.saved,
        });
    },
  });

  const app = createApp(Wrapper);
  app.mount(root);
  await nextTick();

  return {
    events,
    setGoodsId(value: number) {
      goodsIdRef.value = value;
    },
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
  expect(button).toBeTruthy();
  return button as HTMLButtonElement;
}

function findHeaderTexts(root: HTMLElement) {
  return [...root.querySelectorAll('[data-test="bindings-grid-header"]')].map(
    (header) => header.textContent?.trim(),
  );
}

function findRowCell(root: HTMLElement, rowId: number, field: string) {
  const row = root.querySelector(`[data-row-id="${rowId}"]`);
  expect(row).toBeTruthy();
  const cell = row?.querySelector(`[data-cell-field="${field}"]`);
  expect(cell).toBeTruthy();
  return cell as HTMLElement;
}

describe('GoodsChannelDialog', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    childDialogState.autoPriceProps = null;
    childDialogState.bindingProps = null;
    apiMocks.getProductGoodsChannelBindingsApi.mockResolvedValue({
      goods: {
        brand_name: '腾讯视频',
        default_sell_price: '19.9000',
        goods_code: 'GD0000000021',
        has_tax: 1,
        id: 21,
        name: '腾讯视频周卡',
        subject_id: 11,
        subject_name: '开票主体A',
      },
      list: [
        {
          add_type: '',
          connect_status: 1,
          connect_status_text: '正常',
          cost_price: '10.0000',
          created_at: '2026-04-19 12:00:00',
          default_price: '0.0000',
          display_name: '腾讯 聚权益 玖玖云',
          dock_status: 1,
          effective_sell_price: '19.9000',
          id: 31,
          is_auto_change: 0,
          platform_account_id: 101,
          platform_account_name: '渠道A',
          platform_has_tax: 1,
          sort: 10,
          source_cost_price: '10.0000',
          supplier_goods_name: '腾讯周卡',
          supplier_goods_no: 'SKU-001',
          tax_adjust_amount: '0.0000',
          tax_adjust_direction: 'none',
          tax_adjust_rate: '0.0000',
          updated_at: '2026-04-19 12:00:00',
          validate_template_id: 7,
          validate_template_title: '模板A',
        },
        {
          add_type: 'fixed',
          connect_status: 1,
          connect_status_text: '正常',
          cost_price: '11.0000',
          created_at: '2026-04-19 12:10:00',
          default_price: '1.3000',
          display_name: '腾讯 平台B 渠道B',
          dock_status: 0,
          effective_sell_price: '20.9000',
          id: 32,
          is_auto_change: 1,
          platform_account_id: 102,
          platform_account_name: '渠道B',
          platform_has_tax: 0,
          sort: 20,
          source_cost_price: '11.0000',
          supplier_goods_name: '腾讯周卡B',
          supplier_goods_no: 'SKU-002',
          tax_adjust_amount: '0.0000',
          tax_adjust_direction: 'none',
          tax_adjust_rate: '0.0000',
          updated_at: '2026-04-19 12:10:00',
          validate_template_id: null,
          validate_template_title: '',
        },
      ],
    });
    apiMocks.getProductGoodsChannelBindingFormOptionsApi.mockResolvedValue({
      auto_price_type_options: [{ label: '固定值', value: 'fixed' }],
      dock_status_options: [{ label: '正常', value: 1 }],
      platform_accounts: [{ id: 101, name: '渠道A' }],
      validate_templates: [{ id: 7, title: '模板A' }],
    });
    apiMocks.deleteProductGoodsChannelBindingApi.mockResolvedValue(undefined);
    apiMocks.updateProductGoodsChannelBindingApi.mockResolvedValue(undefined);
    apiMocks.updateProductGoodsChannelAutoPriceApi.mockResolvedValue(undefined);
  });

  afterEach(() => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('loads goods summary and renders the bindings as a plain table without pager or sort column', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    expect(apiMocks.getProductGoodsChannelBindingsApi).toHaveBeenCalledWith(21);
    expect(view.root.textContent).toContain('腾讯视频周卡');
    expect(view.root.textContent).toContain('新增库存');
    expect(view.root.textContent).not.toContain('批量开启对接状态');
    expect(view.root.textContent).not.toContain('20条/页');
    expect(findHeaderTexts(view.root)).toEqual([
      '名称',
      '对接状态',
      '对接编号',
      '进货价',
      '利润后价格',
      '充值匹配',
      '自动改价',
      '操作',
    ]);
    const nameCell = findRowCell(view.root, 31, 'display_name');
    expect(nameCell.textContent).toContain('腾讯');
    const nameTags = [
      ...nameCell.querySelectorAll('[data-test="binding-name-tag"]'),
    ].map((tag) => tag.textContent?.trim());
    expect(nameTags).toEqual(['聚权益', '玖玖云']);
    expect(
      findRowCell(view.root, 31, 'supplier_goods_no').textContent,
    ).toContain('SKU-001');
    expect(findRowCell(view.root, 31, 'cost_price').textContent).toContain(
      '10.0000',
    );
    expect(
      findRowCell(view.root, 31, 'effective_sell_price').textContent,
    ).toContain('19.9000');
    expect(
      findRowCell(view.root, 31, 'validate_template_title').textContent,
    ).toContain('模板A');
  });

  it('renders a scrollable table container and keeps the action column width reserved', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    const scrollContainer = view.root.querySelector(
      '[data-test="bindings-table-scroll"]',
    );
    expect(scrollContainer).toBeTruthy();

    const columnWidths = [
      ...view.root.querySelectorAll('[data-test="bindings-grid-col"]'),
    ].map((column) => ({
      field: (column as HTMLElement).dataset.colField,
      style: column.getAttribute('style') || '',
    }));

    expect(columnWidths).toEqual([
      { field: 'display_name', style: expect.stringContaining('220px') },
      { field: 'dock_status', style: expect.stringContaining('120px') },
      { field: 'supplier_goods_no', style: expect.stringContaining('160px') },
      { field: 'cost_price', style: expect.stringContaining('140px') },
      {
        field: 'effective_sell_price',
        style: expect.stringContaining('160px'),
      },
      {
        field: 'validate_template_title',
        style: expect.stringContaining('180px'),
      },
      { field: 'is_auto_change', style: expect.stringContaining('140px') },
      { field: 'actions', style: expect.stringContaining('240px') },
    ]);
  });

  it('loads form options lazily when opening the create binding dialog', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    expect(
      apiMocks.getProductGoodsChannelBindingFormOptionsApi,
    ).not.toHaveBeenCalled();

    findButton(view.root, '新增库存').click();
    await flushPromises();
    await nextTick();

    expect(
      apiMocks.getProductGoodsChannelBindingFormOptionsApi,
    ).toHaveBeenCalledWith(21);
    expect(
      view.root.querySelector('[data-test="binding-dialog-stub"]')?.textContent,
    ).toBe('create-binding');
  });

  it('updates the dock status from the dedicated switch column and reloads the list', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    findRowCell(view.root, 32, 'dock_status').querySelector('button')?.click();
    await flushPromises();
    await nextTick();

    expect(apiMocks.updateProductGoodsChannelBindingApi).toHaveBeenCalledWith(
      21,
      32,
      {
        dock_status: 1,
        platform_account_id: 102,
        sort: 20,
        source_cost_price: '11.0000',
        supplier_goods_name: '腾讯周卡B',
        supplier_goods_no: 'SKU-002',
        validate_template_id: null,
      },
    );
    expect(apiMocks.getProductGoodsChannelBindingsApi).toHaveBeenCalledTimes(2);
    expect(view.events.saved).toHaveBeenCalledTimes(1);
  });

  it('opens the profit dialog from the auto-price switch when enabling', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    findRowCell(view.root, 31, 'is_auto_change')
      .querySelector('button')
      ?.click();
    await flushPromises();
    await nextTick();

    expect(
      apiMocks.getProductGoodsChannelBindingFormOptionsApi,
    ).toHaveBeenCalledWith(21);
    expect(
      apiMocks.updateProductGoodsChannelAutoPriceApi,
    ).not.toHaveBeenCalled();
    expect(
      view.root.querySelector('[data-test="auto-price-dialog-stub"]')
        ?.textContent,
    ).toBe('31');
  });

  it('closes auto price directly from the dedicated switch column and reloads the list', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    findRowCell(view.root, 32, 'is_auto_change')
      .querySelector('button')
      ?.click();
    await flushPromises();
    await nextTick();

    expect(apiMocks.updateProductGoodsChannelAutoPriceApi).toHaveBeenCalledWith(
      21,
      32,
      {
        add_type: '',
        default_price: '0.0000',
        is_auto_change: 0,
      },
    );
    expect(apiMocks.getProductGoodsChannelBindingsApi).toHaveBeenCalledTimes(2);
    expect(view.events.saved).toHaveBeenCalledTimes(1);
  });

  it('uses edit, profit setting and delete actions in the operation column', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    const actionsCell = findRowCell(view.root, 31, 'actions');
    expect(actionsCell.textContent).toContain('编辑');
    expect(actionsCell.textContent).toContain('利润设置');
    expect(actionsCell.textContent).toContain('删除');

    findButton(actionsCell, '利润设置').click();
    await flushPromises();
    await nextTick();

    expect(
      apiMocks.getProductGoodsChannelBindingFormOptionsApi,
    ).toHaveBeenCalledWith(21);
    expect(
      view.root.querySelector('[data-test="auto-price-dialog-stub"]')
        ?.textContent,
    ).toBe('31');
  });

  it('deletes a binding and reloads the list', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    findButton(findRowCell(view.root, 31, 'actions'), '删除').click();
    await flushPromises();
    await nextTick();

    expect(apiMocks.deleteProductGoodsChannelBindingApi).toHaveBeenCalledWith(
      21,
      31,
    );
    expect(apiMocks.getProductGoodsChannelBindingsApi).toHaveBeenCalledTimes(2);
    expect(view.events.saved).toHaveBeenCalledTimes(1);
  });

  it('reloads form options when switching to another goods item', async () => {
    const view = await renderDialog(21);
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    findButton(view.root, '新增库存').click();
    await flushPromises();
    await nextTick();

    expect(
      apiMocks.getProductGoodsChannelBindingFormOptionsApi,
    ).toHaveBeenNthCalledWith(1, 21);

    view.setGoodsId(22);
    await flushPromises();
    await nextTick();

    findButton(view.root, '新增库存').click();
    await flushPromises();
    await nextTick();

    expect(
      apiMocks.getProductGoodsChannelBindingFormOptionsApi,
    ).toHaveBeenNthCalledWith(2, 22);
  });
});
