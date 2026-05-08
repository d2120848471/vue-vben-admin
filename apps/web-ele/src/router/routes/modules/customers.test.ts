import { describe, expect, it } from 'vitest';

import routes from './customers';

describe('customers routes', () => {
  it('defines customer management routes with customer.manage authority', () => {
    expect(routes).toEqual([
      {
        children: [
          {
            component: expect.any(Function),
            meta: {
              authority: ['customer.manage'],
              title: '客户列表',
            },
            name: 'CustomerList',
            path: '/customers/list',
          },
          {
            component: expect.any(Function),
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
    ]);
  });
});
