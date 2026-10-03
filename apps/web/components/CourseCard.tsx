'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, BookOpen, CheckCircle } from 'lucide-react';

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
  // All difficulty badges use one neutral base — label is the only differentiator
  const difficultyLabel: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  return (
    <div className="surface-card p-5 flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-150">
      <div>
        {/* Category + difficulty row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/8 px-2 py-0.5 rounded border border-primary/15">
            {category}
          </span>
          {/* Neutral difficulty badge — no colored glow */}
          <span className="badge-neutral text-[11px] uppercase tracking-wide">
            {difficultyLabel[difficulty] ?? difficulty}
          </span>
        </div>

        <h4 className="text-sm font-semibold text-foreground mb-2 leading-snug line-clamp-2">{title}</h4>
      </div>

      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{Math.floor(durationMinutes / 60)}h {durationMinutes % 60 > 0 ? `${durationMinutes % 60}m` : ''}</span>
        </div>

        {/* Solid primary for all CTAs — no gradient */}
        <Link
          href={enrolled ? `/trainee/courses/${id}/learn` : `/trainee/courses/${id}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150 ${
            enrolled
              ? 'bg-accent text-foreground border border-border hover:bg-border'
              : 'btn-primary'
          }`}
        >
          {enrolled ? (
            <><CheckCircle className="w-3.5 h-3.5" /> Continue</>
          ) : (
            <><BookOpen className="w-3.5 h-3.5" /> View Syllabus</>
          )}
        </Link>
      </div>
    </div>
  );
}
