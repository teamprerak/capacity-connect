'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, BarChart, BookOpen, CheckCircle } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  durationMinutes: number;
  enrolled?: boolean;
  status?: string;
}

export function CourseCard({
  id,
  title,
  category,
  difficulty,
  durationMinutes,
  enrolled,
  status,
}: CourseCardProps) {
  const difficultyColors = {
    beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    intermediate: 'bg-primary/10 text-primary border-primary/20',
    advanced: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className="bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200 rounded-lg p-6 border border-border flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            {category}
          </span>
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              difficultyColors[difficulty as keyof typeof difficultyColors] || 'bg-card text-muted-foreground'
            }`}
          >
            {difficulty}
          </span>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2 leading-snug line-clamp-2">{title}</h4>
      </div>

      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{Math.round(durationMinutes / 60)} hrs</span>
        </div>

        <Link
          href={enrolled ? `/trainee/courses/${id}/learn` : `/trainee/courses/${id}`}
          className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
            enrolled
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-foreground shadow-sm shadow-blue-500/20 hover:opacity-90'
          }`}
        >
          {enrolled ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" /> Continue
            </>
          ) : (
            <>
              <BookOpen className="w-3.5 h-3.5" /> View Syllabus
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
