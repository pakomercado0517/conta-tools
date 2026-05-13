"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "flowbite-react";
import { useAuth } from "./AuthProvider";
import logo from "@/public/logo_white.svg";
import { IoIosArrowDown } from "react-icons/io";
import {
  FaSignInAlt,
  FaSignOutAlt,
  FaUser,
  FaSearch,
  FaFileContract,
  FaFileInvoiceDollar,
  FaUndo,
  FaCalculator,
  FaReceipt,
  FaCoins,
  FaTachometerAlt,
  FaBars,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { IconType } from "react-icons";

// Interfaz para definir las herramientas de navegación
interface NavigationTool {
  href: string;
  label: string;
  icon: IconType;
}

// Props del componente NavbarApp (ninguna por ahora)
interface NavbarAppProps {}

/**
 * Componente de navegación principal de la aplicación
 * Incluye logo, herramientas, autenticación y menú móvil
 */
export default function NavbarApp({}: NavbarAppProps) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  /**
   * Maneja el cierre de sesión del usuario
   * La redirección es manejada automáticamente por AuthProvider
   */
  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut();
      // La redirección es manejada por el AuthProvider
    } catch (error) {
      console.error("Error signing out:", error);
      // En caso de error, forzar redirección manual
      router.push("/auth/login");
    }
  };

  /**
   * Alterna el estado del menú móvil
   */
  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * Cierra el menú móvil
   */
  const closeMobileMenu = (): void => {
    setIsMobileMenuOpen(false);
  };

  // Herramientas principales de la aplicación
  const tools: NavigationTool[] = [
    { href: "/generador_conceptos", label: "Claves SAT", icon: FaSearch },
    { href: "/generador_contratos", label: "Contratos", icon: FaFileContract },
    { href: "/quotation", label: "Cotizaciones", icon: FaFileInvoiceDollar },
    { href: "/paybackInformation", label: "Devoluciones", icon: FaUndo },
    { href: "/sdiCalculator", label: "Cal. SDI", icon: FaCalculator },
    { href: "/getCosts", label: "Gastos", icon: FaReceipt },
    { href: "/counterMoney", label: "Contador", icon: FaCoins },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-cyan-700 to-teal-600 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo y Brand */}
          <Link
            href="/"
            className="flex items-center space-x-3 transition-opacity hover:opacity-90"
          >
            <Image
              src={logo}
              alt="ContaTools Logo"
              width={40}
              height={40}
              priority={true}
              className="h-10 w-10"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">
                ContaTools
              </span>
              <span className="hidden text-xs text-cyan-200 sm:block">
                Automatiza tu contabilidad
              </span>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden items-center space-x-1 lg:flex">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-600"
            >
              Inicio
            </Link>
            {tools.map((tool: NavigationTool) => {
              const IconComponent = tool.icon;
              return (
                <div key={tool.href} className="group relative">
                  <Link
                    href={tool.href}
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-cyan-600"
                  >
                    <IconComponent className="mr-1.5 h-4 w-4 transition-transform duration-200 group-hover:scale-125" />
                    <span className="hidden xl:inline">{tool.label}</span>
                  </Link>

                  {/* Tooltip - solo visible cuando no se muestra el texto */}
                  <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 transform whitespace-nowrap rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xl transition-opacity duration-300 group-hover:opacity-100 xl:hidden">
                    {tool.label}
                    {/* Arrow */}
                    <div className="absolute bottom-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-b-4 border-l-4 border-r-4 border-transparent border-b-gray-800"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden items-center space-x-4 lg:flex">
            {loading ? (
              <span className="text-sm text-cyan-200">Cargando...</span>
            ) : user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-600"
                >
                  <FaTachometerAlt className="mr-1.5 h-4 w-4" />
                  Dashboard
                </Link>

                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <div className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-600">
                      <FaUser className="mr-1.5 h-4 w-4" />
                      <span className="mr-1 hidden xl:inline">Mi Cuenta</span>
                      <IoIosArrowDown className="h-3 w-3" />
                    </div>
                  }
                >
                  <div className="min-w-48 rounded-lg border border-gray-700 bg-gray-800 text-white shadow-lg">
                    <DropdownItem>
                      <Link
                        href="/profile/edit"
                        className="flex w-full items-center"
                      >
                        <FaUser className="mr-2 h-4 w-4" />
                        Mi Perfil
                      </Link>
                    </DropdownItem>
                    <DropdownItem>
                      <span className="block px-1 text-xs text-gray-300">
                        {user.email}
                      </span>
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem
                      onClick={handleSignOut}
                      className="cursor-pointer"
                    >
                      <FaSignOutAlt className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownItem>
                  </div>
                </Dropdown>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-700"
              >
                <FaSignInAlt className="mr-1.5 h-4 w-4" />
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="rounded-md p-2 text-white transition-colors duration-200 hover:bg-cyan-600 lg:hidden"
            aria-label="Abrir menú de navegación"
            type="button"
          >
            <FaBars className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-cyan-600 py-4 lg:hidden">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-600"
                onClick={closeMobileMenu}
              >
                Inicio
              </Link>

              {tools.map((tool: NavigationTool) => {
                const IconComponent = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-600"
                    onClick={closeMobileMenu}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {tool.label}
                  </Link>
                );
              })}

              <div className="mt-2 border-t border-cyan-600 pt-2">
                {loading ? (
                  <span className="px-3 py-2 text-sm text-cyan-200">
                    Cargando...
                  </span>
                ) : user ? (
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-600"
                      onClick={closeMobileMenu}
                    >
                      <FaTachometerAlt className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile/edit"
                      className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-600"
                      onClick={closeMobileMenu}
                    >
                      <FaUser className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Link>
                    <div className="px-3 py-1">
                      <span className="text-xs text-cyan-200">
                        {user.email}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        closeMobileMenu();
                      }}
                      className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-600"
                      type="button"
                    >
                      <FaSignOutAlt className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-cyan-600"
                    onClick={closeMobileMenu}
                  >
                    <FaSignInAlt className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
