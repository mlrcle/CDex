import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import SettingsButton from "./components/settingsbutton";

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
        <Navbar />
        <SettingsButton />
        {children}
      </body>
    </html>
  );
}