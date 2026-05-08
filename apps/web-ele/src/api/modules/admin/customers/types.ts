import type { ListQuery } from '../common';

export interface CustomerListQuery extends ListQuery {
  keyword?: string;
  status?: number;
}

export interface CustomerTrashQuery extends ListQuery {
  keyword?: string;
}

export interface CustomerListItem {
  company_name: string;
  created_at: string;
  id: number;
  last_login_at: string;
  last_login_ip: string;
  phone: string;
  status: number;
  updated_at: string;
}

export type CustomerDetail = CustomerListItem;

export interface CustomerCreatePayload {
  company_name: string;
  confirm_password: string;
  confirm_pay_password: string;
  password: string;
  pay_password: string;
  phone: string;
  status: number;
}

export interface CustomerCreateResult {
  id: number;
}

export interface CustomerUpdatePayload {
  company_name: string;
  phone: string;
  status: number;
}

export interface CustomerPasswordResetPayload {
  confirm_password: string;
  password: string;
}

export interface CustomerPayPasswordResetPayload {
  confirm_pay_password: string;
  pay_password: string;
}
