import Image from "next/image";
import logo from "@/public/logo_transparent.svg";

export default function Home() {
  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-4">
      <article className="col-span-2 max-w-7xl animate-fade-right">
        <h1 className="mt-5 px-3 text-start text-6xl leading-snug lg:text-8xl lg:leading-normal">
          Herramientas que ayudan a solucionar el día a día en la
          contabilidad...
        </h1>
        <h3 className="mt-2 px-3 text-xl lg:text-3xl">
          Navega por las diferentes herramientas.
        </h3>
      </article>
      <article className="col-span-2 justify-self-center lg:col-span-2 lg:place-self-start lg:justify-self-end">
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
