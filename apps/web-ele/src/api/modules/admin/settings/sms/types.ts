export interface SMSConfigResult {
  access_key_configured: boolean;
  access_key_masked: string;
  access_key_secret_configured: boolean;
  access_key_secret_masked: string;
  expire_minutes: number;
  interval_minutes: number;
  sign_name: string;
  template_code: string;
  updated_at?: string;
}

export interface SMSConfigPayload {
  access_key: string;
  access_key_secret: string;
  expire_minutes: number;
  interval_minutes: number;
  keep_access_key: boolean;
  keep_access_key_secret: boolean;
  sign_name: string;
  template_code: string;
}
