"use client";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button aria-label="Open menu" className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800">
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="pt-8 w-64">
        <nav className="flex flex-col gap-4 mt-8">
          <Link href="/estimate" className="text-lg font-medium" onClick={() => setOpen(false)}>
            Estimate
          </Link>
          <Link href="/about" className="text-lg font-medium" onClick={() => setOpen(false)}>
            About
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
