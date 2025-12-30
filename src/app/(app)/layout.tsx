import UserStatus from "@/components/auth/UserStatus";
import { AppSidebar } from "@/components/layout/AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-100">
      

      {/* SIDEBAR + CONTENT */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        <AppSidebar />

        <main id="main" className="min-w-0 flex-1 p-4 md:p-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
