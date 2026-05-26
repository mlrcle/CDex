"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { rollRarity } from "@/app/lib/rarity";
import { saveCloudData } from "@/app/lib/cloudSave";

type UserAlbum = {
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
  source: "manual" | "search" | "scan";
};

export default function AddPage() {
  const [mode, setMode] = useState<"choices" | "manual">("choices");
  const [message, setMessage] = useState("");
  const [lastAlbums, setLastAlbums] = useState<UserAlbum[]>([]);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [cover, setCover] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function loadLastAlbums() {
    const savedAlbums = localStorage.getItem("cdex-user-albums");
    const albums: UserAlbum[] = savedAlbums ? JSON.parse(savedAlbums) : [];
    setLastAlbums(albums.slice(-3).reverse());
  }

  useEffect(() => {
    loadLastAlbums();

    window.addEventListener("storage", loadLastAlbums);
    return () => window.removeEventListener("storage", loadLastAlbums);
  }, []);

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      setMessage("Impossible d’ouvrir la caméra. Vérifie les autorisations.");
    }
  }

  function closeCamera() {
    const video = videoRef.current;

    if (video?.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }

    setCameraOpen(false);
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCover(canvas.toDataURL("image/png"));

    closeCamera();
  }

  function handleImageFile(file: File | undefined) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") setCover(reader.result);
    };

    reader.readAsDataURL(file);
  }

  function addManualAlbum() {
    if (!title.trim() || !artist.trim()) {
      setMessage("Ajoute au minimum un titre et un artiste.");
      return;
    }

    const savedAlbums = localStorage.getItem("cdex-user-albums");
    const currentAlbums: UserAlbum[] = savedAlbums ? JSON.parse(savedAlbums) : [];

    const rarity = rollRarity(currentAlbums.length);

    const newAlbum: UserAlbum = {
      id: `${title}-${artist}-${Date.now()}`
        .toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll("/", "-"),
      title,
      artist,
      year: Number(year) || 0,
      genre: genre || "Non renseigné",
      duration: duration || "Non renseignée",
      estimatedValue: estimatedValue || "Non estimée",
      cover,
      addedAt: new Date().toLocaleDateString("fr-FR"),
      discovered: true,
      rarity: rarity.name,
      xp: rarity.xp,
      tracks: [],
      source: "manual",
    };

    const updatedAlbums = [...currentAlbums, newAlbum];

    localStorage.setItem("cdex-user-albums", JSON.stringify(updatedAlbums));
    setLastAlbums(updatedAlbums.slice(-3).reverse());
    saveCloudData();

    closeCamera();

    setTitle("");
    setArtist("");
    setYear("");
    setGenre("");
    setDuration("");
    setEstimatedValue("");
    setCover("");
    setMessage(`Album ajouté : ${rarity.name} · +${rarity.xp} XP`);
    setMode("choices");
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-6">
      <section className="rounded-[2.4rem] border border-blue-100/70 bg-white/85 p-6 shadow-[0_18px_55px_rgba(33,85,255,0.13)] backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#2155ff]">
          Ajouter
        </p>

        <h1 className="mt-2 text-5xl font-black leading-none tracking-tight text-[#2155ff]">
          Nouveau CD
        </h1>

        <p className="mt-5 text-sm font-semibold leading-7 text-[#5e6b85]">
          Scanne, cherche ou crée une fiche album pour enrichir ta collection.
        </p>

        {mode === "choices" && (
          <div className="mt-7 flex flex-col gap-4">
            <ActionCard
              href="/scan"
              icon="◎"
              title="Scanner un CD"
              description="Utilise la caméra pour reconnaître une pochette."
              primary
            />

            <ActionCard
              href="/add/search"
              icon="⌕"
              title="Rechercher un album"
              description="Trouve un album dans une base de données."
            />

            <ActionCard
              icon="+"
              title="Ajouter manuellement"
              description="Crée une fiche complète toi-même."
              onClick={() => {
                setMessage("");
                setMode("manual");
              }}
            />

            <section className="mt-3 rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2155ff]">
                Derniers ajouts
              </p>

              <div className="mt-3 flex flex-col gap-3">
                {lastAlbums.length > 0 ? (
                  lastAlbums.map((album) => (
                    <Link
                      key={album.id}
                      href={`/album/${album.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm transition active:scale-[0.98]"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-100 bg-blue-50 text-xl">
                        {album.cover ? (
                          <img
                            src={album.cover}
                            alt={album.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          "💿"
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-[#071f4f]">
                          {album.title}
                        </p>
                        <p className="truncate text-xs font-semibold text-[#6b7895]">
                          {album.artist}
                        </p>
                        <p className="mt-1 text-[10px] font-black uppercase text-[#2155ff]">
                          {album.rarity} · +{album.xp || 0} XP
                        </p>
                      </div>

                      <span className="text-xl font-black text-[#2155ff]">›</span>
                    </Link>
                  ))
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xl">
                      💿
                    </div>

                    <div>
                      <p className="text-sm font-black text-[#071f4f]">
                        Aucun album récent
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#6b7895]">
                        Tes 3 derniers CD apparaîtront ici.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {message && (
              <p className="rounded-2xl bg-blue-50 px-5 py-4 text-sm font-black text-[#2155ff]">
                {message}
              </p>
            )}
          </div>
        )}

        {mode === "manual" && (
          <div className="mt-7">
            <button
              onClick={() => {
                closeCamera();
                setMessage("");
                setMode("choices");
              }}
              className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-[#2155ff]"
            >
              ← Choix d’ajout
            </button>

            <PreviewCard
              title={title}
              artist={artist}
              year={year}
              cover={cover}
              genre={genre}
            />

            <FormStep number="1" title="Identité">
              <Input label="Titre de l’album *" value={title} setValue={setTitle} />
              <Input label="Artiste *" value={artist} setValue={setArtist} />
              <Input label="Année" value={year} setValue={setYear} />
            </FormStep>

            <FormStep number="2" title="Détails">
              <Input label="Genre" value={genre} setValue={setGenre} />
              <Input label="Durée" value={duration} setValue={setDuration} />
              <Input
                label="Valeur estimée"
                value={estimatedValue}
                setValue={setEstimatedValue}
              />
            </FormStep>

            <FormStep number="3" title="Pochette">
              {cover && (
                <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white">
                  <img
                    src={cover}
                    alt="Aperçu de la pochette"
                    className="aspect-square w-full object-cover"
                  />
                </div>
              )}

              {cameraOpen && (
                <div className="overflow-hidden rounded-3xl border border-blue-100 bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="aspect-square w-full object-cover"
                  />
                </div>
              )}

              {cameraOpen ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={takePhoto}
                    className="rounded-2xl bg-[#2155ff] px-5 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(33,85,255,0.28)]"
                  >
                    Capturer
                  </button>

                  <button
                    onClick={closeCamera}
                    className="rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-black text-red-500"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  <button
                    onClick={openCamera}
                    className="rounded-2xl bg-[#2155ff] px-5 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(33,85,255,0.28)]"
                  >
                    Ouvrir la caméra
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-black text-[#2155ff]"
                  >
                    Choisir depuis fichiers / photos
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleImageFile(event.target.files?.[0])}
                  />

                  <Input
                    label="Ou URL de la pochette"
                    value={cover}
                    setValue={setCover}
                  />

                  {cover && (
                    <button
                      onClick={() => setCover("")}
                      className="rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-black text-red-500"
                    >
                      Retirer la pochette
                    </button>
                  )}
                </div>
              )}
            </FormStep>

            <button
              onClick={addManualAlbum}
              className="mt-5 w-full rounded-3xl bg-[#2155ff] px-6 py-4 text-lg font-black text-white shadow-[0_12px_35px_rgba(33,85,255,0.38)]"
            >
              Ajouter à ma collection
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function ActionCard({
  icon,
  title,
  description,
  href,
  onClick,
  primary = false,
}: {
  icon: string;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  const content = (
    <div
      className={`flex w-full items-center gap-4 rounded-[2rem] border p-4 text-left transition active:scale-[0.98] ${
        primary
          ? "border-[#2155ff] bg-[#2155ff] text-white shadow-[0_12px_35px_rgba(33,85,255,0.35)]"
          : "border-blue-100 bg-white text-[#071f4f] shadow-[0_8px_25px_rgba(33,85,255,0.08)]"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-black ${
          primary ? "bg-white/20 text-white" : "bg-blue-50 text-[#2155ff]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-base font-black ${
            primary ? "text-white" : "text-[#071f4f]"
          }`}
        >
          {title}
        </p>
        <p
          className={`mt-1 text-xs font-semibold leading-5 ${
            primary ? "text-white/80" : "text-[#6b7895]"
          }`}
        >
          {description}
        </p>
      </div>

      <span className={`text-2xl font-black ${primary ? "text-white" : "text-[#2155ff]"}`}>
        ›
      </span>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;

  return (
    <button onClick={onClick} className="w-full">
      {content}
    </button>
  );
}

function FormStep({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 rounded-[2rem] border border-blue-100 bg-blue-50/60 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2155ff] text-sm font-black text-white">
          {number}
        </div>
        <h2 className="text-xl font-black text-[#2155ff]">{title}</h2>
      </div>

      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function PreviewCard({
  title,
  artist,
  year,
  cover,
  genre,
}: {
  title: string;
  artist: string;
  year: string;
  cover: string;
  genre: string;
}) {
  return (
    <section className="rounded-[2rem] border border-blue-100 bg-white p-4 shadow-[0_8px_25px_rgba(33,85,255,0.08)]">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#2155ff]">
        Aperçu fiche album
      </p>

      <div className="flex gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-blue-100 bg-blue-50 text-3xl">
          {cover ? (
            <img src={cover} alt="Pochette" className="h-full w-full object-cover" />
          ) : (
            "💿"
          )}
        </div>

        <div className="min-w-0">
          <h3 className="line-clamp-2 text-xl font-black leading-tight text-[#071f4f]">
            {title || "Titre de l’album"}
          </h3>
          <p className="mt-1 text-sm font-bold text-[#5e6b85]">
            {artist || "Artiste inconnu"}
          </p>
          <p className="mt-2 text-xs font-black text-[#2155ff]">
            {[year || "Année", genre || "Genre"].join(" · ")}
          </p>
        </div>
      </div>
    </section>
  );
}

function Input({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-[#2155ff]">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold text-[#071f4f] outline-none transition focus:border-[#2155ff] focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}
