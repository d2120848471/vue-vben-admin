import type { RouteRecordRaw } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';

const BasicLayout = () => import('#/layouts/basic.vue');
const AuthPageLayout = () => import('#/layouts/auth.vue');

const fallbackNotFoundRoute: RouteRecordRaw = {
  component: () => import('#/views/_core/fallback/not-found.vue'),
  meta: {
    hideInBreadcrumb: true,
    hideInMenu: true,
    hideInTab: true,
    title: '404',
  },
  name: 'FallbackNotFound',
  path: '/:path(.*)*',
};

const coreRoutes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      hideInBreadcrumb: true,
      title: 'Root',
    },
    name: 'Root',
    path: '/',
    redirect: preferences.app.defaultHomePath,
    children: [],
  },
  {
    component: AuthPageLayout,
    meta: {
      hideInTab: true,
      title: 'Authentication',
    },
    name: 'Authentication',
    path: '/auth',
    redirect: LOGIN_PATH,
    children: [
      {
        component: () => import('#/views/_core/authentication/login.vue'),
        meta: {
          title: '登录',
        },
        name: 'Login',
        path: 'login',
      },
    ],
  },
  {
    component: AuthPageLayout,
    meta: {
      hideInTab: true,
      title: '客户认证',
    },
    name: 'CustomerAuthentication',
    path: '/customer/auth',
    redirect: '/customer/auth/login',
    children: [
      {
        component: () => import('#/views/customer/auth/login.vue'),
        meta: { title: '客户登录' },
        name: 'CustomerLogin',
        path: 'login',
      },
      {
        component: () => import('#/views/customer/auth/register.vue'),
        meta: { title: '客户注册' },
        name: 'CustomerRegister',
        path: 'register',
      },
      {
        component: () => import('#/views/customer/auth/forgot-password.vue'),
        meta: { title: '忘记密码' },
        name: 'CustomerForgotPassword',
        path: 'forgot-password',
      },
    ],
  },
  {
    component: () => import('#/views/customer/home/index.vue'),
    meta: {
      hideInBreadcrumb: true,
      hideInMenu: true,
      hideInTab: true,
      title: '客户首页',
    },
    name: 'CustomerHome',
    path: '/customer/home',
  },
  {
    component: () => import('#/views/_core/fallback/forbidden.vue'),
    meta: {
      hideInBreadcrumb: true,
      hideInMenu: true,
      hideInTab: true,
      title: '403',
    },
    name: 'Forbidden',
    path: '/forbidden',
  },
];

export { coreRoutes, fallbackNotFoundRoute };
