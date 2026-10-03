'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { FileText, PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from "react-i18next";

export default function AssessmentAuthoringPage() {
    const { t } = useTranslation();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [courseId, setCourseId] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('post_test');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [passScorePct, setPassScorePct] = useState(70);

  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('single_mcq');
  const [difficulty, setDifficulty] = useState('beginner');
  const [points, setPoints] = useState(1);

  const [options, setOptions] = useState([
    { optionText: '', isCorrect: true },
    { optionText: '', isCorrect: false },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // BUG-10: Must only show trainer's own courses, not all published courses
    api.get('/courses?mine=true&limit=50').then((res) => {
      const list = res?.data || res || [];
      setCourses(list);
      if (list.length > 0) setCourseId(list[0].id);
    }).catch(() => {});
  }, []);

  const handleAddOption = () => {
    setOptions([...options, { optionText: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleOptionChange = (index: number, text: string) => {
    const updated = [...options];
    updated[index].optionText = text;
    setOptions(updated);
  };

  const handleCorrectToggle = (index: number) => {
    const updated = options.map((opt, idx) => ({
      ...opt,
      isCorrect: questionType === 'single_mcq' || questionType === 'true_false' ? idx === index : idx === index ? !opt.isCorrect : opt.isCorrect,
    }));
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Create Assessment
      const assessment = await api.post('/assessments', {
        courseId: courseId || undefined,
        subject,
        type,
        timeLimitMinutes: Number(timeLimitMinutes),
        passScorePct: Number(passScorePct),
      });

      // 2. Add Initial Question
      await api.post(`/assessments/${assessment.id}/questions`, {
        questionType,
        questionText,
        difficulty,
        points: Number(points),
        options,
      });

      toast.success('Assessment and Question Bank created successfully!');
      router.push('/trainer');
    } catch (err: any) {
      toast.error(err.message || 'Failed to author assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <Link
        href="/trainer"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />  {t("back_to_trainer_studio")} </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
           {t("mcq_question_bank_authoring")} </h1>
        <p className="text-sm text-muted-foreground mt-1">
           {t("create_server_graded_pre_post_")} </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border shadow-sm rounded-md p-8 border border-border space-y-6">
        <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
           {t("1__assessment_metadata")} </h3>

        {courses.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
               {t("linked_course__optional_")} </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value=""> {t("___no_specific_course___")} </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
               {t("subject_title")} </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("e_g__microservices_architectur")}
              className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
               {t("assessment_type")} </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="pre_test"> {t("pre_test__baseline_")} </option>
              <option value="post_test"> {t("post_test__evaluation_")} </option>
              <option value="module_quiz"> {t("module_quiz")} </option>
              <option value="final"> {t("final_exam")} </option>
            </select>
          </div>
        </div>

        <h3 className="text-base font-bold text-foreground border-b border-border pb-3 pt-4">
           {t("2__question_bank_entry")} </h3>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
             {t("question_prompt")} </label>
          <input
            type="text"
            required
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={t("e_g__which_protocol_is_used_fo")}
            className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Options Builder */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
             {t("options__toggle_checkbox_for_c")} </label>

          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={opt.isCorrect}
                onChange={() => handleCorrectToggle(idx)}
                className="w-5 h-5 rounded accent-blue-600 bg-background border-border cursor-pointer"
                title={t("mark_as_correct_answer")}
              />
              <input
                type="text"
                required
                value={opt.optionText}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1} text...`}
                className="flex-1 px-4 py-2 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  className="p-2 text-muted-foreground hover:text-rose-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddOption}
            className="text-xs font-semibold text-primary hover:text-blue-300 pt-1 block"
          >
             {t("__add_option_choice")} </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-6"
        >
          <FileText className="w-5 h-5" />
          {isSubmitting ? 'Saving Assessment...' : 'Save Assessment & Publish Question'}
        </button>
      </form>
    </div>
  );
}

