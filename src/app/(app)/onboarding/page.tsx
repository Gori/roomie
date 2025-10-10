"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { suggestThemes } from "@/app/onboarding/actions";
import { useCompany } from "@/lib/useCompany";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TimezoneCombobox } from "@/components/ui/TimezoneCombobox";

export default function OnboardingPage() {
  const router = useRouter();
  const company = useCompany();
  const update = useMutation(api.companies.updateCompanySettings);
  const createTheme = useMutation(api.themes.createTheme);
  const [companyName, setCompanyName] = useState<string>("");
  const [themes, setThemes] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [customTheme, setCustomTheme] = useState<string>("");
  const [tz, setTz] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(18);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    suggestThemes().then(setThemes).catch(() => setThemes([]));
  }, []);

  const isFormValid = companyName.trim().length > 0 && 
                       tz.length > 0 && 
                       startHour >= 0 && startHour <= 23 &&
                       endHour >= 0 && endHour <= 23 &&
                       startHour < endHour &&
                       (customTheme.trim().length > 0 || selectedTheme.length > 0);

  async function onComplete() {
    if (!company?._id || !isFormValid) return;
    const themeToSave = (customTheme.trim() || selectedTheme).trim();
    
    setLoading(true);
    try {
      await update({ companyId: company._id, name: companyName.trim(), tz, businessHours: { startHour, endHour } });
      await createTheme({ companyId: company._id, name: themeToSave, seed: Date.now().toString() });
      router.push("/rooms/new");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Welcome to Roomie</h1>
        <p className="text-sm text-gray-600 mt-1">Set up your company workspace</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium">
            Company Name <span className="text-red-500">*</span>
          </label>
          <Input 
            value={companyName} 
            onChange={e => setCompanyName(e.target.value)} 
            placeholder="Acme Inc."
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">
            Company Timezone <span className="text-red-500">*</span>
          </label>
          <TimezoneCombobox value={tz} onChange={setTz} />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">
            Business Hours <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input 
                type="number" 
                min={0} 
                max={23} 
                value={startHour} 
                onChange={e => setStartHour(parseInt(e.target.value || "0"))} 
                placeholder="Start hour"
                required
              />
            </div>
            <div className="flex-1">
              <Input 
                type="number" 
                min={0} 
                max={23} 
                value={endHour} 
                onChange={e => setEndHour(parseInt(e.target.value || "0"))} 
                placeholder="End hour"
                required
              />
            </div>
          </div>
          {startHour >= endHour && (
            <p className="text-xs text-red-500">End hour must be after start hour</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">
            Choose a Naming Theme <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-600">This will be used to name your meeting rooms</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {themes.map(t => (
              <button
                key={t}
                onClick={() => { setSelectedTheme(t); setCustomTheme(""); }}
                className={`px-4 py-3 border rounded-lg text-sm transition-colors ${
                  selectedTheme === t
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Or enter your own naming theme</label>
          <Input 
            value={customTheme} 
            onChange={e => { setCustomTheme(e.target.value); setSelectedTheme(""); }} 
            placeholder="e.g., Greek Gods, Constellations, Coffee Beans"
          />
        </div>

        <Button 
          onClick={onComplete} 
          disabled={loading || !isFormValid}
          className="w-full"
        >
          {loading ? "Setting up..." : "Complete Setup"}
        </Button>
      </div>
    </div>
  );
}


