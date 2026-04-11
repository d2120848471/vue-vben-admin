import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      authority: ['subject.manage'],
      icon: 'lucide:building-2',
      order: 20,
      title: '主体配置',
    },
    name: 'Subjects',
    path: '/subjects',
    children: [
      {
        component: () => import('#/views/myjob/subjects/index.vue'),
        meta: {
          authority: ['subject.manage'],
          title: '主体配置',
        },
        name: 'SubjectList',
        path: '/subjects/list',
      },
    ],
  },
];

export default routes;
