"use client";

import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import {
  BarcodeFormat,
  DecodeHintType,
  NotFoundException,
} from "@zxing/library";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { rollRarity } from "@/app/lib/rarity";

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
  xp: number;
  tracks: string[];
  source: "scan";
  musicBrainzId: string;
};

type ScanMode = "barcode" | "photo" | "manual";

export default function ScanPage() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const scanningPausedRef = useRef(false);

  const [scanMode, setScanMode] = useState<ScanMode>("barcode");
  const [result, setResult] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [album, setAlbum] = useState<Album | null>(null);
  const [message, setMessage] = useState("");
  const [cameraStarted, setCameraStarted] = useState(false);
  const [recentScans, setRecentScans] = useState<Album[]>([]);

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
    loadRecentScans();

    return () => {
      stopScanner();
    };
  }, []);

  function loadRecentScans() {
    const saved = localStorage.getItem("cdex-recent-scans");
    const scans: Album[] = saved ? JSON.parse(saved) : [];
    setRecentScans(scans.slice(-3).reverse());
  }

  function saveRecentScan(scannedAlbum: Album) {
    const saved = localStorage.getItem("cdex-recent-scans");
    const scans: Album[] = saved ? JSON.parse(saved) : [];

    const withoutDuplicate = scans.filter((item) => item.id !== scannedAlbum.id);
    const updated = [...withoutDuplicate, scannedAlbum].slice(-3);

    localStorage.setItem("cdex-recent-scans", JSON.stringify(updated));
    setRecentScans(updated.reverse());
  }

  async function startScanner() {
    if (!videoRef.current) return;

    setMessage("");
    setAlbum(null);
    setResult("");
    scanningPausedRef.current = false;

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
          if (scanningPausedRef.current) return;

          if (scanResult) {
            const cleanedCode = cleanBarcode(scanResult.getText());

            if (!cleanedCode || cleanedCode.length < 8) return;

            scanningPausedRef.current = true;
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
        "Code non lu sur cette photo. Essaie une photo plus proche, nette et droite."
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
        setMessage(`Code détecté : ${barcode}. Aucun album trouvé.`);
        return;
      }

      const release = data.releases[0];

      const artist =
        release["artist-credit"]
          ?.map((artist: any) => artist.name)
          .join(", ") || "Artiste inconnu";

      const rarity = rollRarity();

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
        rarity: rarity.name,
        xp: rarity.xp,
        tracks: [],
        source: "scan",
        musicBrainzId: release.id,
      };

      setAlbum(newAlbum);
      saveRecentScan(newAlbum);
      setMessage(`Album détecté : ${rarity.name} · +${rarity.xp} XP`);
    } catch {
      setMessage("Erreur pendant la recherche. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  function addAlbum() {
    if (!album) return;

    const savedAlbums = localStorage.getItem("cdex-user-albums");
    const currentAlbums: Album[] = savedAlbums ? JSON.parse(savedAlbums) : [];

    const alreadyExists = currentAlbums.some((item) => item.id === album.id);

    if (alreadyExists) {
      setMessage("Cet album est déjà dans ta collection.");
      return;
    }

    localStorage.setItem(
      "cdex-user-albums",
      JSON.stringify([...currentAlbums, album])
    );

    setMessage(
      `${album.title} a bien été ajouté : ${album.rarity} · +${album.xp} XP`
    );
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
    scanningPausedRef.current = false;
    await stopScanner();
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-6">
      <style>{`
        @keyframes scanLine {
          0% { transform: translateY(-120%); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(520%); opacity: 0; }
        }
      `}</style>

      <div className="mb-5 flex items-center justify-between">
        <Link
          href="/add"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-[0_8px_25px_rgba(33,85,255,0.12)] transition active:scale-95"
        >
          <span className="text-3xl font-black leading-none text-[#2155ff]">
            ‹
          </span>
        </Link>

        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#2155ff]">
          Scan
        </p>
      </div>

      <section className="rounded-[2.4rem] border border-blue-100/70 bg-white/85 p-6 shadow-[0_18px_55px_rgba(33,85,255,0.13)] backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#2155ff]">
          Scanner
        </p>

        <h1 className="mt-2 text-5xl font-black leading-none tracking-tight text-[#2155ff]">
          Scanner un CD
        </h1>

        <p className="mt-5 text-sm font-semibold leading-7 text-[#5e6b85]">
          Scanne une pochette, un code-barres ou importe une photo pour
          identifier automatiquement ton album.
        </p>

        {!album && (
          <>
            <div className="mt-6 grid grid-cols-3 gap-2 rounded-[1.6rem] border border-blue-100 bg-blue-50/70 p-2">
              <ModeButton
                active={scanMode === "barcode"}
                label="Code"
                onClick={() => setScanMode("barcode")}
              />
              <ModeButton
                active={scanMode === "photo"}
                label="Photo"
                onClick={() => setScanMode("photo")}
              />
              <ModeButton
                active={scanMode === "manual"}
                label="Manuel"
                onClick={() => setScanMode("manual")}
              />
            </div>

            {scanMode === "barcode" && (
              <div className="mt-5 rounded-[2rem] border border-blue-100 bg-blue-50/70 p-4">
                <div className="relative overflow-hidden rounded-[1.7rem] bg-black shadow-[0_0_35px_rgba(33,85,255,0.35)]">
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    className="h-72 w-full object-cover"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(33,85,255,0.18),transparent_65%)]" />

                  <div className="pointer-events-none absolute inset-x-8 top-1/2 h-28 -translate-y-1/2 rounded-xl border-2 border-white/85 shadow-[0_0_0_999px_rgba(0,0,0,0.42)]" />

                  {cameraStarted && (
                    <div
                      className="pointer-events-none absolute inset-x-10 top-1/2 h-1 rounded-full bg-[#2155ff] shadow-[0_0_18px_rgba(33,85,255,1)]"
                      style={{ animation: "scanLine 2.2s linear infinite" }}
                    />
                  )}

                  <div className="pointer-events-none absolute left-7 top-7 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-[#2155ff]" />
                  <div className="pointer-events-none absolute right-7 top-7 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-[#2155ff]" />
                  <div className="pointer-events-none absolute bottom-7 left-7 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-[#2155ff]" />
                  <div className="pointer-events-none absolute bottom-7 right-7 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-[#2155ff]" />
                </div>

                {!cameraStarted ? (
                  <button
                    onClick={startScanner}
                    className="mt-4 w-full rounded-2xl bg-[#2155ff] px-5 py-4 text-lg font-black text-white shadow-[0_10px_30px_rgba(33,85,255,0.35)]"
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

                <p className="mt-3 rounded-2xl bg-white/80 px-4 py-3 text-xs font-bold leading-5 text-[#5e6b85]">
                  Astuce : rapproche le code-barres jusqu’à ce qu’il remplisse
                  le cadre blanc.
                </p>
              </div>
            )}

            {scanMode === "photo" && (
              <div className="mt-5 rounded-[2rem] border border-blue-100 bg-white p-5 shadow-[0_8px_25px_rgba(33,85,255,0.08)]">
                <h2 className="text-xl font-black text-[#2155ff]">
                  Scanner depuis une photo
                </h2>

                <p className="mt-2 text-sm font-semibold leading-6 text-[#5e6b85]">
                  Choisis une photo nette du code-barres. Il doit prendre une
                  grande partie de l’image.
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 w-full rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-lg font-black text-[#2155ff]"
                >
                  Importer une photo
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => scanImageFile(event.target.files?.[0])}
                />
              </div>
            )}

            {scanMode === "manual" && (
              <div className="mt-5 rounded-[2rem] border border-blue-100 bg-white p-5 shadow-[0_8px_25px_rgba(33,85,255,0.08)]">
                <h2 className="text-xl font-black text-[#2155ff]">
                  Entrer le code manuellement
                </h2>

                <input
                  value={manualCode}
                  onChange={(event) => setManualCode(event.target.value)}
                  placeholder="Ex : 0602537351057"
                  inputMode="numeric"
                  className="mt-4 w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold text-[#071f4f] outline-none transition focus:border-[#2155ff] focus:ring-4 focus:ring-blue-100"
                />

                <button
                  onClick={() => searchBarcode(manualCode)}
                  className="mt-3 w-full rounded-2xl bg-[#2155ff] px-5 py-4 text-lg font-black text-white shadow-[0_10px_30px_rgba(33,85,255,0.35)]"
                >
                  Rechercher ce code
                </button>
              </div>
            )}
          </>
        )}

        {loading && (
          <p className="mt-5 rounded-2xl bg-blue-50 px-5 py-4 text-sm font-black text-[#2155ff]">
            Recherche de l’album...
          </p>
        )}

        {result && (
          <p className="mt-5 text-xs font-black text-slate-400">
            Code détecté : {result}
          </p>
        )}

        {message && (
          <p className="mt-5 rounded-2xl bg-blue-50 px-5 py-4 text-sm font-black text-[#2155ff]">
            {message}
          </p>
        )}
      </section>

      {album && (
        <section className="mt-6 overflow-hidden rounded-[2.2rem] border border-blue-100 bg-white shadow-[0_18px_55px_rgba(33,85,255,0.13)]">
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
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#2155ff]">
              Résultat détecté
            </p>

            <h2 className="mt-2 text-3xl font-black leading-tight text-[#2155ff]">
              {album.title}
            </h2>

            <p className="mt-2 text-lg font-bold text-[#071f4f]">
              {album.artist}
            </p>

            <p className="mt-2 text-sm font-black text-[#6b7895]">
              {album.year || "Année inconnue"} · {album.genre}
            </p>

            <p className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-[#2155ff]">
              {album.rarity} · +{album.xp} XP
            </p>

            <button
              onClick={addAlbum}
              className="mt-5 w-full rounded-2xl bg-[#2155ff] px-5 py-4 text-lg font-black text-white shadow-[0_10px_30px_rgba(33,85,255,0.35)]"
            >
              Ajouter à ma collection
            </button>

            <button
              onClick={openAlbumPreview}
              className="mt-3 w-full rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-lg font-black text-[#2155ff]"
            >
              Voir / modifier la fiche
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

      {recentScans.length > 0 && (
        <section className="mt-6 rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2155ff]">
            Scans récents
          </p>

          <div className="mt-3 flex flex-col gap-3">
            {recentScans.map((scan) => (
              <Link
                key={scan.id}
                href={`/album/${scan.id}`}
                className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm transition active:scale-[0.98]"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-100 bg-blue-50 text-xl">
                  {scan.cover ? (
                    <img
                      src={scan.cover}
                      alt={scan.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "💿"
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-[#071f4f]">
                    {scan.title}
                  </p>
                  <p className="truncate text-xs font-semibold text-[#6b7895]">
                    {scan.artist}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase text-[#2155ff]">
                    {scan.rarity} · +{scan.xp || 0} XP
                  </p>
                </div>

                <span className="text-xl font-black text-[#2155ff]">›</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-3 py-3 text-xs font-black transition active:scale-95 ${
        active
          ? "bg-[#2155ff] text-white shadow-[0_8px_24px_rgba(33,85,255,0.28)]"
          : "bg-white text-[#2155ff]"
      }`}
    >
      {label}
    </button>
  );
}