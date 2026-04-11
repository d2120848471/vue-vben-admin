import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      authority: ['admin.action', 'admin.loginlog'],
      icon: 'lucide:file-search',
      order: 40,
      title: '审计日志',
    },
    name: 'Audit',
    path: '/audit',
    children: [
      {
        component: () => import('#/views/myjob/audit/operation-log.vue'),
        meta: {
          authority: ['admin.action'],
          title: '操作日志',
        },
        name: 'OperationLog',
        path: '/audit/operations',
      },
      {
        component: () => import('#/views/myjob/audit/login-log.vue'),
        meta: {
          authority: ['admin.loginlog'],
          title: '登录日志',
        },
        name: 'LoginLog',
        path: '/audit/logins',
      },
    ],
  },
];

export default routes;
