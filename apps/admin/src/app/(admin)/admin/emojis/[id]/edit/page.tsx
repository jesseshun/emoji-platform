'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { EmojiForm } from '@/components/EmojiForm';
import { getEmoji, AdminEmojiDetail, AdminApiError } from '@/lib/adminApi';

export default function EditEmojiPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [initial, setInitial] = useState<AdminEmojiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getEmoji(id);
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

  return <EmojiForm mode="edit" emojiId={id} initial={initial} />;
}
