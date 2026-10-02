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
  const [otherText, setOtherText] = useState<Record<string, string>>({});

  if (!questions || questions.length === 0) {
    return null;
  }

  const question = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isLastStep = currentStep === questions.length - 1;

  const currentAnswer = answers[question.id];
  const currentOtherText = otherText[question.id] || "";

  // Validation logic
  let hasAnswer = false;
  if (question.type === "rating_1_5") {
    hasAnswer = currentAnswer !== undefined;
  } else if (question.type.includes("multi_select")) {
    hasAnswer = Array.isArray(currentAnswer) && currentAnswer.length > 0;
    if (hasAnswer && currentAnswer.includes("Other")) {
      hasAnswer = currentOtherText.trim() !== "";
    }
  } else if (question.type.includes("mcq") || question.type.includes("multiple_choice")) {
    hasAnswer = currentAnswer !== undefined && currentAnswer !== "";
    if (hasAnswer && currentAnswer === "Other") {
      hasAnswer = currentOtherText.trim() !== "";
    }
  } else {
    // short_answer
    hasAnswer = currentAnswer !== undefined && currentAnswer.trim() !== "";
  }

  const handleNext = () => {
    if (hasAnswer && !isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else if (hasAnswer && isLastStep) {
      // Merge "Other" text into answers if needed
      const finalAnswers = { ...answers };
      for (const key in finalAnswers) {
        if (Array.isArray(finalAnswers[key]) && finalAnswers[key].includes("Other")) {
          finalAnswers[key] = finalAnswers[key].map((ans: string) => ans === "Other" ? `Other: ${otherText[key]}` : ans);
        } else if (finalAnswers[key] === "Other") {
          finalAnswers[key] = `Other: ${otherText[key]}`;
        }
      }
      onSubmit(finalAnswers);
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

  const handleMultiSelectChange = (option: string) => {
    const current = (answers[question.id] as string[]) || [];
    if (current.includes(option)) {
      handleAnswerChange(current.filter((item) => item !== option));
    } else {
      handleAnswerChange([...current, option]);
    }
  };

  const renderInput = () => {
    if (question.type === "rating_1_5") {
      return (
        <div className="flex justify-center gap-4 mt-6">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleAnswerChange(rating)}
              className={`w-14 h-14 rounded-full text-lg font-semibold transition-all ${
                currentAnswer === rating
                  ? "bg-primary text-primary-foreground shadow-lg scale-110"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      );
    }

    if (question.type.includes("multi_select")) {
      const options = question.options || [];
      const hasOtherOption = question.type.includes("other") || question.type.includes("short");
      const allOptions = hasOtherOption && !options.includes("Other") ? [...options, "Other"] : options;

      return (
        <div className="mt-6 space-y-3">
          {allOptions.map((option) => (
            <label
              key={option}
              className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                (currentAnswer || []).includes(option)
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              <input
                type="checkbox"
                className="w-5 h-5 text-primary rounded border-input focus:ring-primary accent-primary"
                checked={(currentAnswer || []).includes(option)}
                onChange={() => handleMultiSelectChange(option)}
              />
              <span className="ml-3 text-foreground">{option}</span>
            </label>
          ))}
          {(currentAnswer || []).includes("Other") && (
            <textarea
              value={currentOtherText}
              onChange={(e) => setOtherText({ ...otherText, [question.id]: e.target.value })}
              placeholder="Please specify..."
              className="w-full mt-3 p-3 text-foreground bg-background border border-input rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              rows={2}
            />
          )}
        </div>
      );
    }

    if (question.type.includes("mcq") || question.type.includes("multiple_choice")) {
      const options = question.options || [];
      const hasOtherOption = question.type.includes("other") || question.type.includes("short");
      const allOptions = hasOtherOption && !options.includes("Other") ? [...options, "Other"] : options;

      return (
        <div className="mt-6 space-y-3">
          {allOptions.map((option) => (
            <label
              key={option}
              className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                currentAnswer === option
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                className="w-5 h-5 text-primary border-input focus:ring-primary accent-primary"
                checked={currentAnswer === option}
                onChange={() => handleAnswerChange(option)}
              />
              <span className="ml-3 text-foreground">{option}</span>
            </label>
          ))}
          {currentAnswer === "Other" && (
            <textarea
              value={currentOtherText}
              onChange={(e) => setOtherText({ ...otherText, [question.id]: e.target.value })}
              placeholder="Please specify..."
              className="w-full mt-3 p-3 text-foreground bg-background border border-input rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              rows={2}
            />
          )}
        </div>
      );
    }

    // Default: Short Answer / Textarea
    return (
      <div className="mt-6">
        <textarea
          value={currentAnswer || ""}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full min-h-[120px] p-4 text-foreground bg-background border border-input rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all resize-y"
          autoFocus
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[100] flex flex-col items-center justify-center font-sans overflow-y-auto py-10">
      <div className="w-full absolute top-0 left-0">
        <div className="h-2 bg-muted w-full">
          <div
            className="h-2 bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl px-6 py-8 bg-card border border-border shadow-xl rounded-2xl mx-4 my-auto">
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Question {currentStep + 1} of {questions.length}
          </p>
          <h2 className="text-2xl font-semibold text-foreground">
            {question.question}
          </h2>
        </div>

        <div className="min-h-[150px] mb-8">
          {renderInput()}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentStep === 0 || isSubmitting
                ? "text-muted-foreground opacity-50 cursor-not-allowed"
                : "text-foreground hover:bg-accent"
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
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg"
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
