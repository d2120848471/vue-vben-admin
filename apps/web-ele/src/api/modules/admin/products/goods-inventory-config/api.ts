import type {
  ProductGoodsInventoryConfigPayload,
  ProductGoodsInventoryConfigResult,
} from './types';

import { requestClient } from '#/api/request';

/**
 * 商品管理-库存配置：读取指定商品的库存配置详情和下单策略选项。
 */
export async function getProductGoodsInventoryConfigApi(goodsId: number) {
  return requestClient.get<ProductGoodsInventoryConfigResult>(
    `/admin/products/${goodsId}/inventory-config`,
  );
}

/**
 * 商品管理-库存配置：保存指定商品的库存配置。
 */
export async function saveProductGoodsInventoryConfigApi(
  goodsId: number,
  data: ProductGoodsInventoryConfigPayload,
) {
  return requestClient.put(`/admin/products/${goodsId}/inventory-config`, data);
}
