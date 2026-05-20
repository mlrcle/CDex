"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { rollRarity } from "@/app/lib/rarity";
import { saveCloudData } from "@/app/lib/cloudSave";

type MusicBrainzRelease = {
  id: string;
  title: string;
  date?: string;
  country?: string;
  score?: number;
  "artist-credit"?: { name: string }[];
  "label-info"?: { label?: { name?: string } }[];
};

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
  musicBrainzId?: string;
  country?: string;
  label?: string;
};

function SearchAlbumContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWishlistMode = searchParams.get("mode") === "wishlist";

  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [sort, setSort] = useState<"relevance" | "newest" | "oldest">(
    "relevance"
  );

  const [results, setResults] = useState<MusicBrainzRelease[]>([]);
  const [suggestions, setSuggestions] = useState<MusicBrainzRelease[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [userAlbums, setUserAlbums] = useState<UserAlbum[]>([]);
  const [wishlistAlbums, setWishlistAlbums] = useState<UserAlbum[]>([]);

  const [loading, setLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadSavedData();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => fetchSuggestions(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const sortedResults = useMemo(() => {
    const copy = [...results];

    if (sort === "newest") return copy.sort((a, b) => getYear(b) - getYear(a));
    if (sort === "oldest") return copy.sort((a, b) => getYear(a) - getYear(b));

    return copy.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [results, sort]);

  function loadSavedData() {
    const savedAlbums = localStorage.getItem("cdex-user-albums");
    const savedWishlist = localStorage.getItem("cdex-wishlist");
    const savedSearches = localStorage.getItem("cdex-recent-searches");

    setUserAlbums(savedAlbums ? JSON.parse(savedAlbums) : []);
    setWishlistAlbums(savedWishlist ? JSON.parse(savedWishlist) : []);
    setRecentSearches(savedSearches ? JSON.parse(savedSearches) : []);
  }

  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 2500);
  }

  function getArtist(release: MusicBrainzRelease) {
    return (
      release["artist-credit"]?.map((artist) => artist.name).join(", ") ||
      "Artiste inconnu"
    );
  }

  function getYear(release: MusicBrainzRelease) {
    return release.date ? Number(release.date.slice(0, 4)) || 0 : 0;
  }

  function getLabel(release: MusicBrainzRelease) {
    return release["label-info"]?.[0]?.label?.name || "Label non renseigné";
  }

  function removeDuplicateReleases(releases: MusicBrainzRelease[]) {
    const seen = new Set<string>();

    return releases.filter((release) => {
      if (!release.id || seen.has(release.id)) return false;
      seen.add(release.id);
      return true;
    });
  }

  function removeDuplicateAlbums(albums: UserAlbum[]) {
    const seen = new Set<string>();

    return albums.filter((album) => {
      if (!album.id || seen.has(album.id)) return false;
      seen.add(album.id);
      return true;
    });
  }

  function saveRecentSearch(search: string) {
    const cleanSearch = search.trim();
    if (!cleanSearch) return;

    const updated = [
      cleanSearch,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== cleanSearch.toLowerCase()
      ),
    ].slice(0, 5);

    localStorage.setItem("cdex-recent-searches", JSON.stringify(updated));
    setRecentSearches(updated);
  }

  async function fetchSuggestions(searchText: string) {
    setSuggestLoading(true);

    try {
      const response = await fetch(
        `https://musicbrainz.org/ws/2/release?query=${encodeURIComponent(
          `release:${searchText} OR artist:${searchText}`
        )}&fmt=json&limit=5`
      );

      const data = await response.json();
      setSuggestions(data.releases ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  }

  async function searchAlbums(searchValue = query) {
    const cleanQuery = searchValue.trim();

    if (!cleanQuery) {
      setMessage("Écris un album, un artiste ou un titre de chanson.");
      return;
    }

    setLoading(true);
    setMessage("");
    setSuggestions([]);
    saveRecentSearch(cleanQuery);

    try {
      const [
        releaseTitleResponse,
        artistResponse,
        globalReleaseResponse,
        recordingResponse,
      ] = await Promise.all([
        fetch(
          `https://musicbrainz.org/ws/2/release?query=${encodeURIComponent(
            `release:${cleanQuery}`
          )}&fmt=json&limit=15`
        ),
        fetch(
          `https://musicbrainz.org/ws/2/release?query=${encodeURIComponent(
            `artist:${cleanQuery}`
          )}&fmt=json&limit=15`
        ),
        fetch(
          `https://musicbrainz.org/ws/2/release?query=${encodeURIComponent(
            cleanQuery
          )}&fmt=json&limit=15`
        ),
        fetch(
          `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(
            `recording:${cleanQuery}`
          )}&fmt=json&limit=20&inc=releases+artist-credits`
        ),
      ]);

      const releaseTitleData = await releaseTitleResponse.json();
      const artistData = await artistResponse.json();
      const globalReleaseData = await globalReleaseResponse.json();
      const recordingData = await recordingResponse.json();

      const releaseTitleResults: MusicBrainzRelease[] =
        releaseTitleData.releases ?? [];

      const artistResults: MusicBrainzRelease[] = artistData.releases ?? [];

      const globalReleaseResults: MusicBrainzRelease[] =
        globalReleaseData.releases ?? [];

      const recordingReleaseResults: MusicBrainzRelease[] =
        recordingData.recordings
          ?.flatMap(
            (recording: {
              releases?: MusicBrainzRelease[];
              "artist-credit"?: { name: string }[];
              score?: number;
            }) =>
              (recording.releases ?? []).map((release) => ({
                ...release,
                "artist-credit":
                  release["artist-credit"] ?? recording["artist-credit"],
                score: recording.score ?? release.score ?? 0,
              }))
          )
          .filter(Boolean) ?? [];

      const uniqueResults = removeDuplicateReleases([
        ...releaseTitleResults,
        ...artistResults,
        ...globalReleaseResults,
        ...recordingReleaseResults,
      ]);

      setResults(uniqueResults);

      if (uniqueResults.length === 0) {
        setMessage(
          "Aucun album trouvé avec ce titre, cet artiste ou cette chanson."
        );
      }
    } catch {
      setMessage("Erreur pendant la recherche MusicBrainz.");
    } finally {
      setLoading(false);
    }
  }

  function createAlbumFromRelease(release: MusicBrainzRelease): UserAlbum {
    const rarity = rollRarity();

    return {
      id: release.id,
      title: release.title,
      artist: getArtist(release),
      year: getYear(release),
      genre: "Non renseigné",
      duration: "Non renseignée",
      estimatedValue: "Non estimée",
      cover: `https://coverartarchive.org/release/${release.id}/front-500`,
      addedAt: new Date().toLocaleDateString("fr-FR"),
      discovered: true,
      rarity: rarity.name,
      xp: rarity.xp,
      tracks: [],
      source: "search",
      musicBrainzId: release.id,
      country: release.country || "Non renseigné",
      label: getLabel(release),
    };
  }

  function openAlbumPage(release: MusicBrainzRelease) {
    const existingAlbum =
      userAlbums.find((album) => album.id === release.id) ||
      wishlistAlbums.find((album) => album.id === release.id);

    const album = existingAlbum || createAlbumFromRelease(release);

    sessionStorage.setItem("cdex-preview-album", JSON.stringify(album));
    router.push(`/album/${album.id}`);
  }

  function addAlbum(release: MusicBrainzRelease) {
    const newAlbum = createAlbumFromRelease(release);

    if (isWishlistMode) return addToWishlist(newAlbum);

    const cleanedAlbums = removeDuplicateAlbums(userAlbums);
    const alreadyExists = cleanedAlbums.some((album) => album.id === newAlbum.id);

    if (alreadyExists) {
      showToast(`"${newAlbum.title}" est déjà dans ta collection.`);
      return;
    }

    const updatedAlbums = removeDuplicateAlbums([...cleanedAlbums, newAlbum]);

    localStorage.setItem("cdex-user-albums", JSON.stringify(updatedAlbums));
    setUserAlbums(updatedAlbums);
    saveCloudData();

    showToast(
      `"${newAlbum.title}" ajouté : ${newAlbum.rarity} · +${newAlbum.xp} XP`
    );
  }

  function addToWishlist(album: UserAlbum) {
    const cleanedWishlist = removeDuplicateAlbums(wishlistAlbums);
    const alreadyExists = cleanedWishlist.some((item) => item.id === album.id);

    if (alreadyExists) {
      showToast(`"${album.title}" est déjà dans ta wishlist.`);
      return;
    }

    const updatedWishlist = removeDuplicateAlbums([...cleanedWishlist, album]);

    localStorage.setItem("cdex-wishlist", JSON.stringify(updatedWishlist));
    setWishlistAlbums(updatedWishlist);

    showToast(`"${album.title}" ajouté à ta wishlist.`);
  }

  function toggleWishlist(release: MusicBrainzRelease) {
    const existingAlbum = wishlistAlbums.find((item) => item.id === release.id);
    const album = existingAlbum || createAlbumFromRelease(release);

    let updatedWishlist: UserAlbum[];

    if (existingAlbum) {
      updatedWishlist = wishlistAlbums.filter((item) => item.id !== album.id);
      showToast(`"${album.title}" retiré de la wishlist.`);
    } else {
      updatedWishlist = removeDuplicateAlbums([...wishlistAlbums, album]);
      showToast(`"${album.title}" ajouté à la wishlist.`);
    }

    localStorage.setItem("cdex-wishlist", JSON.stringify(updatedWishlist));
    setWishlistAlbums(updatedWishlist);
  }

  function isInCollection(releaseId: string) {
    return userAlbums.some((album) => album.id === releaseId);
  }

  function isInWishlist(releaseId: string) {
    return wishlistAlbums.some((album) => album.id === releaseId);
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-6">
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
          Recherche
        </p>
      </div>

      <section className="rounded-[2.4rem] border border-blue-100/70 bg-white/85 p-6 shadow-[0_18px_55px_rgba(33,85,255,0.13)] backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#2155ff]">
          Recherche
        </p>

        <h1 className="mt-2 text-5xl font-black leading-none tracking-tight text-[#2155ff]">
          Trouver un album
        </h1>

        <p className="mt-5 text-sm font-semibold leading-7 text-[#5e6b85]">
          Recherche par nom d’album, artiste ou titre de chanson.
        </p>

        <div className="relative mt-6">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") searchAlbums();
            }}
            placeholder="Ex : Daft Punk, Thriller, One More Time..."
            className="w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-bold text-[#071f4f] outline-none transition focus:border-[#2155ff] focus:ring-4 focus:ring-blue-100"
          />

          {(suggestions.length > 0 || suggestLoading) && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_18px_45px_rgba(33,85,255,0.16)]">
              {suggestLoading && (
                <p className="px-4 py-3 text-xs font-black text-[#2155ff]">
                  Suggestions...
                </p>
              )}

              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => {
                    setQuery(suggestion.title);
                    setSuggestions([]);
                    searchAlbums(suggestion.title);
                  }}
                  className="flex w-full items-center gap-3 border-b border-blue-50 px-4 py-3 text-left last:border-b-0"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                    💿
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#071f4f]">
                      {suggestion.title}
                    </p>
                    <p className="truncate text-xs font-semibold text-[#6b7895]">
                      {getArtist(suggestion)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value as "relevance" | "newest" | "oldest")
          }
          className="mt-3 w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-black text-[#2155ff] outline-none"
        >
          <option value="relevance">Trier par pertinence</option>
          <option value="newest">Trier du plus récent</option>
          <option value="oldest">Trier du plus ancien</option>
        </select>

        <button
          onClick={() => searchAlbums()}
          className="mt-3 w-full rounded-2xl bg-[#2155ff] px-5 py-4 text-lg font-black text-white shadow-[0_12px_35px_rgba(33,85,255,0.35)] transition active:scale-[0.98]"
        >
          {loading ? "Recherche..." : "Rechercher"}
        </button>

        {recentSearches.length > 0 && results.length === 0 && (
          <div className="mt-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2155ff]">
              Recherches récentes
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => {
                    setQuery(search);
                    searchAlbums(search);
                  }}
                  className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-[#2155ff]"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {message && (
          <p className="mt-5 rounded-2xl bg-blue-50 px-5 py-4 text-sm font-black text-[#2155ff]">
            {message}
          </p>
        )}
      </section>

      {sortedResults.length > 0 && (
        <section className="mt-6 flex flex-col gap-4">
          <p className="px-1 text-xs font-black uppercase tracking-[0.2em] text-[#2155ff]">
            {sortedResults.length} résultat{sortedResults.length > 1 ? "s" : ""}
          </p>

          {sortedResults.map((release) => (
            <article
              key={release.id}
              onClick={() => openAlbumPage(release)}
              className="cursor-pointer overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_10px_35px_rgba(33,85,255,0.1)] transition active:scale-[0.98]"
            >
              <div className="flex gap-4 p-4">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 text-3xl">
                  <span className="absolute">💿</span>
                  <img
                    src={`https://coverartarchive.org/release/${release.id}/front-250`}
                    alt={release.title}
                    className="relative z-10 h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 text-lg font-black leading-tight text-[#071f4f]">
                    {release.title}
                  </h2>

                  <p className="mt-1 truncate text-sm font-bold text-[#5e6b85]">
                    {getArtist(release)}
                  </p>

                  <p className="mt-2 text-xs font-black text-[#2155ff]">
                    {getYear(release) || "Année inconnue"} ·{" "}
                    {release.country || "Pays inconnu"}
                  </p>

                  <p className="mt-1 truncate text-xs font-semibold text-[#8a96ad]">
                    {getLabel(release)}
                  </p>
                </div>
              </div>

              <div
                onClick={(event) => event.stopPropagation()}
                className="grid grid-cols-2 gap-3 border-t border-blue-50 p-4"
              >
                <button
                  onClick={() => addAlbum(release)}
                  disabled={isInCollection(release.id)}
                  className={`rounded-2xl px-4 py-3 text-sm font-black transition active:scale-[0.98] ${
                    isInCollection(release.id)
                      ? "bg-blue-50 text-[#2155ff]"
                      : "bg-[#2155ff] text-white shadow-[0_8px_24px_rgba(33,85,255,0.28)]"
                  }`}
                >
                  {isInCollection(release.id)
                    ? "Déjà ajouté"
                    : isWishlistMode
                    ? "Ajouter"
                    : "Collection"}
                </button>

                <button
                  onClick={() => toggleWishlist(release)}
                  className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-black text-[#2155ff]"
                >
                  {isInWishlist(release.id) ? "Wishlist ✓" : "Wishlist"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {toast && (
        <div className="fixed bottom-28 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 rounded-2xl bg-[#2155ff] px-5 py-4 text-center text-sm font-black text-white shadow-[0_12px_35px_rgba(33,85,255,0.35)]">
          {toast}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-5 pb-28 pt-6">
          <section className="rounded-[2.4rem] border border-blue-100 bg-white p-6">
            <p className="text-sm font-black text-[#2155ff]">Chargement...</p>
          </section>
        </main>
      }
    >
      <SearchAlbumContent />
    </Suspense>
  );
}