import type {
  ProductGoodsBrandOption,
  ProductGoodsStrategyOption,
} from '#/api/modules/admin/products/goods';
import type { SortAction } from '#/api/modules/admin/common';
import type {
  BrandListItem,
  BrandSelectorItem,
} from '#/api/modules/admin/products/brands';
import type { IndustryRelationBrandItem } from '#/api/modules/admin/products/industries';

export interface BrandSortActionAvailability {
  bottom: boolean;
  down: boolean;
  top: boolean;
  up: boolean;
}

export interface BrandManageActionVisibility {
  createChild: boolean;
  createChildText: string;
  delete: boolean;
  edit: boolean;
}

export interface BrandSortActionItem {
  action: SortAction;
  disabled: boolean;
  tooltip: string;
}

export interface BrandTreeNodePresentation {
  depth: number;
  extraIndentPx: number;
  isRoot: boolean;
  levelLabel: string;
}

export interface ProductGoodsBrandFilterOption {
  label: string;
  value: number;
}

export interface ProductGoodsBrandCascaderOption {
  children: ProductGoodsBrandCascaderOption[];
  disabled: boolean;
  label: string;
  value: number;
}

export interface ProductGoodsCurrentStrategyOption {
  id: null | number;
  name: string;
  status: number;
}

export interface ProductGoodsStrategySelectOption {
  disabled: boolean;
  label: string;
  value: number;
}

const ABSOLUTE_URL_PATTERN = /^(?:[a-z]+:)?\/\//i;
const BRAND_TREE_EXTRA_INDENT_STEP = 14;
const BRAND_TREE_MAX_DEPTH = 3;
const BRAND_SORT_ACTIONS: SortAction[] = ['top', 'up', 'down', 'bottom'];
const BRAND_SORT_LABELS: Record<SortAction, string> = {
  bottom: '置底',
  down: '下移',
  top: '置顶',
  up: '上移',
};

export function buildBrandTree(items: BrandListItem[]): BrandListItem[] {
  return items.map((item) => ({
    ...item,
    children: buildBrandTree(item.children ?? []),
  }));
}

export function findBrandTreeNode(
  items: BrandListItem[],
  brandId: number,
): BrandListItem | null {
  for (const item of items) {
    if (item.id === brandId) {
      return item;
    }
    const matchedChild = findBrandTreeNode(item.children ?? [], brandId);
    if (matchedChild) {
      return matchedChild;
    }
  }
  return null;
}

export function getBrandTreeDepth(
  items: BrandListItem[],
  brandId: number,
  depth = 1,
): null | number {
  for (const item of items) {
    if (item.id === brandId) {
      return depth;
    }
    const childDepth = getBrandTreeDepth(
      item.children ?? [],
      brandId,
      depth + 1,
    );
    if (childDepth !== null) {
      return childDepth;
    }
  }
  return null;
}

export function getBrandTreePath(
  items: BrandListItem[],
  brandId: number,
  path: number[] = [],
): null | number[] {
  for (const item of items) {
    const nextPath = [...path, item.id];
    if (item.id === brandId) {
      return nextPath;
    }
    const childPath = getBrandTreePath(item.children ?? [], brandId, nextPath);
    if (childPath) {
      return childPath;
    }
  }
  return null;
}

export function mergeBrandChildren(
  items: BrandListItem[],
  parentId: number,
  children: BrandListItem[],
): BrandListItem[] {
  return items.map((item) => {
    const nextChildren =
      item.children && item.children.length > 0
        ? mergeBrandChildren(item.children, parentId, children)
        : item.children;

    if (item.id !== parentId) {
      return nextChildren === item.children
        ? item
        : {
            ...item,
            children: nextChildren,
          };
    }
    return {
      ...item,
      children: buildBrandTree(children),
      has_children: children.length > 0,
    };
  });
}

export function getAvailableBrandSortActions(
  index: number,
  total: number,
): BrandSortActionAvailability {
  return {
    bottom: index < total - 1,
    down: index < total - 1,
    top: index > 0,
    up: index > 0,
  };
}

export function getBrandTreeNodePresentation(
  level = 0,
): BrandTreeNodePresentation {
  const normalizedLevel = Number.isFinite(level) ? Math.max(0, level) : 0;
  const depth = normalizedLevel + 1;
  let levelLabel = `${depth}级品牌`;
  switch (depth) {
    case 1: {
      levelLabel = '一级品牌';
      break;
    }
    case 2: {
      levelLabel = '二级品牌';
      break;
    }
    case 3: {
      levelLabel = '三级品牌';
      break;
    }
    default: {
      break;
    }
  }
  return {
    depth,
    extraIndentPx: Math.max(0, depth - 2) * BRAND_TREE_EXTRA_INDENT_STEP,
    isRoot: depth === 1,
    levelLabel,
  };
}

export function getBrandSortActionItems(
  availability: BrandSortActionAvailability,
): BrandSortActionItem[] {
  return BRAND_SORT_ACTIONS.map((action) => ({
    action,
    disabled: !availability[action],
    tooltip: BRAND_SORT_LABELS[action],
  }));
}

export function getBrandManageActionVisibility(
  depth: number,
): BrandManageActionVisibility {
  const normalizedDepth = Number.isFinite(depth) ? Math.max(1, depth) : 1;
  const canCreateChild = normalizedDepth < BRAND_TREE_MAX_DEPTH;
  const nextLevelText = canCreateChild
    ? getBrandTreeNodePresentation(normalizedDepth).levelLabel.replace(
        '品牌',
        '',
      )
    : '';

  return {
    createChild: canCreateChild,
    createChildText: nextLevelText ? `新增${nextLevelText}` : '',
    delete: true,
    edit: true,
  };
}

export function relationIdsFromItems(items: IndustryRelationBrandItem[]) {
  return items.map((item) => item.brand_id);
}

export function appendIndustrySelectorOptions(
  current: BrandSelectorItem[],
  incoming: BrandSelectorItem[],
): BrandSelectorItem[] {
  const deduped = new Map<number, BrandSelectorItem>();
  for (const item of [...current, ...incoming]) {
    deduped.set(item.id, item);
  }
  return [...deduped.values()];
}

export function resolveProductImageUrl(url: string, apiURL = '') {
  if (
    !url ||
    ABSOLUTE_URL_PATTERN.test(url) ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  if (!url.startsWith('/') || !ABSOLUTE_URL_PATTERN.test(apiURL)) {
    return url;
  }

  return new URL(url, apiURL).toString();
}

export function shouldShowBrandAssetFields(parentId: number) {
  return parentId === 0;
}

export function buildProductGoodsBrandFilterOptions(
  items: ProductGoodsBrandOption[],
  parentLabels: string[] = [],
): ProductGoodsBrandFilterOption[] {
  const options: ProductGoodsBrandFilterOption[] = [];
  for (const item of items) {
    const nextLabels = [...parentLabels, item.name];
    options.push(
      {
        label: nextLabels.join(' / '),
        value: item.id,
      },
      ...buildProductGoodsBrandFilterOptions(item.children ?? [], nextLabels),
    );
  }
  return options;
}

export function buildProductGoodsBrandCascaderOptions(
  items: ProductGoodsBrandOption[],
): ProductGoodsBrandCascaderOption[] {
  return items.map((item) => ({
    children: buildProductGoodsBrandCascaderOptions(item.children ?? []),
    disabled: false,
    label: item.name,
    value: item.id,
  }));
}

export function getProductGoodsBrandPath(
  items: ProductGoodsBrandOption[],
  brandId: number,
  path: number[] = [],
): null | number[] {
  for (const item of items) {
    const nextPath = [...path, item.id];
    if (item.id === brandId) {
      return nextPath;
    }
    const childPath = getProductGoodsBrandPath(
      item.children ?? [],
      brandId,
      nextPath,
    );
    if (childPath) {
      return childPath;
    }
  }
  return null;
}

export function buildProductGoodsStrategySelectOptions(
  options: ProductGoodsStrategyOption[],
  currentOption?: ProductGoodsCurrentStrategyOption,
): ProductGoodsStrategySelectOption[] {
  const items = options.map((item) => ({
    disabled: false,
    label: item.name,
    value: item.id,
  }));
  if (!currentOption?.id || !currentOption.name) {
    return items;
  }
  if (items.some((item) => item.value === currentOption.id)) {
    return items;
  }
  return [
    ...items,
    {
      disabled: currentOption.status === 0,
      label:
        currentOption.status === 0
          ? `${currentOption.name}（当前已绑定/已禁用）`
          : currentOption.name,
      value: currentOption.id,
    },
  ];
}
