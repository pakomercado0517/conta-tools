import Link from "next/link";
import { HiOutlineDocumentSearch } from "react-icons/hi";

export default function BotonGeneradorConceptos() {
  return (
    <Link
      href="/generador_conceptos" // ✅ Ruta hacia tu feature
      className="fixed bottom-20 right-6 z-50 flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-white shadow-lg transition-all hover:bg-cyan-700"
    >
      <HiOutlineDocumentSearch className="text-xl" />
      <span className="hidden sm:inline">Encuentrar clave SAT</span>
    </Link>
  );
}
