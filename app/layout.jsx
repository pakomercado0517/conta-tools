import { Oswald } from "next/font/google";
import NavbarApp from "@/components/NavbarApp";
import "./globals.css";
import FooterComponent from "@/components/FooterComponent";
import BotonGeneradorConceptos from "@/components/BotónGeneradorConceptos";

const oswald = Oswald({ subsets: ["latin"], weight: "400" });

export const metadata = {
  title: "ContaTools",
  description: "Herramientas contables del día a día",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${oswald.className} dark:blackdrop-blur-md relative bg-white/80 shadow-md backdrop-blur-md dark:bg-gray-900/80`}
      >
        {/* Aquí estará tu botón flotante */}
        <BotonGeneradorConceptos />
        <div>
          <div className="grid min-h-[100dvh] grid-rows-[auto,1fr,auto]">
            <NavbarApp />
            <div className="animate-fade">{children}</div>
            <FooterComponent />
          </div>
        </div>
      </body>
    </html>
  );
}
