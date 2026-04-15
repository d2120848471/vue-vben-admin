/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ProductTemplateDialog from './ProductTemplateDialog.vue';

const apiMocks = vi.hoisted(() => ({
  addProductTemplateApi: vi.fn(),
  getProductTemplateValidateTypesApi: vi.fn(),
  updateProductTemplateApi: vi.fn(),
}));

vi.mock('#/api/modules/admin/products/templates', () => apiMocks);

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
    setup(_, { expose, slots }) {
      expose({ validate: vi.fn().mockResolvedValue(true) });
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
    props: { modelValue: { default: '', type: String } },
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
    props: { label: { default: '', type: String } },
    setup(props) {
      return () => h('div', props.label);
    },
  });

  const ElSelect = defineComponent({
    name: 'ElSelectStub',
    props: { modelValue: { default: '', type: [Number, String] } },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit, slots }) {
      return () =>
        h('div', [
          h('input', {
            ...attrs,
            value: String(props.modelValue),
            onInput: (event: Event) =>
              emit(
                'update:modelValue',
                typeof props.modelValue === 'number'
                  ? Number((event.target as HTMLInputElement).value)
                  : (event.target as HTMLInputElement).value,
              ),
          }),
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
    ElOption,
    ElSelect,
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, reject, resolve };
}

async function renderDialog(initialVisible = true) {
  const root = document.createElement('div');
  document.body.append(root);

  const visible = ref(initialVisible);

  const Wrapper = defineComponent({
    setup() {
      return () =>
        h(ProductTemplateDialog, {
          editingTemplate: null,
          onSaved: vi.fn(),
          'onUpdate:visible': (value: boolean) => {
            visible.value = value;
          },
          visible: visible.value,
        });
    },
  });

  const app = createApp(Wrapper);
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

describe('ProductTemplateDialog', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('disables submit until validate types finish loading', async () => {
    const validateTypesDeferred = createDeferred<any>();
    apiMocks.getProductTemplateValidateTypesApi.mockReturnValue(
      validateTypesDeferred.promise,
    );

    const view = await renderDialog(true);
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    const confirmButton = findButton(view.root, '确定');
    expect(confirmButton.disabled).toBe(true);

    confirmButton.click();
    await flushPromises();

    expect(apiMocks.addProductTemplateApi).not.toHaveBeenCalled();

    validateTypesDeferred.resolve({
      list: [{ id: 1, title: '手机号' }],
    });
    await flushPromises();
    await nextTick();

    expect(findButton(view.root, '确定').disabled).toBe(false);
  });
});
