import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      authority: ['config.sms', 'config.system'],
      icon: 'lucide:settings',
      order: 50,
      title: '系统设置',
    },
    name: 'Settings',
    path: '/settings',
    children: [
      {
        component: () => import('#/views/myjob/settings/sms-config.vue'),
        meta: {
          authority: ['config.sms'],
          title: '短信配置',
        },
        name: 'SMSConfig',
        path: '/settings/sms',
      },
      {
        component: () => import('#/views/myjob/settings/system-config.vue'),
        meta: {
          authority: ['config.system'],
          title: '系统参数配置',
        },
        name: 'SystemConfig',
        path: '/settings/system',
      },
    ],
  },
];

export default routes;
