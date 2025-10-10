"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)", offset: "UTC-5" },
  { value: "America/Chicago", label: "Central Time (CT)", offset: "UTC-6" },
  { value: "America/Denver", label: "Mountain Time (MT)", offset: "UTC-7" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: "UTC-8" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)", offset: "UTC-9" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)", offset: "UTC-10" },
  { value: "Europe/London", label: "London (GMT/BST)", offset: "UTC+0" },
  { value: "Europe/Paris", label: "Paris (CET)", offset: "UTC+1" },
  { value: "Europe/Berlin", label: "Berlin (CET)", offset: "UTC+1" },
  { value: "Europe/Rome", label: "Rome (CET)", offset: "UTC+1" },
  { value: "Europe/Madrid", label: "Madrid (CET)", offset: "UTC+1" },
  { value: "Europe/Athens", label: "Athens (EET)", offset: "UTC+2" },
  { value: "Europe/Moscow", label: "Moscow (MSK)", offset: "UTC+3" },
  { value: "Asia/Dubai", label: "Dubai (GST)", offset: "UTC+4" },
  { value: "Asia/Karachi", label: "Karachi (PKT)", offset: "UTC+5" },
  { value: "Asia/Kolkata", label: "India (IST)", offset: "UTC+5:30" },
  { value: "Asia/Dhaka", label: "Dhaka (BST)", offset: "UTC+6" },
  { value: "Asia/Bangkok", label: "Bangkok (ICT)", offset: "UTC+7" },
  { value: "Asia/Singapore", label: "Singapore (SGT)", offset: "UTC+8" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)", offset: "UTC+8" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)", offset: "UTC+8" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: "UTC+9" },
  { value: "Asia/Seoul", label: "Seoul (KST)", offset: "UTC+9" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)", offset: "UTC+11" },
  { value: "Pacific/Auckland", label: "Auckland (NZDT)", offset: "UTC+13" },
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)", offset: "UTC-3" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (ART)", offset: "UTC-3" },
  { value: "America/Mexico_City", label: "Mexico City (CST)", offset: "UTC-6" },
  { value: "America/Toronto", label: "Toronto (ET)", offset: "UTC-5" },
  { value: "America/Vancouver", label: "Vancouver (PT)", offset: "UTC-8" },
  { value: "Africa/Cairo", label: "Cairo (EET)", offset: "UTC+2" },
  { value: "Africa/Johannesburg", label: "Johannesburg (SAST)", offset: "UTC+2" },
  { value: "Asia/Jerusalem", label: "Jerusalem (IST)", offset: "UTC+2" },
  { value: "Asia/Istanbul", label: "Istanbul (TRT)", offset: "UTC+3" },
];

interface TimezoneComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimezoneCombobox({ value, onChange }: TimezoneComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedTimezone = TIMEZONES.find((tz) => tz.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedTimezone ? (
            <span className="flex items-center gap-2">
              <span>{selectedTimezone.label}</span>
              <span className="text-muted-foreground text-xs">{selectedTimezone.offset}</span>
            </span>
          ) : (
            "Select timezone..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search timezone..." />
          <CommandList>
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup>
              {TIMEZONES.map((tz) => (
                <CommandItem
                  key={tz.value}
                  value={tz.value}
                  onSelect={() => {
                    onChange(tz.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === tz.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center justify-between w-full">
                    <span>{tz.label}</span>
                    <span className="text-muted-foreground text-xs ml-2">{tz.offset}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

