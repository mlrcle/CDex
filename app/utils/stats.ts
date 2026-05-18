export type CdexAlbum = {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre?: string;
  duration?: string;
  estimatedValue?: string;
  rarity?: string;
};

export function getUserAlbums(): CdexAlbum[] {
  if (typeof window === "undefined") return [];

  const savedAlbums = localStorage.getItem("cdex-user-albums");
  const albums: CdexAlbum[] = savedAlbums ? JSON.parse(savedAlbums) : [];

  return albums.map((album) => {
    const personalData = localStorage.getItem(
      `cdex-album-personal-${album.id}`
    );

    if (!personalData) return album;

    try {
      const data = JSON.parse(personalData);

      return {
        ...album,
        title: data.editedTitle || album.title,
        artist: data.editedArtist || album.artist,
        genre: data.editedGenre || album.genre,
        duration: data.editedDuration || album.duration,
        estimatedValue: data.editedValue || album.estimatedValue,
        rarity: data.editedRarity || album.rarity,
      };
    } catch {
      return album;
    }
  });
}

export function getCollectionStats(albums: CdexAlbum[]) {
  const cdCount = albums.length;

  const totalValue = albums.reduce((total, album) => {
    return total + extractPrice(album.estimatedValue);
  }, 0);

  const totalDuration = albums.reduce((total, album) => {
    return total + extractMinutes(album.duration);
  }, 0);

  const favoriteGenre = getMostCommon(
    albums.map((album) => album.genre || "")
  );

  const favoriteArtist = getMostCommon(
    albums.map((album) => album.artist || "")
  );

  const level = calculateLevel(albums);

  return {
    cdCount,
    totalValue,
    totalDuration,
    favoriteGenre,
    favoriteArtist,
    level,
  };
}

function extractPrice(value?: string) {
  if (!value) return 0;

  const cleaned = value.replace(",", ".");

  const match = cleaned.match(/\d+(\.\d+)?/);

  if (!match) return 0;

  return Number(match[0]);
}

function extractMinutes(duration?: string) {
  if (!duration) return 0;

  const text = duration.toLowerCase();

  const hoursMatch = text.match(/(\d+)\s*h/);
  const minutesMatch = text.match(/(\d+)\s*min/);

  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;

  if (hours || minutes) return hours * 60 + minutes;

  const simpleNumber = text.match(/\d+/);

  return simpleNumber ? Number(simpleNumber[0]) : 0;
}

function getMostCommon(values: string[]) {
  const ignoredValues = [
    "",
    "Non renseigné",
    "Non renseignée",
    "Inconnu",
    "Inconnue",
    "Aucun",
  ];

  const filteredValues = values.filter(
    (value) => value && !ignoredValues.includes(value)
  );

  if (filteredValues.length === 0) return "Aucun pour le moment";

  const count: Record<string, number> = {};

  filteredValues.forEach((value) => {
    count[value] = (count[value] || 0) + 1;
  });

  return Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
}

function calculateLevel(albums: CdexAlbum[]) {
  let points = 0;

  albums.forEach((album) => {
    points += 10;

    if (album.rarity === "Rare") points += 10;
    if (album.rarity === "Collector") points += 20;
    if (album.rarity === "Légendaire") points += 40;
  });

  return Math.floor(points / 50);
}