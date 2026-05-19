"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { albums } from "../../data/albums";
import { rollRarity } from "@/app/lib/rarity";

type Album = {
  id: string;
  title?: string;
  artist?: string;
  year?: string | number;
  genre?: string;
  cover?: string;
  image?: string;
  coverUrl?: string;
  imageUrl?: string;
  duration?: string;
  estimatedValue?: string | number;
  rarity?: string;
  xp?: number;
  addedAt?: string;
  discovered?: boolean;
  tracks?: string[];
  source?: string;
};

const noteOptions = Array.from({ length: 21 }, (_, index) => index * 0.5);

function getAlbumCover(album?: Album) {
  return album?.cover || album?.image || album?.coverUrl || album?.imageUrl || "";
}

function isValidRarity(rarity?: string) {
  return Boolean(
    rarity &&
      rarity !== "Non renseigné" &&
      rarity !== "Non renseignée" &&
      rarity !== "Rareté inconnue"
  );
}

function getDisplayRarity(album: Album, discovered: boolean) {
  if (isValidRarity(album.rarity)) return album.rarity as string;
  return discovered ? "Commun" : "Non découvert";
}

function withDiscoveredRarity(album: Album): Album {
  if (isValidRarity(album.rarity) && typeof album.xp === "number") {
    return album;
  }

  const rarity = rollRarity();

  return {
    ...album,
    rarity: rarity.name,
    xp: rarity.xp,
  };
}
function getRarityImage(rarity?: string) {
  switch (rarity) {
    case "Commun":
      return "/commun.png";

    case "Rare":
      return "/rare.png";

    case "Très rare":
      return "/tresrare.png";

    case "Épique":
      return "/epic.png";

    case "Légendaire":
      return "/legendaire.png";

    default:
      return "/commun.png";
  }
}
export default function AlbumPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = String(params.id);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [userAlbums, setUserAlbums] = useState<Album[]>([]);
  const [wishlistAlbums, setWishlistAlbums] = useState<Album[]>([]);
  const [previewAlbum, setPreviewAlbum] = useState<Album | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [toast, setToast] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [notePickerOpen, setNotePickerOpen] = useState(false);

  const [personalNote, setPersonalNote] = useState("");
  const [personalDescription, setPersonalDescription] = useState("");
  const [descriptionEditing, setDescriptionEditing] = useState(false);
  const [condition, setCondition] = useState(0);

  const [tracksEditing, setTracksEditing] = useState(false);
  const [personalTracks, setPersonalTracks] = useState<string[]>([]);
  const [tracksEditedOnce, setTracksEditedOnce] = useState(false);
  const [newTrack, setNewTrack] = useState("");

  const [editedCover, setEditedCover] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [editedArtist, setEditedArtist] = useState("");
  const [editedYear, setEditedYear] = useState("");
  const [editedGenre, setEditedGenre] = useState("");
  const [editedDuration, setEditedDuration] = useState("");
  const [editedValue, setEditedValue] = useState("");

  const [isLoaded, setIsLoaded] = useState(false);

  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 2200);
  }

  function goBackSmart() {
    const previousUsefulPage = sessionStorage.getItem("cdex-previous-useful-page");

    if (
      previousUsefulPage &&
      !previousUsefulPage.includes("/settings") &&
      previousUsefulPage !== window.location.pathname
    ) {
      router.push(previousUsefulPage);
      return;
    }

    router.push("/collection");
  }

  function handleImageFile(file: File | undefined) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditedCover(reader.result);
        showToast("Pochette modifiée.");
      }
    };

    reader.readAsDataURL(file);
  }

  useEffect(() => {
    const savedUserAlbums = localStorage.getItem("cdex-user-albums");
    const savedWishlist = localStorage.getItem("cdex-wishlist");
    const savedPreviewAlbum = sessionStorage.getItem("cdex-preview-album");
    const savedFavorites = localStorage.getItem("cdex-favorites");

    if (savedUserAlbums) {
      const parsedAlbums: Album[] = JSON.parse(savedUserAlbums);

      const migratedAlbums = parsedAlbums.map((album) =>
        isValidRarity(album.rarity) && typeof album.xp === "number"
          ? album
          : withDiscoveredRarity(album)
      );

      localStorage.setItem("cdex-user-albums", JSON.stringify(migratedAlbums));
      setUserAlbums(migratedAlbums);
    }

    if (savedWishlist) setWishlistAlbums(JSON.parse(savedWishlist));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    if (savedPreviewAlbum) {
      const parsedPreview = JSON.parse(savedPreviewAlbum);
      if (parsedPreview.id === albumId) setPreviewAlbum(parsedPreview);
    }
  }, [albumId]);

  const allAlbums = useMemo(() => {
    return [
      ...userAlbums,
      ...wishlistAlbums,
      ...(previewAlbum ? [previewAlbum] : []),
      ...(albums as Album[]),
    ];
  }, [userAlbums, wishlistAlbums, previewAlbum]);

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

        setPersonalTracks(data.personalTracks ?? []);
        setTracksEditedOnce(data.tracksEditedOnce ?? false);

        setEditedCover(data.editedCover ?? "");
        setEditedTitle(data.editedTitle ?? "");
        setEditedArtist(data.editedArtist ?? "");
        setEditedYear(data.editedYear ?? "");
        setEditedGenre(data.editedGenre ?? "");
        setEditedDuration(data.editedDuration ?? "");
        setEditedValue(data.editedValue ?? "");
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
        personalTracks,
        tracksEditedOnce,
        editedCover,
        editedTitle,
        editedArtist,
        editedYear,
        editedGenre,
        editedDuration,
        editedValue,
      })
    );
  }, [
    isLoaded,
    personalStorageKey,
    personalNote,
    personalDescription,
    condition,
    personalTracks,
    tracksEditedOnce,
    editedCover,
    editedTitle,
    editedArtist,
    editedYear,
    editedGenre,
    editedDuration,
    editedValue,
  ]);

  if (!baseAlbum) {
    return (
      <main className="relative mx-auto min-h-screen max-w-md px-5 pb-56 pt-5">
        <Background />

        <button
          onClick={goBackSmart}
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100 bg-white text-[2rem] font-black leading-none text-[#2155ff] shadow-[0_10px_25px_rgba(33,85,255,0.12)] transition active:scale-95"
        >
          <span className="-mt-1">‹</span>
        </button>

        <section className="rounded-[2rem] border border-white/70 bg-white/75 p-6 text-center shadow-xl backdrop-blur-2xl">
          <h1 className="text-2xl font-black text-blue-950">
            Album introuvable
          </h1>

          <Link
            href="/collection"
            className="mt-6 block rounded-2xl bg-[#2155ff] px-6 py-4 text-center text-sm font-black text-white"
          >
            Voir la collection
          </Link>
        </section>
      </main>
    );
  }

  const album: Album = {
    ...baseAlbum,
    cover: editedCover || baseAlbum.cover,
    title: editedTitle || baseAlbum.title,
    artist: editedArtist || baseAlbum.artist,
    year: editedYear || baseAlbum.year,
    genre: editedGenre || baseAlbum.genre,
    duration: editedDuration || baseAlbum.duration,
    estimatedValue: editedValue || baseAlbum.estimatedValue,
    rarity: baseAlbum.rarity,
    xp: baseAlbum.xp,
  };

  const cover = getAlbumCover(album);
  const isInCollection = userAlbums.some((item) => item.id === albumId);
  const isInWishlist = wishlistAlbums.some((item) => item.id === albumId);
  const isFavorite = favorites.includes(albumId);

  const displayedRarity = getDisplayRarity(
    album,
    isInCollection || Boolean(previewAlbum)
  );

  const albumStatus = isInCollection
    ? "Collection"
    : isInWishlist
      ? "Wishlist"
      : "Non découvert";

  const displayedTracks = tracksEditedOnce
    ? personalTracks
    : baseAlbum.tracks ?? [];

  function saveUserAlbums(nextAlbums: Album[]) {
    localStorage.setItem("cdex-user-albums", JSON.stringify(nextAlbums));
    setUserAlbums(nextAlbums);
  }

  function saveWishlist(nextWishlist: Album[]) {
    localStorage.setItem("cdex-wishlist", JSON.stringify(nextWishlist));
    setWishlistAlbums(nextWishlist);
  }

  function toggleFavorite() {
    setFavorites((current) => {
      const updated = current.includes(albumId)
        ? current.filter((item) => item !== albumId)
        : [...current, albumId];

      localStorage.setItem("cdex-favorites", JSON.stringify(updated));
      return updated;
    });

    showToast(isFavorite ? "Retiré des favoris." : "Ajouté aux favoris.");
  }

  function toggleWishlist() {
    const alreadyExists = wishlistAlbums.some((item) => item.id === album.id);

    const updatedWishlist = alreadyExists
      ? wishlistAlbums.filter((item) => item.id !== album.id)
      : [...wishlistAlbums, { ...album, source: "wishlist" }];

    saveWishlist(updatedWishlist);

    showToast(alreadyExists ? "Retiré de la wishlist." : "Ajouté à la wishlist.");
  }

  function addPreviewToCollection() {
    const alreadyExists = userAlbums.some((item) => item.id === album.id);

    if (alreadyExists) {
      showToast("Cet album est déjà dans ta collection.");
      return;
    }

    const discoveredAlbum = withDiscoveredRarity({
      ...album,
      discovered: true,
      addedAt: album.addedAt || new Date().toLocaleDateString("fr-FR"),
    });

    const updatedAlbums = [...userAlbums, discoveredAlbum];

    saveUserAlbums(updatedAlbums);

    showToast(
      `Album ajouté : ${discoveredAlbum.rarity} · +${discoveredAlbum.xp || 0} XP`
    );
  }

  function deleteAlbum() {
    const updatedUserAlbums = userAlbums.filter((item) => item.id !== albumId);
    const updatedWishlist = wishlistAlbums.filter((item) => item.id !== albumId);
    const updatedFavorites = favorites.filter((item) => item !== albumId);

    localStorage.setItem("cdex-user-albums", JSON.stringify(updatedUserAlbums));
    localStorage.setItem("cdex-wishlist", JSON.stringify(updatedWishlist));
    localStorage.setItem("cdex-favorites", JSON.stringify(updatedFavorites));

    showToast("Album supprimé.");
    setTimeout(() => router.push("/collection"), 900);
  }

  function addTrack() {
    if (!newTrack.trim()) return;

    const baseTracks = tracksEditedOnce ? personalTracks : baseAlbum?.tracks ?? [];

    setPersonaFconst baseTracks = tracksEditedOnce ? personalTracks : baseAlbum?.tracks ?? [];lTracks([...baseTracks, newTrack.trim()]);
    setTracksEditedOnce(true);
    setNewTrack("");
    showToast("Titre ajouté.");
  }

  function updateTrack(index: number, value: string) {
    const baseTracks = tracksEditedOnce ? personalTracks : baseAlbum?.tracks ?? [];
    const updatedTracks = [...baseTracks];

    updatedTracks[index] = value;
    setPersonalTracks(updatedTracks);
    setTracksEditedOnce(true);
  }

  function deleteTrack(index: number) {
    const baseTracks = tracksEditedOnce ? personalTracks : baseAlbum?.tracks ?? [];
    const updatedTracks = baseTracks.filter((_, trackIndex) => trackIndex !== index);

    setPersonalTracks(updatedTracks);
    setTracksEditedOnce(true);
    showToast("Titre supprimé.");
  }

  return (
    <main className="relative mx-auto min-h-screen max-w-md overflow-visible px-5 pb-56 pt-5">
      <Background />

      {toast && (
        <div className="fixed left-1/2 top-6 z-[999] w-[90%] max-w-sm -translate-x-1/2 rounded-2xl border border-blue-100 bg-white px-5 py-4 text-center text-sm font-black text-[#2155ff] shadow-2xl">
          {toast}
        </div>
      )}

      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={goBackSmart}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100 bg-white text-[2rem] font-black leading-none text-[#2155ff] shadow-[0_10px_25px_rgba(33,85,255,0.12)] transition active:scale-95"
        >
          <span className="-mt-1">‹</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-100 bg-white/90 text-xl font-black text-[#2155ff] shadow-[0_10px_25px_rgba(33,85,255,0.15)] transition active:scale-95"
          >
            …
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[3.25rem] z-50 w-44 rounded-[1.5rem] border border-white/70 bg-white/95 p-2 shadow-[0_18px_45px_rgba(33,85,255,0.18)] backdrop-blur-2xl">
              <button
                onClick={() => {
                  setEditMode(true);
                  setMenuOpen(false);
                }}
                className="w-full rounded-2xl px-4 py-3 text-left text-sm font-black text-[#2155ff] hover:bg-blue-50"
              >
                Modifier
              </button>

              

              {(isInCollection || isInWishlist) && (
                <button
                  onClick={() => {
                    deleteAlbum();
                    setMenuOpen(false);
                  }}
                  className="w-full rounded-2xl px-4 py-3 text-left text-sm font-black text-red-500 hover:bg-red-50"
                >
                  Supprimer
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {previewAlbum && !isInCollection && (
        <section className="mb-5 rounded-[2rem] border border-blue-100 bg-blue-50/80 p-4 shadow-sm">
          <p className="text-sm font-bold text-[#2155ff]">
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

      <section className="overflow-hidden rounded-[2.4rem] border border-white/70 bg-white/75 p-4 shadow-[0_20px_60px_rgba(33,85,255,0.14)] backdrop-blur-2xl">
        <AlbumCoverVisual
  cover={cover}
  title={album.title || "Album"}
  rarityFrame={getRarityImage(displayedRarity)}
  isFavorite={isFavorite}
  isInWishlist={isInWishlist}
  toggleFavorite={toggleFavorite}
  toggleWishlist={toggleWishlist}
/>

        <div className="px-2 pb-2 pt-6">
          <div className="flex justify-end">
            <p className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase text-[#2155ff]">
              {displayedRarity}
            </p>
          </div>

          <h1 className="-mt-7 text-[2.7rem] font-black leading-[0.9] tracking-tight text-[#2155ff]">
            {album.title || "Album inconnu"}
          </h1>

          <p className="mt-3 text-lg font-black text-blue-950">
            {album.artist || "Artiste inconnu"}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <InfoCard label="Date" value={album.year || "—"} />
            <InfoCard label="Genre" value={album.genre || "Non renseigné"} />
            <InfoCard label="Durée" value={album.duration || "Non renseignée"} />
            <InfoCard
              label="Valeur"
              value={
                album.estimatedValue !== undefined && album.estimatedValue !== ""
                  ? `${album.estimatedValue} €`.replace("€ €", "€")
                  : "Non estimée"
              }
            />

            <div className="col-span-2">
              <InfoCard label="Statut" value={albumStatus} centered />
            </div>
          </div>
        </div>
      </section>

      {editMode && (
        <section className="mt-6 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_15px_45px_rgba(33,85,255,0.12)] backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#2155ff]">Modifier</h2>

            <button
              onClick={() => setEditMode(false)}
              className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-[#2155ff]"
            >
              Fermer
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            <Input label="Titre" value={editedTitle} setValue={setEditedTitle} />
            <Input label="Artiste" value={editedArtist} setValue={setEditedArtist} />
            <Input label="Date" value={editedYear} setValue={setEditedYear} />
            <Input label="Genre" value={editedGenre} setValue={setEditedGenre} />
            <Input label="Durée" value={editedDuration} setValue={setEditedDuration} />
            <Input label="Valeur estimée" value={editedValue} setValue={setEditedValue} />
          </div>

          <div className="mt-5 rounded-[1.6rem] border border-blue-100 bg-blue-50/70 p-4">
            <h3 className="text-lg font-black text-[#2155ff]">
              Modifier la pochette
            </h3>

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
                onChange={(event) => handleImageFile(event.target.files?.[0])}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleImageFile(event.target.files?.[0])}
              />

              <Input
                label="URL de la pochette"
                value={editedCover}
                setValue={setEditedCover}
              />
            </div>
          </div>
        </section>
      )}

      <section className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-[0_15px_45px_rgba(33,85,255,0.12)] backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2155ff]">
            Ma note
          </p>

          <button
            onClick={() => setNotePickerOpen(!notePickerOpen)}
            className="mt-3 w-full rounded-[1.4rem] bg-blue-50/70 px-4 py-4 text-left text-2xl font-black text-blue-950 transition active:scale-95"
          >
            {personalNote || "Non noté"}
          </button>

          {notePickerOpen && (
            <div className="mt-4 max-h-44 snap-y overflow-y-auto rounded-[1.4rem] border border-blue-100 bg-blue-50/70 p-2">
              <button
                onClick={() => {
                  setPersonalNote("");
                  setNotePickerOpen(false);
                  showToast("Note retirée.");
                }}
                className="mb-2 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#2155ff]"
              >
                Non noté
              </button>

              {noteOptions.map((value) => {
                const note = `${value}/10`;

                return (
                  <button
                    key={value}
                    onClick={() => {
                      setPersonalNote(note);
                      setNotePickerOpen(false);
                      showToast("Note enregistrée.");
                    }}
                    className={`mb-2 w-full rounded-2xl px-4 py-3 text-sm font-black transition ${
                      personalNote === note
                        ? "bg-[#2155ff] text-white"
                        : "bg-white text-[#2155ff]"
                    }`}
                  >
                    {note}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-[0_15px_45px_rgba(33,85,255,0.12)] backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2155ff]">
            État CD
          </p>

          <p className="mt-3 text-2xl font-black text-blue-950">
            {condition === 0 ? "—" : `${condition}/5`}
          </p>

          <StarRating value={condition} onChange={setCondition} />
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_15px_45px_rgba(33,85,255,0.12)] backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2155ff]">
              Description
            </p>

            <h2 className="mt-1 text-2xl font-black text-blue-950">
              Avis personnel
            </h2>
          </div>

          <button
            onClick={() => setDescriptionEditing(!descriptionEditing)}
            className="transition active:scale-90"
          >
            <Image
              src="/pen.png"
              alt="Modifier"
              width={42}
              height={42}
              className="object-contain"
            />
          </button>
        </div>

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
              Valider
            </button>
          </div>
        ) : (
          <p className="mt-4 whitespace-pre-line rounded-[1.5rem] bg-blue-50/70 p-4 text-sm font-bold leading-6 text-[#071f4f]">
            {personalDescription || "Aucune description personnelle."}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_15px_45px_rgba(33,85,255,0.12)] backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2155ff]">
            Titres
          </p>

          <button
            onClick={() => setTracksEditing(!tracksEditing)}
            className="transition active:scale-90"
          >
            <Image
              src="/pen.png"
              alt="Modifier les titres"
              width={42}
              height={42}
              className="object-contain"
            />
          </button>
        </div>

        {tracksEditing && (
          <div className="mt-4 rounded-[1.5rem] bg-blue-50/70 p-3">
            <div className="flex gap-2">
              <input
                value={newTrack}
                onChange={(event) => setNewTrack(event.target.value)}
                placeholder="Nom du titre..."
                className="min-w-0 flex-1 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold text-blue-950 outline-none"
              />

              <button
                onClick={addTrack}
                className="rounded-2xl bg-[#2155ff] px-4 py-3 text-sm font-black text-white"
              >
                +
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {displayedTracks.length === 0 ? (
            <p className="rounded-[1.5rem] bg-blue-50/70 p-4 text-sm font-bold text-[#5e6b85]">
              Aucun titre renseigné pour le moment.
            </p>
          ) : (
            displayedTracks.map((track, index) => (
              <div
                key={`${track}-${index}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-[#071f4f]"
              >
                {tracksEditing ? (
                  <input
                    value={track}
                    onChange={(event) => updateTrack(index, event.target.value)}
                    className="min-w-0 flex-1 bg-transparent outline-none"
                  />
                ) : (
                  <span>
                    {index + 1}. {track}
                  </span>
                )}

                {tracksEditing && (
                  <button
                    onClick={() => deleteTrack(index)}
                    className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-500"
                  >
                    Suppr.
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function AlbumCoverVisual({
  cover,
  title,
  rarityFrame,
  isInWishlist,
  isFavorite,
  toggleWishlist,
  toggleFavorite,
}: {
  cover: string;
  title: string;
  rarityFrame: string;
  isInWishlist: boolean;
  isFavorite: boolean;
  toggleWishlist: () => void;
  toggleFavorite: () => void;
}) {
  
  // Image cover à l'intérieur de la fenêtre
  const COVER_X = 13;
  const COVER_Y = 6;
  const COVER_W = 60;
  const COVER_H = 80;

  // PNG rareté
  const PNG_X = 0;
  const PNG_Y = -15;
  const PNG_W = 140;
  const PNG_H = 125;

  return (
    <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-transparent">
      {/* FENÊTRE COVER */}
      <div
  className="
    absolute
    left-[0%]
    top-[0%]
    w-[100%]
    h-[100%]
    z-[1]
    overflow-hidden
  "
>
        {cover ? (
          <img
            src={cover}
            alt={title}
            style={{
              left: `${COVER_X}%`,
              top: `${COVER_Y}%`,
              width: `${COVER_W}%`,
              height: `${COVER_H}%`,
            }}
            className="absolute object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-blue-100">
            💿
          </div>
        )}
      </div>

      {/* PNG RARETÉ */}
      <img
        src={rarityFrame}
        alt=""
        style={{
          left: `${PNG_X}%`,
          top: `${PNG_Y}%`,
          width: `${PNG_W}%`,
          height: `${PNG_H}%`,
        }}
        className="pointer-events-none absolute z-[5] object-fill"
      />

      <button
        onClick={toggleWishlist}
        className="absolute bottom-[-1%] left-[5%] z-[20] transition active:scale-90"
      >
        <Image
          src={isInWishlist ? "/etoile-appuye.png" : "/etoile.png"}
          alt="Wishlist"
          width={44}
          height={44}
          className="object-contain"
        />
      </button>

      <button
        onClick={toggleFavorite}
        className="absolute bottom-[-1%] right-[5%] z-[20] transition active:scale-90"
      >
        <Image
          src={isFavorite ? "/coeur-appuye.png" : "/coeur.png"}
          alt="Favori"
          width={44}
          height={44}
          className="object-contain"
        />
      </button>
    </div>
  );
}
      

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="mt-4 flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent =
          value >= star ? 100 : value >= star - 0.5 ? 50 : 0;

        return (
          <button
            key={star}
            type="button"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const clickX = event.clientX - rect.left;
              const nextValue = clickX < rect.width / 2 ? star - 0.5 : star;
              onChange(nextValue);
            }}
            className="relative h-6 w-6 shrink-0 text-[24px] leading-none"
          >
            <span className="absolute left-0 top-0 text-blue-100">★</span>

            <span
              className="absolute left-0 top-0 overflow-hidden text-yellow-400"
              style={{ width: `${fillPercent}%` }}
            >
              <span className="block w-6">★</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#f4f8ff]">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#2155ff]/20 blur-3xl" />
      <div className="absolute -right-24 top-64 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#ff4b4b]/10 blur-3xl" />
    </div>
  );
}

function InfoCard({
  label,
  value,
  centered = false,
}: {
  label: string;
  value: string | number;
  centered?: boolean;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
      <p
        className={`text-[10px] font-black uppercase tracking-wide text-blue-950/45 ${
          centered ? "text-center" : ""
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-black leading-5 text-blue-950 ${
          centered ? "text-center" : ""
        }`}
      >
        {value}
      </p>
    </div>
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
      <span className="text-[10px] font-black uppercase tracking-wide text-blue-950/45">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="mt-1 w-full rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-sm font-bold text-blue-950 outline-none focus:border-[#2155ff]"
      />
    </label>
  );
}