import type { ListQuery } from '../../common';

export interface IndustryListItem {
  brand_count: number;
  created_at: string;
  id: number;
  name: string;
  sort: number;
  updated_at: string;
}

export interface IndustryListQuery extends ListQuery {
  name?: string;
}

export interface IndustryPayload {
  brand_ids: number[];
  name: string;
}

export interface IndustrySelectorQuery {
  name?: string;
}

export interface IndustryRelationBrandItem {
  brand_icon: string;
  brand_id: number;
  brand_name: string;
  id: number;
  sort: number;
}

export interface IndustryRelationListResult {
  industry_id: number;
  industry_name: string;
  list: IndustryRelationBrandItem[];
}
