import { describe, expect, it } from 'vitest';

import {
  appendIndustrySelectorOptions,
  buildBrandTree,
  getAvailableBrandSortActions,
  mergeBrandChildren,
  relationIdsFromItems,
} from './shared';

describe('product shared helpers', () => {
  it('builds tree rows with lazy placeholders', () => {
    const tree = buildBrandTree([
      {
        children: [],
        created_at: '',
        credential_image: '',
        description: '',
        goods_count: 0,
        has_children: true,
        icon: '',
        id: 1,
        is_visible: 1,
        name: '腾讯视频',
        parent_id: 0,
        sort: 1,
        updated_at: '',
      },
    ]);

    const firstItem = tree[0];
    expect(firstItem).toBeDefined();
    expect(firstItem).toMatchObject({
      children: [],
      has_children: true,
      id: 1,
      parent_id: 0,
    });
  });

  it('merges lazy loaded children into the matching parent', () => {
    const tree = buildBrandTree([
      {
        children: [],
        created_at: '',
        credential_image: '',
        description: '',
        goods_count: 0,
        has_children: true,
        icon: '',
        id: 1,
        is_visible: 1,
        name: '腾讯视频',
        parent_id: 0,
        sort: 1,
        updated_at: '',
      },
    ]);

    const merged = mergeBrandChildren(tree, 1, [
      {
        children: [],
        created_at: '',
        credential_image: '',
        description: '',
        goods_count: 0,
        has_children: false,
        icon: '',
        id: 2,
        is_visible: 1,
        name: 'SVIP',
        parent_id: 1,
        sort: 1,
        updated_at: '',
      },
    ]);

    const mergedParent = merged[0];
    expect(mergedParent).toBeDefined();
    expect(mergedParent?.children).toHaveLength(1);

    const firstChild = mergedParent?.children[0];
    expect(firstChild).toBeDefined();
    expect(firstChild).toMatchObject({ id: 2, parent_id: 1 });
  });

  it('computes available brand sort actions by sibling position', () => {
    expect(getAvailableBrandSortActions(0, 3)).toEqual({
      bottom: true,
      down: true,
      top: false,
      up: false,
    });
    expect(getAvailableBrandSortActions(2, 3)).toEqual({
      bottom: false,
      down: false,
      top: true,
      up: true,
    });
  });

  it('extracts relation ids from industry relation items', () => {
    expect(
      relationIdsFromItems([
        { brand_id: 9, brand_icon: '', brand_name: '腾讯视频', id: 1, sort: 1 },
      ]),
    ).toEqual([9]);
  });

  it('deduplicates selector options while preserving existing selected brands', () => {
    const merged = appendIndustrySelectorOptions(
      [
        { icon: '', id: 1, name: '腾讯视频' },
        { icon: '', id: 2, name: '爱奇艺' },
      ],
      [
        { icon: '', id: 2, name: '爱奇艺' },
        { icon: '', id: 3, name: '优酷' },
      ],
    );

    expect(merged).toEqual([
      { icon: '', id: 1, name: '腾讯视频' },
      { icon: '', id: 2, name: '爱奇艺' },
      { icon: '', id: 3, name: '优酷' },
    ]);
  });
});
