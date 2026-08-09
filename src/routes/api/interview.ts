import { createFileRoute } from "@tanstack/react-router";
import { callGemini } from "@/lib/gemini.server";
import type { Candidate, Curriculum, Difficulty, Feedback } from "@/lib/interview-types";
import defaultCurriculum from "@/data/curriculum.json";

const MODEL = "gemini-3.6-flash";
const TOTAL_QUESTIONS = 8;

type Turn = { role: "assistant" | "user"; content: string };

type Session = {
  id: string;
  candidate: Candidate | null;
  curriculum: Curriculum;
  turns: Turn[];
  asked: number;
  daysCovered: number[];
  topics: string[];
  difficulty: Difficulty;
  createdAt: number;
  done: boolean;
};

type LogEntry = {
  ts: number;
  sessionId: string;
  kind: "start" | "turn" | "end" | "error";
  detail: string;
};

const g = globalThis as unknown as {
  __interviewSessions?: Map<string, Session>;
  __interviewLogs?: LogEntry[];
};
const sessions = (g.__interviewSessions ??= new Map<string, Session>());
const logs = (g.__interviewLogs ??= []);

function log(entry: LogEntry) {
  logs.unshift(entry);
  if (logs.length > 60) logs.pop();
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function parseJson<T>(text: string): T | null {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

function profileBrief(candidate: Candidate | null, curriculum: Curriculum) {
  if (!candidate) return "No candidate profile supplied. Interview generically on the cohort.";
  const passed = candidate.missions.filter((m) => m.passed);
  const skipped = candidate.missions.filter((m) => m.skipped);
  const failed = candidate.missions.filter((m) => m.passed === false);
  const struggled = passed.filter((m) => (m.attempts ?? 1) >= 3);
  const dayInfo = (d: number) => {
    const day = curriculum.days.find((x) => x.day === d);
    return day ? `Day ${d} ${day.title} [${day.tools.slice(0, 4).join(", ")}]` : `Day ${d}`;
  };
  return [
    `Name: ${candidate.member.name} | Role: ${candidate.member.jobRole} | ${candidate.member.yearsExperience} yrs exp | ${candidate.member.education}`,
    `Signals: commitDays=${candidate.signals.commitDays}, missionsCompleted=${candidate.signals.missionsCompleted}, firstTry=${candidate.signals.missionsFirstTry}`,
    `PASSED cleanly (1-2 attempts): ${passed
      .filter((m) => (m.attempts ?? 1) < 3)
      .map((m) => dayInfo(m.day))
      .join("; ")}`,
    `PASSED with struggle (3+ attempts): ${struggled.map((m) => `${dayInfo(m.day)} (${m.attempts} attempts)`).join("; ") || "none"}`,
    `FAILED: ${failed.map((m) => dayInfo(m.day)).join("; ") || "none"}`,
    `SKIPPED: ${skipped.map((m) => dayInfo(m.day)).join("; ") || "none"}`,
    `Curriculum modules: ${curriculum.modules.map((m) => `M${m.n} ${m.title} (days ${m.days[0]}-${m.days[1]})`).join("; ")}`,
  ].join("\n");
}

function systemPrompt(session: Session) {
  return `You are a senior AI engineering interviewer conducting a live, adaptive technical interview for a graduate of the "${session.curriculum.cohort}".

CANDIDATE DOSSIER
${profileBrief(session.candidate, session.curriculum)}

INTERVIEW RULES
- Conduct exactly ${TOTAL_QUESTIONS} main questions, spanning at least 4 different curriculum days/topics.
- Personalize: probe deeply on skipped and failed topics, validate depth on high-attempt topics, and stretch on cleanly passed topics.
- Ask intelligent follow-ups that react to the specific content of the candidate's last answer; never restate a scripted script.
- Evaluate conceptual understanding, engineering trade-off decisions, and practical reasoning (not trivia).
- Reference earlier answers when relevant to show memory of the conversation.
- Keep each turn short (max 120 words): one brief reaction to their answer, then ONE clear question.
- Adapt difficulty: raise it after strong answers, lower and scaffold after weak answers.
- Topics already covered so far: ${session.topics.join(", ") || "none yet"}.

OUTPUT FORMAT — reply with pure JSON only, no markdown fences:
{"reply":"<your interviewer turn>","difficulty":"Easy|Medium|Hard","topic":"<short topic name>","day":<curriculum day number>}`;
}

const feedbackPrompt = `The interview is over. Score the candidate rigorously and produce a recruiter-grade report.
Reply with pure JSON only, no markdown fences, using this exact shape:
{
 "summary":"3-4 sentence overall assessment",
 "strengths":["..."],
 "gaps":["..."],
 "next":["..."],
 "scores":{"overall":0-100,"technical":0-100,"communication":0-100,"problemSolving":0-100,"confidence":0-100},
 "missedConcepts":["..."],
 "revisionTopics":["..."],
 "coverage":[{"day":7,"topic":"Embeddings","score":0-100}],
 "interviewerSummary":"a candid 2-3 sentence note an interviewer would leave for the hiring panel"
}
Every array should hold 3-5 concise, actionable items. Base every claim on what the candidate actually said.`;

async function callModel(system: string, turns: Turn[]) {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
  return callGemini(apiKey, MODEL, system, turns);
}

export const Route = createFileRoute("/api/interview")({
  server: {
    handlers: {
      GET: async () =>
        json({
          status: "ok",
          endpoint: "POST /api/interview",
          activeSessions: sessions.size,
          logs: logs.slice(0, 20),
        }),
      POST: async ({ request }) => {
        let body: {
          sessionId?: string;
          candidate?: Candidate;
          curriculum?: Curriculum;
          message?: string;
        };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }
        const sessionId = body.sessionId;
        if (!sessionId) return json({ error: "sessionId is required" }, 400);

        let session = sessions.get(sessionId);
        const isStart = !session || Boolean(body.candidate && !body.message);

        try {
          if (isStart) {
            session = {
              id: sessionId,
              candidate: body.candidate ?? session?.candidate ?? null,
              curriculum: (body.curriculum ??
                session?.curriculum ??
                (defaultCurriculum as unknown as Curriculum)) as Curriculum,
              turns: [],
              asked: 0,
              daysCovered: [],
              topics: [],
              difficulty: "Medium",
              createdAt: Date.now(),
              done: false,
            };
            sessions.set(sessionId, session);
            log({ ts: Date.now(), sessionId, kind: "start", detail: "session initialized" });

            const raw = await callModel(systemPrompt(session), [
              {
                role: "user",
                content:
                  "Begin the interview. Greet the candidate by first name in one line, set expectations (8 questions, adaptive), then ask question 1 tailored to their weakest or skipped area.",
              },
            ]);
            const parsed = parseJson<{
              reply: string;
              difficulty: Difficulty;
              topic: string;
              day: number;
            }>(raw);
            const reply = parsed?.reply ?? raw;
            session.asked = 1;
            session.difficulty = parsed?.difficulty ?? "Medium";
            if (parsed?.topic) session.topics.push(parsed.topic);
            if (parsed?.day) session.daysCovered.push(parsed.day);
            session.turns.push({ role: "assistant", content: reply });

            return json({
              reply,
              done: false,
              meta: {
                questionNumber: session.asked,
                totalQuestions: TOTAL_QUESTIONS,
                difficulty: session.difficulty,
                topic: parsed?.topic ?? "Warm-up",
                daysCovered: session.daysCovered,
                contextTurns: session.turns.length,
              },
            });
          }

          if (!session) return json({ error: "Unknown sessionId" }, 404);
          const message = (body.message ?? "").trim();
          if (!message) return json({ error: "message is required" }, 400);
          session.turns.push({ role: "user", content: message });

          if (session.asked >= TOTAL_QUESTIONS) {
            const raw = await callModel(systemPrompt(session) + "\n\n" + feedbackPrompt, [
              ...session.turns,
              { role: "user", content: "Produce the final structured feedback JSON now." },
            ]);
            const feedback =
              parseJson<Feedback>(raw) ??
              ({
                summary: raw.slice(0, 600),
                strengths: [],
                gaps: [],
                next: [],
              } as Feedback);
            session.done = true;
            log({ ts: Date.now(), sessionId, kind: "end", detail: "interview completed" });
            return json({
              reply: "Interview completed.",
              done: true,
              feedback,
              meta: {
                questionNumber: TOTAL_QUESTIONS,
                totalQuestions: TOTAL_QUESTIONS,
                difficulty: session.difficulty,
                topic: "Wrap-up",
                daysCovered: session.daysCovered,
                contextTurns: session.turns.length,
              },
            });
          }

          const raw = await callModel(systemPrompt(session), [
            ...session.turns,
            {
              role: "user",
              content: `(system) You have asked ${session.asked} of ${TOTAL_QUESTIONS} questions. React briefly to the answer above, then ask the next question. If the previous answer was shallow or evasive, ask a targeted follow-up on the SAME topic; otherwise move to a new curriculum day not in [${session.daysCovered.join(", ")}].`,
            },
          ]);
          const parsed = parseJson<{
            reply: string;
            difficulty: Difficulty;
            topic: string;
            day: number;
          }>(raw);
          const reply = parsed?.reply ?? raw;
          session.asked += 1;
          session.difficulty = parsed?.difficulty ?? session.difficulty;
          if (parsed?.topic && !session.topics.includes(parsed.topic))
            session.topics.push(parsed.topic);
          if (parsed?.day && !session.daysCovered.includes(parsed.day))
            session.daysCovered.push(parsed.day);
          session.turns.push({ role: "assistant", content: reply });
          log({
            ts: Date.now(),
            sessionId,
            kind: "turn",
            detail: `Q${session.asked} · ${parsed?.topic ?? "topic"} · ${session.difficulty}`,
          });

          return json({
            reply,
            done: false,
            meta: {
              questionNumber: session.asked,
              totalQuestions: TOTAL_QUESTIONS,
              difficulty: session.difficulty,
              topic: parsed?.topic ?? "Adaptive",
              daysCovered: session.daysCovered,
              contextTurns: session.turns.length,
            },
          });
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Unknown error";
          log({ ts: Date.now(), sessionId, kind: "error", detail: msg });
          const status = msg.includes("429") ? 429 : msg.includes("402") ? 402 : 500;
          return json({ error: msg }, status);
        }
      },
    },
  },
});
