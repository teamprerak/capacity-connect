'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Users, Star, AlertCircle, FileQuestion, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

interface SkillGroup {
  category: string;
  skills: Skill[];
}

interface TrainerMatch {
  trainerId: string;
  trainerName?: string;
  trainerEmail?: string;
  score: number;
  reasons: string[];
}

export default function MatchWizardPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(new Set());
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matches, setMatches] = useState<TrainerMatch[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Assessment State
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [assessmentAttemptId, setAssessmentAttemptId] = useState<string | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);
  const [isAssessmentSubmitting, setIsAssessmentSubmitting] = useState(false);

  useEffect(() => {
    setIsLoadingSkills(true);
    api
      .get('/trainee/wizard/skills')
      .then((res) => setSkillGroups(res?.data || res || []))
      .catch(() => setSkillGroups([]))
      .finally(() => setIsLoadingSkills(false));
  }, []);

  function toggleSkill(skillId: string) {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.post('/trainee/wizard/match-trainer', {
        domainSkillIds: Array.from(selectedSkillIds),
      });
      const data = res?.data || res;
      setMatches(data?.matches || []);
      setStep(2);
    } catch (err: any) {
      setSubmitError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStartAssessment() {
    setIsAssessmentLoading(true);
    try {
      // 1. Fetch recommended assessment
      const res = await api.get('/trainee/wizard/recommended-assessment');
      const assessment = res?.data || res;
      if (!assessment) {
        toast.error('No assessments currently available.');
        return;
      }

      // 2. Start attempt
      const attemptRes = await api.post(`/assessments/${assessment.id}/start`);
      const attemptData = attemptRes?.data || attemptRes;
      
      setActiveAssessment(assessment);
      setAssessmentAttemptId(attemptData.id);
      setAssessmentAnswers({});
    } catch (error: any) {
      toast.error(error?.message || 'Failed to start assessment.');
    } finally {
      setIsAssessmentLoading(false);
    }
  }

  async function handleSubmitAssessment() {
    if (!activeAssessment || !assessmentAttemptId) return;
    setIsAssessmentSubmitting(true);
    try {
      // Convert answers format
      const formattedAnswers = Object.entries(assessmentAnswers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId
      }));

      const res = await api.post(`/assessments/${activeAssessment.id}/attempts/${assessmentAttemptId}/submit`, {
        answers: formattedAnswers
      });
      const data = res?.data || res;

      // Update matches with new result
      if (data.matches) {
        setMatches(data.matches);
      } else {
        // Fallback: re-fetch matches
        const matchesRes = await api.get('/trainee/wizard/my-matches');
        const matchesData = matchesRes?.data || matchesRes;
        setMatches(matchesData);
      }

      toast.success('Matches updated based on your verified skills!');
      setActiveAssessment(null);
      setAssessmentAttemptId(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit assessment.');
    } finally {
      setIsAssessmentSubmitting(false);
    }
  }

  const scorePercent = (score: number) => Math.round(score * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Match Your Trainer
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Select the skill domains you want to develop. We'll find the best-matched trainers for you.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 text-sm font-semibold ${step === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</span>
          Select Skills
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <div className={`flex items-center gap-1.5 text-sm font-semibold ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</span>
          Your Matches
        </div>
      </div>

      {/* Step 1: Skill Selection */}
      {step === 1 && (
        <div className="space-y-6">
          {isLoadingSkills ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg h-24 animate-pulse" />
              ))}
            </div>
          ) : skillGroups.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
              No skills available yet.
            </div>
          ) : (
            <div className="space-y-8">
              {skillGroups.map((group) => (
                <div key={group.category}>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                    {group.category}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.skills.map((skill) => {
                      const isSelected = selectedSkillIds.has(skill.id);
                      return (
                        <button
                          key={skill.id}
                          onClick={() => toggleSkill(skill.id)}
                          className={`text-left p-4 rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-foreground'
                              : 'bg-card border-border text-foreground hover:border-primary/40 hover:bg-accent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold leading-snug">{skill.name}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            )}
                          </div>
                          {skill.description && (
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                              {skill.description}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {submitError && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">
              {selectedSkillIds.size} skill{selectedSkillIds.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleSubmit}
              disabled={selectedSkillIds.size === 0 || isSubmitting}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Finding matches…
                </>
              ) : (
                <>
                  Find My Trainer
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Trainer Matches */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                {matches.length > 0 ? `${matches.length} Trainer Match${matches.length !== 1 ? 'es' : ''} Found` : 'No Matches Found'}
              </h2>
            </div>
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Adjust Skills
            </button>
          </div>

          {/* Assessment Banner */}
          {matches.length > 0 && !activeAssessment && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full shrink-0">
                  <FileQuestion className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Want better matches?</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Take a quick assessment to prove your skills and reorder your trainers.</p>
                </div>
              </div>
              <button
                onClick={handleStartAssessment}
                disabled={isAssessmentLoading}
                className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                {isAssessmentLoading ? 'Loading...' : 'Take Skills Assessment'}
              </button>
            </div>
          )}

          {/* Assessment Modal/UI */}
          {activeAssessment && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{activeAssessment.title || 'Skills Assessment'}</h3>
                  <p className="text-sm text-muted-foreground">{activeAssessment.description || 'Answer the questions below to verify your skills.'}</p>
                </div>
                <button
                  onClick={() => setActiveAssessment(null)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-8">
                {activeAssessment.questions?.map((q: any, idx: number) => (
                  <div key={q.id} className="space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                      {q.text}
                    </p>
                    <div className="space-y-2">
                      {q.options?.map((opt: any) => (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                            assessmentAnswers[q.id] === opt.id
                              ? 'bg-primary/10 border-primary text-foreground'
                              : 'bg-card border-border hover:border-primary/30'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={opt.id}
                            checked={assessmentAnswers[q.id] === opt.id}
                            onChange={() => setAssessmentAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            assessmentAnswers[q.id] === opt.id ? 'border-primary' : 'border-muted-foreground'
                          }`}>
                            {assessmentAnswers[q.id] === opt.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                          <span className="text-sm">{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  onClick={handleSubmitAssessment}
                  disabled={isAssessmentSubmitting || Object.keys(assessmentAnswers).length !== activeAssessment.questions?.length}
                  className="btn-primary flex items-center gap-2"
                >
                  {isAssessmentSubmitting ? 'Submitting...' : 'Submit Assessment'}
                  {!isAssessmentSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {matches.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground text-sm">
                No trainers matched your selected skills yet. Try selecting different or more skill areas.
              </p>
              <button onClick={() => setStep(1)} className="btn-primary mt-2">
                Go Back & Adjust
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {matches.map((match, idx) => {
                  const pct = scorePercent(match.score);
                  const displayName = match.trainerName || match.trainerEmail || `Trainer ${idx + 1}`;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                      key={match.trainerId}
                      className="bg-card border border-border rounded-lg p-5 space-y-4 hover:border-primary/30 transition-colors"
                    >
                      {/* Trainer header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{displayName}</p>
                            {match.trainerEmail && match.trainerName && (
                              <p className="text-xs text-muted-foreground">{match.trainerEmail}</p>
                            )}
                          </div>
                        </div>
                        {/* Score badge */}
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-primary font-bold text-lg">
                            <Star className="w-4 h-4 fill-primary" />
                            {pct}%
                          </div>
                          <p className="text-xs text-muted-foreground">match score</p>
                        </div>
                      </div>

                      {/* Score bar */}
                      <div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          />
                        </div>
                      </div>

                      {/* Reasons */}
                      {match.reasons && match.reasons.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Why this match</p>
                          <ul className="space-y-1">
                            {match.reasons.map((reason, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-1.5 text-xs text-foreground">
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
