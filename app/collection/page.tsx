"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { albums } from "../data/albums";

type Album = {
  id: string;
  title: string;
  artist?: string;
  year?: number | string;
  genre?: string;
  rarity?: string;
  discovered?: boolean;
  cover?: string;
  image?: string;
  coverUrl?: string;
  imageUrl?: string;
  musicBrainzId?: string;
  source?: "manual" | "search" | "scan" | "database" | "wishlist";
};

type FilterType = "all" | "owned" | "wishlist" | "favorites";

const rarityOrder: Record<string, number> = {
  "légendaire": 5,
  legendaire: 5,

  "épique": 4,
  epique: 4,

  "très rare": 3,
  "tres rare": 3,

  rare: 2,

  commun: 1,

 
};

function getAlbumCover(album: Album) {
  return album.cover || album.image || album.coverUrl || album.imageUrl || "";
}

function getRarityScore(album: Album) {
  const rarity = String(album.rarity || "commun").toLowerCase();
  return rarityOrder[rarity] || 0;
}

export default function CollectionPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("title");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [wishlistAlbums, setWishlistAlbums] = useState<Album[]>([]);
  const [userAlbums, setUserAlbums] = useState<Album[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  useEffect(() => {
    const savedFavorites = localStorage.getItem("cdex-favorites");
    const savedUserAlbums = localStorage.getItem("cdex-user-albums");
    const savedWishlist = localStorage.getItem("cdex-wishlist");

    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    if (savedUserAlbums) {
      const parsedAlbums = JSON.parse(savedUserAlbums);
      const cleanedAlbums = removeDuplicateAlbums(parsedAlbums);

      localStorage.setItem("cdex-user-albums", JSON.stringify(cleanedAlbums));
      setUserAlbums(cleanedAlbums);
    }

    if (savedWishlist) {
      const parsedWishlist = JSON.parse(savedWishlist).map((album: Album) => ({
        ...album,
        source: "wishlist",
      }));

      setWishlistAlbums(parsedWishlist);
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

  function toggleWishlist(album: Album) {
    setWishlistAlbums((current) => {
      const alreadyInWishlist = current.some((item) => item.id === album.id);

      const updatedWishlist = alreadyInWishlist
        ? current.filter((item) => item.id !== album.id)
        : [{ ...album, source: "wishlist" as const }, ...current];

      localStorage.setItem("cdex-wishlist", JSON.stringify(updatedWishlist));
      return updatedWishlist;
    });
  }

  const allAlbums = useMemo(() => {
  return removeDuplicateAlbums([
    ...userAlbums,
    ...wishlistAlbums,
    ...albums.filter((album) => favorites.includes(album.id)),
  ]);
}, [userAlbums, wishlistAlbums, favorites]); 

  const filteredAlbums = useMemo(() => {
    return [...allAlbums]
      .filter((album) => {
        const query = search.toLowerCase();

        const matchesSearch =
          album.title?.toLowerCase().includes(query) ||
          album.artist?.toLowerCase().includes(query) ||
          album.genre?.toLowerCase().includes(query);

        const isOwned = userAlbums.some((item) => item.id === album.id);
        const isWishlist = wishlistAlbums.some((item) => item.id === album.id);
        const isFavorite = favorites.includes(album.id);

        const matchesFilter =
  activeFilter === "all"
    ? isOwned || isWishlist || isFavorite
    : activeFilter === "owned"
      ? isOwned
      : activeFilter === "wishlist"
        ? isWishlist
        : isFavorite;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sort === "artist") {
          return String(a.artist || "").localeCompare(String(b.artist || ""));
        }

        if (sort === "genre") {
          return String(a.genre || "").localeCompare(String(b.genre || ""));
        }

        if (sort === "year") {
          return Number(a.year || 0) - Number(b.year || 0);
        }

        if (sort === "rarity") {
          return getRarityScore(b) - getRarityScore(a);
        }

        return String(a.title || "").localeCompare(String(b.title || ""));
      });
  }, [allAlbums, search, sort, activeFilter, favorites, wishlistAlbums]);

  return (
    <main className="relative mx-auto min-h-screen max-w-md overflow-hidden px-5 pb-32 pt-5">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#f4f8ff]">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#2155ff]/20 blur-3xl" />
        <div className="absolute -right-24 top-64 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#ff4b4b]/10 blur-3xl" />
      </div>

      <section className="rounded-[2.4rem] border border-white/70 bg-white/75 p-5 shadow-[0_20px_60px_rgba(33,85,255,0.12)] backdrop-blur-2xl">
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/90 px-4 py-4 shadow-sm">
          <span className="text-xl text-[#2155ff]">⌕</span>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un album, artiste, genre..."
            className="w-full bg-transparent text-sm font-semibold text-[#071f4f] outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          <FilterButton active={activeFilter === "all"} onClick={() => setActiveFilter("all")}>
            Tous
          </FilterButton>

          <FilterButton active={activeFilter === "owned"} onClick={() => setActiveFilter("owned")}>
            Possédés
          </FilterButton>

          <FilterButton active={activeFilter === "wishlist"} onClick={() => setActiveFilter("wishlist")}>
            Souhaits
          </FilterButton>

          <FilterButton active={activeFilter === "favorites"} onClick={() => setActiveFilter("favorites")}>
            Favoris
          </FilterButton>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="relative">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-blue-100 bg-white/90 px-4 py-4 text-sm font-black text-blue-700 shadow-sm outline-none"
            >
              <option value="title">Nom</option>
              <option value="artist">Artiste</option>
              <option value="genre">Genre</option>
              <option value="year">Année</option>
              <option value="rarity">Rareté</option>
            </select>

            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-blue-400">
              ▼
            </div>
          </div>

          <SmallStat label="Ajoutés" value={userAlbums.length} />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-3">
        {filteredAlbums.map((album) => {
          const cover = getAlbumCover(album);
          const isFavorite = favorites.includes(album.id);

          return (
            <article
              key={album.id}
              className="group relative overflow-hidden rounded-[1rem] border border-white/70 bg-white/90 shadow-[0_10px_28px_rgba(33,85,255,0.12)] backdrop-blur-xl transition duration-300 active:scale-95"
            >
              <div className="absolute bottom-[5px] right-1.5 z-20 flex gap-1">
                <button
  type="button"
  onClick={(event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(album.id);
  }}
  className="flex h-6 w-6 items-center justify-center rounded-full transition active:scale-90"
>
                  <Image
                    src={isFavorite ? "/coeur-appuye.png" : "/coeur.png"}
                    alt="Favori"
                    width={24}
                    height={24}
                    className="h-full w-full object-contain"
                  />
                </button>
              </div>

              <Link
  href={`/album/${album.musicBrainzId || album.id}`}
  className="block"
>
                <div className="relative aspect-square overflow-hidden bg-blue-50">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={album.title || "Album"}
                      fill
                      className={`object-cover transition duration-300 group-hover:scale-105 ${
  !userAlbums.some((item) => item.id === album.id)
    ? "grayscale brightness-[0.5] contrast-[0.90] opacity-60"
    : ""
}`}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <div className="h-10 w-10 rounded-full border-4 border-blue-400 opacity-60" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_40%,rgba(255,255,255,0.1)_70%,transparent)]" />
                </div>

                <div className="bg-white px-2.5 pb-3 pt-2">
                  <h2 className="line-clamp-1 text-[11px] font-black leading-4 text-[#071f4f]">
                    {album.title}
                  </h2>

                  <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-[#5e6b85]">
                    {album.artist || "Artiste inconnu"}
                  </p>
                </div>
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
        active
          ? "bg-[#2155ff] text-white shadow-[0_10px_25px_rgba(33,85,255,0.3)]"
          : "border border-blue-100 bg-white/80 text-[#2155ff]"
      }`}
    >
      {children}
    </button>
  );
}

function SmallStat({ label, value }: { label: string | number; value: string | number }) {
  return (
    <div className="rounded-2xl border border-blue-100/70 bg-white/80 px-4 py-3 text-center shadow-sm backdrop-blur-xl">
      <p className="text-[10px] font-black uppercase tracking-wide text-blue-950/45">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-[#2155ff]">{value}</p>
    </div>
  );
}

function removeDuplicateAlbums(albumsToClean: Album[]) {
  const uniqueAlbums = new Map<string, Album>();

  albumsToClean.forEach((album) => {
    const key =
      album.musicBrainzId ||
      album.id ||
      `${album.title}-${album.artist}`.toLowerCase();

    if (!uniqueAlbums.has(key)) {
      uniqueAlbums.set(key, album);
    }
  });

  return Array.from(uniqueAlbums.values());
}