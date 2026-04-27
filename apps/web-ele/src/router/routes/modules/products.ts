import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      authority: [
        'product.brand',
        'product.industry',
        'product.goods',
        'product.template',
        'product.purchase_limit',
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
        component: () => import('#/views/myjob/products/brands/index.vue'),
        meta: {
          authority: ['product.brand'],
          title: '品牌管理',
        },
        name: 'ProductBrands',
        path: '/products/brands',
      },
      {
        component: () => import('#/views/myjob/products/industries/index.vue'),
        meta: {
          authority: ['product.industry'],
          title: '行业管理',
        },
        name: 'ProductIndustries',
        path: '/products/industries',
      },
      {
        component: () => import('#/views/myjob/products/goods/index.vue'),
        meta: {
          authority: ['product.goods'],
          title: '商品列表',
        },
        name: 'ProductGoods',
        path: '/products/goods',
      },
      {
        component: () => import('#/views/myjob/products/templates/index.vue'),
        meta: {
          authority: ['product.template'],
          title: '充值模板管理',
        },
        name: 'ProductRechargeTemplates',
        path: '/products/templates',
      },
      {
        component: () =>
          import('#/views/myjob/products/purchase-limits/index.vue'),
        meta: {
          authority: ['product.purchase_limit'],
          title: '商品购买数量限制策略',
        },
        name: 'ProductPurchaseLimits',
        path: '/products/purchase-limits',
      },
      {
        component: () =>
          import('#/views/myjob/products/recharge-risks/index.vue'),
        meta: {
          authority: ['order.recharge_risk'],
          title: '风控管理',
        },
        name: 'ProductRechargeRisks',
        path: '/products/recharge-risks',
      },
      {
        component: () => import('#/views/myjob/products/suppliers/index.vue'),
        meta: {
          authority: ['supplier.index'],
          title: '第三方对接',
        },
        name: 'ProductSuppliers',
        path: '/products/suppliers',
      },
    ],
  },
];

export default routes;
