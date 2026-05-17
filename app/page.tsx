"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCollectionStats, getUserAlbums } from "./utils/stats";

export default function Home() {
  const [addOpen, setAddOpen] = useState(false);
  const [listenOpen, setListenOpen] = useState(false);

  const [stats, setStats] = useState({
    cdCount: 0,
    totalValue: 0,
  });

  useEffect(() => {
    const albums = getUserAlbums();
    const calculatedStats = getCollectionStats(albums);

    setStats({
      cdCount: calculatedStats.cdCount,
      totalValue: calculatedStats.totalValue,
    });
  }, []);

  return (
    <main className="mx-auto max-w-md px-5 py-6">
      <section className="rounded-[2.2rem] border border-blue-100/60 bg-white/80 p-7 shadow-[0_10px_40px_rgba(80,120,255,0.12)] backdrop-blur-xl">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-500">
          Bienvenue dans
        </p>

        <h1 className="text-6xl font-black leading-none text-[#2155ff]">
          CD<span className="text-[#ff4b4b]">ex</span>
        </h1>

        <p className="mt-6 text-base leading-7 text-[#5e6b85]">
          Le Pokédex moderne pour scanner, classer et admirer ta collection de CD.
        </p>

        <div className="relative mt-8 flex flex-col gap-3">
          <button
            onClick={() => {
              setAddOpen(!addOpen);
              setListenOpen(false);
            }}
            className="rounded-2xl bg-[#2155ff] px-6 py-4 text-center text-lg font-black text-white shadow-[0_8px_30px_rgba(33,85,255,0.35)]"
          >
            Ajouter à la collection
          </button>

          {addOpen && (
            <div className="rounded-3xl border border-blue-100 bg-white p-4 shadow-xl">
              <div className="flex flex-col gap-3">
                <Link
                  href="/scan"
                  className="rounded-2xl bg-blue-50 px-5 py-3 font-bold text-blue-700"
                >
                  Scanner un CD
                </Link>

                <Link
                  href="/add?mode=manual"
                  className="rounded-2xl bg-blue-50 px-5 py-3 font-bold text-blue-700"
                >
                  Ajouter manuellement
                </Link>

                <Link
                  href="/add/search"
                  className="rounded-2xl bg-blue-50 px-5 py-3 font-bold text-blue-700"
                >
                  Rechercher un album
                </Link>
              </div>
            </div>
          )}

          <Link
            href="/collection"
            className="rounded-2xl border border-blue-100 bg-[#edf5ff] px-6 py-4 text-center text-lg font-black text-[#2155ff]"
          >
            Voir ma collection
          </Link>

          <button
            onClick={() => {
              setListenOpen(!listenOpen);
              setAddOpen(false);
            }}
            className="rounded-2xl border border-blue-200 bg-white px-6 py-4 text-center text-lg font-black text-[#2155ff]"
          >
            Écouter
          </button>

          {listenOpen && (
            <div className="rounded-3xl border border-blue-100 bg-white p-4 shadow-xl">
              <div className="flex flex-col gap-3">
                <button className="rounded-2xl bg-green-50 px-5 py-3 font-bold text-green-700">
                  Spotify
                </button>

                <button className="rounded-2xl bg-purple-50 px-5 py-3 font-bold text-purple-700">
                  Deezer
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-blue-100/50 bg-white/75 p-6 shadow-lg">
        <h2 className="text-2xl font-black text-[#2155ff]">Mon profil</h2>

        <p className="mt-2 text-sm leading-6 text-[#5e6b85]">
          Résumé rapide de ta collection.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-3xl border border-blue-100 bg-white/80 p-5 shadow">
            <p className="text-xs font-bold uppercase tracking-wide text-[#5e6b85]">
              CD ajoutés
            </p>

            <p className="mt-2 text-4xl font-black text-[#2155ff]">
              {stats.cdCount}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white/80 p-5 shadow">
            <p className="text-xs font-bold uppercase tracking-wide text-[#5e6b85]">
              Valeur estimée
            </p>

            <p className="mt-2 text-4xl font-black text-[#2155ff]">
              {stats.totalValue}€
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <Link
          href="/wishlist"
          className="block rounded-[2rem] border border-blue-100 bg-white/80 px-6 py-5 text-center shadow-lg"
        >
          <p className="text-sm font-bold uppercase tracking-widest text-blue-500">
            Wishlist
          </p>

          <h2 className="mt-2 text-2xl font-black text-[#2155ff]">
            Voir ma wishlist
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#5e6b85]">
            Retrouve les albums que tu recherches ou souhaites ajouter plus tard.
          </p>
        </Link>
      </section>
    </main>
  );
}