/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import IndustryRelationDrawer from './IndustryRelationDrawer.vue';

const apiMocks = vi.hoisted(() => ({
  addIndustryRelationBrandsApi: vi.fn(),
  deleteIndustryRelationBrandsApi: vi.fn(),
  getBrandSelectorApi: vi.fn(),
  getIndustryRelationBrandsApi: vi.fn(),
  sortIndustryRelationBrandApi: vi.fn(),
}));

vi.mock('#/api/modules/admin/products/industries', () => apiMocks);

vi.mock('@vben/hooks', () => ({
  useAppConfig: () => ({
    apiURL: 'http://127.0.0.1:8080/api',
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

  const ElDrawer = defineComponent({
    name: 'ElDrawerStub',
    props: { modelValue: Boolean, title: { default: '', type: String } },
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

  const ElEmpty = defineComponent({
    name: 'ElEmptyStub',
    props: { description: { default: '', type: String } },
    setup(props) {
      return () => h('div', props.description);
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

  const ElOption = defineComponent({
    name: 'ElOptionStub',
    props: {
      label: { default: '', type: String },
      value: { default: '', type: [Number, String] },
    },
    setup(props) {
      return () => h('div', props.label);
    },
  });

  const ElSelect = defineComponent({
    name: 'ElSelectStub',
    props: { modelValue: { default: () => [], type: [Array, Number, String] } },
    setup(props, { slots }) {
      return () =>
        h('div', { 'data-test': 'select' }, [
          h('div', JSON.stringify(props.modelValue)),
          slots.default?.(),
        ]);
    },
  });

  const ElTooltip = defineComponent({
    name: 'ElTooltipStub',
    props: { content: { default: '', type: String } },
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    },
  });

  return {
    ElButton,
    ElDrawer,
    ElEmpty,
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
    ElTooltip,
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderDrawer() {
  const root = document.createElement('div');
  document.body.append(root);

  const visible = ref(true);
  const activeIndustry = ref<any>({ id: 1, name: '视频娱乐' });
  const events = {
    saved: vi.fn(),
  };

  const Wrapper = defineComponent({
    setup() {
      return () =>
        h(IndustryRelationDrawer, {
          activeIndustry: activeIndustry.value,
          visible: visible.value,
          'onUpdate:visible': (value: boolean) => {
            visible.value = value;
          },
          onSaved: events.saved,
        });
    },
  });

  const app = createApp(Wrapper);
  app.directive('loading', {});
  app.config.errorHandler = () => {};
  app.mount(root);
  await nextTick();

  return {
    activeIndustry,
    events,
    root,
    unmount() {
      app.unmount();
      root.remove();
    },
    visible,
  };
}

describe('IndustryRelationDrawer', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('clears prior relation state when a later drawer load fails', async () => {
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
    apiMocks.getBrandSelectorApi
      .mockResolvedValueOnce({ list: [] })
      .mockResolvedValueOnce({ list: [] });

    const view = await renderDrawer();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    expect(view.root.querySelector('[data-test="drawer"]')).toBeTruthy();
    expect(view.root.textContent).toContain('爱奇艺');

    (
      view.root.querySelector('[data-test="drawer-close"]') as HTMLButtonElement
    ).click();
    await nextTick();

    view.activeIndustry.value = { id: 2, name: '音频娱乐' };
    view.visible.value = true;
    await flushPromises();
    await nextTick();

    expect(view.root.querySelector('[data-test="drawer"]')).toBeNull();
    expect(view.root.textContent).not.toContain('爱奇艺');
  });
});
