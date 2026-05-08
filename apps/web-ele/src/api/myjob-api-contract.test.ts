import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  loginApi,
  logoutApi,
  sendLoginSmsApi,
  verifyLoginSmsApi,
} from '#/api/core/auth';
import { getUserInfoApi } from '#/api/core/user';
import {
  addCustomerApi,
  deleteCustomerApi,
  getCustomerDetailApi,
  getCustomerListApi,
  getCustomerTrashApi,
  resetCustomerPasswordApi,
  resetCustomerPayPasswordApi,
  restoreCustomerApi,
  updateCustomerApi,
  updateCustomerStatusApi,
} from '#/api/modules/admin/customers';
import {
  addGroupApi,
  deleteGroupApi,
  getGroupAuthApi,
  getGroupsApi,
  getPermissionTreeApi,
  saveGroupAuthApi,
  updateGroupStatusApi,
} from '#/api/modules/admin/groups';
import { getLoginLogsApi, getOperationLogsApi } from '#/api/modules/admin/logs';
import { getOrderListApi } from '#/api/modules/admin/orders';
import {
  addBrandApi,
  deleteBrandApi,
  getBrandChildrenApi,
  getBrandListApi,
  sortBrandApi,
  toggleBrandVisibilityApi,
  updateBrandApi,
  uploadBrandImageApi,
} from '#/api/modules/admin/products/brands';
import {
  addProductGoodsApi,
  deleteProductGoodsApi,
  getProductGoodsDetailApi,
  getProductGoodsFormOptionsApi,
  getProductGoodsListApi,
  updateProductGoodsApi,
  updateProductGoodsStatusApi,
} from '#/api/modules/admin/products/goods';
import {
  createProductGoodsChannelBindingApi,
  deleteProductGoodsChannelBindingApi,
  getProductGoodsChannelBindingFormOptionsApi,
  getProductGoodsChannelBindingsApi,
  updateProductGoodsChannelAutoPriceApi,
  updateProductGoodsChannelBindingApi,
} from '#/api/modules/admin/products/goods-channels';
import {
  getProductGoodsInventoryConfigApi,
  saveProductGoodsInventoryConfigApi,
} from '#/api/modules/admin/products/goods-inventory-config';
import {
  addIndustryApi,
  addIndustryRelationBrandsApi,
  deleteIndustryApi,
  deleteIndustryRelationBrandsApi,
  getBrandSelectorApi,
  getIndustryListApi,
  getIndustryRelationBrandsApi,
  sortIndustryApi,
  sortIndustryRelationBrandApi,
  updateIndustryApi,
} from '#/api/modules/admin/products/industries';
import { getProductGoodsChannelPriceChangeListApi } from '#/api/modules/admin/products/price-changes';
import {
  addPurchaseLimitStrategyApi,
  deletePurchaseLimitStrategyApi,
  getPurchaseLimitStrategyEnumsApi,
  getPurchaseLimitStrategyListApi,
  updatePurchaseLimitStrategyApi,
  updatePurchaseLimitStrategyStatusApi,
} from '#/api/modules/admin/products/purchase-limits';
import {
  addRechargeRiskRuleApi,
  deleteRechargeRiskRuleApi,
  getRechargeRiskRecordListApi,
  getRechargeRiskRuleListApi,
  updateRechargeRiskRuleApi,
  updateRechargeRiskRuleStatusApi,
} from '#/api/modules/admin/products/recharge-risks';
import {
  addSupplierPlatformApi,
  deleteSupplierPlatformApi,
  getSupplierPlatformDetailApi,
  getSupplierPlatformListApi,
  getSupplierPlatformTypesApi,
  refreshSupplierPlatformBalanceApi,
  updateSupplierPlatformApi,
} from '#/api/modules/admin/products/suppliers';
import {
  addProductTemplateApi,
  batchDeleteProductTemplateApi,
  deleteProductTemplateApi,
  getProductTemplateListApi,
  getProductTemplateValidateTypesApi,
  updateProductTemplateApi,
} from '#/api/modules/admin/products/templates';
import {
  getSMSConfigApi,
  saveSMSConfigApi,
} from '#/api/modules/admin/settings/sms';
import {
  getSystemSettingsApi,
  saveSystemSettingsApi,
} from '#/api/modules/admin/settings/system';
import { addSubjectApi, getSubjectsApi } from '#/api/modules/admin/subjects';
import {
  addAdminUserApi,
  cancelAdminUserBusinessApi,
  deleteAdminUserApi,
  getAdminUsersApi,
  getAdminUserTrashApi,
  restoreAdminUserApi,
  setAdminUserBusinessApi,
  updateAdminUserNotifyApi,
  updateAdminUserStatusApi,
} from '#/api/modules/admin/users';
import {
  forgotCustomerPasswordApi,
  loginCustomerApi,
  registerCustomerApi,
  sendCustomerSMSApi,
} from '#/api/modules/customer/auth';

const requestClientMock = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  request: vi.fn(),
}));

const customerAuthRequestClientMock = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock('#/api/request', () => ({
  customerAuthRequestClient: customerAuthRequestClientMock,
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

  it('uses the customer management endpoints', async () => {
    requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
    requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
    requestClientMock.get.mockResolvedValueOnce({ id: 7 });
    requestClientMock.post.mockResolvedValueOnce({ id: 7 });
    requestClientMock.put.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.delete.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);

    await getCustomerListApi({
      keyword: '测试',
      page: 1,
      page_size: 20,
      status: 1,
    });
    await getCustomerTrashApi({ keyword: '回收', page: 2, page_size: 10 });
    await getCustomerDetailApi(7);
    await addCustomerApi({
      company_name: '测试公司',
      confirm_password: 'Abc_123',
      confirm_pay_password: '123456',
      password: 'Abc_123',
      pay_password: '123456',
      phone: '13800000000',
      status: 1,
    });
    await updateCustomerApi(7, {
      company_name: '编辑公司',
      phone: '13800000001',
      status: 0,
    });
    await updateCustomerStatusApi(7, 0);
    await deleteCustomerApi(7);
    await restoreCustomerApi(7);
    await resetCustomerPasswordApi(7, {
      confirm_password: 'New_123',
      password: 'New_123',
    });
    await resetCustomerPayPasswordApi(7, {
      confirm_pay_password: '654321',
      pay_password: '654321',
    });

    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      1,
      '/admin/customers',
      {
        params: { keyword: '测试', page: 1, page_size: 20, status: 1 },
      },
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      2,
      '/admin/customers/trash',
      {
        params: { keyword: '回收', page: 2, page_size: 10 },
      },
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      3,
      '/admin/customers/7',
    );
    expect(requestClientMock.post).toHaveBeenCalledWith('/admin/customers', {
      company_name: '测试公司',
      confirm_password: 'Abc_123',
      confirm_pay_password: '123456',
      password: 'Abc_123',
      pay_password: '123456',
      phone: '13800000000',
      status: 1,
    });
    expect(requestClientMock.put).toHaveBeenCalledWith('/admin/customers/7', {
      company_name: '编辑公司',
      phone: '13800000001',
      status: 0,
    });
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      1,
      '/admin/customers/7/status',
      {
        data: { status: 0 },
        method: 'PATCH',
      },
    );
    expect(requestClientMock.delete).toHaveBeenCalledWith('/admin/customers/7');
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      2,
      '/admin/customers/7/restore',
      {
        method: 'PATCH',
      },
    );
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      3,
      '/admin/customers/7/password',
      {
        data: { confirm_password: 'New_123', password: 'New_123' },
        method: 'PATCH',
      },
    );
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      4,
      '/admin/customers/7/pay-password',
      {
        data: { confirm_pay_password: '654321', pay_password: '654321' },
        method: 'PATCH',
      },
    );
  });

  it('uses the customer auth endpoints', async () => {
    customerAuthRequestClientMock.post.mockResolvedValueOnce(undefined);
    customerAuthRequestClientMock.post.mockResolvedValueOnce({
      customer: {
        company_name: '注册公司',
        id: 10,
        phone: '13800000000',
        status: 1,
      },
      token: 'customer-token-register',
    });
    customerAuthRequestClientMock.post.mockResolvedValueOnce({
      customer: {
        company_name: '注册公司',
        id: 10,
        phone: '13800000000',
        status: 1,
      },
      token: 'customer-token-login',
    });
    customerAuthRequestClientMock.post.mockResolvedValueOnce(undefined);

    await sendCustomerSMSApi({
      phone: '13800000000',
      scene: 'register',
    });
    await registerCustomerApi({
      company_name: '注册公司',
      confirm_password: 'Abc_123',
      confirm_pay_password: '123456',
      password: 'Abc_123',
      pay_password: '123456',
      phone: '13800000000',
      sms_code: '123456',
    });
    await loginCustomerApi({
      password: 'Abc_123',
      phone: '13800000000',
    });
    await forgotCustomerPasswordApi({
      confirm_password: 'New_123',
      password: 'New_123',
      phone: '13800000000',
      sms_code: '654321',
    });

    expect(customerAuthRequestClientMock.post).toHaveBeenNthCalledWith(
      1,
      '/customer/auth/sms/send',
      {
        phone: '13800000000',
        scene: 'register',
      },
    );
    expect(customerAuthRequestClientMock.post).toHaveBeenNthCalledWith(
      2,
      '/customer/auth/register',
      {
        company_name: '注册公司',
        confirm_password: 'Abc_123',
        confirm_pay_password: '123456',
        password: 'Abc_123',
        pay_password: '123456',
        phone: '13800000000',
        sms_code: '123456',
      },
    );
    expect(customerAuthRequestClientMock.post).toHaveBeenNthCalledWith(
      3,
      '/customer/auth/login',
      {
        password: 'Abc_123',
        phone: '13800000000',
      },
    );
    expect(customerAuthRequestClientMock.post).toHaveBeenNthCalledWith(
      4,
      '/customer/auth/forgot-password',
      {
        confirm_password: 'New_123',
        password: 'New_123',
        phone: '13800000000',
        sms_code: '654321',
      },
    );
    expect(requestClientMock.post).not.toHaveBeenCalledWith(
      expect.stringMatching(/^\/customer\/auth/),
      expect.anything(),
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

    await getPurchaseLimitStrategyListApi({
      keyword: '一天一号',
      page: 1,
      page_size: 20,
    });
    await getPurchaseLimitStrategyEnumsApi();
    await addPurchaseLimitStrategyApi({
      limit_nums: 2,
      limit_times: 2,
      limit_type: 2,
      name: '一天一号两次',
      period: 1,
      period_type: 1,
    });
    await updatePurchaseLimitStrategyApi(31, {
      limit_nums: 0,
      limit_times: 5,
      limit_type: 2,
      name: '三分钟一号五次',
      period: 3,
      period_type: 2,
    });
    await updatePurchaseLimitStrategyStatusApi(31, 0);
    await deletePurchaseLimitStrategyApi(31);

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

  it('uses the recharge risk endpoints', async () => {
    requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });
    requestClientMock.post.mockResolvedValueOnce({ id: 41 });
    requestClientMock.put.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.delete.mockResolvedValueOnce(undefined);
    requestClientMock.get.mockResolvedValueOnce({ list: [], pagination: {} });

    await getRechargeRiskRuleListApi({
      account: 'risk-account-001',
      goods_keyword: '剪映',
      page: 1,
      page_size: 20,
      status: '1',
    });
    await addRechargeRiskRuleApi({
      account: 'risk-account-001',
      goods_keyword: '剪映',
      reason: '客户多次提交错误账号',
      status: 1,
    });
    await updateRechargeRiskRuleApi(41, {
      account: 'risk-account-001',
      goods_keyword: '醒图',
      reason: '更新后的风控原因',
      status: 0,
    });
    await updateRechargeRiskRuleStatusApi(41, 1);
    await deleteRechargeRiskRuleApi(41);
    await getRechargeRiskRecordListApi({
      account: 'risk-account-001',
      end_time: '2026-04-27 23:59:59',
      goods_keyword: '醒图',
      page: 2,
      page_size: 30,
      start_time: '2026-04-27 00:00:00',
    });

    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      1,
      '/admin/recharge-risks/rules',
      {
        params: {
          account: 'risk-account-001',
          goods_keyword: '剪映',
          page: 1,
          page_size: 20,
          status: '1',
        },
      },
    );
    expect(requestClientMock.post).toHaveBeenCalledWith(
      '/admin/recharge-risks/rules',
      {
        account: 'risk-account-001',
        goods_keyword: '剪映',
        reason: '客户多次提交错误账号',
        status: 1,
      },
    );
    expect(requestClientMock.put).toHaveBeenCalledWith(
      '/admin/recharge-risks/rules/41',
      {
        account: 'risk-account-001',
        goods_keyword: '醒图',
        reason: '更新后的风控原因',
        status: 0,
      },
    );
    expect(requestClientMock.request).toHaveBeenCalledWith(
      '/admin/recharge-risks/rules/41/status',
      {
        data: { status: 1 },
        method: 'PATCH',
      },
    );
    expect(requestClientMock.delete).toHaveBeenCalledWith(
      '/admin/recharge-risks/rules/41',
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      2,
      '/admin/recharge-risks/records',
      {
        params: {
          account: 'risk-account-001',
          end_time: '2026-04-27 23:59:59',
          goods_keyword: '醒图',
          page: 2,
          page_size: 30,
          start_time: '2026-04-27 00:00:00',
        },
      },
    );
  });

  it('uses the product goods endpoints', async () => {
    expect(typeof getProductGoodsListApi).toBe('function');
    expect(typeof getProductGoodsDetailApi).toBe('function');
    expect(typeof getProductGoodsFormOptionsApi).toBe('function');
    expect(typeof addProductGoodsApi).toBe('function');
    expect(typeof updateProductGoodsApi).toBe('function');
    expect(typeof updateProductGoodsStatusApi).toBe('function');
    expect(typeof deleteProductGoodsApi).toBe('function');

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
    requestClientMock.request.mockResolvedValueOnce({
      failed: [],
      failed_count: 0,
      success_count: 1,
      success_ids: [21],
    });
    requestClientMock.delete.mockResolvedValueOnce(undefined);

    await getProductGoodsListApi({
      brand_id: 35,
      goods_type: 'card_secret',
      has_tax: '1',
      keyword: '腾讯',
      page: 2,
      page_size: 10,
      status: '0',
    });
    await getProductGoodsDetailApi(21);
    await getProductGoodsFormOptionsApi();
    await addProductGoodsApi({
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
    await updateProductGoodsApi(21, {
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
    await updateProductGoodsStatusApi([21], 0);
    await deleteProductGoodsApi(21);

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
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      1,
      '/admin/products/status',
      {
        data: { ids: [21], status: 0 },
        method: 'PATCH',
      },
    );
    expect(requestClientMock.delete).toHaveBeenNthCalledWith(
      1,
      '/admin/products/21',
    );
  });

  it('uses the product goods channel binding endpoints', async () => {
    expect(typeof getProductGoodsChannelBindingsApi).toBe('function');
    expect(typeof getProductGoodsChannelBindingFormOptionsApi).toBe('function');
    expect(typeof createProductGoodsChannelBindingApi).toBe('function');
    expect(typeof updateProductGoodsChannelBindingApi).toBe('function');
    expect(typeof deleteProductGoodsChannelBindingApi).toBe('function');
    expect(typeof updateProductGoodsChannelAutoPriceApi).toBe('function');

    requestClientMock.get.mockResolvedValueOnce({
      goods: {
        brand_name: '腾讯视频',
        default_sell_price: '19.9000',
        goods_code: 'GD0000000021',
        has_tax: 1,
        id: 21,
        inventory_config_summary: {
          allow_loss_sale_enabled: 0,
          combo_goods_enabled: 0,
          max_loss_amount: '0.0000',
          order_strategy: 'fixed_order',
          reorder_timeout_enabled: 0,
          reorder_timeout_minutes: 0,
          smart_reorder_enabled: 0,
          sync_cost_price_enabled: 0,
          sync_goods_name_enabled: 0,
        },
        name: '腾讯视频周卡',
        subject_id: 11,
        subject_name: '开票主体A',
      },
      list: [],
    });
    requestClientMock.get.mockResolvedValueOnce({
      auto_price_type_options: [{ label: '固定值', value: 'fixed' }],
      dock_status_options: [{ label: '正常', value: 1 }],
      platform_accounts: [{ id: 101, name: '渠道A' }],
      validate_templates: [{ id: 7, title: '腾讯模板' }],
    });
    requestClientMock.post.mockResolvedValueOnce({ id: 31 });
    requestClientMock.request.mockResolvedValueOnce(undefined);
    requestClientMock.delete.mockResolvedValueOnce(undefined);
    requestClientMock.request.mockResolvedValueOnce(undefined);

    await getProductGoodsChannelBindingsApi(21);
    await getProductGoodsChannelBindingFormOptionsApi(21);
    await createProductGoodsChannelBindingApi(21, {
      dock_status: 1,
      order_time_end: '18:00',
      order_time_start: '09:00',
      order_weight: '60.0000',
      platform_account_id: 101,
      sort: 10,
      source_cost_price: '10.0000',
      supplier_goods_name: '腾讯周卡上游',
      supplier_goods_no: 'SKU-001',
      validate_template_id: 7,
    });
    await updateProductGoodsChannelBindingApi(21, 31, {
      dock_status: 0,
      order_time_end: '20:00',
      order_time_start: '10:00',
      order_weight: '40.0000',
      platform_account_id: 101,
      sort: 20,
      source_cost_price: '11.0000',
      supplier_goods_name: '腾讯周卡上游-编辑',
      supplier_goods_no: 'SKU-001',
      validate_template_id: null,
    });
    await deleteProductGoodsChannelBindingApi(21, 31);
    await updateProductGoodsChannelAutoPriceApi(21, 31, {
      add_type: 'fixed',
      default_price: '1.3000',
      is_auto_change: 1,
    });

    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      1,
      '/admin/products/21/channel-bindings',
    );
    expect(requestClientMock.get).toHaveBeenNthCalledWith(
      2,
      '/admin/products/21/channel-bindings/form-options',
    );
    expect(requestClientMock.post).toHaveBeenNthCalledWith(
      1,
      '/admin/products/21/channel-bindings',
      {
        dock_status: 1,
        order_time_end: '18:00',
        order_time_start: '09:00',
        order_weight: '60.0000',
        platform_account_id: 101,
        sort: 10,
        source_cost_price: '10.0000',
        supplier_goods_name: '腾讯周卡上游',
        supplier_goods_no: 'SKU-001',
        validate_template_id: 7,
      },
    );
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      1,
      '/admin/products/21/channel-bindings/31',
      {
        data: {
          dock_status: 0,
          order_time_end: '20:00',
          order_time_start: '10:00',
          order_weight: '40.0000',
          platform_account_id: 101,
          sort: 20,
          source_cost_price: '11.0000',
          supplier_goods_name: '腾讯周卡上游-编辑',
          supplier_goods_no: 'SKU-001',
          validate_template_id: null,
        },
        method: 'PATCH',
      },
    );
    expect(requestClientMock.delete).toHaveBeenNthCalledWith(
      1,
      '/admin/products/21/channel-bindings/31',
    );
    expect(requestClientMock.request).toHaveBeenNthCalledWith(
      2,
      '/admin/products/21/channel-bindings/31/auto-price',
      {
        data: {
          add_type: 'fixed',
          default_price: '1.3000',
          is_auto_change: 1,
        },
        method: 'PATCH',
      },
    );
  });

  it('uses the product goods channel price change endpoint', async () => {
    expect(typeof getProductGoodsChannelPriceChangeListApi).toBe('function');

    requestClientMock.get.mockResolvedValueOnce({
      list: [
        {
          binding_id: 31,
          change_amount: '2.0000',
          changed_at: '2026-05-06 10:00:00',
          description: '变动前 10.0000，变动后 12.0000',
          goods_code: 'PRICE-CHANGE-001',
          goods_icon: '',
          goods_id: 21,
          goods_name: '自动改价测试商品',
          id: 1,
          new_cost_price: '12.0000',
          new_effective_sell_price: '22.0000',
          new_source_cost_price: '12.0000',
          old_cost_price: '10.0000',
          old_effective_sell_price: '20.0000',
          old_source_cost_price: '10.0000',
          platform_account_id: 101,
          platform_account_name: '卡卡云测试账号',
          provider_code: 'kakayun',
          raw_payload: '{}',
          source: 'push',
          supplier_goods_name: '上游测试商品',
          supplier_goods_no: '2582531',
        },
      ],
      pagination: { page: 1, page_size: 20, total: 1 },
    });

    await getProductGoodsChannelPriceChangeListApi({
      end_at: '2026-05-06 23:59:59',
      keyword: 'PRICE-CHANGE-001',
      page: 1,
      page_size: 20,
      platform_id: 101,
      source: 'push',
      start_at: '2026-05-06 00:00:00',
      supplier_goods_no: '2582531',
    });

    expect(requestClientMock.get).toHaveBeenCalledWith(
      '/admin/product-goods-channel-price-changes',
      {
        params: {
          end_at: '2026-05-06 23:59:59',
          keyword: 'PRICE-CHANGE-001',
          page: 1,
          page_size: 20,
          platform_id: 101,
          source: 'push',
          start_at: '2026-05-06 00:00:00',
          supplier_goods_no: '2582531',
        },
      },
    );
  });

  it('uses the product goods inventory config endpoints', async () => {
    expect(typeof getProductGoodsInventoryConfigApi).toBe('function');
    expect(typeof saveProductGoodsInventoryConfigApi).toBe('function');

    requestClientMock.get.mockResolvedValueOnce({
      config: {
        allow_loss_sale_enabled: 1,
        combo_goods_enabled: 0,
        max_loss_amount: '2.5000',
        order_strategy: 'weighted_percent',
        reorder_timeout_enabled: 1,
        reorder_timeout_minutes: 30,
        smart_reorder_enabled: 1,
        sync_cost_price_enabled: 1,
        sync_goods_name_enabled: 1,
      },
      goods: {
        brand_name: '腾讯视频',
        default_sell_price: '19.9000',
        goods_code: 'GD0000000021',
        has_tax: 1,
        id: 21,
        inventory_config_summary: {
          allow_loss_sale_enabled: 1,
          combo_goods_enabled: 0,
          max_loss_amount: '2.5000',
          order_strategy: 'weighted_percent',
          reorder_timeout_enabled: 1,
          reorder_timeout_minutes: 30,
          smart_reorder_enabled: 1,
          sync_cost_price_enabled: 1,
          sync_goods_name_enabled: 1,
        },
        name: '腾讯视频周卡',
        subject_id: 11,
        subject_name: '开票主体A',
      },
      order_strategy_options: [
        { label: '百分比分配', value: 'weighted_percent' },
      ],
    });
    requestClientMock.put.mockResolvedValueOnce(undefined);

    await getProductGoodsInventoryConfigApi(21);
    await saveProductGoodsInventoryConfigApi(21, {
      allow_loss_sale_enabled: 1,
      combo_goods_enabled: 0,
      max_loss_amount: '2.5000',
      order_strategy: 'weighted_percent',
      reorder_timeout_enabled: 1,
      reorder_timeout_minutes: 30,
      smart_reorder_enabled: 1,
      sync_cost_price_enabled: 1,
      sync_goods_name_enabled: 1,
    });

    expect(requestClientMock.get).toHaveBeenCalledWith(
      '/admin/products/21/inventory-config',
    );
    expect(requestClientMock.put).toHaveBeenNthCalledWith(
      1,
      '/admin/products/21/inventory-config',
      {
        allow_loss_sale_enabled: 1,
        combo_goods_enabled: 0,
        max_loss_amount: '2.5000',
        order_strategy: 'weighted_percent',
        reorder_timeout_enabled: 1,
        reorder_timeout_minutes: 30,
        smart_reorder_enabled: 1,
        sync_cost_price_enabled: 1,
        sync_goods_name_enabled: 1,
      },
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
      status: '1',
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
      status: 0,
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
          status: '1',
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
        status: 0,
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

  it('uses the refactored orders endpoint', async () => {
    requestClientMock.get.mockResolvedValueOnce({
      list: [],
      pagination: { page: 1, page_size: 20, total: 0 },
      stats: {
        today_order_amount: '0.0000',
        today_order_count: 0,
        yesterday_order_amount: '0.0000',
        yesterday_order_count: 0,
      },
    });

    await getOrderListApi({
      channel_id: 21,
      end_time: '2026-04-25 23:59:59',
      has_tax: '1',
      is_card: '0',
      keyword: 'O202604250001',
      keyword_by: 'order_no',
      page: 1,
      page_size: 20,
      quick_range: 'today',
      start_time: '2026-04-25 00:00:00',
      status: 'success',
    });

    expect(requestClientMock.get).toHaveBeenCalledWith('/admin/orders', {
      params: {
        channel_id: 21,
        end_time: '2026-04-25 23:59:59',
        has_tax: '1',
        is_card: '0',
        keyword: 'O202604250001',
        keyword_by: 'order_no',
        page: 1,
        page_size: 20,
        quick_range: 'today',
        start_time: '2026-04-25 00:00:00',
        status: 'success',
      },
    });
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
