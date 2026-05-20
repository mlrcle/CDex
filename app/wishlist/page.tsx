"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveCloudData } from "@/app/lib/cloudSave";

export default function WishlistPage() {
  const router = useRouter();

  const [wishlistAlbums, setWishlistAlbums] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ownedAlbums, setOwnedAlbums] = useState<any[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setWishlistAlbums(JSON.parse(localStorage.getItem("cdex-wishlist") || "[]"));
    setFavorites(JSON.parse(localStorage.getItem("cdex-favorites") || "[]"));
    setOwnedAlbums(JSON.parse(localStorage.getItem("cdex-user-albums") || "[]"));
  }, []);

  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 2200);
  }

  function getAlbumPageId(album: any) {
    return album.musicBrainzId || album.id;
  }

  function removeFromWishlist(id: string) {
    const updatedWishlist = wishlistAlbums.filter((album) => album.id !== id);

    localStorage.setItem("cdex-wishlist", JSON.stringify(updatedWishlist));
    setWishlistAlbums(updatedWishlist);
    saveCloudData();

    showToast("Retiré de la wishlist.");
  }

  function toggleFavorite(id: string) {
    const isAlreadyFavorite = favorites.includes(id);

    const updatedFavorites = isAlreadyFavorite
      ? favorites.filter((favoriteId) => favoriteId !== id)
      : [...favorites, id];

    localStorage.setItem("cdex-favorites", JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites);
    saveCloudData();

    showToast(isAlreadyFavorite ? "Retiré des favoris." : "Ajouté aux favoris.");
  }

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
          Wishlist
        </p>

        <h1 className="text-[2.7rem] font-black leading-none tracking-tight text-[#2155ff]">
          Mes envies
        </h1>

        <p className="mt-5 text-sm font-medium leading-7 text-[#5e6b85]">
          Garde ici les albums que tu aimerais trouver ou ajouter plus tard.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <Link
            href="/add/search?mode=wishlist"
            className="rounded-2xl bg-[#2155ff] px-6 py-4 text-center text-base font-black text-white shadow-[0_12px_30px_rgba(33,85,255,0.35)] active:scale-95"
          >
            Ajouter un album
          </Link>

          <Link
            href="/collection"
            className="rounded-2xl border border-blue-100 bg-[#edf5ff] px-6 py-4 text-center text-base font-black text-[#2155ff] active:scale-95"
          >
            Voir la collection
          </Link>
        </div>
      </section>

      {wishlistAlbums.length === 0 ? (
        <section className="mt-6 rounded-[2rem] border border-dashed border-blue-200 bg-white/70 p-6 text-center shadow-[0_12px_35px_rgba(33,85,255,0.10)]">
          <h2 className="text-2xl font-black text-[#2155ff]">Wishlist vide</h2>

          <p className="mt-3 text-sm leading-6 text-[#5e6b85]">
            Aucun album recherché pour le moment.
          </p>
        </section>
      ) : (
        <section className="mt-6 grid grid-cols-2 gap-4">
          {wishlistAlbums.map((album) => {
            const isFavorite = favorites.includes(album.id);
            const isOwned = ownedAlbums.some(
              (ownedAlbum) => ownedAlbum.id === album.id
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
                  className="absolute bottom-[72px] right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-[0_8px_18px_rgba(255,75,130,0.22)] active:scale-90"
                >
                  <img
                    src={isFavorite ? "/coeur-appuye.png" : "/coeur.png"}
                    alt="Favori"
                    className="h-7 w-7 object-contain"
                  />
                </button>

                <div className="p-4">
                  <h2 className="line-clamp-2 text-sm font-black leading-5 text-[#071f4f]">
                    {album.title}
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[#5e6b85]">
                    {album.artist || "Artiste inconnu"}
                  </p>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      removeFromWishlist(album.id);
                    }}
                    className="mt-4 w-full rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-black text-red-500 active:scale-95"
                  >
                    Retirer
                  </button>
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