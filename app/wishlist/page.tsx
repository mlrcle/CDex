"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const router = useRouter();

  const [wishlistAlbums, setWishlistAlbums] = useState<any[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem("cdex-wishlist");

    if (savedWishlist) {
      setWishlistAlbums(JSON.parse(savedWishlist));
    }
  }, []);

  function removeFromWishlist(id: string) {
    const updatedWishlist = wishlistAlbums.filter(
      (album) => album.id !== id
    );

    localStorage.setItem(
      "cdex-wishlist",
      JSON.stringify(updatedWishlist)
    );

    setWishlistAlbums(updatedWishlist);
  }

  return (
    <main className="mx-auto max-w-md px-5 py-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-blue-100 bg-white/90 text-2xl font-black text-[#2155ff] shadow"
      >
        ←
      </button>

      <section className="rounded-[2.2rem] border border-blue-100/60 bg-white/80 p-7 shadow-[0_10px_40px_rgba(80,120,255,0.12)]">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-500">
          Wishlist
        </p>

        <h1 className="text-5xl font-black leading-none text-[#2155ff]">
          Mes envies
        </h1>

        <p className="mt-5 text-base leading-7 text-[#5e6b85]">
          Garde ici les albums que tu aimerais trouver ou ajouter plus tard.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <Link
            href="/add/search?mode=wishlist"
            className="rounded-2xl bg-[#2155ff] px-6 py-4 text-center text-lg font-black text-white shadow-[0_8px_30px_rgba(33,85,255,0.35)]"
          >
            Ajouter un album
          </Link>

          <Link
            href="/collection"
            className="rounded-2xl border border-blue-100 bg-[#edf5ff] px-6 py-4 text-center text-lg font-black text-[#2155ff]"
          >
            Voir la collection
          </Link>
        </div>
      </section>

      {wishlistAlbums.length === 0 ? (
        <section className="mt-6 rounded-[2rem] border border-dashed border-blue-200 bg-blue-50/70 p-6 text-center">
          <h2 className="text-2xl font-black text-[#2155ff]">
            Wishlist vide
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#5e6b85]">
            Aucun album recherché pour le moment.
          </p>
        </section>
      ) : (
        <section className="mt-6 grid grid-cols-2 gap-4">
          {wishlistAlbums.map((album) => (
            <article
              key={album.id}
              className="overflow-hidden rounded-[1.8rem] border border-blue-100 bg-white/80 shadow-lg"
            >
              <Link href={`/album/${album.id}`}>
                <div className="aspect-square overflow-hidden bg-blue-50">
                  {album.cover ? (
                    <img
                      src={album.cover}
                      alt={album.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <div className="h-16 w-16 rounded-full border-4 border-blue-400 opacity-60" />
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <h2 className="line-clamp-2 text-sm font-black text-[#071f4f]">
                  {album.title}
                </h2>

                <p className="mt-1 text-xs font-semibold text-[#5e6b85]">
                  {album.artist}
                </p>

                <button
                  onClick={() => removeFromWishlist(album.id)}
                  className="mt-4 w-full rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-black text-red-500"
                >
                  Retirer
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}