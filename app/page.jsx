import Image from "next/image";
import logo from "@/public/logo_transparent.svg";

export default function Home() {
  return (
    <section className="min-h-xl flex max-h-full flex-col items-end justify-center lg:flex-row lg:justify-evenly">
      <article className="max-w-7xl animate-fade-right lg:mt-24">
        <h1 className="mt-5 text-pretty px-3 text-start text-4xl leading-snug md:ml-8 lg:mt-0 lg:max-w-4xl lg:text-7xl lg:leading-normal">
          ContaTools: Desde cotizaciones hasta el control de efectivo, con
          facilidad.
        </h1>
        <h3 className="mt-2 px-3 text-start text-xl font-semibold md:ml-9 lg:mt-10 lg:text-3xl">
          Navega por las diferentes herramientas.
        </h3>
      </article>
      <article className="max-w-md lg:mt-8">
        <Image
          src={logo}
          width={896}
          height={896}
          alt="logo image from company"
          priority={true}
        />
      </article>
    </section>
  );
}
