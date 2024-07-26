"use client";
import { useState } from "react";
import QuotationForm from "@/components/QuotationForm";
import QuotationRecipients from "@/components/QuotationRecipients";
import QuotationProducts from "@/components/QuotationProducts";
import QuotationClauses from "@/components/QuotationClauses";
import QuotationDataBank from "@/components/QuotationDataBank";
import QuotationPDFButtons from "@/components/QuotationPDFButtons";
import PDFPreviewer from "@/components/PDFPreviewer";
export default function QuotationLayout() {
  const [datos, setDatos] = useState({
    empresa: "",
    rfc: "",
    telefono: 0,
    email: "",
    fecha: "",
    destinatario: "",
    destinatarioEmpresa: "",
    domicilio: "",
    bank: false,

    despedida:
      "Sin más, quedo a sus órdenes ante cualquier duda, situación o comentario de su parte agradeciendo de antemano las atenciones prestadas.",
    saludo:
      "Buen día, se presenta a continuación, la cotización de los siguientes servicios y/o materiales:",
    productos: [],
    clausulas: [],
    firma: "",
    cargo: "",
  });

  const [dataBank, setDataBank] = useState([
    {
      "Nombre del Banco": "",
      "Número de cuenta": 0,
      "Clabe Interbancaria": 0,
    },
  ]);

  const [pdfDataUrl, setPdfDataUrl] = useState(null);

  const agregarProducto = () => {
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
        },
      ],
    }));
  };

  const agregarClausula = () => {
    setDatos((prevDatos) => ({
      ...prevDatos,
      clausulas: [...prevDatos.clausulas, ""],
    }));
  };

  const handleProductoChange = (e, index) => {
    const { name, value } = e.target;
    const nuevosProductos = [...datos.productos];
    nuevosProductos[index][name] = value;
    setDatos({ ...datos, productos: nuevosProductos });
  };

  const handleClausulaChange = (e, index) => {
    const { value } = e.target;
    const nuevasClausulas = [...datos.clausulas];
    nuevasClausulas[index] = value;
    setDatos({ ...datos, clausulas: nuevasClausulas });
  };

  const handleDataBankChange = (e) =>
    setDataBank({ ...dataBank, [e.target.name]: e.target.value });

  //Seteamos si mostramos el form para datos bancarios
  const showDataBank = (e) => setDatos({ ...datos, bank: e.target.checked });

  const handleChange = (e) => {
    const el = e.target;
    setDatos({
      ...datos,
      [el.name]: el.value,
    });
  };

  return (
    <section className="mx-auto my-5 max-w-6xl animate-fade">
      {/* Quotation form */}
      <QuotationForm handleChange={handleChange} datos={datos} />
      {/* Destinatario Info */}
      <QuotationRecipients handleChange={handleChange} />
      {/* Productos Info */}
      <QuotationProducts
        datos={datos}
        handleProductoChange={handleProductoChange}
        agregarProducto={agregarProducto}
      />
      {/* Cláusulas Info */}
      <QuotationClauses
        datos={datos}
        handleClausulaChange={handleClausulaChange}
        agregarClausula={agregarClausula}
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
