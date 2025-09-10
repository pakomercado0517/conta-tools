"use client";

import { usePathname } from "next/navigation";
import NavbarApp from "@/components/NavbarApp";
import FooterComponent from "@/components/FooterComponent";
import BotonGeneradorConceptos from "@/components/BotónGeneradorConceptos";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  
  // Si está en la página principal ('/'), no mostrar navbar ni footer
  const isHomePage = pathname === '/';
  
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
