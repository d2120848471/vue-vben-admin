export interface SubjectItem {
  created_at: string;
  has_tax: number;
  id: number;
  name: string;
  updated_at: string;
}

export interface SubjectPayload {
  has_tax: number;
  name: string;
}
