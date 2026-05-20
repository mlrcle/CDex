"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { rollRarity } from "@/app/lib/rarity";
import { albums as baseAlbums } from "@/app/data/albums";
import { getLevelFromXp } from "@/app/lib/profileLevel";
import {
  getAchievements,
  getCompletedAchievementXp,
} from "@/app/lib/achievements";

type UserAlbum = {
  id: string;
  musicBrainzId?: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  duration: string;
  estimatedValue: string;
  cover: string;
  addedAt: string;
  createdAt?: string;
  discovered: boolean;
  rarity: string;
  xp: number;
  tracks: string[];
  rating?: number;
  source: "manual" | "search" | "scan" | "database" | "wishlist";
};

type GenreStat = {
  name: string;
  count: number;
  percent: number;
  color: string;
};

type RarityStat = {
  name: string;
  count: number;
  percent: number;
};

type EvolutionStat = {
  label: string;
  total: number;
};

const PIE_COLORS = [
  "#2155ff",
  "#ff4b4b",
  "#7c9cff",
  "#79b8ff",
  "#a855f7",
  "#22c55e",
  "#f59e0b",
  "#94a3b8",
];

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [albums, setAlbums] = useState<UserAlbum[]>([]);
  const [wishlist, setWishlist] = useState<UserAlbum[]>([]);
  const [wishlistConvertedCount, setWishlistConvertedCount] = useState(0);
  const [description, setDescription] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileName, setProfileName] = useState("Mon profil");
  const [objective, setObjective] = useState(50);
  const [editingObjective, setEditingObjective] = useState(false);

  useEffect(() => {
    const savedAlbums = JSON.parse(
      localStorage.getItem("cdex-user-albums") || "[]"
    );

    const migratedAlbums: UserAlbum[] = savedAlbums.map((album: any) => {
      if (
        album.rarity &&
        album.rarity !== "Non renseigné" &&
        album.rarity !== "Non renseignée" &&
        typeof album.xp === "number"
      ) {
        return album;
      }

      const rarity = rollRarity();

      return {
        ...album,
        rarity: rarity.name,
        xp: rarity.xp,
      };
    });

    localStorage.setItem("cdex-user-albums", JSON.stringify(migratedAlbums));

    const cleanedBaseAlbums = baseAlbums.map((album: any) => ({
      ...album,
      source: "database",
    }));

    setAlbums([...migratedAlbums, ...cleanedBaseAlbums]);
    setWishlist(JSON.parse(localStorage.getItem("cdex-wishlist") || "[]"));

    setWishlistConvertedCount(
      Number(localStorage.getItem("cdex-wishlist-converted-count") || 0)
    );

    setDescription(localStorage.getItem("cdex-profile-description") || "");
    setProfileImage(localStorage.getItem("cdex-profile-image") || "");
    setProfileName(localStorage.getItem("cdex-profile-name") || "Mon profil");

    const savedObjective = localStorage.getItem("cdex-collection-objective");
    setObjective(savedObjective ? Number(savedObjective) || 50 : 50);
  }, []);

  function saveDescription(value: string) {
    setDescription(value);
    localStorage.setItem("cdex-profile-description", value);
  }

  function saveProfileName(value: string) {
    setProfileName(value);
    localStorage.setItem("cdex-profile-name", value);
  }

  function saveObjective(value: string) {
    const number = Math.max(1, Number(value) || 1);
    setObjective(number);
    localStorage.setItem("cdex-collection-objective", String(number));
  }

  function handleProfileImage(file: File | undefined) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);
        localStorage.setItem("cdex-profile-image", reader.result);
      }
    };

    reader.readAsDataURL(file);
  }

  const rawOwnedAlbums = useMemo(() => {
    return albums.filter((album) => album.source !== "database");
  }, [albums]);

  const ownedAlbums = useMemo(() => {
    return rawOwnedAlbums.map((ownedAlbum) => {
      const matchingBase = baseAlbums.find((baseAlbum: any) => {
        return (
          String(baseAlbum.id) === String(ownedAlbum.id) ||
          String(baseAlbum.musicBrainzId || "") ===
            String(ownedAlbum.musicBrainzId || "") ||
          `${baseAlbum.title}-${baseAlbum.artist}`.toLowerCase() ===
            `${ownedAlbum.title}-${ownedAlbum.artist}`.toLowerCase()
        );
      }) as Partial<UserAlbum> | undefined;

      return {
        ...matchingBase,
        ...ownedAlbum,
        genre:
  normalizeValue(matchingBase?.genre) !== "Non renseigné"
    ? matchingBase?.genre
    : ownedAlbum.genre,
        duration:
          normalizeValue(ownedAlbum.duration) !== "Non renseigné"
            ? ownedAlbum.duration
            : matchingBase?.duration || ownedAlbum.duration,
        estimatedValue:
          normalizeValue(ownedAlbum.estimatedValue) !== "Non renseigné"
            ? ownedAlbum.estimatedValue
            : matchingBase?.estimatedValue || ownedAlbum.estimatedValue,
        cover: ownedAlbum.cover || matchingBase?.cover || "",
        year: ownedAlbum.year || matchingBase?.year || 0,
      } as UserAlbum;
    });
  }, [rawOwnedAlbums]);

  const totalAlbums = ownedAlbums.length;

  const albumXp = useMemo(() => {
    return ownedAlbums.reduce((total, album) => total + (album.xp || 0), 0);
  }, [ownedAlbums]);

  const achievements = useMemo(() => {
    return getAchievements(ownedAlbums, wishlistConvertedCount);
  }, [ownedAlbums, wishlistConvertedCount]);

  const achievementXp = useMemo(() => {
    return getCompletedAchievementXp(achievements);
  }, [achievements]);

  const totalXp = albumXp + achievementXp;

  const levelData = useMemo(() => getLevelFromXp(totalXp), [totalXp]);

  const totalDuration = useMemo(() => {
    return ownedAlbums.reduce((total, album) => {
      const value = parseInt(String(album.duration).replace(/\D/g, ""));
      return total + (Number.isNaN(value) ? 0 : value);
    }, 0);
  }, [ownedAlbums]);

  const totalValue = useMemo(() => {
    return ownedAlbums.reduce((total, album) => {
      const value = parseFloat(String(album.estimatedValue).replace(",", "."));
      return total + (Number.isNaN(value) ? 0 : value);
    }, 0);
  }, [ownedAlbums]);

  const genreStats = useMemo(() => getGenreStats(albums), [albums]);
  const rarityStats = useMemo(() => getRarityStats(ownedAlbums), [ownedAlbums]);
  const evolutionStats = useMemo(
    () => getEvolutionStats(rawOwnedAlbums),
    [rawOwnedAlbums]
  );
  const topArtists = useMemo(() => getTopArtists(ownedAlbums), [ownedAlbums]);

  const favoriteGenre = genreStats[0]?.name || "Non défini";
  const favoriteArtist = topArtists[0]?.name || "Non défini";

  const albumsWithCover = ownedAlbums.filter((album) => album.cover).length;
  const coverPercent =
    totalAlbums > 0 ? Math.round((albumsWithCover / totalAlbums) * 100) : 0;

  const objectivePercent =
    objective > 0
      ? Math.min(100, Math.round((totalAlbums / objective) * 100))
      : 0;

  const completedAchievements = achievements.filter(
    (achievement) => achievement.completed
  ).length;

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-6">
      <section className="rounded-[2.4rem] border border-blue-100/70 bg-white/85 p-5 shadow-[0_18px_55px_rgba(33,85,255,0.13)] backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#2155ff]">
          Profil
        </p>

        <div className="mt-4 flex items-start gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border border-blue-100 bg-blue-50 shadow-[0_8px_25px_rgba(33,85,255,0.12)]"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Photo de profil"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl">👤</span>
            )}

            <span className="absolute bottom-1 right-1 rounded-full bg-[#2155ff] px-2 py-1 text-[10px] font-black text-white">
              +
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleProfileImage(event.target.files?.[0])}
          />

          <div className="min-w-0 flex-1">
            <input
              value={profileName}
              onChange={(event) => saveProfileName(event.target.value)}
              placeholder="Nom du profil"
              className="w-full bg-transparent text-4xl font-black leading-none tracking-tight text-[#2155ff] outline-none"
            />

            <p className="mt-3 text-sm font-semibold leading-6 text-[#5e6b85]">
              Ton espace personnel : niveau, description, goûts musicaux et
              statistiques.
            </p>
          </div>
        </div>

        <textarea
          value={description}
          onChange={(event) => saveDescription(event.target.value)}
          placeholder="Écris une petite description de ton profil musical..."
          className="mt-5 h-24 w-full resize-none rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-semibold text-[#071f4f] outline-none transition focus:border-[#2155ff] focus:ring-4 focus:ring-blue-100"
        />

        <div className="mt-5 rounded-[2rem] border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-[#071f4f]">
              Niveau {levelData.level}
            </p>
            <p className="text-sm font-black text-[#2155ff]">
              {levelData.currentXp}/{levelData.nextLevelXp} XP
            </p>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-[#2155ff]"
              style={{ width: `${levelData.progress}%` }}
            />
          </div>

          <p className="mt-2 text-xs font-bold text-[#6b7895]">
            Encore {levelData.nextLevelXp - levelData.currentXp} XP avant le
            niveau suivant.
          </p>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-3 gap-3">
        <StatCard label="CD ajoutés" value={totalAlbums.toString()} />
        <StatCard label="Niveau" value={levelData.level.toString()} />
        <StatCard label="Durée totale" value={`${totalDuration} min`} />
        <StatCard label="Valeur estimée" value={`${Math.round(totalValue)} €`} />
      </section>

      <section className="mt-5 rounded-[2.4rem] border border-blue-100/70 bg-white/85 p-5 shadow-[0_18px_55px_rgba(33,85,255,0.12)]">
        <h2 className="text-2xl font-black text-[#2155ff]">Statistiques</h2>

        <div className="mt-5 rounded-[2rem] border border-blue-100 bg-blue-50/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2155ff]">
              Répartition par genre
            </p>
            <p className="text-xs font-black text-[#6b7895]">{totalAlbums} CD</p>
          </div>

          {genreStats.length > 0 ? (
            <div className="mt-5 flex items-center gap-5">
              <PieChart stats={genreStats} />

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                {genreStats.map((genre) => (
                  <div
                    key={genre.name}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: genre.color }}
                      />
                      <p className="truncate text-xs font-black text-[#071f4f]">
                        {genre.name}
                      </p>
                    </div>

                    <p className="text-xs font-black text-[#2155ff]">
                      {genre.percent}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyStat text="Ajoute des genres à tes albums pour afficher le camembert." />
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[2rem] border border-blue-100 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2155ff]">
              Évolution
            </p>

            <div className="mt-4 h-40 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
              {evolutionStats.length > 0 ? (
                <EvolutionChart stats={evolutionStats} />
              ) : (
                <EmptyStat text="Pas encore assez de dates d’ajout." />
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-100 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2155ff]">
              Rareté
            </p>

            <div className="mt-4 flex h-40 flex-col justify-center gap-3">
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-black uppercase text-[#071f4f]">
                    Total
                  </p>

                  <p className="text-[10px] font-black text-[#2155ff]">
                    {totalAlbums}
                  </p>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-blue-50">
                  <div className="h-full w-full rounded-full bg-[#2155ff]" />
                </div>
              </div>

              {rarityStats.length > 0 ? (
                rarityStats.slice(0, 4).map((rarity) => (
                  <RarityLine key={rarity.name} stat={rarity} max={totalAlbums} />
                ))
              ) : (
                <EmptyStat text="Aucune rareté." />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[2.4rem] border border-blue-100/70 bg-white/85 p-5 shadow-[0_18px_55px_rgba(33,85,255,0.12)]">
        <h2 className="text-2xl font-black text-[#2155ff]">
          Analyse collection
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniInfo label="Genre favori" value={favoriteGenre} />
          <MiniInfo label="Artiste favori" value={favoriteArtist} />
          <MiniInfo label="Pochettes" value={`${coverPercent}%`} />
          <MiniInfo label="Wishlist" value={wishlist.length.toString()} />
        </div>

        <div className="mt-5 rounded-[2rem] border border-blue-100 bg-blue-50/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-[#071f4f]">
              Objectif collection
            </p>

            <div className="flex items-center gap-2">
              {editingObjective ? (
                <input
                  value={objective}
                  onChange={(event) => saveObjective(event.target.value)}
                  onBlur={() => setEditingObjective(false)}
                  autoFocus
                  inputMode="numeric"
                  className="w-16 rounded-xl border border-blue-100 bg-white px-2 py-1 text-right text-sm font-black text-[#2155ff] outline-none"
                />
              ) : (
                <p className="text-sm font-black text-[#2155ff]">
                  {totalAlbums}/{objective} CD
                </p>
              )}

              <button
                onClick={() => setEditingObjective(true)}
                className="flex h-14 w-14 shrink-0 items-center justify-center overflow-visible rounded-full bg-transparent p-0 transition active:scale-95"
              >
                <img
                  src="/pen.png"
                  alt="Modifier"
                  className="h-12 w-12 object-contain drop-shadow-[0_6px_14px_rgba(33,85,255,0.35)]"
                />
              </button>
            </div>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-[#2155ff]"
              style={{ width: `${objectivePercent}%` }}
            />
          </div>
        </div>

        {topArtists.length > 0 && (
          <div className="mt-5 rounded-[2rem] border border-blue-100 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2155ff]">
              Top artistes
            </p>

            <div className="mt-3 flex flex-col gap-2">
              {topArtists.slice(0, 3).map((artist, index) => (
                <div
                  key={artist.name}
                  className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3"
                >
                  <p className="truncate text-sm font-black text-[#071f4f]">
                    #{index + 1} {artist.name}
                  </p>
                  <p className="shrink-0 text-sm font-black text-[#2155ff]">
                    {artist.count} CD
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-5 rounded-[2.4rem] border border-blue-100/70 bg-white/85 p-5 shadow-[0_18px_55px_rgba(33,85,255,0.12)]">
        <h2 className="text-2xl font-black text-[#2155ff]">Amis</h2>

        <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 px-5 py-5 text-center text-sm font-black text-[#6b7895]">
          Aucun ami ajouté pour le moment.
        </div>

        <Link
          href="/community"
          className="mt-4 block w-full rounded-2xl bg-[#2155ff] px-5 py-4 text-center text-lg font-black text-white shadow-[0_10px_30px_rgba(33,85,255,0.35)]"
        >
          Trouver des amis
        </Link>
      </section>

      <section className="mt-5 grid grid-cols-3 gap-3">
        <Link
          href="/wishlist"
          className="rounded-[2rem] border border-blue-100 bg-white p-4 text-center shadow-[0_8px_25px_rgba(33,85,255,0.08)] transition active:scale-[0.98]"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            <img
              src="/etoile.png"
              alt="Wishlist"
              className="h-8 w-8 object-contain"
            />
          </div>
          <p className="mt-3 text-sm font-black text-[#2155ff]">Wishlist</p>
        </Link>
<Link
  href="/achievements"
  className="rounded-[2rem] border border-blue-100 bg-white p-4 text-center shadow-[0_8px_25px_rgba(33,85,255,0.08)] transition active:scale-[0.98]"
>
  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
    <img
      src="/objectif.png"
      alt="Objectifs"
      className="h-20 w-20 object-contain"
    />
  </div>
  <p className="mt-3 text-sm font-black text-[#2155ff]">Objectifs</p>
</Link>
        <Link
          href="/favorites"
          className="rounded-[2rem] border border-blue-100 bg-white p-4 text-center shadow-[0_8px_25px_rgba(33,85,255,0.08)] transition active:scale-[0.98]"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            <img
              src="/coeur.png"
              alt="Favoris"
              className="h-8 w-8 object-contain"
            />
          </div>
          <p className="mt-3 text-sm font-black text-[#2155ff]">Favoris</p>
        </Link>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.6rem] border border-blue-100 bg-white/90 p-4 shadow-[0_8px_25px_rgba(33,85,255,0.08)]">
      <p className="text-xs font-black uppercase text-[#6b7895]">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#2155ff]">{value}</p>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
      <p className="text-xs font-black uppercase text-[#6b7895]">{label}</p>
      <p className="mt-2 truncate text-lg font-black text-[#071f4f]">{value}</p>
    </div>
  );
}

function PieChart({ stats }: { stats: GenreStat[] }) {
  let current = 0;

  const gradient = stats
    .map((stat) => {
      const start = current;
      const end = current + stat.percent;
      current = end;
      return `${stat.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="relative h-28 w-28 shrink-0">
      <div
        className="h-28 w-28 rounded-full shadow-[0_8px_25px_rgba(33,85,255,0.18)]"
        style={{ background: `conic-gradient(${gradient})` }}
      />

      <div className="absolute inset-5 flex items-center justify-center rounded-full bg-white">
        <p className="text-lg font-black text-[#2155ff]">
          {stats[0]?.percent || 0}%
        </p>
      </div>
    </div>
  );
}

function RarityLine({ stat, max }: { stat: RarityStat; max: number }) {
  const percent = max > 0 ? Math.round((stat.count / max) * 100) : 0;

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="max-w-[70px] truncate text-[10px] font-black uppercase text-[#6b7895]">
          {stat.name}
        </p>

        <p className="text-[10px] font-black text-[#2155ff]">{stat.count}</p>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-blue-50">
        <div
          className="h-full rounded-full bg-[#2155ff]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function EvolutionChart({ stats }: { stats: EvolutionStat[] }) {
  const max = Math.max(...stats.map((item) => item.total), 1);

  const points = stats.map((item, index) => {
    const x = stats.length === 1 ? 50 : (index / (stats.length - 1)) * 100;
    const y = 100 - (item.total / max) * 85;
    return `${x},${y}`;
  });

  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#2155ff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => {
          const [x, y] = point.split(",").map(Number);

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3.5"
              fill="white"
              stroke="#2155ff"
              strokeWidth="2.5"
            />
          );
        })}
      </svg>

      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] font-black text-[#6b7895]">
        {stats.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

function EmptyStat({ text }: { text: string }) {
  return (
    <div className="flex min-h-24 w-full items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 px-4 text-center text-xs font-black text-[#6b7895]">
      {text}
    </div>
  );
}

function getGenreStats(albums: UserAlbum[]): GenreStat[] {
  const count: Record<string, number> = {};

  albums.forEach((album) => {
    const genre = normalizeValue(album.genre);

    if (genre === "Non renseigné") return;

    count[genre] = (count[genre] || 0) + 1;
  });

  const totalKnownGenres = Object.values(count).reduce(
    (sum, value) => sum + value,
    0
  );

  return Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value], index) => ({
      name,
      count: value,
      percent:
        totalKnownGenres > 0 ? Math.round((value / totalKnownGenres) * 100) : 0,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));
}

function getRarityStats(albums: UserAlbum[]): RarityStat[] {
  const validRarities = [
    "Commun",
    "Rare",
    "Très rare",
    "Épique",
    "Légendaire",
  ];

  const count: Record<string, number> = {};

  albums.forEach((album) => {
    const rarity = normalizeRarity(album.rarity);

    if (!validRarities.includes(rarity)) return;

    count[rarity] = (count[rarity] || 0) + 1;
  });

  return Object.entries(count)
    .map(([name, value]) => ({
      name,
      count: value,
      percent: albums.length > 0 ? Math.round((value / albums.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function getEvolutionStats(albums: UserAlbum[]): EvolutionStat[] {
  const validAlbums = albums
    .map((album) => {
      const rawDate =
        album.addedAt ||
        album.createdAt ||
        (album as any).dateAdded ||
        (album as any).addedDate;

      return {
        ...album,
        date: parseAlbumDate(rawDate),
      };
    })
    .filter((album) => album.date)
    .sort((a, b) => Number(a.date) - Number(b.date));

  if (validAlbums.length === 0) return [];

  const byDate: Record<string, number> = {};

  validAlbums.forEach((album) => {
    if (!album.date) return;

    const label = album.date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });

    byDate[label] = (byDate[label] || 0) + 1;
  });

  let total = 0;

  return Object.entries(byDate).map(([label, count]) => {
    total += count;
    return { label, total };
  });
}

function getTopArtists(albums: UserAlbum[]) {
  const count: Record<string, number> = {};

  albums.forEach((album) => {
    const artist = normalizeValue(album.artist);

    if (artist === "Non renseigné" || artist === "Artiste inconnu") return;

    count[artist] = (count[artist] || 0) + 1;
  });

  return Object.entries(count)
    .map(([name, value]) => ({ name, count: value }))
    .sort((a, b) => b.count - a.count);
}

function normalizeValue(value: unknown) {
  const text = String(value || "").trim();

  if (!text || text === "undefined" || text === "null") {
    return "Non renseigné";
  }

  return text;
}

function normalizeRarity(value: unknown) {
  const text = normalizeValue(value).toLowerCase();

  if (text === "commun") return "Commun";
  if (text === "rare") return "Rare";
  if (text === "très rare" || text === "tres rare") return "Très rare";
  if (text === "épique" || text === "epique") return "Épique";
  if (text === "légendaire" || text === "legendaire") return "Légendaire";

  return "Non renseigné";
}

function parseAlbumDate(value: unknown) {
  if (!value) return null;

  const text = String(value).trim();

  const frenchParts = text.split("/");
  if (frenchParts.length === 3) {
    const [day, month, year] = frenchParts.map(Number);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}