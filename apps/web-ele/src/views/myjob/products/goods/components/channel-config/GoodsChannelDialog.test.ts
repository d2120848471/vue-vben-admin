/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GoodsChannelDialog from './GoodsChannelDialog.vue';

const apiMocks = vi.hoisted(() => ({
  deleteProductGoodsChannelBindingApi: vi.fn(),
  getProductGoodsChannelBindingFormOptionsApi: vi.fn(),
  getProductGoodsChannelBindingsApi: vi.fn(),
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
          display_name: '腾讯周卡 开票主体A 渠道A',
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
      ],
    });
    apiMocks.getProductGoodsChannelBindingFormOptionsApi.mockResolvedValue({
      auto_price_type_options: [{ label: '固定值', value: 'fixed' }],
      dock_status_options: [{ label: '正常', value: 1 }],
      platform_accounts: [{ id: 101, name: '渠道A' }],
      validate_templates: [{ id: 7, title: '模板A' }],
    });
    apiMocks.deleteProductGoodsChannelBindingApi.mockResolvedValue(undefined);
    apiMocks.updateProductGoodsChannelAutoPriceApi.mockResolvedValue(undefined);
  });

  afterEach(() => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('loads goods summary and bindings when opened', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    expect(apiMocks.getProductGoodsChannelBindingsApi).toHaveBeenCalledWith(21);
    expect(view.root.textContent).toContain('腾讯视频周卡');
    expect(view.root.textContent).toContain('腾讯周卡 开票主体A 渠道A');
    expect(view.root.textContent).toContain('新增库存');
    expect(view.root.textContent).not.toContain('批量开启对接状态');
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

  it('deletes a binding and reloads the list', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    findButton(view.root, '删除').click();
    await flushPromises();
    await nextTick();

    expect(apiMocks.deleteProductGoodsChannelBindingApi).toHaveBeenCalledWith(
      21,
      31,
    );
    expect(apiMocks.getProductGoodsChannelBindingsApi).toHaveBeenCalledTimes(2);
    expect(view.events.saved).toHaveBeenCalledTimes(1);
  });

  it('opens the auto price dialog after lazy-loading form options', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    findButton(view.root, '开启自动改价').click();
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
