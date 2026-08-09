import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookMarked,
  Download,
  Lightbulb,
  Quote,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { Feedback } from "@/lib/interview-types";
import { store } from "@/lib/interview-store";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Feedback Report — Adaptive AI Interviewer" },
      {
        name: "description",
        content:
          "Comprehensive interview feedback: competency scores, curriculum coverage, strengths, gaps, missed concepts and personalized learning recommendations.",
      },
      { property: "og:title", content: "Feedback Report — Adaptive AI Interviewer" },
      {
        property: "og:description",
        content: "Recruiter-grade AI interview scorecard with personalized learning next steps.",
      },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const [hydrated, setHydrated] = useState(false);
  const [report, setReport] = useState<{
    feedback: Feedback;
    candidateName: string;
    at: number;
  } | null>(null);

  useEffect(() => {
    setReport(store.getReport());
    setHydrated(true);
  }, []);

  async function downloadPdf() {
    if (!report) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    let y = margin;
    const width = doc.internal.pageSize.getWidth() - margin * 2;

    const line = (text: string, size = 11, bold = false, gap = 6) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, width) as string[];
      for (const l of lines) {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(l, margin, y);
        y += size + 3;
      }
      y += gap;
    };

    line("Adaptive AI Interviewer — Feedback Report", 18, true);
    line(
      `Candidate: ${report.candidateName}   ·   ${new Date(report.at).toLocaleString()}`,
      10,
      false,
      12,
    );
    const s = report.feedback.scores;
    if (s) {
      line(
        `Overall ${s.overall} · Technical ${s.technical} · Communication ${s.communication} · Problem-solving ${s.problemSolving} · Confidence ${s.confidence}`,
        11,
        true,
      );
    }
    line("Summary", 13, true, 2);
    line(report.feedback.summary);
    const section = (title: string, items?: string[]) => {
      if (!items?.length) return;
      line(title, 13, true, 2);
      items.forEach((i) => line(`•  ${i}`, 11, false, 2));
      y += 4;
    };
    section("Strengths", report.feedback.strengths);
    section("Gaps", report.feedback.gaps);
    section("Missed concepts", report.feedback.missedConcepts);
    section("Recommended next steps", report.feedback.next);
    section("Suggested revision topics", report.feedback.revisionTopics);
    if (report.feedback.interviewerSummary) {
      line("Interviewer note", 13, true, 2);
      line(report.feedback.interviewerSummary);
    }
    doc.save(`interview-report-${report.candidateName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    toast.success("PDF downloaded");
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-10 sm:px-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <Sparkles className="mx-auto size-8 text-accent" />
        <h1 className="font-display mt-4 text-2xl font-bold">No report yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete an interview and your comprehensive feedback dashboard will appear here.
        </p>
        <Link
          to="/interview"
          className="animated-gradient glow-ring mt-6 inline-block rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Go to interview
        </Link>
      </div>
    );
  }

  const f = report.feedback;
  const scores = f.scores ?? {
    overall: 0,
    technical: 0,
    communication: 0,
    problemSolving: 0,
    confidence: 0,
  };
  const radarData = [
    { dim: "Technical", value: scores.technical },
    { dim: "Communication", value: scores.communication },
    { dim: "Problem solving", value: scores.problemSolving },
    { dim: "Confidence", value: scores.confidence },
    { dim: "Overall", value: scores.overall },
  ];
  const coverage = (f.coverage ?? []).map((c) => ({
    name: `D${c.day}`,
    topic: c.topic,
    score: c.score,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Feedback report
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">
            {report.candidateName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generated {new Date(report.at).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => void downloadPdf()}
          className="animated-gradient glow-ring inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          <Download className="size-4" /> Download PDF
        </button>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <ScoreCard label="Overall score" value={scores.overall} highlight />
        <ScoreCard label="Technical competency" value={scores.technical} />
        <ScoreCard label="Communication" value={scores.communication} />
        <ScoreCard label="Problem solving" value={scores.problemSolving} />
        <ScoreCard label="Confidence" value={scores.confidence} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Competency profile</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="dim"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <Radar
                  dataKey="value"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Curriculum coverage</h2>
          {coverage.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No per-topic coverage was returned for this session.
            </p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coverage}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--foreground)",
                    }}
                    formatter={(v, _n, p) => [`${v}`, (p?.payload as { topic: string })?.topic]}
                  />
                  <Bar dataKey="score" fill="var(--cyan)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="glass mt-4 rounded-2xl p-6">
        <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
          <Quote className="size-4 text-accent" /> AI interviewer summary
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.summary}</p>
        {f.interviewerSummary && (
          <p className="mt-4 rounded-xl border-l-2 border-accent bg-secondary/40 px-4 py-3 text-sm italic">
            {f.interviewerSummary}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ListCard
          title="Strengths"
          icon={<ThumbsUp className="size-4 text-[var(--success)]" />}
          items={f.strengths}
        />
        <ListCard
          title="Weaknesses & gaps"
          icon={<AlertTriangle className="size-4 text-[var(--warning)]" />}
          items={f.gaps}
        />
        <ListCard
          title="Missed concepts"
          icon={<BookMarked className="size-4 text-destructive" />}
          items={f.missedConcepts ?? []}
        />
        <ListCard
          title="Learning recommendations"
          icon={<Lightbulb className="size-4 text-accent" />}
          items={f.next}
        />
      </div>

      {(f.revisionTopics?.length ?? 0) > 0 && (
        <div className="glass mt-4 rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Suggested revision topics</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {f.revisionTopics?.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-3 py-1.5 text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`glass rounded-2xl p-5 ${highlight ? "glow-ring" : ""}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display mt-1 text-3xl font-bold text-gradient">{value}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="animated-gradient h-full rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ListCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {icon} {title}
      </h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.length === 0 && <li className="text-xs">Nothing reported.</li>}
        {items.map((i) => (
          <li key={i} className="rounded-lg bg-secondary/40 px-3 py-2 text-xs leading-relaxed">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
