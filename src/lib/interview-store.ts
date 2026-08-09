import type { Candidate, Curriculum, Feedback, ChatMessage } from "./interview-types";
import defaultCurriculum from "@/data/curriculum.json";
import defaultCandidates from "@/data/candidates.json";

const KEYS = {
  curriculum: "aai.curriculum",
  candidate: "aai.candidate",
  report: "aai.report",
  transcript: "aai.transcript",
};

export const sampleCurriculum = defaultCurriculum as unknown as Curriculum;
export const sampleCandidates = (defaultCandidates as unknown as { candidates: Candidate[] })
  .candidates;

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getCurriculum: () => read<Curriculum>(KEYS.curriculum),
  setCurriculum: (c: Curriculum) => write(KEYS.curriculum, c),
  getCandidate: () => read<Candidate>(KEYS.candidate),
  setCandidate: (c: Candidate) => write(KEYS.candidate, c),
  getReport: () => read<{ feedback: Feedback; candidateName: string; at: number }>(KEYS.report),
  setReport: (r: { feedback: Feedback; candidateName: string; at: number }) =>
    write(KEYS.report, r),
  getTranscript: () => read<ChatMessage[]>(KEYS.transcript),
  setTranscript: (t: ChatMessage[]) => write(KEYS.transcript, t),
};

export function analyzeCandidate(candidate: Candidate, curriculum: Curriculum) {
  const missions = candidate.missions;
  const passed = missions.filter((m) => m.passed);
  const failed = missions.filter((m) => m.passed === false);
  const skipped = missions.filter((m) => m.skipped);
  const struggled = passed.filter((m) => (m.attempts ?? 1) >= 3);
  const totalDays = curriculum.days.length;
  const progress = Math.round((passed.length / Math.max(missions.length, 1)) * 100);
  const coverage = Math.round((missions.length / Math.max(totalDays, 1)) * 100);
  const firstTryRate = Math.round(
    (candidate.signals.missionsFirstTry / Math.max(candidate.signals.missionsCompleted, 1)) * 100,
  );
  const moduleStats = curriculum.modules.map((mod) => {
    const from = mod.days[0] ?? 0;
    const to = mod.days[1] ?? 0;
    const inRange = missions.filter((m) => m.day >= from && m.day <= to);
    const done = inRange.filter((m) => m.passed).length;
    const span = to - from + 1;
    return {
      module: mod.n,
      title: mod.title,
      done,
      span,
      pct: Math.round((done / span) * 100),
    };
  });
  return {
    passed,
    failed,
    skipped,
    struggled,
    progress,
    coverage,
    firstTryRate,
    moduleStats,
    avgAttempts:
      Math.round(
        (passed.reduce((a, m) => a + (m.attempts ?? 1), 0) / Math.max(passed.length, 1)) * 10,
      ) / 10,
  };
}

export function newSessionId() {
  return `sess-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}
