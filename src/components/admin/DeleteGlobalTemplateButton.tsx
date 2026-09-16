'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteGlobalTemplateAction } from '@/app/admin/actions';

export function DeleteGlobalTemplateButton({
  templateId,
  templateName,
}: {
  templateId: string;
  templateName: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove global template "${templateName}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteGlobalTemplateAction(templateId);
      router.refresh();
    } catch {
      alert('Failed to delete global template.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleDelete}
      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition cursor-pointer disabled:opacity-50"
      title="Delete Global Template"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
