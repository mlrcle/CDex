"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";

export default function ScanPage() {
  const [result, setResult] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [album, setAlbum] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    startScanner();
  }, []);

  function startScanner() {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 150,
        },
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        await scanner.clear();
        setResult(decodedText);
        await searchBarcode(decodedText);
      },
      () => {}
    );
  }

  function cleanBarcode(code: string) {
    return code.replace(/\D/g, "");
  }

  async function searchBarcode(rawBarcode: string) {
    const barcode = cleanBarcode(rawBarcode);

    if (!barcode) {
      setMessage("Code invalide. Essaie avec un vrai code-barres de CD.");
      return;
    }

    setLoading(true);
    setMessage("");
    setAlbum(null);

    try {
      const response = await fetch(
        `https://musicbrainz.org/ws/2/release?query=barcode:${barcode}&fmt=json&limit=5`
      );

      const data = await response.json();

      if (!data.releases || data.releases.length === 0) {
        setMessage(
          `Code détecté : ${barcode}. Aucun album trouvé dans MusicBrainz pour ce code-barres.`
        );
        return;
      }

      const release = data.releases[0];

      const artist =
        release["artist-credit"]?.map((artist: any) => artist.name).join(", ") ||
        "Artiste inconnu";

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
      setMessage(`Album trouvé : ${newAlbum.title}`);
    } catch {
      setMessage("Erreur pendant la recherche. Réessaie.");
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
      setMessage("Cet album est déjà dans ta collection.");
      return;
    }

    localStorage.setItem(
      "cdex-user-albums",
      JSON.stringify([...currentAlbums, album])
    );

    setMessage(`${album.title} a bien été ajouté à ta collection.`);
  }

  function resetScan() {
    setAlbum(null);
    setResult("");
    setMessage("");

    setTimeout(() => {
      startScanner();
    }, 200);
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
          Scanne le code-barres du CD pour tenter de retrouver automatiquement l’album.
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
            Code détecté : {cleanBarcode(result)}
          </p>
        )}

        {message && (
          <p className="mt-5 rounded-2xl bg-blue-50 px-5 py-4 text-sm font-bold text-[#2155ff]">
            {message}
          </p>
        )}

        {!album && (
          <div className="mt-6">
            <input
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              placeholder="Tester un code-barres manuellement"
              className="w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold outline-none"
            />

            <button
              onClick={() => searchBarcode(manualCode)}
              className="mt-3 w-full rounded-2xl bg-[#2155ff] px-5 py-4 text-lg font-black text-white"
            >
              Rechercher ce code
            </button>
          </div>
        )}
      </section>

      {album && (
        <section className="mt-6 overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-lg">
          <div className="aspect-square overflow-hidden bg-blue-50">
            <img
              src={album.cover}
              alt={album.title}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
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

            <button
              onClick={resetScan}
              className="mt-3 w-full rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-lg font-black text-[#2155ff]"
            >
              Scanner un autre CD
            </button>
          </div>
        </section>
      )}
    </main>
  );
}