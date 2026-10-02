const fs = require('fs');
const file = 'apps/api/src/modules/onboarding/onboarding.service.ts';
let content = fs.readFileSync(file, 'utf8');

const newMethod = \  getOnboardingQuestions(role: 'trainee' | 'trainer'): any[] {
    if (role === 'trainee') {
      return [
        { id: 'tq1', question: 'What are your primary responsibilities or the type of work you currently perform?', type: 'multiple_choice_other', options: ['Administrative', 'Technical', 'Management', 'Operations', 'Field Work'] },
        { id: 'tq2', question: 'How confident are you in performing the core tasks required for your current role independently?', type: 'rating_1_5' },
        { id: 'tq3', question: 'Which professional skills do you feel you need to improve the most?', type: 'multi_select', options: ['Communication', 'Leadership', 'Technical Skills', 'Time Management', 'Problem Solving'] },
        { id: 'tq4', question: 'When you are given a new or unfamiliar task, what do you usually do first?', type: 'scenario_mcq', options: ['Ask for help immediately', 'Try to figure it out on my own', 'Look for documentation or examples', 'Break it down into smaller steps'] },
        { id: 'tq5', question: 'How comfortable are you with communicating your ideas, questions, or concerns to colleagues or supervisors?', type: 'rating_1_5' },
        { id: 'tq6', question: 'How effectively do you manage your time when you have multiple tasks or deadlines?', type: 'rating_1_5' },
        { id: 'tq7', question: 'How comfortable are you working with people who have different opinions, backgrounds, or working styles?', type: 'rating_1_5' },
        { id: 'tq8', question: 'When you make a mistake at work, what do you typically do?', type: 'scenario_mcq', options: ['Admit it immediately and seek help', 'Try to fix it before anyone notices', 'Blame external factors', 'Ignore it if it is minor'] },
        { id: 'tq9', question: 'How do you prefer to learn a new skill?', type: 'multi_select', options: ['Reading documentation', 'Watching video tutorials', 'Hands-on practice', 'Attending live classes', '1-on-1 mentorship'] },
        { id: 'tq10', question: 'What professional goal would you most like to achieve through Capacity Connect?', type: 'short_answer_optional', options: ['Get promoted', 'Learn a specific tool', 'Improve general efficiency', 'Transition to a new role'] },
      ];
    } else {
      return [
        { id: 'tr1', question: 'What type of learners or professional roles do you have experience training?', type: 'multi_select_other', options: ['Entry-level staff', 'Mid-level professionals', 'Senior management', 'Technical specialists', 'General audience'] },
        { id: 'tr2', question: 'How would you assess a trainee\\'s current competency before starting a training program?', type: 'scenario_mcq_short', options: ['Pre-assessment quiz', 'One-on-one interview', 'Reviewing past work', 'Self-assessment survey'] },
        { id: 'tr3', question: 'How confident are you in explaining complex concepts to people with different levels of knowledge?', type: 'rating_1_5' },
        { id: 'tr4', question: 'How do you identify the specific skills a trainee is struggling with?', type: 'mcq_short', options: ['Observation during tasks', 'Reviewing quiz scores', 'Direct feedback from trainee', 'Peer reviews'] },
        { id: 'tr5', question: 'A trainee understands a concept theoretically but struggles to apply it in practice. What would you do?', type: 'scenario_mcq', options: ['Provide more theory', 'Demonstrate the practical application', 'Give a guided hands-on exercise', 'Pair them with an experienced peer'] },
        { id: 'tr6', question: 'How do you normally adapt your teaching approach when a trainee is not progressing as expected?', type: 'mcq_short', options: ['Slow down the pace', 'Use different analogies or visuals', 'Provide extra one-on-one time', 'Simplify the material'] },
        { id: 'tr7', question: 'How do you provide feedback when a trainee makes repeated mistakes?', type: 'scenario_mcq', options: ['Point it out immediately', 'Wait until the end of the session', 'Ask them to self-reflect', 'Provide written feedback'] },
        { id: 'tr8', question: 'How do you determine whether a trainee has actually developed a skill after training?', type: 'multi_select_short', options: ['Final exam', 'Practical demonstration', 'On-the-job observation', 'Feedback from their manager'] },
        { id: 'tr9', question: 'Which training methods are you most comfortable using?', type: 'multi_select', options: ['Lectures', 'Interactive workshops', 'E-learning modules', 'Role-playing', 'Case studies'] },
        { id: 'tr10', question: 'What outcomes do you believe a successful training program should achieve for a trainee?', type: 'short_answer' },
      ];
    }
  }\;

content = content.replace(/getOnboardingQuestions\\(role: 'trainee' \\| 'trainer'\\): any\\[\\] \\{[\\s\\S]*?\\n  \\}/, newMethod);
fs.writeFileSync(file, content);
