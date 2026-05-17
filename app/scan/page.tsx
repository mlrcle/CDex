"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";

export default function ScanPage() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [album, setAlbum] = useState<any>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 120,
        },
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        scanner.clear();
        setResult(decodedText);
        await searchBarcode(decodedText);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  async function searchBarcode(barcode: string) {
    setLoading(true);

    try {
      const response = await fetch(
        `https://musicbrainz.org/ws/2/release?query=barcode:${barcode}&fmt=json`
      );

      const data = await response.json();

      if (data.releases && data.releases.length > 0) {
        const release = data.releases[0];

        const artist =
          release["artist-credit"]
            ?.map((artist: any) => artist.name)
            .join(", ") || "Artiste inconnu";

        const newAlbum = {
          id: release.id,
          title: release.title,
          artist,
          year: release.date ? Number(release.date.slice(0, 4)) || 0 : 0,
          genre: "Non renseigné",
          duration: "Non renseignée",
          estimatedValue: "Non estimée",
          cover: `https://coverartarchive.org/release/${release.id}/front-500`,
          addedAt: new Date().toLocaleDateString("fr-FR"),
          discovered: true,
          rarity: "Non renseignée",
          tracks: [],
          source: "scan",
          musicBrainzId: release.id,
        };

        setAlbum(newAlbum);
      }
    } catch {
      console.log("Erreur scan");
    } finally {
      setLoading(false);
    }
  }

  function addAlbum() {
    if (!album) return;

    const savedAlbums = localStorage.getItem("cdex-user-albums");

    const currentAlbums = savedAlbums ? JSON.parse(savedAlbums) : [];

    const alreadyExists = currentAlbums.some(
      (item: any) => item.id === album.id
    );

    if (alreadyExists) {
      alert("Album déjà dans la collection.");
      return;
    }

    localStorage.setItem(
      "cdex-user-albums",
      JSON.stringify([...currentAlbums, album])
    );

    alert(`${album.title} ajouté à la collection.`);
  }

  return (
    <main className="mx-auto max-w-md px-5 py-6">
      <section className="rounded-[2.2rem] border border-blue-100/60 bg-white/80 p-7 shadow">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-500">
          Scanner
        </p>

        <h1 className="text-5xl font-black leading-none text-[#2155ff]">
          Scanner un CD
        </h1>

        <p className="mt-5 text-base leading-7 text-[#5e6b85]">
          Scanne le code-barres du CD pour retrouver automatiquement l’album.
        </p>

        {!album && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-blue-100 bg-white p-3">
            <div id="reader" />
          </div>
        )}

        {loading && (
          <p className="mt-5 text-sm font-bold text-blue-500">
            Recherche de l’album...
          </p>
        )}

        {result && (
          <p className="mt-5 text-xs font-bold text-slate-400">
            Code détecté : {result}
          </p>
        )}
      </section>

      {album && (
        <section className="mt-6 overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-lg">
          <div className="aspect-square overflow-hidden bg-blue-50">
            <img
              src={album.cover}
              alt={album.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-5">
            <h2 className="text-3xl font-black text-[#2155ff]">
              {album.title}
            </h2>

            <p className="mt-2 text-lg font-bold text-[#071f4f]">
              {album.artist}
            </p>

            <button
              onClick={addAlbum}
              className="mt-5 w-full rounded-2xl bg-[#2155ff] px-5 py-4 text-lg font-black text-white"
            >
              Ajouter à ma collection
            </button>
          </div>
        </section>
      )}
    </main>
  );
}