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
    <div className="space-y-8 animate-in fade-in duration-300">
      <Link
        href="/trainee/courses"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="bg-card border border-border shadow-sm rounded-md p-8 border border-border space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
            {course.category?.name || 'Technology'}
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider border border-purple-500/20">
            {course.difficulty}
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">
          {course.title}
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{course.description}</p>

        <div className="flex flex-wrap gap-6 pt-4 border-t border-border text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Duration: {Math.round(course.durationMinutes / 60)} Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" />
            <span>Trainer: {course.trainer?.user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Modules: {course.modules?.length || 0} Modules</span>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="px-8 py-3.5 rounded-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-foreground shadow-xl shadow-blue-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 text-sm"
          >
            <BookOpen className="w-4 h-4" />
            {isEnrolling ? 'Enrolling...' : 'Enroll in Course Now'}
          </button>
        </div>
      </div>

      {/* Modules Syllabus */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Course Syllabus & Curriculum</h2>
        <div className="space-y-3">
          {course.modules?.map((mod: any, idx: number) => (
            <div
              key={mod.id}
              className="bg-card border border-border shadow-sm rounded-lg p-5 border border-border flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-md bg-card text-primary font-bold text-xs flex items-center justify-center border border-border">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{mod.title}</h4>
                  <span className="text-xs text-muted-foreground">{mod.resources?.length || 0} Learning Resources</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Module {mod.sequenceOrder}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
