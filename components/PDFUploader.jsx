"use client";
import { useState } from "react";

const PDFUploader = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    console.log("file", file);
    if (file) {
      setIsProcessing(true);
      try {
        const formData = new FormData();
        formData.append("pdf", file);

        const response = await fetch("/api/extract-pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Error al procesar el PDF");
        }

        await response.json();
      } catch (error) {
        console.error("Error:", error);
        alert("Error al procesar el PDF. Por favor, intenta de nuevo.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        disabled={isProcessing}
        onChange={handleFileChange}
      />
      {isProcessing && (
        <p className="mt-2 text-sm text-gray-600">Procesando PDF...</p>
      )}
    </div>
  );
};

export default PDFUploader;
