import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Välkommen {user.email}</h1>
    </div>
  );
}
