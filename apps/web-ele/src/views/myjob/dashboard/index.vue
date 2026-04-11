<script lang="ts" setup>
import { computed } from 'vue';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

const userStore = useUserStore();

const welcomeText = computed(() => {
  return userStore.userInfo?.realName
    ? `${userStore.userInfo.realName}，欢迎回到 MyJob 后台。`
    : '欢迎回到 MyJob 后台。';
});
</script>

<template>
  <Page
    description="仪表盘暂时保留为空白展示区，后续可在这里接入业务看板。"
    title="首页"
  >
    <div class="grid gap-5 lg:grid-cols-[2fr_1fr]">
      <section
        class="rounded-3xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 p-8 text-white shadow-lg shadow-cyan-500/15"
      >
        <p class="text-sm uppercase tracking-[0.35em] text-white/70">
          MyJob Admin
        </p>
        <h2 class="mt-4 text-3xl font-semibold">{{ welcomeText }}</h2>
        <p class="mt-4 max-w-2xl text-sm leading-7 text-white/85">
          当前首页只保留基础欢迎区和空白占位，不承载员工、日志、授权等业务入口。
          后续需要接入统计卡片、图表或业务概览时，直接在这个区域继续扩展即可。
        </p>
      </section>
      <section
        class="rounded-3xl border border-dashed border-border bg-card/80 p-6"
      >
        <p class="text-sm font-medium text-foreground">后续展示区</p>
        <div
          class="mt-4 flex min-h-52 items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground"
        >
          暂无展示内容
        </div>
      </section>
    </div>
  </Page>
</template>
