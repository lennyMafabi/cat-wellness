import type { FollowUpQuestion, FollowUpRound, UserRole } from '@/types/accountSystem';

// ==================== ROUND 1: BASELINE ====================
// What is happening now? How are you feeling? Is the issue ongoing?

const round1Questions: FollowUpQuestion[] = [
  {
    questionId: 'r1_q1',
    round: 1,
    category: 'baseline',
    text: {
      en: 'What brings you here today? Please describe what is happening.',
      sw: 'Ni nini kinakuleta hapa leo? Tafadhali eleza kinachotokea.',
      kal: 'Ngo chito amachei? Mwelelji.'
    },
    type: 'text',
    riskWeight: 0.2,
    required: true,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  },
  {
    questionId: 'r1_q2',
    round: 1,
    category: 'baseline',
    text: {
      en: 'How are you feeling right now?',
      sw: 'Unahisi vipi sasa hivi?',
      kal: 'Imachei eng aj.?'
    },
    type: 'single_choice',
    options: ['Calm and stable', 'Somewhat anxious', 'Very distressed', 'In crisis'],
    riskWeight: 0.3,
    required: true,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  },
  {
    questionId: 'r1_q3',
    round: 1,
    category: 'baseline',
    text: {
      en: 'On a scale of 1-10, how would you rate your current emotional state? (1 = very calm, 10 = extreme distress)',
      sw: 'Kwa kipimo cha 1-10, ungekipima vipi hali yako ya kihisia sasa? (1 = tulivu sana, 10 = mshtuko mkubwa)',
      kal: 'Eng scale ne 1-10, alee ngalei emosyon angun? (1 = kaalei, 10 = kataai)'
    },
    type: 'scale',
    scaleMin: 1,
    scaleMax: 10,
    riskWeight: 0.4,
    required: true,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  },
  {
    questionId: 'r1_q4',
    round: 1,
    category: 'baseline',
    text: {
      en: 'Is this issue ongoing right now?',
      sw: 'Je, suala hili linaendelea sasa hivi?',
      kal: 'Ngalei ngonyo ye?'
    },
    type: 'yes_no',
    riskWeight: 0.3,
    required: true,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  }
];

// ==================== ROUND 2: CONTEXT ====================
// Has this happened before? Who is involved? Which platform is used?

const round2Questions: FollowUpQuestion[] = [
  {
    questionId: 'r2_q1',
    round: 2,
    category: 'context',
    text: {
      en: 'Has this situation happened before?',
      sw: 'Je, hali hii imetokea hapo awali?',
      kal: 'Amu ngalei anyun?'
    },
    type: 'single_choice',
    options: ['No, this is the first time', 'Yes, once before', 'Yes, multiple times', 'It is an ongoing pattern'],
    riskWeight: 0.2,
    required: true,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  },
  {
    questionId: 'r2_q2_context',
    round: 2,
    category: 'context',
    text: {
      en: 'Who is involved in this situation? (Select all that apply)',
      sw: 'Ni nani amehusika katika hali hii?',
      kal: 'Ngoo amui?'
    },
    type: 'single_choice',
    options: ['Family member', 'Partner/Spouse', 'Friend/Acquaintance', 'Stranger', 'Work colleague', 'Online contact', 'Multiple people'],
    riskWeight: 0.2,
    required: true,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  },
  // Online Harms specific
  {
    questionId: 'r2_q3_platform',
    round: 2,
    category: 'context',
    text: {
      en: 'Which platform or service is involved?',
      sw: 'Je, ni jukwaa au huduma gani inahusika?',
      kal: 'Alee platform?'
    },
    type: 'single_choice',
    options: ['Facebook', 'WhatsApp', 'Instagram', 'Twitter/X', 'TikTok', 'Email', 'SMS/Phone', 'Other website', 'Multiple platforms'],
    riskWeight: 0.1,
    required: false,
    applicableRoles: ['online_harms']
  },
  // Survivor specific
  {
    questionId: 'r2_q4_survivor',
    round: 2,
    category: 'context',
    text: {
      en: 'How long ago did the traumatic experience occur?',
      sw: 'Tukio la kuumiza lilitokea lini?',
      kal: 'Amu traumatich?'
    },
    type: 'single_choice',
    options: ['Within the last week', 'Within the last month', 'Within the last year', 'More than a year ago', 'It is ongoing'],
    riskWeight: 0.3,
    required: false,
    applicableRoles: ['survivor']
  }
];

// ==================== ROUND 3: RISK ====================
// Any threats? Any financial requests? Any exposure threats?

const round3Questions: FollowUpQuestion[] = [
  {
    questionId: 'r3_q1',
    round: 3,
    category: 'risk',
    text: {
      en: 'Have you received any direct threats?',
      sw: 'Je, umepokea vitisho vya moja kwa moja?',
      kal: 'Komakatai threats?'
    },
    type: 'yes_no',
    riskWeight: 0.5,
    required: true,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  },
  {
    questionId: 'r3_q2',
    round: 3,
    category: 'risk',
    text: {
      en: 'Has anyone demanded money or financial information from you?',
      sw: 'Je, mtu yeyote amekutaka pesa au taarifa za kifedha?',
      kal: 'Komatai pesa?'
    },
    type: 'yes_no',
    riskWeight: 0.4,
    required: true,
    applicableRoles: ['online_harms', 'survivor']
  },
  {
    questionId: 'r3_q3',
    round: 3,
    category: 'risk',
    text: {
      en: 'Is there a threat of exposing private information or images?',
      sw: 'Je, kuna tishio la kufichua taarifa au picha za kibinafsi?',
      kal: 'Komatai expose ngalei?'
    },
    type: 'yes_no',
    riskWeight: 0.6,
    required: true,
    applicableRoles: ['online_harms']
  },
  {
    questionId: 'r3_q4',
    round: 3,
    category: 'risk',
    text: {
      en: 'Do you feel your physical safety is at risk?',
      sw: 'Je, unahisi usalama wako wa kimwili uko hatarini?',
      kal: 'Ngalei unsafe eng ajun?'
    },
    type: 'single_choice',
    options: ['No, I feel safe', 'Somewhat concerned', 'Yes, I feel unsafe', 'I am in immediate danger'],
    riskWeight: 0.5,
    required: true,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  },
  {
    questionId: 'r3_q5',
    round: 3,
    category: 'risk',
    text: {
      en: 'Have you had thoughts of self-harm recently?',
      sw: 'Je, umekuwa na mawazo ya kujidhuru mwenyewe hivi karibuni?',
      kal: 'Komamochi self-harm?'
    },
    type: 'yes_no',
    riskWeight: 0.8,
    required: true,
    applicableRoles: ['survivor', 'online_harms']
  }
];

// ==================== ROUND 4: IMPACT ====================
// How is this affecting you emotionally? Has your daily life changed?

const round4Questions: FollowUpQuestion[] = [
  {
    questionId: 'r4_q1',
    round: 4,
    category: 'impact',
    text: {
      en: 'How has this affected your emotional well-being?',
      sw: 'Hili limekuathiri vipi kihisia?',
      kal: 'Alee kichi emosyon angun?'
    },
    type: 'single_choice',
    options: ['Minimal impact', 'Some anxiety/stress', 'Significant distress', 'Severe emotional trauma'],
    riskWeight: 0.4,
    required: true,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  },
  {
    questionId: 'r4_q2',
    round: 4,
    category: 'impact',
    text: {
      en: 'Has your daily routine or work been affected?',
      sw: 'Je, ratiba yako ya kila siku au kazi imeathirika?',
      kal: 'Kichi work/life?'
    },
    type: 'single_choice',
    options: ['No change', 'Some disruption', 'Major disruption', 'Unable to function normally'],
    riskWeight: 0.3,
    required: true,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  },
  {
    questionId: 'r4_q3',
    round: 4,
    category: 'impact',
    text: {
      en: 'How has this affected your sleep?',
      sw: 'Je, hili limekuathiri usingizi wako vipi?',
      kal: 'Kichi nem?'
    },
    type: 'single_choice',
    options: ['Sleeping normally', 'Occasional difficulty', 'Frequent insomnia', 'Severe sleep disruption'],
    riskWeight: 0.3,
    required: true,
    applicableRoles: ['survivor', 'online_harms']
  },
  {
    questionId: 'r4_q4',
    round: 4,
    category: 'impact',
    text: {
      en: 'Have you been able to eat normally?',
      sw: 'Je, umeweza kula kawaida?',
      kal: 'Kwechi chi?'
    },
    type: 'single_choice',
    options: ['Eating normally', 'Slight appetite changes', 'Significant appetite loss', 'Unable to eat'],
    riskWeight: 0.2,
    required: true,
    applicableRoles: ['survivor', 'online_harms']
  },
  // Practitioner specific
  {
    questionId: 'r4_q5_practitioner',
    round: 4,
    category: 'impact',
    text: {
      en: 'How has this affected your ability to support clients?',
      sw: 'Je, hili limekuathiri uwezo wako wa kuwasaidia wateja?',
      kal: 'Kichi ability support clients?'
    },
    type: 'single_choice',
    options: ['No impact', 'Some difficulty', 'Significant difficulty', 'Unable to provide care'],
    riskWeight: 0.3,
    required: false,
    applicableRoles: ['practitioner']
  }
];

// ==================== ROUND 5: STABILITY CHECK ====================
// Do you feel safer now? Do you need support?

const round5Questions: FollowUpQuestion[] = [
  {
    questionId: 'r5_q1',
    round: 5,
    category: 'stability',
    text: {
      en: 'Compared to when this started, do you feel safer now?',
      sw: 'Ikilinganishwa na mwanzo, unahisi salama zaidi sasa?',
      kal: 'Kwechi safe now?'
    },
    type: 'single_choice',
    options: ['Much safer', 'Somewhat safer', 'About the same', 'Less safe', 'Much less safe'],
    riskWeight: 0.2,
    required: true,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  },
  {
    questionId: 'r5_q2',
    round: 5,
    category: 'stability',
    text: {
      en: 'Do you feel you need immediate support or intervention?',
      sw: 'Je, unahisi unahitaji msaada au uingiliaji wa haraka?',
      kal: 'Komatai support?'
    },
    type: 'yes_no',
    riskWeight: 0.5,
    required: true,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  },
  {
    questionId: 'r5_q3',
    round: 5,
    category: 'stability',
    text: {
      en: 'What type of support would be most helpful right now?',
      sw: 'Ni msaada wa aina gani ungekuwa wa manufaa zaidi sasa?',
      kal: 'Alee support boun?'
    },
    type: 'single_choice',
    options: ['Counseling/Therapy', 'Legal assistance', 'Safety planning', 'Crisis intervention', 'Peer support', 'Information/Resources'],
    riskWeight: 0.1,
    required: true,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  },
  {
    questionId: 'r5_q4',
    round: 5,
    category: 'stability',
    text: {
      en: 'Is there anything else you would like to share?',
      sw: 'Je, kuna kitu kingine ungependa kushiriki?',
      kal: 'Chito eng?'
    },
    type: 'text',
    riskWeight: 0.1,
    required: false,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  },
  {
    questionId: 'r5_q5',
    round: 5,
    category: 'stability',
    text: {
      en: 'On a scale of 1-10, how hopeful do you feel about resolving this situation?',
      sw: 'Kwa kipimo cha 1-10, una matumaini gani ya kutatua hali hii?',
      kal: 'Scale 1-10, komachi hope?'
    },
    type: 'scale',
    scaleMin: 1,
    scaleMax: 10,
    riskWeight: 0.3,
    required: true,
    applicableRoles: ['survivor', 'practitioner', 'online_harms']
  }
];

// ==================== ROUND DEFINITIONS ====================

export const FOLLOW_UP_ROUNDS: FollowUpRound[] = [
  {
    roundNumber: 1,
    name: 'Baseline Assessment',
    description: 'Understanding current situation and emotional state',
    questions: round1Questions
  },
  {
    roundNumber: 2,
    name: 'Context Gathering',
    description: 'Exploring history, patterns, and involved parties',
    questions: round2Questions
  },
  {
    roundNumber: 3,
    name: 'Risk Evaluation',
    description: 'Assessing immediate safety and threat level',
    questions: round3Questions
  },
  {
    roundNumber: 4,
    name: 'Impact Assessment',
    description: 'Evaluating effects on daily life and well-being',
    questions: round4Questions
  },
  {
    roundNumber: 5,
    name: 'Stability Check',
    description: 'Checking current safety and support needs',
    questions: round5Questions
  }
];

// ==================== HELPER FUNCTIONS ====================

export function getQuestionsForRound(round: number, role: UserRole): FollowUpQuestion[] {
  const roundData = FOLLOW_UP_ROUNDS.find(r => r.roundNumber === round);
  if (!roundData) return [];
  
  return roundData.questions.filter(q => q.applicableRoles.includes(role));
}

export function getAllQuestionsForRole(role: UserRole): FollowUpQuestion[] {
  return FOLLOW_UP_ROUNDS.flatMap(round => 
    round.questions.filter(q => q.applicableRoles.includes(role))
  );
}

export function getRoundName(round: number): string {
  const roundData = FOLLOW_UP_ROUNDS.find(r => r.roundNumber === round);
  return roundData?.name || `Round ${round}`;
}

export function getRoundDescription(round: number): string {
  const roundData = FOLLOW_UP_ROUNDS.find(r => r.roundNumber === round);
  return roundData?.description || '';
}

export function calculateRiskFromAnswers(
  responses: { questionId: string; answer: string | number | boolean }[]
): number {
  let totalRiskWeight = 0;
  let maxPossibleWeight = 0;
  
  const allQuestions = FOLLOW_UP_ROUNDS.flatMap(r => r.questions);
  
  responses.forEach(response => {
    const question = allQuestions.find(q => q.questionId === response.questionId);
    if (question) {
      maxPossibleWeight += question.riskWeight;
      
      // Calculate risk contribution based on answer type
      let riskContribution = 0;
      
      if (question.type === 'yes_no') {
        if (response.answer === true || response.answer === 'yes') {
          riskContribution = question.riskWeight;
        }
      } else if (question.type === 'scale') {
        const scaleValue = typeof response.answer === 'number' 
          ? response.answer 
          : parseInt(response.answer as string, 10);
        const maxScale = question.scaleMax || 10;
        riskContribution = (scaleValue / maxScale) * question.riskWeight;
      } else if (question.type === 'single_choice') {
        const answerStr = String(response.answer).toLowerCase();
        if (answerStr.includes('severe') || answerStr.includes('crisis') || 
            answerStr.includes('danger') || answerStr.includes('immediate') ||
            answerStr.includes('unable') || answerStr.includes('high')) {
          riskContribution = question.riskWeight;
        } else if (answerStr.includes('significant') || answerStr.includes('distress')) {
          riskContribution = question.riskWeight * 0.7;
        } else if (answerStr.includes('some') || answerStr.includes('concerned')) {
          riskContribution = question.riskWeight * 0.4;
        }
      }
      
      totalRiskWeight += riskContribution;
    }
  });
  
  // Normalize to 0-1 range
  return maxPossibleWeight > 0 ? Math.min(totalRiskWeight / maxPossibleWeight, 1) : 0;
}

export function determineEmotionalStateFromScore(riskScore: number): 'calm' | 'distressed' | 'high_risk' | 'critical' {
  if (riskScore >= 0.7) return 'critical';
  if (riskScore >= 0.5) return 'high_risk';
  if (riskScore >= 0.3) return 'distressed';
  return 'calm';
}
