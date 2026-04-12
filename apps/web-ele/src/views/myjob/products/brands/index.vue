<script lang="ts" setup>
import type {
  FormInstance,
  UploadProps,
  UploadRequestOptions,
} from 'element-plus';

import type { GridPageParams } from '../../shared';

import type {
  BrandCreatePayload,
  BrandListItem,
  BrandUpdatePayload,
  SortAction,
} from '#/api';

import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElImage,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElSwitch,
  ElTag,
  ElUpload,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addBrandApi,
  deleteBrandApi,
  getBrandChildrenApi,
  getBrandListApi,
  sortBrandApi,
  toggleBrandVisibilityApi,
  updateBrandApi,
  uploadBrandImageApi,
} from '#/api';

import {
  formatDateTime,
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  resolvePageParams,
  toGridResult,
} from '../../shared';
import {
  buildBrandTree,
  getAvailableBrandSortActions,
  mergeBrandChildren,
} from '../shared';

interface BrandDialogState {
  credential_image: string;
  description: string;
  icon: string;
  is_visible: number;
  name: string;
  parent_id: number;
  parent_name: string;
}

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp';

const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('product.brand'),
);

const formRef = ref<FormInstance>();
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const editingBrand = ref<BrandListItem | null>(null);
const brandRoots = ref<BrandListItem[]>([]);
const childCache = reactive<Record<number, BrandListItem[]>>({});
const uploadLoading = reactive({
  credential_image: false,
  icon: false,
});

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

function resolveParentName(parentId: number) {
  if (parentId === 0) {
    return '一级品牌';
  }
  return (
    brandRoots.value.find((item) => item.id === parentId)?.name ??
    `父品牌 #${parentId}`
  );
}

function syncBrandRoots(items: BrandListItem[]) {
  brandRoots.value = items.map((item) => {
    const cachedChildren = childCache[item.id];
    if (!cachedChildren) {
      return item;
    }
    return {
      ...item,
      children: cachedChildren,
      has_children: cachedChildren.length > 0 || item.has_children,
    };
  });
}

function openCreateRootDialog() {
  editingBrand.value = null;
  resetDialogForm();
  dialogVisible.value = true;
}

function openCreateChildDialog(row: BrandListItem) {
  editingBrand.value = null;
  resetDialogForm();
  dialogForm.parent_id = row.id;
  dialogForm.parent_name = row.name;
  dialogVisible.value = true;
}

function openEditDialog(row: BrandListItem) {
  editingBrand.value = row;
  dialogForm.credential_image = row.credential_image || '';
  dialogForm.description = row.description || '';
  dialogForm.icon = row.icon || '';
  dialogForm.is_visible = row.is_visible;
  dialogForm.name = row.name;
  dialogForm.parent_id = row.parent_id;
  dialogForm.parent_name = resolveParentName(row.parent_id);
  dialogVisible.value = true;
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

async function refreshParentBranch(parentId: number) {
  const parentRow = brandRoots.value.find((item) => item.id === parentId);
  if (!parentRow) {
    await gridApi.reload();
    return;
  }

  const result = await getBrandChildrenApi(parentId);
  const children = buildBrandTree(result.list ?? []);
  childCache[parentId] = children;
  parentRow.children = children;
  parentRow.has_children = children.length > 0;
  brandRoots.value = mergeBrandChildren(brandRoots.value, parentId, children);

  if (gridApi.grid?.loadTreeChildren) {
    await gridApi.grid.loadTreeChildren(parentRow, children);
  }

  const expanded = gridApi.grid?.isTreeExpandByRow?.(parentRow) ?? false;
  if (expanded) {
    await gridApi.grid?.setTreeExpand?.(parentRow, children.length > 0);
  }
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

    // 品牌弹窗同时覆盖一级和二级两种场景，请求体只在新增/编辑时切分一次。
    if (editingBrand.value) {
      await updateBrandApi(editingBrand.value.id, buildUpdatePayload());
      await (editingBrand.value.parent_id === 0
        ? gridApi.reload()
        : refreshParentBranch(editingBrand.value.parent_id));
      ElMessage.success('品牌已更新');
    } else {
      await addBrandApi(buildCreatePayload());
      await (dialogForm.parent_id === 0
        ? gridApi.reload()
        : refreshParentBranch(dialogForm.parent_id));
      ElMessage.success(
        dialogForm.parent_id === 0 ? '一级品牌已新增' : '二级品牌已新增',
      );
    }

    dialogVisible.value = false;
  } finally {
    dialogLoading.value = false;
  }
}

async function handleDelete(row: BrandListItem) {
  await ElMessageBox.confirm(`确认删除品牌 ${row.name} 吗？`, '删除确认', {
    type: 'warning',
  });
  await deleteBrandApi(row.id);
  ElMessage.success('品牌已删除');

  await (row.parent_id === 0
    ? gridApi.reload()
    : refreshParentBranch(row.parent_id));
}

async function handleSort(row: BrandListItem, action: SortAction) {
  await sortBrandApi(row.id, action);
  ElMessage.success('品牌排序已更新');

  await (row.parent_id === 0
    ? gridApi.reload()
    : refreshParentBranch(row.parent_id));
}

async function handleVisibilityChange(row: BrandListItem, value: boolean) {
  await toggleBrandVisibilityApi(row.id, value ? 1 : 0);
  row.is_visible = value ? 1 : 0;
  ElMessage.success('品牌显示状态已更新');
}

function getSiblingAvailability(row: BrandListItem) {
  const siblings =
    row.parent_id === 0 ? brandRoots.value : (childCache[row.parent_id] ?? []);
  const index = siblings.findIndex((item) => item.id === row.id);
  return getAvailableBrandSortActions(index, siblings.length);
}

const [Grid, gridApi] = useVbenVxeGrid<BrandListItem>({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: '品牌名称',
        componentProps: {
          placeholder: '请输入品牌名称关键词',
        },
      },
    ],
  },
  gridClass: MYJOB_GRID_CLASS,
  gridOptions: {
    columns: [
      { field: 'id', title: 'ID', width: 80 },
      {
        field: 'name',
        title: '品牌名称',
        minWidth: 220,
        treeNode: true,
      },
      {
        field: 'parent_id',
        title: '层级',
        minWidth: 100,
        slots: { default: 'level' },
      },
      {
        field: 'icon',
        title: '图标',
        minWidth: 100,
        slots: { default: 'icon' },
      },
      { field: 'goods_count', title: '商品数', width: 100 },
      {
        field: 'is_visible',
        title: '显示状态',
        minWidth: 140,
        slots: { default: 'visibility' },
      },
      {
        field: 'updated_at',
        formatter: ({ cellValue }: { cellValue?: string }) =>
          formatDateTime(cellValue),
        title: '更新时间',
        minWidth: 180,
      },
      {
        field: 'actions',
        fixed: 'right',
        minWidth: 360,
        slots: { default: 'actions' },
        title: '操作',
      },
    ],
    pagerConfig: {},
    proxyConfig: {
      ajax: {
        query: async (
          params: GridPageParams,
          formValues: Record<string, any>,
        ) => {
          const { page, page_size } = resolvePageParams(params);
          const keyword = String(formValues.keyword ?? '').trim();
          const result = await getBrandListApi({
            ...(keyword ? { name: keyword } : {}),
            page,
            page_size,
          });
          const rows = buildBrandTree(result.list ?? []);
          syncBrandRoots(rows);
          return toGridResult(brandRoots.value, result.pagination.total);
        },
      },
    },
    toolbarConfig: {
      refresh: true,
      search: true,
      zoom: true,
    },
    treeConfig: {
      childrenField: 'children',
      hasChildField: 'has_children',
      lazy: true,
      line: true,
      loadMethod: async ({ row }: { row: BrandListItem }) => {
        if (childCache[row.id]) {
          return childCache[row.id];
        }
        const result = await getBrandChildrenApi(row.id);
        const children = buildBrandTree(result.list ?? []);
        childCache[row.id] = children;
        brandRoots.value = mergeBrandChildren(
          brandRoots.value,
          row.id,
          children,
        );
        return children;
      },
      rowField: 'id',
    },
  },
});

const dialogTitle = computed(() => {
  if (editingBrand.value) {
    return '编辑品牌';
  }
  return dialogForm.parent_id === 0 ? '新增一级品牌' : '新增二级品牌';
});
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <Grid>
      <template #toolbar-actions>
        <ElButton v-if="canManage" type="primary" @click="openCreateRootDialog">
          新增一级品牌
        </ElButton>
      </template>

      <template #level="{ row }">
        <ElTag :type="row.parent_id === 0 ? 'success' : 'warning'">
          {{ row.parent_id === 0 ? '一级品牌' : '二级品牌' }}
        </ElTag>
      </template>

      <template #icon="{ row }">
        <ElImage
          v-if="row.icon"
          :preview-src-list="[row.icon]"
          :src="row.icon"
          fit="cover"
          class="h-10 w-10 rounded-md"
        />
        <span v-else>--</span>
      </template>

      <template #visibility="{ row }">
        <ElSwitch
          :disabled="!canManage"
          :model-value="row.is_visible === 1"
          inline-prompt
          active-text="显示"
          inactive-text="隐藏"
          @change="(value) => handleVisibilityChange(row, Boolean(value))"
        />
      </template>

      <template #actions="{ row }">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <ElButton
            v-if="canManage && row.parent_id === 0"
            link
            type="success"
            @click="openCreateChildDialog(row)"
          >
            新增二级
          </ElButton>
          <ElButton
            v-if="canManage"
            link
            type="primary"
            @click="openEditDialog(row)"
          >
            编辑
          </ElButton>
          <ElButton
            v-if="canManage"
            link
            type="primary"
            :disabled="!getSiblingAvailability(row).top"
            @click="handleSort(row, 'top')"
          >
            置顶
          </ElButton>
          <ElButton
            v-if="canManage"
            link
            type="primary"
            :disabled="!getSiblingAvailability(row).up"
            @click="handleSort(row, 'up')"
          >
            上移
          </ElButton>
          <ElButton
            v-if="canManage"
            link
            type="primary"
            :disabled="!getSiblingAvailability(row).down"
            @click="handleSort(row, 'down')"
          >
            下移
          </ElButton>
          <ElButton
            v-if="canManage"
            link
            type="primary"
            :disabled="!getSiblingAvailability(row).bottom"
            @click="handleSort(row, 'bottom')"
          >
            置底
          </ElButton>
          <ElButton
            v-if="canManage"
            link
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </ElButton>
        </div>
      </template>
    </Grid>

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="640px">
      <ElForm ref="formRef" :model="dialogForm" label-width="96px">
        <ElFormItem
          v-if="dialogForm.parent_id > 0 || editingBrand?.parent_id"
          label="父级品牌"
        >
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
        <ElFormItem label="品牌图标">
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
              :preview-src-list="[dialogForm.icon]"
              :src="dialogForm.icon"
              fit="cover"
              class="h-12 w-12 rounded-md"
            />
            <span v-else class="text-text-secondary">暂未上传</span>
          </div>
        </ElFormItem>
        <ElFormItem label="资质图片">
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
              :preview-src-list="[dialogForm.credential_image]"
              :src="dialogForm.credential_image"
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
          <ElButton
            :loading="dialogLoading"
            type="primary"
            @click="submitDialog"
          >
            保存
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </Page>
</template>
