<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type { GridPageParams } from '../../shared';

import type {
  PurchaseLimitStrategyEnumItem,
  PurchaseLimitStrategyListItem,
  PurchaseLimitStrategyPayload,
} from '#/api';

import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
  ElSwitch,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addPurchaseLimitStrategyApi,
  deletePurchaseLimitStrategyApi,
  getPurchaseLimitStrategyEnumsApi,
  getPurchaseLimitStrategyListApi,
  updatePurchaseLimitStrategyApi,
  updatePurchaseLimitStrategyStatusApi,
} from '#/api';

import {
  formatDateTime,
  MYJOB_GRID_CLASS,
  MYJOB_PAGE_CONTENT_CLASS,
  resolvePageParams,
  toGridResult,
} from '../../shared';

interface PurchaseLimitDialogState {
  limit_nums: number;
  limit_times: number;
  limit_type: number;
  name: string;
  period: number;
  period_type: number;
}

const accessStore = useAccessStore();
const canManage = computed(() =>
  accessStore.accessCodes.includes('product.purchase_limit'),
);

const formRef = ref<FormInstance>();
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const editingStrategy = ref<null | PurchaseLimitStrategyListItem>(null);
const loadingStatusIds = reactive<Record<number, boolean>>({});
const limitTypeOptions = ref<PurchaseLimitStrategyEnumItem[]>([]);
const periodTypeOptions = ref<PurchaseLimitStrategyEnumItem[]>([]);

const dialogForm = reactive<PurchaseLimitDialogState>({
  limit_nums: 0,
  limit_times: 0,
  limit_type: 0,
  name: '',
  period: 1,
  period_type: 0,
});

function resetDialogForm() {
  dialogForm.limit_nums = 0;
  dialogForm.limit_times = 0;
  dialogForm.limit_type = 0;
  dialogForm.name = '';
  dialogForm.period = 1;
  dialogForm.period_type = 0;
}

function syncEnumDefaults() {
  const hasLimitType = limitTypeOptions.value.some(
    (item) => item.id === dialogForm.limit_type,
  );
  if (!hasLimitType) {
    dialogForm.limit_type = limitTypeOptions.value[0]?.id ?? 0;
  }

  const hasPeriodType = periodTypeOptions.value.some(
    (item) => item.id === dialogForm.period_type,
  );
  if (!hasPeriodType) {
    dialogForm.period_type = periodTypeOptions.value[0]?.id ?? 0;
  }
}

async function ensureEnumsLoaded() {
  if (limitTypeOptions.value.length > 0 && periodTypeOptions.value.length > 0) {
    return;
  }
  const result = await getPurchaseLimitStrategyEnumsApi();
  limitTypeOptions.value = result.limit_types ?? [];
  periodTypeOptions.value = result.period_types ?? [];
}

// 枚举是表单的唯一选项源，加载失败时直接阻止打开弹窗，避免用户提交脏值。
async function prepareDialogOptions() {
  try {
    await ensureEnumsLoaded();
    syncEnumDefaults();
    return true;
  } catch {
    ElMessage.error('限制策略枚举加载失败，请稍后重试');
    return false;
  }
}

async function openCreateDialog() {
  editingStrategy.value = null;
  resetDialogForm();
  const ready = await prepareDialogOptions();
  if (!ready) {
    return;
  }
  dialogVisible.value = true;
}

async function openEditDialog(row: PurchaseLimitStrategyListItem) {
  resetDialogForm();
  dialogForm.limit_nums = row.limit_nums;
  dialogForm.limit_times = row.limit_times;
  dialogForm.limit_type = row.limit_type;
  dialogForm.name = row.name;
  dialogForm.period = row.period;
  dialogForm.period_type = row.period_type;

  const ready = await prepareDialogOptions();
  if (!ready) {
    resetDialogForm();
    editingStrategy.value = null;
    return;
  }
  editingStrategy.value = row;
  dialogVisible.value = true;
}

function buildPayload(): PurchaseLimitStrategyPayload {
  return {
    limit_nums: dialogForm.limit_nums,
    limit_times: dialogForm.limit_times,
    limit_type: dialogForm.limit_type,
    name: dialogForm.name.trim(),
    period: dialogForm.period,
    period_type: dialogForm.period_type,
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
    const payload = buildPayload();
    if (editingStrategy.value) {
      await updatePurchaseLimitStrategyApi(editingStrategy.value.id, payload);
      ElMessage.success('限制策略已更新');
    } else {
      await addPurchaseLimitStrategyApi(payload);
      ElMessage.success('限制策略已新增');
    }
    dialogVisible.value = false;
    await gridApi.reload();
  } finally {
    dialogLoading.value = false;
  }
}

async function handleDelete(row: PurchaseLimitStrategyListItem) {
  await ElMessageBox.confirm(`确认删除策略 ${row.name} 吗？`, '删除确认', {
    type: 'warning',
  });
  await deletePurchaseLimitStrategyApi(row.id);
  ElMessage.success('限制策略已删除');
  await gridApi.reload();
}

// 状态切换只走独立接口，避免编辑弹窗提交时误改启停状态。
async function handleStatusChange(
  row: PurchaseLimitStrategyListItem,
  nextStatus: number | string,
) {
  const normalizedStatus = Number(nextStatus);
  loadingStatusIds[row.id] = true;
  try {
    await updatePurchaseLimitStrategyStatusApi(row.id, normalizedStatus);
    ElMessage.success(normalizedStatus === 1 ? '限制策略已启用' : '限制策略已禁用');
    await gridApi.reload();
  } finally {
    loadingStatusIds[row.id] = false;
  }
}

const [Grid, gridApi] = useVbenVxeGrid<PurchaseLimitStrategyListItem>({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: '策略名称',
        componentProps: {
          placeholder: '请输入策略名称',
        },
      },
    ],
  },
  gridClass: MYJOB_GRID_CLASS,
  gridOptions: {
    columns: [
      { field: 'id', title: 'ID', minWidth: 90 },
      { field: 'name', title: '策略名称', minWidth: 180 },
      { field: 'limit_type_label', title: '限制类型', minWidth: 160 },
      { field: 'period_type_label', title: '周期类型', minWidth: 160 },
      { field: 'period', title: '周期', minWidth: 100 },
      { field: 'limit_nums', title: '限制数量', minWidth: 120 },
      { field: 'limit_times', title: '限制笔数', minWidth: 120 },
      {
        field: 'status',
        minWidth: 140,
        slots: { default: 'status' },
        title: '状态',
      },
      {
        field: 'created_at',
        formatter: ({ cellValue }: { cellValue?: string }) =>
          formatDateTime(cellValue),
        title: '创建时间',
        minWidth: 180,
      },
      {
        field: 'actions',
        fixed: 'right',
        minWidth: 180,
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
          const result = await getPurchaseLimitStrategyListApi({
            ...(keyword ? { keyword } : {}),
            page,
            page_size,
          });
          return toGridResult(result.list ?? [], result.pagination.total);
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

const dialogTitle = computed(() =>
  editingStrategy.value ? '编辑限制策略' : '新增限制策略',
);
</script>

<template>
  <Page :content-class="MYJOB_PAGE_CONTENT_CLASS">
    <Grid>
      <template #toolbar-actions>
        <div v-if="canManage" class="flex gap-3">
          <ElButton type="primary" @click="openCreateDialog">新增策略</ElButton>
        </div>
      </template>

      <template #status="{ row }">
        <ElSwitch
          v-if="canManage"
          :active-value="1"
          :inactive-value="0"
          :loading="loadingStatusIds[row.id]"
          :model-value="row.status"
          inline-prompt
          @change="(value) => handleStatusChange(row, Number(value))"
        />
      </template>

      <template #actions="{ row }">
        <div v-if="canManage" class="flex items-center gap-3">
          <ElButton link type="primary" @click="openEditDialog(row)">
            编辑
          </ElButton>
          <ElButton link type="danger" @click="handleDelete(row)">
            删除
          </ElButton>
        </div>
      </template>
    </Grid>

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="640px">
      <ElForm ref="formRef" :model="dialogForm" label-width="112px">
        <ElFormItem
          label="策略名称"
          prop="name"
          :rules="[
            { required: true, message: '请输入策略名称', trigger: 'blur' },
          ]"
        >
          <ElInput
            v-model="dialogForm.name"
            data-test="strategy-name"
            placeholder="请输入策略名称"
          />
        </ElFormItem>
        <ElFormItem
          label="限制类型"
          prop="limit_type"
          :rules="[
            { required: true, message: '请选择限制类型', trigger: 'change' },
          ]"
        >
          <ElSelect v-model="dialogForm.limit_type" class="w-full">
            <ElOption
              v-for="item in limitTypeOptions"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem
          label="周期类型"
          prop="period_type"
          :rules="[
            { required: true, message: '请选择周期类型', trigger: 'change' },
          ]"
        >
          <ElSelect v-model="dialogForm.period_type" class="w-full">
            <ElOption
              v-for="item in periodTypeOptions"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem
          label="周期"
          prop="period"
          :rules="[
            {
              required: true,
              message: '请输入大于 0 的周期',
              trigger: 'change',
            },
          ]"
        >
          <ElInputNumber
            v-model="dialogForm.period"
            :min="1"
            class="w-full"
            data-test="strategy-period"
          />
        </ElFormItem>
        <ElFormItem label="限制数量" prop="limit_nums">
          <ElInputNumber
            v-model="dialogForm.limit_nums"
            :min="0"
            class="w-full"
            data-test="strategy-limit-nums"
          />
          <div class="mt-2 text-xs text-muted-foreground">0 表示不限制</div>
        </ElFormItem>
        <ElFormItem label="限制笔数" prop="limit_times">
          <ElInputNumber
            v-model="dialogForm.limit_times"
            :min="0"
            class="w-full"
            data-test="strategy-limit-times"
          />
          <div class="mt-2 text-xs text-muted-foreground">0 表示不限制</div>
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
            确定
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </Page>
</template>
