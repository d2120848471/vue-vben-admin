<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
  ElSwitch,
  ElTag,
} from 'element-plus';

import type { FormInstance } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { addAdminUserApi, cancelAdminUserBusinessApi, deleteAdminUserApi, getAdminUsersApi, getGroupsApi, setAdminUserBusinessApi, updateAdminUserApi, updateAdminUserNotifyApi, updateAdminUserStatusApi } from '#/api';
import type { GroupListItem, UserFormPayload, UserListItem } from '#/api';

import type { GridPageParams } from '../shared';

import { keywordMatch, resolvePageParams, toGridResult } from '../shared';

interface UserDialogState {
  confirm_password: string;
  confirm_username: string;
  group_id: number | undefined;
  password: string;
  phone: string;
  real_name: string;
  username: string;
}

const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('admin.list'),
);

const groupOptions = ref<GroupListItem[]>([]);
const formRef = ref<FormInstance>();
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const editingId = ref<null | number>(null);

const dialogForm = reactive<UserDialogState>({
  confirm_password: '',
  confirm_username: '',
  group_id: undefined,
  password: '',
  phone: '',
  real_name: '',
  username: '',
});

function resetDialogForm() {
  dialogForm.confirm_password = '';
  dialogForm.confirm_username = '';
  dialogForm.group_id = undefined;
  dialogForm.password = '';
  dialogForm.phone = '';
  dialogForm.real_name = '';
  dialogForm.username = '';
}

async function loadGroups() {
  const result = await getGroupsApi({ page: 1, page_size: 200 });
  groupOptions.value = result.list ?? [];
}

function openCreateDialog() {
  editingId.value = null;
  resetDialogForm();
  dialogVisible.value = true;
}

function openEditDialog(row: UserListItem) {
  editingId.value = row.id;
  dialogVisible.value = true;
  dialogForm.confirm_password = '';
  dialogForm.confirm_username = row.username;
  dialogForm.group_id = row.group_id;
  dialogForm.password = '';
  dialogForm.phone = row.phone;
  dialogForm.real_name = row.real_name;
  dialogForm.username = row.username;
}

function buildUserPayload(): UserFormPayload {
  return {
    confirm_password: dialogForm.confirm_password || undefined,
    confirm_username: dialogForm.confirm_username || undefined,
    group_id: Number(dialogForm.group_id || 0),
    password: dialogForm.password || undefined,
    phone: dialogForm.phone.trim(),
    real_name: dialogForm.real_name.trim(),
    username: dialogForm.username.trim() || undefined,
  };
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
    const payload = buildUserPayload();

    // 核心表单在新增和编辑场景共用，这里按是否存在 id 决定请求分支。
    if (editingId.value) {
      await updateAdminUserApi(editingId.value, payload);
      ElMessage.success('员工信息已更新');
    } else {
      await addAdminUserApi({
        ...payload,
        confirm_password: dialogForm.confirm_password,
        confirm_username: dialogForm.confirm_username,
        password: dialogForm.password,
        username: dialogForm.username.trim(),
      });
      ElMessage.success('员工已新增');
    }

    dialogVisible.value = false;
    await gridApi.reload();
  } finally {
    dialogLoading.value = false;
  }
}

async function handleDelete(row: UserListItem) {
  await ElMessageBox.confirm(`确认删除员工 ${row.username} 吗？`, '删除确认', {
    type: 'warning',
  });
  await deleteAdminUserApi(row.id);
  ElMessage.success('员工已删除');
  await gridApi.reload();
}

async function handleStatusChange(row: UserListItem, value: boolean) {
  await updateAdminUserStatusApi(row.id, value ? 1 : 0);
  ElMessage.success('员工状态已更新');
  await gridApi.reload();
}

async function handleNotifyChange(row: UserListItem, value: boolean) {
  await updateAdminUserNotifyApi(row.id, value ? 1 : 0);
  ElMessage.success('余额通知设置已更新');
  await gridApi.reload();
}

function getSelectedIds() {
  return (
    (gridApi.grid?.getCheckboxRecords?.() as UserListItem[] | undefined) || []
  ).map((item) => item.id);
}

async function handleBatchBusiness(flag: 'cancel' | 'set') {
  const ids = getSelectedIds();
  if (!ids.length) {
    ElMessage.warning('请先选择员工');
    return;
  }
  if (flag === 'set') {
    await setAdminUserBusinessApi(ids);
    ElMessage.success('已批量设置商务');
  } else {
    await cancelAdminUserBusinessApi(ids);
    ElMessage.success('已批量取消商务');
  }
  await gridApi.reload();
}

const [Grid, gridApi] = useVbenVxeGrid<UserListItem>({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: '关键词',
        componentProps: {
          placeholder: '用户名 / 姓名 / 手机号',
        },
      },
    ],
  },
  gridOptions: {
    checkboxConfig: {
      reserve: true,
    },
    columns: [
      { type: 'checkbox', width: 48 },
      { field: 'id', title: 'ID', width: 80 },
      { field: 'username', title: '用户名', minWidth: 140 },
      { field: 'real_name', title: '姓名', minWidth: 120 },
      { field: 'phone', title: '手机号', minWidth: 140 },
      { field: 'group_name', title: '用户组', minWidth: 140 },
      {
        field: 'status',
        title: '状态',
        minWidth: 120,
        slots: { default: 'status' },
      },
      {
        field: 'balance_notify',
        title: '余额通知',
        minWidth: 140,
        slots: { default: 'notify' },
      },
      {
        field: 'is_business',
        title: '商务账号',
        minWidth: 120,
        slots: { default: 'business' },
      },
      {
        field: 'actions',
        fixed: 'right',
        minWidth: 240,
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
          const result = await getAdminUsersApi({ page, page_size });
          const keyword = String(formValues.keyword ?? '').trim();
          const filtered = keyword
            ? result.list.filter((item) =>
                keywordMatch(keyword, [
                  item.username,
                  item.real_name,
                  item.phone,
                ]),
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
  tableTitle: '员工列表',
});

const dialogTitle = computed(() => (editingId.value ? '编辑员工' : '新增员工'));

const formRules = computed(() => ({
  confirm_password: [
    {
      validator: (
        _rule: unknown,
        value: string,
        callback: (error?: Error) => void,
      ) => {
        if (!dialogForm.password) {
          callback();
          return;
        }
        if (value !== dialogForm.password) {
          callback(new Error('两次输入的密码不一致'));
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
  confirm_username: editingId.value
    ? []
    : [{ required: true, message: '请再次输入用户名', trigger: 'blur' }],
  group_id: [{ required: true, message: '请选择用户组', trigger: 'change' }],
  password: editingId.value
    ? []
    : [{ required: true, message: '请输入密码', trigger: 'blur' }],
  phone: [
    {
      pattern: /^1\d{10}$/,
      message: '请输入正确的手机号',
      trigger: 'blur',
    },
  ],
  real_name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  username: editingId.value
    ? []
    : [
        {
          pattern: /^[A-Za-z0-9_]{4,20}$/,
          message: '用户名需为 4-20 位字母、数字或下划线',
          trigger: 'blur',
        },
      ],
}));

onMounted(() => {
  void loadGroups();
});
</script>

<template>
  <Page
    description="支持新增、编辑、删除、状态切换、余额通知和批量商务设置。"
    title="员工管理"
  >
    <Grid>
      <template #toolbar-actions>
        <div class="flex flex-wrap items-center gap-3">
          <ElButton v-if="canManage" type="primary" @click="openCreateDialog">
            新增员工
          </ElButton>
          <ElButton v-if="canManage" @click="handleBatchBusiness('set')">
            批量设为商务
          </ElButton>
          <ElButton v-if="canManage" @click="handleBatchBusiness('cancel')">
            批量取消商务
          </ElButton>
        </div>
      </template>

      <template #status="{ row }">
        <ElSwitch
          :model-value="row.status === 1"
          :disabled="!canManage || row.group_id === 0"
          inline-prompt
          active-text="启用"
          inactive-text="禁用"
          @change="(value) => handleStatusChange(row, Boolean(value))"
        />
      </template>

      <template #notify="{ row }">
        <ElSwitch
          :model-value="row.balance_notify === 1"
          :disabled="!canManage"
          inline-prompt
          active-text="开"
          inactive-text="关"
          @change="(value) => handleNotifyChange(row, Boolean(value))"
        />
      </template>

      <template #business="{ row }">
        <ElTag :type="row.is_business === 1 ? 'success' : 'info'">
          {{ row.is_business === 1 ? '是' : '否' }}
        </ElTag>
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
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </ElButton>
        </div>
      </template>
    </Grid>

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="520px">
      <ElForm
        ref="formRef"
        :model="dialogForm"
        :rules="formRules"
        label-width="96px"
      >
        <ElFormItem v-if="!editingId" label="用户名" prop="username">
          <ElInput v-model="dialogForm.username" placeholder="请输入用户名" />
        </ElFormItem>
        <ElFormItem
          v-if="!editingId"
          label="确认用户名"
          prop="confirm_username"
        >
          <ElInput
            v-model="dialogForm.confirm_username"
            placeholder="请再次输入用户名"
          />
        </ElFormItem>
        <ElFormItem label="姓名" prop="real_name">
          <ElInput v-model="dialogForm.real_name" placeholder="请输入姓名" />
        </ElFormItem>
        <ElFormItem label="手机号" prop="phone">
          <ElInput v-model="dialogForm.phone" placeholder="请输入手机号" />
        </ElFormItem>
        <ElFormItem label="用户组" prop="group_id">
          <ElSelect
            v-model="dialogForm.group_id"
            class="w-full"
            placeholder="请选择用户组"
          >
            <ElOption
              v-for="group in groupOptions"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem :label="editingId ? '新密码' : '密码'" prop="password">
          <ElInput
            v-model="dialogForm.password"
            type="password"
            show-password
            :placeholder="editingId ? '留空则不修改密码' : '请输入密码'"
          />
        </ElFormItem>
        <ElFormItem label="确认密码" prop="confirm_password">
          <ElInput
            v-model="dialogForm.confirm_password"
            type="password"
            show-password
            :placeholder="editingId ? '留空则不修改密码' : '请再次输入密码'"
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
