<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore, useUserStore } from '@vben/stores';

import {
  ElButton,
  ElDialog,
  ElDrawer,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElSwitch,
  ElTag,
  ElTree,
} from 'element-plus';

import type { FormInstance } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { addGroupApi, deleteGroupApi, getGroupAuthApi, getGroupsApi, getPermissionTreeApi, saveGroupAuthApi, updateGroupApi, updateGroupStatusApi } from '#/api';
import type { GroupListItem, MenuTreeItem } from '#/api';
import { useAuthStore } from '#/store';

import type { GridPageParams } from '../shared';

import { keywordMatch, resolvePageParams, toGridResult } from '../shared';

const accessStore = useAccessStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('admin.department'),
);

const dialogVisible = ref(false);
const dialogLoading = ref(false);
const editingId = ref<null | number>(null);
const formRef = ref<FormInstance>();
const dialogForm = reactive({
  description: '',
  name: '',
});

const authDrawerVisible = ref(false);
const authDrawerLoading = ref(false);
const authGroup = ref<null | GroupListItem>(null);
const permissionTree = ref<MenuTreeItem[]>([]);
const checkedMenuIds = ref<number[]>([]);
const treeRef = ref<InstanceType<typeof ElTree>>();

function resetDialogForm() {
  dialogForm.description = '';
  dialogForm.name = '';
}

function openCreateDialog() {
  editingId.value = null;
  resetDialogForm();
  dialogVisible.value = true;
}

function openEditDialog(row: GroupListItem) {
  editingId.value = row.id;
  dialogForm.description = row.description;
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
      await updateGroupApi(editingId.value, {
        description: dialogForm.description.trim(),
        name: dialogForm.name.trim(),
      });
      ElMessage.success('用户组已更新');
    } else {
      await addGroupApi({
        description: dialogForm.description.trim(),
        name: dialogForm.name.trim(),
      });
      ElMessage.success('用户组已新增');
    }
    dialogVisible.value = false;
    await gridApi.reload();
  } finally {
    dialogLoading.value = false;
  }
}

async function handleDelete(row: GroupListItem) {
  await ElMessageBox.confirm(`确认删除用户组 ${row.name} 吗？`, '删除确认', {
    type: 'warning',
  });
  await deleteGroupApi(row.id);
  ElMessage.success('用户组已删除');
  await gridApi.reload();
}

async function handleStatusChange(row: GroupListItem, value: boolean) {
  await updateGroupStatusApi(row.id, value ? 1 : 0);
  ElMessage.success('用户组状态已更新');
  await gridApi.reload();

  if (String(row.id) === userStore.userInfo?.groupId) {
    await authStore.syncCurrentSession();
  }
}

async function openAuthDrawer(row: GroupListItem) {
  authGroup.value = row;
  authDrawerVisible.value = true;
  authDrawerLoading.value = true;
  try {
    const [tree, auth] = await Promise.all([
      getPermissionTreeApi(),
      getGroupAuthApi(row.id),
    ]);
    permissionTree.value = tree;
    checkedMenuIds.value = auth.menu_ids;
  } finally {
    authDrawerLoading.value = false;
  }
}

async function saveGroupAuth() {
  if (!authGroup.value) {
    return;
  }

  const checkedKeys = (treeRef.value?.getCheckedKeys(false) as number[] | undefined) || [];
  const halfCheckedKeys =
    (treeRef.value?.getHalfCheckedKeys?.() as number[] | undefined) || [];
  const menuIds = [
    ...new Set([
      ...checkedKeys,
      ...halfCheckedKeys,
    ]),
  ];
  authDrawerLoading.value = true;
  try {
    await saveGroupAuthApi(authGroup.value.id, menuIds);
    ElMessage.success('授权已保存');
    authDrawerVisible.value = false;

    if (String(authGroup.value.id) === userStore.userInfo?.groupId) {
      await authStore.syncCurrentSession();
    }
    await gridApi.reload();
  } finally {
    authDrawerLoading.value = false;
  }
}

const [Grid, gridApi] = useVbenVxeGrid<GroupListItem>({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: '关键词',
        componentProps: {
          placeholder: '请输入用户组名称关键词',
        },
      },
    ],
  },
  gridOptions: {
    columns: [
      { field: 'id', title: 'ID', width: 80 },
      { field: 'name', title: '用户组名称', minWidth: 180 },
      { field: 'description', title: '描述', minWidth: 220 },
      { field: 'user_count', title: '员工数', width: 100 },
      {
        field: 'status',
        title: '状态',
        minWidth: 120,
        slots: { default: 'status' },
      },
      {
        field: 'actions',
        fixed: 'right',
        minWidth: 260,
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
          const result = await getGroupsApi({ page, page_size });
          const keyword = String(formValues.keyword ?? '').trim();
          const filtered = keyword
            ? result.list.filter((item) =>
                keywordMatch(keyword, [item.name, item.description]),
              )
            : result.list;
          return toGridResult(
            filtered,
            keyword ? filtered.length : result.pagination.total,
          );
        },
      },
    },
    toolbarConfig: {
      refresh: true,
      search: true,
      zoom: true,
    },
  },
  tableTitle: '用户组列表',
});
</script>

<template>
  <Page description="用户组管理和授权抽屉都在当前页完成。" title="用户组与授权">
    <Grid>
      <template #toolbar-actions>
        <ElButton v-if="canManage" type="primary" @click="openCreateDialog">
          新增用户组
        </ElButton>
      </template>

      <template #status="{ row }">
        <ElSwitch
          :model-value="row.status === 1"
          :disabled="!canManage"
          inline-prompt
          active-text="启用"
          inactive-text="禁用"
          @change="(value) => handleStatusChange(row, Boolean(value))"
        />
      </template>

      <template #actions="{ row }">
        <div class="flex items-center justify-center gap-2">
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
            type="warning"
            @click="openAuthDrawer(row)"
          >
            授权
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

    <ElDialog
      v-model="dialogVisible"
      :title="editingId ? '编辑用户组' : '新增用户组'"
      width="500px"
    >
      <ElForm ref="formRef" :model="dialogForm" label-width="88px">
        <ElFormItem
          label="用户组名称"
          prop="name"
          :rules="[
            { required: true, message: '请输入用户组名称', trigger: 'blur' },
          ]"
        >
          <ElInput v-model="dialogForm.name" placeholder="请输入用户组名称" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="dialogForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入用户组描述"
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

    <ElDrawer
      v-model="authDrawerVisible"
      :title="authGroup ? `${authGroup.name} - 授权配置` : '授权配置'"
      size="520px"
    >
      <div v-loading="authDrawerLoading" class="space-y-4">
        <ElTag v-if="authGroup" type="info"
          >当前员工数：{{ authGroup.user_count }}</ElTag
        >
        <div class="rounded-2xl border border-border p-4">
          <ElTree
            ref="treeRef"
            :data="permissionTree"
            :default-checked-keys="checkedMenuIds"
            :props="{ children: 'children', label: 'name' }"
            node-key="id"
            show-checkbox
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <ElButton @click="authDrawerVisible = false">取消</ElButton>
          <ElButton
            :loading="authDrawerLoading"
            type="primary"
            @click="saveGroupAuth"
          >
            保存授权
          </ElButton>
        </div>
      </template>
    </ElDrawer>
  </Page>
</template>
