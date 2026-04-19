type ProductGoodsChannelDialogCellValue = null | number | string;

export interface ProductGoodsChannelDialogColumn {
  field: string;
  formatter?: (args: {
    cellValue?: ProductGoodsChannelDialogCellValue;
  }) => string;
  minWidth: string;
  title: string;
}

function formatChannelCellValue(value: null | number | string | undefined) {
  const normalized = String(value ?? '').trim();
  return normalized || '--';
}

/**
 * 渠道配置弹窗里的绑定列表统一按表格列定义，避免组件模板继续堆积字段和展示兜底逻辑。
 */
export function buildProductGoodsChannelDialogColumns() {
  return [
    {
      field: 'display_name',
      minWidth: '220px',
      title: '名称',
    },
    {
      field: 'dock_status',
      minWidth: '120px',
      title: '对接状态',
    },
    {
      field: 'supplier_goods_no',
      formatter: ({
        cellValue,
      }: {
        cellValue?: ProductGoodsChannelDialogCellValue;
      }) => formatChannelCellValue(cellValue),
      minWidth: '160px',
      title: '对接编号',
    },
    {
      field: 'cost_price',
      formatter: ({
        cellValue,
      }: {
        cellValue?: ProductGoodsChannelDialogCellValue;
      }) => formatChannelCellValue(cellValue),
      minWidth: '140px',
      title: '进货价',
    },
    {
      field: 'effective_sell_price',
      formatter: ({
        cellValue,
      }: {
        cellValue?: ProductGoodsChannelDialogCellValue;
      }) => formatChannelCellValue(cellValue),
      minWidth: '160px',
      title: '利润后价格',
    },
    {
      field: 'validate_template_title',
      formatter: ({
        cellValue,
      }: {
        cellValue?: ProductGoodsChannelDialogCellValue;
      }) => formatChannelCellValue(cellValue),
      minWidth: '180px',
      title: '充值匹配',
    },
    {
      field: 'is_auto_change',
      minWidth: '140px',
      title: '自动改价',
    },
    {
      field: 'actions',
      minWidth: '240px',
      title: '操作',
    },
  ] satisfies ProductGoodsChannelDialogColumn[];
}
