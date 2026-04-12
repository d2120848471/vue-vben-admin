import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
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
    ],
  },
];

export default routes;
