import { formatDateTime } from '../../shared';

/**
 * 商品页筛选 schema 统一从这里生成，避免入口页同时堆积筛选项定义和页面状态。
 */
export function buildProductGoodsFilterSchema(options: {
  booleanOptions: Array<{ label: string; value: string }>;
  brandOptions: Array<{ label: string; value: number | string }>;
  goodsTypeOptions: Array<{ label: string; value: string }>;
  onVisibleChange: (visible: boolean) => Promise<void> | void;
  statusOptions: Array<{ label: string; value: string }>;
}) {
  return [
    {
      component: 'Input',
      fieldName: 'keyword',
      label: '关键词',
      componentProps: {
        placeholder: '商品名称 / 商品编码',
      },
    },
    {
      component: 'Select',
      fieldName: 'brand_id',
      label: '品牌',
      componentProps: {
        onVisibleChange: options.onVisibleChange,
        options: options.brandOptions,
        placeholder: '请选择品牌',
      },
    },
    {
      component: 'Select',
      fieldName: 'goods_type',
      label: '商品类型',
      componentProps: {
        onVisibleChange: options.onVisibleChange,
        options: options.goodsTypeOptions,
        placeholder: '请选择商品类型',
      },
    },
    {
      component: 'Select',
      fieldName: 'has_tax',
      label: '是否含税',
      componentProps: {
        onVisibleChange: options.onVisibleChange,
        options: options.booleanOptions,
        placeholder: '请选择是否含税',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        onVisibleChange: options.onVisibleChange,
        options: options.statusOptions,
        placeholder: '请选择状态',
      },
    },
  ];
}

/**
 * 商品列表列定义集中在这里，新增渠道配置列后避免继续把入口页做成超大配置文件。
 */
export function buildProductGoodsColumns(
  formatAmount: (value: string) => string,
) {
  return [
    {
      className: 'goods-product-info-column',
      field: 'product_info',
      minWidth: 560,
      showOverflow: false,
      slots: { default: 'productInfo' },
      title: '商品信息',
    },
    {
      field: 'channel_config',
      minWidth: 220,
      showOverflow: false,
      slots: { default: 'channelConfig' },
      title: '渠道配置',
    },
    {
      field: 'purchase_limit_strategy_name',
      formatter: ({ cellValue }: { cellValue?: string }) => cellValue || '--',
      minWidth: 180,
      title: '限制策略',
    },
    {
      field: 'default_sell_price',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatAmount(cellValue ?? ''),
      minWidth: 120,
      title: '默认售价',
    },
    {
      field: 'terminal_price_limit',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatAmount(cellValue ?? ''),
      minWidth: 120,
      title: '终端限价',
    },
    {
      field: 'status',
      minWidth: 100,
      slots: { default: 'status' },
      title: '状态',
    },
    {
      field: 'created_at',
      formatter: ({ cellValue }: { cellValue?: string }) =>
        formatDateTime(cellValue),
      minWidth: 180,
      title: '创建时间',
    },
    {
      field: 'actions',
      fixed: 'right' as const,
      minWidth: 180,
      slots: { default: 'actions' },
      title: '操作',
    },
  ];
}
