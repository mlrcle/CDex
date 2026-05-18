"use client";

import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import {
  BarcodeFormat,
  DecodeHintType,
  NotFoundException,
} from "@zxing/library";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Album = {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  duration: string;
  estimatedValue: string;
  cover: string;
  addedAt: string;
  discovered: boolean;
  rarity: string;
  tracks: string[];
  source: "scan";
  musicBrainzId: string;
};

export default function ScanPage() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [result, setResult] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [album, setAlbum] = useState<Album | null>(null);
  const [message, setMessage] = useState("");
  const [cameraStarted, setCameraStarted] = useState(false);
  const [scanningPaused, setScanningPaused] = useState(false);

  const reader = useMemo(() => {
    const hints = new Map();

    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
    ]);

    hints.set(DecodeHintType.TRY_HARDER, true);

    return new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: 120,
      delayBetweenScanSuccess: 500,
    });
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  async function startScanner() {
    if (!videoRef.current) return;

    setMessage("");
    setAlbum(null);
    setResult("");
    setScanningPaused(false);

    try {
      const controls = await reader.decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        },
        videoRef.current,
        async (scanResult, error) => {
          if (scanningPaused) return;

          if (scanResult) {
            const cleanedCode = cleanBarcode(scanResult.getText());

            if (!cleanedCode || cleanedCode.length < 8) return;

            setScanningPaused(true);
            setResult(cleanedCode);

            await stopScanner();
            await searchBarcode(cleanedCode);
          }

          if (error && !(error instanceof NotFoundException)) {
            console.log(error);
          }
        }
      );

      controlsRef.current = controls;
      setCameraStarted(true);
    } catch {
      setMessage(
        "Impossible d’ouvrir la caméra. Vérifie l’autorisation caméra ou essaie avec une photo."
      );
      setCameraStarted(false);
    }
  }

  async function stopScanner() {
    try {
      controlsRef.current?.stop();
      controlsRef.current = null;
    } catch {
      controlsRef.current = null;
    }

    setCameraStarted(false);
  }

  async function scanImageFile(file: File | undefined) {
    if (!file) return;

    setMessage("");
    setAlbum(null);
    setResult("");

    const imageUrl = URL.createObjectURL(file);

    try {
      const scanResult = await reader.decodeFromImageUrl(imageUrl);
      const cleanedCode = cleanBarcode(scanResult.getText());

      if (!cleanedCode || cleanedCode.length < 8) {
        setMessage("Aucun code-barres lisible trouvé sur cette image.");
        return;
      }

      setResult(cleanedCode);
      await searchBarcode(cleanedCode);
    } catch {
      setMessage(
        "Code non lu sur cette photo. Essaie une photo plus proche, nette, droite, avec le code-barres qui prend presque toute l’image."
      );
    } finally {
      URL.revokeObjectURL(imageUrl);
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
          `Code détecté : ${barcode}. Aucun album trouvé dans MusicBrainz.`
        );
        return;
      }

      const release = data.releases[0];

      const artist =
        release["artist-credit"]
          ?.map((artist: any) => artist.name)
          .join(", ") || "Artiste inconnu";

      const newAlbum: Album = {
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
    setScanningPaused(false);
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
          Utilise la caméra, une photo ou entre le code-barres manuellement.
        </p>

        {!album && (
          <>
            <div className="mt-6 rounded-[2rem] border border-blue-100 bg-blue-50/70 p-4">
              <div className="relative overflow-hidden rounded-2xl bg-black">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="h-72 w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-x-8 top-1/2 h-28 -translate-y-1/2 rounded-xl border-4 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]" />
              </div>

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

              <p className="mt-3 text-xs font-bold text-[#5e6b85]">
                Astuce : rapproche le code-barres jusqu’à ce qu’il remplisse le cadre blanc.
              </p>
            </div>

            <div className="mt-5 rounded-[2rem] border border-blue-100 bg-white/80 p-5 shadow">
              <h2 className="text-xl font-black text-[#2155ff]">
                Scanner depuis une photo
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#5e6b85]">
                La photo doit être nette, droite, et le code-barres doit prendre beaucoup de place.
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
            </div>

            <div className="mt-5 rounded-[2rem] border border-blue-100 bg-white/80 p-5 shadow">
              <h2 className="text-xl font-black text-[#2155ff]">
                Entrer le code manuellement
              </h2>

              <input
                value={manualCode}
                onChange={(event) => setManualCode(event.target.value)}
                placeholder="Ex : 0602537351057"
                inputMode="numeric"
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