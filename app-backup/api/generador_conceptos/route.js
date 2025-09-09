import { NextResponse } from "next/server";
import Fuse from "fuse.js";
import catalogo from "@/utils/catalogs/c_ClaveProdServ.json"; // usa la ruta real

// Configuración específica para este formato
const fuse = new Fuse(catalogo, {
  keys: ["descripcion"],
  threshold: 0.3,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 3,
});

// Función: búsqueda + filtro exacto (ambas combinadas)
function buscarClaves(descripcion) {
  const texto = descripcion.toLowerCase().trim();

  // Búsqueda difusa con Fuse
  const fuseResults = fuse.search(texto);

  // Búsqueda por coincidencia directa (respaldo)
  const exactMatches = catalogo.filter((item) =>
    item.descripcion?.toLowerCase().includes(texto),
  );

  // Combinar ambos resultados sin duplicados
  const clavesUnicas = new Map();

  fuseResults.forEach((res) => {
    clavesUnicas.set(res.item.id, {
      clave: res.item.id,
      descripcion: res.item.descripcion,
    });
  });

  exactMatches.forEach((item) => {
    clavesUnicas.set(item.id, {
      clave: item.id,
      descripcion: item.descripcion,
    });
  });

  return Array.from(clavesUnicas.values());
}

export async function POST(request) {
  const { descripcion } = await request.json();

  if (!descripcion || descripcion.trim().length < 2) {
    return NextResponse.json(
      { claves: ["00000000 - Descripción muy corta"] },
      { status: 400 },
    );
  }

  const resultados = buscarClaves(descripcion);

  if (resultados.length === 0) {
    return NextResponse.json({
      claves: ["00000000 - No se encontraron coincidencias"],
    });
  }

  return NextResponse.json({
    claves: resultados.map((c) => `${c.clave} - ${c.descripcion}`),
  });
}
