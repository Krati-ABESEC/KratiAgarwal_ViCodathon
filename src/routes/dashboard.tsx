import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  FileJson,
  FlaskConical,
  MinusCircle,
  Play,
  Repeat2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { Candidate, Curriculum } from "@/lib/interview-types";
import { analyzeCandidate, sampleCandidates, sampleCurriculum, store } from "@/lib/interview-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Interview Dashboard — Adaptive AI Interviewer" },
      {
        name: "description",
        content:
          "Upload curriculum and candidate JSON, review completed modules, skipped topics and learning signals, then start an adaptive AI interview.",
      },
      { property: "og:title", content: "Interview Dashboard — Adaptive AI Interviewer" },
      {
        property: "og:description",
        content: "Review cohort progress signals and launch a personalized AI technical interview.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const curriculumInput = useRef<HTMLInputElement>(null);
  const candidateInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurriculum(store.getCurriculum());
    setCandidate(store.getCandidate());
    setHydrated(true);
  }, []);

  const analysis = useMemo(
    () => (candidate && curriculum ? analyzeCandidate(candidate, curriculum) : null),
    [candidate, curriculum],
  );

  async function handleFile(file: File, kind: "curriculum" | "candidate") {
    try {
      const parsed = JSON.parse(await file.text());
      if (kind === "curriculum") {
        if (!parsed?.days || !parsed?.modules) throw new Error("Missing days/modules");
        setCurriculum(parsed);
        store.setCurriculum(parsed);
        toast.success("Curriculum loaded");
      } else {
        const c: Candidate = parsed.candidates ? parsed.candidates[0] : parsed;
        if (!c?.member || !c?.missions) throw new Error("Missing member/missions");
        setCandidate(c);
        store.setCandidate(c);
        toast.success(`Candidate ${c.member.name} loaded`);
      }
    } catch (e) {
      toast.error(`Invalid JSON: ${e instanceof Error ? e.message : "parse error"}`);
    }
  }

  function loadSamples() {
    setCurriculum(sampleCurriculum);
    store.setCurriculum(sampleCurriculum);
    const first = sampleCandidates[0];
    if (first) {
      setCandidate(first);
      store.setCandidate(first);
    }
    toast.success("Bundled cohort data loaded");
  }

  const ready = Boolean(curriculum && candidate);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Dashboard</p>
          <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">Interview Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Load the cohort curriculum and a candidate profile, review learning signals, then start
            the adaptive interview.
          </p>
        </div>
        <button
          onClick={loadSamples}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm hover:bg-secondary/60"
        >
          <FlaskConical className="size-4 text-accent" /> Load bundled sample data
        </button>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <UploadCard
          title="Curriculum JSON"
          description="curriculum.json — 31 days, 8 modules, tools and objectives."
          loaded={
            curriculum
              ? `${curriculum.cohort} · ${curriculum.days.length} days loaded`
              : hydrated
                ? null
                : "loading"
          }
          onPick={() => curriculumInput.current?.click()}
          inputRef={curriculumInput}
          onFile={(f) => handleFile(f, "curriculum")}
        />
        <UploadCard
          title="Candidate Profile JSON"
          description="candidates.json — member record, missions and learning signals."
          loaded={
            candidate
              ? `${candidate.member.name} · ${candidate.member.jobRole}`
              : hydrated
                ? null
                : "loading"
          }
          onPick={() => candidateInput.current?.click()}
          inputRef={candidateInput}
          onFile={(f) => handleFile(f, "candidate")}
        />
      </div>

      {curriculum && sampleCandidates.length > 0 && (
        <div className="glass mt-4 rounded-2xl p-5">
          <p className="text-sm font-semibold">Or pick a cohort candidate</p>
          <div className="scroll-slim mt-3 flex gap-2 overflow-x-auto pb-1">
            {sampleCandidates.map((c) => (
              <button
                key={c.member.id}
                onClick={() => {
                  setCandidate(c);
                  store.setCandidate(c);
                  toast.success(`${c.member.name} selected`);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
                  candidate?.member.id === c.member.id
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary/60"
                }`}
              >
                {c.member.name} · {c.member.id}
              </button>
            ))}
          </div>
        </div>
      )}

      {!hydrated && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {hydrated && analysis && candidate && curriculum && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Overall progress"
              value={`${analysis.progress}%`}
              bar={analysis.progress}
            />
            <Stat
              label="Curriculum coverage"
              value={`${analysis.coverage}%`}
              bar={analysis.coverage}
            />
            <Stat
              label="First-try rate"
              value={`${analysis.firstTryRate}%`}
              bar={analysis.firstTryRate}
            />
            <Stat
              label="Commit days"
              value={`${candidate.signals.commitDays}/31`}
              bar={Math.round((candidate.signals.commitDays / 31) * 100)}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="glass rounded-2xl p-5 lg:col-span-2">
              <h2 className="font-display text-lg font-semibold">Module completion</h2>
              <div className="mt-4 space-y-3">
                {analysis.moduleStats.map((m) => (
                  <div key={m.module}>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        M{m.module} · {m.title}
                      </span>
                      <span>
                        {m.done}/{m.span} days
                      </span>
                    </div>
                    <Progress value={m.pct} className="mt-1.5 h-2 bg-secondary" />
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h2 className="font-display text-lg font-semibold">Candidate</h2>
              <dl className="mt-4 space-y-2 text-sm">
                {[
                  ["ID", candidate.member.id],
                  ["Role", candidate.member.jobRole],
                  ["Experience", `${candidate.member.yearsExperience} years`],
                  ["Education", candidate.member.education],
                  ["Status", candidate.member.status],
                  ["Avg attempts", `${analysis.avgAttempts}`],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between gap-3 border-b border-border/50 pb-2"
                  >
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <MissionList
              title="Completed missions"
              icon={<CheckCircle2 className="size-4 text-[var(--success)]" />}
              missions={analysis.passed.map(
                (m) => `Day ${m.day} · ${m.title}${m.attempts ? ` (${m.attempts} attempts)` : ""}`,
              )}
            />
            <MissionList
              title="Skipped topics"
              icon={<MinusCircle className="size-4 text-[var(--warning)]" />}
              missions={analysis.skipped.map((m) => `Day ${m.day} · ${m.title}`)}
            />
            <MissionList
              title="Failed / struggled"
              icon={<XCircle className="size-4 text-destructive" />}
              missions={[
                ...analysis.failed.map((m) => `Day ${m.day} · ${m.title} (failed)`),
                ...analysis.struggled.map(
                  (m) => `Day ${m.day} · ${m.title} (${m.attempts} attempts)`,
                ),
              ]}
            />
          </div>
        </>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          disabled={!ready}
          onClick={() => navigate({ to: "/interview" })}
          className="animated-gradient glow-ring inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play className="size-4" /> Start AI Interview
        </button>
        <button
          onClick={() => {
            setCandidate(null);
            setCurriculum(null);
            if (typeof window !== "undefined") window.localStorage.clear();
            toast.success("Dashboard reset");
          }}
          className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm hover:bg-secondary/60"
        >
          <Repeat2 className="size-4" /> Reset
        </button>
        {!ready && (
          <p className="text-xs text-muted-foreground">
            Load both curriculum and candidate JSON to enable the interview.
          </p>
        )}
      </div>
    </div>
  );
}

function UploadCard({
  title,
  description,
  loaded,
  onPick,
  onFile,
  inputRef,
}: {
  title: string;
  description: string;
  loaded: string | null;
  onPick: () => void;
  onFile: (f: File) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-accent">
          <FileJson className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <div className="mt-3 text-xs">
            {loaded === "loading" ? (
              <Skeleton className="h-4 w-40" />
            ) : loaded ? (
              <span className="text-[var(--success)]">✓ {loaded}</span>
            ) : (
              <span className="text-muted-foreground">No file loaded — drag & drop or browse.</span>
            )}
          </div>

          <button
            onClick={onPick}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-medium transition-colors hover:bg-secondary/70"
          >
            <Upload className="size-3.5" /> Choose JSON file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, bar }: { label: string; value: string; bar: number }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display mt-1 text-2xl font-bold text-gradient">{value}</p>
      <Progress value={bar} className="mt-3 h-1.5 bg-secondary" />
    </div>
  );
}

function MissionList({
  title,
  icon,
  missions,
}: {
  title: string;
  icon: React.ReactNode;
  missions: string[];
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {icon} {title}
        <span className="ml-auto text-xs text-muted-foreground">{missions.length}</span>
      </h3>
      <ul className="scroll-slim mt-3 max-h-56 space-y-2 overflow-y-auto pr-1 text-sm text-muted-foreground">
        {missions.length === 0 && <li className="text-xs">None</li>}
        {missions.map((m) => (
          <li key={m} className="rounded-lg bg-secondary/40 px-3 py-2 text-xs">
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}
