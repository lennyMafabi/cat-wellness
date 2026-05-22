// TFGBV (Technology-Facilitated Gender-Based Violence) Assessment Questions
// Supports English, Swahili, and Kalenjin

export type TfgbvLanguage = 'en' | 'sw' | 'kal';

export interface TfgbvQuestion {
  id: string;
  cluster: 'impact' | 'severity' | 'coping' | 'support';
  text: Record<TfgbvLanguage, string>;
}

export const TFGBV_CLUSTERS = {
  impact: {
    en: 'Emotional Impact',
    sw: 'Athari za Kihisia',
    kal: 'Tishetab Yaitab Nandoa'
  },
  severity: {
    en: 'Severity & Duration',
    sw: 'Ukatili na Muda',
    kal: 'Cheiso ak Cheptisiet'
  },
  coping: {
    en: 'Coping Mechanisms',
    sw: 'Njia za Kukabiliana',
    kal: 'Mikoboetab Kabuutin'
  },
  support: {
    en: 'Support System',
    sw: 'Mfumo wa Usaidizi',
    kal: 'Kondeptab Ketusie'
  }
};

export const TFGBV_ANSWER_OPTIONS = {
  en: [
    { value: 0, label: 'Not at all', desc: 'Has not happened' },
    { value: 1, label: 'Rarely', desc: 'Once or twice' },
    { value: 2, label: 'Sometimes', desc: 'A few times per month' },
    { value: 3, label: 'Often', desc: 'Weekly or more' },
    { value: 4, label: 'Very Often', desc: 'Daily or continuous' }
  ],
  sw: [
    { value: 0, label: 'Hapana kabisa', desc: 'Hajawahi kutokea' },
    { value: 1, label: 'Mara chache', desc: 'Mara moja au mbili' },
    { value: 2, label: 'Wakati mwingine', desc: 'Mara chache kwa mwezi' },
    { value: 3, label: 'Mara nyingi', desc: 'Kila wiki au zaidi' },
    { value: 4, label: 'Mara nyingi sana', desc: 'Kila siku au mara kwa mara' }
  ],
  kal: [
    { value: 0, label: 'Amei', desc: 'Maam ame koyai' },
    { value: 1, label: 'Kiptonganis', desc: 'Ama ama aeng' },
    { value: 2, label: 'Kiptai', desc: 'Cheiso ak aeng' },
    { value: 3, label: 'Cheiso', desc: 'Aebarek ak' },
    { value: 4, label: 'Cheiso miising', desc: 'Tugul ak' }
  ]
};

export const TFGBV_QUESTIONS: TfgbvQuestion[] = [
  // IMPACT CLUSTER - Emotional and psychological effects
  {
    id: 'tfgbv_1',
    cluster: 'impact',
    text: {
      en: 'I feel anxious or afraid when using my phone or going online',
      sw: 'Najisikika na wasiwasi au hofu ninapotumia simu yangu au kwenda mtandaoni',
      kal: 'Angobaiyat nebo kiyabet kobortab simu ak internet'
    }
  },
  {
    id: 'tfgbv_2',
    cluster: 'impact',
    text: {
      en: 'I have trouble sleeping because of what happened online',
      sw: 'Nina shida ya kulala kwa sababu ya kilichotokea mtandaoni',
      kal: 'Amutab koyai lalet nebo kiyabet cheitab online'
    }
  },
  {
    id: 'tfgbv_3',
    cluster: 'impact',
    text: {
      en: 'I feel ashamed or embarrassed about what was shared about me',
      sw: 'Najisikika na aibu au unyonge kuhusu kilichoshirikiwa kunihusu',
      kal: 'Angobaiyat nebo seryet ak ngachttab cheibo cheitab aanai'
    }
  },
  {
    id: 'tfgbv_4',
    cluster: 'impact',
    text: {
      en: 'I avoid certain people or places because of online harassment',
      sw: 'Nazikwepa watu au maeneo fulani kwa sababu ya uharifu mtandaoni',
      kal: 'Ametab cheiso piik ak olooto nebo kiyabet uharifu online'
    }
  },
  {
    id: 'tfgbv_5',
    cluster: 'impact',
    text: {
      en: 'I feel isolated or disconnected from friends and family',
      sw: 'Najisikika mbali au nimetenganishwa na marafiki na familia',
      kal: 'Angobaiyat nebo imanat ak kewendebwe piik ak family'
    }
  },

  // SEVERITY CLUSTER - How bad and how long
  {
    id: 'tfgbv_6',
    cluster: 'severity',
    text: {
      en: 'The harassment has been going on for more than a month',
      sw: 'Uharifu umeendelea kwa zaidi ya mwezi mmoja',
      kal: 'Uharifu ab kach muun mweny'
    }
  },
  {
    id: 'tfgbv_7',
    cluster: 'severity',
    text: {
      en: 'The person threatened to share private images or information about me',
      sw: 'Mtu huyo alikuwa na dhamaka ya kusambaza picha au taarifa zangu za faragha',
      kal: 'Nebo piik agenai ko kuamche picha ak informationetab aanai'
    }
  },
  {
    id: 'tfgbv_8',
    cluster: 'severity',
    text: {
      en: 'My personal information (address, workplace, etc.) was shared online without consent',
      sw: 'Taarifa zangu za kibinafsi (anwani, kazini, n.k.) zilisambazwa mtandaoni bila idhini',
      kal: 'Informationetab aanai (ooriet, olooto, etc.) agogosie online maamutab consent'
    }
  },
  {
    id: 'tfgbv_9',
    cluster: 'severity',
    text: {
      en: 'I have received unwanted sexual messages or images',
      sw: 'Nimepokea ujumbe au picha za kimapenzi zisizotakiwa',
      kal: 'Amaale messages ak picha cheiso cheiseksual chemaam cheisei'
    }
  },
  {
    id: 'tfgbv_10',
    cluster: 'severity',
    text: {
      en: 'Multiple people have joined in harassing or attacking me online',
      sw: 'Watu wengi wamejiunga kuniudhi au kunishambulia mtandaoni',
      kal: 'Piik cheiso che choptos ak uharifu ak saget aanai online'
    }
  },

  // COPING CLUSTER - How they're dealing with it
  {
    id: 'tfgbv_11',
    cluster: 'coping',
    text: {
      en: 'I have stopped using certain social media or apps because of this',
      sw: 'Nimeacha kutumia mitandao fulani ya kijamii au programu kwa sababu hii',
      kal: 'Amutab cheiso cheigo social media ak apps nebo kiyabet'
    }
  },
  {
    id: 'tfgbv_12',
    cluster: 'coping',
    text: {
      en: 'I have changed my phone number or deleted accounts',
      sw: 'Nimebadilisha namba ya simu au kufuta akaunti zangu',
      kal: 'Abalut numbarietab simu ak delete accounts'
    }
  },
  {
    id: 'tfgbv_13',
    cluster: 'coping',
    text: {
      en: 'I have reported the incident to the platform (Facebook, WhatsApp, etc.)',
      sw: 'Nimeripoti tukio kwenye jukwaa (Facebook, WhatsApp, n.k.)',
      kal: 'Amutab report tukioetab platform (Facebook, WhatsApp, etc.)'
    }
  },
  {
    id: 'tfgbv_14',
    cluster: 'coping',
    text: {
      en: 'I have tried to get help from family, friends, or professionals',
      sw: 'Nimejaribu kupata usaidizi kutoka kwa familia, marafiki, au wataalamu',
      kal: 'Amaatsab kainet nebo konet ketusie piik, friends, ak professionals'
    }
  },
  {
    id: 'tfgbv_15',
    cluster: 'coping',
    text: {
      en: 'I feel I can take steps to protect myself online',
      sw: 'Nahisi ninaweza kuchukua hatua za kujilinda mtandaoni',
      kal: 'Angobaiyan nebo chut koket cheibo che kiyabet aanai online'
    }
  },

  // SUPPORT CLUSTER - What help they have
  {
    id: 'tfgbv_16',
    cluster: 'support',
    text: {
      en: 'I have someone I trust who knows about what happened',
      sw: 'Nina mtu ninayemuamini anayejua kilichotokea',
      kal: 'Kainet piik nebo aanai chebo cheitab aanai'
    }
  },
  {
    id: 'tfgbv_17',
    cluster: 'support',
    text: {
      en: 'I know where to get help if the harassment continues',
      sw: 'Najua wapi kupata usaidizi ikiwa uharifu unaendelea',
      kal: 'Angobai olooto nebo kainet ketusie ngun uharifu ab kach kach'
    }
  },
  {
    id: 'tfgbv_18',
    cluster: 'support',
    text: {
      en: 'I feel supported by my community or social circle',
      sw: 'Nahisi kuwa na usaidizi kutoka kwa jamii yangu au kikundi cha kijamii',
      kal: 'Angobaiyan nebo ketusietab jamii ak piik che nebo aanai'
    }
  },
  {
    id: 'tfgbv_19',
    cluster: 'support',
    text: {
      en: 'I have access to a phone and internet when I need help',
      sw: 'Nina kufikia simu na mtandao ninapohitaji usaidizi',
      kal: 'Kainet simu ak internet ngun angobai nebo ketusie'
    }
  },
  {
    id: 'tfgbv_20',
    cluster: 'support',
    text: {
      en: 'I believe my situation can improve with the right support',
      sw: 'Naamini hali yangu inaweza kuboresha kwa usaidizi sahihi',
      kal: 'Angobaiyan nebo situationetab aanai amuch ketesi ak ketusie nebo cheibo'
    }
  }
];

// TFGBV Analysis scoring
export interface TfgbvAnalysisResult {
  clusterLevels: Record<string, 'low' | 'moderate' | 'high' | 'critical'>;
  rawScores: Record<string, number>;
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  topCluster: string;
  summary: string;
  summarySw: string;
  summaryKal: string;
  recommendations: string[];
  recommendationsSw: string[];
  recommendationsKal: string[];
}

export function analyzeTfgbvResponses(answers: Record<string, number>): TfgbvAnalysisResult {
  const clusters = {
    impact: ['tfgbv_1', 'tfgbv_2', 'tfgbv_3', 'tfgbv_4', 'tfgbv_5'],
    severity: ['tfgbv_6', 'tfgbv_7', 'tfgbv_8', 'tfgbv_9', 'tfgbv_10'],
    coping: ['tfgbv_11', 'tfgbv_12', 'tfgbv_13', 'tfgbv_14', 'tfgbv_15'],
    support: ['tfgbv_16', 'tfgbv_17', 'tfgbv_18', 'tfgbv_19', 'tfgbv_20']
  };

  const clusterScores: Record<string, number> = {};
  const clusterLevels: Record<string, 'low' | 'moderate' | 'high' | 'critical'> = {};
  
  // Calculate cluster scores
  for (const [clusterName, questionIds] of Object.entries(clusters)) {
    const total = questionIds.reduce((sum, id) => sum + (answers[id] || 0), 0);
    const max = questionIds.length * 4;
    const percentage = (total / max) * 100;
    clusterScores[clusterName] = Math.round(percentage);
    
    // Determine level
    if (percentage < 25) clusterLevels[clusterName] = 'low';
    else if (percentage < 50) clusterLevels[clusterName] = 'moderate';
    else if (percentage < 75) clusterLevels[clusterName] = 'high';
    else clusterLevels[clusterName] = 'critical';
  }

  // Determine overall risk (weighted toward impact and severity)
  const weightedScore = 
    (clusterScores.impact * 0.35) + 
    (clusterScores.severity * 0.35) + 
    (clusterScores.coping * 0.15) + 
    (100 - clusterScores.support) * 0.15;

  let overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  if (weightedScore < 30) overallRisk = 'low';
  else if (weightedScore < 55) overallRisk = 'moderate';
  else if (weightedScore < 80) overallRisk = 'high';
  else overallRisk = 'critical';

  // Find top cluster (excluding support which is inverse)
  const impactClusters = { impact: clusterScores.impact, severity: clusterScores.severity, coping: clusterScores.coping };
  const topCluster = Object.entries(impactClusters).sort((a, b) => b[1] - a[1])[0][0];

  // Generate summaries based on risk level
  const summaries = {
    low: {
      en: 'Your responses suggest you are experiencing minimal negative effects from online interactions. You appear to have good coping mechanisms and support systems in place.',
      sw: 'Majibu yako yanapendekeza kwamba unakumbwa na madhara kidogo sana kutoka kwa mwingiliano wa mtandaoni. Unaonekana kuwa na mikakati bora ya kukabiliana na mifumo ya usaidizi.',
      kal: 'Responseetab bo ak sugululul chebo amin cheiso ak online. Ketab kii kabuutin cheibo ak konet ketusie'
    },
    moderate: {
      en: 'Your responses indicate some negative impact from online experiences. While you have some coping strategies, additional support could help strengthen your resilience.',
      sw: 'Majibu yako yanashiria madhara fulani kutokana na uzoefu wa mtandaoni. Ingawa una mikakati fulani ya kukabiliana, usaidizi zaidi ungewezesha kuimarisha uvumilivu wako.',
      kal: 'Responseetab bo ak itab tishetab cheiso ak online. Ketab kabuutin cheibo, ketusie kogoren koimut resilience'
    },
    high: {
      en: 'Your responses suggest significant negative impact from online harassment. You are experiencing notable emotional distress and may benefit from immediate support and intervention.',
      sw: 'Majibu yako yanapendekeza athari kubwa za kihasibu kutokana na uharifu mtandaoni. Unakumbwa msongo mkubwa wa kihisia na unaweza kufaiki na usaidizi wa haraka na uingiliaji kati.',
      kal: 'Responseetab bo ak itab tishetab cheptisiet nebo uharifu online. Nandoa kiyabet ak kainet ketusie kibagenge'
    },
    critical: {
      en: 'Your responses indicate severe and ongoing harm from online experiences. Immediate professional support is strongly recommended. You do not have to face this alone.',
      sw: 'Majibu yako yanashiria madhara makubwa na yanayoendelea kutokana na uzoefu wa mtandaoni. Usaidizi wa kitaaluma wa haraka unaopendekeza sana. Hujalazimika kukabiliana na hii peke yako.',
      kal: 'Responseetab bo ak itab tishetab cheiso miising ak online. Ketusietab professional kibagenge. Maam cheiswei'
    }
  };

  // Generate recommendations
  const recommendations = {
    low: {
      en: [
        'Continue practicing good online safety habits',
        'Stay connected with your support network',
        'Report any concerning behavior early',
        'Help educate others about online safety'
      ],
      sw: [
        'Endelea kufanya mazoea mazuri ya usalama wa mtandaoni',
        'Endelea kuwa na mawasiliano na mtandao wako wa usaidizi',
        'Ripoti mienendo yoyote ya wasiwasi mapema',
        'Saidia kuelimisha wengine kuhusu usalama wa mtandaoni'
      ],
      kal: [
        'Koboru kabuutin cheibo che usalama online',
        'Kewendebwe piik che ketusie',
        'Report behavior che kiyabet',
        'Sagas piik cheibo che usalama online'
      ]
    },
    moderate: {
      en: [
        'Consider speaking with a counselor or therapist',
        'Review and strengthen your privacy settings on all platforms',
        'Document any ongoing harassment for future reporting',
        'Connect with support groups for survivors of online harassment'
      ],
      sw: [
        'Fikiria kuzungumza na mshauri au mtaalamu',
        'Kagua na kuimarisha mipangilio yako ya faragha kwenye majukwaa yote',
        'Hifadhi uharifu unaendelea kwa ajili ya kuripoti baadaye',
        'Unganishwa na vikundi vya usaidizi wa wanaopona wa uharifu mtandaoni'
      ],
      kal: [
        'Kaal counselor ak therapist',
        'Review ak imut privacy settings platforms tugul',
        'Document uharifu ab kach kach',
        'Connect ak piik che uharifu online'
      ]
    },
    high: {
      en: [
        'Seek immediate support from a mental health professional',
        'Report the harassment to law enforcement',
        'Consider temporarily deactivating affected social media accounts',
        'Create a safety plan with a trusted person',
        'Document all evidence (screenshots, messages, dates)'
      ],
      sw: [
        'Tafuta usaidizi wa haraka kutoka kwa mtaalamu wa afya ya akili',
        'Ripoti uharifu kwa maafisa wa usalama',
        'Fikiria kuzima kwa muda akaunti za mitandao ya kijamii zilizoathirika',
        'Tenga mpango wa usalama na mtu wa kuaminiwa',
        'Hifadhi ushahidi wote (screenshots, ujumbe, tarehe)'
      ],
      kal: [
        'Ketusie mental health professional kibagenge',
        'Report uharifu law enforcement',
        'Deactivate accounts che uharifu kogoren',
        'Plan usalama ak piik nebo aanai',
        'Document ushahidi tugul (screenshots, messages, dates)'
      ]
    },
    critical: {
      en: [
        'Contact emergency services or a crisis helpline immediately',
        'Reach out to a trusted family member or friend right now',
        'Do not delete any evidence - preserve everything',
        'Consider staying with someone you trust temporarily',
        'Report to police and seek a protection order if needed',
        'Contact a lawyer who specializes in cybercrime or GBV'
      ],
      sw: [
        'Wasiliana na huduma za dharura au line ya msaada wa dharura mara moja',
        'Wasiliana na mwanafamilia au rafiki wa kuaminiwa sasa hivi',
        'Usifute ushahidi wowote - hifadhi kila kitu',
        'Fikiria kubaki na mtu unayemuamini kwa muda',
        'Ripoti kwa polisi na tafuta amri ya ulinzi ikiwa inahitajika',
        'Wasiliana na mwanasheria mtaalamu wa uhalifu wa mtandao au GBV'
      ],
      kal: [
        'Contact emergency services ak crisis helpline kibagenge',
        'Contact family member ak friend nebo aanai kibagenge',
        'Maam delete ushahidi - preserve tugul',
        'Stay ak piik nebo aanai kogoren',
        'Report police ak seek protection order ngun cheibo',
        'Contact lawyer nebo cybercrime ak GBV'
      ]
    }
  };

  return {
    clusterLevels,
    rawScores: clusterScores,
    overallRisk,
    topCluster,
    summary: summaries[overallRisk].en,
    summarySw: summaries[overallRisk].sw,
    summaryKal: summaries[overallRisk].kal,
    recommendations: recommendations[overallRisk].en,
    recommendationsSw: recommendations[overallRisk].sw,
    recommendationsKal: recommendations[overallRisk].kal
  };
}
