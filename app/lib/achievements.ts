export type AlbumLike = {
  id: string;
  title?: string;
  artist?: string;
  genre?: string;
  year?: number | string;
  rarity?: string;
  cover?: string;
  duration?: string;
  estimatedValue?: string;
  rating?: number;
};

export type Achievement = {
  id: string;
  category: string;
  title: string;
  description: string;
  xp: number;
  current: number;
  target: number;
  completed: boolean;
};

function clean(value?: string) {
  return String(value || "").trim().toLowerCase();
}

function hasValue(value: any) {
  return value !== undefined && value !== null && String(value).trim() !== "" && String(value).trim() !== "Non renseigné";
}

function getEstimatedValue(album: AlbumLike) {
  const raw = String(album.estimatedValue || "")
    .replace("€", "")
    .replace(",", ".")
    .trim();

  const numbers = raw.match(/\d+(\.\d+)?/g);
  if (!numbers) return 0;

  return numbers.reduce((sum, value) => sum + Number(value), 0) / numbers.length;
}

function decadeOf(year?: number | string) {
  const y = Number(year);
  if (!y || Number.isNaN(y)) return null;
  return Math.floor(y / 10) * 10;
}

function makeAchievement(
  id: string,
  category: string,
  title: string,
  description: string,
  xp: number,
  current: number,
  target: number
): Achievement {
  return {
    id,
    category,
    title,
    description,
    xp,
    current,
    target,
    completed: current >= target,
  };
}

export function getAchievements(albums: AlbumLike[], wishlistConvertedCount = 0) {
  const totalAlbums = albums.length;

  const rarityCount = {
    rare: albums.filter((a) => clean(a.rarity) === "rare").length,
    tresRare: albums.filter((a) => clean(a.rarity) === "très rare" || clean(a.rarity) === "tres rare").length,
    epique: albums.filter((a) => clean(a.rarity) === "épique" || clean(a.rarity) === "epique").length,
    legendaire: albums.filter((a) => clean(a.rarity) === "légendaire" || clean(a.rarity) === "legendaire").length,
  };

  const allRarities = ["commun", "rare", "très rare", "épique", "légendaire"].every((rarity) =>
    albums.some((a) => clean(a.rarity) === rarity)
  );

  const genres = new Set(
    albums
      .map((a) => clean(a.genre))
      .filter((genre) => genre && genre !== "non renseigné")
  );

  const artistsCount: Record<string, number> = {};
  albums.forEach((album) => {
    const artist = clean(album.artist);
    if (!artist || artist === "artiste inconnu") return;
    artistsCount[artist] = (artistsCount[artist] || 0) + 1;
  });

  const maxSameArtist = Math.max(0, ...Object.values(artistsCount));

  const decades = new Set(
    albums.map((album) => decadeOf(album.year)).filter(Boolean)
  );

  const totalValue = albums.reduce((sum, album) => sum + getEstimatedValue(album), 0);

  const withCover = albums.filter((a) => hasValue(a.cover)).length;
  const withGenre = albums.filter((a) => hasValue(a.genre)).length;
  const withDuration = albums.filter((a) => hasValue(a.duration)).length;
  const withEstimation = albums.filter((a) => hasValue(a.estimatedValue)).length;
  const withRating = albums.filter((a) => typeof a.rating === "number").length;

  return [
    makeAchievement("collection-10", "Collection", "10 albums", "Posséder 10 albums.", 50, totalAlbums, 10),
    makeAchievement("collection-25", "Collection", "25 albums", "Posséder 25 albums.", 100, totalAlbums, 25),
    makeAchievement("collection-50", "Collection", "50 albums", "Posséder 50 albums.", 250, totalAlbums, 50),
    makeAchievement("collection-100", "Collection", "100 albums", "Posséder 100 albums.", 500, totalAlbums, 100),
    makeAchievement("collection-250", "Collection", "250 albums", "Posséder 250 albums.", 1000, totalAlbums, 250),
    makeAchievement("collection-500", "Collection", "500 albums", "Posséder 500 albums.", 2500, totalAlbums, 500),

    makeAchievement("rare-5", "Rareté", "5 rares", "Posséder 5 albums rares.", 50, rarityCount.rare, 5),
    makeAchievement("rare-15", "Rareté", "15 rares", "Posséder 15 albums rares.", 200, rarityCount.rare, 15),
    makeAchievement("rare-30", "Rareté", "30 rares", "Posséder 30 albums rares.", 500, rarityCount.rare, 30),

    makeAchievement("tres-rare-3", "Rareté", "3 très rares", "Posséder 3 albums très rares.", 150, rarityCount.tresRare, 3),
    makeAchievement("tres-rare-10", "Rareté", "10 très rares", "Posséder 10 albums très rares.", 300, rarityCount.tresRare, 10),
    makeAchievement("tres-rare-25", "Rareté", "25 très rares", "Posséder 25 albums très rares.", 1000, rarityCount.tresRare, 25),

    makeAchievement("epique-3", "Rareté", "3 épiques", "Posséder 3 albums épiques.", 200, rarityCount.epique, 3),
    makeAchievement("epique-5", "Rareté", "5 épiques", "Posséder 5 albums épiques.", 500, rarityCount.epique, 5),
    makeAchievement("epique-10", "Rareté", "10 épiques", "Posséder 10 albums épiques.", 1500, rarityCount.epique, 10),

    makeAchievement("legendaire-3", "Rareté", "3 légendaires", "Posséder 3 albums légendaires.", 1250, rarityCount.legendaire, 3),
    makeAchievement("legendaire-5", "Rareté", "5 légendaires", "Posséder 5 albums légendaires.", 2500, rarityCount.legendaire, 5),
    makeAchievement("legendaire-10", "Rareté", "10 légendaires", "Posséder 10 albums légendaires.", 15000, rarityCount.legendaire, 10),

    makeAchievement("all-rarities", "Rareté", "Toutes les raretés", "Posséder au moins un album de chaque rareté.", 500, allRarities ? 1 : 0, 1),

    makeAchievement("genres-5", "Genres", "5 genres", "Posséder 5 genres différents.", 50, genres.size, 5),
    makeAchievement("genres-10", "Genres", "10 genres", "Posséder 10 genres différents.", 150, genres.size, 10),
    makeAchievement("genres-20", "Genres", "20 genres", "Posséder 20 genres différents.", 350, genres.size, 20),
    makeAchievement("genres-30", "Genres", "30 genres", "Posséder 30 genres différents.", 1000, genres.size, 30),

    makeAchievement("artist-3", "Artistes", "3 albums même artiste", "Posséder 3 albums du même artiste.", 50, maxSameArtist, 3),
    makeAchievement("artist-5", "Artistes", "5 albums même artiste", "Posséder 5 albums du même artiste.", 250, maxSameArtist, 5),
    makeAchievement("artist-10", "Artistes", "10 albums même artiste", "Posséder 10 albums du même artiste.", 650, maxSameArtist, 10),
    makeAchievement("artist-20", "Artistes", "20 albums même artiste", "Posséder 20 albums du même artiste.", 1500, maxSameArtist, 20),

    makeAchievement("decade-70", "Époques", "Années 70", "Posséder un album des années 70.", 35, decades.has(1970) ? 1 : 0, 1),
    makeAchievement("decade-80", "Époques", "Années 80", "Posséder un album des années 80.", 35, decades.has(1980) ? 1 : 0, 1),
    makeAchievement("decade-90", "Époques", "Années 90", "Posséder un album des années 90.", 35, decades.has(1990) ? 1 : 0, 1),
    makeAchievement("decade-2000", "Époques", "Années 2000", "Posséder un album des années 2000.", 35, decades.has(2000) ? 1 : 0, 1),
    makeAchievement("decade-2010", "Époques", "Années 2010", "Posséder un album des années 2010.", 35, decades.has(2010) ? 1 : 0, 1),
    makeAchievement("decade-2020", "Époques", "Années 2020", "Posséder un album des années 2020.", 35, decades.has(2020) ? 1 : 0, 1),
    makeAchievement("decade-5", "Époques", "Historien musical", "Posséder des albums de 5 décennies différentes.", 500, decades.size, 5),

    makeAchievement("value-100", "Valeur", "Collection > 100€", "Atteindre 100€ de valeur estimée.", 100, totalValue, 100),
    makeAchievement("value-500", "Valeur", "Collection > 500€", "Atteindre 500€ de valeur estimée.", 500, totalValue, 500),
    makeAchievement("value-1000", "Valeur", "Collection > 1000€", "Atteindre 1000€ de valeur estimée.", 1000, totalValue, 1000),
    makeAchievement("value-5000", "Valeur", "Collection > 5000€", "Atteindre 5000€ de valeur estimée.", 5000, totalValue, 5000),

    makeAchievement("cover-100", "Complétion", "100 covers", "Avoir 100 albums avec cover.", 500, withCover, 100),
    makeAchievement("cover-250", "Complétion", "250 covers", "Avoir 250 albums avec cover.", 1500, withCover, 250),

    makeAchievement("genre-100", "Complétion", "100 genres renseignés", "Avoir 100 albums avec genre.", 500, withGenre, 100),
    makeAchievement("genre-250", "Complétion", "250 genres renseignés", "Avoir 250 albums avec genre.", 1500, withGenre, 250),

    makeAchievement("duration-100", "Complétion", "100 durées renseignées", "Avoir 100 albums avec durée.", 500, withDuration, 100),
    makeAchievement("duration-250", "Complétion", "250 durées renseignées", "Avoir 250 albums avec durée.", 1500, withDuration, 250),

    makeAchievement("estimation-100", "Complétion", "100 estimations", "Avoir 100 albums avec estimation.", 500, withEstimation, 100),
    makeAchievement("estimation-250", "Complétion", "250 estimations", "Avoir 250 albums avec estimation.", 1500, withEstimation, 250),

    makeAchievement("rating-100", "Complétion", "100 albums notés", "Avoir 100 albums notés.", 500, withRating, 100),
    makeAchievement("rating-250", "Complétion", "250 albums notés", "Avoir 250 albums notés.", 1500, withRating, 250),

    makeAchievement("wishlist-10", "Wishlist", "10 envies trouvées", "10 albums wishlist devenus possédés.", 300, wishlistConvertedCount, 10),
    makeAchievement("wishlist-25", "Wishlist", "25 envies trouvées", "25 albums wishlist devenus possédés.", 850, wishlistConvertedCount, 25),
    makeAchievement("wishlist-50", "Wishlist", "50 envies trouvées", "50 albums wishlist devenus possédés.", 1500, wishlistConvertedCount, 50),
  ];
}

export function getCompletedAchievementXp(achievements: Achievement[]) {
  return achievements
    .filter((achievement) => achievement.completed)
    .reduce((total, achievement) => total + achievement.xp, 0);
}