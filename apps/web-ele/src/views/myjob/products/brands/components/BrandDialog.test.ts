/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BrandDialog from './BrandDialog.vue';

const apiMocks = vi.hoisted(() => ({
  addBrandApi: vi.fn(),
  updateBrandApi: vi.fn(),
  uploadBrandImageApi: vi.fn(),
}));

const uploadState = vi.hoisted(() => ({
  instances: [] as Array<Record<string, any>>,
}));

vi.mock('#/api', () => apiMocks);

vi.mock('@vben/hooks', () => ({
  useAppConfig: () => ({
    apiURL: 'http://127.0.0.1:8080/api',
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

  const ElImage = defineComponent({
    name: 'ElImageStub',
    props: { src: { default: '', type: String } },
    setup(props) {
      return () => h('img', { src: props.src });
    },
  });

  const ElInput = defineComponent({
    name: 'ElInputStub',
    props: { modelValue: { default: '', type: String } },
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
      modelValue: { default: 1, type: [Boolean, Number] },
      activeValue: { default: 1, type: [Boolean, Number] },
      inactiveValue: { default: 0, type: [Boolean, Number] },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      return () =>
        h('input', {
          checked: props.modelValue === props.activeValue,
          type: 'checkbox',
          onChange: (event: Event) =>
            emit(
              'update:modelValue',
              (event.target as HTMLInputElement).checked
                ? props.activeValue
                : props.inactiveValue,
            ),
        });
    },
  });

  const ElUpload = defineComponent({
    name: 'ElUploadStub',
    props: {
      beforeUpload: { default: undefined, type: Function },
      httpRequest: { default: undefined, type: Function },
    },
    setup(props, { slots }) {
      uploadState.instances.push(props as Record<string, any>);
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
    ElSwitch,
    ElUpload,
  };
});

async function renderDialog(props: Record<string, any>) {
  const root = document.createElement('div');
  document.body.append(root);

  const app = createApp(BrandDialog, props);
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

describe('BrandDialog', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    uploadState.instances = [];
  });

  afterEach(() => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('shows asset uploads only for root-brand dialogs', async () => {
    const rootView = await renderDialog({
      createLevelLabel: '一级品牌',
      editingBrand: null,
      parentId: 0,
      parentName: '一级品牌',
      visible: true,
    });
    mountedRoots.push(rootView);

    expect(rootView.root.textContent).toContain('上传图标');
    expect(rootView.root.textContent).toContain('上传资质');

    const childView = await renderDialog({
      createLevelLabel: '三级品牌',
      editingBrand: null,
      parentId: 2,
      parentName: 'VIP月卡',
      visible: true,
    });
    mountedRoots.push(childView);

    expect(childView.root.textContent).not.toContain('上传图标');
    expect(childView.root.textContent).not.toContain('上传资质');
  });

  it('rejects non-image uploads before hitting the upload api', async () => {
    const { ElMessage } = await import('element-plus');
    const view = await renderDialog({
      createLevelLabel: '一级品牌',
      editingBrand: null,
      parentId: 0,
      parentName: '一级品牌',
      visible: true,
    });
    mountedRoots.push(view);

    const firstUpload = uploadState.instances[0];
    expect(firstUpload?.beforeUpload).toBeTypeOf('function');
    if (!firstUpload?.beforeUpload) {
      throw new Error('missing upload beforeUpload hook');
    }

    const result = firstUpload.beforeUpload({
      size: 128,
      type: 'text/plain',
    });

    expect(result).toBe(false);
    expect(apiMocks.uploadBrandImageApi).not.toHaveBeenCalled();
    expect(ElMessage.error).toHaveBeenCalledWith('只能上传图片文件');
  });
});
