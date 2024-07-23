"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "flowbite-react";
import logo from "@/public/contaTools-logo.png";

export default function NavbarApp() {
  return (
    <Navbar className="dark:text-white" rounded fluid>
      <Navbar.Brand as={Link} href="/">
        <Image
          src={logo}
          alt="image from company"
          width={80}
          height={80}
          priority={true}
        />
        <span className="self-center whitespace-nowrap font-semibold">
          ContaTools
        </span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link className="dark:text-white" href="/">
          Inicio
        </Navbar.Link>
        <Navbar.Link className="dark:text-white" href="/quotation">
          Gen. Cotizaciones
        </Navbar.Link>
        <Navbar.Link className="dark:text-white" href="/paybackInformation">
          Reg. Devolución
        </Navbar.Link>
        <Navbar.Link className="dark:text-white" href="/getCosts">
          Reg. Gastos
        </Navbar.Link>
        <Navbar.Link className="dark:text-white" href="/counterMoney">
          Cont. Dinero
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
