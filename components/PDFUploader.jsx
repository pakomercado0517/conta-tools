"use client";
import { useState } from "react";
import { extractDataFromPDF } from "../utils/pdfUtils";

const PDFUploader = () => {
  const [pdfData, setPdfData] = useState(null);
  const [extractedData, setExtractedData] = useState([]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    console.log("file", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const pdfData = event.target.result;
        const data = await extractDataFromPDF(new Uint8Array(pdfData));
        setExtractedData(data);
      };
      reader.readAsArrayBuffer(file);
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
