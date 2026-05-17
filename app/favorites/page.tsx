"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { albums } from "../data/albums";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("cdex-favorites");

    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const favoriteAlbums = albums.filter((album) => favorites.includes(album.id));

  return (
    <main className="mx-auto max-w-md px-5 py-6">
      <section className="rounded-[2.2rem] border border-blue-100/60 bg-white/80 p-7 shadow-[0_10px_40px_rgba(80,120,255,0.12)]">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-500">
          Favoris
        </p>

        <h1 className="text-5xl font-black leading-none text-[#2155ff]">
          Albums favoris
        </h1>

        <p className="mt-5 text-base leading-7 text-[#5e6b85]">
          Retrouve ici les albums que tu as marqués comme favoris.
        </p>
      </section>

      {favoriteAlbums.length === 0 ? (
        <section className="mt-6 rounded-[2rem] border border-dashed border-blue-200 bg-blue-50/70 p-6 text-center">
          <h2 className="text-2xl font-black text-[#2155ff]">
            Aucun favori
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#5e6b85]">
            Va dans ta collection et appuie sur l’étoile d’un album.
          </p>

          <Link
            href="/collection"
            className="mt-6 block rounded-2xl bg-[#2155ff] px-6 py-4 text-center text-lg font-black text-white shadow-[0_8px_30px_rgba(33,85,255,0.35)]"
          >
            Voir la collection
          </Link>
        </section>
      ) : (
        <section className="mt-6 grid grid-cols-2 gap-4">
          {favoriteAlbums.map((album) => (
            <Link
              key={album.id}
              href={`/album/${album.id}`}
              className="rounded-[1.6rem] border border-yellow-200 bg-white/80 p-3 shadow-lg"
            >
              <div className="aspect-square overflow-hidden rounded-[1.2rem] bg-blue-50">
                <img
                  src={album.cover}
                  alt={album.title}
                  className={`h-full w-full object-cover ${
                    album.discovered ? "opacity-100" : "grayscale opacity-45"
                  }`}
                />
              </div>

              <div className="mt-3">
                <h2 className="line-clamp-2 text-sm font-black text-[#071f4f]">
                  {album.title}
                </h2>

                <p className="mt-1 text-xs font-semibold text-[#5e6b85]">
                  {album.artist}
                </p>

                <p className="mt-2 text-[11px] font-bold text-yellow-500">
                  ★ Favori
                </p>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}