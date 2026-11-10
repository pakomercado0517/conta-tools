import {
  ContractGenerated,
  ContractOperation,
  ContractClause,
  numeroARomano,
  TERMINOLOGIA_POR_TIPO,
  TipoContrato,
  CLAUSULAS_OBLIGATORIAS_POR_TIPO,
  ClausulasEstandarSeleccionadas,
} from "@/types/contract-v2";

// ============================================================================
// MOTOR DE CHAT: APLICA OPERACIONES AL CONTRATO
// ============================================================================

export interface ApplyResult {
  contract: ContractGenerated;
  errors: string[];
  warnings: string[];
}

/**
 * Aplica un array de operaciones al contrato de forma inmutable
 * Retorna nuevo contrato + errores/warnings
 */
export function applyOperations(
  contract: ContractGenerated,
  operations: ContractOperation[]
): ApplyResult {
  let newContract = { ...contract };
  const errors: string[] = [];
  const warnings: string[] = [];

  // Deep clone para inmutabilidad
  newContract = JSON.parse(JSON.stringify(newContract));
  newContract.clausulas = [...newContract.clausulas];

  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    try {
      const result = applySingleOperation(newContract, op);
      newContract = result.contract;
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    } catch (e) {
      errors.push(`Error aplicando operación ${i + 1} (${op.tipo}): ${(e as Error).message}`);
    }
  }

  // Renumerar cláusulas después de todas las operaciones
  newContract.clausulas = renumerarClausulas(newContract.clausulas);

  // Actualizar metadata
  newContract.generadoEn = new Date().toISOString();
  newContract.warnings = [...(newContract.warnings || []), ...warnings];

  return { contract: newContract, errors, warnings };
}

function applySingleOperation(
  contract: ContractGenerated,
  op: ContractOperation
): ApplyResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let newContract = { ...contract };
  newContract.clausulas = [...contract.clausulas];

  switch (op.tipo) {
    case "ELIMINAR_CLAUSULA":
      return eliminarClausula(newContract, op.numeroRomano);
    
    case "MODIFICAR_CLAUSULA":
      return modificarClausula(newContract, op.numeroRomano, op.nuevoContenido);
    
    case "INSERTAR_CLAUSULA":
      return insertarClausula(newContract, op.despuesDe, op.clausula);
    
    case "CAMPO_GLOBAL":
      return modificarCampoGlobal(newContract, op.campo, op.valor);
    
    case "REORDENAR_CLAUSULAS":
      return reordenarClausulas(newContract, op.orden);
    
    case "TOGGLE_CLAUSULA_ESTANDAR":
      return toggleClausulaEstandar(newContract, op.clave, op.activo);
    
    default:
      errors.push(`Tipo de operación desconocido: ${(op as { tipo: string }).tipo}`);
      return { contract, errors, warnings };
  }
}

/**
 * Elimina una cláusula por número romano
 * No permite eliminar cláusulas obligatorias
 */
function eliminarClausula(
  contract: ContractGenerated,
  numeroRomano: string
): ApplyResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const index = contract.clausulas.findIndex(c => c.numeroRomano === numeroRomano);
  
  if (index === -1) {
    errors.push(`Cláusula ${numeroRomano} no encontrada`);
    return { contract, errors, warnings };
  }

  const clausula = contract.clausulas[index];
  
  // Verificar si es obligatoria
  const obligatorias = CLAUSULAS_OBLIGATORIAS_POR_TIPO[contract.tipoContrato] || [];
  const esObligatoria = obligatorias.some(o => clausula.titulo.toUpperCase().includes(o.toUpperCase()));
  
  if (esObligatoria) {
    errors.push(`No se puede eliminar la cláusula ${numeroRomano} (${clausula.titulo}): es obligatoria para ${contract.tipoContrato}`);
    return { contract, errors, warnings };
  }

  newContract.clausulas.splice(index, 1);
  warnings.push(`Cláusula ${numeroRomano} (${clausula.titulo}) eliminada`);

  return { contract: newContract, errors, warnings };
}

let newContract: ContractGenerated;

/**
 * Modifica el contenido de una cláusula existente
 */
function modificarClausula(
  contract: ContractGenerated,
  numeroRomano: string,
  nuevoContenido: string
): ApplyResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const index = contract.clausulas.findIndex(c => c.numeroRomano === numeroRomano);
  
  if (index === -1) {
    errors.push(`Cláusula ${numeroRomano} no encontrada`);
    return { contract, errors, warnings };
  }

  const clausulaAnterior = contract.clausulas[index];
  newContract = { ...contract };
  newContract.clausulas = [...contract.clausulas];
  newContract.clausulas[index] = {
    ...clausulaAnterior,
    contenido: nuevoContenido,
    fuente: "ia-usuario", // Marcar como modificada por usuario/IA
  };
  warnings.push(`Cláusula ${numeroRomano} (${clausulaAnterior.titulo}) modificada`);

  return { contract: newContract, errors, warnings };
}

/**
 * Inserta una nueva cláusula después de una existente
 */
function insertarClausula(
  contract: ContractGenerated,
  despuesDe: string,
  clausulaNueva: Omit<ContractClause, "numero" | "numeroRomano">
): ApplyResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const index = contract.clausulas.findIndex(c => c.numeroRomano === despuesDe);
  
  if (index === -1) {
    errors.push(`Cláusula de referencia ${despuesDe} no encontrada`);
    return { contract, errors, warnings };
  }

  const nuevaClausula: ContractClause = {
    numero: index + 2, // Temporal, se renumerará después
    numeroRomano: numeroARomano(index + 2),
    titulo: clausulaNueva.titulo,
    contenido: clausulaNueva.contenido,
    esObligatoria: clausulaNueva.esObligatoria ?? false,
    fuente: clausulaNueva.fuente ?? "ia-usuario",
  };

  newContract = { ...contract };
  newContract.clausulas = [...contract.clausulas];
  newContract.clausulas.splice(index + 1, 0, nuevaClausula);
  warnings.push(`Nueva cláusula "${clausulaNueva.titulo}" insertada después de ${despuesDe}`);

  return { contract: newContract, errors, warnings };
}

/**
 * Modifica un campo global del contrato
 */
function modificarCampoGlobal(
  contract: ContractGenerated,
  campo: string,
  valor: unknown
): ApplyResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let newContract = { ...contract };

  switch (campo) {
    case "jurisdiccion": {
      if (typeof valor !== "string") {
        errors.push("Jurisdicción debe ser texto");
        return { contract, errors, warnings };
      }
      newContract.firma = { ...contract.firma, ciudad: valor };
      // Actualizar también en cláusula de jurisdicción si existe
      const clausulaJur = newContract.clausulas.find(c => 
        c.titulo.toUpperCase().includes("JURISDICCIÓN") || 
        c.titulo.toUpperCase().includes("FUERO") ||
        c.titulo.toUpperCase().includes("LEY APLICABLE")
      );
      if (clausulaJur) {
        clausulaJur.contenido = clausulaJur.contenido.replace(
          /en \*\*[^*]+\*\*/,
          `en **${valor}**`
        );
      }
      warnings.push(`Jurisdicción cambiada a: ${valor}`);
      break;
    }

    case "monto":
      if (typeof valor !== "number" || valor <= 0) {
        errors.push("Monto debe ser un número positivo");
        return { contract, errors, warnings };
      }
      // Actualizar en cláusula de precio
      const clausulaPrecio = newContract.clausulas.find(c => 
        c.titulo.toUpperCase().includes("PRECIO") || 
        c.titulo.toUpperCase().includes("RENTA") || 
        c.titulo.toUpperCase().includes("HONORARIO")
      );
      if (clausulaPrecio) {
        const montoFormateado = new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
          minimumFractionDigits: 2,
        }).format(valor);
        clausulaPrecio.contenido = clausulaPrecio.contenido.replace(
          /\$\s*[\d,.]+/,
          montoFormateado
        );
      }
      warnings.push(`Monto actualizado a ${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor)}`);
      break;

    case "iva": {
      if (typeof valor !== "string" || !["incluido", "separado", "exento"].includes(valor)) {
        errors.push("IVA debe ser: incluido, separado o exento");
        return { contract, errors, warnings };
      }
      const clausulaIva = newContract.clausulas.find(c => 
        c.titulo.toUpperCase().includes("PRECIO") || 
        c.titulo.toUpperCase().includes("RENTA") || 
        c.titulo.toUpperCase().includes("HONORARIO")
      );
      if (clausulaIva) {
        const ivaTexto = valor === "incluido" ? "IVA INCLUIDO (16%)" : 
                         valor === "separado" ? "IVA SEPARADO (16% adicional)" : "EXENTO DE IVA";
        clausulaIva.contenido = clausulaIva.contenido.replace(
          /IVA (INCLUIDO|SEPARADO|EXENTO)[^.\n]*/i,
          ivaTexto
        );
      }
      warnings.push(`IVA cambiado a: ${valor}`);
      break;
    }

    case "tipoPago": {
      if (typeof valor !== "string" || !["una_exhibicion", "parcialidades", "otro"].includes(valor)) {
        errors.push("Tipo de pago inválido");
        return { contract, errors, warnings };
      }
      const clausulaPago = newContract.clausulas.find(c => 
        c.titulo.toUpperCase().includes("PRECIO") || 
        c.titulo.toUpperCase().includes("RENTA") || 
        c.titulo.toUpperCase().includes("HONORARIO")
      );
      if (clausulaPago) {
        const tipoTexto = valor === "una_exhibicion" ? "PAGO EN UNA SOLA EXHIBICIÓN" :
                          valor === "parcialidades" ? "PAGO EN PARCIALIDADES" : "OTRO TIPO DE PAGO";
        clausulaPago.contenido = clausulaPago.contenido.replace(
          /(PAGO EN UNA SOLA EXHIBICIÓN|PAGO EN PARCIALIDADES|OTRO TIPO DE PAGO)/i,
          tipoTexto
        );
      }
      warnings.push(`Tipo de pago cambiado a: ${valor}`);
      break;
    }

    case "condicionesPago": {
      if (typeof valor !== "string") {
        errors.push("Condiciones de pago deben ser texto");
        return { contract, errors, warnings };
      }
      const clausulaCond = newContract.clausulas.find(c => 
        c.titulo.toUpperCase().includes("PRECIO") || 
        c.titulo.toUpperCase().includes("RENTA") || 
        c.titulo.toUpperCase().includes("HONORARIO")
      );
      if (clausulaCond) {
        clausulaCond.contenido = clausulaCond.contenido.replace(
          /Condiciones de pago: [^.\n]*/i,
          `Condiciones de pago: ${valor}`
        );
      }
      warnings.push(`Condiciones de pago actualizadas`);
      break;
    }

    case "fechaFin": {
      // Valor esperado: { tipo, fechaExacta?, textoPersonalizado? }
      const fechaValor = valor as { tipo?: string; fechaExacta?: string; textoPersonalizado?: string } | null;
      if (!fechaValor || !fechaValor.tipo) {
        errors.push("fechaFin requiere objeto con 'tipo'");
        return { contract, errors, warnings };
      }
      // La fecha fin se maneja principalmente en la firma/cláusula de vigencia
      // Por simplicidad, actualizamos la firma
      let fechaStr = "";
      switch (fechaValor.tipo) {
        case "fecha_exacta":
          fechaStr = fechaValor.fechaExacta ? formatearFechaLetra(fechaValor.fechaExacta) : "[FECHA]";
          break;
        case "indefinido":
          fechaStr = "INDEFINIDO (por tiempo indeterminado)";
          break;
        case "hasta_terminar":
          fechaStr = "HASTA TERMINAR LA PRESTACIÓN/ENTREGA";
          break;
        case "personalizado":
          fechaStr = fechaValor.textoPersonalizado || "[ESPECIFICAR]";
          break;
      }
      newContract.firma = { ...contract.firma, fechaEnLetras: fechaStr };
      warnings.push(`Fecha de fin actualizada a: ${fechaStr}`);
      break;
    }

    default:
      errors.push(`Campo global desconocido: ${campo}`);
  }

  return { contract: newContract, errors, warnings };
}

/**
 * Reordena las cláusulas según el array de números romanos
 */
function reordenarClausulas(
  contract: ContractGenerated,
  orden: string[]
): ApplyResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar que el orden contiene todas las cláusulas actuales
  const actuales = contract.clausulas.map(c => c.numeroRomano);
  const faltantes = actuales.filter(r => !orden.includes(r));
  const extra = orden.filter(r => !actuales.includes(r));

  if (faltantes.length > 0) {
    errors.push(`Faltan cláusulas en el nuevo orden: ${faltantes.join(", ")}`);
    return { contract, errors, warnings };
  }
  if (extra.length > 0) {
    warnings.push(`Cláusulas en orden que no existen: ${extra.join(", ")} (se ignorarán)`);
  }

  // Reordenar
  const mapa = new Map(contract.clausulas.map(c => [c.numeroRomano, c]));
  const nuevasClausulas = orden.flatMap((r) => {
    const clause = mapa.get(r);
    return clause ? [clause] : [];
  });

  newContract = { ...contract };
  newContract.clausulas = nuevasClausulas;
  warnings.push("Cláusulas reordenadas");

  return { contract: newContract, errors, warnings };
}

/**
 * Activa/desactiva una cláusula estándar
 * Esto elimina o vuelve a agregar la cláusula del catálogo estándar
 */
function toggleClausulaEstandar(
  contract: ContractGenerated,
  clave: keyof ClausulasEstandarSeleccionadas,
  activo: boolean
): ApplyResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const titulosEstandar: Record<keyof ClausulasEstandarSeleccionadas, string> = {
    responsabilidadLaboral: "RESPONSABILIDAD LABORAL",
    facturacionFiscal: "FACTURACIÓN",
    confidencialidad: "CONFIDENCIALIDAD",
    penalizaciones: "CLÁUSULA PENAL",
    fuerzaMayor: "FUERZA MAYOR",
    terminacionAnticipada: "TERMINACIÓN ANTICIPADA",
    notificaciones: "NOTIFICACIONES",
    noCompetencia: "NO COMPETENCIA",
    propiedadIntelectual: "PROPIEDAD INTELECTUAL",
  };

  const tituloBuscado = titulosEstandar[clave];
  
  if (!activo) {
    // Desactivar = eliminar si existe
    const index = contract.clausulas.findIndex(c => 
      c.titulo.toUpperCase().includes(tituloBuscado.toUpperCase()) &&
      c.fuente === "ia-estandar"
    );
    if (index !== -1) {
      const eliminada = contract.clausulas[index];
      newContract = { ...contract };
      newContract.clausulas = [...contract.clausulas];
      newContract.clausulas.splice(index, 1);
      warnings.push(`Cláusula estándar "${eliminada.titulo}" desactivada`);
    } else {
      warnings.push(`Cláusula "${tituloBuscado}" no estaba activa`);
    }
  } else {
    // Activar = agregar si no existe
    const existe = contract.clausulas.some(c => 
      c.titulo.toUpperCase().includes(tituloBuscado.toUpperCase())
    );
    if (existe) {
      warnings.push(`Cláusula "${tituloBuscado}" ya está activa`);
    } else {
      // Insertar en posición lógica (antes de jurisdicción)
      const indexJur = contract.clausulas.findIndex(c => 
        c.titulo.toUpperCase().includes("JURISDICCIÓN")
      );
      const insertIndex = indexJur !== -1 ? indexJur : contract.clausulas.length;
      
      const nuevaClausula: ContractClause = {
        numero: 0, // Temporal
        numeroRomano: "",
        titulo: tituloBuscado,
        contenido: generarContenidoClausulaEstandar(clave, contract.tipoContrato),
        esObligatoria: false,
        fuente: "ia-estandar",
      };

      newContract = { ...contract };
      newContract.clausulas = [...contract.clausulas];
      newContract.clausulas.splice(insertIndex, 0, nuevaClausula);
      warnings.push(`Cláusula estándar "${tituloBuscado}" activada`);
    }
  }

  return { contract: newContract, errors, warnings };
}

/**
 * Genera contenido básico para cláusulas estándar activadas por toggle
 */
function generarContenidoClausulaEstandar(clave: keyof ClausulasEstandarSeleccionadas, tipoContrato: TipoContrato): string {
  const term = TERMINOLOGIA_POR_TIPO[tipoContrato];
  
  switch (clave) {
    case "responsabilidadLaboral":
      return `Las Partes integrantes del presente Contrato son independientes entre sí y por ningún motivo serán consideradas como agentes o representantes, trabajadores o empleados de la otra. Cada una se responsabilizará de sus propias acciones y obligaciones con respecto a sus empleados. Las Partes asumen toda la responsabilidad derivada de la relación de trabajo con sus propios empleados, trabajadores o dependientes.`;
    
    case "facturacionFiscal":
      return `**${term.parteA}** se compromete a emitir los **recibos o facturas fiscales** correspondientes por cada pago recibido, conforme a lo estipulado por las leyes fiscales vigentes.`;
    
    case "confidencialidad":
      return `Las Partes se obligan a mantener estricta confidencialidad sobre toda información técnica, comercial, financiera o de cualquier otra naturaleza que conozcan con motivo de la celebración y ejecución del presente Contrato. Esta obligación subsistirá por un plazo de 2 (dos) años contados a partir de la terminación del Contrato.`;
    
    case "penalizaciones":
      return `En caso de incumplimiento de cualquiera de las obligaciones establecidas en el presente Contrato, la Parte incumplida pagará a la otra una penalización equivalente al 10% (diez por ciento) del monto total del Contrato, sin perjuicio del derecho a exigir el cumplimiento forzoso o la resolución del Contrato.`;
    
    case "fuerzaMayor":
      return `Ninguna de las Partes será responsable por el incumplimiento de sus obligaciones cuando dicho incumplimiento sea causado por fuerza mayor o caso fortuito, entendiéndose como tales los eventos imprevisibles e inevitables, tales como desastres naturales, guerras, huelgas, disturbios, actos de autoridad, epidemias, o cualquier otro evento fuera del control razonable de la Parte afectada.`;
    
    case "terminacionAnticipada":
      return `Cualquiera de las Partes podrá dar por terminado anticipadamente el presente Contrato, mediante notificación por escrito con 30 (treinta) días de anticipación, en caso de incumplimiento grave de las obligaciones de la otra Parte que no sea subsanado dentro de los 15 (quince) días hábiles siguientes a la notificación del incumplimiento.`;
    
    case "notificaciones":
      return `Todas las notificaciones, comunicaciones y avisos que deban hacerse entre las Partes con motivo del presente Contrato, se realizarán por escrito y se entregarán personalmente o se enviarán por correo certificado con acuse de recibo, o por medios electrónicos que permitan comprobar su recepción, a los domicilios señalados en las Declaraciones.`;
    
    case "noCompetencia":
      return `**${term.parteA}** se obliga a no competir directa ni indirectamente con **${term.parteB}** en el mismo giro o actividad objeto del presente Contrato, durante la vigencia del mismo y por un plazo de 12 (doce) meses contados a partir de su terminación, en el territorio donde **${term.parteB}** realice sus actividades.`;
    
    case "propiedadIntelectual":
      return `Todos los derechos de propiedad intelectual, incluyendo pero no limitados a derechos de autor, patentes, marcas, secretos industriales, know-how, y cualquier otro derecho de propiedad industrial o intelectual que se generen, desarrollen o creen con motivo o en relación con la ejecución del presente Contrato, pertenecerán en forma exclusiva a **${term.parteB}**, quien podrá usarlos, explotarlos, modificarlos y enajenarlos libremente.`;
    
    default:
      return `[Contenido para ${clave} no definido]`;
  }
}

/**
 * Renumera todas las cláusulas secuencialmente
 */
function renumerarClausulas(clausulas: ContractClause[]): ContractClause[] {
  return clausulas.map((c, i) => ({
    ...c,
    numero: i + 1,
    numeroRomano: numeroARomano(i + 1),
  }));
}

/**
 * Valida si se puede aplicar una operación sin ejecutarla
 */
export function validateOperations(
  contract: ContractGenerated,
  operations: ContractOperation[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const opErrors = validateOperation(contract, op, i);
    errors.push(...opErrors);
  }

  return { valid: errors.length === 0, errors };
}

function validateOperation(
  contract: ContractGenerated,
  op: ContractOperation,
  index: number
): string[] {
  const errors: string[] = [];
  const prefix = `Operación ${index + 1} (${op.tipo}):`;

  switch (op.tipo) {
    case "ELIMINAR_CLAUSULA":
      if (!op.numeroRomano) {
        errors.push(`${prefix} Falta numeroRomano`);
      } else {
        const clausula = contract.clausulas.find(c => c.numeroRomano === op.numeroRomano);
        if (!clausula) {
          errors.push(`${prefix} Cláusula ${op.numeroRomano} no existe`);
        } else {
          const obligatorias = CLAUSULAS_OBLIGATORIAS_POR_TIPO[contract.tipoContrato] || [];
          const esObligatoria = obligatorias.some(o => clausula.titulo.toUpperCase().includes(o.toUpperCase()));
          if (esObligatoria) {
            errors.push(`${prefix} No se puede eliminar cláusula obligatoria: ${clausula.titulo}`);
          }
        }
      }
      break;

    case "MODIFICAR_CLAUSULA":
      if (!op.numeroRomano || !op.nuevoContenido) {
        errors.push(`${prefix} Requiere numeroRomano y nuevoContenido`);
      } else if (!contract.clausulas.some(c => c.numeroRomano === op.numeroRomano)) {
        errors.push(`${prefix} Cláusula ${op.numeroRomano} no existe`);
      }
      break;

    case "INSERTAR_CLAUSULA":
      if (!op.despuesDe || !op.clausula) {
        errors.push(`${prefix} Requiere despuesDe y clausula`);
      } else if (!contract.clausulas.some(c => c.numeroRomano === op.despuesDe)) {
        errors.push(`${prefix} Cláusula de referencia ${op.despuesDe} no existe`);
      } else if (!op.clausula.titulo || !op.clausula.contenido) {
        errors.push(`${prefix} clausula requiere titulo y contenido`);
      }
      break;

    case "CAMPO_GLOBAL":
      if (!op.campo || op.valor === undefined) {
        errors.push(`${prefix} Requiere campo y valor`);
      }
      break;

    case "REORDENAR_CLAUSULAS":
      if (!op.orden || !Array.isArray(op.orden) || op.orden.length === 0) {
        errors.push(`${prefix} Requiere orden array no vacío`);
      }
      break;

    case "TOGGLE_CLAUSULA_ESTANDAR":
      if (!op.clave || typeof op.activo !== "boolean") {
        errors.push(`${prefix} Requiere clave y activo (boolean)`);
      }
      break;
  }

  return errors;
}

/**
 * Crea una copia del contrato para uso en undo/redo
 */
export function createContractSnapshot(contract: ContractGenerated): ContractGenerated {
  return JSON.parse(JSON.stringify(contract));
}

/**
 * Compara dos contratos y genera operaciones de diff (para futuro)
 */
export function diffContracts(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  oldContract: ContractGenerated,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  newContract: ContractGenerated
): ContractOperation[] {
  // TODO: Implementar diff automático
  return [];
}

/**
 * Formatea fecha ISO a letra para usar en firmas
 */
function formatearFechaLetra(fechaISO: string): string {
  const date = new Date(fechaISO + "T00:00:00");
  const dias = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
    "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte",
    "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve", "treinta", "treinta y uno"];
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  
  const dia = date.getDate();
  const mes = meses[date.getMonth()];
  const anio = date.getFullYear();
  
  return `${dias[dia]} de ${mes} de ${anio}`;
}