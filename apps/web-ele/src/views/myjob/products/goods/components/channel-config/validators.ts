const MONEY_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,4})?$/;
const NON_NEGATIVE_INTEGER_PATTERN = /^(?:0|[1-9]\d*)$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/**
 * 渠道绑定里的金额都按非负、最多四位小数处理，和后端 money 字段口径保持一致。
 */
export function isValidNonNegativeMoney(value: string) {
  return MONEY_PATTERN.test(String(value ?? '').trim());
}

/**
 * 补单分钟数这类字段只允许非负整数，避免把浮点数或任意字符串提交给后端再被兜底拒绝。
 */
export function isValidNonNegativeInteger(value: number | string) {
  return NON_NEGATIVE_INTEGER_PATTERN.test(String(value ?? '').trim());
}

/**
 * 时段窗口沿用后端 `VARCHAR(5)` 约定，前端按 `HH:mm` 预校验，减少策略保存时的回退报错。
 */
export function isValidTimeValue(value: string) {
  return TIME_PATTERN.test(String(value ?? '').trim());
}
