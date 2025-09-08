"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar, Dropdown, DropdownItem } from "flowbite-react";
import logo from "@/public/logo_white.svg";
import { IoIosArrowDown } from "react-icons/io";

export default function NavbarApp() {
  return (
    <Navbar
      className="bg-gradient-to-r from-cyan-700 to-teal-600 text-white"
      rounded
      fluid
    >
      {/* IZQUIERDA: Logo + nombre */}
      <Navbar.Brand as={Link} href="/">
        <Image
          src={logo}
          alt="image from company"
          width={80}
          height={80}
          priority={true}
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold">
          ContaTools
        </span>
      </Navbar.Brand>

      {/* CENTRO: Subtítulo */}
      <div className="hidden flex-1 justify-center md:flex">
        <span className="text-lg italic text-white">
          Automatiza tu contabilidad sin complicaciones
        </span>
      </div>

      {/* DERECHA: Dropdown herramientas */}
      <Dropdown
        label="Herramientas"
        className="ml-auto"
        renderTrigger={() => (
          <button className="flex items-center rounded bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700">
            Herramientas{" "}
            <span className="ml-2">
              <IoIosArrowDown />
            </span>
          </button>
        )}
      >
        <div className="rounded-md border border-gray-700 bg-gray-800 text-white shadow-lg">
          <DropdownItem>
            <Navbar.Link className="text-white" href="/">
              Inicio
            </Navbar.Link>
          </DropdownItem>
          <DropdownItem>
            <Navbar.Link className="text-white" href="/generador_conceptos">
              Buscador Claves SAT
            </Navbar.Link>
          </DropdownItem>
          <DropdownItem>
            <Navbar.Link className="text-white" href="/generador_contratos">
              Gen. Contratos
            </Navbar.Link>
          </DropdownItem>
          <DropdownItem>
            <Navbar.Link className="text-white" href="/quotation">
              Gen. Cotizaciones
            </Navbar.Link>
          </DropdownItem>
          <DropdownItem>
            <Navbar.Link className="text-white" href="/paybackInformation">
              Reg. Devolución
            </Navbar.Link>
          </DropdownItem>
          <DropdownItem>
            <Navbar.Link className="text-white" href="/sdiCalculator">
              Cal. SDI
            </Navbar.Link>
          </DropdownItem>
          <DropdownItem>
            <Navbar.Link className="text-white" href="/getCosts">
              Reg. Gastos
            </Navbar.Link>
          </DropdownItem>
          <DropdownItem>
            <Navbar.Link className="text-white" href="/counterMoney">
              Con. Dinero
            </Navbar.Link>
          </DropdownItem>
        </div>
      </Dropdown>
    </Navbar>
  );
}
