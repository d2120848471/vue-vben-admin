const MONEY_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,4})?$/;

/**
 * 渠道绑定里的金额都按非负、最多四位小数处理，和后端 money 字段口径保持一致。
 */
export function isValidNonNegativeMoney(value: string) {
  return MONEY_PATTERN.test(String(value ?? '').trim());
}
