"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { albums } from "../../data/albums";

export default function AlbumPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = params.id as string;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [userAlbums, setUserAlbums] = useState<any[]>([]);
  const [previewAlbum, setPreviewAlbum] = useState<any>(null);

  const [listenOpen, setListenOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState("");

  const [personalNote, setPersonalNote] = useState("");
  const [personalDescription, setPersonalDescription] = useState("");
  const [condition, setCondition] = useState(0);

  const [editedCover, setEditedCover] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [editedArtist, setEditedArtist] = useState("");
  const [editedYear, setEditedYear] = useState("");
  const [editedGenre, setEditedGenre] = useState("");
  const [editedDuration, setEditedDuration] = useState("");
  const [editedValue, setEditedValue] = useState("");
  const [editedRarity, setEditedRarity] = useState("");

  const [isLoaded, setIsLoaded] = useState(false);

  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 2200);
  }

  function handleImageFile(file: File | undefined) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditedCover(reader.result);
        showToast("Photo modifiée.");
      }
    };

    reader.readAsDataURL(file);
  }

  useEffect(() => {
    const savedUserAlbums = localStorage.getItem("cdex-user-albums");
    const savedPreviewAlbum = sessionStorage.getItem("cdex-preview-album");

    if (savedUserAlbums) setUserAlbums(JSON.parse(savedUserAlbums));

    if (savedPreviewAlbum) {
      const parsedPreview = JSON.parse(savedPreviewAlbum);
      if (parsedPreview.id === albumId) setPreviewAlbum(parsedPreview);
    }
  }, [albumId]);

  const allAlbums = [
    ...userAlbums,
    ...(previewAlbum ? [previewAlbum] : []),
    ...albums,
  ];

  const baseAlbum = allAlbums.find((item) => item.id === albumId);

  const personalStorageKey = useMemo(
    () => `cdex-album-personal-${albumId}`,
    [albumId]
  );

  useEffect(() => {
    const savedData = localStorage.getItem(personalStorageKey);

    if (savedData) {
      try {
        const data = JSON.parse(savedData);

        setPersonalNote(data.personalNote ?? "");
        setPersonalDescription(data.personalDescription ?? "");
        setCondition(data.condition ?? 0);

        setEditedCover(data.editedCover ?? "");
        setEditedTitle(data.editedTitle ?? "");
        setEditedArtist(data.editedArtist ?? "");
        setEditedYear(data.editedYear ?? "");
        setEditedGenre(data.editedGenre ?? "");
        setEditedDuration(data.editedDuration ?? "");
        setEditedValue(data.editedValue ?? "");
        setEditedRarity(data.editedRarity ?? "");
      } catch {
        localStorage.removeItem(personalStorageKey);
      }
    }

    setIsLoaded(true);
  }, [personalStorageKey]);

  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(
      personalStorageKey,
      JSON.stringify({
        personalNote,
        personalDescription,
        condition,
        editedCover,
        editedTitle,
        editedArtist,
        editedYear,
        editedGenre,
        editedDuration,
        editedValue,
        editedRarity,
      })
    );
  }, [
    isLoaded,
    personalStorageKey,
    personalNote,
    personalDescription,
    condition,
    editedCover,
    editedTitle,
    editedArtist,
    editedYear,
    editedGenre,
    editedDuration,
    editedValue,
    editedRarity,
  ]);

  if (!baseAlbum) {
    return (
      <main className="mx-auto max-w-md px-5 py-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-blue-100 bg-white/90 text-2xl font-black text-[#2155ff] shadow"
        >
          ←
        </button>

        <section className="rounded-[2.2rem] border border-blue-100/60 bg-white/80 p-7 text-center shadow">
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

  const album = {
    ...baseAlbum,
    cover: editedCover || baseAlbum.cover,
    title: editedTitle || baseAlbum.title,
    artist: editedArtist || baseAlbum.artist,
    year: editedYear || baseAlbum.year,
    genre: editedGenre || baseAlbum.genre,
    duration: editedDuration || baseAlbum.duration,
    estimatedValue: editedValue || baseAlbum.estimatedValue,
    rarity: editedRarity || baseAlbum.rarity,
  };

  const isInCollection = userAlbums.some((item) => item.id === albumId);

  function addPreviewToCollection() {
    const savedUserAlbums = localStorage.getItem("cdex-user-albums");
    const currentAlbums = savedUserAlbums ? JSON.parse(savedUserAlbums) : [];

    const alreadyExists = currentAlbums.some(
      (item: any) => item.id === album.id
    );

    if (alreadyExists) {
      showToast(`"${album.title}" est déjà dans ta collection.`);
      return;
    }

    const updatedAlbums = [...currentAlbums, baseAlbum];

    localStorage.setItem("cdex-user-albums", JSON.stringify(updatedAlbums));
    setUserAlbums(updatedAlbums);

    showToast(`"${album.title}" a bien été ajouté à ta collection.`);
  }

  function deleteAlbum() {
    const savedAlbums = localStorage.getItem("cdex-user-albums");
    if (!savedAlbums) return;

    const currentAlbums = JSON.parse(savedAlbums);
    const updatedAlbums = currentAlbums.filter(
      (item: any) => item.id !== albumId
    );

    localStorage.setItem("cdex-user-albums", JSON.stringify(updatedAlbums));

    showToast(`"${album.title}" a été supprimé.`);

    setTimeout(() => {
      router.push("/collection");
    }, 900);
  }

  function finishEdit() {
    setEditMode(false);
    showToast(`"${album.title}" a été modifié.`);
  }

  return (
    <main className="mx-auto max-w-md px-5 py-6">
      {toast && (
        <div className="fixed left-1/2 top-6 z-[999] w-[90%] max-w-sm -translate-x-1/2 rounded-2xl border border-blue-100 bg-white px-5 py-4 text-center text-sm font-black text-[#2155ff] shadow-2xl">
          {toast}
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-blue-100 bg-white/90 text-2xl font-black text-[#2155ff] shadow"
      >
        ←
      </button>

      {!isInCollection && previewAlbum && (
        <section className="mb-6 rounded-[2rem] border border-yellow-200 bg-yellow-50 p-5 shadow">
          <p className="text-sm font-black text-yellow-700">
            Aperçu uniquement : cet album n’est pas encore dans ta collection.
          </p>

          <button
            onClick={addPreviewToCollection}
            className="mt-4 w-full rounded-2xl bg-[#2155ff] px-5 py-3 text-sm font-black text-white"
          >
            Ajouter à ma collection
          </button>
        </section>
      )}

      <section className="overflow-hidden rounded-[2.2rem] border border-blue-100/60 bg-white/80 shadow">
        <div className="p-5">
          <div className="aspect-square overflow-hidden rounded-[1.8rem] bg-blue-50 shadow-lg">
            {album.cover ? (
              <img
                src={album.cover}
                alt={album.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                <div className="h-20 w-20 rounded-full border-4 border-blue-400 opacity-60" />
              </div>
            )}
          </div>

          {editMode && (
            <div className="mt-4 rounded-[2rem] border border-blue-100 bg-blue-50/70 p-4">
              <h2 className="text-lg font-black text-[#2155ff]">
                Modifier la pochette
              </h2>

              <div className="mt-4 grid gap-3">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="rounded-2xl bg-[#2155ff] px-5 py-3 text-sm font-black text-white"
                >
                  Prendre une photo
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-black text-[#2155ff]"
                >
                  Choisir depuis fichiers / photos
                </button>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(event) =>
                    handleImageFile(event.target.files?.[0])
                  }
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) =>
                    handleImageFile(event.target.files?.[0])
                  }
                />

                <Input
                  label="Ou URL de la pochette"
                  value={editedCover}
                  setValue={setEditedCover}
                  placeholder="Colle une URL d’image"
                />

                {editedCover && (
                  <button
                    onClick={() => {
                      setEditedCover("");
                      showToast("Pochette réinitialisée.");
                    }}
                    className="rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-black text-red-500"
                  >
                    Réinitialiser la pochette
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-7 pb-7">
          {editMode ? (
            <div className="flex flex-col gap-3">
              <Input label="Titre" value={editedTitle} setValue={setEditedTitle} placeholder={baseAlbum.title} />
              <Input label="Artiste" value={editedArtist} setValue={setEditedArtist} placeholder={baseAlbum.artist} />
              <Input label="Année" value={editedYear} setValue={setEditedYear} placeholder={String(baseAlbum.year)} />
              <Input label="Genre" value={editedGenre} setValue={setEditedGenre} placeholder={baseAlbum.genre} />
              <Input label="Durée" value={editedDuration} setValue={setEditedDuration} placeholder={baseAlbum.duration} />
              <Input label="Valeur estimée" value={editedValue} setValue={setEditedValue} placeholder={baseAlbum.estimatedValue} />
              <Input label="Rareté" value={editedRarity} setValue={setEditedRarity} placeholder={baseAlbum.rarity} />
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-blue-100/60 bg-white/80 p-6 shadow-lg">
        <h2 className="text-2xl font-black text-[#2155ff]">Titres</h2>

        <div className="mt-4 flex flex-col gap-2">
          {(baseAlbum.tracks ?? []).length === 0 ? (
            <p className="text-sm font-bold text-[#5e6b85]">
              Aucun titre renseigné pour le moment.
            </p>
          ) : (
            baseAlbum.tracks.map((track: string, index: number) => (
              <div
                key={track}
                className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-[#071f4f]"
              >
                {index + 1}. {track}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-blue-100/60 bg-white/80 p-6 shadow-lg">
        <h2 className="text-2xl font-black text-[#2155ff]">Ma note</h2>

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

      <section className="mt-6 rounded-[2rem] border border-blue-100/60 bg-white/80 p-6 shadow-lg">
        <h2 className="text-2xl font-black text-[#2155ff]">État du CD</h2>

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

      <section className="relative mt-6 rounded-[2rem] border border-blue-100/60 bg-white/80 p-6 shadow-lg">
        <button
          onClick={() => setListenOpen(!listenOpen)}
          className="w-full rounded-2xl bg-[#2155ff] px-6 py-4 text-center text-lg font-black text-white shadow"
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
          onClick={() => {
            if (editMode) finishEdit();
            else setEditMode(true);
          }}
          className="mt-4 w-full rounded-2xl border border-blue-100 bg-blue-50 px-6 py-4 text-center text-lg font-black text-[#2155ff]"
        >
          {editMode ? "Terminer la modification" : "Modifier la fiche"}
        </button>

        {isInCollection && (
          <button
            onClick={deleteAlbum}
            className="mt-4 w-full rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-center text-lg font-black text-red-500"
          >
            Supprimer l’album
          </button>
        )}
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

      <p className="mt-1 text-sm font-black text-[#071f4f]">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  setValue,
  placeholder,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-[#2155ff]">
        {label}
      </span>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold text-[#071f4f] outline-none placeholder:text-slate-400 focus:border-blue-400"
      />
    </label>
  );
}