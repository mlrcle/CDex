import type { Metadata, Viewport } from "next";
import "./globals.css";

import Navbar from "./components/Navbar";
import SettingsButton from "./components/settingsbutton";
import AchievementPopup from "@/app/components/AchievementPopup";

export const metadata: Metadata = {
  title: "CDex",
  description: "Le Pokédex de ta collection CD",

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CDex",
  },

  icons: {
    icon: "/logoapp.png",
    apple: "/logoapp.png",
    shortcut: "/logoapp.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2155ff",
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