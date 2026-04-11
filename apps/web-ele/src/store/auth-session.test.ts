import { describe, expect, it } from 'vitest';

import {
  classifyAuthFailure,
  mapBackendUserToUserInfo,
  normalizeCurrentUserResult,
  normalizeLoginResult,
} from './auth-session';

describe('auth-session', () => {
  it('maps direct login payload into authenticated session', () => {
    const result = normalizeLoginResult({
      need_sms_verify: false,
      permissions: ['admin.list', 'subject.manage'],
      token: 'token-1',
      user: {
        group_id: 2,
        group_name: '运营组',
        id: 7,
        is_business: 1,
        real_name: '张三',
        username: 'zhangsan',
      },
    });

    expect(result.type).toBe('authenticated');
    if (result.type !== 'authenticated') {
      throw new Error('expected authenticated result');
    }
    expect(result.session.accessToken).toBe('token-1');
    expect(result.session.accessCodes).toEqual([
      'admin.list',
      'subject.manage',
    ]);
    expect(result.session.userInfo).toMatchObject({
      groupId: '2',
      groupName: '运营组',
      homePath: '/home',
      isBusiness: true,
      realName: '张三',
      roles: [],
      userId: '7',
      username: 'zhangsan',
    });
  });

  it('maps sms challenge payload into sms step state', () => {
    const result = normalizeLoginResult({
      login_token: 'login-token-1',
      need_sms_verify: true,
      phone: '138****5678',
      reason: 'first_login',
    });

    expect(result).toEqual({
      challenge: {
        loginToken: 'login-token-1',
        phone: '138****5678',
        reason: 'first_login',
      },
      type: 'sms',
    });
  });

  it('maps /me payload into current user session', () => {
    const result = normalizeCurrentUserResult({
      permissions: ['admin.department'],
      user: {
        group_id: 0,
        group_name: '超级管理员',
        id: 1,
        is_business: 0,
        real_name: '超管',
        username: 'root',
      },
    });

    expect(result.accessCodes).toEqual(['admin.department']);
    expect(result.userInfo).toMatchObject({
      groupId: '0',
      groupName: '超级管理员',
      homePath: '/home',
      isBusiness: false,
      realName: '超管',
      userId: '1',
      username: 'root',
    });
  });

  it('classifies disabled account and group as force logout', () => {
    expect(classifyAuthFailure(403, '账号已被禁用，请联系管理员')).toBe(
      'force-logout',
    );
    expect(classifyAuthFailure(403, '用户组已被禁用')).toBe('force-logout');
  });

  it('classifies ordinary forbidden response without logging out', () => {
    expect(classifyAuthFailure(403, '无权限访问')).toBe('forbidden');
    expect(classifyAuthFailure(403, '仅超级管理员可访问')).toBe('forbidden');
    expect(classifyAuthFailure(500, '服务异常')).toBe('none');
  });

  it('maps backend user into compatible UserInfo shape', () => {
    expect(
      mapBackendUserToUserInfo({
        group_id: 3,
        group_name: '财务组',
        id: 9,
        is_business: 0,
        real_name: '李四',
        username: 'lisi',
      }),
    ).toEqual({
      avatar: '',
      groupId: '3',
      groupName: '财务组',
      homePath: '/home',
      isBusiness: false,
      realName: '李四',
      roles: [],
      userId: '9',
      username: 'lisi',
    });
  });
});
