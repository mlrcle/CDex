export type RarityName =
  | "Commun"
  | "Rare"
  | "Très rare"
  | "Épique"
  | "Légendaire";

export type RarityConfig = {
  name: RarityName;
  chance: number;
  xp: number;
  color: string;
  bg: string;
  glow: string;
};

export const RARITIES: RarityConfig[] = [
  {
    name: "Commun",
    chance: 70,
    xp: 10,
    color: "#2155ff",
    bg: "bg-blue-50",
    glow: "shadow-[0_0_18px_rgba(33,85,255,0.25)]",
  },
  {
    name: "Rare",
    chance: 20,
    xp: 25,
    color: "#22c55e",
    bg: "bg-green-50",
    glow: "shadow-[0_0_18px_rgba(34,197,94,0.25)]",
  },
  {
    name: "Très rare",
    chance: 7,
    xp: 100,
    color: "#a855f7",
    bg: "bg-purple-50",
    glow: "shadow-[0_0_18px_rgba(168,85,247,0.25)]",
  },
  {
    name: "Épique",
    chance: 2.5,
    xp: 250,
    color: "#ff4b4b",
    bg: "bg-red-50",
    glow: "shadow-[0_0_18px_rgba(255,75,75,0.28)]",
  },
  {
    name: "Légendaire",
    chance: 0.5,
    xp: 1000,
    color: "#f59e0b",
    bg: "bg-yellow-50",
    glow: "shadow-[0_0_22px_rgba(245,158,11,0.35)]",
  },
];

export function rollRarity() {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const rarity of RARITIES) {
    cumulative += rarity.chance;

    if (random <= cumulative) {
      return rarity;
    }
  }

  return RARITIES[0];
}

export function getRarityConfig(name?: string) {
  return RARITIES.find((rarity) => rarity.name === name) ?? RARITIES[0];
}