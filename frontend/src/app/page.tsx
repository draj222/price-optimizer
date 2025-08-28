"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  return (
    <AnimatePresence mode="wait">
      <motion.section
        key="home"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-8"
      >
        <h1 className="font-heading text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-500 to-pink-400 bg-clip-text text-transparent">
          Price Optimizer
        </h1>
        <a
          href="/estimate"
          className="inline-block rounded px-6 py-3 bg-neutral-900 text-white font-semibold text-lg shadow hover:bg-neutral-700 transition"
        >
          Go to Estimate
        </a>
      </motion.section>
    </AnimatePresence>
  );
}
