import { describe, expect, it } from 'vitest';

import routes from './products';

describe('products routes', () => {
  it('defines the product parent and child routes', () => {
    expect(routes).toEqual([
      {
        meta: {
          authority: [
            'product.brand',
            'product.industry',
            'product.goods',
            'product.template',
            'product.purchase_limit',
            'product.price_change',
            'supplier.index',
            'order.recharge_risk',
          ],
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
          {
            component: expect.any(Function),
            meta: {
              authority: ['product.goods'],
              title: '商品列表',
            },
            name: 'ProductGoods',
            path: '/products/goods',
          },
          {
            component: expect.any(Function),
            meta: {
              authority: ['product.template'],
              title: '充值模板管理',
            },
            name: 'ProductRechargeTemplates',
            path: '/products/templates',
          },
          {
            component: expect.any(Function),
            meta: {
              authority: ['product.purchase_limit'],
              title: '商品购买数量限制策略',
            },
            name: 'ProductPurchaseLimits',
            path: '/products/purchase-limits',
          },
          {
            component: expect.any(Function),
            meta: {
              authority: ['product.price_change'],
              title: '自动改价记录',
            },
            name: 'ProductPriceChanges',
            path: '/products/price-changes',
          },
          {
            component: expect.any(Function),
            meta: {
              authority: ['order.recharge_risk'],
              title: '风控管理',
            },
            name: 'ProductRechargeRisks',
            path: '/products/recharge-risks',
          },
          {
            component: expect.any(Function),
            meta: {
              authority: ['supplier.index'],
              title: '第三方对接',
            },
            name: 'ProductSuppliers',
            path: '/products/suppliers',
          },
        ],
      },
    ]);
  });
});
