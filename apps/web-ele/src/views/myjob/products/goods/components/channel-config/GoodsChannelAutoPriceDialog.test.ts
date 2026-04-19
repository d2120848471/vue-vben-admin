/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GoodsChannelAutoPriceDialog from './GoodsChannelAutoPriceDialog.vue';

const apiMocks = vi.hoisted(() => ({
  updateProductGoodsChannelAutoPriceApi: vi.fn(),
}));

const elementState = vi.hoisted(() => ({
  formItems: [] as Array<{ prop?: string; rules?: any }>,
}));

vi.mock('#/api/modules/admin/products/goods-channels', () => apiMocks);

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

  const ElForm = defineComponent({
    name: 'ElFormStub',
    props: {
      model: {
        default: () => ({}),
        type: Object,
      },
    },
    setup(props, { expose, slots }) {
      expose({
        validate: vi.fn().mockImplementation(async () => {
          for (const item of elementState.formItems) {
            if (!item.prop || !item.rules) {
              continue;
            }
            const rules = Array.isArray(item.rules) ? item.rules : [item.rules];
            const value = (props.model as Record<string, any>)[item.prop];
            for (const rule of rules) {
              if (
                rule.required &&
                (value === '' || value === null || value === undefined)
              ) {
                throw new Error(rule.message ?? 'required');
              }
              if (typeof rule.validator === 'function') {
                await new Promise<void>((resolve, reject) => {
                  const callback = (error?: Error | string) => {
                    if (error) {
                      reject(error);
                    } else {
                      resolve();
                    }
                  };
                  const result = rule.validator(rule, value, callback);
                  if (result && typeof result.then === 'function') {
                    result.then(() => resolve()).catch(reject);
                  }
                });
              }
            }
          }
          return true;
        }),
      });
      return () => h('form', slots.default?.());
    },
  });

  const ElFormItem = defineComponent({
    name: 'ElFormItemStub',
    props: {
      prop: {
        default: '',
        type: String,
      },
      rules: {
        default: undefined,
        type: [Array, Object],
      },
    },
    setup(props, { slots }) {
      elementState.formItems.push(props);
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
    },
    setup(props) {
      return () => h('div', props.label);
    },
  });

  const ElRadio = defineComponent({
    name: 'ElRadioStub',
    props: {
      label: {
        default: '',
        type: String,
      },
      modelValue: {
        default: '',
        type: String,
      },
    },
    emits: ['update:modelValue'],
    setup(props, { slots }) {
      return () => h('span', { 'data-label': props.label }, slots.default?.());
    },
  });

  const ElRadioGroup = defineComponent({
    name: 'ElRadioGroupStub',
    props: {
      modelValue: {
        default: '',
        type: String,
      },
    },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit, slots }) {
      return () =>
        h('div', [
          h('input', {
            ...attrs,
            value: props.modelValue,
            onInput: (event: Event) =>
              emit(
                'update:modelValue',
                (event.target as HTMLInputElement).value,
              ),
          }),
          slots.default?.(),
        ]);
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
      modelValue: {
        default: 0,
        type: Number,
      },
    },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit }) {
      return () =>
        h('input', {
          ...attrs,
          value: String(props.modelValue),
          onInput: (event: Event) =>
            emit(
              'update:modelValue',
              Number((event.target as HTMLInputElement).value),
            ),
        });
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
    },
    ElOption,
    ElRadio,
    ElRadioGroup,
    ElSwitch,
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderDialog(binding: any) {
  const root = document.createElement('div');
  document.body.append(root);

  const visibleRef = ref(true);
  const events = {
    saved: vi.fn(),
  };

  const Wrapper = defineComponent({
    setup() {
      return () =>
        h(GoodsChannelAutoPriceDialog, {
          autoPriceTypeOptions: [
            { label: '固定值', value: 'fixed' },
            { label: '百分比', value: 'percent' },
          ],
          binding,
          goodsId: 21,
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
    root,
    unmount() {
      app.unmount();
      root.remove();
    },
  };
}

function findInput(root: HTMLElement, selector: string) {
  const target = root.querySelector(selector);
  expect(target).toBeTruthy();
  return target as HTMLInputElement;
}

function findButton(root: HTMLElement, label: string) {
  const button = [...root.querySelectorAll('button')].find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  expect(button).toBeTruthy();
  return button as HTMLButtonElement;
}

describe('GoodsChannelAutoPriceDialog', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    elementState.formItems = [];
    apiMocks.updateProductGoodsChannelAutoPriceApi.mockResolvedValue(undefined);
  });

  afterEach(() => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('submits fixed or percent auto price payloads with trimmed values', async () => {
    const view = await renderDialog({
      add_type: '',
      default_price: '0.0000',
      id: 31,
      is_auto_change: 0,
    });
    mountedRoots.push(view);

    findInput(
      view.root,
      'input[data-test="channel-auto-price-enabled"]',
    ).value = '1';
    findInput(
      view.root,
      'input[data-test="channel-auto-price-enabled"]',
    ).dispatchEvent(new Event('input'));
    await nextTick();
    findInput(view.root, 'input[data-test="channel-auto-price-type"]').value =
      ' percent ';
    findInput(
      view.root,
      'input[data-test="channel-auto-price-type"]',
    ).dispatchEvent(new Event('input'));
    findInput(view.root, 'input[data-test="channel-auto-price-value"]').value =
      ' 12.5000 ';
    findInput(
      view.root,
      'input[data-test="channel-auto-price-value"]',
    ).dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.updateProductGoodsChannelAutoPriceApi).toHaveBeenCalledWith(
      21,
      31,
      {
        add_type: 'percent',
        default_price: '12.5000',
        is_auto_change: 1,
      },
    );
    expect(view.events.saved).toHaveBeenCalledTimes(1);
  });

  it('clears add type and default price when disabling auto price', async () => {
    const view = await renderDialog({
      add_type: 'fixed',
      default_price: '1.3000',
      id: 32,
      is_auto_change: 1,
    });
    mountedRoots.push(view);

    findInput(
      view.root,
      'input[data-test="channel-auto-price-enabled"]',
    ).value = '0';
    findInput(
      view.root,
      'input[data-test="channel-auto-price-enabled"]',
    ).dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.updateProductGoodsChannelAutoPriceApi).toHaveBeenCalledWith(
      21,
      32,
      {
        add_type: '',
        default_price: '0.0000',
        is_auto_change: 0,
      },
    );
  });

  it('does not submit when auto price value is not a valid money amount', async () => {
    const view = await renderDialog({
      add_type: '',
      default_price: '0.0000',
      id: 33,
      is_auto_change: 0,
    });
    mountedRoots.push(view);

    findInput(
      view.root,
      'input[data-test="channel-auto-price-enabled"]',
    ).value = '1';
    findInput(
      view.root,
      'input[data-test="channel-auto-price-enabled"]',
    ).dispatchEvent(new Event('input'));
    await nextTick();

    findInput(view.root, 'input[data-test="channel-auto-price-type"]').value =
      'fixed';
    findInput(
      view.root,
      'input[data-test="channel-auto-price-type"]',
    ).dispatchEvent(new Event('input'));
    findInput(view.root, 'input[data-test="channel-auto-price-value"]').value =
      '-1';
    findInput(
      view.root,
      'input[data-test="channel-auto-price-value"]',
    ).dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(
      apiMocks.updateProductGoodsChannelAutoPriceApi,
    ).not.toHaveBeenCalled();
  });
});
