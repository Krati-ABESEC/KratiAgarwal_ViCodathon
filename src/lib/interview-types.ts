export type Mission = {
  day: number;
  title: string;
  passed?: boolean;
  skipped?: boolean;
  attempts?: number;
};

export type CandidateMember = {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
};

export type Candidate = {
  member: CandidateMember;
  missions: Mission[];
  signals: { commitDays: number; missionsCompleted: number; missionsFirstTry: number };
};

export type CurriculumDay = {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
};

export type Curriculum = {
  cohort: string;
  modules: { n: number; title: string; days: number[] }[];
  days: CurriculumDay[];
};

export type Difficulty = "Easy" | "Medium" | "Hard";

export type Feedback = {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
  scores?: {
    overall: number;
    technical: number;
    communication: number;
    problemSolving: number;
    confidence: number;
  };
  missedConcepts?: string[];
  revisionTopics?: string[];
  coverage?: { day: number; topic: string; score: number }[];
  interviewerSummary?: string;
};

export type InterviewResponse = {
  reply: string;
  done: boolean;
  feedback?: Feedback;
  meta?: {
    questionNumber: number;
    totalQuestions: number;
    difficulty: Difficulty;
    topic: string;
    daysCovered: number[];
    contextTurns: number;
  };
};

export type ChatMessage = { role: "assistant" | "user"; content: string; ts: number };
