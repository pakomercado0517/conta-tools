import { Button } from "flowbite-react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo_transparent.svg";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-teal-900">
      <section className="flex min-h-screen flex-col items-center justify-center px-6 md:flex-row md:px-10 lg:px-16">
        {/* Contenido izquierdo */}
        <div className="max-w-2xl flex-1 md:pr-8 lg:pr-12">
          <h1 className="mb-8 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl xl:text-7xl">
            ContaTools: Desde cotizaciones hasta el control de efectivo, con
            facilidad.
          </h1>

          <Link href="/dashboard">
            <Button
              size="lg"
              className="mt-8 rounded-2xl border-0 bg-teal-500 px-8 py-4 text-lg font-semibold text-white hover:bg-teal-600 focus:ring-4 focus:ring-teal-300"
            >
              Empezar ahora
            </Button>
          </Link>
        </div>

        {/* Contenido derecho - Logo */}
        <div className="mt-12 flex flex-1 items-center justify-center md:mt-0">
          <div className="relative">
            <Image
              src={logo}
              alt="Logo ContaTools"
              width={400}
              height={400}
              priority={true}
              className="h-80 w-80 opacity-80 md:h-80 md:w-80 lg:h-96 lg:w-96"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
