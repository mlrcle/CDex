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
      className="fixed right-5 top-4 z-[999] flex h-11 w-11 items-center justify-center rounded-full border border-blue-100 bg-white/90 text-xl font-black text-[#2155ff] shadow-xl backdrop-blur"
    >
      ⚙
    </button>
  );
}