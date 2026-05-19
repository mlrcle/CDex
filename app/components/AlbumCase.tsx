export default function AlbumCase({
  cover,
  title,
  large = false,
}: {
  cover: string;
  title: string;
  large?: boolean;
}) {
  return (
    <div
      className={`relative mx-auto ${
        large ? "h-72 w-72" : "h-40 w-40"
      }`}
    >
      <div className="absolute right-[-18%] top-1/2 aspect-square w-[78%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#ffffff_0%,#dbeafe_18%,#2155ff_19%,#eef5ff_21%,#c7d8ff_45%,#ffffff_46%,#dbeafe_100%)] shadow-[0_16px_35px_rgba(33,85,255,0.25)]" />

      <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_18px_45px_rgba(33,85,255,0.25)]">
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-blue-50 text-5xl">
            💿
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-blue-500/10" />
      </div>
    </div>
  );
}