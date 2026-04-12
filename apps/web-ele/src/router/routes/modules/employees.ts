import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      authority: [
        'admin.action',
        'admin.department',
        'admin.list',
        'admin.loginlog',
        'subject.manage',
      ],
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
      {
        component: () => import('#/views/myjob/subjects/index.vue'),
        meta: {
          authority: ['subject.manage'],
          title: '主体配置',
        },
        name: 'SubjectList',
        path: '/subjects/list',
      },
      {
        component: () => import('#/views/myjob/groups/index.vue'),
        meta: {
          authority: ['admin.department'],
          title: '用户组与授权',
        },
        name: 'GroupList',
        path: '/groups/list',
      },
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
