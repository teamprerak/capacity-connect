'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Clock, BarChart, User, CheckCircle, BookOpen, Layers, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [course, setCourse] = useState<any>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api
        .get(`/courses/${id}`)
        .then((res) => setCourse(res))
        .catch(() => toast.error('Failed to load course details'))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      await api.post('/enrollments', { courseId: id });
      toast.success('Successfully enrolled in course!');
      router.push(`/trainee/courses/${id}/learn`);
    } catch (err: any) {
      // BUG-08: ApiError has .data not .response?.data (that's an Axios convention, not fetch)
      toast.error(err.data?.message || err.message || 'Enrollment failed');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border shadow-sm p-12 rounded-md text-center text-muted-foreground">
        Loading syllabus details...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-card border border-border shadow-sm p-12 rounded-md text-center text-muted-foreground">
        Course not found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/trainee/courses"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
      </Link>

      {/* Course header card */}
      <div className="surface-card p-7 space-y-5">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/8 px-2.5 py-1 rounded border border-primary/15">
            {course.category?.name || 'Technology'}
          </span>
          {/* Difficulty — neutral badge, no purple glow */}
          <span className="badge-neutral text-[11px] uppercase tracking-wide">
            {course.difficulty}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-tight">
          {course.title}
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{course.description}</p>

        {/* Meta row */}
        <div className="flex flex-wrap gap-5 pt-4 border-t border-border text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Duration: {Math.round(course.durationMinutes / 60)} hrs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>Trainer: {course.trainer?.user?.email}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Modules: {course.modules?.length || 0}</span>
          </div>
        </div>

        {/* Enroll — solid primary, no gradient */}
        <div className="pt-2">
          <button
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60"
          >
            <BookOpen className="w-4 h-4" />
            {isEnrolling ? 'Enrolling…' : 'Enroll in Course Now'}
          </button>
        </div>
      </div>

      {/* Syllabus */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Course Syllabus &amp; Curriculum</h2>
        {course.modules?.length > 0 ? (
          <div className="space-y-2">
            {course.modules.map((mod: any, idx: number) => (
              <div
                key={mod.id}
                className="surface-card px-5 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded bg-accent text-primary font-semibold text-xs flex items-center justify-center border border-border shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{mod.title}</h4>
                    <span className="text-xs text-muted-foreground">{mod.resources?.length || 0} resources</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Module {mod.sequenceOrder}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-card px-5 py-8 text-center text-sm text-muted-foreground">
            Syllabus modules are not yet published for this course.
          </div>
        )}
      </div>
    </div>
  );
}
