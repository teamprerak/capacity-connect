'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/StatCard';
import { CourseCard } from '@/components/CourseCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { api } from '@/lib/api-client';
import { BookOpen, Award, TrendingUp, Users, ArrowRight, BrainCircuit, Sparkles } from 'lucide-react';

export default function TraineeDashboard() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/enrollments/me').catch(() => []),
      api.get('/courses?limit=3').catch(() => ({ data: [] })),
      api.get('/analytics/trainee-dashboard').catch(() => null),
    ]).then(([enrData, courseData, statData]) => {
      setEnrollments(enrData || []);
      setCourses(courseData.data || []);
      setStats(statData);
      setIsLoading(false);
    });
  }, []);

  const completedCount = enrollments.filter((e) => e.status === 'completed').length;
  const currentLvl = stats?.competencyStats?.avgCurrentLevel?.toFixed(1) || '0.0';
  const reqLvl = stats?.competencyStats?.avgRequiredLevel?.toFixed(1) || '0.0';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
          Trainee Learning Workspace
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your skill gaps, active course progress, and certified accomplishments.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Active Enrollments"
          value={enrollments.length}
          subtitle="Courses in progress"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Earned Certificates"
          value={completedCount}
          subtitle="Verifiable credentials"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Competency Level"
          value={`Level ${currentLvl}`}
          subtitle="Average proficiency"
          icon={TrendingUp}
          color="purple"
          trend={`Target Level ${reqLvl}`}
        />
      </div>

      {/* Skill Gap / Target Assessment Banner — neutral surface, no gradient */}
      <div className="surface-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <BrainCircuit className="w-3.5 h-3.5" /> Skill Gap Target
          </div>
          <h3 className="text-lg font-semibold text-foreground">Target Assessment</h3>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Your current baseline is Level {currentLvl}. Completing recommended courses will bridge your overall gap to Level {reqLvl}.
          </p>
        </div>
        <Link
          href="/trainee/courses"
          className="btn-primary text-xs px-5 py-2.5 shrink-0 flex items-center gap-2"
        >
          View Recommendations <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Active Enrollments Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">My Active Courses</h2>
          <Link href="/trainee/courses" className="text-xs font-semibold text-primary hover:text-blue-300">
            View All Catalog →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SkeletonCard count={2} />
          </div>
        ) : enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {enrollments.map((enr) => (
              <CourseCard
                key={enr.id}
                id={enr.course.id}
                title={enr.course.title}
                category={enr.course.category?.name || 'Technology'}
                difficulty={enr.course.difficulty || 'beginner'}
                durationMinutes={enr.course.durationMinutes || 120}
                enrolled={true}
                status={enr.status}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border shadow-sm p-8 rounded-lg text-center text-muted-foreground text-sm">
            You are not enrolled in any courses yet.{' '}
            <Link href="/trainee/courses" className="text-primary underline font-semibold">
              Browse Course Catalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
