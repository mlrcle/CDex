"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { albums } from "../data/albums";

type Album = {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  discovered: boolean;
  favorite?: boolean;
  cover: string;
  rarity?: string;
  duration?: string;
  estimatedValue?: string;
  addedAt?: string;
  tracks?: string[];
  source?: "manual" | "search" | "scan" | "database";
};

export default function CollectionPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("title");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userAlbums, setUserAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("cdex-favorites");
    const savedUserAlbums = localStorage.getItem("cdex-user-albums");

    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    if (savedUserAlbums) {
      setUserAlbums(JSON.parse(savedUserAlbums));
    }
  }, []);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const updatedFavorites = current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id];

      localStorage.setItem("cdex-favorites", JSON.stringify(updatedFavorites));

      return updatedFavorites;
    });
  }

  const allAlbums = useMemo(() => {
    const baseAlbums: Album[] = albums.map((album) => ({
      ...album,
      source: "database",
    }));

    return [...userAlbums, ...baseAlbums];
  }, [userAlbums]);

  const filteredAlbums = useMemo(() => {
    return [...allAlbums]
      .filter((album) => {
        const query = search.toLowerCase();

        return (
          album.title.toLowerCase().includes(query) ||
          album.artist.toLowerCase().includes(query) ||
          album.genre.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sort === "artist") return a.artist.localeCompare(b.artist);
        if (sort === "genre") return a.genre.localeCompare(b.genre);
        if (sort === "year") return a.year - b.year;
        if (sort === "source") return String(a.source).localeCompare(String(b.source));
        return a.title.localeCompare(b.title);
      });
  }, [allAlbums, search, sort]);

  return (
    <main className="mx-auto max-w-md px-5 py-6">
      <section className="rounded-[2.2rem] border border-blue-100/60 bg-white/80 p-6 shadow-[0_10px_40px_rgba(80,120,255,0.12)]">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-500">
          Collection
        </p>

        <h1 className="text-5xl font-black leading-none text-[#2155ff]">
          Albums
        </h1>

        <p className="mt-4 text-sm leading-6 text-[#5e6b85]">
          Les albums ajoutés manuellement, par recherche ou par scan apparaîtront ici.
        </p>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un album, artiste, genre..."
          className="mt-6 w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold text-[#071f4f] outline-none placeholder:text-slate-400 focus:border-blue-400"
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold text-blue-700 outline-none"
          >
            <option value="title">Trier par nom</option>
            <option value="artist">Trier par auteur</option>
            <option value="genre">Trier par genre</option>
            <option value="year">Trier par date</option>
            <option value="source">Trier par source</option>
          </select>

          <Link
            href="/favorites"
            className="rounded-2xl border border-blue-100 bg-[#edf5ff] px-4 py-3 text-center text-sm font-black text-[#2155ff]"
          >
            Favoris
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-center">
            <p className="text-xs font-bold text-[#5e6b85]">Ajoutés</p>
            <p className="text-2xl font-black text-[#2155ff]">
              {userAlbums.length}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-center">
            <p className="text-xs font-bold text-[#5e6b85]">Base visible</p>
            <p className="text-2xl font-black text-[#2155ff]">
              {albums.length}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4">
        {filteredAlbums.map((album) => {
          const isFavorite = favorites.includes(album.id);
          const isUserAlbum = album.source !== "database";

          return (
            <div
              key={album.id}
              className="relative rounded-[1.6rem] border border-blue-100 bg-white/80 p-3 shadow-lg"
            >
              <button
                onClick={() => toggleFavorite(album.id)}
                className={`absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border text-lg font-black shadow ${
                  isFavorite
                    ? "border-yellow-300 bg-yellow-100 text-yellow-500"
                    : "border-blue-100 bg-white/90 text-blue-300"
                }`}
              >
                ★
              </button>

              <Link href={`/album/${album.id}`}>
                <div className="aspect-square overflow-hidden rounded-[1.2rem] bg-blue-50">
                  {album.cover ? (
                    <img
                      src={album.cover}
                      alt={album.title}
                      className={`h-full w-full object-cover transition ${
                        album.discovered
                          ? "opacity-100"
                          : "grayscale opacity-45"
                      }`}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <div className="h-16 w-16 rounded-full border-4 border-blue-400 opacity-60" />
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <h2 className="line-clamp-2 text-sm font-black text-[#071f4f]">
                    {album.title}
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[#5e6b85]">
                    {album.artist}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                      {album.genre}
                    </span>

                    {album.year !== 0 && (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                        {album.year}
                      </span>
                    )}

                    {isUserAlbum && (
                      <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-600">
                        Ajouté
                      </span>
                    )}
                  </div>

                  {!album.discovered && !isUserAlbum && (
                    <p className="mt-2 text-[11px] font-bold text-slate-400">
                      Non découvert
                    </p>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </section>
    </main>
  );
}