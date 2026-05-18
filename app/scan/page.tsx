"use client";

import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const router = useRouter();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [result, setResult] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [album, setAlbum] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [cameraStarted, setCameraStarted] = useState(false);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  async function startScanner() {
    setMessage("");
    setAlbum(null);

    try {
      const scanner = new Html5Qrcode(
  "reader",
  {
    formatsToSupport: [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.QR_CODE,
    ],
  },
  false
);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: {
            width: 320,
            height: 180,
          },
          aspectRatio: 1.777,
          disableFlip: false,
        },
        async (decodedText) => {
          const cleanedCode = cleanBarcode(decodedText);

          if (!cleanedCode) return;

          await stopScanner();

          setResult(cleanedCode);
          await searchBarcode(cleanedCode);
        },
        () => {}
      );

      setCameraStarted(true);
    } catch {
      setMessage(
        "Impossible d’ouvrir la caméra. Vérifie les autorisations ou essaie avec une photo."
      );
    }
  }

  async function stopScanner() {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();

        if (state === 2) {
          await scannerRef.current.stop();
        }

        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch {
      scannerRef.current = null;
    }

    setCameraStarted(false);
  }

  async function scanImageFile(file: File | undefined) {
    if (!file) return;

    setMessage("");
    setAlbum(null);

    try {
      const scanner = new Html5Qrcode(
  "file-reader",
  {
    formatsToSupport: [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.QR_CODE,
    ],
  },
  false
);

      const decodedText = await scanner.scanFile(file, true);
      const cleanedCode = cleanBarcode(decodedText);

      await scanner.clear();

      if (!cleanedCode) {
        setMessage("Aucun code-barres lisible trouvé sur cette image.");
        return;
      }

      setResult(cleanedCode);
      await searchBarcode(cleanedCode);
    } catch {
      setMessage(
        "Impossible de lire le code sur cette photo. Essaie une photo plus nette, bien éclairée, avec le code-barres droit."
      );
    }
  }

  function cleanBarcode(code: string) {
    return code.replace(/\D/g, "");
  }

  async function searchBarcode(rawBarcode: string) {
    const barcode = cleanBarcode(rawBarcode);

    if (!barcode) {
      setMessage("Code invalide.");
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

  function openAlbumPreview() {
    if (!album) return;

    sessionStorage.setItem("cdex-preview-album", JSON.stringify(album));
    router.push(`/album/${album.id}`);
  }

  async function resetScan() {
    setAlbum(null);
    setResult("");
    setMessage("");
    setManualCode("");
    await stopScanner();
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
          Scanne le code-barres du CD ou importe une photo nette du code.
        </p>

        {!album && (
          <>
            <div className="mt-6 rounded-[2rem] border border-blue-100 bg-blue-50/70 p-4">
              <div
                id="reader"
                className="overflow-hidden rounded-2xl bg-black"
              />

              {!cameraStarted ? (
                <button
                  onClick={startScanner}
                  className="mt-4 w-full rounded-2xl bg-[#2155ff] px-5 py-4 text-lg font-black text-white"
                >
                  Ouvrir la caméra
                </button>
              ) : (
                <button
                  onClick={stopScanner}
                  className="mt-4 w-full rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg font-black text-red-500"
                >
                  Fermer la caméra
                </button>
              )}
            </div>

            <div className="mt-5 rounded-[2rem] border border-blue-100 bg-white/80 p-5 shadow">
              <h2 className="text-xl font-black text-[#2155ff]">
                Scanner depuis une photo
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#5e6b85]">
                Prends une photo bien nette du code-barres, droite et sans reflet.
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 w-full rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-lg font-black text-[#2155ff]"
              >
                Choisir une photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => scanImageFile(event.target.files?.[0])}
              />

              <div id="file-reader" className="hidden" />
            </div>

            <div className="mt-5 rounded-[2rem] border border-blue-100 bg-white/80 p-5 shadow">
              <h2 className="text-xl font-black text-[#2155ff]">
                Entrer le code manuellement
              </h2>

              <input
                value={manualCode}
                onChange={(event) => setManualCode(event.target.value)}
                placeholder="Ex : 0602537351057"
                className="mt-4 w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold outline-none"
              />

              <button
                onClick={() => searchBarcode(manualCode)}
                className="mt-3 w-full rounded-2xl bg-[#2155ff] px-5 py-4 text-lg font-black text-white"
              >
                Rechercher ce code
              </button>
            </div>
          </>
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

        {message && (
          <p className="mt-5 rounded-2xl bg-blue-50 px-5 py-4 text-sm font-bold text-[#2155ff]">
            {message}
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
              onClick={openAlbumPreview}
              className="mt-5 w-full rounded-2xl bg-[#2155ff] px-5 py-4 text-lg font-black text-white"
            >
              Voir la fiche album
            </button>

            <button
              onClick={addAlbum}
              className="mt-3 w-full rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-lg font-black text-[#2155ff]"
            >
              Ajouter à ma collection
            </button>

            <button
              onClick={resetScan}
              className="mt-3 w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 text-lg font-black text-[#2155ff]"
            >
              Scanner un autre CD
            </button>
          </div>
        </section>
      )}
    </main>
  );
}