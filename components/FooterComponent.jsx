"use client";
import { useState, useEffect } from "react";
import { Footer } from "flowbite-react";
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
        {/* <Footer.Link href="#">About</Footer.Link>
        <Footer.Link href="#">Privacy Policy</Footer.Link>
        <Footer.Link href="#">Licensing</Footer.Link>
        <Footer.Link href="#">Contact</Footer.Link> */}
      </Footer.LinkGroup>
    </Footer>
  );
}
