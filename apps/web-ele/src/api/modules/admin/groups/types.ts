import type { MenuTreeItem } from '#/api/core/menu';

export interface GroupListItem {
  description: string;
  id: number;
  name: string;
  status: number;
  user_count: number;
}

export interface GroupPayload {
  description: string;
  name: string;
}

export interface GroupAuthResult {
  menu_ids: number[];
}

export interface MenuTreeResult {
  list: MenuTreeItem[];
}
