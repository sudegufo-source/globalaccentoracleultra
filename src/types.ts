export interface PhoneticAnalysis {
  vowels: string;
  consonants: string;
  rhythm: string;
  intonation: string;
}

export interface AccentScores {
  [key: string]: number;
}

export interface AnalysisResult {
  transcription: string;
  phoneticAnalysis: PhoneticAnalysis;
  scores: AccentScores;
  topMatch: string;
  confidence: number;
  feedback: string;
}

export interface ImprovementPlan {
  plan: string;
}

export type Goal = 'Student' | 'Call Center' | 'Business Communication' | 'Gaming / Streaming' | 'Online Teaching';
