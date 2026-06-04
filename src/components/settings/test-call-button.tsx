"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Phone } from "lucide-react";

interface TestCallButtonProps {
  phoneNumber: string | null;
}

export function TestCallButton({ phoneNumber }: TestCallButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleTest() {
    if (!phoneNumber) {
      toast({
        title: "No phone number",
        description: "Add a phone number in the settings above first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/calls/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Call failed", description: data.error ?? "Unknown error", variant: "destructive" });
      } else {
        toast({
          title: "Test call initiated",
          description: `Calling ${phoneNumber}. You should receive a call within 30 seconds.`,
        });
      }
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Button onClick={handleTest} disabled={loading || !phoneNumber} variant="outline">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Phone className="mr-2 h-4 w-4" />
        )}
        {loading ? "Calling…" : "Place Test Call"}
      </Button>
      {!phoneNumber && (
        <p className="text-sm text-muted-foreground">Set a phone number first</p>
      )}
    </div>
  );
}
