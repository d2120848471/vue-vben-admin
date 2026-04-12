<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import { onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElSkeleton,
  ElTag,
} from 'element-plus';

import { getSMSConfigApi, saveSMSConfigApi } from '#/api';

import { MYJOB_PAGE_CONTENT_CLASS } from '../shared';

const formRef = ref<FormInstance>();
const loading = ref(false);
const saving = ref(false);
const metadata = reactive({
  access_key_masked: '',
  access_key_secret_masked: '',
  updated_at: '',
});
const formModel = reactive({
  access_key: '',
  access_key_secret: '',
  expire_minutes: 30,
  interval_minutes: 1,
  keep_access_key: true,
  keep_access_key_secret: true,
  sign_name: '',
  template_code: '',
});

async function loadConfig() {
  loading.value = true;
  try {
    const result = await getSMSConfigApi();
    metadata.access_key_masked = result.access_key_masked;
    metadata.access_key_secret_masked = result.access_key_secret_masked;
    metadata.updated_at = result.updated_at || '';

    formModel.access_key = '';
    formModel.access_key_secret = '';
    formModel.expire_minutes = result.expire_minutes;
    formModel.interval_minutes = result.interval_minutes;
    formModel.keep_access_key = result.access_key_configured;
    formModel.keep_access_key_secret = result.access_key_secret_configured;
    formModel.sign_name = result.sign_name;
    formModel.template_code = result.template_code;
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  if (!formRef.value) {
    return;
  }
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  try {
    saving.value = true;
    await saveSMSConfigApi({
      access_key: formModel.keep_access_key ? '' : formModel.access_key.trim(),
      access_key_secret: formModel.keep_access_key_secret
        ? ''
        : formModel.access_key_secret.trim(),
      expire_minutes: formModel.expire_minutes,
      interval_minutes: formModel.interval_minutes,
      keep_access_key: formModel.keep_access_key,
      keep_access_key_secret: formModel.keep_access_key_secret,
      sign_name: formModel.sign_name.trim(),
      template_code: formModel.template_code.trim(),
    });
    ElMessage.success('短信配置已保存');
    await loadConfig();
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
              <p class="text-base font-medium">短信发送配置</p>
              <p class="text-sm text-muted-foreground">
                当前保存的密钥会以掩码形式展示，勾选“保留当前值”时不会覆盖旧密钥。
              </p>
            </div>
            <ElTag v-if="metadata.updated_at" type="info">
              最近更新时间：{{ metadata.updated_at }}
            </ElTag>
          </div>
        </template>

        <ElForm
          ref="formRef"
          :model="formModel"
          label-width="150px"
          class="max-w-3xl"
        >
          <ElFormItem label="当前 AccessKey">
            <span class="text-muted-foreground">{{
              metadata.access_key_masked || '尚未配置'
            }}</span>
          </ElFormItem>
          <ElFormItem label="保留 AccessKey">
            <ElCheckbox v-model="formModel.keep_access_key">
              保留当前值
            </ElCheckbox>
          </ElFormItem>
          <ElFormItem
            v-if="!formModel.keep_access_key"
            label="新的 AccessKey"
            prop="access_key"
            :rules="[
              { required: true, message: '请输入 AccessKey', trigger: 'blur' },
            ]"
          >
            <ElInput
              v-model="formModel.access_key"
              placeholder="请输入新的 AccessKey"
            />
          </ElFormItem>

          <ElFormItem label="当前 AccessKeySecret">
            <span class="text-muted-foreground">{{
              metadata.access_key_secret_masked || '尚未配置'
            }}</span>
          </ElFormItem>
          <ElFormItem label="保留 AccessKeySecret">
            <ElCheckbox v-model="formModel.keep_access_key_secret">
              保留当前值
            </ElCheckbox>
          </ElFormItem>
          <ElFormItem
            v-if="!formModel.keep_access_key_secret"
            label="新的 AccessKeySecret"
            prop="access_key_secret"
            :rules="[
              {
                required: true,
                message: '请输入 AccessKeySecret',
                trigger: 'blur',
              },
            ]"
          >
            <ElInput
              v-model="formModel.access_key_secret"
              type="password"
              show-password
              placeholder="请输入新的 AccessKeySecret"
            />
          </ElFormItem>

          <ElFormItem
            label="短信签名"
            prop="sign_name"
            :rules="[
              { required: true, message: '请输入短信签名', trigger: 'blur' },
            ]"
          >
            <ElInput
              v-model="formModel.sign_name"
              placeholder="请输入短信签名"
            />
          </ElFormItem>
          <ElFormItem
            label="短信模板编号"
            prop="template_code"
            :rules="[
              {
                required: true,
                message: '请输入短信模板编号',
                trigger: 'blur',
              },
            ]"
          >
            <ElInput
              v-model="formModel.template_code"
              placeholder="请输入短信模板编号"
            />
          </ElFormItem>
          <ElFormItem label="验证码有效期(分钟)">
            <ElInputNumber
              v-model="formModel.expire_minutes"
              :max="60"
              :min="1"
            />
          </ElFormItem>
          <ElFormItem label="发送间隔(分钟)">
            <ElInputNumber
              v-model="formModel.interval_minutes"
              :max="10"
              :min="1"
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
