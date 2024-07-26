"use client";

import { useState } from "react";
import { Button, FileInput, Label } from "flowbite-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useFormatNumber from "@/hooks/useFormatNumber";

export default function QuotationPDFButtons({
  datos,
  setPdfDataUrl,
  dataBank,
}) {
  const [firmaImg, setFirmaImg] = useState(null);

  const formatNumber = useFormatNumber();

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

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const dia = date.getUTCDate();
    const mes = meses[date.getUTCMonth()];
    const año = date.getUTCFullYear();
    return `Tuxpan de Rodríguez Cano, Veracruz. A ${dia} de ${mes} del ${año}.`;
  };

  const handleFirmaChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => setFirmaImg(reader.result);

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const generarPDF = (btnFunc) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const contacto = `Tel: ${datos.telefono} | Email: ${datos.email}`;

    // Encabezado centrado
    doc.setFontSize(16);
    doc.setTextColor(96, 96, 96); // Gris oscuro
    doc.text(datos.empresa, pageWidth / 2, 10, { align: "center" });
    doc.setFontSize(10);
    doc.text(datos.rfc.toUpperCase(), pageWidth / 2, 15, { align: "center" });
    doc.text(datos.domicilio, pageWidth / 2, 20, { align: "center" });
    doc.text(contacto, pageWidth / 2, 25, { align: "center" });

    // Fecha alineada a la derecha
    const fechaFormateada = formatearFecha(datos.fecha);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); //negro
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
      body: datos.productos.map((producto) => [
        producto.cantidad,
        producto.unidad,
        producto.descripcion,
        formatNumber.format(producto.precioUnitario),
        formatNumber.format(producto.precioUnitario * producto.cantidad),
      ]),
      headStyles: { fillColor: [54, 69, 79] },
    });

    let finalY = doc.previousAutoTable.finalY + 10; // Obtener la posición final de la tabla

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

    //Datos bancarios(si se requiere...)
    if (datos.bank) {
      if (finalY > 270) {
        doc.addPage();
        finalY = 20;
      }
      doc.text("Datos Bancarios:", 12, finalY + 15);
      finalY += 10;

      Object.entries(dataBank).forEach(([key, value]) => {
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
    //agregar imagen de la firma
    if (firmaImg) {
      doc.addImage(firmaImg, "PNG", 10, finalY + 10, 15, 14); //ajustamos las coordenadas y el tamaño para que quede acorde entre el espacio destinado
    }
    doc.text(datos.firma, 12, finalY + 30);
    doc.setFontSize(10);
    doc.text(datos.cargo, 12, finalY + 35);
    //previsualizar el PDF
    if (btnFunc === "preview") {
      const prev = doc.output("datauristring");
      setPdfDataUrl(prev);
    } else {
      doc.save(`Cotización ${datos.destinatarioEmpresa}.pdf`);
    }
  };

  return (
    <>
      <section className="my-8 border-t-2 border-gray-500">
        <h2 className="my-4 text-center text-xl font-semibold">
          Cargar firma digital
        </h2>
        <div>
          <Label className="text-white">Firma</Label>
          <FileInput
            id="firmaImg"
            name="firmaImg"
            onChange={handleFirmaChange}
            accept="image/*"
            color="dark"
            helperText="Si tienes la firma en imagen PNG, aqui la puedes cargar."
          />
        </div>
      </section>
      <section className="grid grid-cols-2 gap-4">
        <Button size="xl" onClick={() => generarPDF("preview")}>
          Previsualizar PDF
        </Button>

        <Button color="dark" size="xl" onClick={generarPDF}>
          Generar PDF
        </Button>
      </section>
    </>
  );
}
