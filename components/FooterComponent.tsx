"use client";

import { useState, useEffect } from "react";
import { Footer } from "flowbite-react";
import { IoMdBriefcase } from "react-icons/io";
import { GrLicense } from "react-icons/gr";

// Props del componente FooterComponent (ninguna por ahora)
interface FooterComponentProps {}

/**
 * Componente Footer de la aplicación
 * Muestra información de copyright, enlaces del desarrollador y políticas
 */
export default function FooterComponent({}: FooterComponentProps) {
  const [year, setYear] = useState<number | undefined>(undefined);

  useEffect(() => {
    const date = new Date();
    setYear(date.getFullYear());
  }, []);

  return (
    <Footer
      container
      className="dark:to-zinc-00 dark:bg-gradient-to-r dark:from-zinc-900"
    >
      <Footer.Copyright
        href="https://tresa-design.vercel.app"
        by="TresA Design"
        year={year}
      />
      <Footer.LinkGroup>
        <Footer.Link href="https://tresa-design.vercel.app">
          <p className="flex items-center">
            <span className="mr-2">
              <IoMdBriefcase />
            </span>
            TresA Design
          </p>
        </Footer.Link>
        {/* <Footer.Link href="#" >Privacy Policy</Footer.Link> */}
        <Footer.Link href="/licensing">
          <p className="flex items-center">
            <span className="mr-2">
              <GrLicense />
            </span>
            Políticas de Licencia
          </p>
        </Footer.Link>
        {/* <Footer.Link href="#" >Contact</Footer.Link> */}
      </Footer.LinkGroup>
    </Footer>
  );
}
