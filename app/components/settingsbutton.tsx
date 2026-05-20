"use client";

import { usePathname, useRouter } from "next/navigation";

export default function SettingsButton() {
  const pathname = usePathname();
  const router = useRouter();

  function handleClick() {
    if (pathname === "/settings") {
      window.dispatchEvent(new Event("close-settings"));
      return;
    }

    sessionStorage.setItem("cdex-last-page-before-settings", pathname);
    router.push("/settings");
  }

  return (
    <button
  onClick={handleClick}
  className="fixed right-3 top-2 z-[999] flex h-20 w-20 items-center justify-center transition active:scale-95"
>
  <img
    src="/reglage.png"
    alt="Réglages"
    className="h-20 w-20 object-contain"
  />
</button>
  );
}