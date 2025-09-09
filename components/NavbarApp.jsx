"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Navbar,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  Button,
} from "flowbite-react";
import { useSession, signOut } from "next-auth/react";
import logo from "@/public/logo_white.svg";
import { IoIosArrowDown } from "react-icons/io";
import { FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa";

export default function NavbarApp() {
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

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

          {/* Divider */}
          <DropdownDivider />

          {/* Autenticación */}
          {session ? (
            <>
              <DropdownItem>
                <Navbar.Link href="/dashboard" className="text-white">
                  Dashboard
                </Navbar.Link>
              </DropdownItem>
              <DropdownItem>
                <Navbar.Link
                  href="/profile/edit"
                  className="flex items-center text-white hover:text-gray-300"
                >
                  Mi Perfil
                </Navbar.Link>
              </DropdownItem>
              <DropdownItem onClick={handleSignOut} className="cursor-pointer">
                <FaSignOutAlt className="mr-2" />
                Cerrar Sesión
              </DropdownItem>
            </>
          ) : (
            <DropdownItem>
              <Link
                href="/auth/login"
                className="flex items-center text-white hover:text-gray-300"
              >
                <FaSignInAlt className="mr-2" />
                Iniciar Sesión
              </Link>
            </DropdownItem>
          )}
        </div>
      </Dropdown>
    </Navbar>
  );
}
