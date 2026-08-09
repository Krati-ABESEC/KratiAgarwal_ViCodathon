import { Link } from "@tanstack/react-router";
import { BrainCircuit } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/interview", label: "Interview" },
  { to: "/report", label: "Report" },
  { to: "/admin", label: "Admin / API" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="animated-gradient glow-ring flex size-9 items-center justify-center rounded-xl">
            <BrainCircuit className="size-5 text-primary-foreground" />
          </span>
          <span className="font-display text-sm leading-tight font-semibold sm:text-base">
            Adaptive AI <span className="text-gradient">Interviewer</span>
          </span>
        </Link>
        <nav className="scroll-slim flex items-center gap-1 overflow-x-auto text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3 py-1.5 whitespace-nowrap text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
