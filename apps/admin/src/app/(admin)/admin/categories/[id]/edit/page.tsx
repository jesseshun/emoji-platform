'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CategoryForm } from '@/components/CategoryForm';
import { getCategory, AdminCategoryDetail, AdminApiError } from '@/lib/adminApi';

export default function EditCategoryPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [initial, setInitial] = useState<AdminCategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getCategory(id);
        if (active) setInitial(data);
      } catch (err) {
        if (active) {
          setError(err instanceof AdminApiError ? err.message || '加载失败' : '加载失败');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <div className="text-gray-500">加载中…</div>;
  }
  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
        {error}
      </div>
    );
  }
  if (!initial) return null;

  return <CategoryForm mode="edit" categoryId={id} initial={initial} />;
}
