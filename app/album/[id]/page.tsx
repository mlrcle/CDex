"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { albums } from "../../data/albums";

const noteOptions = Array.from({ length: 21 }, (_, index) => index * 0.5);

export default function AlbumPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = params.id as string;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [userAlbums, setUserAlbums] = useState<any[]>([]);
  const [wishlistAlbums, setWishlistAlbums] = useState<any[]>([]);
  const [previewAlbum, setPreviewAlbum] = useState<any>(null);

  const [listenOpen, setListenOpen] = useState(false);
  const [toast, setToast] = useState("");

  const [noteEditing, setNoteEditing] = useState(false);
  const [descriptionEditing, setDescriptionEditing] = useState(false);
  const [coverEditing, setCoverEditing] = useState(false);

  const [editingField, setEditingField] = useState("");

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

  function goBackSmart() {
    const savedSearchReturn = sessionStorage.getItem("cdex-search-return");

    if (savedSearchReturn) {
      const data = JSON.parse(savedSearchReturn);
      const mode = data.mode === "wishlist" ? "&mode=wishlist" : "";

      router.push(
        `/add/search?query=${encodeURIComponent(data.query ?? "")}&sort=${
          data.sort ?? "relevance"
        }${mode}`
      );

      return;
    }

    router.back();
  }

  function handleImageFile(file: File | undefined) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditedCover(reader.result);
        setCoverEditing(false);
        showToast("Pochette modifiée.");
      }
    };

    reader.readAsDataURL(file);
  }

  useEffect(() => {
    const savedUserAlbums = localStorage.getItem("cdex-user-albums");
    const savedWishlist = localStorage.getItem("cdex-wishlist");
    const savedPreviewAlbum = sessionStorage.getItem("cdex-preview-album");

    if (savedUserAlbums) setUserAlbums(JSON.parse(savedUserAlbums));
    if (savedWishlist) setWishlistAlbums(JSON.parse(savedWishlist));

    if (savedPreviewAlbum) {
      const parsedPreview = JSON.parse(savedPreviewAlbum);
      if (parsedPreview.id === albumId) setPreviewAlbum(parsedPreview);
    }
  }, [albumId]);

  const allAlbums = [
    ...userAlbums,
    ...wishlistAlbums,
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
          onClick={goBackSmart}
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
  const isInWishlist = wishlistAlbums.some((item) => item.id === albumId);

  function toggleWishlist() {
    const savedWishlist = localStorage.getItem("cdex-wishlist");
    const currentWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];

    const alreadyExists = currentWishlist.some(
      (item: any) => item.id === album.id
    );

    let updatedWishlist;

    if (alreadyExists) {
      updatedWishlist = currentWishlist.filter(
        (item: any) => item.id !== album.id
      );
      showToast(`"${album.title}" retiré de la wishlist.`);
    } else {
      updatedWishlist = [...currentWishlist, album];
      showToast(`"${album.title}" ajouté à la wishlist.`);
    }

    localStorage.setItem("cdex-wishlist", JSON.stringify(updatedWishlist));
    setWishlistAlbums(updatedWishlist);
  }

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

    setTimeout(() => router.push("/collection"), 900);
  }

  return (
    <main className="mx-auto max-w-md px-5 py-6">
      {toast && (
        <div className="fixed left-1/2 top-6 z-[999] w-[90%] max-w-sm -translate-x-1/2 rounded-2xl border border-blue-100 bg-white px-5 py-4 text-center text-sm font-black text-[#2155ff] shadow-2xl">
          {toast}
        </div>
      )}

      <button
        onClick={goBackSmart}
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
          <div className="relative aspect-square overflow-hidden rounded-[1.8rem] bg-blue-50 shadow-lg">
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

            <button
              onClick={toggleWishlist}
              className={`absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full border text-2xl font-black shadow-xl ${
                isInWishlist
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-blue-100 bg-white/90 text-blue-400"
              }`}
            >
              ♥
            </button>

            <button
              onClick={() => setCoverEditing(!coverEditing)}
              className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-white/90 text-xl font-black text-[#2155ff] shadow-xl"
            >
              ✎
            </button>
          </div>

          {coverEditing && (
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
                  label="URL de la pochette"
                  value={editedCover}
                  setValue={setEditedCover}
                  placeholder="Colle une URL d’image"
                />

                <button
                  onClick={() => {
                    setEditedCover("");
                    setCoverEditing(false);
                    showToast("Pochette réinitialisée.");
                  }}
                  className="rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-black text-red-500"
                >
                  Réinitialiser la pochette
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-7 pb-7">
          <EditableTitle
            value={album.rarity}
            baseValue={baseAlbum.rarity}
            editedValue={editedRarity}
            setEditedValue={setEditedRarity}
            field="rarity"
            editingField={editingField}
            setEditingField={setEditingField}
            label="Rareté"
            small
          />

          <EditableTitle
            value={album.title}
            baseValue={baseAlbum.title}
            editedValue={editedTitle}
            setEditedValue={setEditedTitle}
            field="title"
            editingField={editingField}
            setEditingField={setEditingField}
            label="Titre"
            big
          />

          <EditableTitle
            value={album.artist}
            baseValue={baseAlbum.artist}
            editedValue={editedArtist}
            setEditedValue={setEditedArtist}
            field="artist"
            editingField={editingField}
            setEditingField={setEditingField}
            label="Artiste"
          />

          <div className="mt-6 grid grid-cols-2 gap-3">
            <EditableInfo label="Date" value={String(album.year)} baseValue={String(baseAlbum.year)} editedValue={editedYear} setEditedValue={setEditedYear} field="year" editingField={editingField} setEditingField={setEditingField} />
            <EditableInfo label="Genre" value={album.genre} baseValue={baseAlbum.genre} editedValue={editedGenre} setEditedValue={setEditedGenre} field="genre" editingField={editingField} setEditingField={setEditingField} />
            <EditableInfo label="Durée" value={album.duration} baseValue={baseAlbum.duration} editedValue={editedDuration} setEditedValue={setEditedDuration} field="duration" editingField={editingField} setEditingField={setEditingField} />
            <EditableInfo label="Valeur" value={album.estimatedValue} baseValue={baseAlbum.estimatedValue} editedValue={editedValue} setEditedValue={setEditedValue} field="value" editingField={editingField} setEditingField={setEditingField} />
            <Info label="Ajouté le" value={album.addedAt} />
          </div>
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

        {noteEditing ? (
          <div className="mt-4">
            <select
              value={personalNote}
              onChange={(event) => setPersonalNote(event.target.value)}
              className="w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 text-lg font-black text-[#2155ff] outline-none"
            >
              <option value="">Non noté</option>
              {noteOptions.map((value) => (
                <option key={value} value={`${value}/10`}>
                  {value}/10
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setNoteEditing(false);
                showToast("Note enregistrée.");
              }}
              className="mt-3 w-full rounded-2xl bg-[#2155ff] px-5 py-3 text-sm font-black text-white"
            >
              Valider la note
            </button>
          </div>
        ) : (
          <button
            onClick={() => setNoteEditing(true)}
            className="mt-4 w-full rounded-2xl border border-blue-100 bg-blue-50 px-5 py-5 text-left"
          >
            <p className="text-sm font-bold text-[#5e6b85]">
              Clique pour modifier
            </p>

            <p className="mt-1 text-3xl font-black text-[#2155ff]">
              {personalNote || "Non noté"}
            </p>
          </button>
        )}

        <h3 className="mt-6 text-xl font-black text-[#2155ff]">
          Description personnelle
        </h3>

        {descriptionEditing ? (
          <div className="mt-4">
            <textarea
              value={personalDescription}
              onChange={(event) => setPersonalDescription(event.target.value)}
              placeholder="Écris ce que tu penses de cet album..."
              rows={5}
              className="w-full resize-none rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold outline-none focus:border-blue-400"
            />

            <button
              onClick={() => {
                setDescriptionEditing(false);
                showToast("Description enregistrée.");
              }}
              className="mt-3 w-full rounded-2xl bg-[#2155ff] px-5 py-3 text-sm font-black text-white"
            >
              Valider la description
            </button>
          </div>
        ) : (
          <button
            onClick={() => setDescriptionEditing(true)}
            className="mt-4 w-full rounded-2xl border border-blue-100 bg-blue-50 px-5 py-5 text-left"
          >
            <p className="text-sm font-bold text-[#5e6b85]">
              Clique pour modifier
            </p>

            <p className="mt-2 whitespace-pre-line text-sm font-bold leading-6 text-[#071f4f]">
              {personalDescription || "Aucune description personnelle."}
            </p>
          </button>
        )}

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

function EditableTitle({
  value,
  baseValue,
  editedValue,
  setEditedValue,
  field,
  editingField,
  setEditingField,
  label,
  big,
  small,
}: any) {
  const isEditing = editingField === field;

  if (isEditing) {
    return (
      <div className="mt-3">
        <Input
          label={label}
          value={editedValue}
          setValue={setEditedValue}
          placeholder={baseValue}
        />

        <button
          onClick={() => setEditingField("")}
          className="mt-2 rounded-2xl bg-[#2155ff] px-4 py-2 text-xs font-black text-white"
        >
          Valider
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-start gap-2">
      <div className="flex-1">
        <p
          className={
            big
              ? "text-5xl font-black leading-none text-[#2155ff]"
              : small
              ? "text-sm font-bold uppercase tracking-widest text-blue-500"
              : "text-xl font-bold text-[#071f4f]"
          }
        >
          {value}
        </p>
      </div>

      <button
        onClick={() => setEditingField(field)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-sm font-black text-[#2155ff]"
      >
        ✎
      </button>
    </div>
  );
}

function EditableInfo({
  label,
  value,
  baseValue,
  editedValue,
  setEditedValue,
  field,
  editingField,
  setEditingField,
}: any) {
  const isEditing = editingField === field;

  if (isEditing) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <Input
          label={label}
          value={editedValue}
          setValue={setEditedValue}
          placeholder={baseValue}
        />

        <button
          onClick={() => setEditingField("")}
          className="mt-2 rounded-2xl bg-[#2155ff] px-4 py-2 text-xs font-black text-white"
        >
          Valider
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#5e6b85]">
            {label}
          </p>

          <p className="mt-1 text-sm font-black text-[#071f4f]">
            {value}
          </p>
        </div>

        <button
          onClick={() => setEditingField(field)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-white text-xs font-black text-[#2155ff]"
        >
          ✎
        </button>
      </div>
    </div>
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