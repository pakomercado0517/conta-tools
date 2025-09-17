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
import { useAuth } from './AuthProvider';
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
  FaBars
} from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NavbarApp() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Herramientas principales
  const tools = [
    { href: "/generador_conceptos", label: "Claves SAT", icon: FaSearch },
    { href: "/generador_contratos", label: "Contratos", icon: FaFileContract },
    { href: "/quotation", label: "Cotizaciones", icon: FaFileInvoiceDollar },
    { href: "/paybackInformation", label: "Devoluciones", icon: FaUndo },
    { href: "/sdiCalculator", label: "Cal. SDI", icon: FaCalculator },
    { href: "/getCosts", label: "Gastos", icon: FaReceipt },
    { href: "/counterMoney", label: "Contador", icon: FaCoins },
  ];

  return (
    <nav className="bg-gradient-to-r from-cyan-700 to-teal-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo y Brand */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <Image
              src={logo}
              alt="ContaTools Logo"
              width={40}
              height={40}
              priority={true}
              className="w-10 h-10"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">ContaTools</span>
              <span className="text-xs text-cyan-200 hidden sm:block">Automatiza tu contabilidad</span>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link 
              href="/" 
              className="px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600 rounded-md transition-colors duration-200"
            >
              Inicio
            </Link>
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <div key={tool.href} className="relative group">
                  <Link
                    href={tool.href}
                    className="flex items-center px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600 rounded-md transition-all duration-200 group"
                  >
                    <IconComponent className="w-4 h-4 mr-1.5 group-hover:scale-125 transition-transform duration-200" />
                    <span className="hidden xl:inline">{tool.label}</span>
                  </Link>
                  
                  {/* Tooltip - solo visible cuando no se muestra el texto */}
                  <div className="xl:hidden absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg shadow-xl border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                    {tool.label}
                    {/* Arrow */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            {loading ? (
              <span className="text-sm text-cyan-200">Cargando...</span>
            ) : user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="flex items-center px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600 rounded-md transition-colors duration-200"
                >
                  <FaTachometerAlt className="w-4 h-4 mr-1.5" />
                  Dashboard
                </Link>
                
                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <div className="flex items-center px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600 rounded-md transition-colors duration-200">
                      <FaUser className="w-4 h-4 mr-1.5" />
                      <span className="hidden xl:inline mr-1">Mi Cuenta</span>
                      <IoIosArrowDown className="w-3 h-3" />
                    </div>
                  }
                >
                  <div className="bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700 min-w-48">
                    <DropdownItem>
                      <Link href="/profile/edit" className="flex items-center w-full">
                        <FaUser className="w-4 h-4 mr-2" />
                        Mi Perfil
                      </Link>
                    </DropdownItem>
                    <DropdownItem>
                      <span className="text-xs text-gray-300 block px-1">
                        {user.email}
                      </span>
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem onClick={handleSignOut} className="cursor-pointer">
                      <FaSignOutAlt className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </DropdownItem>
                  </div>
                </Dropdown>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md transition-colors duration-200"
              >
                <FaSignInAlt className="w-4 h-4 mr-1.5" />
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md text-white hover:bg-cyan-600 transition-colors duration-200"
          >
            <FaBars className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-cyan-600">
            <div className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className="px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600 rounded-md transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              
              {tools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600 rounded-md transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tool.label}
                  </Link>
                );
              })}
              
              <div className="border-t border-cyan-600 pt-2 mt-2">
                {loading ? (
                  <span className="px-3 py-2 text-sm text-cyan-200">Cargando...</span>
                ) : user ? (
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600 rounded-md transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaTachometerAlt className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile/edit"
                      className="flex items-center px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600 rounded-md transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaUser className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </Link>
                    <div className="px-3 py-1">
                      <span className="text-xs text-cyan-200">{user.email}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600 rounded-md transition-colors duration-200"
                    >
                      <FaSignOutAlt className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600 rounded-md transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaSignInAlt className="w-4 h-4 mr-2" />
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
