<script lang="ts" setup>
import type { SystemSettingsGroup, SystemSettingsSavePayload } from '#/api';

import { computed, onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElSkeleton,
  ElTag,
} from 'element-plus';

import { getSystemSettingsApi, saveSystemSettingsApi } from '#/api';

import { MYJOB_PAGE_CONTENT_CLASS } from '../shared';

type FieldMeta = {
  configured: boolean;
  label: string;
  updated_at: string;
};

type GroupMeta = {
  label: string;
};

type SystemFieldMetaState = {
  robot_webhook_url: FieldMeta;
  tax_exclusive_rate: FieldMeta;
  tax_inclusive_rate: FieldMeta;
};

type SystemGroupMetaState = {
  finance: GroupMeta;
  integration: GroupMeta;
};

const loading = ref(false);
const saving = ref(false);
const formModel = reactive({
  robot_webhook_url: '',
  tax_exclusive_rate: '',
  tax_inclusive_rate: '',
});
const fieldMeta = reactive<SystemFieldMetaState>({
  robot_webhook_url: {
    configured: false,
    label: '机器人回调地址',
    updated_at: '',
  },
  tax_exclusive_rate: {
    configured: false,
    label: '未税->含税税率',
    updated_at: '',
  },
  tax_inclusive_rate: {
    configured: false,
    label: '含税->未税税率',
    updated_at: '',
  },
});
const groupMeta = reactive<SystemGroupMetaState>({
  finance: { label: '财务参数' },
  integration: { label: '通用配置' },
});

const latestUpdatedAt = computed(() => {
  return Object.values(fieldMeta)
    .map((item) => item.updated_at)
    .filter(Boolean)
    .toSorted()
    .at(-1);
});

function resetFieldMeta() {
  for (const item of Object.values(fieldMeta)) {
    item.configured = false;
    item.updated_at = '';
  }
}

function applyGroupMeta(groups: SystemSettingsGroup[]) {
  groupMeta.finance.label =
    groups.find((item) => item.group === 'finance')?.label || '财务参数';
  groupMeta.integration.label = '通用配置';
}

// 后端按 groups 返回，前端首版只接这 3 个固定字段，避免误渲染未设计好的参数。
function applySettingsGroups(groups: SystemSettingsGroup[]) {
  resetFieldMeta();
  applyGroupMeta(groups);

  const financeGroup = groups.find((item) => item.group === 'finance');
  const integrationGroup = groups.find((item) => item.group === 'integration');
  const financeMap = new Map(
    financeGroup?.items.map((item) => [item.key, item]),
  );
  const integrationMap = new Map(
    integrationGroup?.items.map((item) => [item.key, item]),
  );

  const exclusive = financeMap.get('tax_exclusive_rate');
  const inclusive = financeMap.get('tax_inclusive_rate');
  const webhook = integrationMap.get('robot_webhook_url');

  formModel.tax_exclusive_rate = exclusive?.value || '';
  formModel.tax_inclusive_rate = inclusive?.value || '';
  formModel.robot_webhook_url = webhook?.value || '';

  if (exclusive) {
    fieldMeta.tax_exclusive_rate.configured = exclusive.configured;
    fieldMeta.tax_exclusive_rate.label = exclusive.label;
    fieldMeta.tax_exclusive_rate.updated_at = exclusive.updated_at || '';
  }
  if (inclusive) {
    fieldMeta.tax_inclusive_rate.configured = inclusive.configured;
    fieldMeta.tax_inclusive_rate.label = inclusive.label;
    fieldMeta.tax_inclusive_rate.updated_at = inclusive.updated_at || '';
  }
  if (webhook) {
    fieldMeta.robot_webhook_url.configured = webhook.configured;
    fieldMeta.robot_webhook_url.label = webhook.label;
    fieldMeta.robot_webhook_url.updated_at = webhook.updated_at || '';
  }
}

async function loadConfig() {
  loading.value = true;
  try {
    const result = await getSystemSettingsApi();
    applySettingsGroups(result.groups ?? []);
  } catch {
    // 错误提示由全局请求拦截统一处理，这里只避免页面留下未处理的 rejection。
  } finally {
    loading.value = false;
  }
}

function validateRateValue(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return '税率不能为空';
  }
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return '税率必须大于0且小于100';
  }
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 100) {
    return '税率必须大于0且小于100';
  }
  return '';
}

function validateWebhookUrl(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return '';
  }
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return '';
    }
  } catch {}
  return '请输入有效的 http/https 地址';
}

function validateForm() {
  return (
    validateRateValue(formModel.tax_exclusive_rate) ||
    validateRateValue(formModel.tax_inclusive_rate) ||
    validateWebhookUrl(formModel.robot_webhook_url)
  );
}

function buildPayload(): SystemSettingsSavePayload {
  return {
    groups: [
      {
        group: 'finance',
        items: [
          {
            key: 'tax_exclusive_rate',
            value: formModel.tax_exclusive_rate.trim(),
          },
          {
            key: 'tax_inclusive_rate',
            value: formModel.tax_inclusive_rate.trim(),
          },
        ],
      },
      {
        group: 'integration',
        items: [
          {
            key: 'robot_webhook_url',
            value: formModel.robot_webhook_url.trim(),
          },
        ],
      },
    ],
  };
}

async function handleSubmit() {
  const errorMessage = validateForm();
  if (errorMessage) {
    ElMessage.error(errorMessage);
    return;
  }

  try {
    saving.value = true;
    await saveSystemSettingsApi(buildPayload());
    ElMessage.success('系统参数配置已保存');
    await loadConfig();
  } catch {
    // 错误提示由全局请求拦截统一处理，这里只做状态收尾。
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  void loadConfig();
});
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <ElSkeleton :loading="loading" animated>
      <ElCard shadow="never">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-base font-medium">系统参数配置</p>
              <p class="text-sm text-muted-foreground">
                当前页面统一维护财务参数和通用配置，修改后一次保存即可生效。
              </p>
            </div>
            <ElTag v-if="latestUpdatedAt" type="info">
              最近更新时间：{{ latestUpdatedAt }}
            </ElTag>
          </div>
        </template>

        <ElForm label-width="160px" class="max-w-3xl">
          <div
            data-test="system-config-group-finance"
            class="rounded-md border border-border bg-muted px-4 py-3 font-medium text-foreground"
          >
            {{ groupMeta.finance.label }}
          </div>

          <ElFormItem
            class="mt-6"
            :label="fieldMeta.tax_exclusive_rate.label"
            required
          >
            <ElInput
              v-model="formModel.tax_exclusive_rate"
              name="tax_exclusive_rate"
              placeholder="请输入未税->含税税率"
            />
          </ElFormItem>
          <ElFormItem :label="fieldMeta.tax_inclusive_rate.label" required>
            <ElInput
              v-model="formModel.tax_inclusive_rate"
              name="tax_inclusive_rate"
              placeholder="请输入含税->未税税率"
            />
          </ElFormItem>

          <div
            data-test="system-config-group-integration"
            class="mt-8 rounded-md border border-border bg-muted px-4 py-3 font-medium text-foreground"
          >
            {{ groupMeta.integration.label }}
          </div>

          <ElFormItem class="mt-6" :label="fieldMeta.robot_webhook_url.label">
            <ElInput
              v-model="formModel.robot_webhook_url"
              name="robot_webhook_url"
              placeholder="https://example.com/webhook"
            />
          </ElFormItem>

          <ElFormItem>
            <ElButton :loading="saving" type="primary" @click="handleSubmit">
              保存配置
            </ElButton>
          </ElFormItem>
        </ElForm>
      </ElCard>
    </ElSkeleton>
  </Page>
</template>
