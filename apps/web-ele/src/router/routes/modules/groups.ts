import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      authority: ['admin.department'],
      icon: 'lucide:shield-check',
      order: 30,
      title: '用户组与授权',
    },
    name: 'Groups',
    path: '/groups',
    children: [
      {
        component: () => import('#/views/myjob/groups/index.vue'),
        meta: {
          authority: ['admin.department'],
          title: '用户组与授权',
        },
        name: 'GroupList',
        path: '/groups/list',
      },
    ],
  },
];

export default routes;
