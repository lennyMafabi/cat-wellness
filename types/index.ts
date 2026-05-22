export type AnswerValue = 0 | 1 | 2 | 3 | 4;

export type AnswerMap = Record<string, AnswerValue>;

export type TrackType = "child" | "youth" | "adult";

export type ClusterName =
  | "reexperiencing"
  | "avoidance"
  | "hyperarousal"
  | "affect dysregulation"
  | "negative self concept"
  | "disturbed relationships";

export type AnalysisResult = {
  riskLevel: "low" | "medium" | "high";
  topCluster: ClusterName | null;
  clusterLevels: Record<ClusterName, "low" | "moderate" | "high">;
  rawScores: Record<ClusterName, number>;
  summary: string;
  recommendations: string[];
};

export type Question = {
  id: string;
  text: string;
  textSw?: string;
  cluster: ClusterName;
};

export type Language = "en" | "sw";

export type UserType = "victim" | "practitioner";
