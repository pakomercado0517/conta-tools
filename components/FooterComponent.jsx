"use client";
import { useState, useEffect } from "react";
import { Footer } from "flowbite-react";
import { IoMdBriefcase } from "react-icons/io";
import { GrLicense } from "react-icons/gr";
export default function FooterComponent() {
  const [year, setYear] = useState();

  useEffect(() => {
    const date = new Date();
    setYear(date.getFullYear());
  }, []);

  return (
    <Footer container>
      <Footer.Copyright
        href="https://pako-mercado.vercel.app"
        by="Pako Mercado"
        year={year}
      />
      <Footer.LinkGroup>
        <Footer.Link href="https://pako-mercado.vercel.app">
          <p className="flex items-center">
            <span className="mr-2">
              <IoMdBriefcase />
            </span>
            Portfolio del Desarrollador
          </p>
        </Footer.Link>
        {/* <Footer.Link href="#">Privacy Policy</Footer.Link> */}
        <Footer.Link href="/licensing">
          <p className="flex items-center">
            <span className="mr-2">
              <GrLicense />
            </span>
            Políticas de Licencia
          </p>
        </Footer.Link>
        {/* <Footer.Link href="#">Contact</Footer.Link> */}
      </Footer.LinkGroup>
    </Footer>
  );
}
