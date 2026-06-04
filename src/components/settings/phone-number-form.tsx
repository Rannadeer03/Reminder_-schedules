"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface PhoneNumberFormProps {
  initialPhone: string;
}

export function PhoneNumberForm({ initialPhone }: PhoneNumberFormProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.issues?.[0]?.message ?? data.error ?? "Failed to save";
        toast({ title: "Error", description: msg, variant: "destructive" });
      } else {
        toast({ title: "Saved", description: "Phone number updated successfully." });
      }
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1">
        <Label htmlFor="phone" className="sr-only">Phone number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+15551234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="font-mono"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save
      </Button>
    </form>
  );
}
