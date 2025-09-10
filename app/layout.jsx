import { Oswald } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ConditionalLayout from "@/components/ConditionalLayout";

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
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
