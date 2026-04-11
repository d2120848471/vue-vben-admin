import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      authority: ['admin.list'],
      icon: 'lucide:users',
      order: 10,
      title: '员工管理',
    },
    name: 'Employees',
    path: '/employees',
    children: [
      {
        component: () => import('#/views/myjob/employees/list.vue'),
        meta: {
          authority: ['admin.list'],
          title: '员工列表',
        },
        name: 'EmployeeList',
        path: '/employees/list',
      },
      {
        component: () => import('#/views/myjob/employees/trash.vue'),
        meta: {
          authority: ['admin.list'],
          title: '回收站',
        },
        name: 'EmployeeTrash',
        path: '/employees/trash',
      },
    ],
  },
];

export default routes;
