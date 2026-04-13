import type { RouteRecordRaw } from 'vue-router';

import { describe, expect, it, vi } from 'vitest';

import {
  generateRoutesByFrontend,
  hasAuthority,
} from '../generate-routes-frontend';

const forbiddenComponent = vi.fn();

const mockRoutes = [
  {
    meta: {
      authority: ['admin.list', 'subject.manage'],
      hideInMenu: false,
    },
    path: '/employees',
    children: [
      {
        path: '/employees/list',
        meta: { authority: ['admin.list'], hideInMenu: false },
      },
      {
        path: '/employees/trash',
        meta: { authority: ['admin.list'], hideInMenu: true },
      },
    ],
  },
  {
    meta: {
      authority: ['config.sms'],
      hideInMenu: false,
      menuVisibleWithForbidden: true,
    },
    path: '/settings/sms',
    component: () => null,
  },
  {
    meta: { hideInMenu: false },
    path: '/home',
  },
] as RouteRecordRaw[];

describe('hasAuthority', () => {
  it('returns true if there is no authority defined', () => {
    expect(hasAuthority(mockRoutes[2], ['admin.list'])).toBe(true);
  });

  it('returns true if the user has the required permission code', () => {
    expect(hasAuthority(mockRoutes[0], ['admin.list'])).toBe(true);
  });

  it('returns false if the user does not have the required permission code', () => {
    expect(hasAuthority(mockRoutes[0], ['config.sms'])).toBe(false);
  });

  it('keeps route accessible when menuVisibleWithForbidden is enabled', () => {
    expect(hasAuthority(mockRoutes[1], ['admin.list'])).toBe(true);
  });
});

describe('generateRoutesByFrontend', () => {
  it('keeps routes without authority', async () => {
    const generatedRoutes = await generateRoutesByFrontend(mockRoutes, [
      'admin.list',
    ]);

    expect(generatedRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/home',
        }),
      ]),
    );
  });

  it('filters routes when permission codes are missing', async () => {
    const generatedRoutes = await generateRoutesByFrontend(mockRoutes, []);

    expect(generatedRoutes).toEqual([
      {
        component: expect.any(Function),
        meta: {
          authority: ['config.sms'],
          hideInMenu: false,
          menuVisibleWithForbidden: true,
        },
        path: '/settings/sms',
      },
      {
        meta: { hideInMenu: false },
        path: '/home',
      },
    ]);
  });

  it('replaces forbidden-visible routes with the forbidden component', async () => {
    const generatedRoutes = await generateRoutesByFrontend(
      mockRoutes,
      ['admin.list'],
      forbiddenComponent,
    );

    expect(generatedRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          component: forbiddenComponent,
          path: '/settings/sms',
        }),
      ]),
    );
  });

  it('keeps the product parent route when only one child permission is present', async () => {
    const routesWithProducts = [
      {
        path: '/products',
        meta: {
          authority: ['product.brand', 'product.industry', 'product.template'],
        },
        children: [
          {
            path: '/products/brands',
            meta: { authority: ['product.brand'] },
          },
          {
            path: '/products/industries',
            meta: { authority: ['product.industry'] },
          },
          {
            path: '/products/templates',
            meta: { authority: ['product.template'] },
          },
        ],
      },
    ] as RouteRecordRaw[];

    const generatedRoutes = await generateRoutesByFrontend(routesWithProducts, [
      'product.template',
    ]);

    expect(generatedRoutes).toEqual([
      {
        path: '/products',
        meta: {
          authority: ['product.brand', 'product.industry', 'product.template'],
        },
        children: [
          {
            path: '/products/templates',
            meta: { authority: ['product.template'] },
          },
        ],
      },
    ]);
  });

  it('handles missing meta fields', async () => {
    const routesWithMissingMeta = [
      { path: '/path1' },
      { meta: {}, path: '/path2' },
      { meta: { authority: ['admin.list'] }, path: '/path3' },
    ];

    const generatedRoutes = await generateRoutesByFrontend(
      routesWithMissingMeta as RouteRecordRaw[],
      ['admin.list'],
    );

    expect(generatedRoutes).toEqual([
      { path: '/path1' },
      { meta: {}, path: '/path2' },
      { meta: { authority: ['admin.list'] }, path: '/path3' },
    ]);
  });
});
