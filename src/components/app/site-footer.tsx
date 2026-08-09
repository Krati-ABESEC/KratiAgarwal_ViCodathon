import { Link } from "@tanstack/react-router";
import { BookOpen, Github, Mail, Terminal } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <h3 className="font-display text-lg font-semibold">
            Adaptive AI <span className="text-gradient">Interviewer</span>
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            A curriculum-aware interview agent for graduates of the 31-Day ABTalks AI Cohort.
            Adaptive questioning, context memory, and recruiter-grade feedback reports.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium">Resources</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <a className="inline-flex items-center gap-2 hover:text-foreground" href="#docs">
                <BookOpen className="size-4" /> Documentation
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center gap-2 hover:text-foreground"
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="size-4" /> GitHub
              </a>
            </li>
            <li>
              <Link to="/admin" className="inline-flex items-center gap-2 hover:text-foreground">
                <Terminal className="size-4" /> API Docs
              </Link>
            </li>
            <li>
              <a
                className="inline-flex items-center gap-2 hover:text-foreground"
                href="mailto:team@abtalks.ai"
              >
                <Mail className="size-4" /> Contact
              </a>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium">Project</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>Endpoint: POST /api/interview</li>
            <li>Model: Lovable AI · Gemini Flash</li>
            <li>8 adaptive questions · 4+ curriculum days</li>
            <li>Session-scoped context memory</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Adaptive AI Interviewer · Built for the ABTalks AI Cohort
      </div>
    </footer>
  );
}
