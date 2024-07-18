import { Calistoga, Oswald } from "next/font/google";
import NavbarApp from "@/components/NavbarApp";
import "./globals.css";

const calistoga_regular = Calistoga({ subsets: ["latin"], weight: "400" });
const oswald = Oswald({ subsets: ["latin"], weight: "400" });

export const metadata = {
  title: "ContaTools",
  description: "Herramientas contables del día a día",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={oswald.className}>
        <NavbarApp />
        {children}
      </body>
    </html>
  );
}
