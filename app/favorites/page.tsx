"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { albums } from "../data/albums";

type Album = {
  id: string;
  musicBrainzId?: string;
  title: string;
  artist: string;
  year?: number;
  genre?: string;
  discovered?: boolean;
  cover?: string;
  rarity?: string;
  duration?: string;
  estimatedValue?: string;
  addedAt?: string;
  tracks?: string[];
  source?: "manual" | "search" | "scan" | "database" | "wishlist";
};

export default function FavoritesPage() {
  const router = useRouter();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [userAlbums, setUserAlbums] = useState<Album[]>([]);
  const [wishlistAlbums, setWishlistAlbums] = useState<Album[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setFavorites(JSON.parse(localStorage.getItem("cdex-favorites") || "[]"));
    setUserAlbums(JSON.parse(localStorage.getItem("cdex-user-albums") || "[]"));
    setWishlistAlbums(JSON.parse(localStorage.getItem("cdex-wishlist") || "[]"));
  }, []);

  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 2200);
  }

  function getAlbumPageId(album: Album) {
    return album.musicBrainzId || album.id;
  }

  function toggleFavorite(id: string) {
    const updatedFavorites = favorites.includes(id)
      ? favorites.filter((favoriteId) => favoriteId !== id)
      : [...favorites, id];

    localStorage.setItem("cdex-favorites", JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites);

    showToast(
      favorites.includes(id) ? "Retiré des favoris." : "Ajouté aux favoris."
    );
  }

  function toggleWishlist(album: Album) {
    const alreadyInWishlist = wishlistAlbums.some((item) => item.id === album.id);

    const updatedWishlist = alreadyInWishlist
      ? wishlistAlbums.filter((item) => item.id !== album.id)
      : [{ ...album, source: "wishlist" as const }, ...wishlistAlbums];

    localStorage.setItem("cdex-wishlist", JSON.stringify(updatedWishlist));
    setWishlistAlbums(updatedWishlist);

    showToast(
      alreadyInWishlist ? "Retiré de la wishlist." : "Ajouté à la wishlist."
    );
  }

  const allAlbums = useMemo(() => {
    const baseAlbums: Album[] = albums.map((album) => ({
      ...album,
      source: "database",
    }));

    return [...userAlbums, ...wishlistAlbums, ...baseAlbums];
  }, [userAlbums, wishlistAlbums]);

  const favoriteAlbums = allAlbums.filter((album) =>
    favorites.includes(album.id)
  );

  return (
    <main className="relative mx-auto min-h-screen max-w-md overflow-hidden px-5 pb-32 pt-5">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#f4f8ff]">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#2155ff]/20 blur-3xl" />
        <div className="absolute -right-24 top-64 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#ff4b4b]/10 blur-3xl" />
      </div>

      <button
        type="button"
        onClick={() => router.back()}
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-[1rem] border border-blue-100 bg-white/95 text-xl font-black text-[#2155ff] shadow-[0_10px_25px_rgba(33,85,255,0.16)] active:scale-95"
      >
        ‹
      </button>

      <section className="rounded-[2.2rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(33,85,255,0.14)] backdrop-blur-2xl">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#2155ff]">
          Favoris
        </p>

        <h1 className="text-[2.7rem] font-black leading-none tracking-tight text-[#2155ff]">
          Albums favoris
        </h1>

        <p className="mt-5 text-sm font-medium leading-7 text-[#5e6b85]">
          Retrouve ici les albums que tu as marqués comme favoris.
        </p>

        <Link
          href="/collection"
          className="mt-7 block rounded-2xl bg-[#2155ff] px-6 py-4 text-center text-base font-black text-white shadow-[0_12px_30px_rgba(33,85,255,0.35)] active:scale-95"
        >
          Voir la collection
        </Link>
      </section>

      {favoriteAlbums.length === 0 ? (
        <section className="mt-6 rounded-[2rem] border border-dashed border-blue-200 bg-white/70 p-6 text-center shadow-[0_12px_35px_rgba(33,85,255,0.10)]">
          <h2 className="text-2xl font-black text-[#2155ff]">
            Aucun favori
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#5e6b85]">
            Va dans ta collection et appuie sur le cœur d’un album.
          </p>
        </section>
      ) : (
        <section className="mt-6 grid grid-cols-2 gap-4">
          {favoriteAlbums.map((album) => {
            const isOwned = userAlbums.some((item) => item.id === album.id);
            const isInWishlist = wishlistAlbums.some(
              (item) => item.id === album.id
            );

            return (
              <article
                key={album.id}
                className="relative overflow-hidden rounded-[1.6rem] border border-white/80 bg-white/90 shadow-[0_14px_35px_rgba(33,85,255,0.13)] backdrop-blur-xl"
              >
                <Link href={`/album/${getAlbumPageId(album)}`} className="block">
                  <div className="relative aspect-square overflow-hidden bg-blue-50">
                    {album.cover ? (
                      <img
                        src={album.cover}
                        alt={album.title}
                        className={`h-full w-full object-cover transition duration-300 ${
                          !isOwned
                            ? "grayscale brightness-[0.5] contrast-[0.90] opacity-60"
                            : ""
                        }`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <div className="h-16 w-16 rounded-full border-4 border-blue-400 opacity-60" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.20),transparent_45%,rgba(255,255,255,0.12)_70%,transparent)]" />
                  </div>
                </Link>

                

                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleFavorite(album.id);
                  }}
                  className="absolute bottom-[12px] right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-[0_8px_18px_rgba(255,75,130,0.22)] active:scale-90"
                >
                  <img
                    src="/coeur-appuye.png"
                    alt="Favori"
                    className="h-12 w-12 object-contain"
                  />
                </button>

                <div className="p-4">
                  <h2 className="line-clamp-2 text-sm font-black leading-5 text-[#071f4f]">
                    {album.title}
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[#5e6b85]">
                    {album.artist || "Artiste inconnu"}
                  </p>

                  <p className="mt-2 text-[11px] font-black text-[#2155ff]">
                    {isOwned ? "Album ajouté" : "Non possédé"}
                  </p>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {toast && (
        <div className="fixed left-1/2 top-7 z-[999] w-[calc(100%-4rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-blue-100 bg-white/95 px-5 py-4 text-center text-sm font-black text-[#2155ff] shadow-[0_14px_35px_rgba(33,85,255,0.22)] backdrop-blur-xl">
          {toast}
        </div>
      )}
    </main>
  );
}