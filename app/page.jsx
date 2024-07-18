import Image from "next/image";
import logo from "@/public/contaTools-logo.png";

export default function Home() {
  return (
    <section>
      <article className="max-w-7xl animate-fade-right">
        <h1 className="mt-5 text-start text-6xl lg:text-8xl">
          Herramientas que ayudan a solucionar el día a día en la
          contabilidad...
        </h1>
        <h3 className="mt-8 text-xl lg:text-3xl">
          Navega por las diferentes herramientas.
        </h3>
      </article>
      <article className="flex animate-fade-left justify-end">
        <Image
          src={logo}
          width={500}
          height={500}
          alt="logo image from company"
          priority={true}
        />
      </article>
    </section>
  );
}
