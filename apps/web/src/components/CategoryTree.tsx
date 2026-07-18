'use client';

import { useId, useState } from 'react';
import { CategoryCard } from '@/components/CategoryCard';
import type { CategoryItem, Locale } from '@/lib/types';

interface CategoryNode extends CategoryItem {
  children: CategoryNode[];
}

interface CategoryTreeProps {
  categories: CategoryItem[];
  locale: Locale;
}

export function buildCategoryForest(categories: CategoryItem[]): CategoryNode[] {
  const byId = new Map<string, CategoryItem>();
  const childrenByParent = new Map<string, CategoryItem[]>();

  for (const category of categories) {
    byId.set(category.id, category);
    if (category.parentId && category.parentId !== category.id) {
      const children = childrenByParent.get(category.parentId) ?? [];
      children.push(category);
      childrenByParent.set(category.parentId, children);
    }
  }

  const placed = new Set<string>();
  const materialize = (category: CategoryItem, path: Set<string>): CategoryNode | null => {
    if (placed.has(category.id) || path.has(category.id)) return null;
    placed.add(category.id);
    const nextPath = new Set(path);
    nextPath.add(category.id);
    const children = (childrenByParent.get(category.id) ?? [])
      .map((child) => materialize(child, nextPath))
      .filter((child): child is CategoryNode => child !== null);
    return { ...category, children };
  };

  const roots: CategoryNode[] = [];
  for (const category of categories) {
    const isRoot = !category.parentId || !byId.has(category.parentId) || category.parentId === category.id;
    if (!isRoot) continue;
    const node = materialize(category, new Set());
    if (node) roots.push(node);
  }

  // Broken or cyclic hierarchies become additional roots instead of crashing the page.
  for (const category of categories) {
    const node = materialize(category, new Set());
    if (node) roots.push(node);
  }

  return roots;
}

function CategoryBranch({ node, locale, level }: { node: CategoryNode; locale: Locale; level: number }) {
  const regionId = useId();
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = node.children.length > 0;
  const isZh = locale === 'zh';
  const name = node.translation?.name || node.slug;

  return (
    <li className={level === 0 ? 'border-b border-border-subtle last:border-b-0' : ''}>
      <div className="flex min-w-0 items-center gap-1">
        <div className="min-w-0 flex-1">
          <CategoryCard category={node} locale={locale} variant={level === 0 ? 'row' : 'compact'} />
        </div>
        {hasChildren && (
          <button
            type="button"
            className="mr-3 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] text-lg text-text-secondary transition-colors duration-fast hover:bg-bg-muted hover:text-text-primary sm:mr-4"
            aria-expanded={expanded}
            aria-controls={regionId}
            aria-label={expanded
              ? (isZh ? `收起 ${name} 的子分类` : `Collapse subcategories of ${name}`)
              : (isZh ? `展开 ${name} 的子分类` : `Expand subcategories of ${name}`)}
            title={expanded ? (isZh ? '收起子分类' : 'Collapse') : (isZh ? '展开子分类' : 'Expand')}
            onClick={() => setExpanded((value) => !value)}
          >
            <span aria-hidden="true" className={`transition-transform duration-fast ${expanded ? 'rotate-90' : ''}`}>›</span>
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div id={regionId} className="border-t border-border-subtle bg-bg-subtle px-3 py-3 sm:px-5 sm:py-4">
          <p className="mb-3 px-1 text-xs text-text-muted">
            {isZh ? `${node.children.length} 个直接子分类` : `${node.children.length} direct subcategories`}
          </p>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {node.children.map((child) => (
              <CategoryBranch key={child.id} node={child} locale={locale} level={level + 1} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export function CategoryTree({ categories, locale }: CategoryTreeProps) {
  const forest = buildCategoryForest(categories);
  return (
    <ul className="overflow-hidden rounded-[8px] border border-border-subtle bg-surface" aria-label={locale === 'zh' ? '分类树' : 'Category tree'}>
      {forest.map((node) => (
        <CategoryBranch key={node.id} node={node} locale={locale} level={0} />
      ))}
    </ul>
  );
}
