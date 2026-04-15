import type { SubjectItem, SubjectPayload } from './types';

import { requestClient } from '#/api/request';

/**
 * 主体管理：获取主体列表
 * GET /admin/subjects
 */
export async function getSubjectsApi() {
  return requestClient.get<{ list: SubjectItem[] }>('/admin/subjects');
}

/**
 * 主体管理：新增主体
 * POST /admin/subjects
 */
export async function addSubjectApi(data: SubjectPayload) {
  return requestClient.post('/admin/subjects', data);
}

/**
 * 主体管理：编辑主体
 * PUT /admin/subjects/:id
 */
export async function updateSubjectApi(id: number, data: SubjectPayload) {
  return requestClient.put(`/admin/subjects/${id}`, data);
}
