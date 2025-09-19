// components/BotonGeneradorConceptos.tsx
"use client";

import React from "react";
import Link from "next/link";
import { HiOutlineDocumentSearch } from "react-icons/hi";

export default function BotonGeneradorConceptos() {
  return (
    <Link
      href="/generador_conceptos"
      className="group fixed bottom-[8vh] right-5 z-50 flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-3 text-white shadow-xl transition-all hover:bg-cyan-700"
    >
      <HiOutlineDocumentSearch className="text-2xl" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-300 group-hover:max-w-xs group-hover:opacity-100">
        Buscar claves SAT
      </span>
    </Link>
  );
}
