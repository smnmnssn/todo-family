import AuthCard from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard
      title="Logga in"
      description="Logga in för att komma åt din organizer."
      footerText="Ny användare?"
      footerLinkHref="/register"
      footerLinkLabel="Skapa konto"
    >
      <LoginForm />
    </AuthCard>
  );
}
