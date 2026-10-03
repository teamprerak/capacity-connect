'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import OnboardingQuiz from './OnboardingQuiz';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      if (!user) {
        setNeedsOnboarding(null);
        return;
      }
      // Admins don't need onboarding
      if (user.roles.includes('admin')) {
        setNeedsOnboarding(false);
        return;
      }

      try {
        if (sessionStorage.getItem('skip_onboarding_session') === 'true') {
          setNeedsOnboarding(false);
          return;
        }

        const { onboardingCompleted } = await api.get('/onboarding/status');
        
        if (!onboardingCompleted) {
          // Fetch questions
          const role = user.roles.includes('trainer') ? 'trainer' : 'trainee';
          const fetchedQuestions = await api.get(`/onboarding/questions/${role}`);
          setQuestions(fetchedQuestions);
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(false);
        }
      } catch (error) {
        console.error('Failed to check onboarding status', error);
        setNeedsOnboarding(false); // fallback to hide modal
      }
    }

    checkStatus();
  }, [user]);

  const handleSkip = () => {
    sessionStorage.setItem('skip_onboarding_session', 'true');
    setNeedsOnboarding(false);
  };

  const handleSubmit = async (answers: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      await api.post('/onboarding/submit', { answers });
      setNeedsOnboarding(false);
    } catch (error) {
      console.error('Failed to submit onboarding', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {children}
      {needsOnboarding === true && questions.length > 0 && (
        <OnboardingQuiz
          questions={questions}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onSkip={handleSkip}
        />
      )}
    </>
  );
}
