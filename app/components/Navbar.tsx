"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const LOGO_SIZE = 75;

export default function Navbar() {
  const pathname = usePathname();

  /* =========================
     SAVE LAST USEFUL PAGE
  ========================= */
  useEffect(() => {
    // Ignore settings page
    if (pathname.includes("/settings")) return;

    const currentUsefulPage = sessionStorage.getItem(
      "cdex-current-useful-page"
    );

    if (
      currentUsefulPage &&
      currentUsefulPage !== pathname
    ) {
      sessionStorage.setItem(
        "cdex-previous-useful-page",
        currentUsefulPage
      );
    }

    sessionStorage.setItem(
      "cdex-current-useful-page",
      pathname
    );
  }, [pathname]);

  /* =========================
     PAGE TITLE
  ========================= */
  const pageTitle =
    pathname === "/"
      ? "Accueil"
      : pathname.startsWith("/collection")
        ? "Collection"
        : pathname.startsWith("/add")
          ? "Ajouter"
          : pathname.startsWith("/community")
            ? "Social"
            : pathname.startsWith("/profile")
              ? "Profil"
              : pathname.startsWith("/wishlist")
                ? "Wishlist"
                : pathname.startsWith("/favorites")
                  ? "Favoris"
                  : pathname.startsWith("/album")
                    ? "Fiche album"
                    : pathname.startsWith("/settings")
                      ? "Réglages"
                      : "CDex";

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-blue-100/50 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-md flex-col items-start justify-center px-5 py-3">
          <Link
            href="/"
            className="flex items-center justify-center transition active:scale-95"
          >
            <Image
              src="/logo-cdex.png"
              alt="CDex"
              width={LOGO_SIZE}
              height={LOGO_SIZE}
              className="object-contain"
              priority
            />
          </Link>

          <h1 className="mt-1 pl-1 text-sm font-black uppercase tracking-[0.18em] text-[#2155ff]">
            {pageTitle}
          </h1>
        </div>
      </header>

      {/* BOTTOM NAVBAR */}
      <nav className="fixed bottom-3 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-[2rem] border border-blue-100/70 bg-white/90 px-2 py-2 shadow-[0_12px_35px_rgba(33,85,255,0.18)] backdrop-blur-2xl">
        <div className="grid grid-cols-5 items-end text-center text-[10px] font-black text-blue-700">
          <NavItem
            href="/"
            icon="/icons/cropped/home.png"
            label="Accueil"
          />

          <NavItem
            href="/collection"
            icon="/icons/cropped/collection.png"
            label="Collection"
          />

          {/* ADD BUTTON */}
          <div className="flex flex-col items-center -translate-y-3">
            <Link
              href="/add"
              className="relative flex h-[54px] w-[54px] items-center justify-center overflow-visible rounded-full transition active:scale-95"
            >
              <Image
                src="/icons/cropped/add.png"
                alt="Ajouter"
                width={100}
                height={100}
                className="pointer-events-none h-[54px] w-[54px] scale-[5] object-contain"
              />
            </Link>
          </div>

          <NavItem
            href="/community"
            icon="/icons/cropped/social.png"
            label="Social"
          />

          <NavItem
            href="/profile"
            icon="/icons/cropped/profile.png"
            label="Profil"
          />
        </div>
      </nav>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="relative z-10 flex flex-col items-center gap-0.5 rounded-2xl px-1 py-1 transition active:scale-95 active:bg-blue-50"
    >
      <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
        <Image
          src={icon}
          alt={label}
          width={64}
          height={64}
          className="scale-[3] object-cover"
        />
      </div>

      <span>{label}</span>
    </Link>
  );
}