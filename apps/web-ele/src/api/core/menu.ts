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

/**
 * 菜单：获取当前账号可见的菜单树（用于侧边栏）
 * GET /admin/menu/tree
 */
export async function getMenuTreeApi() {
  return requestClient.get<MenuTreeItem[]>('/admin/menu/tree');
}

/**
 * 兼容旧示例组件导入
 * 等价于 getMenuTreeApi()
 */
export async function getAllMenusApi() {
  return getMenuTreeApi();
}
