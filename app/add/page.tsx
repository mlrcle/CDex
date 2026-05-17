"use client";

import { useRef, useState } from "react";

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
  tracks: string[];
  source: "manual" | "search" | "scan";
};

export default function AddPage() {
  const [mode, setMode] = useState<"choices" | "manual">("choices");
  const [message, setMessage] = useState("");

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

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      setMessage("Impossible d’ouvrir la caméra. Vérifie les autorisations du navigateur.");
    }
  }

  function closeCamera() {
    const video = videoRef.current;

    if (video && video.srcObject) {
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

    const imageData = canvas.toDataURL("image/png");
    setCover(imageData);

    closeCamera();
  }

  function handleImageFile(file: File | undefined) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCover(reader.result);
      }
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
      rarity: "Non renseignée",
      tracks: [],
      source: "manual",
    };

    localStorage.setItem(
      "cdex-user-albums",
      JSON.stringify([...currentAlbums, newAlbum])
    );

    closeCamera();

    setTitle("");
    setArtist("");
    setYear("");
    setGenre("");
    setDuration("");
    setEstimatedValue("");
    setCover("");
    setMessage("Album ajouté à ta collection.");
  }

  return (
    <main className="mx-auto max-w-md px-5 py-6">
      <section className="rounded-[2.2rem] border border-blue-100/60 bg-white/80 p-7 shadow-[0_10px_40px_rgba(80,120,255,0.12)]">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-500">
          Ajouter
        </p>

        <h1 className="text-5xl font-black leading-none text-[#2155ff]">
          Nouveau CD
        </h1>

        <p className="mt-5 text-base leading-7 text-[#5e6b85]">
          Ajoute un album à ta collection. Pour l’instant, l’ajout manuel est fonctionnel.
        </p>

        {mode === "choices" && (
          <div className="mt-8 flex flex-col gap-3">
            <a
  href="/scan"
  className="rounded-2xl bg-[#2155ff] px-6 py-4 text-center text-lg font-black text-white shadow-[0_8px_30px_rgba(33,85,255,0.35)]"
>
  Scanner un CD
</a>

            <button
              onClick={() => setMode("manual")}
              className="rounded-2xl bg-[#2155ff] px-6 py-4 text-lg font-black text-white shadow-[0_8px_30px_rgba(33,85,255,0.35)]"
            >
              Ajouter manuellement
            </button>

            <a
  href="/add/search"
  className="rounded-2xl border border-blue-200 bg-white px-6 py-4 text-center text-lg font-black text-[#2155ff]"
>
  Rechercher un album
</a>
          </div>
        )}

        {mode === "manual" && (
          <div className="mt-8">
            <button
              onClick={() => {
                closeCamera();
                setMode("choices");
              }}
              className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-[#2155ff]"
            >
              ← Choix d’ajout
            </button>

            <div className="flex flex-col gap-3">
              <Input label="Nom de l’album *" value={title} setValue={setTitle} />
              <Input label="Auteur / artiste *" value={artist} setValue={setArtist} />
              <Input label="Année" value={year} setValue={setYear} />
              <Input label="Genre" value={genre} setValue={setGenre} />
              <Input label="Durée" value={duration} setValue={setDuration} />
              <Input
                label="Valeur estimée"
                value={estimatedValue}
                setValue={setEstimatedValue}
              />

              <section className="mt-3 rounded-[2rem] border border-blue-100 bg-blue-50/70 p-5">
                <h2 className="text-xl font-black text-[#2155ff]">
                  Pochette de l’album
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#5e6b85]">
                  Ajoute une pochette avec la caméra, les fichiers ou une URL.
                </p>

                {cover && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100 bg-white">
                    <img
                      src={cover}
                      alt="Aperçu de la pochette"
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                )}

                {cameraOpen && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100 bg-black">
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
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={takePhoto}
                      className="rounded-2xl bg-[#2155ff] px-5 py-3 text-sm font-black text-white"
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
                  <div className="mt-4 grid gap-3">
                    <button
                      onClick={openCamera}
                      className="rounded-2xl bg-[#2155ff] px-5 py-3 text-sm font-black text-white"
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
              </section>

              <button
                onClick={addManualAlbum}
                className="mt-3 rounded-2xl bg-[#2155ff] px-6 py-4 text-lg font-black text-white shadow-[0_8px_30px_rgba(33,85,255,0.35)]"
              >
                Ajouter à ma collection
              </button>

              {message && (
                <p className="rounded-2xl bg-blue-50 px-5 py-4 text-sm font-bold text-[#2155ff]">
                  {message}
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
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
        className="w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold text-[#071f4f] outline-none focus:border-blue-400"
      />
    </label>
  );
}