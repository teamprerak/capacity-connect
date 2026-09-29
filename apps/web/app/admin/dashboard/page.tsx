'use client';

import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/StatCard';
import { api } from '@/lib/api-client';
import {
  Users,
  BookOpen,
  Award,
  AlertTriangle,
  Flame,
  CheckCircle,
  BrainCircuit,
  FileText,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [criticalFeed, setCriticalFeed] = useState<any[]>([]);
  const [difficultQuizzes, setDifficultQuizzes] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/admin-dashboard').catch(() => null),
      api.get('/analytics/critical-gap-feed').catch(() => []),
      api.get('/analytics/difficult-assessments').catch(() => []),
      api.get('/analytics/heatmap').catch(() => []),
    ]).then(([ovData, feedData, quizData, htData]) => {
      setOverview(ovData);
      setCriticalFeed(feedData || []);
      setDifficultQuizzes(quizData || []);
      setHeatmapData(htData || []);
      setIsLoading(false);
    });
  }, []);

  // Compute unique skills for the heatmap header
  const allSkills = Array.from(
    new Set(heatmapData.flatMap((dept) => dept.skills.map((s: any) => s.skill)))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Executive Analytics & Intelligence Console
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time organization-wide competency heatmaps, critical gap feeds, and assessment difficulty detectors.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <StatCard
          title="Total Platform Users"
          value={(overview?.users?.trainees || 0) + (overview?.users?.trainers || 0)}
          subtitle="Registered accounts"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Published Courses"
          value={overview?.courses?.published || 0}
          subtitle="Capacity modules"
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Overall Pass Rate"
          value={`${Math.round(overview?.enrollments?.completionRate || 0)}%`}
          subtitle="Assessment efficacy"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Critical Gap Alerts"
          value={criticalFeed.length}
          subtitle="Urgent intervention needed"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Heatmap Section */}
      <div className="bg-card border border-border shadow-sm rounded-md p-6 sm:p-8 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-bold text-foreground">Department Competency Heatmap</h2>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">Department &times; Skill Matrix</span>
        </div>

        <div className="overflow-x-auto pt-2">
          {heatmapData.length > 0 ? (
            <table className="w-full text-left text-xs text-muted-foreground">
              <thead className="bg-background font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Department</th>
                  {allSkills.map((skill) => (
                    <th key={skill} className="px-4 py-3">{skill}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-semibold">
                {heatmapData.map((deptData) => (
                  <tr key={deptData.department}>
                    <td className="px-4 py-3 text-foreground font-bold">{deptData.department}</td>
                    {allSkills.map((skillName) => {
                      const skill = deptData.skills.find((s: any) => s.skill === skillName);
                      if (!skill) {
                        return <td key={skillName} className="px-4 py-3 text-muted-foreground">N/A</td>;
                      }
                      
                      const lvl = skill.avgCurrentLevel;
                      let colorClass = 'text-muted-foreground bg-slate-100';
                      let label = 'Unknown';
                      
                      if (lvl >= 4) {
                        colorClass = 'text-emerald-700 bg-emerald-100';
                        label = 'Advanced';
                      } else if (lvl >= 3) {
                        colorClass = 'text-primary bg-primary/10';
                        label = 'Intermediate';
                      } else if (lvl >= 2) {
                        colorClass = 'text-amber-700 bg-amber-100';
                        label = 'Beginner';
                      } else {
                        colorClass = 'text-rose-700 bg-rose-100';
                        label = 'Novice';
                      }

                      return (
                        <td key={skillName} className={`px-4 py-3 ${colorClass}`}>
                          Level {lvl.toFixed(1)} ({label})
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {isLoading ? 'Loading heatmap data...' : 'No competency data available yet.'}
            </div>
          )}
        </div>
      </div>

      {/* Critical Gap Intervention Feed & Difficult Quizzes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Gap Urgent Feed */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-error" />
              <h3 className="text-base font-semibold text-foreground">Critical Gap Urgent Feed</h3>
            </div>
            <span className="badge-error text-xs font-semibold px-2 py-0.5 rounded">
              ≥3 Level Gaps
            </span>
          </div>

          <div className="space-y-3">
            {criticalFeed.length > 0 ? (
              criticalFeed.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-background border border-border text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-foreground block">{item.trainee?.user?.email}</span>
                    <span className="text-muted-foreground">{item.traineeCompetency?.competency?.name}</span>
                  </div>
                  <span className="font-mono font-semibold text-error bg-error/10 px-2 py-1 rounded border border-error/20">
                    Gap: -{item.gapValue}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center py-4">
                No active critical gap interventions required.
              </div>
            )}
          </div>
        </div>

        {/* Difficult Assessment Detector */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-warning" />
              <h3 className="text-base font-semibold text-foreground">Low Pass-Rate Assessments</h3>
            </div>
            <span className="badge-warning text-xs font-semibold px-2 py-0.5 rounded">
              Pass Rate &lt; 50%
            </span>
          </div>

          <div className="space-y-3">
            {difficultQuizzes.length > 0 ? (
              difficultQuizzes.map((quiz, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-background border border-border text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-foreground block">{quiz.subject}</span>
                    <span className="text-muted-foreground">{quiz.course?.title}</span>
                  </div>
                  <span className="font-mono font-semibold text-warning bg-warning/10 px-2 py-1 rounded border border-warning/20">
                    {quiz.passRatePct}% Pass Rate
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center py-4">
                All active assessments meet standard pass rate thresholds.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
