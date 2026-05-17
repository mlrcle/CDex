export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-6">
        CDex
      </h1>

      <p className="text-xl text-gray-400 mb-10">
        Gérez votre collection de CD facilement
      </p>

      <button className="bg-white text-black px-6 py-3 rounded-xl text-lg font-semibold hover:bg-gray-300 transition">
        Scanner un CD
      </button>
    </main>
  );
}