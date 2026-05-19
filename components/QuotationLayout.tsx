"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { preloadJsPdfUnicodeFonts } from "@/lib/jspdfUnicodeFont";
import QuotationForm from "@/components/QuotationForm";
import QuotationRecipients from "@/components/QuotationRecipients";
import QuotationServiceDescription from "@/components/QuotationServiceDescription";
import QuotationSummaryLabels from "@/components/QuotationSummaryLabels";
// import QuotationProducts from "@/components/QuotationProducts";
import QuotationProducts from "@/components/QuotationProductsWithAI";
import QuotationClauses from "@/components/QuotationClauses";
import QuotationDataBank from "@/components/QuotationDataBank";
import QuotationPDFButtons from "@/components/QuotationPDFButtons";
import PDFPreviewer from "@/components/PDFPreviewer";
import type {
  QuotationFormData,
  BankData,
  QuotationTaxLine,
  QuotationProduct,
} from "@/types/quotation";

/**
 * Layout principal para el generador de cotizaciones
 * Maneja todo el estado y la lógica de negocio para la creación de cotizaciones
 */
export default function QuotationLayout() {
  useEffect(() => {
    preloadJsPdfUnicodeFonts();
  }, []);

  // Estado principal de los datos de cotización
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
    incluirDescripcionServicio: false,
    etiquetaSubtotal: "Subtotal:",
    etiquetaTotal: "Total:",
    textoCantidadLetra: "Importe con letra:",
    productos: [],
    clausulas: [],
    firma: "",
    cargo: "",
  });

  // Estado para datos bancarios
  const [dataBank, setDataBank] = useState<BankData>({
    "Nombre del Banco": "",
    "Número de cuenta": 0,
    "Clabe Interbancaria": 0,
  });

  // Estado para PDF preview
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

  /**
   * Agregar un nuevo producto a la lista
   */
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

  /**
   * Eliminar un producto por índice
   */
  const eliminarProducto = (index: number): void => {
    setDatos((prevDatos) => ({
      ...prevDatos,
      productos: prevDatos.productos.filter((_, i) => i !== index),
    }));
  };

  /**
   * Manejar carga de logo de empresa
   */
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

  /**
   * Agregar nueva cláusula
   */
  const agregarClausula = (): void => {
    setDatos((prevDatos) => ({
      ...prevDatos,
      clausulas: [...prevDatos.clausulas, ""],
    }));
  };

  /**
   * Eliminar cláusula por índice
   */
  const eliminarClausula = (index: number): void => {
    setDatos((prevDatos) => ({
      ...prevDatos,
      clausulas: prevDatos.clausulas.filter((_, i) => i !== index),
    }));
  };

  /**
   * Manejar cambios en productos específicos
   */
  const handleProductoChange = (
    e: ChangeEvent<HTMLInputElement>,
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

  /**
   * Manejar cambios en cláusulas específicas
   */
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

  /**
   * Manejar cambios en datos bancarios
   */
  const handleDataBankChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setDataBank((prevDataBank) => ({
      ...prevDataBank,
      [name]: value,
    }));
  };

  /**
   * Alternar mostrar/ocultar formulario de datos bancarios
   */
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

  /**
   * Manejar cambios generales en el formulario
   */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setDatos((prevDatos) => ({
      ...prevDatos,
      [name]: value,
    }));
  };

  return (
    <section className="mx-auto my-5 max-w-6xl">
      {/* Quotation form */}
      <QuotationForm
        handleChange={handleChange}
        datos={datos}
        agregarLogoEmpresa={agregarLogoEmpresa}
      />

      {/* Destinatario Info */}
      <QuotationRecipients handleChange={handleChange} />

      <QuotationServiceDescription
        datos={datos}
        handleChange={handleChange}
        toggleIncluirDescripcion={toggleIncluirDescripcionServicio}
      />

      <QuotationSummaryLabels
        datos={datos}
        onChangeField={(field, value) =>
          setDatos((prev) => ({ ...prev, [field]: value }))
        }
      />

      {/* Productos Info */}
      <QuotationProducts
        datos={datos}
        handleProductoChange={handleProductoChange}
        agregarProducto={agregarProducto}
        eliminarProducto={eliminarProducto}
        agregarImpuestoProducto={agregarImpuestoProducto}
        eliminarImpuestoProducto={eliminarImpuestoProducto}
        handleImpuestoProductoChange={handleImpuestoProductoChange}
      />

      {/* Cláusulas Info */}
      <QuotationClauses
        datos={datos}
        handleClausulaChange={handleClausulaChange}
        agregarClausula={agregarClausula}
        eliminarClausula={eliminarClausula}
      />

      {/* Datos Bancarios */}
      <QuotationDataBank
        handleDataBankChange={handleDataBankChange}
        showDataBank={showDataBank}
        datos={datos}
      />

      {/* Botones para cargar firma, previsualizar y crear PDF */}
      <QuotationPDFButtons
        datos={datos}
        setPdfDataUrl={setPdfDataUrl}
        dataBank={dataBank}
      />

      {/* Previsualizar PDF */}
      {pdfDataUrl && <PDFPreviewer pdfDataUrl={pdfDataUrl} />}
    </section>
  );
}
