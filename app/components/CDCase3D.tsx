import Image from "next/image";

export default function CDCase3D({
  cover,
  title,
}: {
  cover: string;
  title: string;
}) {
  return (
    <div className="relative h-[150px] w-[190px]">
      {/* Cover incrustée */}
      <div
        className="
          absolute
          left-[16%]
          top-[12%]
          h-[75%]
          w-[66%]
          overflow-hidden
          bg-blue-100
          shadow-[0_10px_30px_rgba(33,85,255,0.25)]
        "
        style={{
          clipPath: "polygon(4% 0%, 100% 11%, 94% 100%, 0% 90%)",
        }}
      >
        <Image
          src={cover}
          alt={title}
          fill
          className="object-cover"
          sizes="160px"
        />

        {/* effet plastique sur la cover */}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.45),transparent_35%,rgba(255,255,255,0.25)_65%,transparent)]" />
      </div>

      {/* Pochette CD par-dessus */}
      <Image
        src="/mockups/cd-case-3d.png"
        alt="Boîtier CD"
        fill
        className="pointer-events-none object-contain"
        sizes="190px"
        priority
      />

      {/* petit glow */}
      <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-blue-400/10 blur-2xl" />
    </div>
  );
}