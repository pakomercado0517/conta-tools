"use client";
import { useState } from "react";
import { Textarea, Button, Card, TextInput } from "flowbite-react";

export default function GeneradorConceptosSATPage() {
  const [descripcion, setDescripcion] = useState("");
  const [resultado, setResultado] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const generarConcepto = async () => {
    if (!descripcion.trim()) return;

    setLoading(true);
    setResultado([]);
    setError("");
    setCurrentPage(1);

    try {
      const res = await fetch("/api/generador_conceptos/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion }),
      });

      const data = await res.json();
      console.log("Respuesta desde API", data);

      if (!data.claves || !Array.isArray(data.claves)) {
        throw new Error("Respuesta inválida");
      }

      setResultado(data.claves);
    } catch (err) {
      console.error("Error:", err);
      setError("Ocurrió un error al generar las claves SAT.");
    } finally {
      setLoading(false);
    }
  };

  // 🔢 Calcular qué resultados mostrar por página
  const totalPages = Math.ceil(resultado.length / pageSize);
  const currentResults = resultado.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-4 text-center text-4xl font-extrabold tracking-tight text-gray-200">
        Buscador de Claves SAT
      </h1>
      <p className="mb-6 text-center text-gray-400">
        Ingresa el producto o servicio que deseas buscar para obtener las claves
        SAT.
      </p>

      <TextInput
        color="gray"
        placeholder="Ej: Transporte de carga"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      <div className="mt-3 flex justify-center">
        <Button
          onClick={generarConcepto}
          disabled={loading || !descripcion.trim()}
        >
          {loading ? "Generando..." : "Generar Claves SAT"}
        </Button>
      </div>

      {error && (
        <p className="mt-4 text-center font-medium text-red-500">{error}</p>
      )}

      {resultado.length > 0 && (
        <Card className="mt-6 border-gray-700 dark:bg-gray-800 dark:text-white">
          <h2 className="mb-2 text-xl font-semibold">Claves Sugeridas</h2>
          <ul className="list-inside list-disc space-y-1">
            {currentResults.map((item, idx) => (
              <li key={idx}>
                <span className="font-mono text-cyan-600">{item}</span>
              </li>
            ))}
          </ul>

          {/* 🔄 Paginación */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                size="xs"
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-400">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                size="xs"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </Card>
      )}
    </section>
  );
}
