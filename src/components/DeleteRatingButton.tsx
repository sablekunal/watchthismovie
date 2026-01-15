'use client';
import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteRatingButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Remove this rating from your history?')) return;
    setLoading(true);

    // Use Server Action instead of Client Supabase
    const { deleteRatingAction } = await import('@/app/actions'); // Dynamic import to avoid build loops if any
    await deleteRatingAction(id);

    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
      title="Remove Rating"
      suppressHydrationWarning
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
    </button>
  );
}