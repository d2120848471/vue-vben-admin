import type { ListQuery } from '../common';

export interface OperationLogItem {
  admin_id: number;
  admin_name: string;
  created_at: string;
  description: string;
  id: number;
  ip: string;
  ip_region: string;
}

export interface LoginLogItem {
  admin_id: number;
  admin_name: string;
  created_at: string;
  id: number;
  ip: string;
  ip_region: string;
}

export interface LogQuery extends ListQuery {
  admin_id?: string;
  end_time?: string;
  keyword?: string;
  start_time?: string;
}

