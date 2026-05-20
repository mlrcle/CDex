import type { Metadata } from "next";
import "./globals.css";

import Navbar from "./components/Navbar";
import SettingsButton from "./components/settingsbutton";
import AchievementPopup from "@/app/components/AchievementPopup";

export const metadata: Metadata = {
  title: "CDex",
  description: "Le Pokédex de ta collection CD",

  manifest: "/manifest.json",

  themeColor: "#2155ff",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CDex",
  },

  icons: {
    apple: "/logo-cdex.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <SettingsButton />

        <AchievementPopup />

        {children}
      </body>
    </html>
  );
}