import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      hideInMenu: true,
      title: '个人资料',
    },
    name: 'Profile',
    path: '/profile',
  },
];

export default routes;
