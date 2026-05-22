import { AnswerMap, TrackType, ClusterName, AnalysisResult } from "@/types";
import { QUESTIONS } from "@/data/questions";

export function generateComprehensiveAnalysis(
  answers: AnswerMap,
  track: TrackType,
  language: string
): AnalysisResult {
  // 1. Initialize cluster scores (6 ICD-11 based clusters)
  const scores: Record<ClusterName, number> = {
    "reexperiencing": 0,
    "avoidance": 0,
    "hyperarousal": 0,
    "affect dysregulation": 0,
    "negative self concept": 0,
    "disturbed relationships": 0
  };

  // 2. Aggregate scores (0-4 scale per question)
  for (const question of QUESTIONS) {
    const answer = answers[question.id];
    if (answer !== undefined) {
      scores[question.cluster] += answer as number;
    }
  }

  // 3. Determine cluster levels (PCL-5/ITQ inspired thresholds)
  // Max scores per cluster: Reexp=16, Avoid=8, Hyper=16, AffDys=8, NegSelf=16, DistRel=16
  // Thresholds based on clinical significance (scores indicating >2 on key items)
  const clusterLevels: Record<ClusterName, "low" | "moderate" | "high"> = {
    "reexperiencing": "low",
    "avoidance": "low",
    "hyperarousal": "low",
    "affect dysregulation": "low",
    "negative self concept": "low",
    "disturbed relationships": "low"
  };

  const clusterMaxScores: Record<ClusterName, number> = {
    "reexperiencing": 16,
    "avoidance": 8,
    "hyperarousal": 16,
    "affect dysregulation": 8,
    "negative self concept": 16,
    "disturbed relationships": 16
  };

  const entries = Object.entries(scores) as [ClusterName, number][];
  for (const [cluster, score] of entries) {
    const maxScore = clusterMaxScores[cluster];
    const percentage = score / maxScore;
    
    // Clinical thresholds: <25% low, 25-50% moderate, >50% high
    if (percentage < 0.25) {
      clusterLevels[cluster] = "low";
    } else if (percentage < 0.5) {
      clusterLevels[cluster] = "moderate";
    } else {
      clusterLevels[cluster] = "high";
    }
  }

  // 4. Determine top cluster
  const sortedEntries = Object.entries(scores) as [ClusterName, number][];
  sortedEntries.sort((a, b) => b[1] - a[1]);
  const topCluster = sortedEntries.length ? sortedEntries[0][0] : null;

  // 5. Calculate overall risk (max possible: 80 points)
  const totalScore = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);

  let riskLevel: "low" | "medium" | "high";

  // PCL-5 scoring interpretation adapted
  // 0-20: minimal, 21-40: mild-moderate, 41-60: moderate-severe, 61-80: severe
  if (totalScore <= 20) {
    riskLevel = "low";
  } else if (totalScore <= 45) {
    riskLevel = "medium";
  } else {
    riskLevel = "high";
  }

  // 6. Generate recommendations based on cluster levels
  const recommendations: string[] = [];

  // Re-experiencing recommendations
  if (clusterLevels["reexperiencing"] === "high") {
    recommendations.push("Practice grounding techniques (5-4-3-2-1 senses exercise) when memories intrude");
    recommendations.push("Consider trauma-focused therapy such as EMDR or Trauma-Focused CBT");
  } else if (clusterLevels["reexperiencing"] === "moderate") {
    recommendations.push("When distressing memories arise, focus on your breath and current surroundings");
  }

  // Avoidance recommendations
  if (clusterLevels["avoidance"] === "high") {
    recommendations.push("Gradual exposure to avoided situations with support from a therapist");
    recommendations.push("Practice sitting with uncomfortable feelings for short periods to build tolerance");
  }

  // Hyperarousal recommendations
  if (clusterLevels["hyperarousal"] === "high") {
    recommendations.push("Establish a calming bedtime routine and limit caffeine");
    recommendations.push("Try progressive muscle relaxation or yoga for nervous system regulation");
  } else if (clusterLevels["hyperarousal"] === "moderate") {
    recommendations.push("Practice box breathing: inhale 4 counts, hold, exhale, hold");
  }

  // Affect dysregulation recommendations
  if (clusterLevels["affect dysregulation"] === "high") {
    recommendations.push("Learn emotion regulation skills through Dialectical Behavior Therapy (DBT)");
    recommendations.push("Create a self-soothing kit with sensory comfort items");
  }

  // Negative self-concept recommendations
  if (clusterLevels["negative self concept"] === "high") {
    recommendations.push("Work with a therapist on cognitive restructuring and self-compassion");
    recommendations.push("Practice daily self-affirmations and challenge negative self-talk");
  }

  // Disturbed relationships recommendations
  if (clusterLevels["disturbed relationships"] === "high") {
    recommendations.push("Consider relationship counseling or group therapy to rebuild connection skills");
    recommendations.push("Start with small steps: brief conversations with trusted people");
  }

  // 7. Generate comprehensive summary (SAFE LANGUAGE ONLY - no diagnoses)
  let summary = "";

  if (riskLevel === "low") {
    summary = "Your responses suggest minimal post-traumatic stress symptoms. You appear to be coping well with your experiences.";
  } else if (riskLevel === "medium") {
    summary = "Your responses suggest mild to moderate post-traumatic stress symptoms. Some areas of your life may be impacted by your experiences.";
  } else {
    summary = "Your responses suggest significant post-traumatic stress symptoms. Multiple areas of your life appear to be affected by your experiences.";
  }

  // Add cluster-specific insights (safe language)
  const clusterInsights: string[] = [];
  if (clusterLevels["reexperiencing"] !== "low") {
    clusterInsights.push("intrusive memories or flashbacks");
  }
  if (clusterLevels["avoidance"] !== "low") {
    clusterInsights.push("avoidance of trauma reminders");
  }
  if (clusterLevels["hyperarousal"] !== "low") {
    clusterInsights.push("heightened alertness or reactivity");
  }
  if (clusterLevels["affect dysregulation"] !== "low") {
    clusterInsights.push("difficulty managing intense emotions");
  }
  if (clusterLevels["negative self concept"] !== "low") {
    clusterInsights.push("negative beliefs about yourself");
  }
  if (clusterLevels["disturbed relationships"] !== "low") {
    clusterInsights.push("challenges in close relationships");
  }

  if (clusterInsights.length > 0) {
    summary += ` You indicated challenges related to ${clusterInsights.join(", ")}.`;
  }

  // Include track-specific context
  if (track === "child") {
    summary += " Speaking with a trusted adult or counselor can help you process these feelings.";
  } else if (track === "youth") {
    summary += " Many young people find that talking with a counselor or trusted adult helps them work through difficult experiences.";
  } else {
    summary += " Consider speaking with a mental health professional who can provide personalized support.";
  }

  // 8. RETURN STRUCTURE
  return {
    riskLevel,
    topCluster,
    clusterLevels,
    rawScores: scores,
    summary,
    recommendations
  };
}
