<script lang="ts" setup>
import type {
  FormInstance,
  UploadProps,
  UploadRequestOptions,
} from 'element-plus';

import type {
  BrandCreatePayload,
  BrandListItem,
  BrandUpdatePayload,
} from '#/api';

import { computed, reactive, ref, watch } from 'vue';

import { useAppConfig } from '@vben/hooks';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElImage,
  ElInput,
  ElMessage,
  ElSwitch,
  ElUpload,
} from 'element-plus';

import { addBrandApi, updateBrandApi, uploadBrandImageApi } from '#/api';

import {
  resolveProductImageUrl,
  shouldShowBrandAssetFields,
} from '../../shared';

interface BrandDialogState {
  credential_image: string;
  description: string;
  icon: string;
  is_visible: number;
  name: string;
  parent_id: number;
  parent_name: string;
}

const props = defineProps<{
  createLevelLabel: string;
  editingBrand: BrandListItem | null;
  parentId: number;
  parentName: string;
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [parentId: number];
  'update:visible': [value: boolean];
}>();

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
const formRef = ref<FormInstance>();
const dialogLoading = ref(false);
const uploadLoading = reactive({
  credential_image: false,
  icon: false,
});

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const dialogTitle = computed(() =>
  props.editingBrand ? '编辑品牌' : `新增${props.createLevelLabel}`,
);
const showBrandAssetFields = computed(() =>
  shouldShowBrandAssetFields(dialogForm.parent_id),
);

const dialogForm = reactive<BrandDialogState>({
  credential_image: '',
  description: '',
  icon: '',
  is_visible: 1,
  name: '',
  parent_id: 0,
  parent_name: '一级品牌',
});

function resetDialogForm() {
  dialogForm.credential_image = '';
  dialogForm.description = '';
  dialogForm.icon = '';
  dialogForm.is_visible = 1;
  dialogForm.name = '';
  dialogForm.parent_id = 0;
  dialogForm.parent_name = '一级品牌';
}

function initializeDialog() {
  resetDialogForm();
  dialogForm.parent_id = props.parentId;
  dialogForm.parent_name = props.parentName;
  if (!props.editingBrand) {
    return;
  }
  dialogForm.credential_image = props.editingBrand.credential_image || '';
  dialogForm.description = props.editingBrand.description || '';
  dialogForm.icon = props.editingBrand.icon || '';
  dialogForm.is_visible = props.editingBrand.is_visible;
  dialogForm.name = props.editingBrand.name;
}

function buildCreatePayload(): BrandCreatePayload {
  return {
    credential_image: dialogForm.credential_image,
    description: dialogForm.description.trim(),
    icon: dialogForm.icon,
    is_visible: dialogForm.is_visible,
    name: dialogForm.name.trim(),
    parent_id: dialogForm.parent_id,
  };
}

function buildUpdatePayload(): BrandUpdatePayload {
  return {
    credential_image: dialogForm.credential_image,
    description: dialogForm.description.trim(),
    icon: dialogForm.icon,
    is_visible: dialogForm.is_visible,
    name: dialogForm.name.trim(),
  };
}

const beforeImageUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isImage = rawFile.type.startsWith('image/');
  const isLt2M = rawFile.size / 1024 / 1024 <= 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB');
    return false;
  }
  return true;
};

async function uploadField(
  field: 'credential_image' | 'icon',
  options: UploadRequestOptions,
) {
  const uploadType = field === 'icon' ? 'icon' : 'credential';
  uploadLoading[field] = true;
  try {
    const formData = new FormData();
    formData.append('type', uploadType);
    formData.append('file', options.file);
    const result = await uploadBrandImageApi(formData);
    dialogForm[field] = result.url;
    ElMessage.success(field === 'icon' ? '品牌图标已上传' : '资质图片已上传');
    options.onSuccess?.(result);
  } finally {
    uploadLoading[field] = false;
  }
}

function clearUploadedField(field: 'credential_image' | 'icon') {
  dialogForm[field] = '';
}

function resolveImageUrl(url: string) {
  return resolveProductImageUrl(url, apiURL);
}

async function submitDialog() {
  if (!formRef.value) {
    return;
  }
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  try {
    dialogLoading.value = true;
    if (props.editingBrand) {
      await updateBrandApi(props.editingBrand.id, buildUpdatePayload());
      ElMessage.success('品牌已更新');
      emit('saved', props.editingBrand.parent_id);
    } else {
      await addBrandApi(buildCreatePayload());
      ElMessage.success(`${props.createLevelLabel}已新增`);
      emit('saved', dialogForm.parent_id);
    }
    emit('update:visible', false);
  } finally {
    dialogLoading.value = false;
  }
}

watch(
  () =>
    [
      props.visible,
      props.editingBrand?.id,
      props.parentId,
      props.parentName,
    ] as const,
  ([visible]) => {
    if (!visible) {
      resetDialogForm();
      dialogLoading.value = false;
      return;
    }
    initializeDialog();
  },
  { immediate: true },
);
</script>

<template>
  <ElDialog v-model="dialogVisible" :title="dialogTitle" width="640px">
    <ElForm ref="formRef" :model="dialogForm" label-width="96px">
      <ElFormItem v-if="dialogForm.parent_id > 0" label="父级品牌">
        <ElInput :model-value="dialogForm.parent_name" disabled />
      </ElFormItem>
      <ElFormItem
        label="品牌名称"
        prop="name"
        :rules="[
          { required: true, message: '请输入品牌名称', trigger: 'blur' },
        ]"
      >
        <ElInput v-model="dialogForm.name" placeholder="请输入品牌名称" />
      </ElFormItem>
      <ElFormItem label="显示状态" prop="is_visible">
        <ElSwitch
          v-model="dialogForm.is_visible"
          :active-value="1"
          :inactive-value="0"
          inline-prompt
          active-text="显示"
          inactive-text="隐藏"
        />
      </ElFormItem>
      <ElFormItem v-if="showBrandAssetFields" label="品牌图标">
        <div class="flex w-full items-center gap-3">
          <ElUpload
            :accept="IMAGE_ACCEPT"
            :before-upload="beforeImageUpload"
            :http-request="(options) => uploadField('icon', options)"
            :show-file-list="false"
          >
            <ElButton :loading="uploadLoading.icon">上传图标</ElButton>
          </ElUpload>
          <ElButton
            v-if="dialogForm.icon"
            link
            type="danger"
            @click="clearUploadedField('icon')"
          >
            清空
          </ElButton>
          <ElImage
            v-if="dialogForm.icon"
            :preview-src-list="[resolveImageUrl(dialogForm.icon)]"
            :src="resolveImageUrl(dialogForm.icon)"
            fit="cover"
            class="h-12 w-12 rounded-md"
          />
          <span v-else class="text-text-secondary">暂未上传</span>
        </div>
      </ElFormItem>
      <ElFormItem v-if="showBrandAssetFields" label="资质图片">
        <div class="flex w-full items-center gap-3">
          <ElUpload
            :accept="IMAGE_ACCEPT"
            :before-upload="beforeImageUpload"
            :http-request="
              (options) => uploadField('credential_image', options)
            "
            :show-file-list="false"
          >
            <ElButton :loading="uploadLoading.credential_image">
              上传资质
            </ElButton>
          </ElUpload>
          <ElButton
            v-if="dialogForm.credential_image"
            link
            type="danger"
            @click="clearUploadedField('credential_image')"
          >
            清空
          </ElButton>
          <ElImage
            v-if="dialogForm.credential_image"
            :preview-src-list="[resolveImageUrl(dialogForm.credential_image)]"
            :src="resolveImageUrl(dialogForm.credential_image)"
            fit="cover"
            class="h-12 w-12 rounded-md"
          />
          <span v-else class="text-text-secondary">暂未上传</span>
        </div>
      </ElFormItem>
      <ElFormItem label="品牌描述">
        <ElInput
          v-model="dialogForm.description"
          type="textarea"
          :rows="4"
          placeholder="请输入品牌描述"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="flex justify-end gap-3">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton :loading="dialogLoading" type="primary" @click="submitDialog">
          保存
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>
