import Image from "next/image";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-500 to-pink-400 bg-clip-text text-transparent">
        Price Optimizer
      </h1>
      <a
        href="/estimate"
        className="inline-block rounded px-6 py-3 bg-neutral-900 text-white font-semibold text-lg shadow hover:bg-neutral-700 transition"
      >
        Go to Estimate
      </a>
    </section>
  );
}
