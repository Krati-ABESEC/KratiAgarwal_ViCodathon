import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Braces,
  Brain,
  ClipboardCheck,
  Cpu,
  Database,
  Gauge,
  GitBranch,
  LineChart,
  MessagesSquare,
  Network,
  Play,
  Rocket,
  ScanSearch,
  Sparkle,
  Target,
  Timer,
  Workflow,
} from "lucide-react";
import { Particles } from "@/components/app/particles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Adaptive AI Interviewer — Practice Real AI Technical Interviews" },
      {
        name: "description",
        content:
          "Adaptive, curriculum-aware AI technical interviews personalized to your 31-day AI cohort progress, with recruiter-grade feedback reports.",
      },
      { property: "og:title", content: "Adaptive AI Interviewer" },
      {
        property: "og:description",
        content:
          "Practice real AI technical interviews personalized to your learning journey — adaptive questions, context memory, structured feedback.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Target,
    title: "Personalized Interviews",
    body: "Questions are drawn from the exact missions you passed, failed, or skipped.",
  },
  {
    icon: GitBranch,
    title: "Dynamic Follow-up Questions",
    body: "Shallow answers trigger targeted probes on the same concept, not a new script.",
  },
  {
    icon: MessagesSquare,
    title: "Multi-turn Conversations",
    body: "A real back-and-forth interview loop across 8+ adaptive questions.",
  },
  {
    icon: Brain,
    title: "Context Memory",
    body: "The interviewer references earlier answers to test consistency and depth.",
  },
  {
    icon: ClipboardCheck,
    title: "Curriculum-Aware Assessment",
    body: "Every question maps to a specific cohort day, module, and toolchain.",
  },
  {
    icon: Cpu,
    title: "Engineering Decision Evaluation",
    body: "Scored on trade-offs and architecture reasoning, not vocabulary recall.",
  },
  {
    icon: ScanSearch,
    title: "Structured Feedback Report",
    body: "Summary, strengths, gaps and next steps in a strict JSON contract.",
  },
  {
    icon: LineChart,
    title: "Interview Analytics",
    body: "Competency, communication, problem-solving and confidence scoring.",
  },
];

const steps = [
  {
    icon: Braces,
    title: "Upload Profile & Curriculum",
    body: "Drop in candidate.json and curriculum.json — or load the bundled cohort data.",
  },
  {
    icon: Gauge,
    title: "AI Analyzes Progress",
    body: "Missions, attempts, skips and commit signals become an interview strategy.",
  },
  {
    icon: MessagesSquare,
    title: "Conducts Adaptive Interview",
    body: "Eight-plus questions across 4+ curriculum days, adapting to every answer.",
  },
  {
    icon: Rocket,
    title: "Generates Performance Report",
    body: "Scores, coverage, missed concepts and a downloadable PDF report.",
  },
];

const tech = [
  { icon: Database, label: "RAG" },
  { icon: Database, label: "Vector Databases" },
  { icon: Sparkle, label: "Prompt Engineering" },
  { icon: Workflow, label: "Agentic AI" },
  { icon: Network, label: "MCP" },
  { icon: Cpu, label: "Production AI Systems" },
  { icon: Rocket, label: "AI Deployment" },
  { icon: Brain, label: "Modern LLMs" },
];

function Landing() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <Particles />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-accent" />
            AI Cohort · 31 days · 8 modules · adaptive evaluation
          </span>
          <h1 className="font-display mx-auto mt-6 max-w-4xl text-4xl leading-tight font-bold sm:text-6xl">
            Adaptive <span className="text-gradient">AI Interviewer</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Practice Real AI Technical Interviews Personalized to Your Learning Journey.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="animated-gradient glow-ring inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Start Interview <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/interview"
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary/60"
            >
              <Play className="size-4" /> View Demo
            </Link>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { k: "8+", v: "Adaptive questions" },
              { k: "4+", v: "Curriculum days" },
              { k: "5", v: "Scoring dimensions" },
              { k: "1", v: "JSON API contract" },
            ].map((s) => (
              <div key={s.v} className="glass rounded-2xl px-4 py-5">
                <p className="font-display text-2xl font-bold text-gradient">{s.k}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle
          eyebrow="Capabilities"
          title="Built like a real technical interviewer"
          sub="Every feature exists to make the conversation adaptive, contextual, and fair."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass group rounded-2xl p-5 transition-transform hover:-translate-y-1"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-accent transition-colors group-hover:bg-primary/25">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle
          eyebrow="How it works"
          title="From cohort data to hiring-grade signal"
          sub="Four stages, fully automated, driven by your own learning record."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="glass relative rounded-2xl p-6">
              <span className="font-display text-5xl font-bold text-primary/25">0{i + 1}</span>
              <s.icon className="mt-2 size-5 text-accent" />
              <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle
          eyebrow="Technologies"
          title="Covers the full modern AI stack"
          sub="Assessment spans everything the 31-day cohort teaches."
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tech.map((t) => (
            <div
              key={t.label}
              className="glass flex items-center gap-3 rounded-xl px-4 py-4 text-sm transition-colors hover:bg-secondary/40"
            >
              <t.icon className="size-4 text-accent" />
              {t.label}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">
        <div className="glass relative overflow-hidden rounded-3xl px-6 py-12 text-center">
          <Particles count={10} />
          <Timer className="relative mx-auto size-6 text-accent" />
          <h2 className="font-display relative mt-4 text-2xl font-bold sm:text-3xl">
            Ready when you are — the interview takes ~15 minutes
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Load your candidate profile and curriculum, then face an interviewer that already knows
            what you skipped.
          </p>
          <Link
            to="/dashboard"
            className="animated-gradient glow-ring relative mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Open Interview Dashboard <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
      <h2 className="font-display mt-3 text-2xl font-bold sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}
