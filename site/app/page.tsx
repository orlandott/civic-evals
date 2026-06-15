import { ScoreMatrix } from "./components/ScoreMatrix";
import { PersonaChart } from "./components/PersonaChart";
import { SubScorePanel } from "./components/SubScorePanel";
import { EvalCards } from "./components/EvalCards";
import { ModelCards } from "./components/ModelCards";
import { CalibrationPanel } from "./components/CalibrationPanel";
import { BaselinePanel } from "./components/BaselinePanel";
import { BiasPanel } from "./components/BiasPanel";
import { loadRollup } from "@/lib/rollup";

export default function Home() {
  const rollup = loadRollup();
  const empty = rollup.n_rows === 0;
  const generatedAt = rollup.generated_at
    ? new Date(rollup.generated_at).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }) + " UTC"
    : "never";

  const stats = [
    { label: "rows", value: rollup.n_rows },
    { label: "evals", value: rollup.evals.length },
    { label: "providers", value: rollup.providers.length },
    { label: "scorers", value: rollup.scorers.length },
  ];

  return (
    <main className="flex-1 w-full">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16 space-y-14">
        <header className="relative isolate space-y-5">
          {/* decorative ombre wash behind the hero */}
          <div
            aria-hidden
            className="brand-blob pointer-events-none absolute -top-24 right-0 -z-10 h-72 w-72 rounded-full sm:h-96 sm:w-96"
          />
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/70 px-3 py-1 text-xs font-medium uppercase tracking-widest text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300">
            CORDA · P3 · Civic Information Reliability
          </p>
          <h1 className="max-w-4xl text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.08]">
            How reliably do LLMs answer{" "}
            <span className="ombre-text">civic questions?</span>
          </h1>
          <p className="max-w-3xl text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
            An open evaluation suite measuring LLM reliability on voting access, election
            integrity, and persona-conditioned policy reasoning. Each eval runs against the same
            rubrics, scored for factual accuracy, calibrated uncertainty, and appropriate refusal.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 sm:max-w-2xl sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="card flex flex-col gap-0.5 px-4 py-3"
              >
                <span className="ombre-text text-2xl font-semibold tabular-nums">
                  {s.value}
                </span>
                <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-sm text-zinc-500 dark:text-zinc-400">
            <span>
              updated{" "}
              <strong className="font-medium text-zinc-800 dark:text-zinc-200">{generatedAt}</strong>
            </span>
            <span aria-hidden className="text-blue-300 dark:text-blue-700">
              •
            </span>
            <a
              href="https://github.com/justinshenk/civic-evals"
              className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
            >
              source on GitHub →
            </a>
          </div>
        </header>

        <section className="space-y-4">
          <SectionHeader
            title="Evals in this suite"
            hint="Each eval is a folder under evals/. Mentees copy _template/ to start a new one — see CONTRIBUTING.md."
          />
          <EvalCards rollup={rollup} />
        </section>

        {!empty && rollup.providers.length > 0 && (
          <section className="space-y-4">
            <SectionHeader
              title="Models evaluated"
              hint="Per-model report cards. The reader's trust question — should I rely on this model for civic info? — has model as the unit, not eval."
            />
            <ModelCards rollup={rollup} />
          </section>
        )}

        {empty ? (
          <EmptyState />
        ) : (
          <>
            <section className="space-y-4">
              <SectionHeader
                title="Mean score by eval × scorer"
                hint="Cell = mean of 0–1 scores for that eval/scorer pair. Hover for sample count."
              />
              <ScoreMatrix rollup={rollup} />
            </section>

            <section className="space-y-4">
              <SectionHeader
                title="Rubric sub-scores"
                hint="The rubric judge scores accuracy, calibrated uncertainty, and appropriate refusal separately. A model can be accurate and overconfident; these break it apart."
              />
              <SubScorePanel rollup={rollup} />
            </section>

            <section className="space-y-4">
              <SectionHeader
                title="Mean score by persona"
                hint="Same tasks, different personas. Gaps here are the reliability failures that matter most."
              />
              <PersonaChart rollup={rollup} />
            </section>

            {rollup.bias && rollup.bias.length > 0 && (
              <section className="space-y-4">
                <SectionHeader
                  title="Cross-model substantive-policy bias"
                  hint="Identical school-board candidate profiles, varying only the substantive direction of stated policy positions. Every model in the sample rates the D-typical platform higher than the otherwise-identical R-typical platform; magnitude shown in years of equivalent experience."
                />
                <BiasPanel rollup={rollup} />
              </section>
            )}

            <section className="space-y-4">
              <SectionHeader
                title="Calibration"
                hint="For Fermi tasks, AUROC of (1/CI-width) vs (point estimate within ±10% of truth). Mirrors the calibration AUROC reported by LM-Polygraph (Vashurin et al., TACL 2025), specialized to interval forecasts. 0.5 = chance; >0.75 = the model knows when it knows."
              />
              <CalibrationPanel rollup={rollup} />
            </section>

            <section className="space-y-4">
              <SectionHeader
                title="External baselines"
                hint="Pulled from UKGovernmentBEIS/inspect_evals and run with --limit, so these numbers are a comparison axis, not a leaderboard reproduction. Use them to calibrate how civic-eval gaps compare to model capability ceilings on established benchmarks."
              />
              <BaselinePanel rollup={rollup} />
            </section>
          </>
        )}

        <footer className="pt-8 border-t border-blue-200/60 dark:border-blue-400/15 text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            Built on{" "}
            <a
              href="https://inspect.aisi.org.uk/"
              className="text-blue-700 underline decoration-blue-300 underline-offset-4 dark:text-blue-300"
            >
              inspect-ai
            </a>
            . Source:{" "}
            <a
              href="https://github.com/justinshenk/civic-evals"
              className="text-blue-700 underline decoration-blue-300 underline-offset-4 dark:text-blue-300"
            >
              justinshenk/civic-evals
            </a>
            . Contributions welcome — see{" "}
            <a
              href="https://github.com/justinshenk/civic-evals/blob/main/CONTRIBUTING.md"
              className="text-blue-700 underline decoration-blue-300 underline-offset-4 dark:text-blue-300"
            >
              CONTRIBUTING.md
            </a>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex gap-3">
      <span aria-hidden className="ombre-rule mt-1 w-1 shrink-0 rounded-full" />
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">{hint}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="panel border-dashed p-10 text-center">
      <p className="text-zinc-700 dark:text-zinc-300 font-medium">No results yet.</p>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
        Run an eval, then regenerate the rollup:
        <br />
        <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-900 rounded px-2 py-1 mt-3 inline-block">
          uv run inspect eval evals/voting_access/eval.py --model anthropic/claude-haiku-4-5 --log-dir logs/
        </code>
        <br />
        <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-900 rounded px-2 py-1 mt-2 inline-block">
          uv run python analysis/rollup.py logs/ --format json -o site/public/data/rollup.json
        </code>
      </p>
    </div>
  );
}
