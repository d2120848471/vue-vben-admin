import { describe, expect, it } from 'vitest';

import { coreRoutes } from './core';

describe('core routes', () => {
  it('defines customer auth and home routes outside admin menu routes', () => {
    const customerAuth = coreRoutes.find(
      (route) => route.name === 'CustomerAuthentication',
    );
    expect(customerAuth).toMatchObject({
      meta: { hideInTab: true, title: '客户认证' },
      path: '/customer/auth',
      redirect: '/customer/auth/login',
    });
    expect(customerAuth?.children?.map((route) => route.path)).toEqual([
      'login',
      'register',
      'forgot-password',
    ]);

    const customerHome = coreRoutes.find(
      (route) => route.name === 'CustomerHome',
    );
    expect(customerHome).toMatchObject({
      meta: { hideInBreadcrumb: true, hideInMenu: true, title: '客户首页' },
      path: '/customer/home',
    });
  });
});
