import type { Router } from 'vue-router';

import type { RouteRecordRaw } from '@vben/types';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { hasAuthority, startProgress, stopProgress } from '@vben/utils';

import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore, useCustomerAuthStore } from '#/store';

import { generateAccess } from './access';

function findRouteByPath(
  path: string,
  routes: RouteRecordRaw[] = accessRoutes,
): null | RouteRecordRaw {
  for (const route of routes) {
    if (route.path === path) {
      return route;
    }
    if (route.children?.length) {
      const matched = findRouteByPath(path, route.children);
      if (matched) {
        return matched;
      }
    }
  }
  return null;
}

function resolveForbiddenRedirect(path: string, accessCodes: string[]) {
  const targetRoute = findRouteByPath(path);
  if (!targetRoute || hasAuthority(targetRoute, accessCodes)) {
    return null;
  }
  return {
    path: '/forbidden',
    replace: true,
  };
}

/**
 * 通用守卫配置
 */
function setupCommonGuard(router: Router) {
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    loadedPaths.add(to.path);

    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 客户侧登录态守卫配置，客户 token 不进入后台权限访问守卫。
 */
function setupCustomerGuard(router: Router) {
  router.beforeEach((to) => {
    const customerAuthStore = useCustomerAuthStore();
    const isCustomerAuthRoute = to.path.startsWith('/customer/auth');
    const isCustomerHomeRoute = to.path === '/customer/home';

    if (to.path === '/customer/auth/login' && customerAuthStore.token) {
      return { path: '/customer/home', replace: true };
    }

    if (isCustomerHomeRoute && !customerAuthStore.token) {
      return { path: '/customer/auth/login', replace: true };
    }

    if (isCustomerAuthRoute || isCustomerHomeRoute) {
      return true;
    }

    return true;
  });
}

/**
 * 权限访问守卫配置
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    if (coreRouteNames.includes(to.name as string)) {
      if (to.path === LOGIN_PATH && accessStore.accessToken) {
        return decodeURIComponent(
          (to.query?.redirect as string) ||
            userStore.userInfo?.homePath ||
            preferences.app.defaultHomePath,
        );
      }
      return true;
    }

    if (!accessStore.accessToken) {
      if (to.meta.ignoreAccess) {
        return true;
      }

      if (to.fullPath !== LOGIN_PATH) {
        return {
          path: LOGIN_PATH,
          query:
            to.fullPath === preferences.app.defaultHomePath
              ? {}
              : { redirect: encodeURIComponent(to.fullPath) },
          replace: true,
        };
      }
      return to;
    }

    if (accessStore.isAccessChecked) {
      return resolveForbiddenRedirect(to.path, accessStore.accessCodes) || true;
    }

    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
    const accessCodes = accessStore.accessCodes;

    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      accessCodes,
      router,
      routes: accessRoutes,
    });

    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);

    const redirectPath = decodeURIComponent(
      (from.query.redirect ??
        (to.path === preferences.app.defaultHomePath
          ? userInfo.homePath || preferences.app.defaultHomePath
          : to.fullPath)) as string,
    );

    return (
      resolveForbiddenRedirect(redirectPath, accessCodes) || {
        ...router.resolve(redirectPath),
        replace: true,
      }
    );
  });
}

function createRouterGuard(router: Router) {
  setupCommonGuard(router);
  setupCustomerGuard(router);
  setupAccessGuard(router);
}

export { createRouterGuard };
