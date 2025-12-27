"use client";

import { useState, ChangeEvent } from "react";
import { Button, FileInput, Label } from "flowbite-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useFormatNumber from "@/hooks/useFormatNumber";
import type { QuotationPDFButtonsProps, BankData } from "@/types/quotation";

/**
 * Componente para generar y previsualizar PDFs de cotización
 * Incluye funcionalidad para cargar firma digital y generar PDF
 *
 * @param datos - Datos del formulario de cotización
 * @param setPdfDataUrl - Función para establecer URL del PDF para preview
 * @param dataBank - Datos bancarios opcionales
 */
export default function QuotationPDFButtons({
  datos,
  setPdfDataUrl,
  dataBank,
}: QuotationPDFButtonsProps) {
  const [firmaImg, setFirmaImg] = useState<string | null>(null);

  const formatNumber = useFormatNumber();

  // Meses en español para formato de fecha
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  /**
   * Formatear fecha para mostrar en el documento
   */
  const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha);
    const dia = date.getUTCDate();
    const mes = meses[date.getUTCMonth()];
    const año = date.getUTCFullYear();
    return `${datos.lugar}. A ${dia} de ${mes} del ${año}.`;
  };

  /**
   * Formatear fecha para nombre de archivo
   */
  const formatearFechaParaArchivo = (fecha: string): string => {
    const date = new Date(fecha);
    const dia = date.getUTCDate().toString().padStart(2, "0");
    const mes = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const año = date.getUTCFullYear();
    return `${dia}-${mes}-${año}`;
  };

  /**
   * Obtener primeras tres palabras del concepto para nombre de archivo
   */
  const obtenerPrimerasTresPalabrasConcepto = (): string => {
    if (
      datos.productos &&
      datos.productos.length > 0 &&
      datos.productos[0].descripcion
    ) {
      return datos.productos[0].descripcion
        .trim()
        .split(/\s+/)
        .slice(0, 3)
        .join(" ");
    }
    return "Cotización";
  };

  /**
   * Manejar carga de imagen de firma
   */
  const handleFirmaChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setFirmaImg(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  /**
   * Generar PDF con jsPDF
   * @param btnFunc - 'preview' para previsualizar, undefined para descargar
   */
  const generarPDF = (btnFunc?: string): void => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const contacto = `Tel: ${datos.telefono} | Email: ${datos.email}`;
    const logoWidth = 30;
    const logoHeight = 30;

    // Logo del encabezado
    if (datos.logoEmpresa) {
      doc.addImage(datos.logoEmpresa, "PNG", 10, 2, logoWidth, logoHeight);
    }

    // Encabezado centrado
    doc.setFontSize(16);
    doc.setTextColor(96, 96, 96); // Gris oscuro
    doc.text(datos.empresa, pageWidth / 2, 10, { align: "center" });
    doc.setFontSize(10);
    doc.text(String(datos.rfc).toUpperCase(), pageWidth / 2, 15, {
      align: "center",
    });
    doc.text(datos.domicilio, pageWidth / 2, 20, { align: "center" });
    doc.text(contacto, pageWidth / 2, 25, { align: "center" });

    // Fecha alineada a la derecha
    const fechaFormateada = formatearFecha(datos.fecha);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Negro
    doc.text(fechaFormateada, pageWidth - 20, 50, { align: "right" });

    // A quién va dirigido
    doc.setFontSize(12);
    doc.text(`${datos.destinatarioEmpresa}.`, 12, 65); // Empresa del destinatario
    doc.text(`${datos.destinatario}.`, 12, 70); // Nombre del destinatario

    // Saludo antes de presentar los productos a cotizar
    doc.setFontSize(12);
    doc.text(`${datos.saludo}`, 20, 80);

    // Tabla de productos
    doc.autoTable({
      startY: 90,
      head: [["Cantidad", "Unidad", "Descripción", "Precio Unitario", "Total"]],
      body: [
        ...datos.productos.map((producto) => [
          String(producto.cantidad),
          producto.unidad,
          producto.descripcion,
          formatNumber.format(Number(producto.precioUnitario)),
          formatNumber.format(
            Number(producto.precioUnitario) * Number(producto.cantidad)
          ),
        ]),
        // Espacio de dos filas vacías
        [
          {
            content: "",
            colSpan: 5,
            styles: { minCellHeight: 10, halign: "center" },
          },
        ],
        [
          {
            content: "",
            colSpan: 5,
            styles: { minCellHeight: 10, halign: "center" },
          },
        ],
        // Fila del Total
        [
          {
            content: "Total:",
            colSpan: 4,
            styles: { fontStyle: "bold", halign: "right" },
          },
          formatNumber.format(
            datos.productos.reduce(
              (total, producto) =>
                total +
                Number(producto.precioUnitario) * Number(producto.cantidad),
              0
            )
          ),
        ],
      ],
      headStyles: { fillColor: [54, 69, 79] },
      styles: { fontSize: 10 },
    });

    let finalY = (doc as any).previousAutoTable.finalY + 10; // Obtener la posición final de la tabla

    // Cláusulas
    if (finalY > 270) {
      doc.addPage();
      finalY = 20;
    }
    doc.text("Cláusulas:", 12, finalY + 15);
    finalY += 10;

    datos.clausulas.forEach((clausula) => {
      if (finalY > 270) {
        doc.addPage();
        finalY = 20;
      }
      doc.text(`* ${clausula}`, 15, finalY + 10);
      finalY += 5;
    });

    // Datos bancarios (si se requiere...)
    if (datos.bank) {
      if (finalY > 270) {
        doc.addPage();
        finalY = 20;
      }
      doc.text("Datos Bancarios:", 12, finalY + 15);
      finalY += 10;

      Object.entries(dataBank as BankData).forEach(([key, value]) => {
        if (finalY > 270) {
          doc.addPage();
          finalY = 20;
        }
        if (key !== "0") {
          doc.text(`-${key}:  ${value}`, 15, finalY + 10);
          finalY += 5;
        }
      });
    }

    // Despedida con salto de línea automático
    doc.setFontSize(12);
    const despedidaLines = doc.splitTextToSize(datos.despedida, pageWidth - 30);
    doc.text(despedidaLines, 15, finalY + 15);

    finalY += despedidaLines.length * 10 + 15; // Ajusta la posición final después de la despedida

    // Firma
    if (finalY + 20 > 270) {
      doc.addPage();
      finalY = 20;
    }
    doc.setFontSize(12);
    doc.setTextColor(96, 96, 96); // Gris oscuro
    doc.text("Atentamente", 12, finalY + 10);

    // Agregar imagen de la firma
    if (firmaImg) {
      doc.addImage(firmaImg, "PNG", 10, finalY + 10, 15, 14);
    }

    doc.text(datos.firma, 12, finalY + 30);
    doc.setFontSize(10);
    doc.text(datos.cargo, 12, finalY + 35);

    // Previsualizar el PDF
    if (btnFunc === "preview") {
      const prev = doc.output("datauristring");
      setPdfDataUrl(prev);
    } else {
      const fechaFormateada = formatearFechaParaArchivo(datos.fecha);
      const primerasTresPalabras = obtenerPrimerasTresPalabrasConcepto();
      const nombreArchivo = `${datos.destinatarioEmpresa} ${fechaFormateada} ${primerasTresPalabras}.pdf`;

      doc.save(nombreArchivo);
    }
  };

  return (
    <>
      <section className="my-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
        <h2 className="my-4 text-center text-xl font-semibold text-gray-300">
          Cargar firma digital
        </h2>
        <div>
          <Label
            htmlFor="firmaImg"
            className="mb-1 text-sm font-medium text-gray-300"
          >
            Firma
          </Label>
          <FileInput
            id="firmaImg"
            name="firmaImg"
            onChange={handleFirmaChange}
            accept="image/*"
            color="dark"
            helperText="Si tienes la firma en imagen PNG, aquí la puedes cargar."
            className="text-white focus:ring-cyan-500"
          />
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-4 px-3">
        <Button
          color="cyan"
          size="xl"
          onClick={() => generarPDF()}
          type="button"
        >
          Generar PDF
        </Button>

        <Button
          color="gray"
          size="xl"
          outline
          onClick={() => generarPDF("preview")}
          type="button"
        >
          Previsualizar PDF
        </Button>
      </section>
    </>
  );
}
