import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, RefreshCcw, ScrollText, Server } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin & API — Adaptive AI Interviewer" },
      {
        name: "description",
        content:
          "Endpoint status, request/response JSON contract preview, API health indicator and live interview logs for the interview agent.",
      },
      { property: "og:title", content: "Admin & API — Adaptive AI Interviewer" },
      {
        property: "og:description",
        content: "Monitor the POST /api/interview endpoint, contract and interview logs.",
      },
    ],
  }),
  component: AdminPage,
});

type Health = {
  status: string;
  endpoint: string;
  activeSessions: number;
  logs: { ts: number; sessionId: string; kind: string; detail: string }[];
};

const requestSample = `POST /api/interview

{
  "sessionId": "abc-123",
  "candidate": { ...candidate.json }
}`;

const responseSample = `{
  "reply": "Welcome. Let's begin your interview.",
  "done": false
}`;

const finalSample = `{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "...",
    "strengths": [],
    "gaps": [],
    "next": []
  }
}`;

function AdminPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/interview");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setHealth((await res.json()) as Health);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "unreachable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 15000);
    return () => clearInterval(t);
  }, []);

  const healthy = !error && health?.status === "ok";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Admin / API
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">Endpoint console</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Contract, health and live logs for the required interview endpoint.
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm hover:bg-secondary/60"
        >
          <RefreshCcw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Server className="size-4" /> Required endpoint
          </p>
          <p className="mt-2 font-mono text-sm">POST /api/interview</p>
          <p className="mt-1 text-xs text-muted-foreground">No authentication required</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="size-4" /> API health
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
            <span
              className={`size-2.5 rounded-full ${healthy ? "animate-pulse bg-[var(--success)]" : "bg-destructive"}`}
            />
            {healthy ? "Operational" : (error ?? "Checking…")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Polled every 15s</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ScrollText className="size-4" /> Active sessions
          </p>
          <p className="font-display mt-2 text-2xl font-bold text-gradient">
            {health?.activeSessions ?? 0}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">In-memory, session-scoped state</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <CodeCard title="Request — start interview" code={requestSample} />
        <CodeCard title="Response — conversation turn" code={responseSample} />
        <CodeCard title="Response — completion" code={finalSample} />
      </div>

      <div className="glass mt-4 rounded-2xl p-5">
        <h2 className="font-display text-lg font-semibold">Interview logs</h2>
        <div className="scroll-slim mt-3 max-h-80 space-y-2 overflow-y-auto font-mono text-xs">
          {(health?.logs ?? []).length === 0 && (
            <p className="text-muted-foreground">No activity recorded yet.</p>
          )}
          {(health?.logs ?? []).map((l, i) => (
            <div
              key={`${l.ts}-${i}`}
              className="flex flex-wrap items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2"
            >
              <span className="text-muted-foreground">{new Date(l.ts).toLocaleTimeString()}</span>
              <span
                className={`rounded-full px-2 py-0.5 ${
                  l.kind === "error"
                    ? "bg-destructive/20 text-destructive"
                    : l.kind === "end"
                      ? "bg-[var(--success)]/20 text-[var(--success)]"
                      : "bg-primary/20 text-accent"
                }`}
              >
                {l.kind}
              </span>
              <span className="text-muted-foreground">{l.sessionId.slice(0, 14)}</span>
              <span className="min-w-0 flex-1 truncate">{l.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CodeCard({ title, code }: { title: string; code: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <pre className="scroll-slim mt-3 overflow-x-auto rounded-xl bg-background/60 p-4 font-mono text-xs text-muted-foreground">
        {code}
      </pre>
    </div>
  );
}
