import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  BrainCircuit,
  Send,
  SkipForward,
  Square,
  RotateCcw,
  Timer as TimerIcon,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { Candidate, ChatMessage, Curriculum, InterviewResponse } from "@/lib/interview-types";
import { newSessionId, sampleCurriculum, store } from "@/lib/interview-store";

export const Route = createFileRoute("/interview")({
  head: () => ({
    meta: [
      { title: "Live AI Interview — Adaptive AI Interviewer" },
      {
        name: "description",
        content:
          "A multi-turn adaptive AI technical interview with progress tracking, difficulty badges, timer and curriculum topic coverage.",
      },
      { property: "og:title", content: "Live AI Interview — Adaptive AI Interviewer" },
      {
        property: "og:description",
        content: "Multi-turn adaptive interview with context memory and curriculum awareness.",
      },
    ],
  }),
  component: InterviewPage,
});

function InterviewPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [meta, setMeta] = useState<InterviewResponse["meta"] | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCandidate(store.getCandidate());
    setCurriculum(store.getCurriculum() ?? sampleCurriculum);
    setSessionId(newSessionId());
  }, []);

  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, done]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading && !done) textareaRef.current?.focus();
  }, [loading, done, started]);

  const post = useCallback(
    async (body: Record<string, unknown>) => {
      setLoading(true);
      try {
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, ...body }),
        });
        const data = (await res.json()) as InterviewResponse & { error?: string };
        if (!res.ok) {
          toast.error(
            res.status === 429
              ? "Rate limited — please retry in a moment."
              : res.status === 402
                ? "AI credits exhausted — add credits to continue."
                : (data.error ?? "Interview request failed"),
          );
          return null;
        }
        setMessages((m) => [...m, { role: "assistant", content: data.reply, ts: Date.now() }]);
        if (data.meta) setMeta(data.meta);
        if (data.done && data.feedback) {
          setDone(true);
          store.setReport({
            feedback: data.feedback,
            candidateName: candidate?.member.name ?? "Candidate",
            at: Date.now(),
          });
          toast.success("Interview complete — report ready");
        }
        return data;
      } catch {
        toast.error("Network error contacting the interview agent");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [sessionId, candidate],
  );

  useEffect(() => {
    if (messages.length > 0) store.setTranscript(messages);
  }, [messages]);

  async function start() {
    if (!sessionId) return;
    setStarted(true);
    setMessages([]);
    setDone(false);
    setSeconds(0);
    await post({ candidate, curriculum });
  }

  async function send(text?: string) {
    const value = (text ?? input).trim();
    if (!value || loading || done) return;
    setMessages((m) => [...m, { role: "user", content: value, ts: Date.now() }]);
    setInput("");
    await post({ message: value });
  }

  function restart() {
    setSessionId(newSessionId());
    setMessages([]);
    setMeta(null);
    setDone(false);
    setStarted(false);
    setSeconds(0);
  }

  const qNumber = meta?.questionNumber ?? 0;
  const total = meta?.totalQuestions ?? 8;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="glass flex h-[74vh] min-h-[540px] flex-col overflow-hidden rounded-3xl">
          <header className="flex flex-wrap items-center gap-3 border-b border-border/60 px-5 py-4">
            <span className="animated-gradient flex size-9 items-center justify-center rounded-xl">
              <Bot className="size-5 text-primary-foreground" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">AI Technical Interviewer</p>
              <p className="text-xs text-muted-foreground">
                {candidate ? `Interviewing ${candidate.member.name}` : "Demo mode · generic cohort"}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs">
              <span className="rounded-full bg-secondary px-3 py-1">
                Question {Math.max(qNumber, started ? 1 : 0)} of {total}
              </span>
              <span
                className={`rounded-full px-3 py-1 font-medium ${
                  meta?.difficulty === "Hard"
                    ? "bg-destructive/20 text-destructive"
                    : meta?.difficulty === "Easy"
                      ? "bg-[var(--success)]/20 text-[var(--success)]"
                      : "bg-primary/20 text-accent"
                }`}
              >
                {meta?.difficulty ?? "Medium"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 tabular-nums">
                <TimerIcon className="size-3.5" /> {mm}:{ss}
              </span>
            </div>
          </header>

          <Progress
            value={(Math.min(qNumber, total) / total) * 100}
            className="h-1 rounded-none bg-secondary"
          />

          <div ref={scrollRef} className="scroll-slim flex-1 space-y-4 overflow-y-auto px-5 py-6">
            {!started && (
              <div className="mx-auto max-w-md py-16 text-center">
                <BrainCircuit className="mx-auto size-10 text-accent" />
                <h2 className="font-display mt-4 text-xl font-semibold">
                  Ready for your adaptive interview
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {candidate
                    ? `${candidate.member.name}'s missions, skips and attempt counts will shape all ${total} questions.`
                    : "No candidate loaded — the interviewer will run a generic cohort interview. Load a profile on the dashboard for a personalized session."}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={start}
                    className="animated-gradient glow-ring rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    Begin interview
                  </button>
                  <Link
                    to="/dashboard"
                    className="rounded-full bg-secondary px-5 py-3 text-sm font-semibold hover:bg-secondary/70"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={`${m.ts}-${i}`}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-accent">
                    <Bot className="size-4" />
                  </span>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-foreground"
                  }`}
                >
                  <div className="prose-sm space-y-2 [&_code]:rounded [&_code]:bg-background/40 [&_code]:px-1 [&_strong]:font-semibold">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
                {m.role === "user" && (
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <User className="size-4" />
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-accent">
                  <Bot className="size-4" />
                </span>
                <div className="w-64 space-y-2 rounded-2xl bg-secondary/50 px-4 py-3">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-52" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            )}

            {done && (
              <div className="glass rounded-2xl p-5 text-center">
                <p className="text-sm font-semibold">Interview completed</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your comprehensive feedback report has been generated.
                </p>
                <button
                  onClick={() => navigate({ to: "/report" })}
                  className="animated-gradient mt-4 rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground"
                >
                  View feedback report
                </button>
              </div>
            )}
          </div>

          <footer className="border-t border-border/60 p-4">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={2}
                value={input}
                disabled={!started || done || loading}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder={
                  done
                    ? "Interview finished."
                    : started
                      ? "Type your answer… (Enter to send)"
                      : "Start the interview to answer."
                }
                className="scroll-slim min-h-[52px] flex-1 resize-none rounded-2xl border border-input bg-background/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <button
                onClick={() => void send()}
                disabled={!started || done || loading || !input.trim()}
                className="animated-gradient glow-ring flex size-11 items-center justify-center rounded-xl text-primary-foreground disabled:opacity-40"
                aria-label="Send answer"
              >
                <Send className="size-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => void send("I'd like to move on to the next question please.")}
                disabled={!started || done || loading}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 hover:bg-secondary/70 disabled:opacity-40"
              >
                <SkipForward className="size-3.5" /> Next Question
              </button>
              <button
                onClick={() =>
                  void send("Please end the interview here and give me my final feedback.")
                }
                disabled={!started || done || loading}
                className="inline-flex items-center gap-1.5 rounded-full bg-destructive/20 px-3 py-1.5 text-destructive hover:bg-destructive/30 disabled:opacity-40"
              >
                <Square className="size-3.5" /> End Interview
              </button>
              <button
                onClick={restart}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 hover:bg-secondary/70"
              >
                <RotateCcw className="size-3.5" /> Restart
              </button>
            </div>
          </footer>
        </section>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
              Context memory
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="relative flex size-3">
                <span className="absolute inline-flex size-3 animate-ping rounded-full bg-accent/60" />
                <span className="relative inline-flex size-3 rounded-full bg-accent" />
              </span>
              <p className="text-sm">
                {meta?.contextTurns ?? 0} turns retained · session {sessionId.slice(0, 12)}
              </p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              The interviewer references earlier answers and adapts difficulty per turn.
            </p>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
              Curriculum topics covered
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(meta?.daysCovered ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground">No topics covered yet.</p>
              )}
              {(meta?.daysCovered ?? []).map((d) => {
                const day = curriculum?.days.find((x) => x.day === d);
                return (
                  <span
                    key={d}
                    className="rounded-full bg-secondary px-3 py-1 text-xs"
                    title={day?.title}
                  >
                    Day {d} · {day?.title.slice(0, 22) ?? "Topic"}
                  </span>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Target: 4+ distinct curriculum days across the session.
            </p>
          </div>

          {candidate && (
            <div className="glass rounded-2xl p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
                Candidate focus
              </p>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                {candidate.missions
                  .filter((m) => m.skipped || m.passed === false || (m.attempts ?? 1) >= 3)
                  .slice(0, 6)
                  .map((m) => (
                    <li key={m.day} className="rounded-lg bg-secondary/40 px-3 py-2">
                      Day {m.day} · {m.title}{" "}
                      <span className="text-[var(--warning)]">
                        {m.skipped ? "skipped" : m.passed === false ? "failed" : `${m.attempts}x`}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
