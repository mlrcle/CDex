import { getRarityConfig } from "@/app/lib/rarity";

export default function RarityBadge({ rarity }: { rarity?: string }) {
  const config = getRarityConfig(rarity);

  return (
    <div
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase ${config.bg} ${config.glow}`}
      style={{ color: config.color }}
    >
      {config.name}
    </div>
  );
}