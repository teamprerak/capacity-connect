'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, RotateCcw, Trash2 } from 'lucide-react';
import { RejectCourseModal } from '@/components/RejectCourseModal';

export default function AdminCourseModerationPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [rejectModalState, setRejectModalState] = useState<{ isOpen: boolean; courseId: string; courseTitle: string }>({
    isOpen: false,
    courseId: '',
    courseTitle: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setIsLoading(true);
    api
      .get('/courses?status=all')
      .then((res) => setCourses(res.data || []))
      .catch(() => setCourses([]))
      .finally(() => setIsLoading(false));
  };

  const handleApprove = async (courseId: string) => {
    try {
      await api.post(`/courses/${courseId}/approve`);
      toast.success('Course approved and published!');
      fetchCourses();
    } catch (err: any) {
      toast.error(err.message || 'Approval failed');
    }
  };

  const handleRejectClick = (courseId: string, courseTitle: string) => {
    setRejectModalState({ isOpen: true, courseId, courseTitle });
  };

  const handleRollbackClick = (courseId: string, courseTitle: string) => {
    setRejectModalState({ isOpen: true, courseId, courseTitle });
  };

  const handleDelete = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await api.delete(`/courses/${courseId}`);
        toast.success('Course deleted successfully');
        fetchCourses();
      } catch (err: any) {
        toast.error(err.message || 'Deletion failed');
      }
    }
  };

  const columns = [
    {
      header: 'Course Title',
      accessor: (course: any) => (
        <div>
          <span className="font-bold text-foreground block">{course.title}</span>
          <span className="text-[10px] text-muted-foreground font-mono">Slug: {course.slug}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (course: any) => (
        <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-card text-muted-foreground border border-border">
          {course.status}
        </span>
      ),
    },
    {
      header: 'Category & Level',
      accessor: (course: any) => (
        <div className="space-x-2">
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {course.category?.name || 'Category'}
          </span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {course.difficulty}
          </span>
        </div>
      ),
    },
    {
      header: 'Author Trainer',
      accessor: (course: any) => (
        <span className="text-xs text-muted-foreground font-medium">{course.trainer?.user?.email}</span>
      ),
    },
    {
      header: 'Moderation Actions',
      accessor: (course: any) => (
        <div className="flex items-center gap-2">
          {course.status === 'pending_approval' && (
            <>
              <button
                onClick={() => handleApprove(course.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                onClick={() => handleRejectClick(course.id, course.title)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-all flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}

          {course.status === 'published' && (
            <button
              onClick={() => handleRollbackClick(course.id, course.title)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Rollback
            </button>
          )}

          <button
            onClick={() => handleDelete(course.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
            title="Delete Course"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Course Moderation Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review courses submitted by trainers before publishing them to the enterprise catalog. Manage existing courses.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={courses}
        isLoading={isLoading}
        emptyMessage="No courses found."
      />

      <RejectCourseModal
        courseId={rejectModalState.courseId}
        courseTitle={rejectModalState.courseTitle}
        isOpen={rejectModalState.isOpen}
        onClose={() => setRejectModalState(prev => ({ ...prev, isOpen: false }))}
        onSuccess={fetchCourses}
      />
    </div>
  );
}
