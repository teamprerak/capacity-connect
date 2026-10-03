'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/StatCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { AddModuleModal } from '@/components/AddModuleModal';
import { EditCourseModal } from '@/components/EditCourseModal';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  BookOpen,
  Users,
  PlusCircle,
  Sparkles,
  FileText,
  Layers,
  SendHorizonal,
  Archive,
  Clock,
  CheckCircle2,
  XCircle,
  BadgeAlert,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useTranslation } from "react-i18next";

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; Icon: React.ElementType }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    Icon: FileText,
  },
  pending_approval: {
    label: 'Pending Review',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    Icon: Clock,
  },
  published: {
    label: 'Published',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Icon: CheckCircle2,
  },
  archived: {
    label: 'Archived',
    className: 'bg-rose-100 text-rose-700 border-rose-200',
    Icon: Archive,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['draft'];
  const Icon = cfg.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${cfg.className}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Course Action Buttons ────────────────────────────────────────────────────

interface CourseActionsProps {
  course: any;
  onAddModule: (course: any) => void;
  onSubmit: (courseId: string, moduleCount: number) => void;
  onArchive: (courseId: string) => void;
  onUnarchive: (courseId: string) => void;
  onEdit: (course: any) => void;
  onDelete: (courseId: string) => void;
}

function CourseActions({ course, onAddModule, onSubmit, onArchive, onUnarchive, onEdit, onDelete }: CourseActionsProps) {
    const { t } = useTranslation();
  const moduleCount: number = course._count?.modules ?? 0;

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {course.status !== 'archived' && (
          <button
            onClick={() => onEdit(course)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-muted-foreground border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1.5"
          >
             {t("edit_course")} </button>
        )}

        {course.status !== 'archived' && (
          <button
            onClick={() => onAddModule(course)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
             {t("add_module")} </button>
        )}

        {course.status === 'draft' && (
          <div className="relative group">
            <button
              onClick={() => onSubmit(course.id, moduleCount)}
              disabled={moduleCount === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <SendHorizonal className="w-3.5 h-3.5" />
               {t("submit")} </button>

            {moduleCount === 0 && (
              <div className="absolute bottom-full right-0 mb-2 w-52 px-3 py-2 rounded-lg bg-background border border-border text-[11px] text-amber-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="flex items-start gap-1.5">
                  <BadgeAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                   {t("add_at_least_1_module_before_s")} </div>
              </div>
            )}
          </div>
        )}

        {course.status === 'published' && (
          <button
            onClick={() => onArchive(course.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 transition-all flex items-center gap-1.5"
          >
            <Archive className="w-3.5 h-3.5" />
             {t("archive")} </button>
        )}

        {course.status === 'archived' && (
          <button
            onClick={() => onUnarchive(course.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
             {t("unarchive")} </button>
        )}

        <button
          onClick={() => onDelete(course.id)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition-all flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
           {t("delete")} </button>
      </div>
      
      {course.status === 'pending_approval' && (
        <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold mt-1">
          <Clock className="w-4 h-4 animate-pulse" />
           {t("under_review")} </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TrainerDashboard() {
    const { t } = useTranslation();
  const [courses, setCourses] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [addModuleCourse, setAddModuleCourse] = useState<any | null>(null);
  const [editCourse, setEditCourse] = useState<any | null>(null);

  const fetchData = useCallback(() => {
    setIsLoading(true);
    Promise.all([
      // H-7: Fetch only THIS trainer's courses (all statuses).
      // Passing `mine=true` — the backend resolves the trainer from the JWT cookie.
      api.get('/courses?mine=true&limit=50').catch(() => ({ data: [] })),
      api.get('/trainer/profile').catch(() => null),
    ])
      .then(([coursesRes, profileRes]) => {
        setCourses(coursesRes.data || []);
        setProfile(profileRes);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Action Handlers ──────────────────────────────────────────────────────────

  const handleOpenAddModule = (course: any) => {
    setAddModuleCourse(course);
  };

  const handleEditCourse = (course: any) => {
    setEditCourse(course);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This action is permanent and cannot be undone.')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success('Course deleted successfully.');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete course');
    }
  };

  const handleSubmitForReview = async (courseId: string, moduleCount: number) => {
    if (moduleCount === 0) {
      toast.error('Add at least one module before submitting for review.');
      return;
    }
    try {
      await api.post(`/courses/${courseId}/submit`);
      toast.success('Course submitted for administrative review! You will be notified upon approval.');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Submission failed. Please try again.');
    }
  };

  const handleArchive = async (courseId: string) => {
    if (!window.confirm('Archive this published course? Trainees will no longer be able to enroll.')) return;
    try {
      await api.patch(`/courses/${courseId}/archive`);
      toast.success('Course archived successfully.');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Archive failed. Please try again.');
    }
  };

  const handleUnarchive = async (courseId: string) => {
    try {
      await api.patch(`/courses/${courseId}/unarchive`);
      toast.success('Course unarchived successfully. It is now published.');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Unarchive failed. Please try again.');
    }
  };

  // ── Derived Stats ────────────────────────────────────────────────────────────

  const totalEnrollments = courses.reduce(
    (acc, c) => acc + (c._count?.enrollments ?? 0),
    0,
  );
  const pendingCount = courses.filter((c) => c.status === 'pending_approval').length;
  const publishedCount = courses.filter((c) => c.status === 'published').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
             {t("trainer_studio_console")} </h1>
          <p className="text-sm text-muted-foreground mt-1">
             {t("author_courses__upload_learnin")} </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/trainer/courses/new"
            className="px-4 py-2.5 rounded-md bg-primary hover:bg-blue-500 font-bold text-xs text-foreground shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />  {t("build_course")} </Link>
          <Link
            href="/trainer/assessments/new"
            className="px-4 py-2.5 rounded-md bg-primary hover:bg-blue-500 font-bold text-xs text-foreground shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />  {t("author_assessment")} </Link>
        </div>
      </div>

      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t("authored_courses")}
          value={courses.length}
          subtitle="Authored Capacity Modules"
          icon={BookOpen}
        />
        <StatCard
          title={t("active_students")}
          value={totalEnrollments}
          subtitle="Active Trainee Enrollments"
          icon={Users}
        />
        <StatCard
          title={t("published_courses")}
          value={publishedCount}
          subtitle="Published to Global Catalog"
          icon={CheckCircle2}
        />
        <StatCard
          title={t("average_rating")}
          value={
            profile?.trainerRatingAvg
              ? `${Number(profile.trainerRatingAvg).toFixed(1)} / 5.0`
              : 'N/A'
          }
          subtitle="Aggregate Trainee Satisfaction Score"
          icon={Sparkles}
        />
      </div>

      {/* ── Pending Review Banner ── */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 text-sm font-medium">
          <Clock className="w-5 h-5 shrink-0 animate-pulse" />
          <span>
             {t("you_have")} {' '}
            <strong>{pendingCount}</strong>{' '}
            {pendingCount === 1 ? 'course' : 'courses'}  {t("awaiting_administrative_review")} </span>
        </div>
      )}

      {/* ── Courses List ── */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground"> {t("authored_course_modules")} </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            <SkeletonCard count={3} />
          </div>
        ) : courses.length > 0 ? (
          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-card border border-border shadow-sm rounded-lg p-5 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Course Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <StatusBadge status={course.status} />
                    <span className="text-xs text-muted-foreground">{course.category?.name}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                      {course.difficulty}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-foreground truncate">{course.title}</h4>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      <span className="font-semibold text-muted-foreground">
                        {course._count?.modules ?? 0}
                      </span>{' '}
                      {(course._count?.modules ?? 0) === 1 ? 'Module' : 'Modules'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      <span className="font-semibold text-emerald-700">
                        {course._count?.enrollments ?? 0}
                      </span>{' '}
                       {t("enrolled")} </span>
                    <span className="text-xs text-muted-foreground">
                      {course.durationMinutes}  {t("min")} </span>
                  </div>
                </div>

                {/* Contextual Actions */}
                <div className="shrink-0">
                  <CourseActions
                    course={course}
                    onAddModule={handleOpenAddModule}
                    onSubmit={handleSubmitForReview}
                    onArchive={handleArchive}
                    onUnarchive={handleUnarchive}
                    onEdit={handleEditCourse}
                    onDelete={handleDeleteCourse}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border shadow-sm p-8 rounded-lg text-center text-muted-foreground text-sm">
             {t("you_haven_t_authored_any_cours")} {' '}
            <Link href="/trainer/courses/new" className="text-primary hover:underline font-semibold">
               {t("build_your_first_course")} </Link>
            .
          </div>
        )}
      </div>

      {/* ── Add Module Modal ── */}
      {addModuleCourse && (
        <AddModuleModal
          courseId={addModuleCourse.id}
          courseTitle={addModuleCourse.title}
          isOpen={!!addModuleCourse}
          onClose={() => setAddModuleCourse(null)}
          onSuccess={fetchData}
        />
      )}

      {/* ── Edit Course Modal ── */}
      {editCourse && (
        <EditCourseModal
          course={editCourse}
          isOpen={!!editCourse}
          onClose={() => setEditCourse(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}


