"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [description, setDescription] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedDescription = localStorage.getItem("cdex-profile-description");

    if (savedDescription) {
      setDescription(savedDescription);
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem("cdex-profile-description", description);
  }, [description, isLoaded]);

  return (
    <main className="mx-auto max-w-md px-5 py-6">
      <section className="rounded-[2.2rem] border border-blue-100/60 bg-white/80 p-7 shadow-[0_10px_40px_rgba(80,120,255,0.12)]">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-500">
          Profil
        </p>

        <h1 className="text-5xl font-black leading-none text-[#2155ff]">
          Mon profil
        </h1>

        <p className="mt-5 text-base leading-7 text-[#5e6b85]">
          Ton espace personnel : statistiques, goûts musicaux, amis, favoris et wishlist.
        </p>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4">
        <StatCard label="CD ajoutés" value="0" />
        <StatCard label="Niveau" value="0" />
        <StatCard label="Durée totale" value="0 min" />
        <StatCard label="Valeur estimée" value="0 €" />
      </section>

      <section className="mt-6 rounded-[2rem] border border-blue-100/60 bg-white/80 p-6 shadow-lg">
        <h2 className="text-2xl font-black text-[#2155ff]">
          Description personnelle
        </h2>

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Écris une petite description de ton profil, de tes goûts musicaux ou de ta collection..."
          rows={5}
          className="mt-4 w-full resize-none rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold outline-none focus:border-blue-400"
        />

        <p className="mt-3 text-xs font-bold text-blue-400">
          Sauvegarde automatique sur cet appareil.
        </p>
      </section>

      <section className="mt-6 rounded-[2rem] border border-blue-100/60 bg-white/80 p-6 shadow-lg">
        <h2 className="text-2xl font-black text-[#2155ff]">
          Goûts favoris
        </h2>

        <div className="mt-5 grid gap-3">
          <PreferenceCard title="Genre favori" value="Aucun pour le moment" />
          <PreferenceCard title="Artiste favori" value="Aucun pour le moment" />
        </div>

        <p className="mt-4 text-xs font-bold text-blue-400">
          Ces données seront calculées automatiquement à partir de ta collection.
        </p>
      </section>

      <section className="mt-6 rounded-[2rem] border border-blue-100/60 bg-white/80 p-6 shadow-lg">
        <h2 className="text-2xl font-black text-[#2155ff]">Amis</h2>

        <div className="mt-5 rounded-[1.5rem] border border-dashed border-blue-200 bg-blue-50/70 p-5 text-center">
          <p className="text-sm font-bold text-[#5e6b85]">
            Aucun ami ajouté pour le moment.
          </p>
        </div>

        <Link
          href="/community"
          className="mt-5 block rounded-2xl bg-[#2155ff] px-6 py-4 text-center text-lg font-black text-white shadow-[0_8px_30px_rgba(33,85,255,0.35)]"
        >
          Trouver des amis
        </Link>
      </section>

      <section className="mt-6 grid gap-3">
        <Link
          href="/wishlist"
          className="rounded-2xl border border-blue-100 bg-white/80 px-6 py-4 text-center text-lg font-black text-[#2155ff] shadow"
        >
          Voir ma wishlist
        </Link>

        <Link
          href="/favorites"
          className="rounded-2xl border border-blue-100 bg-white/80 px-6 py-4 text-center text-lg font-black text-[#2155ff] shadow"
        >
          Voir mes favoris
        </Link>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-blue-100 bg-white/80 p-5 shadow">
      <p className="text-xs font-bold uppercase tracking-wide text-[#5e6b85]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-[#2155ff]">
        {value}
      </p>
    </div>
  );
}

function PreferenceCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[#5e6b85]">
        {title}
      </p>

      <p className="mt-1 text-lg font-black text-[#071f4f]">
        {value}
      </p>
    </div>
  );
}