'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/StatCard';
import { CourseCard } from '@/components/CourseCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { api } from '@/lib/api-client';
import { BookOpen, Award, TrendingUp, Users, ArrowRight, BrainCircuit, Sparkles, Target } from 'lucide-react';

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
  const currentLvlNum = stats?.competencyStats?.avgCurrentLevel || 0;
  const reqLvlNum = stats?.competencyStats?.avgRequiredLevel || 0;
  const currentLvl = currentLvlNum.toFixed(1) || '0.0';
  const reqLvl = reqLvlNum.toFixed(1) || '0.0';

  const strengthPercent = reqLvlNum > 0 ? Math.min(100, Math.round((currentLvlNum / reqLvlNum) * 100)) : (currentLvlNum > 0 ? 100 : 0);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (strengthPercent / 100) * circumference;

  return (
    <div className="space-y-8">
      {/* Profile Strength Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-card border border-border p-6 rounded-xl shadow-sm">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Trainee Learning Workspace
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Monitor your skill gaps, active course progress, and certified accomplishments.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
            <Target className="w-4 h-4" />
            Learning Goal: Aiming for Level {reqLvl} Competency
          </div>
        </div>
        
        {/* Profile Strength Widget */}
        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg border border-border/50">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-muted-foreground/20"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="48"
                cy="48"
              />
              <circle
                className="text-primary transition-all duration-1000 ease-in-out"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="48"
                cy="48"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-foreground">{strengthPercent}%</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Profile Strength</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[120px]">
              Keep learning to reach your target competency level.
            </p>
          </div>
        </div>
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
