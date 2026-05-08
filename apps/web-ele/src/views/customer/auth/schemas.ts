import type { VbenFormSchema } from '@vben/common-ui';

import { h } from 'vue';

import { z } from '@vben/common-ui';

import { ElButton } from 'element-plus';

import {
  companyNameRule,
  loginPasswordRule,
  payPasswordRule,
  phoneRule,
  smsCodeRule,
  validateMatchingValue,
} from './validators';

interface SMSActionOptions {
  canSendSMS: boolean;
  countdownText: string;
  sending: boolean;
  sendSMS: () => void;
}

function buildSMSSuffix(options: SMSActionOptions) {
  return () =>
    h(
      ElButton,
      {
        disabled: !options.canSendSMS,
        link: true,
        loading: options.sending,
        type: 'primary',
        onClick: options.sendSMS,
      },
      () => options.countdownText || '发送验证码',
    );
}

/**
 * 客户登录表单只暴露手机号和登录密码，客户 token 与后台 token 隔离。
 */
export function buildCustomerLoginSchema(): VbenFormSchema[] {
  return [
    {
      component: 'VbenInput',
      componentProps: { placeholder: '请输入手机号' },
      fieldName: 'phone',
      label: '手机号',
      rules: phoneRule,
    },
    {
      component: 'VbenInputPassword',
      componentProps: { placeholder: '请输入登录密码' },
      fieldName: 'password',
      label: '登录密码',
      rules: loginPasswordRule,
    },
  ];
}

/**
 * 注册表单包含前端协议勾选；该字段只参与校验，不会提交到后端。
 */
export function buildCustomerRegisterSchema(
  smsOptions: SMSActionOptions,
): VbenFormSchema[] {
  return [
    {
      component: 'VbenInput',
      componentProps: { placeholder: '请输入公司或店铺名称' },
      fieldName: 'company_name',
      label: '公司/店铺名称',
      rules: companyNameRule,
    },
    {
      component: 'VbenInput',
      componentProps: { placeholder: '请输入手机号' },
      fieldName: 'phone',
      label: '手机号',
      rules: phoneRule,
    },
    {
      component: 'VbenInput',
      componentProps: { maxlength: 6, placeholder: '请输入 6 位验证码' },
      fieldName: 'sms_code',
      label: '短信验证码',
      rules: smsCodeRule,
      suffix: buildSMSSuffix(smsOptions),
    },
    {
      component: 'VbenInputPassword',
      componentProps: { placeholder: '字母开头，6-10 位' },
      fieldName: 'password',
      label: '登录密码',
      rules: loginPasswordRule,
    },
    {
      component: 'VbenInputPassword',
      componentProps: { placeholder: '请再次输入登录密码' },
      dependencies: {
        rules(values) {
          return z
            .string()
            .refine(
              (value) =>
                !validateMatchingValue(
                  value,
                  values.password,
                  '两次登录密码不一致',
                ),
              {
                message: '两次登录密码不一致',
              },
            );
        },
        triggerFields: ['password'],
      },
      fieldName: 'confirm_password',
      label: '确认登录密码',
    },
    {
      component: 'VbenInputPassword',
      componentProps: { maxlength: 6, placeholder: '请输入 6 位支付密码' },
      fieldName: 'pay_password',
      label: '支付密码',
      rules: payPasswordRule,
    },
    {
      component: 'VbenInputPassword',
      componentProps: { maxlength: 6, placeholder: '请再次输入支付密码' },
      dependencies: {
        rules(values) {
          return z
            .string()
            .refine(
              (value) =>
                !validateMatchingValue(
                  value,
                  values.pay_password,
                  '两次支付密码不一致',
                ),
              {
                message: '两次支付密码不一致',
              },
            );
        },
        triggerFields: ['pay_password'],
      },
      fieldName: 'confirm_pay_password',
      label: '确认支付密码',
    },
    {
      component: 'Checkbox',
      fieldName: 'agree_policy',
      renderComponentContent: () => ({
        default: () => '我已阅读并同意服务协议',
      }),
      rules: z.boolean().refine((value) => value === true, {
        message: '请先同意服务协议',
      }),
    },
  ];
}

/**
 * 忘记密码表单只负责验证码和新登录密码，成功后的清理登录态由 store 处理。
 */
export function buildCustomerForgotPasswordSchema(
  smsOptions: SMSActionOptions,
): VbenFormSchema[] {
  return [
    {
      component: 'VbenInput',
      componentProps: { placeholder: '请输入手机号' },
      fieldName: 'phone',
      label: '手机号',
      rules: phoneRule,
    },
    {
      component: 'VbenInput',
      componentProps: { maxlength: 6, placeholder: '请输入 6 位验证码' },
      fieldName: 'sms_code',
      label: '短信验证码',
      rules: smsCodeRule,
      suffix: buildSMSSuffix(smsOptions),
    },
    {
      component: 'VbenInputPassword',
      componentProps: { placeholder: '字母开头，6-10 位' },
      fieldName: 'password',
      label: '新登录密码',
      rules: loginPasswordRule,
    },
    {
      component: 'VbenInputPassword',
      componentProps: { placeholder: '请再次输入新登录密码' },
      dependencies: {
        rules(values) {
          return z
            .string()
            .refine(
              (value) =>
                !validateMatchingValue(
                  value,
                  values.password,
                  '两次登录密码不一致',
                ),
              {
                message: '两次登录密码不一致',
              },
            );
        },
        triggerFields: ['password'],
      },
      fieldName: 'confirm_password',
      label: '确认新密码',
    },
  ];
}
