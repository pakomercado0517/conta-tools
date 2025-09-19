"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import NavbarApp from "@/components/NavbarApp";
import FooterComponent from "@/components/FooterComponent";
import BotonGeneradorConceptos from "@/components/BotónGeneradorConceptos";

// Props del componente ConditionalLayout
interface ConditionalLayoutProps {
  children: ReactNode;
}

/**
 * Componente de layout condicional
 * Muestra diferentes layouts según la ruta actual
 * - Página principal ('/'): Solo botón flotante
 * - Otras rutas: Layout completo con navbar, footer y botón flotante
 */
export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Si está en la página principal ('/'), no mostrar navbar ni footer
  const isHomePage: boolean = pathname === '/';
  
  if (isHomePage) {
    return (
      <>
        {/* Solo el botón flotante en la página principal */}
        <BotonGeneradorConceptos />
        <div>{children}</div>
      </>
    );
  }
  
  // Para todas las demás rutas, mostrar el layout completo
  return (
    <>
      <BotonGeneradorConceptos />
      <div>
        <div className="grid min-h-[100dvh] grid-rows-[auto,1fr,auto]">
          <NavbarApp />
          <div className="animate-fade">{children}</div>
          <FooterComponent />
        </div>
      </div>
    </>
  );
}