import QuotationLayout from "@/components/QuotationLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generador de cotizaciones",
};

export default function Page() {
  return <QuotationLayout />;
}
