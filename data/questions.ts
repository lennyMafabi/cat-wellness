import { Question } from "@/types";

// PCL-5 and ITQ-based validated trauma assessment questions
// Scale: 0 = Not at all, 1 = A little bit, 2 = Moderately, 3 = Quite a bit, 4 = Extremely

export const QUESTIONS: Question[] = [
  // RE-EXPERIENCING (4 questions - PCL-5 + ITQ)
  { id: "q1", text: "Repeated, disturbing, and unwanted memories of a stressful experience?", textSw: "Kumbukumbu zinazorudiwa, zinazoisiza, na zisizotarajiwa za tukio la stress?", cluster: "reexperiencing" },
  { id: "q2", text: "Repeated, disturbing dreams that replay part of a stressful experience?", textSw: "Ndoto zinazorudiwa, zinazoisiza zinazoonyesha sehemu ya tukio la stress?", cluster: "reexperiencing" },
  { id: "q3", text: "Suddenly feeling or acting as if a stressful experience were actually happening again (reliving it)?", textSw: "Kujisikia au kutenda ghafla kama tukio la stress linatokea tena (kuishi tena)?", cluster: "reexperiencing" },
  { id: "q4", text: "Feeling very upset when something reminded you of a stressful experience?", textSw: "Kuhisi kuisika sana wakati kitu kinapokukumbusha tukio la stress?", cluster: "reexperiencing" },

  // AVOIDANCE (2 questions - PCL-5 + ITQ)
  { id: "q5", text: "Avoiding memories, thoughts, or feelings related to a stressful experience?", textSw: "Kuepuka kumbukumbu, mawazo, au hisia zinazohusiana na tukio la stress?", cluster: "avoidance" },
  { id: "q6", text: "Avoiding external reminders of a stressful experience (people, places, conversations, situations)?", textSw: "Kuepuka vikumbusho vya nje vya tukio la stress (watu, mahali, mazungumzo, hali)?", cluster: "avoidance" },

  // HYPERAROUSAL (4 questions - PCL-5)
  { id: "q7", text: "Having strong physical reactions when reminded of a stressful experience (heart pounding, trouble breathing, sweating)?", textSw: "Kujisikia kimwili sana unapokumbushwa tukio la stress (moyo kupiga, kushindwa kupumua, kutoka jasho)?", cluster: "hyperarousal" },
  { id: "q8", text: "Being 'superalert', watchful, or on guard?", textSw: "Kuwa 'tahadhari sana', kuangalia, au kuwa ulinzi?", cluster: "hyperarousal" },
  { id: "q9", text: "Feeling jumpy or easily startled?", textSw: "Kujisikia mwepesi wa kuruka au kushangazwa kirahisi?", cluster: "hyperarousal" },
  { id: "q10", text: "Trouble falling or staying asleep?", textSw: "Shida ya kulala au kuendelea kulala?", cluster: "hyperarousal" },

  // AFFECT DYSREGULATION (2 questions - ITQ DSO)
  { id: "q11", text: "When upset, it takes a long time to calm down?", textSw: "Unapoisika, inachukua muda mrefu kufurahia?", cluster: "affect dysregulation" },
  { id: "q12", text: "Feeling numb or emotionally shut down?", textSw: "Kujisikia kama hujisikii kitu au kufungwa kihisia?", cluster: "affect dysregulation" },

  // NEGATIVE SELF-CONCEPT (4 questions - PCL-5 + ITQ DSO)
  { id: "q13", text: "Having strong negative beliefs about yourself, other people, or the world (e.g., 'I am bad', 'no one can be trusted')?", textSw: "Kuwa na imani mbaya sana kuhusu wewe, watu wengine, au dunia (mfano: 'Mimi mbaya', 'hakuna mtu wa kuaminiwa')?", cluster: "negative self concept" },
  { id: "q14", text: "Blaming yourself or someone else for a stressful experience or what happened after it?", textSw: "Kulaumu wewe au mtu mwingine kwa tukio la stress au kilichotokea baadaye?", cluster: "negative self concept" },
  { id: "q15", text: "Feeling like a failure?", textSw: "Kujisikia kama mshindwa?", cluster: "negative self concept" },
  { id: "q16", text: "Feeling worthless?", textSw: "Kujisikia huna thamani?", cluster: "negative self concept" },

  // DISTURBED RELATIONSHIPS (4 questions - PCL-5 + ITQ DSO)
  { id: "q17", text: "Feeling distant or cut off from other people?", textSw: "Kujisikia mbali au kataa na watu wengine?", cluster: "disturbed relationships" },
  { id: "q18", text: "Finding it hard to stay emotionally close to people?", textSw: "Kupata vigumu kuwa karibu kihisia na watu?", cluster: "disturbed relationships" },
  { id: "q19", text: "Trouble experiencing positive feelings (unable to feel happiness or have loving feelings for people close to you)?", textSw: "Shida ya kujisikia hisia chanya (kushindwa kuhisi furaha au kuwa na hisia za upendo kwa watu uliokuwa nao)?", cluster: "disturbed relationships" },
  { id: "q20", text: "Irritable behavior, angry outbursts, or acting aggressively?", textSw: "Tabia ya kukasirika, mlipuko wa hasira, au kuwa kikatili?", cluster: "disturbed relationships" }
];

// Answer options in both languages
export const ANSWER_OPTIONS = {
  en: [
    { value: 0, label: "Not at all", emoji: "○" },
    { value: 1, label: "A little bit", emoji: "◐" },
    { value: 2, label: "Moderately", emoji: "◑" },
    { value: 3, label: "Quite a bit", emoji: "◒" },
    { value: 4, label: "Extremely", emoji: "◉" }
  ],
  sw: [
    { value: 0, label: "Hapana kabisa", emoji: "○" },
    { value: 1, label: "Kidogo tu", emoji: "◐" },
    { value: 2, label: "Wastani", emoji: "◑" },
    { value: 3, label: "Sana", emoji: "◒" },
    { value: 4, label: "Zaidi sana", emoji: "◉" }
  ]
};

// Cluster names in both languages
export const CLUSTER_NAMES = {
  en: {
    reexperiencing: "Re-experiencing",
    avoidance: "Avoidance",
    hyperarousal: "Hyperarousal",
    "affect dysregulation": "Affect Dysregulation",
    "negative self concept": "Negative Self-Concept",
    "disturbed relationships": "Disturbed Relationships"
  },
  sw: {
    reexperiencing: "Kuishi Tukio Tena",
    avoidance: "Kuepuka",
    hyperarousal: "Kutetereka",
    "affect dysregulation": "Udhibiti wa Hisia",
    "negative self concept": "Dhana Mbaya ya Kibinafsi",
    "disturbed relationships": "Mahusiano Yaliyoharibika"
  }
};
