/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SystemConfigPage from './system-config.vue';

const apiMocks = vi.hoisted(() => ({
  getSystemSettingsApi: vi.fn(),
  saveSystemSettingsApi: vi.fn(),
}));

const messageMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
}));

vi.mock('#/api/modules/admin/settings/system', () => apiMocks);

vi.mock('@vben/common-ui', () => ({
  Page: defineComponent({
    name: 'PageStub',
    setup(_, { slots }) {
      return () => h('div', { 'data-test': 'page' }, slots.default?.());
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

  const ElCard = defineComponent({
    name: 'ElCardStub',
    setup(_, { slots }) {
      return () =>
        h('section', { 'data-test': 'card' }, [
          slots.header?.(),
          slots.default?.(),
        ]);
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
    props: {
      label: {
        default: '',
        type: String,
      },
    },
    setup(props, { slots }) {
      return () =>
        h('label', { 'data-label': props.label }, [
          props.label ? h('span', props.label) : null,
          slots.default?.(),
        ]);
    },
  });

  const ElInput = defineComponent({
    name: 'ElInputStub',
    props: {
      modelValue: {
        default: '',
        type: String,
      },
      name: {
        default: '',
        type: String,
      },
      placeholder: {
        default: '',
        type: String,
      },
      type: {
        default: 'text',
        type: String,
      },
    },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit }) {
      return () =>
        h('input', {
          ...attrs,
          name: props.name,
          placeholder: props.placeholder,
          type: props.type,
          value: props.modelValue,
          onInput: (event: Event) =>
            emit('update:modelValue', (event.target as HTMLInputElement).value),
        });
    },
  });

  const ElSkeleton = defineComponent({
    name: 'ElSkeletonStub',
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    },
  });

  const ElTag = defineComponent({
    name: 'ElTagStub',
    setup(_, { slots }) {
      return () => h('span', { 'data-test': 'tag' }, slots.default?.());
    },
  });

  return {
    ElButton,
    ElCard,
    ElForm,
    ElFormItem,
    ElInput,
    ElMessage: messageMocks,
    ElSkeleton,
    ElTag,
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function flushUi() {
  for (const _ of [0, 1, 2]) {
    await flushPromises();
    await nextTick();
  }
}

async function renderPage() {
  const root = document.createElement('div');
  document.body.append(root);

  const app = createApp(SystemConfigPage);
  app.directive('loading', {});
  app.config.errorHandler = () => {};
  app.mount(root);
  await flushUi();

  return {
    root,
    unmount() {
      app.unmount();
      root.remove();
    },
  };
}

function findInput(root: HTMLElement, name: string) {
  const input = root.querySelector(`input[name="${name}"]`);
  expect(input, `未找到 ${name} 输入框`).toBeTruthy();
  if (!input) {
    throw new Error(`missing input ${name}`);
  }
  return input as HTMLInputElement;
}

function setInputValue(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function findGroupBlock(root: HTMLElement, name: string) {
  const block = root.querySelector(`[data-test="${name}"]`);
  expect(block, `未找到分组块 ${name}`).toBeTruthy();
  if (!block) {
    throw new Error(`missing group block ${name}`);
  }
  return block as HTMLElement;
}

describe('system config page', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getSystemSettingsApi.mockResolvedValue({
      groups: [
        {
          group: 'finance',
          items: [
            {
              configured: true,
              key: 'tax_exclusive_rate',
              label: '未税->含税税率',
              required: true,
              unit: '%',
              updated_at: '2026-04-13 12:30:00',
              value: '4.5',
              value_type: 'decimal',
            },
            {
              configured: true,
              key: 'tax_inclusive_rate',
              label: '含税->未税税率',
              required: true,
              unit: '%',
              updated_at: '2026-04-13 12:31:00',
              value: '3.8',
              value_type: 'decimal',
            },
          ],
          label: '财务参数',
        },
        {
          group: 'integration',
          items: [
            {
              configured: true,
              key: 'robot_webhook_url',
              label: '机器人回调地址',
              required: false,
              updated_at: '2026-04-13 12:32:00',
              value: 'https://bot.example.com/hook',
              value_type: 'url',
            },
          ],
          label: '通用配置',
        },
      ],
    });
    apiMocks.saveSystemSettingsApi.mockResolvedValue(undefined);
  });

  afterEach(() => {
    mountedRoots.splice(0).forEach((item) => item.unmount());
  });

  it('maps grouped settings into the fixed form fields on load', async () => {
    const page = await renderPage();
    mountedRoots.push(page);

    expect(findInput(page.root, 'tax_exclusive_rate').value).toBe('4.5');
    expect(findInput(page.root, 'tax_inclusive_rate').value).toBe('3.8');
    expect(findInput(page.root, 'robot_webhook_url').value).toBe(
      'https://bot.example.com/hook',
    );
    expect(page.root.textContent).toContain(
      '最近更新时间：2026-04-13 12:32:00',
    );
  });

  it('renders group headers with semantic theme tokens', async () => {
    const page = await renderPage();
    mountedRoots.push(page);

    const financeGroup = findGroupBlock(
      page.root,
      'system-config-group-finance',
    );
    const integrationGroup = findGroupBlock(
      page.root,
      'system-config-group-integration',
    );

    for (const group of [financeGroup, integrationGroup]) {
      expect(group.className).toContain('border-border');
      expect(group.className).toContain('bg-muted');
      expect(group.className).toContain('text-foreground');
      expect(group.className).not.toContain('border-blue-200');
      expect(group.className).not.toContain('bg-blue-50');
    }
  });

  it('submits the fixed form fields as grouped system settings', async () => {
    const page = await renderPage();
    mountedRoots.push(page);

    setInputValue(findInput(page.root, 'tax_exclusive_rate'), '5.2');
    setInputValue(findInput(page.root, 'tax_inclusive_rate'), '4.1');
    setInputValue(
      findInput(page.root, 'robot_webhook_url'),
      'https://bot.example.com/next',
    );

    const submitButton = [...page.root.querySelectorAll('button')].find(
      (item) => item.textContent?.trim() === '保存配置',
    );
    expect(submitButton).toBeTruthy();
    submitButton?.dispatchEvent(new Event('click', { bubbles: true }));
    await flushUi();

    expect(apiMocks.saveSystemSettingsApi).toHaveBeenCalledWith({
      groups: [
        {
          group: 'finance',
          items: [
            { key: 'tax_exclusive_rate', value: '5.2' },
            { key: 'tax_inclusive_rate', value: '4.1' },
          ],
        },
        {
          group: 'integration',
          items: [
            {
              key: 'robot_webhook_url',
              value: 'https://bot.example.com/next',
            },
          ],
        },
      ],
    });
  });

  it('blocks save when the webhook URL is not http or https', async () => {
    const page = await renderPage();
    mountedRoots.push(page);

    setInputValue(findInput(page.root, 'robot_webhook_url'), 'ftp://invalid');
    const submitButton = [...page.root.querySelectorAll('button')].find(
      (item) => item.textContent?.trim() === '保存配置',
    );
    submitButton?.dispatchEvent(new Event('click', { bubbles: true }));
    await flushUi();

    expect(apiMocks.saveSystemSettingsApi).not.toHaveBeenCalled();
    expect(messageMocks.error).toHaveBeenCalledWith(
      '请输入有效的 http/https 地址',
    );
  });

  it('skips local error toast when loading fails', async () => {
    apiMocks.getSystemSettingsApi.mockReset();
    apiMocks.getSystemSettingsApi.mockRejectedValueOnce(new Error('读取失败'));

    const page = await renderPage();
    mountedRoots.push(page);

    expect(messageMocks.error).not.toHaveBeenCalled();
    expect(messageMocks.success).not.toHaveBeenCalled();
  });

  it('skips local error toast and success toast when save fails', async () => {
    apiMocks.saveSystemSettingsApi.mockRejectedValueOnce(new Error('保存失败'));

    const page = await renderPage();
    mountedRoots.push(page);

    const submitButton = [...page.root.querySelectorAll('button')].find(
      (item) => item.textContent?.trim() === '保存配置',
    );
    submitButton?.dispatchEvent(new Event('click', { bubbles: true }));
    await flushUi();

    expect(messageMocks.error).not.toHaveBeenCalled();
    expect(messageMocks.success).not.toHaveBeenCalled();
  });
});
