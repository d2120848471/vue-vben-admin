import type { PagedResult } from '../../common';
import type {
  ProductGoodsChannelPriceChangeItem,
  ProductGoodsChannelPriceChangeListQuery,
} from './types';

import { requestClient } from '#/api/request';

/**
 * 商品管理-自动改价记录：分页查询监控或供应商推送触发的渠道改价记录。
 */
export async function getProductGoodsChannelPriceChangeListApi(
  params: ProductGoodsChannelPriceChangeListQuery,
) {
  return requestClient.get<PagedResult<ProductGoodsChannelPriceChangeItem>>(
    '/admin/product-goods-channel-price-changes',
    { params },
  );
}
