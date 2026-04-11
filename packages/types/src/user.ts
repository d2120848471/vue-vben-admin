import type { BasicUserInfo } from '@vben-core/typings';

/** 用户信息 */
interface UserInfo extends BasicUserInfo {
  /**
   * 用户组ID
   */
  groupId: string;
  /**
   * 用户组名称
   */
  groupName: string;

  /**
   * 首页地址
   */
  homePath: string;

  /**
   * 是否商务账号
   */
  isBusiness: boolean;
}

export type { UserInfo };
