import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  loginApi,
  logoutApi,
  sendLoginSmsApi,
  verifyLoginSmsApi,
} from '#/api/core/auth';
import { getUserInfoApi } from '#/api/core/user';
import * as adminApiModule from '#/api/modules/admin';
import {
  addAdminUserApi,
  addBrandApi,
  addGroupApi,
  addIndustryApi,
  addIndustryRelationBrandsApi,
  addProductTemplateApi,
  addSubjectApi,
  addSupplierPlatformApi,
  batchDeleteProductTemplateApi,
  cancelAdminUserBusinessApi,
  deleteAdminUserApi,
  deleteBrandApi,
  deleteGroupApi,
  deleteIndustryApi,
  deleteIndustryRelationBrandsApi,
  deleteProductTemplateApi,
  deleteSupplierPlatformApi,
  getAdminUsersApi,
  getAdminUserTrashApi,
  getBrandChildrenApi,
  getBrandListApi,
  getBrandSelectorApi,
  getGroupAuthApi,
  getGroupsApi,
  getIndustryListApi,
  getIndustryRelationBrandsApi,
  getLoginLogsApi,
  getOperationLogsApi,
  getPermissionTreeApi,
  getProductTemplateListApi,
  getProductTemplateValidateTypesApi,
  getSMSConfigApi,
  getSubjectsApi,
  getSupplierPlatformDetailApi,
  getSupplierPlatformListApi,
  getSupplierPlatformTypesApi,
  getSystemSettingsApi,
  refreshSupplierPlatformBalanceApi,
  restoreAdminUserApi,
  saveGroupAuthApi,
  saveSMSConfigApi,
  saveSystemSettingsApi,
  setAdminUserBusinessApi,
  sortBrandApi,
  sortIndustryApi,
  sortIndustryRelationBrandApi,
  toggleBrandVisibilityApi,
  updateAdminUserNotifyApi,
  updateAdminUserStatusApi,
  updateBrandApi,
  updateGroupStatusApi,
  updateIndustryApi,
  updateProductTemplateApi,
  updateSupplierPlatformApi,
  uploadBrandImageApi,
} from '#/api/modules/admin';

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
    vi.resetAllMocks();
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

  it('uses the product brand and industry endpoints', async () => {
    requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
    requestClientMock.get.mockResolvedValueOnce({ list: [] });
    requestClientMock.post.mockResolvedValueOnce({ id: 11 });
    requestClientMock.put.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.delete.mockResolvedValueOnce(undefined);
    requestClientMock.post.mockResolvedValueOnce({
      url: '/uploads/brands/icon.png',
    });
    requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
    requestClientMock.get.mockResolvedValueOnce({ list: [] });
    requestClientMock.get.mockResolvedValueOnce({ industry_id: 7, list: [] });
    requestClientMock.post.mockResolvedValueOnce({ id: 7 });
    requestClientMock.put.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.post.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.delete.mockResolvedValueOnce(undefined);
    requestClientMock.delete.mockResolvedValueOnce(undefined);

    await getBrandListApi({ name: '腾讯', page: 1, page_size: 20 });
    await getBrandChildrenApi(11);
    await addBrandApi({
      credential_image: '',
      description: '视频会员',
      icon: '',
      is_visible: 1,
      name: '腾讯视频',
      parent_id: 0,
    });
    await updateBrandApi(11, {
      credential_image: '/uploads/brands/license.png',
      description: '已更新',
      icon: '/uploads/brands/icon.png',
      is_visible: 0,
      name: '腾讯视频',
    });
    await sortBrandApi(11, 'top');
    await toggleBrandVisibilityApi(11, 0);
    await deleteBrandApi(11);

    const formData = new FormData();
    formData.append('type', 'icon');
    await uploadBrandImageApi(formData);

    await getIndustryListApi({ name: '视频', page: 1, page_size: 20 });
    await getBrandSelectorApi({ name: '腾讯' });
    await getIndustryRelationBrandsApi(7, { name: '腾' });
    await addIndustryApi({ brand_ids: [11], name: '视频会员' });
    await updateIndustryApi(7, { brand_ids: [11, 12], name: '视频娱乐' });
    await sortIndustryApi(7, 'bottom');
    await addIndustryRelationBrandsApi(7, [12, 13]);
    await sortIndustryRelationBrandApi(7, 12, 'up');
    await deleteIndustryRelationBrandsApi(7, [13]);
    await deleteIndustryApi(7);

    expect(requestClientMock.get).toHaveBeenNthCalledWith(1, '/admin/brands', {
      params: { name: '腾讯', page: 1, page_size: 20 },
    });
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      2,
      '/admin/brands/11/children',
    );
    expect(requestClientMock.post).toHaveBeenNthCalledWith(1, '/admin/brands', {
      credential_image: '',
      description: '视频会员',
      icon: '',
      is_visible: 1,
      name: '腾讯视频',
      parent_id: 0,
    });
    expect(requestClientMock.put).toHaveBeenNthCalledWith(
      1,
      '/admin/brands/11',
      {
        credential_image: '/uploads/brands/license.png',
        description: '已更新',
        icon: '/uploads/brands/icon.png',
        is_visible: 0,
        name: '腾讯视频',
      },
    );
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      1,
      '/admin/brands/11/sort',
      {
        data: { action: 'top' },
        method: 'PATCH',
      },
    );
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      2,
      '/admin/brands/11/visibility',
      {
        data: { is_visible: 0 },
        method: 'PATCH',
      },
    );
    expect(requestClientMock.delete).toHaveBeenNthCalledWith(
      1,
      '/admin/brands/11',
    );
    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      2,
      '/admin/brands/upload',
      expect.any(FormData),
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      3,
      '/admin/industries',
      {
        params: { name: '视频', page: 1, page_size: 20 },
      },
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      4,
      '/admin/industries/brand-selector',
      {
        params: { name: '腾讯' },
      },
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      5,
      '/admin/industries/7/brands',
      {
        params: { name: '腾' },
      },
    );
    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      3,
      '/admin/industries',
      {
        brand_ids: [11],
        name: '视频会员',
      },
    );
    expect(requestClientMock.put).toHaveBeenNthCalledWith(
      2,
      '/admin/industries/7',
      {
        brand_ids: [11, 12],
        name: '视频娱乐',
      },
    );
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      3,
      '/admin/industries/7/sort',
      {
        data: { action: 'bottom' },
        method: 'PATCH',
      },
    );
    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      4,
      '/admin/industries/7/brands',
      {
        brand_ids: [12, 13],
      },
    );
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      4,
      '/admin/industries/7/brands/12/sort',
      {
        data: { action: 'up' },
        method: 'PATCH',
      },
    );
    expect(requestClientMock.delete).toHaveBeenNthCalledWith(
      2,
      '/admin/industries/7/brands',
      {
        data: { brand_ids: [13] },
      },
    );
    expect(requestClientMock.delete).toHaveBeenNthCalledWith(
      3,
      '/admin/industries/7',
    );
  });

  it('uses the product template endpoints', async () => {
    requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
    requestClientMock.get.mockResolvedValueOnce({ list: [] });
    requestClientMock.post.mockResolvedValueOnce({ id: 21 });
    requestClientMock.put.mockResolvedValueOnce(undefined);
    requestClientMock.delete.mockResolvedValueOnce(undefined);
    requestClientMock.delete.mockResolvedValueOnce(undefined);

    await getProductTemplateListApi({
      is_shared: '0',
      keyword: '模板',
      page: 1,
      page_size: 20,
      type: 'local',
    });
    await getProductTemplateValidateTypesApi();
    await addProductTemplateApi({
      account_name: '手机号',
      is_shared: 0,
      title: '手机号模板',
      type: 'local',
      validate_type: 1,
    });
    await updateProductTemplateApi(21, {
      account_name: '即梦账号',
      is_shared: 1,
      title: '即梦ID',
      type: 'local',
      validate_type: 6,
    });
    await deleteProductTemplateApi(21);
    await batchDeleteProductTemplateApi([21, 22]);

    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      1,
      '/admin/product-templates',
      {
        params: {
          is_shared: '0',
          keyword: '模板',
          page: 1,
          page_size: 20,
          type: 'local',
        },
      },
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      2,
      '/admin/product-templates/validate-types',
    );
    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      1,
      '/admin/product-templates',
      {
        account_name: '手机号',
        is_shared: 0,
        title: '手机号模板',
        type: 'local',
        validate_type: 1,
      },
    );
    expect(requestClientMock.put).toHaveBeenNthCalledWith(
      1,
      '/admin/product-templates/21',
      {
        account_name: '即梦账号',
        is_shared: 1,
        title: '即梦ID',
        type: 'local',
        validate_type: 6,
      },
    );
    expect(requestClientMock.delete).toHaveBeenNthCalledWith(
      1,
      '/admin/product-templates/21',
    );
    expect(requestClientMock.delete).toHaveBeenNthCalledWith(
      2,
      '/admin/product-templates',
      {
        data: { ids: [21, 22] },
      },
    );
  });

  it('uses the purchase limit strategy endpoints', async () => {
    requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
    requestClientMock.get.mockResolvedValueOnce({
      limit_types: [{ id: 1, title: '同一会员' }],
      period_types: [{ id: 1, title: '按天' }],
    });
    requestClientMock.post.mockResolvedValueOnce({ id: 31 });
    requestClientMock.put.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.delete.mockResolvedValueOnce(undefined);

    await (adminApiModule as any).getPurchaseLimitStrategyListApi({
      keyword: '一天一号',
      page: 1,
      page_size: 20,
    });
    await (adminApiModule as any).getPurchaseLimitStrategyEnumsApi();
    await (adminApiModule as any).addPurchaseLimitStrategyApi({
      limit_nums: 2,
      limit_times: 2,
      limit_type: 2,
      name: '一天一号两次',
      period: 1,
      period_type: 1,
    });
    await (adminApiModule as any).updatePurchaseLimitStrategyApi(31, {
      limit_nums: 0,
      limit_times: 5,
      limit_type: 2,
      name: '三分钟一号五次',
      period: 3,
      period_type: 2,
    });
    await (adminApiModule as any).updatePurchaseLimitStrategyStatusApi(31, 0);
    await (adminApiModule as any).deletePurchaseLimitStrategyApi(31);

    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      1,
      '/admin/purchase-limit-strategies',
      {
        params: {
          keyword: '一天一号',
          page: 1,
          page_size: 20,
        },
      },
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      2,
      '/admin/purchase-limit-strategies/enums',
    );
    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      1,
      '/admin/purchase-limit-strategies',
      {
        limit_nums: 2,
        limit_times: 2,
        limit_type: 2,
        name: '一天一号两次',
        period: 1,
        period_type: 1,
      },
    );
    expect(requestClientMock.put).toHaveBeenNthCalledWith(
      1,
      '/admin/purchase-limit-strategies/31',
      {
        limit_nums: 0,
        limit_times: 5,
        limit_type: 2,
        name: '三分钟一号五次',
        period: 3,
        period_type: 2,
      },
    );
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      1,
      '/admin/purchase-limit-strategies/31/status',
      {
        data: { status: 0 },
        method: 'PATCH',
      },
    );
    expect(requestClientMock.delete).toHaveBeenNthCalledWith(
      1,
      '/admin/purchase-limit-strategies/31',
    );
  });

  it('uses the product goods endpoints', async () => {
    const api = adminApiModule as typeof adminApiModule & {
      addProductGoodsApi?: (payload: Record<string, any>) => Promise<unknown>;
      deleteProductGoodsApi?: (id: number) => Promise<unknown>;
      getProductGoodsDetailApi?: (id: number) => Promise<unknown>;
      getProductGoodsFormOptionsApi?: () => Promise<unknown>;
      getProductGoodsListApi?: (
        params: Record<string, any>,
      ) => Promise<unknown>;
      updateProductGoodsApi?: (
        id: number,
        payload: Record<string, any>,
      ) => Promise<unknown>;
    };

    expect(typeof api.getProductGoodsListApi).toBe('function');
    expect(typeof api.getProductGoodsDetailApi).toBe('function');
    expect(typeof api.getProductGoodsFormOptionsApi).toBe('function');
    expect(typeof api.addProductGoodsApi).toBe('function');
    expect(typeof api.updateProductGoodsApi).toBe('function');
    expect(typeof api.deleteProductGoodsApi).toBe('function');

    requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
    requestClientMock.get.mockResolvedValueOnce({
      brand_id: 35,
      goods_code: 'GD0000000021',
      has_tax: 1,
      id: 21,
      name: '腾讯视频周卡',
      subject_id: 11,
      subject_name: '开票主体A',
    });
    requestClientMock.get.mockResolvedValueOnce({
      boolean_options: [{ label: '是', value: 1 }],
      brands: [],
      goods_types: [{ label: '卡密', value: 'card_secret' }],
      purchase_limit_strategies: [],
      status_options: [{ label: '启用', value: 1 }],
      subjects: [{ id: 11, name: '开票主体A' }],
      supply_types: [{ label: '渠道供货', value: 'channel' }],
      templates: [],
    });
    requestClientMock.post.mockResolvedValueOnce({
      goods_code: 'GD0000000021',
      id: 21,
    });
    requestClientMock.put.mockResolvedValueOnce(undefined);
    requestClientMock.delete.mockResolvedValueOnce(undefined);

    await api.getProductGoodsListApi?.({
      brand_id: 35,
      goods_type: 'card_secret',
      has_tax: '1',
      keyword: '腾讯',
      page: 2,
      page_size: 10,
      status: '0',
    });
    await api.getProductGoodsDetailApi?.(21);
    await api.getProductGoodsFormOptionsApi?.();
    await api.addProductGoodsApi?.({
      balance_limit: '0.0000',
      brand_id: 35,
      default_sell_price: '19.9000',
      exception_notify: 1,
      goods_type: 'card_secret',
      has_tax: 1,
      is_douyin: 0,
      is_export: 1,
      max_purchase_qty: 5,
      min_purchase_qty: 1,
      name: '腾讯视频周卡',
      product_template_id: 7,
      purchase_limit_strategy_id: 8,
      purchase_notice: '购买须知',
      status: 1,
      subject_id: 11,
      supply_type: 'channel',
      terminal_price_limit: '29.9000',
    });
    await api.updateProductGoodsApi?.(21, {
      balance_limit: '10.0000',
      brand_id: 36,
      default_sell_price: '29.9000',
      exception_notify: 0,
      goods_type: 'direct_recharge',
      has_tax: 0,
      is_douyin: 1,
      is_export: 0,
      max_purchase_qty: 6,
      min_purchase_qty: 2,
      name: '腾讯视频月卡',
      product_template_id: null,
      purchase_limit_strategy_id: 8,
      purchase_notice: '编辑须知',
      status: 0,
      subject_id: null,
      supply_type: 'channel',
      terminal_price_limit: '',
    });
    await api.deleteProductGoodsApi?.(21);

    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      1,
      '/admin/products',
      {
        params: {
          brand_id: 35,
          goods_type: 'card_secret',
          has_tax: '1',
          keyword: '腾讯',
          page: 2,
          page_size: 10,
          status: '0',
        },
      },
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      2,
      '/admin/products/21',
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      3,
      '/admin/products/form-options',
    );
    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      1,
      '/admin/products',
      {
        balance_limit: '0.0000',
        brand_id: 35,
        default_sell_price: '19.9000',
        exception_notify: 1,
        goods_type: 'card_secret',
        has_tax: 1,
        is_douyin: 0,
        is_export: 1,
        max_purchase_qty: 5,
        min_purchase_qty: 1,
        name: '腾讯视频周卡',
        product_template_id: 7,
        purchase_limit_strategy_id: 8,
        purchase_notice: '购买须知',
        status: 1,
        subject_id: 11,
        supply_type: 'channel',
        terminal_price_limit: '29.9000',
      },
    );
    expect(requestClientMock.put).toHaveBeenNthCalledWith(
      1,
      '/admin/products/21',
      {
        balance_limit: '10.0000',
        brand_id: 36,
        default_sell_price: '29.9000',
        exception_notify: 0,
        goods_type: 'direct_recharge',
        has_tax: 0,
        is_douyin: 1,
        is_export: 0,
        max_purchase_qty: 6,
        min_purchase_qty: 2,
        name: '腾讯视频月卡',
        product_template_id: null,
        purchase_limit_strategy_id: 8,
        purchase_notice: '编辑须知',
        status: 0,
        subject_id: null,
        supply_type: 'channel',
        terminal_price_limit: '',
      },
    );
    expect(requestClientMock.delete).toHaveBeenNthCalledWith(
      1,
      '/admin/products/21',
    );
  });

  it('uses the supplier platform endpoints', async () => {
    requestClientMock.get.mockResolvedValueOnce({
      list: [],
      pagination: {},
    });
    requestClientMock.get.mockResolvedValueOnce({
      list: [],
    });
    requestClientMock.get.mockResolvedValueOnce({
      id: 21,
    });
    requestClientMock.post.mockResolvedValueOnce({ id: 21 });
    requestClientMock.put.mockResolvedValueOnce(undefined);
    requestClientMock.delete.mockResolvedValueOnce(undefined);
    requestClientMock.post.mockResolvedValueOnce({
      balance: '1888.0000',
      connect_status: 1,
      connect_status_text: '正常',
      id: 21,
      message: '查询成功',
      refreshed_at: '2026-04-14 20:00:00',
      trace_id: 'trace-1',
    });

    await getSupplierPlatformListApi({
      connect_status: '2',
      has_tax: '1',
      keyword: '木木',
      page: 2,
      page_size: 10,
      subject_id: 7,
      type_id: 35,
    });
    await getSupplierPlatformTypesApi();
    await getSupplierPlatformDetailApi(21);
    await addSupplierPlatformApi({
      backup_domain: 'backup.xqy.test',
      crowd_name: '运营群',
      domain: 'api.xqy.test',
      has_tax: 1,
      name: '木木（星权益含税）',
      secret_key: 'secret-key',
      sort: 5,
      subject_id: 7,
      threshold_amount: '5000.0000',
      token_id: '1008612345',
      type_id: 35,
    });
    await updateSupplierPlatformApi(21, {
      backup_domain: 'backup.xqy.test',
      crowd_name: '运营群-编辑',
      domain: 'api.xqy.test',
      has_tax: 0,
      name: '木木（星权益未税）',
      secret_key: 'secret-key-updated',
      sort: 1,
      subject_id: 7,
      threshold_amount: '3000.0000',
      token_id: '10086',
      type_id: 35,
    });
    await deleteSupplierPlatformApi(21);
    await refreshSupplierPlatformBalanceApi(21);

    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      1,
      '/admin/supplier-platforms',
      {
        params: {
          connect_status: '2',
          has_tax: '1',
          keyword: '木木',
          page: 2,
          page_size: 10,
          subject_id: 7,
          type_id: 35,
        },
      },
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      2,
      '/admin/supplier-platform-types',
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      3,
      '/admin/supplier-platforms/21',
    );
    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      1,
      '/admin/supplier-platforms',
      {
        backup_domain: 'backup.xqy.test',
        crowd_name: '运营群',
        domain: 'api.xqy.test',
        has_tax: 1,
        name: '木木（星权益含税）',
        secret_key: 'secret-key',
        sort: 5,
        subject_id: 7,
        threshold_amount: '5000.0000',
        token_id: '1008612345',
        type_id: 35,
      },
    );
    expect(requestClientMock.put).toHaveBeenNthCalledWith(
      1,
      '/admin/supplier-platforms/21',
      {
        backup_domain: 'backup.xqy.test',
        crowd_name: '运营群-编辑',
        domain: 'api.xqy.test',
        has_tax: 0,
        name: '木木（星权益未税）',
        secret_key: 'secret-key-updated',
        sort: 1,
        subject_id: 7,
        threshold_amount: '3000.0000',
        token_id: '10086',
        type_id: 35,
      },
    );
    expect(requestClientMock.delete).toHaveBeenNthCalledWith(
      1,
      '/admin/supplier-platforms/21',
    );
    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      2,
      '/admin/supplier-platforms/21/balance/refresh',
      {},
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
    requestClientMock.get.mockResolvedValueOnce({
      groups: [
        {
          group: 'finance',
          items: [
            { key: 'tax_exclusive_rate', value: '4.5' },
            { key: 'tax_inclusive_rate', value: '3.8' },
          ],
          label: '财务参数',
        },
      ],
    });
    requestClientMock.put.mockResolvedValueOnce(undefined);
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
    await getSystemSettingsApi();
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
    await saveSystemSettingsApi({
      groups: [
        {
          group: 'finance',
          items: [
            { key: 'tax_exclusive_rate', value: '4.5' },
            { key: 'tax_inclusive_rate', value: '3.8' },
          ],
        },
        {
          group: 'integration',
          items: [
            {
              key: 'robot_webhook_url',
              value: 'https://bot.example.com/hook',
            },
          ],
        },
      ],
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
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      8,
      '/admin/settings/system',
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
    expect(requestClientMock.put).toHaveBeenNthCalledWith(
      2,
      '/admin/settings/system',
      {
        groups: [
          {
            group: 'finance',
            items: [
              { key: 'tax_exclusive_rate', value: '4.5' },
              { key: 'tax_inclusive_rate', value: '3.8' },
            ],
          },
          {
            group: 'integration',
            items: [
              {
                key: 'robot_webhook_url',
                value: 'https://bot.example.com/hook',
              },
            ],
          },
        ],
      },
    );
  });
});
