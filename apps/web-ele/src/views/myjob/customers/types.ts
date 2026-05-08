export type CustomerDialogMode = 'create' | 'edit';

export interface CustomerFormState {
  company_name: string;
  confirm_password: string;
  confirm_pay_password: string;
  password: string;
  pay_password: string;
  phone: string;
  status: number;
}

export interface CustomerPasswordFormState {
  confirm_password: string;
  password: string;
}

export interface CustomerPayPasswordFormState {
  confirm_pay_password: string;
  pay_password: string;
}
