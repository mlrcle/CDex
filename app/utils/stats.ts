export type CdexAlbum = {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  duration?: string;
  estimatedValue?: string;
  rarity?: string;
};

export function getUserAlbums(): CdexAlbum[] {
  if (typeof window === "undefined") return [];

  const savedAlbums = localStorage.getItem("cdex-user-albums");

  return savedAlbums ? JSON.parse(savedAlbums) : [];
}

export function getCollectionStats(albums: CdexAlbum[]) {
  const cdCount = albums.length;

  const totalValue = albums.reduce((total, album) => {
    return total + extractPrice(album.estimatedValue);
  }, 0);

  const totalDuration = albums.reduce((total, album) => {
    return total + extractMinutes(album.duration);
  }, 0);

  const favoriteGenre = getMostCommon(albums.map((album) => album.genre));
  const favoriteArtist = getMostCommon(albums.map((album) => album.artist));

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

  const numbers = value.match(/\d+/g);

  if (!numbers) return 0;

  return Number(numbers[0]);
}

function extractMinutes(duration?: string) {
  if (!duration) return 0;

  const numbers = duration.match(/\d+/g);

  if (!numbers) return 0;

  return Number(numbers[0]);
}

function getMostCommon(values: string[]) {
  const filteredValues = values.filter(
    (value) => value && value !== "Non renseigné"
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