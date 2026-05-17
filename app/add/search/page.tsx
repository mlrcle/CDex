"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MusicBrainzRelease = {
  id: string;
  title: string;
  date?: string;
  country?: string;
  status?: string;
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
  tracks: string[];
  source: "manual" | "search" | "scan";
  musicBrainzId?: string;
  country?: string;
  label?: string;
};

export default function SearchAlbumPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"relevance" | "newest" | "oldest">("relevance");
  const [suggestions, setSuggestions] = useState<MusicBrainzRelease[]>([]);
  const [results, setResults] = useState<MusicBrainzRelease[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [userAlbums, setUserAlbums] = useState<UserAlbum[]>([]);

  useEffect(() => {
    cleanSavedAlbums();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  const sortedResults = useMemo(() => {
    return sortReleases(results, sort);
  }, [results, sort]);

  const userAlbumIds = useMemo(() => {
    return userAlbums.map((album) => album.id);
  }, [userAlbums]);

  function showToast(text: string) {
    setToast(text);

    setTimeout(() => {
      setToast("");
    }, 2500);
  }

  function cleanSavedAlbums() {
    const savedAlbums = localStorage.getItem("cdex-user-albums");
    const parsedAlbums: UserAlbum[] = savedAlbums ? JSON.parse(savedAlbums) : [];
    const cleanedAlbums = removeDuplicateAlbums(parsedAlbums);

    localStorage.setItem("cdex-user-albums", JSON.stringify(cleanedAlbums));
    setUserAlbums(cleanedAlbums);
  }

  async function fetchSuggestions(searchText: string) {
    setSuggestLoading(true);

    try {
      const response = await fetch(
        `https://musicbrainz.org/ws/2/release?query=${encodeURIComponent(
          searchText
        )}&fmt=json&limit=6`
      );

      const data = await response.json();
      setSuggestions(data.releases ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  }

  async function searchAlbums() {
    if (!query.trim()) {
      setMessage("Écris un album, un artiste ou un titre.");
      return;
    }

    setLoading(true);
    setMessage("");
    setSuggestions([]);
    cleanSavedAlbums();

    try {
      const [releaseResponse, recordingResponse] = await Promise.all([
        fetch(
          `https://musicbrainz.org/ws/2/release?query=${encodeURIComponent(
            query
          )}&fmt=json&limit=20`
        ),
        fetch(
          `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(
            query
          )}&fmt=json&limit=20`
        ),
      ]);

      const releaseData = await releaseResponse.json();
      const recordingData = await recordingResponse.json();

      const releaseResults: MusicBrainzRelease[] = releaseData.releases ?? [];

      const recordingResults: MusicBrainzRelease[] =
        recordingData.recordings
          ?.flatMap((recording: { releases?: MusicBrainzRelease[] }) =>
            recording.releases ?? []
          )
          .filter(Boolean) ?? [];

      const uniqueResults = removeDuplicateReleases([
        ...releaseResults,
        ...recordingResults,
      ]);

      setResults(uniqueResults);

      if (uniqueResults.length === 0) {
        setMessage("Aucun résultat trouvé.");
      }
    } catch {
      setMessage("Erreur pendant la recherche MusicBrainz.");
    } finally {
      setLoading(false);
    }
  }

  function createAlbumFromRelease(release: MusicBrainzRelease): UserAlbum {
    const artist =
      release["artist-credit"]?.map((artist) => artist.name).join(", ") ||
      "Artiste inconnu";

    const label =
      release["label-info"]?.[0]?.label?.name || "Label non renseigné";

    const year = release.date ? Number(release.date.slice(0, 4)) || 0 : 0;

    return {
      id: release.id,
      title: release.title,
      artist,
      year,
      genre: "Non renseigné",
      duration: "Non renseignée",
      estimatedValue: "Non estimée",
      cover: `https://coverartarchive.org/release/${release.id}/front-500`,
      addedAt: new Date().toLocaleDateString("fr-FR"),
      discovered: true,
      rarity: "Non renseignée",
      tracks: [],
      source: "search",
      musicBrainzId: release.id,
      country: release.country || "Non renseigné",
      label,
    };
  }

  function addAlbum(release: MusicBrainzRelease) {
    const savedAlbums = localStorage.getItem("cdex-user-albums");
    const currentAlbums: UserAlbum[] = savedAlbums ? JSON.parse(savedAlbums) : [];

    const cleanedAlbums = removeDuplicateAlbums(currentAlbums);
    const newAlbum = createAlbumFromRelease(release);

    const alreadyExists = cleanedAlbums.some((album) => album.id === newAlbum.id);

    if (alreadyExists) {
      localStorage.setItem("cdex-user-albums", JSON.stringify(cleanedAlbums));
      setUserAlbums(cleanedAlbums);

      const alreadyMessage = `"${release.title}" est déjà dans ta collection.`;
      setMessage(alreadyMessage);
      showToast(alreadyMessage);

      return false;
    }

    const updatedAlbums = removeDuplicateAlbums([...cleanedAlbums, newAlbum]);

    localStorage.setItem("cdex-user-albums", JSON.stringify(updatedAlbums));
    setUserAlbums(updatedAlbums);

    const successMessage = `"${release.title}" a bien été ajouté à ta collection.`;
    setMessage(successMessage);
    showToast(successMessage);

    return true;
  }

  function openAlbumPage(release: MusicBrainzRelease) {
    const previewAlbum = createAlbumFromRelease(release);

    sessionStorage.setItem("cdex-preview-album", JSON.stringify(previewAlbum));

    router.push(`/album/${release.id}`);
  }

  function selectSuggestion(release: MusicBrainzRelease) {
    const artist =
      release["artist-credit"]?.map((artist) => artist.name).join(", ") || "";

    setQuery(`${release.title} ${artist}`.trim());
    setSuggestions([]);
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

      <section className="rounded-[2.2rem] border border-blue-100/60 bg-white/80 p-7 shadow-[0_10px_40px_rgba(80,120,255,0.12)]">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-500">
          Recherche
        </p>

        <h1 className="text-5xl font-black leading-none text-[#2155ff]">
          Trouver un album
        </h1>

        <p className="mt-5 text-base leading-7 text-[#5e6b85]">
          Recherche par album, artiste ou titre de chanson.
        </p>

        <div className="relative mt-6 flex flex-col gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") searchAlbums();
            }}
            placeholder="Ex : Drake Iceman, Daft Punk, Thriller..."
            className="w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold text-[#071f4f] outline-none placeholder:text-slate-400 focus:border-blue-400"
          />

          {query.length >= 2 && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-[58px] z-30 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl">
              {suggestions.map((release) => {
                const artist =
                  release["artist-credit"]
                    ?.map((artist) => artist.name)
                    .join(", ") || "Artiste inconnu";

                return (
                  <button
                    key={release.id}
                    onClick={() => selectSuggestion(release)}
                    className="block w-full border-b border-blue-50 px-4 py-3 text-left hover:bg-blue-50"
                  >
                    <p className="text-sm font-black text-[#071f4f]">
                      {release.title}
                    </p>

                    <p className="text-xs font-bold text-[#5e6b85]">
                      {artist}
                      {release.date ? ` • ${release.date}` : ""}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {suggestLoading && (
            <p className="px-2 text-xs font-bold text-blue-400">
              Suggestions...
            </p>
          )}

          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as "relevance" | "newest" | "oldest")
            }
            className="rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-black text-[#2155ff] outline-none"
          >
            <option value="relevance">Trier par pertinence</option>
            <option value="newest">Plus récent</option>
            <option value="oldest">Plus ancien</option>
          </select>

          <button
            onClick={searchAlbums}
            className="rounded-2xl bg-[#2155ff] px-6 py-4 text-lg font-black text-white shadow-[0_8px_30px_rgba(33,85,255,0.35)]"
          >
            {loading ? "Recherche..." : "Rechercher"}
          </button>
        </div>

        {message && (
          <p
            className={`mt-5 rounded-2xl px-5 py-4 text-sm font-bold ${
              message.includes("déjà")
                ? "bg-yellow-50 text-yellow-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </section>

      {sortedResults.length > 0 && (
        <p className="mt-6 px-2 text-sm font-black uppercase tracking-widest text-blue-500">
          Résultats
        </p>
      )}

      <section className="mt-3 flex flex-col gap-4">
        {sortedResults.map((release) => {
          const artist =
            release["artist-credit"]?.map((artist) => artist.name).join(", ") ||
            "Artiste inconnu";

          const label =
            release["label-info"]?.[0]?.label?.name || "Label non renseigné";

          const cover = `https://coverartarchive.org/release/${release.id}/front-500`;

          const alreadyAdded = userAlbumIds.includes(release.id);

          return (
            <article
              key={release.id}
              className="overflow-hidden rounded-[1.8rem] border border-blue-100 bg-white/80 shadow-lg"
            >
              <button
                onClick={() => openAlbumPage(release)}
                className="block w-full text-left"
              >
                <div className="aspect-square overflow-hidden bg-blue-50">
                  <img
                    src={cover}
                    alt={release.title}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </button>

              <div className="p-5">
                <button
                  onClick={() => openAlbumPage(release)}
                  className="text-left"
                >
                  <h2 className="text-2xl font-black text-[#2155ff]">
                    {release.title}
                  </h2>
                </button>

                <p className="mt-2 text-sm font-bold text-[#071f4f]">
                  {artist}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Info label="Date" value={release.date || "Inconnue"} />
                  <Info label="Pays" value={release.country || "Inconnu"} />
                  <Info label="Label" value={label} />
                  <Info label="Statut" value={release.status || "Inconnu"} />
                </div>

                <div className="mt-5 grid gap-3">
                  <button
                    onClick={() => openAlbumPage(release)}
                    className="w-full rounded-2xl bg-[#2155ff] px-5 py-3 text-sm font-black text-white"
                  >
                    Voir la fiche
                  </button>

                  <button
                    onClick={() => addAlbum(release)}
                    className={`w-full rounded-2xl border px-5 py-3 text-sm font-black ${
                      alreadyAdded
                        ? "border-yellow-200 bg-yellow-50 text-yellow-600"
                        : "border-blue-200 bg-white text-[#2155ff]"
                    }`}
                  >
                    {alreadyAdded ? "Déjà ajouté" : "Ajouter à ma collection"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function sortReleases(
  releases: MusicBrainzRelease[],
  sort: "relevance" | "newest" | "oldest"
) {
  const sorted = [...releases];

  if (sort === "newest") {
    return sorted.sort((a, b) => getYear(b.date) - getYear(a.date));
  }

  if (sort === "oldest") {
    return sorted.sort((a, b) => getYear(a.date) - getYear(b.date));
  }

  return sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

function getYear(date?: string) {
  if (!date) return 0;
  return Number(date.slice(0, 4)) || 0;
}

function removeDuplicateReleases(releases: MusicBrainzRelease[]) {
  const uniqueReleases = new Map<string, MusicBrainzRelease>();

  releases.forEach((release) => {
    uniqueReleases.set(release.id, release);
  });

  return Array.from(uniqueReleases.values());
}

function removeDuplicateAlbums(albumsToClean: UserAlbum[]) {
  const uniqueAlbums = new Map<string, UserAlbum>();

  albumsToClean.forEach((album) => {
    uniqueAlbums.set(album.id, album);
  });

  return Array.from(uniqueAlbums.values());
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-blue-50 px-3 py-2">
      <p className="text-[10px] font-bold uppercase text-[#5e6b85]">
        {label}
      </p>

      <p className="text-xs font-black text-[#071f4f]">{value}</p>
    </div>
  );
}