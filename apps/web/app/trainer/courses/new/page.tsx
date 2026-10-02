'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Sparkles, BookOpen, PlusCircle, ArrowLeft, Trash2, Video, FileText, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';

type ModuleType = 'video' | 'text' | 'hybrid';

interface ModuleEntry {
  id: string;
  title: string;
  sequenceOrder: number;
  moduleType: ModuleType;
  videoUrl: string;
  textContent: string;
  documentUrl: string;
}

function generateTempId() {
  return Math.random().toString(36).slice(2);
}

export default function CourseBuilderPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiDrafting, setIsAiDrafting] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');

  // Modules state
  const [modules, setModules] = useState<ModuleEntry[]>([]);

  useEffect(() => {
    api.get('/courses/categories')
      .then((res) => {
        const list = res?.data || res || [];
        setCategories(list);
        if (list.length > 0) setCategoryId(list[0].id);
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
        toast.error('Failed to load categories');
      });
  }, []);

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
      toast.success('AI successfully drafted course outline in DRAFT status!');
      if (res.course) {
        setDescription(res.course.description || '');
      }
    } catch (err: any) {
      toast.error(err.message || 'AI Drafting failed');
    } finally {
      setIsAiDrafting(false);
    }
  };

  const addModule = () => {
    setModules((prev) => [
      ...prev,
      {
        id: generateTempId(),
        title: '',
        sequenceOrder: prev.length + 1,
        moduleType: 'video',
        videoUrl: '',
        textContent: '',
        documentUrl: '',
      },
    ]);
  };

  const removeModule = (id: string) => {
    setModules((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      return filtered.map((m, i) => ({ ...m, sequenceOrder: i + 1 }));
    });
  };

  const updateModule = (id: string, patch: Partial<ModuleEntry>) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryId === 'other' && !newCategoryName.trim()) {
      toast.error('Please specify the new category name.');
      return;
    }
    setIsSubmitting(true);
    try {
      const courseRes = await api.post('/courses', {
        title,
        description,
        categoryId: categoryId === 'other' ? undefined : categoryId,
        newCategoryName: categoryId === 'other' ? newCategoryName : undefined,
        difficulty,
        durationMinutes: Number(durationMinutes),
      });

      // Add modules if any were defined
      const courseId = courseRes?.id || courseRes?.data?.id;
      if (courseId && modules.length > 0) {
        for (const mod of modules) {
          if (!mod.title.trim()) continue;
          try {
            const payload: Record<string, any> = {
              title: mod.title,
              sequenceOrder: mod.sequenceOrder,
            };
            // Only send fields relevant to the module type
            if (mod.moduleType === 'video' || mod.moduleType === 'hybrid') {
              if (mod.videoUrl.trim()) payload.videoUrl = mod.videoUrl.trim();
            }
            if (mod.moduleType === 'text' || mod.moduleType === 'hybrid') {
              if (mod.textContent.trim()) payload.textContent = mod.textContent.trim();
            }
            if (mod.documentUrl.trim()) payload.documentUrl = mod.documentUrl.trim();
            await api.post(`/courses/${courseId}/modules`, payload);
          } catch {
            // Non-fatal: course was created; modules can be added later
            toast.error(`Failed to add module "${mod.title}" — add it manually.`);
          }
        }
      }

      toast.success('Course created in DRAFT status! Submitted for moderation.');
      router.push('/trainer');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const moduleTypeIcon = (type: ModuleType) => {
    if (type === 'video') return <Video className="w-3.5 h-3.5" />;
    if (type === 'text') return <FileText className="w-3.5 h-3.5" />;
    return <LayoutTemplate className="w-3.5 h-3.5" />;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <Link
        href="/trainer"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Trainer Studio
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Author New Course Module
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build structured capacity modules and submit for administrative review.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAiDraft}
          disabled={isAiDrafting}
          className="btn-secondary text-xs flex items-center gap-2 px-3 py-1.5"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          {isAiDrafting ? 'AI Drafting...' : 'AI One-Click Outline'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border shadow-sm rounded-md p-8 border border-border space-y-6">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Course Title / Topic
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cloud-Native Microservices Architecture with NestJS"
            className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Category Domain
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
                  placeholder="New Category Name"
                  className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Target Difficulty
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
              Duration (Minutes)
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
            Course Description & Learning Outcomes
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed overview of syllabus modules, skills covered, and industrial takeaways..."
            className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* ─── Modules Section ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Course Modules <span className="text-muted-foreground font-normal normal-case">(optional — add now or later)</span>
            </label>
            <button
              type="button"
              onClick={addModule}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Add Module
            </button>
          </div>

          {modules.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No modules added yet. You can add them after creating the course too.
            </p>
          )}

          {modules.map((mod, idx) => (
            <div key={mod.id} className="border border-border rounded-lg p-4 space-y-3 bg-background">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Module {mod.sequenceOrder}
                </span>
                <button
                  type="button"
                  onClick={() => removeModule(mod.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove module"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Module Title */}
              <input
                type="text"
                required={false}
                value={mod.title}
                onChange={(e) => updateModule(mod.id, { title: e.target.value })}
                placeholder="Module title"
                className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              {/* Module Type Selector */}
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Content Type
                </label>
                <div className="flex gap-2">
                  {(['video', 'text', 'hybrid'] as ModuleType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateModule(mod.id, { moduleType: type })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                        mod.moduleType === type
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {moduleTypeIcon(type)}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video URL — shown for video and hybrid */}
              {(mod.moduleType === 'video' || mod.moduleType === 'hybrid') && (
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={mod.videoUrl}
                    onChange={(e) => updateModule(mod.id, { videoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Text Content — shown for text and hybrid */}
              {(mod.moduleType === 'text' || mod.moduleType === 'hybrid') && (
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Text Content
                  </label>
                  <textarea
                    rows={4}
                    value={mod.textContent}
                    onChange={(e) => updateModule(mod.id, { textContent: e.target.value })}
                    placeholder="Write the module text content here..."
                    className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Document URL */}
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Document URL <span className="font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="url"
                  value={mod.documentUrl}
                  onChange={(e) => updateModule(mod.id, { documentUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          {isSubmitting ? 'Saving Course Draft...' : 'Create Course Module (Save Draft)'}
        </button>
      </form>
    </div>
  );
}
