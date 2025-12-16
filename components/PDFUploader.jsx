"use client";
import { useState } from "react";

const PDFUploader = () => {
  const [pdfData, setPdfData] = useState(null);
  const [extractedData, setExtractedData] = useState([]);
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

        const result = await response.json();
        setExtractedData(result.data);
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
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {/* {extractedData.length > 0 && (
        <div>
          <h2>Extracted Data:</h2>
          <ul>
            {extractedData.map((data, index) => (
              <li key={index}>
                <p>Monto: {data.monto}</p>
                <p>RFC: {data.rfc}</p>
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  );
};

export default PDFUploader;
