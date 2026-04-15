import type { ListQuery } from '../../common';

export interface ProductTemplateListItem {
  account_name: string;
  created_at: string;
  id: number;
  is_shared: number;
  is_shared_label: string;
  title: string;
  type: string;
  type_label: string;
  updated_at: string;
  validate_type: number;
  validate_type_label: string;
}

export interface ProductTemplateListQuery extends ListQuery {
  is_shared?: string;
  keyword?: string;
  type?: string;
}

export interface ProductTemplatePayload {
  account_name: string;
  is_shared: number;
  title: string;
  type: string;
  validate_type: number;
}

export interface ProductTemplateValidateTypeItem {
  id: number;
  title: string;
}
