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
        <NavbarApp />
        <div className="animate-fade">{children}</div>
        <FooterComponent />
      </body>
    </html>
  );
}
