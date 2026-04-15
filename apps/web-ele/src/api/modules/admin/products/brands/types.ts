import type { ListQuery } from '../../common';

export interface BrandListItem {
  children: BrandListItem[];
  created_at: string;
  credential_image: string;
  description: string;
  goods_count: number;
  has_children: boolean;
  icon: string;
  id: number;
  is_visible: number;
  name: string;
  parent_id: number;
  sort: number;
  updated_at: string;
}

export interface BrandListQuery extends ListQuery {
  name?: string;
}

export interface BrandCreatePayload {
  credential_image: string;
  description: string;
  icon: string;
  is_visible: number;
  name: string;
  parent_id: number;
}

export interface BrandUpdatePayload {
  credential_image: string;
  description: string;
  icon: string;
  is_visible: number;
  name: string;
}

export interface BrandUploadResult {
  file_name: string;
  size: number;
  url: string;
}

export interface BrandSelectorItem {
  icon: string;
  id: number;
  name: string;
}
