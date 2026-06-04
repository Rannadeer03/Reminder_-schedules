import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ReminderSettingsForm } from "@/components/settings/reminder-settings-form";
import { PhoneNumberForm } from "@/components/settings/phone-number-form";
import { TestCallButton } from "@/components/settings/test-call-button";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const settings = await db.settings.findUnique({ where: { userId } });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Configure your call reminder preferences.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {/* Phone Number */}
        <div className="p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Phone Number</h2>
          <p className="text-sm text-slate-500 mb-4">
            The number we&apos;ll call 10 minutes before your meetings. Must be in E.164 format
            (e.g. +15551234567).
          </p>
          <PhoneNumberForm initialPhone={settings?.phoneNumber ?? ""} />
        </div>

        <Separator />

        {/* Reminder Settings */}
        <div className="p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Reminder Preferences</h2>
          <p className="text-sm text-slate-500 mb-4">
            Customize timing, backup notifications, and voice language.
          </p>
          <ReminderSettingsForm
            initialValues={{
              reminderMinutes: settings?.reminderMinutes ?? 10,
              isActive: settings?.isActive ?? true,
              smsBackup: settings?.smsBackup ?? false,
              whatsappBackup: settings?.whatsappBackup ?? false,
              voiceLanguage: settings?.voiceLanguage ?? "en-US",
              timezone: settings?.timezone ?? "UTC",
            }}
          />
        </div>

        <Separator />

        {/* Test Call */}
        <div className="p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Test Reminder Call</h2>
          <p className="text-sm text-slate-500 mb-4">
            Place a test call to your phone number to verify everything is working.
          </p>
          <TestCallButton phoneNumber={settings?.phoneNumber ?? null} />
        </div>
      </div>
    </div>
  );
}
