import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MeetingAlert — Never Miss a Meeting",
    template: "%s | MeetingAlert",
  },
  description:
    "Connect Google Calendar once. MeetingAlert calls your phone 10 minutes before every meeting — automatically.",
  keywords: ["meeting reminder", "phone call reminder", "google calendar", "never miss a meeting"],
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "https://meeting-call-reminder.vercel.app"),
  openGraph: {
    title: "MeetingAlert — Get a real phone call before every meeting",
    description:
      "Connect Google Calendar once. Get a voice call 10 minutes before every meeting. Free forever.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeetingAlert — Never Miss a Meeting",
    description:
      "Connect Google Calendar once. Get a voice call 10 minutes before every meeting. Free forever.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${dmSans.variable} font-body antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
