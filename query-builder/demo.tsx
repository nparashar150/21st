// This is a file with a demo for your component
// That's what users will see in the preview
// Create new files in this directory to add more demos

"use client";

import * as React from "react";
import { Copy, Check, Moon, Sun, ChevronRight, ChevronLeft, Github } from "lucide-react";
import { QueryBuilder, RuleGroup, Field } from "@/components/ui/component";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEMO_FIELDS: Field[] = [
  { name: "name", label: "Name", type: "text", group: "Contact" },
  { name: "email", label: "Email", type: "text", group: "Contact" },
  { name: "age", label: "Age", type: "number", group: "Contact" },
  { name: "signup_date", label: "Signup Date", type: "date", group: "Contact" },
  { name: "is_active", label: "Is Active", type: "boolean", group: "Contact" },
  {
    name: "status",
    label: "Status",
    type: "select",
    group: "Contact",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "pending", label: "Pending" },
    ],
  },
  {
    name: "tags",
    label: "Tags",
    type: "multiselect",
    group: "Contact",
    options: [
      { value: "vip", label: "VIP" },
      { value: "beta", label: "Beta" },
      { value: "premium", label: "Premium" },
    ],
  },
];

// ONLY DEFAULT EXPORT WILL BE TREATED AS A DEMO
export default function Demo() {
  const [query, setQuery] = React.useState<RuleGroup | undefined>(undefined);
  const [copied, setCopied] = React.useState(false);
  const [isDark, setIsDark] = React.useState(() => {
    // Check if we're on client and get initial theme
    if (typeof window !== "undefined") {
      // Check if dark class already exists or prefer dark
      const hasDarkClass = document.documentElement.classList.contains("dark");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = hasDarkClass || prefersDark;
      // Apply immediately to avoid flash
      document.documentElement.classList.toggle("dark", initial);
      return initial;
    }
    return true;
  });
  const [panelOpen, setPanelOpen] = React.useState(true);

  // Toggle dark class on document for Tailwind dark: classes to work
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleCopy = async () => {
    if (query) {
      await navigator.clipboard.writeText(JSON.stringify(query, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const ruleCount = query?.rules?.length ?? 0;

  return (
    <div
      className={cn(
        "relative flex h-svh w-full flex-col overflow-hidden transition-colors duration-300",
        isDark
          ? "bg-[#0a0a0f] text-white"
          : "bg-linear-to-br from-slate-50 via-white to-slate-100 text-slate-900"
      )}
    >
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        {isDark ? (
          <>
            <div className="absolute -left-32 top-[-10vh] h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.3),transparent_50%)] blur-3xl" />
            <div className="absolute bottom-[-15vh] right-[-5vw] h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.25),transparent_55%)] blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-[40vh] w-[40vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.15),transparent_60%)] blur-3xl" />
          </>
        ) : (
          <>
            <div className="absolute -left-20 top-[-15vh] h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12),transparent_60%)] blur-3xl" />
            <div className="absolute bottom-[-20vh] right-[-10vw] h-[55vh] w-[55vh] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_65%)] blur-3xl" />
          </>
        )}
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between gap-4 px-6 py-5">
        <div>
          <p
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.4em]",
              isDark ? "text-violet-400/80" : "text-slate-500"
            )}
          >
            21st • Query Builder
          </p>
          <h1 className="mt-2 text-xl font-semibold sm:text-2xl">
            Build complex queries visually
          </h1>
          <p
            className={cn(
              "mt-1 max-w-lg text-sm",
              isDark ? "text-slate-400" : "text-slate-600"
            )}
          >
            A powerful, shadcn-styled query builder for filtering data. Supports
            nested groups, multiple field types, and exports clean JSON.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 backdrop-blur",
              isDark
                ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                : "border-slate-200/60 bg-white/50"
            )}
          >
            <a
              href="https://github.com/nparashar150/21st"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
            className={cn(
              "shrink-0 backdrop-blur",
              isDark
                ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                : "border-slate-200/60 bg-white/50"
            )}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex min-h-0 flex-1 gap-3 px-6 pb-6">
        {/* Query Builder Card */}
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border backdrop-blur-xl",
            isDark
              ? "border-white/10 bg-white/3"
              : "border-slate-200/60 bg-white/70"
          )}
        >
          <div className="min-w-0 flex-1 overflow-auto p-4">
            <QueryBuilder
              fields={DEMO_FIELDS}
              value={query}
              onChange={setQuery}
              className="w-full"
            />
          </div>

          {/* Feature badges */}
          <div
            className={cn(
              "flex flex-wrap gap-2 border-t px-4 py-3",
              isDark ? "border-white/10" : "border-slate-200/40"
            )}
          >
            {["Drag & Drop", "Nested Groups", "Multiple Types", "TypeScript"].map(
              (feature) => (
                <span
                  key={feature}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-medium",
                    isDark
                      ? "bg-violet-500/20 text-violet-300"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {feature}
                </span>
              )
            )}
          </div>
        </div>

        {/* JSON Output Panel - Collapsible */}
        <div
          className={cn(
            "flex shrink-0 flex-col overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300",
            isDark
              ? "border-white/10 bg-white/3"
              : "border-slate-200/60 bg-white/70",
            panelOpen ? "w-72" : "w-10"
          )}
        >
          {/* Panel Header */}
          <div
            className={cn(
              "flex items-center justify-between border-b px-2 py-2",
              isDark ? "border-white/10" : "border-slate-200/40"
            )}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPanelOpen(!panelOpen)}
              className="h-6 w-6 shrink-0"
            >
              {panelOpen ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </Button>
            {panelOpen && (
              <>
                <span className="flex-1 text-xs font-medium">JSON Output</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCopy}
                  disabled={ruleCount === 0}
                  className="h-6 w-6"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Panel Content */}
          {panelOpen && (
            <div className="flex-1 overflow-auto p-3">
              {ruleCount > 0 ? (
                <pre
                  className={cn(
                    "rounded-lg p-3 font-mono text-[10px] leading-relaxed",
                    isDark
                      ? "bg-black/40 text-slate-300"
                      : "bg-slate-100 text-slate-700"
                  )}
                >
                  {JSON.stringify(query, null, 2)}
                </pre>
              ) : (
                <p
                  className={cn(
                    "py-8 text-center text-xs",
                    isDark ? "text-slate-500" : "text-slate-400"
                  )}
                >
                  Add conditions to see output
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
