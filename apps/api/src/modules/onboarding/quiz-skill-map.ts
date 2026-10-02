export interface QuizSkillMapping {
  questionId: string;
  type: 'rating' | 'mcq' | 'multi_select';
  skillNames?: string[];        // for rating: map rating value directly as level to these skills
  optionSkillMap?: Record<string, string>; // for multi_select: selectedOption -> skillName
  mcqLevelMap?: Record<string, number>;   // for mcq: answer text -> numeric level
  fixedLevel?: number;          // fallback level for unmatched mcq answers
}

export const ONBOARDING_QUIZ_SKILL_MAP: QuizSkillMapping[] = [
  // tq1 (primary responsibilities) MCQ -> Communication or Technical Skills at level 2
  {
    questionId: 'tq1',
    type: 'mcq',
    skillNames: ['Communication'],
    mcqLevelMap: {
      'Administrative': 2,
      'Technical': 2,
      'Management': 3,
      'Operations': 2,
      'Field Work': 2,
    },
    fixedLevel: 2,
  },
  // tq2 (confidence, rating 1-5) -> Technical Skills
  {
    questionId: 'tq2',
    type: 'rating',
    skillNames: ['Technical Skills'],
  },
  // tq3 (skills to improve, multi_select) -> direct skill name mapping
  {
    questionId: 'tq3',
    type: 'multi_select',
    optionSkillMap: {
      'Communication': 'Communication',
      'Leadership': 'Leadership',
      'Technical Skills': 'Technical Skills',
      'Time Management': 'Time Management',
      'Problem Solving': 'Problem Solving',
    },
  },
  // tq4 (approach to new task, MCQ) -> Problem Solving at level derived from answer
  {
    questionId: 'tq4',
    type: 'mcq',
    skillNames: ['Problem Solving'],
    mcqLevelMap: {
      'Ask for help immediately': 1,
      'Try to figure it out on my own': 3,
      'Look for documentation or examples': 3,
      'Break it down into smaller steps': 4,
    },
    fixedLevel: 2,
  },
  // tq5 (communication comfort, rating 1-5) -> Communication
  {
    questionId: 'tq5',
    type: 'rating',
    skillNames: ['Communication'],
  },
  // tq6 (time management, rating 1-5) -> Time Management
  {
    questionId: 'tq6',
    type: 'rating',
    skillNames: ['Time Management'],
  },
  // tq7 (diversity comfort, rating 1-5) -> Leadership
  {
    questionId: 'tq7',
    type: 'rating',
    skillNames: ['Leadership'],
  },
  // tq8, tq9, tq10 — not mapped (behavioral/meta/free text)
];
