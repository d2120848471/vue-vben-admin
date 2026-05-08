export type CustomerSMSScene = 'forgot_password' | 'register';

export interface CustomerSMSPayload {
  phone: string;
  scene: CustomerSMSScene;
}

export interface CustomerRegisterPayload {
  company_name: string;
  confirm_password: string;
  confirm_pay_password: string;
  password: string;
  pay_password: string;
  phone: string;
  sms_code: string;
}

export interface CustomerLoginPayload {
  password: string;
  phone: string;
}

export interface CustomerForgotPasswordPayload {
  confirm_password: string;
  password: string;
  phone: string;
  sms_code: string;
}

export interface CustomerAuthUser {
  company_name: string;
  id: number;
  phone: string;
  status: number;
}

export interface CustomerAuthResult {
  customer: CustomerAuthUser;
  token: string;
}
