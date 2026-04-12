<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type { GridPageParams } from '../shared';

import type { SubjectItem } from '#/api';

import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
  ElTag,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { addSubjectApi, getSubjectsApi, updateSubjectApi } from '#/api';

import {
  formatDateTime,
  keywordMatch,
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  toGridResult,
} from '../shared';

const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('subject.manage'),
);

const dialogVisible = ref(false);
const dialogLoading = ref(false);
const editingId = ref<null | number>(null);
const formRef = ref<FormInstance>();
const dialogForm = reactive({
  has_tax: 0,
  name: '',
});

function resetDialogForm() {
  dialogForm.has_tax = 0;
  dialogForm.name = '';
}

function openCreateDialog() {
  editingId.value = null;
  resetDialogForm();
  dialogVisible.value = true;
}

function openEditDialog(row: SubjectItem) {
  editingId.value = row.id;
  dialogForm.has_tax = row.has_tax;
  dialogForm.name = row.name;
  dialogVisible.value = true;
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
    if (editingId.value) {
      await updateSubjectApi(editingId.value, {
        has_tax: dialogForm.has_tax,
        name: dialogForm.name.trim(),
      });
      ElMessage.success('主体已更新');
    } else {
      await addSubjectApi({
        has_tax: dialogForm.has_tax,
        name: dialogForm.name.trim(),
      });
      ElMessage.success('主体已新增');
    }
    dialogVisible.value = false;
    await gridApi.reload();
  } finally {
    dialogLoading.value = false;
  }
}

const [Grid, gridApi] = useVbenVxeGrid<SubjectItem>({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: '主体名称',
        componentProps: {
          placeholder: '请输入主体名称关键词',
        },
      },
    ],
  },
  gridClass: MYJOB_GRID_CLASS,
  gridOptions: {
    columns: [
      { field: 'id', title: 'ID', width: 80 },
      { field: 'name', title: '主体名称', minWidth: 220 },
      {
        field: 'has_tax',
        title: '含税',
        minWidth: 120,
        slots: { default: 'tax' },
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
        minWidth: 140,
        slots: { default: 'actions' },
        title: '操作',
      },
    ],
    proxyConfig: {
      ajax: {
        query: async (
          _params: GridPageParams,
          formValues: Record<string, any>,
        ) => {
          const result = await getSubjectsApi();
          const keyword = String(formValues.keyword ?? '').trim();
          const filtered = keyword
            ? result.list.filter((item) => keywordMatch(keyword, [item.name]))
            : result.list;
          return toGridResult(filtered, filtered.length);
        },
      },
    },
    toolbarConfig: {
      refresh: true,
      search: true,
      zoom: true,
    },
  },
});
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <Grid>
      <template #toolbar-actions>
        <ElButton v-if="canManage" type="primary" @click="openCreateDialog">
          新增主体
        </ElButton>
      </template>

      <template #tax="{ row }">
        <ElTag :type="row.has_tax === 1 ? 'success' : 'info'">
          {{ row.has_tax === 1 ? '含税' : '不含税' }}
        </ElTag>
      </template>

      <template #actions="{ row }">
        <ElButton
          v-if="canManage"
          link
          type="primary"
          @click="openEditDialog(row)"
        >
          编辑
        </ElButton>
      </template>
    </Grid>

    <ElDialog
      v-model="dialogVisible"
      :title="editingId ? '编辑主体' : '新增主体'"
      width="480px"
    >
      <ElForm ref="formRef" :model="dialogForm" label-width="88px">
        <ElFormItem
          label="主体名称"
          prop="name"
          :rules="[
            { required: true, message: '请输入主体名称', trigger: 'blur' },
          ]"
        >
          <ElInput v-model="dialogForm.name" placeholder="请输入主体名称" />
        </ElFormItem>
        <ElFormItem label="含税状态" prop="has_tax">
          <ElSelect v-model="dialogForm.has_tax" class="w-full">
            <ElOption :value="1" label="含税" />
            <ElOption :value="0" label="不含税" />
          </ElSelect>
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
