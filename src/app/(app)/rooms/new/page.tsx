"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { suggestRoomNames, generateRoomImage } from "@/app/rooms/new/actions";
import { useCompany } from "@/lib/useCompany";
import { useUserRecord } from "@/lib/useUserRecord";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Loader2 } from "lucide-react";

export default function NewRoomPage() {
  const router = useRouter();
  const company = useCompany();
  const me = useUserRecord();
  const themes = useQuery(api.themes.listThemesByCompany, company?._id ? { companyId: company._id } : "skip");
  const createRoom = useMutation(api.rooms.createRoom);
  
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState("");
  const [name, setName] = useState("");
  const [size, setSize] = useState(4);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [maxMinutes, setMaxMinutes] = useState(60);
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("1");
  const [code, setCode] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestingName, setSuggestingName] = useState(false);

  useEffect(() => {
    if (themes?.[0]?.name) {
      setTheme(themes[0].name);
    }
  }, [themes]);

  const onSuggestNames = useCallback(async () => {
    if (!theme) return;
    setSuggestingName(true);
    try {
      const names = await suggestRoomNames(theme);
      if (names[0]) setName(names[0]);
    } finally {
      setSuggestingName(false);
    }
  }, [theme]);

  useEffect(() => {
    if (theme && !name && !suggestingName) {
      onSuggestNames();
    }
  }, [theme, name, suggestingName, onSuggestNames]);

  async function onGenerateImage() {
    if (!theme || !name) return;
    setLoading(true);
    try {
      const { imageUrl: url } = await generateRoomImage({ theme, roomName: name });
      setImageUrl(url);
    } finally {
      setLoading(false);
    }
  }

  async function onCreate() {
    if (!company?._id || !me?._id || !name || !imageUrl) return;
    setLoading(true);
    try {
      await createRoom({
        companyId: company._id,
        name,
        size,
        imageUrl,
        maxBookingMinutes: maxMinutes,
        location: { building, floor, code: code || undefined },
        equipment,
        actorUserId: me._id,
      });
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { num: 1, title: "Theme & Name" },
    { num: 2, title: "Size" },
    { num: 3, title: "Image" },
    { num: 4, title: "Max Booking" },
    { num: 5, title: "Location" },
    { num: 6, title: "Equipment" },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Create Room</h1>
        <div className="flex gap-2 mt-4">
          {steps.map(s => (
            <div
              key={s.num}
              className={`flex-1 h-1 rounded ${s.num <= step ? "bg-blue-500" : "bg-gray-200"}`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Step {step} of {steps.length}: {steps[step - 1]?.title}
        </p>
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                {theme || "Loading..."}
              </div>
              <p className="text-xs text-gray-600">Theme is set at company level</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Room Name</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    disabled={suggestingName}
                    className="flex-1" 
                  />
                  {suggestingName && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={onSuggestNames} 
                  disabled={!theme || suggestingName}
                >
                  {suggestingName ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    "Suggest"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Room Capacity</label>
            <Input type="number" min={1} value={size} onChange={e => setSize(parseInt(e.target.value || "1"))} />
            <p className="text-xs text-gray-600">Number of people the room can accommodate</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label className="text-sm font-medium">Room Image</label>
            {imageUrl ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="room" className="w-full max-w-md rounded-lg" />
                <Button variant="outline" onClick={onGenerateImage} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    "Regenerate"
                  )}
                </Button>
              </div>
            ) : (
              <Button onClick={onGenerateImage} disabled={loading || !theme || !name}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  "Generate Image"
                )}
              </Button>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Booking Duration (minutes)</label>
            <Input type="number" min={15} step={15} value={maxMinutes} onChange={e => setMaxMinutes(parseInt(e.target.value || "15"))} />
          </div>
        )}

        {step === 5 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Building</label>
              <Input value={building} onChange={e => setBuilding(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Floor</label>
              <Input value={floor} onChange={e => setFloor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <Input value={code} onChange={e => setCode(e.target.value)} placeholder="Optional" />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Equipment</label>
            <div className="flex gap-4">
              {["screen", "vc", "whiteboard"].map(flag => (
                <label key={flag} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={equipment.includes(flag)}
                    onChange={e => {
                      setEquipment(prev => e.target.checked ? [...prev, flag] : prev.filter(x => x !== flag));
                    }}
                    className="w-4 h-4"
                  />
                  {flag}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(s => s - 1)}>
            Back
          </Button>
        )}
        {step < 6 ? (
          <Button onClick={() => setStep(s => s + 1)}>
            Next
          </Button>
        ) : (
          <Button onClick={onCreate} disabled={loading || !name || !imageUrl}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Room"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}


