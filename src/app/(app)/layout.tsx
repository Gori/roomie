import { OnboardingRedirect } from "@/components/OnboardingRedirect";
import InitCompany from "@/components/InitCompany";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InitCompany />
      <OnboardingRedirect />
      {children}
    </>
  );
}


