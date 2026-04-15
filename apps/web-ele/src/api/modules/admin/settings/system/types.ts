export interface SystemSettingsItem {
  configured: boolean;
  key: string;
  label: string;
  required: boolean;
  unit?: string;
  updated_at?: string;
  value: string;
  value_type: string;
}

export interface SystemSettingsGroup {
  group: string;
  items: SystemSettingsItem[];
  label?: string;
}

export interface SystemSettingsResult {
  group?: string;
  groups?: SystemSettingsGroup[];
  items?: SystemSettingsItem[];
  label?: string;
}

export interface SystemSettingsSaveItem {
  key: string;
  value: string;
}

export interface SystemSettingsSaveGroup {
  group: string;
  items: SystemSettingsSaveItem[];
}

export interface SystemSettingsSavePayload {
  groups: SystemSettingsSaveGroup[];
}
