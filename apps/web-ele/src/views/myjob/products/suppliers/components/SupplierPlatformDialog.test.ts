/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SupplierPlatformDialog from './SupplierPlatformDialog.vue';

const apiMocks = vi.hoisted(() => ({
  addSupplierPlatformApi: vi.fn(),
  getSupplierPlatformDetailApi: vi.fn(),
  updateSupplierPlatformApi: vi.fn(),
}));

vi.mock('#/api/modules/admin/products/suppliers', () => apiMocks);

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

  const ElInputNumber = defineComponent({
    name: 'ElInputNumberStub',
    props: { modelValue: { default: 0, type: Number } },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit }) {
      return () =>
        h('input', {
          ...attrs,
          type: 'number',
          value: String(props.modelValue),
          onInput: (event: Event) =>
            emit(
              'update:modelValue',
              Number((event.target as HTMLInputElement).value),
            ),
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
    ElInputNumber,
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
        h(SupplierPlatformDialog, {
          editingPlatform: {
            backup_domain: 'backup.old.test',
            balance_warning: 0,
            connect_status: 0,
            connect_status_text: '未验证',
            crowd_name: '旧群',
            domain: 'api.old.test',
            has_tax: 1,
            id: 9,
            last_balance: '',
            last_balance_at: '',
            last_balance_message: '',
            name: '旧平台',
            provider_code: 'xqy',
            provider_name: '星权益',
            sort: 1,
            status: 1,
            subject_id: 7,
            subject_name: '聚权益',
            threshold_amount: '10.0000',
            type_id: 1,
            type_name: '星权益',
          },
          onSaved: vi.fn(),
          platformTypeOptions: [
            { id: 1, provider_code: 'xqy', type_name: '星权益' },
          ],
          subjectOptions: [
            {
              created_at: '',
              has_tax: 1,
              id: 7,
              name: '聚权益',
              updated_at: '',
            },
          ],
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

function findInput(root: HTMLElement, selector: string) {
  const input = root.querySelector(selector);
  expect(input).toBeTruthy();
  return input as HTMLInputElement;
}

describe('SupplierPlatformDialog', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('keeps submit disabled until edit detail finishes loading', async () => {
    const detailDeferred = createDeferred<any>();
    apiMocks.getSupplierPlatformDetailApi.mockReturnValue(
      detailDeferred.promise,
    );

    const view = await renderDialog(true);
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    const confirmButton = findButton(view.root, '确定');
    expect(confirmButton.disabled).toBe(true);

    confirmButton.click();
    await flushPromises();

    expect(apiMocks.updateSupplierPlatformApi).not.toHaveBeenCalled();

    detailDeferred.resolve({
      backup_domain: 'backup.xqy.test',
      crowd_name: '运营群',
      domain: 'api.xqy.test',
      has_tax: 1,
      name: '木木（星权益含税）',
      secret_key: 'secret',
      sort: 5,
      status: 1,
      subject_id: 7,
      threshold_amount: '5000.0000',
      token_id: 'token-id',
      type_id: 1,
    });
    await flushPromises();
    await nextTick();

    expect(findInput(view.root, 'input[data-test="supplier-name"]').value).toBe(
      '木木（星权益含税）',
    );
    expect(findButton(view.root, '确定').disabled).toBe(false);
  });
});
