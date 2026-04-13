import { describe, expect, it } from 'vitest';

import {
  appendIndustrySelectorOptions,
  buildBrandTree,
  getAvailableBrandSortActions,
  getBrandManageActionVisibility,
  getBrandSortActionItems,
  getBrandTreeNodePresentation,
  getBrandTreePath,
  mergeBrandChildren,
  relationIdsFromItems,
  resolveProductImageUrl,
  shouldShowBrandAssetFields,
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

  it('merges lazy loaded children into nested parents recursively', () => {
    const tree = buildBrandTree([
      {
        children: [
          {
            children: [],
            created_at: '',
            credential_image: '',
            description: '',
            goods_count: 0,
            has_children: true,
            icon: '',
            id: 2,
            is_visible: 1,
            name: 'SVIP',
            parent_id: 1,
            sort: 1,
            updated_at: '',
          },
        ],
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

    const merged = mergeBrandChildren(tree, 2, [
      {
        children: [],
        created_at: '',
        credential_image: '',
        description: '',
        goods_count: 0,
        has_children: false,
        icon: '',
        id: 3,
        is_visible: 1,
        name: '连续包月',
        parent_id: 2,
        sort: 1,
        updated_at: '',
      },
    ]);

    expect(merged[0]?.children[0]?.children).toEqual([
      expect.objectContaining({ id: 3, parent_id: 2 }),
    ]);
  });

  it('returns the full ancestor path for a nested brand node', () => {
    const tree = buildBrandTree([
      {
        children: [
          {
            children: [
              {
                children: [],
                created_at: '',
                credential_image: '',
                description: '',
                goods_count: 0,
                has_children: false,
                icon: '',
                id: 3,
                is_visible: 1,
                name: '连续包月',
                parent_id: 2,
                sort: 1,
                updated_at: '',
              },
            ],
            created_at: '',
            credential_image: '',
            description: '',
            goods_count: 0,
            has_children: true,
            icon: '',
            id: 2,
            is_visible: 1,
            name: 'SVIP',
            parent_id: 1,
            sort: 1,
            updated_at: '',
          },
        ],
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

    expect(getBrandTreePath(tree, 3)).toEqual([1, 2, 3]);
    expect(getBrandTreePath(tree, 99)).toBeNull();
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

  it('maps zero-based tree levels into explicit hierarchy metadata', () => {
    expect(getBrandTreeNodePresentation(0)).toMatchObject({
      depth: 1,
      extraIndentPx: 0,
      isRoot: true,
      levelLabel: '一级品牌',
    });
    expect(getBrandTreeNodePresentation(1)).toMatchObject({
      depth: 2,
      extraIndentPx: 0,
      isRoot: false,
      levelLabel: '二级品牌',
    });
    expect(getBrandTreeNodePresentation(2)).toMatchObject({
      depth: 3,
      extraIndentPx: 14,
      isRoot: false,
      levelLabel: '三级品牌',
    });
  });

  it('builds sort action descriptors with tooltip copy and disabled states', () => {
    expect(getBrandSortActionItems(getAvailableBrandSortActions(0, 3))).toEqual(
      [
        { action: 'top', disabled: true, tooltip: '置顶' },
        { action: 'up', disabled: true, tooltip: '上移' },
        { action: 'down', disabled: false, tooltip: '下移' },
        { action: 'bottom', disabled: false, tooltip: '置底' },
      ],
    );
  });

  it('shows add-child management until level 3 and exposes the next-level label', () => {
    expect(getBrandManageActionVisibility(1)).toEqual({
      createChild: true,
      createChildText: '新增二级',
      delete: true,
      edit: true,
    });
    expect(getBrandManageActionVisibility(2)).toEqual({
      createChild: true,
      createChildText: '新增三级',
      delete: true,
      edit: true,
    });
    expect(getBrandManageActionVisibility(3)).toEqual({
      createChild: false,
      createChildText: '',
      delete: true,
      edit: true,
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

  it('resolves uploaded image paths against an absolute api origin', () => {
    expect(
      resolveProductImageUrl(
        '/uploads/brands/icon.png',
        'http://127.0.0.1:8080/api',
      ),
    ).toBe('http://127.0.0.1:8080/uploads/brands/icon.png');
  });

  it('keeps relative uploaded image paths when api url is already relative', () => {
    expect(resolveProductImageUrl('/uploads/brands/icon.png', '/api')).toBe(
      '/uploads/brands/icon.png',
    );
  });

  it('shows asset fields only for root brands', () => {
    expect(shouldShowBrandAssetFields(0)).toBe(true);
    expect(shouldShowBrandAssetFields(12)).toBe(false);
  });
});
