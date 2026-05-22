// Extended Follow-up Assessment Questions (20+ questions)
// Covers PTSD, Anxiety, Depression, and Wellness indicators

export interface FollowUpQuestion {
  id: string;
  question: string;
  swahili: string;
  category: 'ptsd' | 'anxiety' | 'depression' | 'wellness' | 'functioning';
  options: {
    value: number;
    label: string;
    swahili: string;
  }[];
}

export const followUpQuestions: FollowUpQuestion[] = [
  // PTSD Symptoms (Questions 1-7)
  {
    id: 'ptsd_1',
    question: 'In the past week, how often have you had upsetting memories, flashbacks, or nightmares about the traumatic event?',
    swahili: 'Katika wiki iliyopita, mara ngapi umekumbuka tukio baya, kujitokeza tena kwenye mawazo yako, au kupata ndoto mbaya kuhusu tukio hilo?',
    category: 'ptsd',
    options: [
      { value: 0, label: 'Not at all', swahili: 'Hapana kabisa' },
      { value: 1, label: 'Once or twice', swahili: 'Mara moja au mbili' },
      { value: 2, label: 'A few times', swahili: 'Mara kadhaa' },
      { value: 3, label: 'Many times', swahili: 'Mara nyingi' },
      { value: 4, label: 'Constantly', swahili: 'Kila wakati' }
    ]
  },
  {
    id: 'ptsd_2',
    question: 'How much effort have you made to avoid thoughts, feelings, or conversations about the traumatic event?',
    swahili: 'Je, umefanya juhudi kiasi gani kuepuka mawazo, hisia, au mazungumzo kuhusu tukio hilo?',
    category: 'ptsd',
    options: [
      { value: 0, label: 'No effort', swahili: 'Hakuna juhudi' },
      { value: 1, label: 'Little effort', swahili: 'Juhudi kidogo' },
      { value: 2, label: 'Moderate effort', swahili: 'Juhudi wastani' },
      { value: 3, label: 'Much effort', swahili: 'Juhudi nyingi' },
      { value: 4, label: 'Extreme effort', swahili: 'Juhudi kubwa sana' }
    ]
  },
  {
    id: 'ptsd_3',
    question: 'Do you feel emotionally numb or unable to have loving feelings for those close to you?',
    swahili: 'Je, unajisikia kama huna hisia au huwezi kupenda watu wa karibu nawe?',
    category: 'ptsd',
    options: [
      { value: 0, label: 'Not at all', swahili: 'Hapana kabisa' },
      { value: 1, label: 'A little bit', swahili: 'Kidogo tu' },
      { value: 2, label: 'Moderately', swahili: 'Wastani' },
      { value: 3, label: 'Quite a bit', swahili: 'Kiasi kikubwa' },
      { value: 4, label: 'Extremely', swahili: 'Sana sana' }
    ]
  },
  {
    id: 'ptsd_4',
    question: 'How easily are you startled or feel jumpy since the traumatic event?',
    swahili: 'Tangu tukio hilo, je, unashangaa au kukimbia haraka kiasi gani unaposikia kelele au kitu cha ghafla?',
    category: 'ptsd',
    options: [
      { value: 0, label: 'Not at all', swahili: 'Hapana kabisa' },
      { value: 1, label: 'A little', swahili: 'Kidogo' },
      { value: 2, label: 'Somewhat', swahili: 'Kiasi' },
      { value: 3, label: 'Very', swahili: 'Sana' },
      { value: 4, label: 'Extremely', swahili: 'Sana sana' }
    ]
  },
  {
    id: 'ptsd_5',
    question: 'How much trouble have you had sleeping in the past week (falling asleep or staying asleep)?',
    swahili: 'Katika wiki iliyopita, umekuwa na shida kiasi gani kupata usingizi (kuanzia kulala au kuendelea kulala)?',
    category: 'ptsd',
    options: [
      { value: 0, label: 'No trouble', swahili: 'Hakuna shida' },
      { value: 1, label: 'Mild trouble', swahili: 'Shida kidogo' },
      { value: 2, label: 'Moderate trouble', swahili: 'Shida wastani' },
      { value: 3, label: 'Severe trouble', swahili: 'Shida kubwa' },
      { value: 4, label: 'Cannot sleep', swahili: 'Siwezi kulala kabisa' }
    ]
  },
  {
    id: 'ptsd_6',
    question: 'Do you feel irritable or have angry outbursts since the traumatic event?',
    swahili: 'Tangu tukio hilo, je, unajisikia kuwa mwepesi wa kukasirika au kupandwa na hasira mara kwa mara?',
    category: 'ptsd',
    options: [
      { value: 0, label: 'Never', swahili: 'Kamwe' },
      { value: 1, label: 'Rarely', swahili: 'Mara chache' },
      { value: 2, label: 'Sometimes', swahili: 'Wakati mwingine' },
      { value: 3, label: 'Often', swahili: 'Mara nyingi' },
      { value: 4, label: 'Very often', swahili: 'Sana sana' }
    ]
  },
  {
    id: 'ptsd_7',
    question: 'Do you feel hypervigilant (always on guard or watchful) or have difficulty concentrating?',
    swahili: 'Je, unajisikia kama unalinda au kuangalia kila kitu kila wakati au kuwa na ugumu wa kufikiria?',
    category: 'ptsd',
    options: [
      { value: 0, label: 'Not at all', swahili: 'Hapana kabisa' },
      { value: 1, label: 'A little', swahili: 'Kidogo' },
      { value: 2, label: 'Somewhat', swahili: 'Kiasi' },
      { value: 3, label: 'Very much', swahili: 'Sana' },
      { value: 4, label: 'Extremely', swahili: 'Sana sana' }
    ]
  },

  // Anxiety Symptoms (Questions 8-12)
  {
    id: 'anxiety_1',
    question: 'How often have you felt nervous, anxious, or on edge in the past week?',
    swahili: 'Katika wiki iliyopita, mara ngapi umeshika hofu, wasiwasi, au kuwa na hali ya kutokuwa na amani?',
    category: 'anxiety',
    options: [
      { value: 0, label: 'Not at all', swahili: 'Hapana kabisa' },
      { value: 1, label: 'Several days', swahili: 'Siku kadhaa' },
      { value: 2, label: 'More than half the days', swahili: 'Zaidi ya nusu ya siku' },
      { value: 3, label: 'Nearly every day', swahili: 'Karibu kila siku' },
      { value: 4, label: 'Every day', swahili: 'Kila siku' }
    ]
  },
  {
    id: 'anxiety_2',
    question: 'Have you been unable to stop or control worrying?',
    swahili: 'Je, umekuwa hauwezi kuacha au kudhibiti wasiwasi wako?',
    category: 'anxiety',
    options: [
      { value: 0, label: 'Not at all', swahili: 'Hapana kabisa' },
      { value: 1, label: 'A little', swahili: 'Kidogo' },
      { value: 2, label: 'Somewhat', swahili: 'Kiasi' },
      { value: 3, label: 'Very much', swahili: 'Sana' },
      { value: 4, label: 'Extremely', swahili: 'Sana sana' }
    ]
  },
  {
    id: 'anxiety_3',
    question: 'How often have you had physical symptoms like racing heart, sweating, or trembling?',
    swahili: 'Mara ngapi umekuwa na dalili za mwili kama moyo kupiga haraka, jasho, au kutetemeka?',
    category: 'anxiety',
    options: [
      { value: 0, label: 'Never', swahili: 'Kamwe' },
      { value: 1, label: 'Rarely', swahili: 'Mara chache' },
      { value: 2, label: 'Sometimes', swahili: 'Wakati mwingine' },
      { value: 3, label: 'Often', swahili: 'Mara nyingi' },
      { value: 4, label: 'Very often', swahili: 'Sana sana' }
    ]
  },
  {
    id: 'anxiety_4',
    question: 'Do you worry about many different things or have difficulty relaxing?',
    swahili: 'Je, unawasiwasi kuhusu mambo mengi tofauti au kuwa na ugumu wa kupumzika?',
    category: 'anxiety',
    options: [
      { value: 0, label: 'Not at all', swahili: 'Hapana kabisa' },
      { value: 1, label: 'A little', swahili: 'Kidogo' },
      { value: 2, label: 'Somewhat', swahili: 'Kiasi' },
      { value: 3, label: 'Very much', swahili: 'Sana' },
      { value: 4, label: 'Extremely', swahili: 'Sana sana' }
    ]
  },
  {
    id: 'anxiety_5',
    question: 'How often do you feel afraid something awful might happen?',
    swahili: 'Mara ngapi unajisikia kama kitu kibaya kinaweza kutokea?',
    category: 'anxiety',
    options: [
      { value: 0, label: 'Never', swahili: 'Kamwe' },
      { value: 1, label: 'Rarely', swahili: 'Mara chache' },
      { value: 2, label: 'Sometimes', swahili: 'Wakati mwingine' },
      { value: 3, label: 'Often', swahili: 'Mara nyingi' },
      { value: 4, label: 'Always', swahili: 'Kila wakati' }
    ]
  },

  // Depression Symptoms (Questions 13-17)
  {
    id: 'depression_1',
    question: 'Over the past week, how often have you felt little interest or pleasure in doing things?',
    swahili: 'Katika wiki iliyopita, mara ngapi umehisi hamu kidogo au furaha katika kufanya mambo?',
    category: 'depression',
    options: [
      { value: 0, label: 'Not at all', swahili: 'Hapana kabisa' },
      { value: 1, label: 'Several days', swahili: 'Siku kadhaa' },
      { value: 2, label: 'More than half the days', swahili: 'Zaidi ya nusu ya siku' },
      { value: 3, label: 'Nearly every day', swahili: 'Karibu kila siku' },
      { value: 4, label: 'Every day', swahili: 'Kila siku' }
    ]
  },
  {
    id: 'depression_2',
    question: 'How often have you felt down, depressed, or hopeless?',
    swahili: 'Mara ngapi umehisi huzuni, kupata kisichonifaa, au kukosa tumaini?',
    category: 'depression',
    options: [
      { value: 0, label: 'Not at all', swahili: 'Hapana kabisa' },
      { value: 1, label: 'Several days', swahili: 'Siku kadhaa' },
      { value: 2, label: 'More than half the days', swahili: 'Zaidi ya nusu ya siku' },
      { value: 3, label: 'Nearly every day', swahili: 'Karibu kila siku' },
      { value: 4, label: 'Every day', swahili: 'Kila siku' }
    ]
  },
  {
    id: 'depression_3',
    question: 'Have you had trouble with appetite (eating too much or too little)?',
    swahili: 'Je, umekuwa na shida na chakula (kula sana au kidogo sana)?',
    category: 'depression',
    options: [
      { value: 0, label: 'No trouble', swahili: 'Hakuna shida' },
      { value: 1, label: 'Mild trouble', swahili: 'Shida kidogo' },
      { value: 2, label: 'Moderate trouble', swahili: 'Shida wastani' },
      { value: 3, label: 'Severe trouble', swahili: 'Shida kubwa' },
      { value: 4, label: 'Cannot eat', swahili: 'Siwezi kula kabisa' }
    ]
  },
  {
    id: 'depression_4',
    question: 'How often do you feel bad about yourself or that you are a failure?',
    swahili: 'Mara ngapi unajisikia vibaya kuhusu wewe mwenyewe au kama ni mshindwa?',
    category: 'depression',
    options: [
      { value: 0, label: 'Not at all', swahili: 'Hapana kabisa' },
      { value: 1, label: 'A little', swahili: 'Kidogo' },
      { value: 2, label: 'Somewhat', swahili: 'Kiasi' },
      { value: 3, label: 'Very much', swahili: 'Sana' },
      { value: 4, label: 'Extremely', swahili: 'Sana sana' }
    ]
  },
  {
    id: 'depression_5',
    question: 'Have you had thoughts of hurting yourself or that you would be better off dead?',
    swahili: 'Je, umekuwa na mawazo ya kujiumiza au kwamba itakuwa bora ufe?',
    category: 'depression',
    options: [
      { value: 0, label: 'Never', swahili: 'Kamwe' },
      { value: 1, label: 'Rarely', swahili: 'Mara chache' },
      { value: 2, label: 'Sometimes', swahili: 'Wakati mwingine' },
      { value: 3, label: 'Often', swahili: 'Mara nyingi' },
      { value: 4, label: 'Very often', swahili: 'Sana sana' }
    ]
  },

  // Functioning & Wellness (Questions 18-22)
  {
    id: 'functioning_1',
    question: 'How well are you able to carry out your daily activities (work, school, home duties)?',
    swahili: 'Uwezo wako wa kufanya shughuli zako za kila siku (kazi, shule, majukumu ya nyumbani) ni wa kiwango gani?',
    category: 'functioning',
    options: [
      { value: 4, label: 'Very well', swahili: 'Vizuri sana' },
      { value: 3, label: 'Well', swahili: 'Vizuri' },
      { value: 2, label: 'Fair', swahili: 'Wastani' },
      { value: 1, label: 'Poorly', swahili: 'Vibaya' },
      { value: 0, label: 'Very poorly', swahili: 'Vibaya sana' }
    ]
  },
  {
    id: 'functioning_2',
    question: 'How would you rate your relationships with family and friends?',
    swahili: 'Ungeipiga alama vipi mahusiano yako na familia na marafiki?',
    category: 'functioning',
    options: [
      { value: 4, label: 'Excellent', swahili: 'Bora sana' },
      { value: 3, label: 'Good', swahili: 'Nzuri' },
      { value: 2, label: 'Fair', swahili: 'Wastani' },
      { value: 1, label: 'Poor', swahili: 'Mbaya' },
      { value: 0, label: 'Very poor', swahili: 'Mbaya sana' }
    ]
  },
  {
    id: 'functioning_3',
    question: 'Do you feel hopeful about your future?',
    swahili: 'Je, unahisi tumaini kuhusu mustakabali wako?',
    category: 'functioning',
    options: [
      { value: 4, label: 'Very hopeful', swahili: 'Tumaini kubwa sana' },
      { value: 3, label: 'Hopeful', swahili: 'Tumaini' },
      { value: 2, label: 'Uncertain', swahili: 'Sina hakika' },
      { value: 1, label: 'Hopeless', swahili: 'Hakuna tumaini' },
      { value: 0, label: 'Very hopeless', swahili: 'Kukata tumaini kabisa' }
    ]
  },
  {
    id: 'wellness_1',
    question: 'How often do you engage in self-care activities (exercise, meditation, hobbies)?',
    swahili: 'Mara ngapi unajihusisha na shughuli za kujitunza (mazoezi, kutafakari, michezo)?',
    category: 'wellness',
    options: [
      { value: 4, label: 'Daily', swahili: 'Kila siku' },
      { value: 3, label: 'Several times a week', swahili: 'Mara kadhaa kwa wiki' },
      { value: 2, label: 'Once a week', swahili: 'Mara moja kwa wiki' },
      { value: 1, label: 'Rarely', swahili: 'Mara chache' },
      { value: 0, label: 'Never', swahili: 'Kamwe' }
    ]
  },
  {
    id: 'wellness_2',
    question: 'Are you using healthy coping strategies when stressed (talking to someone, journaling, etc.)?',
    swahili: 'Je, unatumia mbinu za kiafya za kukabiliana na stress (kuzungumza na mtu, kuandika, n.k.)?',
    category: 'wellness',
    options: [
      { value: 4, label: 'Always', swahili: 'Kila wakati' },
      { value: 3, label: 'Often', swahili: 'Mara nyingi' },
      { value: 2, label: 'Sometimes', swahili: 'Wakati mwingine' },
      { value: 1, label: 'Rarely', swahili: 'Mara chache' },
      { value: 0, label: 'Never', swahili: 'Kamwe' }
    ]
  },
  {
    id: 'wellness_3',
    question: 'Overall, how would you rate your emotional well-being this week compared to last week?',
    swahili: 'Kwa ujumla, ungeipiga alama vipi hali yako ya kihisia wiki hii ikilinganishwa na wiki iliyopita?',
    category: 'wellness',
    options: [
      { value: 4, label: 'Much better', swahili: 'Bora sana zaidi' },
      { value: 3, label: 'Somewhat better', swahili: 'Bora kidogo' },
      { value: 2, label: 'About the same', swahili: 'Sawa sawa' },
      { value: 1, label: 'Somewhat worse', swahili: 'Mbaya kidogo' },
      { value: 0, label: 'Much worse', swahili: 'Mbaya sana zaidi' }
    ]
  }
];

// Calculate follow-up scores and diagnosis
export interface FollowUpResult {
  ptsdScore: number;
  anxietyScore: number;
  depressionScore: number;
  functioningScore: number;
  wellnessScore: number;
  overallTrend: 'improving' | 'stable' | 'worsening';
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  recommendations: string[];
}

export function calculateFollowUpResult(
  answers: Record<string, number>,
  previousSession?: { ptsdScore: number; anxietyScore: number; depressionScore: number }
): FollowUpResult {
  let ptsdScore = 0;
  let anxietyScore = 0;
  let depressionScore = 0;
  let functioningScore = 0;
  let wellnessScore = 0;

  followUpQuestions.forEach(q => {
    const answer = answers[q.id] || 0;
    switch (q.category) {
      case 'ptsd':
        ptsdScore += answer;
        break;
      case 'anxiety':
        anxietyScore += answer;
        break;
      case 'depression':
        depressionScore += answer;
        break;
      case 'functioning':
        functioningScore += answer;
        break;
      case 'wellness':
        wellnessScore += answer;
        break;
    }
  });

  // Normalize scores (0-100 scale)
  const normalizedPtsd = (ptsdScore / 28) * 100; // 7 questions × 4 max
  const normalizedAnxiety = (anxietyScore / 20) * 100; // 5 questions × 4 max
  const normalizedDepression = (depressionScore / 20) * 100; // 5 questions × 4 max
  const normalizedFunctioning = (functioningScore / 15) * 100; // 3 questions × 4 max, reversed
  const normalizedWellness = (wellnessScore / 15) * 100; // 3 questions × 4 max

  // Calculate overall severity
  const avgSymptomScore = (normalizedPtsd + normalizedAnxiety + normalizedDepression) / 3;
  let severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  if (avgSymptomScore < 25) severity = 'minimal';
  else if (avgSymptomScore < 50) severity = 'mild';
  else if (avgSymptomScore < 75) severity = 'moderate';
  else severity = 'severe';

  // Determine trend if previous data available
  let overallTrend: 'improving' | 'stable' | 'worsening' = 'stable';
  if (previousSession) {
    const prevAvg = (previousSession.ptsdScore + previousSession.anxietyScore + previousSession.depressionScore) / 3;
    const currentAvg = (normalizedPtsd + normalizedAnxiety + normalizedDepression) / 3;
    const diff = prevAvg - currentAvg;
    if (diff > 10) overallTrend = 'improving';
    else if (diff < -10) overallTrend = 'worsening';
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (normalizedPtsd > 50) {
    recommendations.push('Consider trauma-focused therapy (CPT, EMDR, or PE)');
    recommendations.push('Practice grounding techniques daily');
  }
  if (normalizedAnxiety > 50) {
    recommendations.push('Learn and practice breathing exercises');
    recommendations.push('Consider anxiety management techniques');
  }
  if (normalizedDepression > 50) {
    recommendations.push('Increase pleasant activities schedule');
    recommendations.push('Consider behavioral activation therapy');
  }
  if (normalizedFunctioning < 50) {
    recommendations.push('Focus on daily routine and structure');
    recommendations.push('Break tasks into smaller, manageable steps');
  }
  if (normalizedWellness < 50) {
    recommendations.push('Engage in regular self-care activities');
    recommendations.push('Connect with supportive people regularly');
  }
  if (recommendations.length === 0) {
    recommendations.push('Continue current coping strategies');
    recommendations.push('Maintain regular self-care routine');
    recommendations.push('Stay connected with support network');
  }

  return {
    ptsdScore: Math.round(normalizedPtsd),
    anxietyScore: Math.round(normalizedAnxiety),
    depressionScore: Math.round(normalizedDepression),
    functioningScore: Math.round(normalizedFunctioning),
    wellnessScore: Math.round(normalizedWellness),
    overallTrend,
    severity,
    recommendations
  };
}
