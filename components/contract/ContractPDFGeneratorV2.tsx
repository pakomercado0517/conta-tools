"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "flowbite-react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import {
  ensureJsPdfUnicodeFont,
  setJsPdfUnicodeFont,
} from "@/lib/jspdfUnicodeFont";
import { ContractGenerated, ContractInput } from "@/types/contract-v2";

interface ContractPDFGeneratorV2Props {
  contract: ContractGenerated;
  input: ContractInput;
  children?: React.ReactNode;
  className?: string;
  fileName?: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export default function ContractPDFGeneratorV2({
  contract,
  input,
  children,
  className = "",
  fileName,
  onSuccess,
  onError,
}: ContractPDFGeneratorV2Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (): Promise<jsPDF> => {
    const doc = new jsPDF();
    await ensureJsPdfUnicodeFont(doc);
    setJsPdfUnicodeFont(doc, "normal");

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const lineHeight = 6;
    let yPosition = margin;

    const usableWidth = pageWidth - 2 * margin;

    // Helper para medir texto
    const measureText = (text: string, style: "normal" | "bold" = "normal"): number => {
      setJsPdfUnicodeFont(doc, style);
      return doc.getTextWidth(text);
    };

    // Helper para agregar texto con soporte markdown **negritas**
    const addText = (
      text: string,
      fontSize: number = 10,
      isBold: boolean = false,
      align: "left" | "center" | "justify" = "justify"
    ): void => {
      const defaultStyle = isBold ? "bold" : "normal";

      const ensurePageSpace = (): void => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
      };

      // Tokenizar párrafo
      const tokenizeParagraph = (paragraph: string) => {
        const parts = paragraph.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        const tokens: Array<{ text: string; style: "normal" | "bold" }> = [];

        parts.forEach((part, idx) => {
          const isMarkdownBold = part.startsWith("**") && part.endsWith("**");
          let clean = isMarkdownBold ? part.slice(2, -2) : part;

          // Manejar espacios alrededor de negritas
          if (isMarkdownBold) {
            const prevPart = idx > 0 ? parts[idx - 1] : null;
            if (prevPart && !prevPart.endsWith(" ") && !clean.startsWith(" ")) {
              clean = " " + clean;
            }
            const nextPart = idx < parts.length - 1 ? parts[idx + 1] : null;
            if (nextPart && !nextPart.startsWith(" ") && !clean.endsWith(" ")) {
              clean = clean + " ";
            }
          }

          const words = clean.split(/(\s+)/);
          words.forEach((word) => {
            if (word.length > 0) {
              tokens.push({
                text: word,
                style: isMarkdownBold ? "bold" : defaultStyle,
              });
            }
          });
        });

        if (tokens.length === 0) tokens.push({ text: "", style: defaultStyle });
        return tokens;
      };

      // Renderizar línea
      const renderLine = (
        lineTokens: Array<{ text: string; style: "normal" | "bold" }>,
        y: number,
        alignMode: "left" | "center" | "justify",
        isLastLine: boolean
      ): void => {
        let lineWidth = 0;
        lineTokens.forEach((t) => {
          lineWidth += measureText(t.text, t.style);
        });

        const wordTokens = lineTokens.filter(
          (t) => !/^\s+$/.test(t.text) && t.text !== " "
        );
        const totalWords = wordTokens.length;

        let startX = margin;
        let extraSpacePerGap = 0;

        if (alignMode === "center") {
          startX = margin + (usableWidth - lineWidth) / 2;
        } else if (alignMode === "justify" && !isLastLine && totalWords > 1) {
          const wordsWidth = wordTokens.reduce(
            (sum, t) => sum + measureText(t.text, t.style),
            0
          );
          const availableSpace = usableWidth - wordsWidth;
          const spaceCount = totalWords - 1;
          extraSpacePerGap = availableSpace / spaceCount;
        }

        let x = startX;
        let wordCount = 0;

        lineTokens.forEach((t) => {
          const isSpace = /^\s+$/.test(t.text) || t.text === " ";
          const tokenWidth = measureText(t.text, t.style);

          if (!isSpace) {
            setJsPdfUnicodeFont(doc, t.style === "bold" ? "bold" : "normal");
            doc.text(t.text, x, y);
            x += tokenWidth;
            wordCount++;

            if (
              alignMode === "justify" &&
              !isLastLine &&
              wordCount < totalWords
            ) {
              x += extraSpacePerGap;
            }
          } else if (alignMode !== "justify" || isLastLine) {
            setJsPdfUnicodeFont(doc, t.style === "bold" ? "bold" : "normal");
            doc.text(t.text, x, y);
            x += tokenWidth;
          }
        });
      };

      doc.setFontSize(fontSize);
      const paragraphs = String(text).split("\n");

      paragraphs.forEach((p, pIdx) => {
        ensurePageSpace();
        const tokens = tokenizeParagraph(p);

        const lines: Array<Array<{ text: string; style: "normal" | "bold" }>> = [];
        let currentLine: Array<{ text: string; style: "normal" | "bold" }> = [];
        let currentWidth = 0;

        tokens.forEach((tok) => {
          const w = measureText(tok.text, tok.style);
          if (currentWidth + w > usableWidth && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = [tok];
            currentWidth = w;
          } else {
            currentLine.push(tok);
            currentWidth += w;
          }
        });
        if (currentLine.length > 0) lines.push(currentLine);

        lines.forEach((line, lineIdx) => {
          ensurePageSpace();
          const mode = align === "center" ? "center" : align === "justify" ? "justify" : "left";
          const isLastLine = lineIdx === lines.length - 1;
          renderLine(line, yPosition, mode, isLastLine);
          yPosition += lineHeight;
        });

        if (pIdx === paragraphs.length - 1) {
          yPosition += lineHeight;
        }
      });
    };

    const addSpace = (space: number = lineHeight): void => {
      yPosition += space;
    };

    const checkPageBreak = (neededSpace: number = 60): void => {
      if (yPosition > pageHeight - neededSpace) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // ============ INICIO CONTENIDO ============

    // Título
    addText(contract.titulo, 16, true, "center");
    addSpace(10);

    // Preámbulo
    const preambulo = `En ${contract.firma.ciudad}, a ${contract.firma.fechaEnLetras}, se celebra el presente ${contract.titulo} entre ${contract.terminologia.parteA}, ${input.parteA.nombre}${input.parteA.esEmpresa && input.parteA.representante ? `, representado por ${input.parteA.representante}` : ""}, con domicilio en ${input.parteA.domicilio}, y ${contract.terminologia.parteB}, ${input.parteB.nombre}${input.parteB.esEmpresa && input.parteB.representante ? `, representado por ${input.parteB.representante}` : ""}, con domicilio en ${input.parteB.domicilio}, a quienes en lo sucesivo se les denominará conjunta e indistintamente como "LAS PARTES", al tenor de las siguientes declaraciones y cláusulas:`;
    addText(preambulo, 10, false, "justify");
    addSpace();

    // DECLARACIONES
    addText("DECLARACIONES", 12, true, "center");
    addSpace();

    // Declaración Parte A
    addText(
      `I. DECLARA ${contract.terminologia.parteA}${input.parteA.esEmpresa ? " POR CONDUCTO DE SU REPRESENTANTE LEGAL" : ""}:`,
      10,
      false,
      "justify"
    );
    addSpace(3);

    contract.declaraciones.parteA.forEach((item, i) => {
      const letter = String.fromCharCode(65 + i); // A, B, C...
      addText(`${letter}. ${item}`, 10, false, "justify");
      addSpace(3);
    });
    addSpace();

    // Declaración Parte B
    addText(
      `II. DECLARA ${contract.terminologia.parteB}${input.parteB.esEmpresa ? " POR CONDUCTO DE SU REPRESENTANTE LEGAL" : ""}:`,
      10,
      false,
      "justify"
    );
    addSpace(3);

    contract.declaraciones.parteB.forEach((item, i) => {
      const letter = String.fromCharCode(65 + i);
      addText(`${letter}. ${item}`, 10, false, "justify");
      addSpace(3);
    });
    addSpace();

    // Transición
    addText(
      "De conformidad con las declaraciones anteriores, las Partes convienen en otorgar las siguientes:",
      10,
      false,
      "justify"
    );
    addSpace();

    // CLÁUSULAS
    addText("CLÁUSULAS", 12, true, "center");
    addSpace();

    contract.clausulas.forEach((clausula) => {
      checkPageBreak(40);

      // Título de cláusula
      addText(`${clausula.numeroRomano}. ${clausula.titulo.toUpperCase()}`, 11, true);
      addSpace(2);

      // Contenido
      addText(clausula.contenido, 10, false, "justify");
      addSpace();
    });

    // FIRMAS
    checkPageBreak(100);
    addSpace(10);

    // Texto de firma
    addText(contract.firma.leyendaCompleta, 10, false, "justify");
    addSpace(6);

    // Firmas en dos columnas
    const colWidth = (pageWidth - 2 * margin - 20) / 2;
    const leftX = margin;
    const rightX = margin + colWidth + 20;

    // Helper para dibujar bloque de firma
    const drawSignatureBlock = (
      x: number,
      title: string,
      name: string,
      representative?: string,
      image?: string,
      customText?: string
    ) => {
      checkPageBreak(80);

      const blockCenter = x + colWidth / 2;

      // Título (EL CLIENTE / EL VENDEDOR)
      setJsPdfUnicodeFont(doc, "bold");
      doc.setFontSize(11);
      doc.text(title, blockCenter, yPosition, { align: "center" });
      yPosition += 10;

      // Imagen de firma si existe
      if (image) {
        try {
          doc.addImage(image, "PNG", blockCenter - 25, yPosition, 50, 25);
          yPosition += 30;
        } catch {
          yPosition += 15;
        }
      } else {
        yPosition += 15;
      }

      // Línea de firma
      const lineLength = 80;
      const startX = blockCenter - lineLength / 2;
      const endX = blockCenter + lineLength / 2;
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(startX, yPosition, endX, yPosition);
      yPosition += 8;

      // Nombre
      setJsPdfUnicodeFont(doc, "bold");
      doc.setFontSize(9);
      doc.text(name.toUpperCase(), blockCenter, yPosition, { align: "center" });
      yPosition += 6;

      // Representante
      if (representative) {
        setJsPdfUnicodeFont(doc, "normal");
        doc.setFontSize(7);
        doc.text(representative.toUpperCase(), blockCenter, yPosition, { align: "center" });
        yPosition += 4;
        doc.text("Representante Legal", blockCenter, yPosition, { align: "center" });
        yPosition += 4;
      }

      // Texto personalizado
      if (customText) {
        setJsPdfUnicodeFont(doc, "italic");
        doc.setFontSize(6);
        doc.text(customText, blockCenter, yPosition, { align: "center" });
        yPosition += 4;
      }
    };

    // Calcular alturas para alinear
    // Primero Parte B (arriba en el contrato tradicional)
    drawSignatureBlock(
      leftX,
      contract.terminologia.parteB,
      input.parteB.nombre,
      input.parteB.representante,
      input.firmas.imagenB,
      input.firmas.textoFirmaB
    );

    addSpace(20);

    // Luego Parte A
    drawSignatureBlock(
      rightX,
      contract.terminologia.parteA,
      input.parteA.nombre,
      input.parteA.representante,
      input.firmas.imagenA,
      input.firmas.textoFirmaA
    );

    return doc;
  };

  const handleDownload = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const doc = await generatePDF();
      const defaultName = `contrato_${contract.tipoContrato}_${input.parteA.nombre.replace(/\s+/g, "_")}_${input.parteB.nombre.replace(/\s+/g, "_")}.pdf`;
      doc.save(fileName || defaultName);
      onSuccess?.();
    } catch (error) {
      console.error("Error generando PDF:", error);
      const message = "Error al generar el PDF. Intenta de nuevo.";
      if (onError) {
        onError(message);
      } else {
        alert(message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const buttonClassName =
    className ||
    "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 text-white border-0";

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      className={buttonClassName}
    >
      {isGenerating ? (
        <span className="flex items-center gap-2">
          <FaSpinner className="animate-spin" />
          <span className="hidden sm:inline">Generando PDF...</span>
          <span className="sm:hidden">PDF...</span>
        </span>
      ) : children ? (
        children
      ) : (
        <>
          <FaFilePdf className="mr-2" />
          Descargar PDF
        </>
      )}
    </Button>
  );
}