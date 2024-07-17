import Image from "next/image";
import logo from "@/public/contaTools-logo.png";

export default function Home() {
  return (
    <section>
      <article className="animate-fade-right max-w-7xl">
        <h1 className="mt-5 text-start text-6xl lg:text-8xl">
          Herramientas que ayudan a solucionar el día a día en la
          contabilidad...
        </h1>
        <h3 className="mt-8 text-xl lg:text-3xl">
          Navega por las diferentes herramientas.
        </h3>
      </article>
      <article className="animate-fade-left flex justify-end">
        <Image
          src={logo}
          width={500}
          height={500}
          alt="logo image from company"
        />
      </article>
    </section>
  );
}
