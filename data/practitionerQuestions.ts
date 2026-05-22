import { Question } from "@/types";

// Secondary Traumatic Stress (STS) and Vicarious Trauma (VT) questions for practitioners
// Scale: 0 = Not at all, 1 = A little bit, 2 = Moderately, 3 = Quite a bit, 4 = Extremely

export const PRACTITIONER_QUESTIONS: Question[] = [
  // SECONDARY TRAUMATIC STRESS - RE-EXPERIENCING (4 questions)
  { id: "p1", text: "Having intrusive thoughts or images about your clients' traumatic experiences when you're trying to rest or sleep?", textSw: "Kuwa na mawazo au picha zinazokusumbua kuhusu uzoefu wa trauma wa wateja wako unapojaribu kupumzika au kulala?", cluster: "reexperiencing" },
  { id: "p2", text: "Dreaming about your clients' traumatic stories or feeling like you're reliving their experiences?", textSw: "Kuota ndoto kuhusu hadithi za trauma za wateja wako au kujisikia kama unaishi uzoefu wao tena?", cluster: "reexperiencing" },
  { id: "p3", text: "Feeling suddenly upset or emotionally overwhelmed when reminded of your clients' cases?", textSw: "Kuhisi ghafla kuisika au kuzidiwa kihisia unapokumbushwa kesi za wateja wako?", cluster: "reexperiencing" },
  { id: "p4", text: "Having physical reactions (heart racing, sweating, nausea) when discussing or thinking about traumatic cases?", textSw: "Kuwa na majibu ya kimwili (moyo kupiga, kutoka jasho, kichefuchefu) unapozungumza au kufikiria kesi za trauma?", cluster: "reexperiencing" },

  // AVOIDANCE BEHAVIORS (2 questions)
  { id: "p5", text: "Avoiding certain clients, cases, or work tasks that remind you of traumatic material?", textSw: "Kuepuka wateja fulani, kesi, au kazi zinazokukumbusha nyenzo za trauma?", cluster: "avoidance" },
  { id: "p6", text: "Finding yourself emotionally numb or detached when listening to clients' stories?", textSw: "Kujikuta hujisikii chochote au umekatika kihisia unaposikiliza hadithi za wateja?", cluster: "avoidance" },

  // HYPERAROUSAL AND HYPERVIGILANCE (4 questions)
  { id: "p7", text: "Feeling constantly 'on guard' or hypervigilant, even in safe environments?", textSw: "Kujisikia daima 'tahadhari' au kuwa makini sana, hata katika mazingira salama?", cluster: "hyperarousal" },
  { id: "p8", text: "Having difficulty falling asleep or staying asleep due to work-related worries?", textSw: "Kuwa na shida ya kulala au kuendelea kulala kutokana na wasiwasi wa kazi?", cluster: "hyperarousal" },
  { id: "p9", text: "Feeling easily startled, jumpy, or irritable since taking on trauma-related work?", textSw: "Kujisikia kushangazwa kirahisi, mwepesi wa kuruka, au kukasirika tangu kuanza kazi inayohusiana na trauma?", cluster: "hyperarousal" },
  { id: "p10", text: "Experiencing persistent anxiety or sense of dread about your work or the world?", textSw: "Kuishi na wasiwasi wa kudumu au hisia ya hofu kuhusu kazi yako au dunia?", cluster: "hyperarousal" },

  // AFFECT DYSREGULATION - EMOTIONAL CHANGES (2 questions)
  { id: "p11", text: "Finding it takes longer than usual to calm down after intense client sessions?", textSw: "Kugundua inachukua muda mrefu zaidi ya kawaida kufurahia baada ya vikao vya wateja vikali?", cluster: "affect dysregulation" },
  { id: "p12", text: "Feeling emotionally shut down, unable to cry or express feelings appropriately?", textSw: "Kujisikia kufungwa kihisia, kushindwa kulia au kueleza hisia kwa njia stahiki?", cluster: "affect dysregulation" },

  // WORLDVIEW CHANGES - VICARIOUS TRAUMA INDICATORS (4 questions)
  { id: "p13", text: "Noticing your view of the world has become more negative or dangerous?", textSw: "Kuona mtazamo wako wa dunia umezorota au kuwa hatari zaidi?", cluster: "negative self concept" },
  { id: "p14", text: "Losing trust in people, institutions, or feeling cynical about humanity?", textSw: "Kupoteza imani kwa watu, taasisi, au kujisikia kukaidi kuhusu binadamu?", cluster: "negative self concept" },
  { id: "p15", text: "Questioning your purpose, meaning in work, or feeling your efforts don't matter?", textSw: "Kuuliza kusudi lako, maana ya kazi, au kujisikia juhudi zako hazina maana?", cluster: "negative self concept" },
  { id: "p16", text: "Feeling a sense of hopelessness about the future or your ability to make change?", textSw: "Kujisikia hali ya kukata tamaa kuhusu mustakabali au uwezo wako wa kufanya mabadiliko?", cluster: "negative self concept" },

  // RELATIONSHIP AND BOUNDARY CHANGES (4 questions)
  { id: "p17", text: "Withdrawing from family, friends, or social activities you once enjoyed?", textSw: "Kujitenga na familia, marafiki, au shughuli za kijamii ulizokuwa unazifurahia?", cluster: "disturbed relationships" },
  { id: "p18", text: "Bringing work stress home or having difficulty separating work from personal life?", textSw: "Kubeba stress ya kazi nyumbani au kuwa na shida ya kutenganisha kazi na maisha ya kibinafsi?", cluster: "disturbed relationships" },
  { id: "p19", text: "Noticing changes in your relationships due to over-empathy or emotional unavailability?", textSw: "Kuona mabadiliko katika mahusiano yako kutokana na huruma kupita kiasi au kutoonekana kihisia?", cluster: "disturbed relationships" },
  { id: "p20", text: "Feeling isolated or that others 'don't understand' the burden of your work?", textSw: "Kujisikia kuwa peke yako au kwamba wengine 'hawaelewi' mzigo wa kazi yako?", cluster: "disturbed relationships" }
];

// Educational content for practitioners - Left side content
export const PRACTITIONER_EDUCATION_LEFT = [
  {
    title: "What is Secondary Traumatic Stress?",
    emoji: "🎗️",
    content: "Secondary traumatic stress (also called secondary trauma) is the emotional duress that results when a person hears about or is indirectly exposed to someone else's firsthand traumatic experiences. It can produce PTSD-like symptoms — such as intrusive thoughts, nightmares, avoidance, hyperarousal (feeling constantly on edge), anxiety, or emotional numbness — even though the person did not experience the trauma directly."
  },
  {
    title: "What is Vicarious Trauma?",
    emoji: "💔",
    content: "Vicarious trauma refers to the gradual, cumulative changes that occur in a helper's inner world and worldview after repeated empathic engagement with traumatized people. It goes beyond acute symptoms and can alter fundamental beliefs about safety, trust, justice, power, intimacy, and the goodness of the world. It is sometimes described as the 'emotional residue' or 'cost of caring.'"
  },
  {
    title: "Key Difference: STS vs VT",
    emoji: "⚖️",
    content: "STS: Often more sudden or acute. It mimics PTSD symptoms (re-experiencing, avoidance, hyperarousal) triggered by indirect exposure. VT: Slower and deeper. It focuses on profound shifts in beliefs, meaning, and worldview rather than just classic PTSD symptoms."
  },
  {
    title: "Who is Most at Risk?",
    emoji: "⚠️",
    content: "Anyone regularly exposed to others' trauma stories is at risk: Human Rights Defenders, Victim Advocates, Therapists, Lawyers, Social Workers, First Responders, Journalists, Healthcare Workers. Risk is higher for those with prior trauma, high caseloads, limited support, or insufficient self-care."
  },
  {
    title: "Emotional Symptoms to Watch",
    emoji: "😢",
    content: "Anxiety, fear, sadness, hopelessness, numbness, irritability, survivor guilt, reduced empathy. If these persist for weeks, it's time to seek support."
  },
  {
    title: "Physical & Behavioral Signs",
    emoji: "🏃",
    content: "Sleep problems, fatigue, headaches, weakened immune system. Behavioral: Avoidance of clients, withdrawal from relationships, overwork, substance use, hypervigilance."
  },
  {
    title: "STS vs Burnout vs Compassion Fatigue",
    emoji: "🔥",
    content: "Burnout: General exhaustion from chronic workplace stress. Compassion fatigue: Umbrella term including STS + burnout. Secondary/Vicarious trauma: Specifically linked to indirect trauma exposure."
  },
  {
    title: "Prevention Strategies",
    emoji: "🛡️",
    content: "Regular self-care (exercise, sleep, hobbies), strong boundaries between work and personal life, clinical supervision, balanced caseloads, mindfulness techniques, organizational support and training."
  },
  {
    title: "Treatment is Possible",
    emoji: "💚",
    content: "Highly manageable with awareness and action. Trauma-informed counseling for the helper, peer support groups, grounding techniques, and recognizing it early is a sign of strength."
  },
  {
    title: "When to Seek Help",
    emoji: "🆘",
    content: "Seek professional help if symptoms interfere with daily life, work, relationships, or sleep for more than a few weeks — or if you notice increased substance use, thoughts of harm, or feeling emotionally shut down."
  }
];

// Right side content - Hope and overcoming trauma
export const PRACTITIONER_EDUCATION_RIGHT = [
  {
    title: "Vicarious Resilience",
    emoji: "🌟",
    content: "Many practitioners also experience vicarious resilience — positive growth from witnessing survivors' strength. You can be transformed by witnessing how clients courageously face trauma, creating hope and renewal."
  },
  {
    title: "Types of Trauma Exposure",
    emoji: "📚",
    content: "Direct trauma: Experiencing it yourself. Secondary trauma: Hearing detailed accounts. Vicarious trauma: Cumulative effect over time. It's normal to be affected by your work — this is a recognized occupational hazard."
  },
  {
    title: "Trauma by Authority Figures",
    emoji: "⚡",
    content: "When trauma is inflicted by people in positions of power or trust, the impact is often deeper. This includes institutional betrayal, which complicates healing. Your work helping survivors is invaluable."
  },
  {
    title: "Overcoming Secondary Trauma",
    emoji: "🌈",
    content: "Recovery involves: Acknowledging the impact, seeking support, establishing boundaries, practicing self-compassion, reconnecting with purpose, and sometimes professional therapy. You deserve care too."
  },
  {
    title: "Building Resilience",
    emoji: "💪",
    content: "Resilience isn't about being unaffected — it's about recovering. Key factors: Social support, sense of purpose, self-efficacy, optimism, and self-care practices. You're stronger than you know."
  },
  {
    title: "Hope for Practitioners",
    emoji: "🕊️",
    content: "Remember: You make a difference. Every survivor you support, every story you witness with compassion, every act of justice you pursue — matters. Your wellbeing enables you to continue this vital work."
  },
  {
    title: "Signs of Recovery",
    emoji: "🌱",
    content: "Better sleep, renewed energy, ability to enjoy activities, restored relationships, clearer boundaries, sense of hope returning, and sustainable work-life balance. Recovery is a journey, not a destination."
  },
  {
    title: "Self-Care is Professional Care",
    emoji: "🧘",
    content: "Taking care of yourself isn't selfish — it's essential for effective helping. A depleted helper cannot give sustainably. Your wellbeing is part of your professional responsibility."
  },
  {
    title: "You're Not Alone",
    emoji: "🤝",
    content: "Thousands of practitioners experience this. Peer support groups, supervision, and professional networks exist specifically for this reason. Reach out — the community is here for you."
  },
  {
    title: "Your Work Matters",
    emoji: "⭐",
    content: "Human rights work is among the most important on earth. The cost of caring is real, but so is the impact. You are a beacon of hope in dark situations. Thank you for what you do."
  }
];
