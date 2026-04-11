<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed, onMounted, ref } from 'vue';

import { ProfileBaseSetting } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

const profileBaseSettingRef = ref();
const userStore = useUserStore();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'Input',
      fieldName: 'realName',
      label: '姓名',
    },
    {
      component: 'Input',
      fieldName: 'username',
      label: '用户名',
    },
    {
      component: 'Input',
      fieldName: 'groupName',
      label: '所属用户组',
    },
    {
      component: 'Input',
      fieldName: 'isBusinessLabel',
      label: '商务账号',
    },
  ];
});

onMounted(async () => {
  profileBaseSettingRef.value.getFormApi().setValues({
    ...userStore.userInfo,
    isBusinessLabel: userStore.userInfo?.isBusiness ? '是' : '否',
  });
});
</script>
<template>
  <ProfileBaseSetting ref="profileBaseSettingRef" :form-schema="formSchema" />
</template>
