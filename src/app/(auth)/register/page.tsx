import AuthCard from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/register/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Skapa konto"
      description="Skapa ett konto för att börja använda appen."
      footerText="Har du konto?"
      footerLinkHref="/login"
      footerLinkLabel="Logga in"
    >
      <RegisterForm />
    </AuthCard>
  );
}
