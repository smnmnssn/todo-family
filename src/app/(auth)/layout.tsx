// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-linear-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Subtil “blue glow” utan att bli stökig */}
      <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.12),transparent_55%)]">
        <main id="main" className="min-h-screen grid place-items-center px-4 py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
