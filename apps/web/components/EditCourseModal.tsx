'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Edit3, Sparkles, Trash2 } from 'lucide-react';
import { EditModuleModal } from './EditModuleModal';

interface EditCourseModalProps {
  course: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCourseModal({
  course,
  isOpen,
  onClose,
  onSuccess,
}: EditCourseModalProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setCategoryId(course.categoryId);
      setDifficulty(course.difficulty);
      setDurationMinutes(course.durationMinutes);
    }
  }, [course]);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      api.get('/courses/categories')
        .then((res) => {
          setCategories(res?.data || res || []);
        })
        .catch(() => toast.error('Failed to load categories'));
    }
  }, [isOpen]);

  const handleAiDraft = async () => {
    if (!title.trim()) {
      toast.error('Please enter a course topic/title first for AI generation');
      return;
    }
    setIsAiDrafting(true);
    try {
      const res = await api.post('/ai/draft-course-outline', {
        topic: title,
        targetAudience: 'Enterprise Software Engineers',
        difficulty,
      });
      toast.success('AI updated outline details based on your title!');
      if (res.course) {
        setDescription(res.course.description || '');
      }
    } catch (err: any) {
      toast.error(err.message || 'AI Drafting failed');
    } finally {
      setIsAiDrafting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryId === 'other' && !newCategoryName.trim()) {
      toast.error('Please specify the new category name.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.patch(`/courses/${course.id}`, {
        title,
        description,
        categoryId: categoryId === 'other' ? undefined : categoryId,
        newCategoryName: categoryId === 'other' ? newCategoryName : undefined,
        difficulty,
        durationMinutes: Number(durationMinutes),
      });
      toast.success('Course updated! If published, it is now Pending Approval.');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update course');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!course) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Course Details">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Course Title
          </label>
          <button
            type="button"
            onClick={handleAiDraft}
            disabled={isAiDrafting}
            className="btn-secondary text-xs flex items-center gap-1.5 px-2 py-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {isAiDrafting ? 'Drafting...' : 'AI Enhance'}
          </button>
        </div>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
                <option value="other">Other (Specify)</option>
              </select>
            </div>
            {categoryId === 'other' && (
              <div>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New Category"
                  className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Duration (Min)
            </label>
            <input
              type="number"
              required
              min={30}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Description
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          ></textarea>
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



