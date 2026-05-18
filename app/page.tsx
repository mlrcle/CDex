"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCollectionStats, getUserAlbums } from "./utils/stats";

type Album = {
  id: string;
  title: string;
  artist: string;
  year?: string | number;
  cover?: string;
  image?: string;
  coverUrl?: string;
  imageUrl?: string;
  cover_url?: string;
  image_url?: string;
  artwork?: string;
  thumbnail?: string;
  favorite?: boolean;
  estimatedValue?: number;
};

function getAlbumCover(album?: Album) {
  return (
    album?.cover ||
    album?.image ||
    album?.coverUrl ||
    album?.imageUrl ||
    album?.cover_url ||
    album?.image_url ||
    album?.artwork ||
    album?.thumbnail ||
    ""
  );
}

export default function Home() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [wishlistAlbums, setWishlistAlbums] = useState<Album[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stats, setStats] = useState({
    cdCount: 0,
    totalValue: 0,
  });

  useEffect(() => {
    const rawAlbums = getUserAlbums();
    const userAlbums: Album[] = (rawAlbums as unknown[]).map((a: unknown) => {
      const album = a as Record<string, unknown>;
      return {
        id: String(album.id ?? ""),
        title: String(album.title ?? ""),
        artist: String(album.artist ?? ""),
        year: album.year as string | number | undefined,
        cover: album.cover as string | undefined,
        image: album.image as string | undefined,
        coverUrl: album.coverUrl as string | undefined,
        imageUrl: album.imageUrl as string | undefined,
        cover_url: album.cover_url as string | undefined,
        image_url: album.image_url as string | undefined,
        artwork: album.artwork as string | undefined,
        thumbnail: album.thumbnail as string | undefined,
        favorite: album.favorite as boolean | undefined,
        estimatedValue: album.estimatedValue as number | undefined,
      };
    });

    const calculatedStats = getCollectionStats(userAlbums as never);

    const savedWishlist = localStorage.getItem("cdex-wishlist");
    const parsedWishlist: Album[] = savedWishlist
      ? (JSON.parse(savedWishlist) as unknown[]).map((a: unknown) => {
          const album = a as Record<string, unknown>;
          return {
            id: String(album.id ?? ""),
            title: String(album.title ?? ""),
            artist: String(album.artist ?? ""),
            year: album.year as string | number | undefined,
            cover: album.cover as string | undefined,
            image: album.image as string | undefined,
            coverUrl: album.coverUrl as string | undefined,
            imageUrl: album.imageUrl as string | undefined,
            cover_url: album.cover_url as string | undefined,
            image_url: album.image_url as string | undefined,
            artwork: album.artwork as string | undefined,
            thumbnail: album.thumbnail as string | undefined,
            favorite: album.favorite as boolean | undefined,
            estimatedValue: album.estimatedValue as number | undefined,
          };
        })
      : [];

    const savedFavorites = localStorage.getItem("cdex-favorites");
    const parsedFavorites: string[] = savedFavorites
      ? JSON.parse(savedFavorites)
      : [];

    setAlbums(userAlbums);
    setWishlistAlbums(parsedWishlist);
    setFavorites(parsedFavorites);
    setStats({
      cdCount: calculatedStats.cdCount,
      totalValue: calculatedStats.totalValue,
    });
  }, []);

  const recentAlbums = useMemo(() => albums.slice(0, 6), [albums]);

  const latestAlbum = useMemo(() => {
    const reversed = [...albums].reverse();
    return reversed.find((album) => getAlbumCover(album)) || reversed[0];
  }, [albums]);

  const displayedWishlistAlbums = useMemo(() => {
    return wishlistAlbums.slice(0, 10);
  }, [wishlistAlbums]);

  return (
    <main className="relative mx-auto min-h-screen max-w-md overflow-hidden px-5 pb-32 pt-5">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#f4f8ff]">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#2155ff]/20 blur-3xl" />
        <div className="absolute -right-24 top-64 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#ff4b4b]/10 blur-3xl" />
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-white/75 p-6 shadow-[0_20px_60px_rgba(33,85,255,0.16)] backdrop-blur-2xl">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#2155ff]/10 blur-2xl" />
        <HeroLatestAlbum album={latestAlbum} />
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#2155ff]">
          Accueil
        </p>
        <h1 className="mt-3 max-w-[250px] text-5xl font-black leading-[0.95] tracking-tight text-blue-950">
          Ta collection CD
        </h1>
        <p className="mt-4 max-w-[250px] text-sm font-semibold leading-6 text-blue-950/55">
          Retrouve tes albums, tes favoris, ta wishlist et les infos de ta
          collection.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <StatCard label="CD possédés" value={stats.cdCount} />
          <StatCard label="Valeur estimée" value={`${stats.totalValue} €`} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href="/add"
            className="rounded-2xl bg-[#2155ff] px-4 py-4 text-center text-sm font-black text-white shadow-[0_12px_35px_rgba(33,85,255,0.35)] transition active:scale-95"
          >
            Ajouter
          </Link>
          <Link
            href="/collection"
            className="rounded-2xl border border-blue-100 bg-white/80 px-4 py-4 text-center text-sm font-black text-[#2155ff] shadow-sm transition active:scale-95"
          >
            Collection
          </Link>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="mt-5 grid grid-cols-3 gap-3">
        <QuickAction href="/favorites" icon="/coeur.png" label="Favoris" />
        <QuickAction href="/wishlist" icon="/etoile.png" label="Wishlist" />
        <QuickAction href="/profile" icon="▣" label="Stats" />
      </section>

      {/* RECENT ALBUMS */}
      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2155ff]">
              Récents
            </p>
            <h2 className="text-2xl font-black tracking-tight text-blue-950">
              Derniers albums
            </h2>
          </div>
          <Link
            href="/collection"
            className="rounded-full bg-white/80 px-4 py-2 text-xs font-black text-[#2155ff] shadow-sm"
          >
            Voir tout
          </Link>
        </div>
        {recentAlbums.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {recentAlbums.map((album) => (
              <AlbumMiniCard key={album.id} album={album} />
            ))}
          </div>
        ) : (
          <EmptyCard text="Aucun album ajouté pour le moment." />
        )}
      </section>

      {/* STATS */}
      <section className="mt-6 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_15px_45px_rgba(33,85,255,0.12)] backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2155ff]">
              Statistiques
            </p>
            <h2 className="mt-1 text-2xl font-black text-blue-950">
              Ta collection
            </h2>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl shadow-inner">
            💿
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <SmallStat label="Albums" value={stats.cdCount} />
          <SmallStat label="Favoris" value={favorites.length} />
          <SmallStat label="Wishlist" value={wishlistAlbums.length} />
        </div>
        <Link
          href="/profile"
          className="mt-5 block rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-center text-sm font-black text-[#2155ff] transition active:scale-95"
        >
          Voir mes statistiques
        </Link>
      </section>

      {/* WISHLIST */}
      <section className="mt-6 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_15px_45px_rgba(33,85,255,0.12)] backdrop-blur-2xl">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2155ff]">
              Wishlist
            </p>
            <h2 className="mt-1 text-2xl font-black text-blue-950">
              Albums souhaités
            </h2>
          </div>
          <Link
            href="/wishlist"
            className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-[#2155ff]"
          >
            Voir tout
          </Link>
        </div>
        {displayedWishlistAlbums.length > 0 ? (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
            {displayedWishlistAlbums.map((album) => (
              <WishlistCard key={album.id} album={album} />
            ))}
          </div>
        ) : (
          <EmptyCard text="Ta wishlist est vide pour le moment." />
        )}
      </section>
    </main>
  );
}

/* ========================= */
/* HERO CD */
/* ========================= */

function HeroLatestAlbum({ album }: { album?: Album }) {
  const cover = getAlbumCover(album);

  return (
    <div className="pointer-events-none absolute right-2 top-4 h-[150px] w-[170px]">
      {album && cover ? (
        <div className="relative h-full w-full">
          <CDCase3D cover={cover} title={album.title} />
        </div>
      ) : (
        <div className="absolute right-6 top-4 h-24 w-24 rounded-full bg-[conic-gradient(from_0deg,#2155ff,#7dd3fc,#ffffff,#ff4b4b,#2155ff)] p-[7px] shadow-[0_20px_50px_rgba(33,85,255,0.25)]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
            <div className="h-7 w-7 rounded-full border-[6px] border-blue-100 bg-white shadow-inner" />
          </div>
        </div>
      )}
    </div>
  );
}

function CDCase3D({ cover, title }: { cover: string; title: string }) {
  return (
    <div className="cdex-hero-album-float relative h-[145px] w-[170px]">
      <div className="absolute inset-0 translate-x-4 translate-y-5 rounded-[1.4rem] bg-[#2155ff]/20 blur-2xl" />
      <div
        className="absolute overflow-hidden bg-blue-100 shadow-[0_10px_30px_rgba(33,85,255,0.24)]"
        style={{
          left: "15%",
          top: "10%",
          width: "60%",
          height: "75%",
          transform: "skewY(11deg) rotate(0deg)",
          borderRadius: "0px",
        }}
      >
        <Image src={cover} alt={title} fill className="object-cover" sizes="110px" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.28),transparent_40%,rgba(255,255,255,0.18)_70%,transparent)]" />
      </div>
      <Image
        src="/mockups/cd-case-3d.png"
        alt="Boîtier CD"
        fill
        className="pointer-events-none object-contain"
        sizes="170px"
        priority
      />
    </div>
  );
}

/* ========================= */
/* ALBUM CARDS */
/* ========================= */

function AlbumMiniCard({ album }: { album: Album }) {
  const cover = getAlbumCover(album);

  return (
    <Link
      href={`/album/${album.id}`}
      className="group relative overflow-hidden rounded-[1rem] border border-white/70 bg-white/90 shadow-[0_10px_28px_rgba(33,85,255,0.12)] backdrop-blur-xl transition active:scale-95"
    >
      <div className="absolute right-1.5 bottom-[5px] z-20 flex h-6 w-6 items-center justify-center rounded-full">
        <Image src="/coeur.png" alt="Favori" width={24} height={24} className="h-full w-full object-contain" />
      </div>
      <div className="relative aspect-square overflow-hidden bg-blue-50">
        {cover ? (
          <Image
            src={cover}
            alt={album.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <div className="h-10 w-10 rounded-full bg-white shadow-inner" />
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_40%,rgba(255,255,255,0.1)_70%,transparent)]" />
      </div>
      <div className="bg-white px-2.5 pb-3 pt-2">
        <h3 className="line-clamp-1 text-[11px] font-black leading-4 text-[#071f4f]">{album.title}</h3>
        <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-[#5e6b85]">
          {album.artist || "Artiste inconnu"}
        </p>
      </div>
    </Link>
  );
}

function WishlistCard({ album }: { album: Album }) {
  const cover = getAlbumCover(album);

  return (
    <Link
      href={`/album/${album.id}`}
      className="group relative min-w-[105px] overflow-hidden rounded-[1rem] border border-white/70 bg-white/90 shadow-[0_10px_28px_rgba(33,85,255,0.12)] backdrop-blur-xl transition active:scale-95"
    >
      <div className="absolute right-1.5 bottom-[5px] z-20 flex h-6 w-6 items-center justify-center rounded-full">
        <Image src="/coeur.png" alt="Favori" width={24} height={24} className="h-full w-full object-contain" />
      </div>
      <div className="relative aspect-square overflow-hidden bg-blue-50">
        {cover ? (
          <Image
            src={cover}
            alt={album.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <div className="h-10 w-10 rounded-full bg-white shadow-inner" />
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_40%,rgba(255,255,255,0.1)_70%,transparent)]" />
      </div>
      <div className="bg-white px-2.5 pb-3 pt-2">
        <h3 className="line-clamp-1 text-[11px] font-black leading-4 text-[#071f4f]">{album.title}</h3>
        <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-[#5e6b85]">
          {album.artist || "Artiste inconnu"}
        </p>
      </div>
    </Link>
  );
}

/* ========================= */
/* UI */
/* ========================= */

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.4rem] border border-blue-100/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
      <p className="text-[10px] font-black uppercase tracking-wide text-blue-950/45">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#2155ff]">{value}</p>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.3rem] bg-blue-50/80 p-3 text-center">
      <p className="text-lg font-black text-[#2155ff]">{value}</p>
      <p className="mt-1 text-[9px] font-black uppercase text-blue-950/45">{label}</p>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
  const isImageIcon = icon.endsWith(".png");

  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center rounded-[1.6rem] border border-white/70 bg-white/75 px-3 py-4 text-center shadow-[0_12px_35px_rgba(33,85,255,0.1)] backdrop-blur-xl transition active:scale-95"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
        {isImageIcon ? (
          <Image src={icon} alt={label} width={34} height={34} className="h-8 w-8 object-contain" />
        ) : (
          <span className="text-xl font-black text-[#2155ff]">{icon}</span>
        )}
      </div>
      <p className="mt-2 text-[11px] font-black text-blue-950">{label}</p>
    </Link>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-blue-100/70 bg-blue-50/60 p-4 text-center text-sm font-bold text-blue-950/45">
      {text}
    </div>
  );
}