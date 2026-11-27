"use client";

import { useState, ChangeEvent, useEffect, useRef } from "react";
import { Label, Textarea } from "flowbite-react";
import { preloadJsPdfUnicodeFonts } from "@/lib/jspdfUnicodeFont";
import {
  generateQuotationPdf,
  quotationPdfFileName,
} from "@/lib/generateQuotationPdf";
import QuotationForm from "@/components/QuotationForm";
import QuotationRecipients from "@/components/QuotationRecipients";
import QuotationServiceDescription from "@/components/QuotationServiceDescription";
import QuotationSummaryLabels from "@/components/QuotationSummaryLabels";
import QuotationProducts from "@/components/QuotationProductsWithAI";
import QuotationClauses from "@/components/QuotationClauses";
import QuotationDataBank from "@/components/QuotationDataBank";
import QuotationPDFButtons from "@/components/QuotationPDFButtons";
import QuotationDisclosure from "@/components/QuotationDisclosure";
import PDFPreviewer from "@/components/PDFPreviewer";
import type {
  QuotationFormData,
  BankData,
  QuotationTaxLine,
  QuotationProduct,
} from "@/types/quotation";

function hasPreviewSource(datos: QuotationFormData): boolean {
  return (
    datos.empresa.trim() !== "" ||
    datos.destinatario.trim() !== "" ||
    datos.productos.length > 0
  );
}

function PreviewPanel({ pdfDataUrl }: { pdfDataUrl: string | null }) {
  if (!pdfDataUrl) {
    return (
      <section className="flex min-h-96 flex-col rounded-xl border border-dashed border-gray-600 bg-gray-900/30 p-6 lg:min-h-[calc(100vh-7rem)]">
        <h2 className="text-lg font-semibold text-gray-200">
          Vista previa del PDF
        </h2>
        <p className="mt-3 text-sm text-gray-400">
          La vista previa aparece aquí
        </p>
      </section>
    );
  }

  return (
    <div className="rounded-xl bg-gray-900/60 p-4 shadow-md">
      <PDFPreviewer pdfDataUrl={pdfDataUrl} />
    </div>
  );
}

/**
 * Layout principal para el generador de cotizaciones.
 * El orden de las secciones sigue el del documento.
 */
export default function QuotationLayout() {
  useEffect(() => {
    preloadJsPdfUnicodeFonts();
  }, []);

  const [datos, setDatos] = useState<QuotationFormData>({
    empresa: "",
    rfc: "",
    telefono: 0,
    email: "",
    fecha: "",
    destinatario: "",
    destinatarioEmpresa: "",
    domicilio: "",
    bank: false,
    logoEmpresa: "",
    lugar: "",
    despedida:
      "Esperando que la presente sea de su conformidad, quedamos a sus órdenes para cualquier información adicional.",
    saludo:
      "En atención a su solicitud, se presenta la siguiente cotización correspondiente a los servicios y/o materiales descritos a continuación:",
    descripcionServicio: "",
    incluirDescripcionServicio: true,
    etiquetaSubtotal: "Subtotal:",
    etiquetaTotal: "Total:",
    textoCantidadLetra: "Importe con letra:",
    productos: [],
    clausulas: [],
    firma: "",
    cargo: "",
  });

  const [dataBank, setDataBank] = useState<BankData>({
    "Nombre del Banco": "",
    "Número de cuenta": 0,
    "Clabe Interbancaria": 0,
  });

  const [firmaImg, setFirmaImg] = useState<string | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const previewRequest = useRef(0);

  useEffect(() => {
    if (!hasPreviewSource(datos)) {
      previewRequest.current += 1;
      setPdfDataUrl(null);
      return;
    }

    const id = ++previewRequest.current;
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const doc = await generateQuotationPdf({ datos, dataBank, firmaImg });
          if (id !== previewRequest.current) return;
          setPdfDataUrl(doc.output("datauristring"));
        } catch (error) {
          console.error(error);
        }
      })();
    }, 800);

    return () => clearTimeout(timer);
  }, [datos, dataBank, firmaImg]);

  const refreshPreview = (): void => {
    const id = ++previewRequest.current;
    void (async () => {
      try {
        const doc = await generateQuotationPdf({ datos, dataBank, firmaImg });
        if (id !== previewRequest.current) return;
        setPdfDataUrl(doc.output("datauristring"));
      } catch (error) {
        console.error(error);
      }
    })();
  };

  const downloadPdf = (): void => {
    void (async () => {
      const doc = await generateQuotationPdf({ datos, dataBank, firmaImg });
      doc.save(quotationPdfFileName(datos));
    })();
  };

  const agregarProducto = (): void => {
    setDatos((prevDatos) => ({
      ...prevDatos,
      productos: [
        ...prevDatos.productos,
        {
          cantidad: "",
          unidad: "",
          descripcion: "",
          precioUnitario: "",
          total: "",
          impuestosLinea: [],
        },
      ],
    }));
  };

  const eliminarProducto = (index: number): void => {
    setDatos((prevDatos) => ({
      ...prevDatos,
      productos: prevDatos.productos.filter((_, i) => i !== index),
    }));
  };

  const agregarLogoEmpresa = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setDatos((prevDatos) => ({
        ...prevDatos,
        logoEmpresa: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  const agregarClausula = (): void => {
    setDatos((prevDatos) => ({
      ...prevDatos,
      clausulas: [...prevDatos.clausulas, ""],
    }));
  };

  const eliminarClausula = (index: number): void => {
    setDatos((prevDatos) => ({
      ...prevDatos,
      clausulas: prevDatos.clausulas.filter((_, i) => i !== index),
    }));
  };

  const handleProductoChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ): void => {
    const { name, value } = e.target;
    const nuevosProductos = [...datos.productos];

    const field = name as keyof QuotationProduct;
    if (field === "impuestosLinea") return;
    nuevosProductos[index] = {
      ...nuevosProductos[index],
      [field]: value,
    };

    setDatos((prevDatos) => ({
      ...prevDatos,
      productos: nuevosProductos,
    }));
  };

  const agregarImpuestoProducto = (productIndex: number): void => {
    setDatos((prev) => {
      const productos = [...prev.productos];
      const p = { ...productos[productIndex] };
      const impuestosLinea = [...(p.impuestosLinea ?? [])];
      impuestosLinea.push({
        etiqueta: "",
        tipo: "impuesto",
        modo: "porcentaje",
        valor: "",
      });
      productos[productIndex] = { ...p, impuestosLinea };
      return { ...prev, productos };
    });
  };

  const eliminarImpuestoProducto = (
    productIndex: number,
    taxIndex: number
  ): void => {
    setDatos((prev) => {
      const productos = [...prev.productos];
      const p = { ...productos[productIndex] };
      p.impuestosLinea = (p.impuestosLinea ?? []).filter(
        (_, i) => i !== taxIndex
      );
      productos[productIndex] = p;
      return { ...prev, productos };
    });
  };

  const handleImpuestoProductoChange = (
    productIndex: number,
    taxIndex: number,
    field: keyof QuotationTaxLine,
    value: string
  ): void => {
    setDatos((prev) => {
      const productos = [...prev.productos];
      const p = { ...productos[productIndex] };
      const impuestosLinea = [...(p.impuestosLinea ?? [])];
      impuestosLinea[taxIndex] = {
        ...impuestosLinea[taxIndex],
        [field]: value,
      };
      productos[productIndex] = { ...p, impuestosLinea };
      return { ...prev, productos };
    });
  };

  const handleClausulaChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ): void => {
    const { value } = e.target;
    const nuevasClausulas = [...datos.clausulas];
    nuevasClausulas[index] = value;

    setDatos((prevDatos) => ({
      ...prevDatos,
      clausulas: nuevasClausulas,
    }));
  };

  const handleDataBankChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setDataBank((prevDataBank) => ({
      ...prevDataBank,
      [name]: value,
    }));
  };

  const showDataBank = (e: ChangeEvent<HTMLInputElement>): void => {
    setDatos((prevDatos) => ({
      ...prevDatos,
      bank: e.target.checked,
    }));
  };

  const toggleIncluirDescripcionServicio = (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    setDatos((prevDatos) => ({
      ...prevDatos,
      incluirDescripcionServicio: e.target.checked,
    }));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setDatos((prevDatos) => ({
      ...prevDatos,
      [name]: value,
    }));
  };

  const handleFirmaChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFirmaImg(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="mx-auto my-5 w-full max-w-[110rem] px-3 lg:px-5">
      <h1 className="mb-6 text-center text-4xl font-extrabold tracking-tight text-gray-700 dark:text-white">
        Generador de Cotizaciones
      </h1>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(34rem,42rem)] lg:items-start lg:gap-8">
        <div className="min-w-0 lg:order-2">
          <QuotationForm
            handleChange={handleChange}
            datos={datos}
            agregarLogoEmpresa={agregarLogoEmpresa}
          />

          <QuotationRecipients datos={datos} handleChange={handleChange} />

          <section className="mt-8 rounded-xl bg-gray-900/60 p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-200">2. Mensaje</h2>
            <p className="mb-5 mt-1 text-sm text-gray-400">
              Saludo y descripción, antes de la tabla.
            </p>
            <QuotationDisclosure title="Editar saludo">
              <Label
                htmlFor="saludo"
                className="mb-1 text-sm font-medium text-gray-300"
              >
                Saludo
              </Label>
              <Textarea
                id="saludo"
                name="saludo"
                rows={4}
                value={datos.saludo}
                onChange={handleChange}
                className="text-white focus:ring-cyan-500"
              />
            </QuotationDisclosure>
            <QuotationServiceDescription
              datos={datos}
              handleChange={handleChange}
              toggleIncluirDescripcion={toggleIncluirDescripcionServicio}
            />
          </section>

          <QuotationProducts
            datos={datos}
            handleProductoChange={handleProductoChange}
            agregarProducto={agregarProducto}
            eliminarProducto={eliminarProducto}
            agregarImpuestoProducto={agregarImpuestoProducto}
            eliminarImpuestoProducto={eliminarImpuestoProducto}
            handleImpuestoProductoChange={handleImpuestoProductoChange}
          />

          <QuotationSummaryLabels
            datos={datos}
            onChangeField={(field, value) =>
              setDatos((prev) => ({ ...prev, [field]: value }))
            }
          />

          <QuotationClauses
            datos={datos}
            handleClausulaChange={handleClausulaChange}
            agregarClausula={agregarClausula}
            eliminarClausula={eliminarClausula}
          />

          <QuotationDataBank
            handleDataBankChange={handleDataBankChange}
            showDataBank={showDataBank}
            datos={datos}
            dataBank={dataBank}
          />

          <div className="my-8">
            <QuotationDisclosure title="Editar despedida">
              <Label
                htmlFor="despedida"
                className="mb-1 text-sm font-medium text-gray-300"
              >
                Despedida
              </Label>
              <Textarea
                id="despedida"
                name="despedida"
                rows={4}
                value={datos.despedida}
                onChange={handleChange}
                className="text-white focus:ring-cyan-500"
              />
            </QuotationDisclosure>
          </div>

          <QuotationPDFButtons
            datos={datos}
            firmaImg={firmaImg}
            onFirmaChange={handleFirmaChange}
            onPreview={refreshPreview}
            onDownload={downloadPdf}
            handleChange={handleChange}
          />
        </div>

        <aside className="mt-8 lg:sticky lg:top-4 lg:order-1 lg:mt-0 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-hidden">
          <PreviewPanel pdfDataUrl={pdfDataUrl} />
        </aside>
      </div>
    </section>
  );
}
