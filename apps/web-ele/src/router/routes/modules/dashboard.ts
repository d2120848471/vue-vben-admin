import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:house',
      order: -1,
      title: '首页',
    },
    name: 'Dashboard',
    path: '/dashboard',
    children: [
      {
        component: () => import('#/views/myjob/dashboard/index.vue'),
        meta: {
          affixTab: true,
          title: '首页',
        },
        name: 'DashboardHome',
        path: '/home',
      },
    ],
  },
];

export default routes;
