import type {
  BrandListItem,
  BrandSelectorItem,
  IndustryRelationBrandItem,
} from '#/api';

export interface BrandSortActionAvailability {
  bottom: boolean;
  down: boolean;
  top: boolean;
  up: boolean;
}

export function buildBrandTree(items: BrandListItem[]): BrandListItem[] {
  return items.map((item) => ({
    ...item,
    children: buildBrandTree(item.children ?? []),
  }));
}

export function mergeBrandChildren(
  items: BrandListItem[],
  parentId: number,
  children: BrandListItem[],
): BrandListItem[] {
  return items.map((item) => {
    if (item.id !== parentId) {
      return item;
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
