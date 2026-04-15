import type { ListQuery } from '../../common';

export interface SupplierPlatformTypeItem {
  id: number;
  provider_code: string;
  type_name: string;
}

export interface SupplierPlatformListItem {
  backup_domain: string;
  balance_warning: number;
  connect_status: number;
  connect_status_text: string;
  crowd_name: string;
  domain: string;
  has_tax: number;
  id: number;
  last_balance: string;
  last_balance_at: string;
  last_balance_message: string;
  name: string;
  provider_code: string;
  provider_name: string;
  sort: number;
  subject_id: number;
  subject_name: string;
  threshold_amount: string;
  type_id: number;
  type_name: string;
}

export interface SupplierPlatformListQuery extends ListQuery {
  connect_status?: string;
  has_tax?: string;
  keyword?: string;
  subject_id?: number;
  type_id?: number;
}

export interface SupplierPlatformDetailResult {
  backup_domain: string;
  crowd_name: string;
  domain: string;
  extra_config: Record<string, any>;
  has_tax: number;
  id: number;
  name: string;
  provider_code: string;
  provider_name: string;
  secret_key: string;
  sort: number;
  subject_id: number;
  threshold_amount: string;
  token_id: string;
  type_id: number;
}

export interface SupplierPlatformPayload {
  backup_domain: string;
  crowd_name: string;
  domain: string;
  has_tax: number;
  name: string;
  secret_key: string;
  sort: number;
  subject_id: number;
  threshold_amount: string;
  token_id: string;
  type_id: number;
}

export interface SupplierPlatformRefreshResult {
  balance: string;
  connect_status: number;
  connect_status_text: string;
  id: number;
  message: string;
  refreshed_at: string;
  trace_id: string;
}
