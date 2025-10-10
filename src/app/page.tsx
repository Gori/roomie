import InitCompany from "@/components/InitCompany";
import { OnboardingRedirect } from "@/components/OnboardingRedirect";
import HomeClient from "@/components/home/HomeClient";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <InitCompany />
      <OnboardingRedirect />
      <div>
        <h1 className="text-2xl font-medium">Book a Room</h1>
        <p className="text-sm text-gray-600 mt-1">Select room capacity to book instantly</p>
      </div>
      <HomeClient />
    </div>
  );
}
