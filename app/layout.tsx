import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CDex",
  description: "Le Pokédex de ta collection CD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <div className="relative">
          <Navbar />

          <Link
            href="/settings"
            className="fixed right-5 top-4 z-[999] flex h-11 w-11 items-center justify-center rounded-full border border-blue-100 bg-white/90 text-xl font-black text-[#2155ff] shadow-xl backdrop-blur"
          >
            ⚙
          </Link>
        </div>

        {children}
      </body>
    </html>
  );
}