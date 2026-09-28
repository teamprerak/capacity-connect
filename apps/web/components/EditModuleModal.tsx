'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Edit3 } from 'lucide-react';

interface EditModuleModalProps {
  courseId: string;
  module: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditModuleModal({
  courseId,
  module,
  isOpen,
  onClose,
  onSuccess,
}: EditModuleModalProps) {
  const [title, setTitle] = useState('');
  const [sequenceOrder, setSequenceOrder] = useState(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (module) {
      setTitle(module.title);
      setSequenceOrder(module.sequenceOrder);
      setVideoUrl(module.videoUrl || '');
      setDocumentUrl(module.documentUrl || '');
    }
  }, [module]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Module title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch(`/courses/${courseId}/modules/${module.id}`, {
        title: title.trim(),
        sequenceOrder: Number(sequenceOrder),
        videoUrl: videoUrl.trim() ? videoUrl.trim() : null,
        documentUrl: documentUrl.trim() ? documentUrl.trim() : null,
      });
      toast.success(`Module "${title}" updated!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update module');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!module) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Module">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Module Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Sequence Order
          </label>
          <input
            type="number"
            required
            min={1}
            value={sequenceOrder}
            onChange={(e) => setSequenceOrder(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            YouTube Video URL <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Document Link <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
          </label>
          <input
            type="url"
            value={documentUrl}
            onChange={(e) => setDocumentUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-md text-sm font-semibold text-muted-foreground border border-border hover:bg-card transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-md text-sm font-bold bg-primary hover:bg-blue-500 text-foreground transition flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
