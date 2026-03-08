import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <nav className="border-b border-base">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <span className="font-display text-2xl font-bold">
            FIT<span className="text-brand">LOG</span>
          </span>
          <div className="flex gap-4 items-center">
            <Link
              href="/login"
              className="text-muted hover:text-[hsl(var(--foreground))] transition-colors text-sm font-display font-medium"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-brand text-white px-4 py-2 text-sm font-display font-semibold hover:bg-brand-hover transition-colors"
            >
              Get Started
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-muted">
            Training tracker
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            Track Your Training. <br />
            <span className="text-brand">Build Consistency.</span>
            <br />
            See Progress.
          </h2>
          <p className="text-muted text-lg leading-relaxed max-w-md">
            Log workouts or rest days, add notes, upload progress photos,
            and stay consistent — one day at a time.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/signup"
              className="bg-brand text-white px-6 py-3 font-display font-semibold hover:bg-brand-hover transition-colors hover:shadow-[0_0_16px_0_hsl(var(--brand-glow)/0.3)]"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="border border-base px-6 py-3 font-display font-medium hover:bg-surface transition-colors text-[hsl(var(--foreground))]"
            >
              Login
            </Link>
          </div>
          <p className="text-xs text-muted font-display">No credit card required</p>
        </div>

        {/* Right visual */}
        <div className="hidden md:flex flex-col gap-3">
          {[
            { date: 'Mon', type: 'Train', note: 'Chest & Triceps — felt strong.', color: 'bg-[hsl(var(--brand-glow))]' },
            { date: 'Tue', type: 'Rest', note: 'Full recovery day.', color: 'bg-yellow-500' },
            { date: 'Wed', type: 'Train', note: 'Back & Biceps — new PR on deadlift.', color: 'bg-[hsl(var(--brand-glow))]' },
          ].map((item) => (
            <div key={item.date} className="flex items-stretch gap-0 border border-base bg-surface-raised">
              <div className={`w-1 flex-shrink-0 ${item.color}`} />
              <div className="px-4 py-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold">{item.type}</span>
                  <span className="text-xs text-muted font-display">{item.date}</span>
                </div>
                <p className="text-xs text-muted mt-0.5">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface border-t border-base py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-muted text-center mb-10">
            Everything you need
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Daily Logs', desc: 'Log train, rest, or active recovery days with a comment and photos.' },
              { title: 'Personal Records', desc: 'Track PRs per exercise and watch your numbers climb over time.' },
              { title: 'Public Profiles', desc: 'Share your journey or keep it private — you choose per log.' },
            ].map((item) => (
              <div key={item.title} className="border border-base bg-surface-raised p-6 hover:border-[hsl(var(--brand-glow)/0.4)] transition-colors">
                <h3 className="font-display text-base font-semibold text-brand mb-2">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center px-6 border-t border-base">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-muted mb-4">
          Ready to start?
        </p>
        <h3 className="font-display text-3xl font-bold mb-8">
          Build your fitness habit today
        </h3>
        <Link
          href="/signup"
          className="inline-block bg-brand text-white px-8 py-4 font-display font-semibold hover:bg-brand-hover transition-colors hover:shadow-[0_0_20px_0_hsl(var(--brand-glow)/0.4)]"
        >
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-base px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-display text-sm font-bold">
            FIT<span className="text-brand">LOG</span>
          </span>
          <p className="text-xs text-muted font-display">
            Built with Next.js + Supabase
          </p>
        </div>
      </footer>
    </main>
  );
}