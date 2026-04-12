import { describe, expect, it } from 'vitest';

import routes from './products';

describe('products routes', () => {
  it('defines the product parent and child routes', () => {
    expect(routes).toEqual([
      {
        meta: {
          authority: ['product.brand', 'product.industry'],
          icon: 'lucide:package',
          order: 20,
          title: '商品管理',
        },
        name: 'Products',
        path: '/products',
        children: [
          {
            component: expect.any(Function),
            meta: {
              authority: ['product.brand'],
              title: '品牌管理',
            },
            name: 'ProductBrands',
            path: '/products/brands',
          },
          {
            component: expect.any(Function),
            meta: {
              authority: ['product.industry'],
              title: '行业管理',
            },
            name: 'ProductIndustries',
            path: '/products/industries',
          },
        ],
      },
    ]);
  });
});
