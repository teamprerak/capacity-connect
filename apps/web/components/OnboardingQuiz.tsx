"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";

interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[];
}

interface OnboardingQuizProps {
  questions: Question[];
  onSubmit: (answers: Record<string, any>) => void;
  isSubmitting: boolean;
}

export default function OnboardingQuiz({
  questions,
  onSubmit,
  isSubmitting,
}: OnboardingQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  if (!questions || questions.length === 0) {
    return null;
  }

  const question = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isLastStep = currentStep === questions.length - 1;

  const currentAnswer = answers[question.id];
  const hasAnswer =
    currentAnswer !== undefined &&
    currentAnswer !== null &&
    String(currentAnswer).trim() !== "";

  const handleNext = () => {
    if (hasAnswer && !isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else if (hasAnswer && isLastStep) {
      onSubmit(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleAnswerChange = (val: any) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: val,
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col items-center justify-center font-sans">
      <div className="w-full absolute top-0 left-0">
        <div className="h-2 bg-slate-200 w-full">
          <div
            className="h-2 bg-blue-600 transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl px-6 py-8 bg-white shadow-xl rounded-2xl mx-4">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500 mb-2">
            Question {currentStep + 1} of {questions.length}
          </p>
          <h2 className="text-2xl font-semibold text-slate-800">
            {question.question}
          </h2>
        </div>

        <div className="min-h-[150px] mb-8">
          {question.type === "rating_1_5" ? (
            <div className="flex justify-center gap-4 mt-6">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleAnswerChange(rating)}
                  className={`w-14 h-14 rounded-full text-lg font-semibold transition-all ${
                    currentAnswer === rating
                      ? "bg-blue-600 text-white shadow-lg scale-110"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={currentAnswer || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full min-h-[120px] p-4 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
              autoFocus
            />
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentStep === 0 || isSubmitting
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!hasAnswer || isSubmitting}
            className={`flex items-center px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              !hasAnswer || isSubmitting
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : isLastStep ? (
              <>
                Submit
                <Check className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
