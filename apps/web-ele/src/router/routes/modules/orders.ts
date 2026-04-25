import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      authority: ['order.manage'],
      icon: 'lucide:receipt-text',
      order: 30,
      title: '订单管理',
    },
    name: 'Orders',
    path: '/orders',
    children: [
      {
        component: () => import('#/views/myjob/orders/index.vue'),
        meta: {
          authority: ['order.manage'],
          title: '订单记录',
        },
        name: 'OrderList',
        path: '/orders/list',
      },
    ],
  },
];

export default routes;
