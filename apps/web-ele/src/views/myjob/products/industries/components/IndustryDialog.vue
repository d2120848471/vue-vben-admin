<script lang="ts" setup>
import type { FormInstance } from 'element-plus';

import type {
  BrandSelectorItem,
  IndustryListItem,
  IndustryPayload,
  IndustryRelationBrandItem,
} from '#/api';

import { computed, reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
} from 'element-plus';

import {
  addIndustryApi,
  getBrandSelectorApi,
  getIndustryRelationBrandsApi,
  updateIndustryApi,
} from '#/api';

import {
  appendIndustrySelectorOptions,
  relationIdsFromItems,
} from '../../shared';

interface IndustryDialogState {
  brand_ids: number[];
  name: string;
}

const props = defineProps<{
  editingIndustry: IndustryListItem | null;
  visible: boolean;
}>();

const emit = defineEmits<{
  saved: [];
  'update:visible': [value: boolean];
}>();

const formRef = ref<FormInstance>();
const dialogLoading = ref(false);
const selectorOptions = ref<BrandSelectorItem[]>([]);

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const dialogTitle = computed(() =>
  props.editingIndustry ? '编辑行业' : '新增行业',
);

const dialogForm = reactive<IndustryDialogState>({
  brand_ids: [],
  name: '',
});

function resetDialogForm() {
  dialogForm.brand_ids = [];
  dialogForm.name = '';
}

function resetDialogState() {
  resetDialogForm();
  selectorOptions.value = [];
}

function mapRelationItemsToOptions(items: IndustryRelationBrandItem[]) {
  return items.map((item) => ({
    icon: item.brand_icon,
    id: item.brand_id,
    name: item.brand_name,
  }));
}

async function loadSelectorOptions(
  keyword = '',
  preserved: BrandSelectorItem[] = [],
) {
  const result = await getBrandSelectorApi(keyword ? { name: keyword } : {});
  selectorOptions.value = appendIndustrySelectorOptions(
    preserved,
    result.list ?? [],
  );
}

async function initializeDialog() {
  resetDialogState();
  if (!props.editingIndustry) {
    await loadSelectorOptions();
    return;
  }
  dialogForm.name = props.editingIndustry.name;
  const result = await getIndustryRelationBrandsApi(props.editingIndustry.id);
  dialogForm.brand_ids = relationIdsFromItems(result.list ?? []);
  await loadSelectorOptions('', mapRelationItemsToOptions(result.list ?? []));
}

async function submitDialog() {
  if (!formRef.value) {
    return;
  }
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  const payload: IndustryPayload = {
    brand_ids: [...dialogForm.brand_ids],
    name: dialogForm.name.trim(),
  };

  try {
    dialogLoading.value = true;
    if (props.editingIndustry) {
      await updateIndustryApi(props.editingIndustry.id, payload);
      ElMessage.success('行业已更新');
    } else {
      await addIndustryApi(payload);
      ElMessage.success('行业已新增');
    }
    emit('saved');
    emit('update:visible', false);
  } finally {
    dialogLoading.value = false;
  }
}

watch(
  () => [props.visible, props.editingIndustry?.id] as const,
  async ([visible]) => {
    if (!visible) {
      resetDialogState();
      dialogLoading.value = false;
      return;
    }
    dialogLoading.value = true;
    try {
      await initializeDialog();
    } catch {
      resetDialogState();
      emit('update:visible', false);
    } finally {
      dialogLoading.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <ElDialog v-model="dialogVisible" :title="dialogTitle" width="640px">
    <ElForm ref="formRef" :model="dialogForm" label-width="96px">
      <ElFormItem
        label="行业名称"
        prop="name"
        :rules="[
          { required: true, message: '请输入行业名称', trigger: 'blur' },
        ]"
      >
        <ElInput v-model="dialogForm.name" placeholder="请输入行业名称" />
      </ElFormItem>
      <ElFormItem label="初始品牌">
        <ElSelect
          v-model="dialogForm.brand_ids"
          class="w-full"
          collapse-tags
          collapse-tags-tooltip
          filterable
          multiple
          remote
          reserve-keyword
          placeholder="可直接选择一批初始品牌"
          :remote-method="
            (keyword: string) => loadSelectorOptions(keyword, selectorOptions)
          "
        >
          <ElOption
            v-for="item in selectorOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </ElSelect>
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
