import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ReminderSettingsForm } from "@/components/settings/reminder-settings-form";
import { PhoneNumberForm } from "@/components/settings/phone-number-form";
import { TestCallButton } from "@/components/settings/test-call-button";

function SettingsSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-8 pt-7 pb-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-start gap-4">
          <span className="font-body text-[10px] tracking-[0.25em] uppercase font-medium mt-1 text-blue-400">
            {number}
          </span>
          <div>
            <h2 className="font-display font-bold text-xl text-white">{title}</h2>
            <p className="font-body text-sm mt-1 text-slate-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="px-8 py-7">{children}</div>
    </div>
  );
}

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const settings = await db.settings.findUnique({ where: { userId } });

  return (
    <div className="space-y-10 max-w-2xl">
      {/* Page heading */}
      <div className="border-b pb-8" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <h1 className="font-display font-extrabold text-3xl text-white">Settings</h1>
        <p className="font-body text-sm mt-1.5 text-slate-500">
          Configure your call reminder preferences.
        </p>
      </div>

      {/* Phone Number */}
      <SettingsSection
        number="01"
        title="Phone Number"
        description="The number we'll call before your meetings. Use E.164 format — e.g. +15551234567."
      >
        <PhoneNumberForm initialPhone={settings?.phoneNumber ?? ""} />
      </SettingsSection>

      {/* Reminder Settings */}
      <SettingsSection
        number="02"
        title="Reminder Preferences"
        description="Customize timing, backup notifications, and voice language."
      >
        <ReminderSettingsForm
          initialValues={{
            reminderMinutes:  settings?.reminderMinutes  ?? 10,
            isActive:         settings?.isActive         ?? true,
            smsBackup:        settings?.smsBackup        ?? false,
            whatsappBackup:   settings?.whatsappBackup   ?? false,
            voiceLanguage:    settings?.voiceLanguage    ?? "en-US",
            timezone:         settings?.timezone         ?? "UTC",
          }}
        />
      </SettingsSection>

      {/* Test Call */}
      <SettingsSection
        number="03"
        title="Test Call"
        description="Place a test call to verify your number and voice message are working correctly."
      >
        <TestCallButton phoneNumber={settings?.phoneNumber ?? null} />
      </SettingsSection>
    </div>
  );
}
