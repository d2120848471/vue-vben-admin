import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    children: [
      {
        component: () => import('#/views/myjob/customers/index.vue'),
        meta: {
          authority: ['customer.manage'],
          title: '客户列表',
        },
        name: 'CustomerList',
        path: '/customers/list',
      },
      {
        component: () => import('#/views/myjob/customers/trash.vue'),
        meta: {
          authority: ['customer.manage'],
          title: '客户回收站',
        },
        name: 'CustomerTrash',
        path: '/customers/trash',
      },
    ],
    meta: {
      authority: ['customer.manage'],
      icon: 'lucide:contact',
      order: 40,
      title: '客户管理',
    },
    name: 'Customers',
    path: '/customers',
  },
];

export default routes;
