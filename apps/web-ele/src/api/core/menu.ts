import { requestClient } from '#/api/request';

export interface MenuTreeItem {
  children?: MenuTreeItem[];
  code: string;
  id: number;
  menu_type?: string;
  name: string;
  parent_id?: number;
  sort?: number;
}

/** 获取授权菜单树 */
export async function getMenuTreeApi() {
  return requestClient.get<MenuTreeItem[]>('/api/admin/menu/tree');
}

/** 兼容旧示例组件导入 */
export async function getAllMenusApi() {
  return getMenuTreeApi();
}
