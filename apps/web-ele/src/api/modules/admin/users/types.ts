import type { ListQuery } from '../common';

export interface UserListItem {
  balance_notify: number;
  group_id: number;
  group_name: string;
  id: number;
  is_business: number;
  phone: string;
  real_name: string;
  status: number;
  username: string;
}

export type UserListQuery = ListQuery;

export interface UserFormPayload {
  confirm_password?: string;
  confirm_username?: string;
  group_id: number;
  password?: string;
  phone: string;
  real_name: string;
  username?: string;
}
