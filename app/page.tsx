import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold mb-4 text-white">🌸</h1>
        <h2 className="text-3xl font-bold mb-3 text-white">SafeSpace</h2>
        <p className="text-gray-400 text-lg mb-2">A home for us.</p>
        <p className="text-gray-500 text-sm mb-10">Women only. No exceptions.</p>
        <div className="flex flex-col gap-3">
          <Link href="/join">
            <button className="w-full px-6 py-3 bg-pink-600 rounded-full text-white font-semibold hover:bg-pink-500 transition">
              Join
            </button>
          </Link>
          <Link href="/feed">
            <button className="w-full px-6 py-3 border border-gray-700 rounded-full text-gray-300 hover:border-gray-500 transition">
              Explore
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
