import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  addAdminUserApi,
  addGroupApi,
  addSubjectApi,
  cancelAdminUserBusinessApi,
  deleteAdminUserApi,
  deleteGroupApi,
  getAdminUserTrashApi,
  getAdminUsersApi,
  getGroupAuthApi,
  getGroupsApi,
  getLoginLogsApi,
  getOperationLogsApi,
  getPermissionTreeApi,
  getSMSConfigApi,
  getSubjectsApi,
  restoreAdminUserApi,
  saveGroupAuthApi,
  saveSMSConfigApi,
  setAdminUserBusinessApi,
  updateAdminUserNotifyApi,
  updateAdminUserStatusApi,
  updateGroupStatusApi,
} from '#/api/modules/admin';
import {
  loginApi,
  logoutApi,
  sendLoginSmsApi,
  verifyLoginSmsApi,
} from '#/api/core/auth';
import { getUserInfoApi } from '#/api/core/user';

const requestClientMock = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  request: vi.fn(),
}));

vi.mock('#/api/request', () => ({
  requestClient: requestClientMock,
}));

describe('myjob api contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the refactored auth endpoints and methods', async () => {
    requestClientMock.post.mockResolvedValueOnce({ ok: true });
    requestClientMock.post.mockResolvedValueOnce({ ok: true });
    requestClientMock.post.mockResolvedValueOnce({ ok: true });
    requestClientMock.get.mockResolvedValueOnce({ ok: true });
    requestClientMock.delete.mockResolvedValueOnce({ ok: true });

    await loginApi({ password: 'secret', username: 'root' });
    await sendLoginSmsApi({ login_token: 'login-token' });
    await verifyLoginSmsApi({
      login_token: 'login-token',
      sms_code: '123456',
    });
    await getUserInfoApi();
    await logoutApi();

    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      1,
      '/admin/auth/login',
      {
        password: 'secret',
        username: 'root',
      },
    );
    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      2,
      '/admin/auth/sms/send',
      { login_token: 'login-token' },
    );
    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      3,
      '/admin/auth/sms/verify',
      {
        login_token: 'login-token',
        sms_code: '123456',
      },
    );
    expect(requestClientMock.get).toHaveBeenCalledWith('/admin/auth/me');
    expect(requestClientMock.delete).toHaveBeenCalledWith(
      '/admin/auth/session',
    );
  });

  it('uses the refactored user endpoints', async () => {
    const payload = {
      group_id: 2,
      phone: '13800000000',
      real_name: '张三',
      username: 'zhangsan',
    };

    requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
    requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
    requestClientMock.post.mockResolvedValueOnce({ id: 10 });
    requestClientMock.delete.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.post.mockResolvedValueOnce(undefined);
    requestClientMock.delete.mockResolvedValueOnce(undefined);

    await getAdminUsersApi({ page: 1, page_size: 20 });
    await getAdminUserTrashApi({ page: 2, page_size: 10 });
    await addAdminUserApi(payload);
    await deleteAdminUserApi(8);
    await updateAdminUserStatusApi(8, 1);
    await updateAdminUserNotifyApi(8, 1);
    await restoreAdminUserApi(8);
    await setAdminUserBusinessApi([1, 2]);
    await cancelAdminUserBusinessApi([1, 2]);

    expect(requestClientMock.get).toHaveBeenNthCalledWith(1, '/admin/users', {
      params: { page: 1, page_size: 20 },
    });
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      2,
      '/admin/users/trash',
      {
        params: { page: 2, page_size: 10 },
      },
    );
    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      1,
      '/admin/users',
      payload,
    );
    expect(requestClientMock.delete).toHaveBeenNthCalledWith(
      1,
      '/admin/users/8',
    );
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      1,
      '/admin/users/8/status',
      {
        data: { status: 1 },
        method: 'PATCH',
      },
    );
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      2,
      '/admin/users/8/notify',
      {
        data: { balance_notify: 1 },
        method: 'PATCH',
      },
    );
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      3,
      '/admin/users/8/restore',
      {
        method: 'PATCH',
      },
    );
    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      2,
      '/admin/users/business',
      { ids: [1, 2] },
    );
    expect(requestClientMock.delete).toHaveBeenNthCalledWith(
      2,
      '/admin/users/business',
      { data: { ids: [1, 2] } },
    );
  });

  it('uses the refactored group, subject, log and settings endpoints', async () => {
    requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
    requestClientMock.post.mockResolvedValueOnce({ id: 2 });
    requestClientMock.delete.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.get.mockResolvedValueOnce({ menu_ids: [1, 2] });
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.get.mockResolvedValueOnce({
      list: [{ id: 1, name: '员工管理' }],
    });
    requestClientMock.get.mockResolvedValueOnce({ list: [] });
    requestClientMock.post.mockResolvedValueOnce({ id: 3 });
    requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
    requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
    requestClientMock.get.mockResolvedValueOnce({ sign_name: '玖权益' });
    requestClientMock.put.mockResolvedValueOnce(undefined);

    await getGroupsApi({ page: 1, page_size: 50 });
    await addGroupApi({ description: 'desc', name: 'ops' });
    await deleteGroupApi(6);
    await updateGroupStatusApi(6, 1);
    await getGroupAuthApi(6);
    await saveGroupAuthApi(6, [1, 2]);
    await expect(getPermissionTreeApi()).resolves.toEqual([
      { id: 1, name: '员工管理' },
    ]);
    await getSubjectsApi();
    await addSubjectApi({ has_tax: 1, name: '主体A' });
    await getOperationLogsApi({ page: 1, page_size: 20 });
    await getLoginLogsApi({ page: 1, page_size: 20 });
    await getSMSConfigApi();
    await saveSMSConfigApi({
      access_key: 'ak',
      access_key_secret: 'sk',
      expire_minutes: 30,
      interval_minutes: 1,
      keep_access_key: false,
      keep_access_key_secret: false,
      sign_name: 'sign',
      template_code: 'tpl',
    });

    expect(requestClientMock.get).toHaveBeenNthCalledWith(1, '/admin/groups', {
      params: { page: 1, page_size: 50 },
    });
    expect(requestClientMock.post).toHaveBeenNthCalledWith(1, '/admin/groups', {
      description: 'desc',
      name: 'ops',
    });
    expect(requestClientMock.delete).toHaveBeenNthCalledWith(
      1,
      '/admin/groups/6',
    );
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      1,
      '/admin/groups/6/status',
      {
        data: { status: 1 },
        method: 'PATCH',
      },
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      2,
      '/admin/groups/6/permissions',
    );
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      2,
      '/admin/groups/6/permissions',
      {
        data: { menu_ids: [1, 2] },
        method: 'PATCH',
      },
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      3,
      '/admin/menus/tree',
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(4, '/admin/subjects');
    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      2,
      '/admin/subjects',
      { has_tax: 1, name: '主体A' },
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      5,
      '/admin/logs/operations',
      {
        params: { page: 1, page_size: 20 },
      },
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      6,
      '/admin/logs/logins',
      {
        params: { page: 1, page_size: 20 },
      },
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      7,
      '/admin/settings/sms',
    );
    expect(requestClientMock.put).toHaveBeenCalledWith('/admin/settings/sms', {
      access_key: 'ak',
      access_key_secret: 'sk',
      expire_minutes: 30,
      interval_minutes: 1,
      keep_access_key: false,
      keep_access_key_secret: false,
      sign_name: 'sign',
      template_code: 'tpl',
    });
  });
});
