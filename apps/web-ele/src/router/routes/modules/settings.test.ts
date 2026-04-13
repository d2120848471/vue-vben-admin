import { describe, expect, it } from 'vitest';

import routes from './settings';

describe('settings routes', () => {
  it('defines the settings parent and child routes', () => {
    expect(routes).toEqual([
      {
        meta: {
          authority: ['config.sms', 'config.system'],
          icon: 'lucide:settings',
          order: 50,
          title: '系统设置',
        },
        name: 'Settings',
        path: '/settings',
        children: [
          {
            component: expect.any(Function),
            meta: {
              authority: ['config.sms'],
              title: '短信配置',
            },
            name: 'SMSConfig',
            path: '/settings/sms',
          },
          {
            component: expect.any(Function),
            meta: {
              authority: ['config.system'],
              title: '系统参数配置',
            },
            name: 'SystemConfig',
            path: '/settings/system',
          },
        ],
      },
    ]);
  });
});
