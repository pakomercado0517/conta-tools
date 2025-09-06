"use client";

import { useState } from "react";
import { extractInvoiceDataForContract } from "@/utils/contractPdfUtils";

export default function TestPdfUpload() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("File selected:", file.name, file.type, file.size);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log("ArrayBuffer created, size:", arrayBuffer.byteLength);
      
      const data = await extractInvoiceDataForContract(arrayBuffer);
      console.log("Data extracted:", data);
      setResult(data);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Test PDF Upload</h3>
      
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      
      {loading && <p className="text-blue-600">Procesando...</p>}
      
      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {result && (
        <div className="bg-green-50 p-3 rounded">
          <h4 className="font-bold text-green-800">Datos extraídos:</h4>
          <pre className="text-sm mt-2 text-green-700 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
