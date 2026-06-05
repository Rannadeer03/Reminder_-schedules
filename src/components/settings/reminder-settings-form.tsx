"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "es-MX", label: "Spanish (Mexico)" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
  { value: "it-IT", label: "Italian" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "ja-JP", label: "Japanese" },
];

interface ReminderSettingsFormProps {
  initialValues: {
    reminderMinutes: number;
    reminderMinutes2: number | null;
    isActive: boolean;
    smsBackup: boolean;
    whatsappBackup: boolean;
    voiceLanguage: string;
    timezone: string;
  };
}

export function ReminderSettingsForm({ initialValues }: ReminderSettingsFormProps) {
  const [values, setValues] = useState(initialValues);
  const [secondReminder, setSecondReminder] = useState(initialValues.reminderMinutes2 !== null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSave() {
    setLoading(true);
    try {
      const payload = {
        ...values,
        reminderMinutes2: secondReminder ? (values.reminderMinutes2 ?? 5) : null,
      };
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error ?? "Failed to save", variant: "destructive" });
      } else {
        toast({ title: "Saved", description: "Reminder preferences updated." });
      }
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Active toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Enable Reminders</Label>
          <p className="text-xs text-muted-foreground">Pause all upcoming call reminders</p>
        </div>
        <Switch
          checked={values.isActive}
          onCheckedChange={(v) => setValues((p) => ({ ...p, isActive: v }))}
        />
      </div>

      {/* Reminder timing */}
      <div>
        <Label htmlFor="minutes" className="text-sm font-medium">Minutes Before Meeting</Label>
        <p className="text-xs text-muted-foreground mb-2">How early to place the first call (1–60 minutes)</p>
        <Input
          id="minutes"
          type="number"
          min={1}
          max={60}
          value={values.reminderMinutes}
          onChange={(e) => setValues((p) => ({ ...p, reminderMinutes: parseInt(e.target.value) || 10 }))}
          className="w-28"
        />
      </div>

      {/* Second reminder */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Second Reminder</Label>
            <p className="text-xs text-muted-foreground">Place a second call at a different time</p>
          </div>
          <Switch
            checked={secondReminder}
            onCheckedChange={(v) => {
              setSecondReminder(v);
              if (v) setValues((p) => ({ ...p, reminderMinutes2: p.reminderMinutes2 ?? 5 }));
            }}
          />
        </div>
        {secondReminder && (
          <div className="ml-0 pt-1">
            <Input
              type="number"
              min={1}
              max={60}
              value={values.reminderMinutes2 ?? 5}
              onChange={(e) =>
                setValues((p) => ({ ...p, reminderMinutes2: parseInt(e.target.value) || 5 }))
              }
              className="w-28"
              placeholder="5"
            />
            <p className="text-xs text-muted-foreground mt-1">Minutes before meeting for second call</p>
          </div>
        )}
      </div>

      {/* Voice language */}
      <div>
        <Label className="text-sm font-medium">Voice Language</Label>
        <p className="text-xs text-muted-foreground mb-2">Language for the text-to-speech call</p>
        <Select
          value={values.voiceLanguage}
          onValueChange={(v) => setValues((p) => ({ ...p, voiceLanguage: v }))}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SMS backup */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">SMS Backup</Label>
          <p className="text-xs text-muted-foreground">Also send an SMS if call fails</p>
        </div>
        <Switch
          checked={values.smsBackup}
          onCheckedChange={(v) => setValues((p) => ({ ...p, smsBackup: v }))}
        />
      </div>

      {/* WhatsApp backup */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">WhatsApp Backup</Label>
          <p className="text-xs text-muted-foreground">Also send a WhatsApp message if call fails</p>
        </div>
        <Switch
          checked={values.whatsappBackup}
          onCheckedChange={(v) => setValues((p) => ({ ...p, whatsappBackup: v }))}
        />
      </div>

      <Button onClick={handleSave} disabled={loading} className="mt-2">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Preferences
      </Button>
    </div>
  );
}
