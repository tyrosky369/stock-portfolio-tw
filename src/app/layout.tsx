import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import MemberBar from "@/components/layout/MemberBar";
import { MemberProvider } from "@/contexts/MemberContext";

export const metadata: Metadata = {
  title: "台美股資產儀表板",
  description: "台灣與美國股票庫存現值統計",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="bg-[#F5F0E8] text-[#3A3028] antialiased min-h-screen">
        <MemberProvider>
          <Navbar />
          <MemberBar />
          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        </MemberProvider>
      </body>
    </html>
  );
}
