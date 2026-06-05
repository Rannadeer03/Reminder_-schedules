import { z } from "zod";

export const phoneNumberSchema = z
  .string()
  .regex(/^\+[1-9]\d{6,14}$/, "Phone number must be in E.164 format (e.g. +15551234567)");

export const settingsSchema = z.object({
  phoneNumber: phoneNumberSchema.optional().or(z.literal("")),
  reminderMinutes: z.coerce.number().int().min(1).max(60).default(10),
  isActive: z.boolean().default(true),
  smsBackup: z.boolean().default(false),
  whatsappBackup: z.boolean().default(false),
  voiceLanguage: z
    .enum(["en-US", "en-GB", "es-ES", "es-MX", "fr-FR", "de-DE", "it-IT", "pt-BR", "ja-JP"])
    .default("en-US"),
  timezone: z.string().default("UTC"),
  reminderMinutes2: z.coerce.number().int().min(1).max(60).nullable().optional(),
});

export const testCallSchema = z.object({
  phoneNumber: phoneNumberSchema,
  message: z.string().min(1).max(500).optional(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
export type TestCallInput = z.infer<typeof testCallSchema>;
