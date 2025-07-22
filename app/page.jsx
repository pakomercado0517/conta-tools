import Image from "next/image";
import logo from "@/public/logo_transparent.svg";
import { Button } from "flowbite-react";
import Link from "next/link";

export default function Home() {
  return (
    <section className="mt-4 flex flex-col justify-center gap-12 px-6 md:flex-row md:px-10 lg:mt-8 lg:w-screen lg:items-center lg:justify-center">
      <div className="md:w-1/2">
        <h1 className="mb-6 text-4xl font-extrabold leading-tight text-gray-500 md:text-5xl dark:text-gray-300">
          ContaTools: Desde cotizaciones hasta el control de efectivo, con
          facilidad.
        </h1>
        <p className="mb-6 text-lg text-gray-500 dark:text-gray-300">
          Navega por las diferentes herramientas.
        </p>
        <Link href="/generador_conceptos">
          <Button className="bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 text-white hover:bg-gradient-to-br focus:ring-teal-300 dark:text-gray-200 dark:focus:ring-teal-800">
            Empezar ahora
          </Button>
        </Link>
      </div>
      <div className="flex justify-center md:w-1/2">
        <Image
          src={logo}
          alt="Logo ContaTools"
          width={896}
          height={896}
          priority={true}
        />
      </div>
    </section>
  );
}
