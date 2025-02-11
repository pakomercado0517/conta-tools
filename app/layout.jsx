import { Oswald } from "next/font/google";
import NavbarApp from "@/components/NavbarApp";
import "./globals.css";
import FooterComponent from "@/components/FooterComponent";

const oswald = Oswald({ subsets: ["latin"], weight: "400" });

export const metadata = {
  title: "ContaTools",
  description: "Herramientas contables del día a día",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={oswald.className}>
        <div className="grid min-h-[100dvh] grid-rows-[auto,1fr,auto]">
          <NavbarApp />
          <div className="animate-fade">{children}</div>
          <FooterComponent />
        </div>
      </body>
    </html>
  );
}
