import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { supabase } from "@/lib/supabase";
import { getViewerId } from "@/lib/identity";
import { WhoAmI } from "@/components/WhoAmI";
import { ViewerTag } from "@/components/ViewerTag";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "bis book club",
  description: "Four shelves, five books each, and wine owed for falling behind.",
};

// The root layout wraps every page, which makes it the right place to gate
// on identity: reacting needs to know who you are, on every page that
// shows a book, not just one of them.
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [{ data: members }, viewerId] = await Promise.all([
    supabase.from("members").select("id, name").order("name"),
    getViewerId(),
  ]);

  const viewer = members?.find((m) => m.id === viewerId) ?? null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-board text-chalk font-sans">
        {viewer ? <ViewerTag name={viewer.name} /> : null}
        {!viewer && members?.length ? <WhoAmI members={members} /> : null}
        {children}
      </body>
    </html>
  );
}
