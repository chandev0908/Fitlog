import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-base">
        <span className="font-display font-bold text-lg tracking-tight">
          FIT<span className="text-brand">LOG</span>
        </span>
        <ThemeToggle />
      </header>

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)/0.5) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)/0.5) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        {children}
      </main>
    </div>
  );
}
