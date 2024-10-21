import Image from "next/image";
import logo from "@/public/logo_transparent.svg";

export default function Home() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center lg:flex-row lg:justify-evenly">
      <article className="max-w-7xl animate-fade-right">
        <h1 className="mt-5 px-3 text-start text-4xl leading-snug lg:mt-0 lg:max-w-4xl lg:text-7xl lg:leading-normal">
          ContaTools: Desde cotizaciones hasta el control de efectivo, con
          facilidad.
        </h1>
        <h3 className="mt-2 px-3 text-start text-xl font-semibold lg:mt-10 lg:text-3xl">
          Navega por las diferentes herramientas.
        </h3>
      </article>
      <article className="justify-self-center">
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
