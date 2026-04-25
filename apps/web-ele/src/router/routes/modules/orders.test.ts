import { describe, expect, it } from 'vitest';

import routes from './orders';

describe('orders routes', () => {
  it('defines the orders parent and list route', () => {
    expect(routes).toEqual([
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
            component: expect.any(Function),
            meta: {
              authority: ['order.manage'],
              title: '订单记录',
            },
            name: 'OrderList',
            path: '/orders/list',
          },
        ],
      },
    ]);
  });
});
