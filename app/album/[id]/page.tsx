"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { albums } from "../../data/albums";

export default function AlbumPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = params.id as string;

  const album = albums.find((item) => item.id === albumId);

  const [listenOpen, setListenOpen] = useState(false);

  const [personalNote, setPersonalNote] = useState("");
  const [personalDescription, setPersonalDescription] = useState("");
  const [condition, setCondition] = useState(0);

  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = useMemo(() => {
    return `cdex-album-${albumId}`;
  }, [albumId]);

  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);

        setPersonalNote(parsedData.personalNote ?? "");
        setPersonalDescription(parsedData.personalDescription ?? "");
        setCondition(parsedData.condition ?? 0);
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    setIsLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!isLoaded) return;

    const dataToSave = {
      personalNote,
      personalDescription,
      condition,
    };

    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  }, [
    personalNote,
    personalDescription,
    condition,
    storageKey,
    isLoaded,
  ]);

  if (!album) {
    return (
      <main className="mx-auto max-w-md px-5 py-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-blue-100 bg-white/90 text-2xl font-black text-[#2155ff] shadow"
        >
          ←
        </button>

        <section className="rounded-[2.2rem] border border-blue-100/60 bg-white/80 p-7 text-center shadow-[0_10px_40px_rgba(80,120,255,0.12)]">
          <h1 className="text-3xl font-black text-[#2155ff]">
            Album introuvable
          </h1>

          <Link
            href="/collection"
            className="mt-6 block rounded-2xl bg-[#2155ff] px-6 py-4 text-center text-lg font-black text-white"
          >
            Voir la collection
          </Link>
        </section>
      </main>
    );
  }

  function deleteAlbum() {
    alert(
      "La suppression sera activée quand la vraie collection sera sauvegardée."
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 py-6">
      {/* RETOUR */}

      <button
        onClick={() => router.back()}
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-blue-100 bg-white/90 text-2xl font-black text-[#2155ff] shadow"
      >
        ←
      </button>

      {/* HEADER */}

      <section className="overflow-hidden rounded-[2.2rem] border border-blue-100/60 bg-white/80 shadow-[0_10px_40px_rgba(80,120,255,0.12)]">
        <div className="p-5">
          <div className="aspect-square overflow-hidden rounded-[1.8rem] bg-blue-50 shadow-lg">
            <img
              src={album.cover}
              alt={album.title}
              className={`h-full w-full object-cover ${
                album.discovered ? "opacity-100" : "grayscale opacity-50"
              }`}
            />
          </div>
        </div>

        <div className="px-7 pb-7">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-500">
            {album.rarity}
          </p>

          <h1 className="mt-2 text-5xl font-black leading-none text-[#2155ff]">
            {album.title}
          </h1>

          <p className="mt-3 text-xl font-bold text-[#071f4f]">
            {album.artist}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Info label="Date" value={String(album.year)} />
            <Info label="Genre" value={album.genre} />
            <Info label="Durée" value={album.duration} />
            <Info label="Valeur" value={album.estimatedValue} />
            <Info label="Ajouté le" value={album.addedAt} />
            <Info label="Rareté" value={album.rarity} />
          </div>
        </div>
      </section>

      {/* TRACKLIST */}

      <section className="mt-6 rounded-[2rem] border border-blue-100/60 bg-white/80 p-6 shadow-lg">
        <h2 className="text-2xl font-black text-[#2155ff]">
          Titres
        </h2>

        <div className="mt-4 flex flex-col gap-2">
          {album.tracks.map((track, index) => (
            <div
              key={track}
              className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-[#071f4f]"
            >
              {index + 1}. {track}
            </div>
          ))}
        </div>
      </section>

      {/* NOTE */}

      <section className="mt-6 rounded-[2rem] border border-blue-100/60 bg-white/80 p-6 shadow-lg">
        <h2 className="text-2xl font-black text-[#2155ff]">
          Ma note
        </h2>

        <input
          value={personalNote}
          onChange={(event) => setPersonalNote(event.target.value)}
          placeholder="Ex : 8/10, chef d’œuvre, classique..."
          className="mt-4 w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold outline-none focus:border-blue-400"
        />

        <h3 className="mt-6 text-xl font-black text-[#2155ff]">
          Description personnelle
        </h3>

        <textarea
          value={personalDescription}
          onChange={(event) => setPersonalDescription(event.target.value)}
          placeholder="Écris ce que tu penses de cet album..."
          rows={5}
          className="mt-4 w-full resize-none rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold outline-none focus:border-blue-400"
        />

        <p className="mt-3 text-xs font-bold text-blue-400">
          Sauvegarde automatique sur cet appareil.
        </p>
      </section>

      {/* ÉTAT */}

      <section className="mt-6 rounded-[2rem] border border-blue-100/60 bg-white/80 p-6 shadow-lg">
        <h2 className="text-2xl font-black text-[#2155ff]">
          État du CD
        </h2>

        <p className="mt-2 text-sm text-[#5e6b85]">
          Tu peux mettre une note sur 5 avec demi-étoiles.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((value) => (
            <button
              key={value}
              onClick={() => setCondition(value)}
              className={`rounded-2xl border px-3 py-2 text-sm font-black ${
                condition === value
                  ? "border-yellow-300 bg-yellow-100 text-yellow-600"
                  : "border-blue-100 bg-white text-blue-500"
              }`}
            >
              {value}★
            </button>
          ))}
        </div>

        <p className="mt-4 text-lg font-black text-[#071f4f]">
          État actuel : {condition === 0 ? "Non noté" : `${condition}/5`}
        </p>
      </section>

      {/* STREAMING */}

      <section className="relative mt-6 rounded-[2rem] border border-blue-100/60 bg-white/80 p-6 shadow-lg">
        <button
          onClick={() => setListenOpen(!listenOpen)}
          className="w-full rounded-2xl bg-[#2155ff] px-6 py-4 text-center text-lg font-black text-white shadow-[0_8px_30px_rgba(33,85,255,0.35)]"
        >
          Écouter en streaming
        </button>

        {listenOpen && (
          <div className="mt-4 rounded-3xl border border-blue-100 bg-white p-4 shadow-xl">
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

        <button
          onClick={deleteAlbum}
          className="mt-4 w-full rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-center text-lg font-black text-red-500"
        >
          Supprimer l’album
        </button>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[#5e6b85]">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#071f4f]">
        {value}
      </p>
    </div>
  );
}