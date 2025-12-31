import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { getCurrentUser } from "@/lib/get-current-user";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen w-full">
      <div className="flex min-h-screen">
        <AppSidebar />

        <main id="main" className="min-w-0 flex-1 p-4 md:p-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>

          <div className="h-24 md:hidden" />
        </main>
      </div>

      <MobileNav emailLabel={user?.email ?? "—"} />
    </div>
  );
}
