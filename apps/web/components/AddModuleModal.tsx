'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { PlusCircle, Layers } from 'lucide-react';
import { useTranslation } from "react-i18next";

interface AddModuleModalProps {
  courseId: string;
  courseTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddModuleModal({
  courseId,
  courseTitle,
  isOpen,
  onClose,
  onSuccess,
}: AddModuleModalProps) {
    const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [sequenceOrder, setSequenceOrder] = useState(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Module title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/courses/${courseId}/modules`, {
        title: title.trim(),
        sequenceOrder: Number(sequenceOrder),
        ...(videoUrl.trim() ? { videoUrl: videoUrl.trim() } : {}),
        ...(documentUrl.trim() ? { documentUrl: documentUrl.trim() } : {}),
      });
      toast.success(`Module "${title}" added successfully!`);
      setTitle('');
      setSequenceOrder(1);
      setVideoUrl('');
      setDocumentUrl('');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add module');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("add_syllabus_module")}>
      <div className="mb-4">
        <p className="text-xs text-muted-foreground">
           {t("adding_module_to_")} {' '}
          <span className="text-primary font-semibold">{courseTitle}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Module Title */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
             {t("module_title")} </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("e_g__module_1__introduction_to")}
            className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          />
        </div>

        {/* Sequence Order */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
             {t("sequence_order")} </label>
          <input
            type="number"
            required
            min={1}
            value={sequenceOrder}
            onChange={(e) => setSequenceOrder(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
             {t("determines_the_order_this_modu")} </p>
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
             {t("youtube_video_url")} <span className="text-muted-foreground font-normal ml-1"> {t("_optional_")} </span>
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={t("https___www_youtube_com_watch_")}
            className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          />
        </div>

        {/* Document URL */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
             {t("document_link__google_drive___")} <span className="text-muted-foreground font-normal ml-1"> {t("_optional_")} </span>
          </label>
          <input
            type="url"
            value={documentUrl}
            onChange={(e) => setDocumentUrl(e.target.value)}
            placeholder={t("https___docs_google_com____")}
            className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-md text-sm font-semibold text-muted-foreground border border-border hover:bg-card hover:text-foreground transition"
          >
             {t("cancel")} </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-md text-sm font-bold bg-primary hover:bg-blue-500 text-foreground transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <PlusCircle className="w-4 h-4" />
            {isSubmitting ? 'Adding...' : 'Add Module'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
