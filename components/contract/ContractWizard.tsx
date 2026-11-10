"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Button,
  TextInput,
  Textarea,
  Label,
  Select,
  Checkbox,
  Radio,
  Alert,
  Spinner,
} from "flowbite-react";
import {
  FaUser,
  FaBuilding,
  FaMoneyBillWave,
  FaFileContract,
  FaGavel,
  FaPen,
  FaTrash,
  FaMagic,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPlus,
} from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import {
  ContractInput,
  ContractGenerated,
  Parte,
  FechaFinVigencia,
  ClausulaUsuario,
  ClausulasEstandarSeleccionadas,
  Firmas,
  TipoContrato,
  TipoPago,
  IVAOption,
} from "@/types/contract-v2";
import AIGenerationLoader from "./AIGenerationLoader";
import ContractPreviewV2 from "./ContractPreviewV2";
import ClauseEditor from "./ClauseEditor";

// ============================================================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================================================

const STORAGE_KEY = "contract-wizard-v2";

type WizardDraft = {
  currentStep: number;
  input: ContractInput;
  generatedContract: ContractGenerated | null;
  showPreview: boolean;
  savedAt: string;
  signaturesOmitted?: boolean;
};

const OBJETO_PLACEHOLDER = `- Venta: "Venta de vehículo marca Toyota, modelo Corolla, año 2022, color blanco, placas XYZ-123-A"
- Arrendamiento: "Arrendamiento de local comercial de 120m² en Plaza Central, planta baja, para uso de restaurante"
- Servicios: "Prestación de servicios de consultoría contable y fiscal mensual por 12 meses"
- Obra: "Construcción de nave industrial de 500m² según planos y especificaciones anexas"`;
const TOTAL_STEPS = 5;

const TIPO_CONTRATO_OPTIONS: { value: TipoContrato; label: string; icon: string; description: string }[] = [
  { value: "venta", label: "Compraventa", icon: "🏷️", description: "Transmisión de propiedad de bienes muebles o inmuebles" },
  { value: "arrendamiento", label: "Arrendamiento", icon: "🔑", description: "Uso y goce temporal de inmueble a cambio de renta" },
  { value: "servicios", label: "Prestación de Servicios", icon: "⚙️", description: "Servicios profesionales, técnicos, consultoría, etc." },
  { value: "obra", label: "Contrato de Obra", icon: "🏗️", description: "Ejecución de obra material (construcción, remodelación)" },
  { value: "mandato", label: "Mandato/Poder", icon: "📋", description: "Encargo de gestión de asuntos por cuenta de otro" },
  { value: "personalizado", label: "Otro / Personalizado", icon: "📄", description: "Contrato atípico o mixto" },
];

const IVA_OPTIONS: { value: IVAOption; label: string; description: string }[] = [
  { value: "incluido", label: "IVA Incluido (16%)", description: "El monto ya incluye IVA" },
  { value: "separado", label: "IVA Separado (16%)", description: "IVA se suma al monto base" },
  { value: "exento", label: "Exento de IVA", description: "Operación no sujeta a IVA" },
];

const TIPO_PAGO_OPTIONS: { value: TipoPago; label: string; description: string }[] = [
  { value: "una_exhibicion", label: "Una sola exhibición", description: "Pago total al firmar o al entregar" },
  { value: "parcialidades", label: "En parcialidades", description: "Pagos fraccionados según calendario" },
  { value: "otro", label: "Otro", description: "Condiciones de pago personalizadas" },
];

const FECHA_FIN_OPTIONS: { value: FechaFinVigencia["tipo"]; label: string; description: string }[] = [
  { value: "fecha_exacta", label: "Fecha exacta", description: "Día específico de terminación" },
  { value: "indefinido", label: "Por tiempo indefinido", description: "Sin fecha de fin definida" },
  { value: "hasta_terminar", label: "Hasta terminar", description: "Termina al cumplir el objeto" },
  { value: "personalizado", label: "Otro (especificar)", description: "Texto libre para casos especiales" },
];

const ESTADOS_MEXICO = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua",
  "Ciudad de México", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "México", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla",
  "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas",
  "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas",
];

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialParte = (): Parte => ({
  nombre: "",
  esEmpresa: false,
  representante: "",
  domicilio: "",
});

const initialFechaFin = (): FechaFinVigencia => ({
  tipo: "fecha_exacta",
  fechaExacta: "",
  textoPersonalizado: "",
});

const initialClausulasEstandar = (): ClausulasEstandarSeleccionadas => ({
  responsabilidadLaboral: true,
  facturacionFiscal: true,
  confidencialidad: true,
  penalizaciones: true,
  fuerzaMayor: true,
  terminacionAnticipada: true,
  notificaciones: true,
  noCompetencia: false,
  propiedadIntelectual: false,
});

const initialFirmas = (): Firmas => ({
  imagenA: undefined,
  imagenB: undefined,
  textoFirmaA: undefined,
  textoFirmaB: undefined,
});

const initialInput = (): ContractInput => ({
  tipoContrato: "venta",
  parteA: initialParte(),
  parteB: initialParte(),
  objetoDescripcion: "",
  // Usar fecha fija para evitar mismatch de hidratación SSR/Cliente
  // Se actualizará a fecha real en useEffect client-side
  fechaElaboracion: "",
  fechaInicioVigencia: "",
  fechaFinVigencia: initialFechaFin(),
  montoTotal: 0,
  iva: "incluido",
  tipoPago: "una_exhibicion",
  condicionesPago: undefined,
  metodoPago: undefined,
  jurisdiccion: "",
  clausulasUsuario: [],
  clausulasEstandar: initialClausulasEstandar(),
  firmas: initialFirmas(),
  creadoEn: "",
  actualizadoEn: "",
});

// ============================================================================
// HOOK PARA PERSISTENCIA LOCALSTORAGE (ENVELOPE)
// ============================================================================

function emptyDraft(): WizardDraft {
  return {
    currentStep: 1,
    input: initialInput(),
    generatedContract: null,
    showPreview: false,
    savedAt: new Date().toISOString(),
  };
}

function clampStep(step: unknown): number {
  const n = typeof step === "number" ? step : Number(step);
  if (!Number.isFinite(n)) return 1;
  return Math.min(TOTAL_STEPS, Math.max(1, Math.round(n)));
}

function isQuotaExceeded(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false;
  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22
  );
}

function stripSignatureImages(input: ContractInput): ContractInput {
  return {
    ...input,
    firmas: {
      ...input.firmas,
      imagenA: undefined,
      imagenB: undefined,
    },
  };
}

function parseStoredDraft(raw: string): WizardDraft {
  const parsed = JSON.parse(raw);

  // Envelope nuevo
  if (
    parsed &&
    typeof parsed === "object" &&
    parsed.input &&
    typeof parsed.input === "object" &&
    parsed.input.tipoContrato &&
    parsed.input.parteA &&
    parsed.input.parteB
  ) {
    const generated = parsed.generatedContract ?? null;
    return {
      currentStep: clampStep(parsed.currentStep),
      input: { ...initialInput(), ...parsed.input },
      generatedContract: generated,
      showPreview: Boolean(parsed.showPreview && generated),
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
      signaturesOmitted: Boolean(parsed.signaturesOmitted),
    };
  }

  // Formato legacy: ContractInput plano
  if (parsed?.tipoContrato && parsed?.parteA && parsed?.parteB) {
    return {
      currentStep: 1,
      input: { ...initialInput(), ...parsed },
      generatedContract: null,
      showPreview: false,
      savedAt: new Date().toISOString(),
    };
  }

  return emptyDraft();
}

function loadInitialDraft(): WizardDraft {
  if (typeof window === "undefined") return emptyDraft();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return parseStoredDraft(stored);
  } catch (e) {
    console.warn("Error cargando wizard:", e);
  }
  return emptyDraft();
}

function useContractWizardStorage() {
  // Siempre el mismo estado inicial en server y client (evita hydration mismatch).
  // localStorage se restaura en useEffect después del mount.
  const [draft, setDraft] = useState<WizardDraft>(() => emptyDraft());
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadInitialDraft();
    const today = new Date().toISOString().split("T")[0];
    const nowISO = new Date().toISOString();
    const hydrated: WizardDraft = {
      ...loaded,
      input: {
        ...loaded.input,
        fechaElaboracion: loaded.input.fechaElaboracion || today,
        fechaInicioVigencia: loaded.input.fechaInicioVigencia || today,
        creadoEn: loaded.input.creadoEn || nowISO,
        actualizadoEn: loaded.input.actualizadoEn || nowISO,
      },
    };
    setDraft(hydrated);
    if (hydrated.signaturesOmitted) {
      setStorageWarning(
        "El borrador se guardó sin imágenes de firma (límite del navegador)."
      );
    }
    readyRef.current = true;
    setReady(true);
  }, []);

  const persistDraft = useCallback((next: WizardDraft): WizardDraft => {
    if (typeof window === "undefined" || !readyRef.current) return next;

    const withTimestamp: WizardDraft = {
      ...next,
      savedAt: new Date().toISOString(),
      input: {
        ...next.input,
        actualizadoEn: new Date().toISOString(),
      },
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(withTimestamp));
      setStorageError(null);
      if (!withTimestamp.signaturesOmitted) {
        setStorageWarning(null);
      }
      return withTimestamp;
    } catch (e) {
      if (isQuotaExceeded(e)) {
        const stripped: WizardDraft = {
          ...withTimestamp,
          input: stripSignatureImages(withTimestamp.input),
          signaturesOmitted: true,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
          setStorageError(null);
          setStorageWarning(
            "El borrador se guardó sin imágenes de firma (límite del navegador)."
          );
          return stripped;
        } catch (e2) {
          console.warn("Error guardando wizard (sin firmas):", e2);
          setStorageError(
            "No se pudo guardar el borrador: el almacenamiento del navegador está lleno."
          );
          return withTimestamp;
        }
      }
      console.warn("Error guardando wizard:", e);
      setStorageError("No se pudo guardar el borrador en este navegador.");
      return withTimestamp;
    }
  }, []);

  const updateDraft = useCallback(
    (updater: (prev: WizardDraft) => WizardDraft) => {
      setDraft(prev => {
        const next = updater(prev);
        if (!readyRef.current) return next;
        return persistDraft(next);
      });
    },
    [persistDraft]
  );

  const setInput = useCallback(
    (updater: (prev: ContractInput) => ContractInput) => {
      updateDraft(prev => ({
        ...prev,
        input: updater(prev.input),
        signaturesOmitted: false,
      }));
    },
    [updateDraft]
  );

  const setCurrentStep = useCallback(
    (step: number | ((prev: number) => number)) => {
      updateDraft(prev => ({
        ...prev,
        currentStep: clampStep(
          typeof step === "function" ? step(prev.currentStep) : step
        ),
      }));
    },
    [updateDraft]
  );

  const setGeneratedContract = useCallback(
    (contract: ContractGenerated | null | ((prev: ContractGenerated | null) => ContractGenerated | null)) => {
      updateDraft(prev => ({
        ...prev,
        generatedContract:
          typeof contract === "function" ? contract(prev.generatedContract) : contract,
      }));
    },
    [updateDraft]
  );

  const setShowPreview = useCallback(
    (show: boolean | ((prev: boolean) => boolean)) => {
      updateDraft(prev => ({
        ...prev,
        showPreview: typeof show === "function" ? show(prev.showPreview) : show,
      }));
    },
    [updateDraft]
  );

  const clearStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    const today = new Date().toISOString().split("T")[0];
    const nowISO = new Date().toISOString();
    const fresh = emptyDraft();
    fresh.input = {
      ...fresh.input,
      fechaElaboracion: today,
      fechaInicioVigencia: today,
      creadoEn: nowISO,
      actualizadoEn: nowISO,
    };
    setDraft(fresh);
    setStorageWarning(null);
    setStorageError(null);
  }, []);

  const dismissStorageWarning = useCallback(() => setStorageWarning(null), []);
  const dismissStorageError = useCallback(() => setStorageError(null), []);

  const patchDraft = useCallback(
    (partial: Partial<WizardDraft>) => {
      updateDraft(prev => ({ ...prev, ...partial }));
    },
    [updateDraft]
  );

  return {
    ready,
    input: draft.input,
    setInput,
    currentStep: draft.currentStep,
    setCurrentStep,
    generatedContract: draft.generatedContract,
    setGeneratedContract,
    showPreview: draft.showPreview,
    setShowPreview,
    patchDraft,
    clearStorage,
    storageWarning,
    storageError,
    dismissStorageWarning,
    dismissStorageError,
  };
}

// ============================================================================
// HELPER
// ============================================================================

function formatCurrencyForPDF(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);
}

// ============================================================================
// COMPONENTE PRINCIPAL: CONTRACT WIZARD
// ============================================================================

export default function ContractWizard() {
  const {
    ready,
    input,
    setInput,
    currentStep,
    setCurrentStep,
    generatedContract,
    setGeneratedContract,
    showPreview,
    patchDraft,
    clearStorage,
    storageWarning,
    storageError,
    dismissStorageWarning,
    dismissStorageError,
  } = useContractWizardStorage();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generationInput, setGenerationInput] = useState<ContractInput | null>(null);

  // Validar paso actual - retorna errores (no setea estado)
  const getValidationErrors = useCallback((step: number): Record<string, string> => {
    const errors: Record<string, string> = {};

    // No validar hasta restaurar borrador del cliente
    if (!ready) return errors;
    
    switch (step) {
      case 1:
        if (!input.tipoContrato) errors.tipoContrato = "Selecciona un tipo de contrato";
        if (!input.parteA.nombre.trim()) errors["parteA.nombre"] = "Nombre de la Parte A es requerido";
        if (!input.parteA.domicilio.trim()) errors["parteA.domicilio"] = "Domicilio de la Parte A es requerido";
        if (input.parteA.esEmpresa && !input.parteA.representante?.trim()) {
          errors["parteA.representante"] = "Representante legal requerido para empresa";
        }
        if (!input.parteB.nombre.trim()) errors["parteB.nombre"] = "Nombre de la Parte B es requerido";
        if (!input.parteB.domicilio.trim()) errors["parteB.domicilio"] = "Domicilio de la Parte B es requerido";
        if (input.parteB.esEmpresa && !input.parteB.representante?.trim()) {
          errors["parteB.representante"] = "Representante legal requerido para empresa";
        }
        break;
      case 2:
        if (!input.objetoDescripcion.trim() || input.objetoDescripcion.length < 20) {
          errors.objetoDescripcion = "Describe el objeto con al menos 20 caracteres";
        }
        if (!input.fechaElaboracion) errors.fechaElaboracion = "Fecha de elaboración requerida";
        if (!input.fechaInicioVigencia) errors.fechaInicioVigencia = "Fecha de inicio requerida";
        if (input.fechaFinVigencia.tipo === "fecha_exacta" && !input.fechaFinVigencia.fechaExacta) {
          errors["fechaFinVigencia.fechaExacta"] = "Fecha exacta requerida";
        }
        if (input.fechaFinVigencia.tipo === "personalizado" && !input.fechaFinVigencia.textoPersonalizado?.trim()) {
          errors["fechaFinVigencia.textoPersonalizado"] = "Texto personalizado requerido";
        }
        break;
      case 3:
        if (!input.montoTotal || input.montoTotal <= 0) errors.montoTotal = "Monto debe ser mayor a 0";
        if (input.tipoPago === "parcialidades" && !input.condicionesPago?.trim()) {
          errors.condicionesPago = "Condiciones de pago requeridas para parcialidades";
        }
        if (input.tipoPago === "otro" && !input.condicionesPago?.trim()) {
          errors.condicionesPago = "Condiciones de pago requeridas para tipo 'otro'";
        }
        break;
      case 4:
        if (!input.jurisdiccion.trim()) errors.jurisdiccion = "Jurisdicción (ciudad/estado) es requerida";
        break;
    }
    
    return errors;
  }, [input, ready]);

  // Versión que acepta input específico (para validar inputToSend en handleGenerate)
  const getValidationErrorsForInput = useCallback((inputToValidate: ContractInput, step: number): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!ready) return errors;
    
    switch (step) {
      case 1:
        if (!inputToValidate.tipoContrato) errors.tipoContrato = "Selecciona un tipo de contrato";
        if (!inputToValidate.parteA.nombre.trim()) errors["parteA.nombre"] = "Nombre de la Parte A es requerido";
        if (!inputToValidate.parteA.domicilio.trim()) errors["parteA.domicilio"] = "Domicilio de la Parte A es requerido";
        if (inputToValidate.parteA.esEmpresa && !inputToValidate.parteA.representante?.trim()) {
          errors["parteA.representante"] = "Representante legal requerido para empresa";
        }
        if (!inputToValidate.parteB.nombre.trim()) errors["parteB.nombre"] = "Nombre de la Parte B es requerido";
        if (!inputToValidate.parteB.domicilio.trim()) errors["parteB.domicilio"] = "Domicilio de la Parte B es requerido";
        if (inputToValidate.parteB.esEmpresa && !inputToValidate.parteB.representante?.trim()) {
          errors["parteB.representante"] = "Representante legal requerido para empresa";
        }
        break;
      case 2:
        if (!inputToValidate.objetoDescripcion.trim() || inputToValidate.objetoDescripcion.length < 20) {
          errors.objetoDescripcion = "Describe el objeto con al menos 20 caracteres";
        }
        if (!inputToValidate.fechaElaboracion) errors.fechaElaboracion = "Fecha de elaboración requerida";
        if (!inputToValidate.fechaInicioVigencia) errors.fechaInicioVigencia = "Fecha de inicio requerida";
        if (inputToValidate.fechaFinVigencia.tipo === "fecha_exacta" && !inputToValidate.fechaFinVigencia.fechaExacta) {
          errors["fechaFinVigencia.fechaExacta"] = "Fecha exacta requerida";
        }
        if (inputToValidate.fechaFinVigencia.tipo === "personalizado" && !inputToValidate.fechaFinVigencia.textoPersonalizado?.trim()) {
          errors["fechaFinVigencia.textoPersonalizado"] = "Texto personalizado requerido";
        }
        break;
      case 3:
        if (!inputToValidate.montoTotal || inputToValidate.montoTotal <= 0) errors.montoTotal = "Monto debe ser mayor a 0";
        if (inputToValidate.tipoPago === "parcialidades" && !inputToValidate.condicionesPago?.trim()) {
          errors.condicionesPago = "Condiciones de pago requeridas para parcialidades";
        }
        if (inputToValidate.tipoPago === "otro" && !inputToValidate.condicionesPago?.trim()) {
          errors.condicionesPago = "Condiciones de pago requeridas para tipo 'otro'";
        }
        break;
      case 4:
        if (!inputToValidate.jurisdiccion.trim()) errors.jurisdiccion = "Jurisdicción (ciudad/estado) es requerida";
        break;
    }
    
    return errors;
  }, [ready]);

  // Sincronizar validationErrors cuando cambian input o currentStep
  useEffect(() => {
    if (!ready) return;
    const errors = getValidationErrors(currentStep);
    setValidationErrors(errors);
  }, [ready, currentStep, getValidationErrors]);

  const canGoNext = Object.keys(getValidationErrors(currentStep)).length === 0;

  const goNext = () => {
    if (currentStep < TOTAL_STEPS && canGoNext) {
      setCurrentStep(s => s + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
    }
  };

  const handleGenerate = async () => {
    console.log("[Wizard] handleGenerate called");
    
    // Helper: validar formato estricto YYYY-MM-DD
    const isValidDate = (dateStr: string): boolean => {
      return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
    };
    
    // Asegurar que las fechas estén pobladas y tengan formato válido PRIMERO
    const today = new Date().toISOString().split("T")[0];
    const nowISO = new Date().toISOString();
    const inputToSend = {
      ...input,
      fechaElaboracion: isValidDate(input.fechaElaboracion) ? input.fechaElaboracion : today,
      fechaInicioVigencia: isValidDate(input.fechaInicioVigencia) ? input.fechaInicioVigencia : today,
      creadoEn: input.creadoEn || nowISO,
      actualizadoEn: nowISO,
    };
    
    console.log("[Wizard] Input to send:", JSON.stringify(inputToSend, null, 2));
    
    // Validar TODOS los pasos usando inputToSend (con fechas corregidas)
    const allErrors: Record<string, string> = {};
    for (let step = 1; step <= TOTAL_STEPS; step++) {
      const stepErrors = getValidationErrorsForInput(inputToSend, step);
      Object.assign(allErrors, stepErrors);
    }
    
    console.log("[Wizard] Validation errors:", allErrors);
    
    if (Object.keys(allErrors).length > 0) {
      console.log("[Wizard] Validation failed, showing errors");
      setValidationErrors(allErrors);
      setCurrentStep(Object.keys(allErrors).some(k => k.includes("fecha")) ? 2 : 
                    Object.keys(allErrors).some(k => k.includes("parte")) ? 1 :
                    Object.keys(allErrors).some(k => k.includes("objeto")) ? 2 :
                    Object.keys(allErrors).some(k => k.includes("monto") || k.includes("condiciones")) ? 3 :
                    Object.keys(allErrors).some(k => k.includes("jurisdiccion")) ? 4 : 1);
      return;
    }
    
    console.log("[Wizard] Starting generation via AIGenerationLoader (streaming)...");
    // Guardar input corregido para que AIGenerationLoader lo use
    setGenerationInput(inputToSend);
    setIsGenerating(true);
    setGenerationError(null);
  };

  const handleRegenerate = () => {
    patchDraft({
      generatedContract: null,
      showPreview: false,
      currentStep: 4,
    });
  };

  const handleBackToEdit = () => {
    patchDraft({
      showPreview: false,
      currentStep: 4,
    });
  };

  const handleCreateAnother = () => {
    clearStorage();
    setIsGenerating(false);
    setGenerationError(null);
    setValidationErrors({});
    setGenerationInput(null);
  };

  const handleGenerationComplete = (contract: ContractGenerated) => {
    patchDraft({
      generatedContract: contract,
      showPreview: true,
    });
    setIsGenerating(false);
    setGenerationError(null);
  };

  const handleGenerationError = (error: string) => {
    setGenerationError(error);
    setIsGenerating(false);
  };

  const handleStartOver = () => {
    const ok = window.confirm(
      "¿Empezar de nuevo? Se borrará el borrador guardado en este navegador (datos del formulario y contrato generado)."
    );
    if (!ok) return;
    clearStorage();
    setIsGenerating(false);
    setGenerationError(null);
    setValidationErrors({});
    setGenerationInput(null);
  };

  // Evitar mismatch: no renderizar wizard/preview hasta restaurar localStorage
  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-gray-400">
          <Spinner className="w-8 h-8" />
          <p className="text-sm">Cargando borrador...</p>
        </div>
      </div>
    );
  }

  // Renderizado condicional según estado
  if (showPreview && generatedContract) {
    return (
      <ContractPreviewV2
        contract={generatedContract}
        input={input}
        onBack={handleBackToEdit}
        onRegenerate={handleRegenerate}
        onContractUpdate={setGeneratedContract}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  if (isGenerating) {
    return (
      <AIGenerationLoader
        onComplete={handleGenerationComplete}
        onError={handleGenerationError}
        input={generationInput || input}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Header con progreso */}
      <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Generador de Contratos con IA
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Button
                color="light"
                size="sm"
                onClick={handleStartOver}
                className="border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300"
              >
                <FaTrash className="sm:mr-1.5" />
                <span className="hidden sm:inline">Empezar de nuevo</span>
              </Button>
              <div className="text-sm text-slate-500 dark:text-gray-400">
                Paso {currentStep} de {TOTAL_STEPS}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(step => (
              <div
                key={step}
                className={`absolute top-0 h-full transition-all duration-300 ${
                  step < currentStep ? "bg-emerald-500" : step === currentStep ? "bg-blue-500" : "bg-slate-200 dark:bg-gray-700"
                }`}
                style={{ width: `${(100 / TOTAL_STEPS) * step}%`, left: `${(100 / TOTAL_STEPS) * (step - 1)}%` }}
              />
            ))}
          </div>

          {/* Step labels */}
          <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-gray-400">
            {["1. Partes", "2. Objeto y Fechas", "3. Pago", "4. Cláusulas", "5. Firmas y Generar"].map((label, i) => (
              <span
                key={i}
                className={`w-1/5 text-center ${i + 1 === currentStep ? "font-semibold text-blue-600 dark:text-blue-400" : ""}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {storageError && (
          <Alert color="failure" className="mb-6" onDismiss={dismissStorageError}>
            <FaExclamationTriangle className="mr-2" />
            <span>{storageError}</span>
          </Alert>
        )}

        {storageWarning && (
          <Alert color="warning" className="mb-6" onDismiss={dismissStorageWarning}>
            <FaExclamationTriangle className="mr-2" />
            <span>{storageWarning}</span>
          </Alert>
        )}

        {/* Alert de error de generación */}
        {generationError && (
          <Alert color="failure" className="mb-6" onDismiss={() => setGenerationError(null)}>
            <FaExclamationTriangle className="mr-2" />
            <span>Error: {generationError}</span>
          </Alert>
        )}

        {/* Alert de validación */}
        {Object.keys(validationErrors).length > 0 && (
          <Alert color="warning" className="mb-6">
            <FaExclamationTriangle className="mr-2" />
            <span>Completa los campos marcados en rojo para continuar</span>
          </Alert>
        )}

        {/* Wizard Steps */}
        <form className="space-y-6" onSubmit={e => e.preventDefault()}>
          {currentStep === 1 && <Step1_Partes input={input} setInput={setInput} errors={validationErrors} />}
          {currentStep === 2 && <Step2_ObjetoFechas input={input} setInput={setInput} errors={validationErrors} />}
          {currentStep === 3 && <Step3_Pago input={input} setInput={setInput} errors={validationErrors} />}
          {currentStep === 4 && <Step4_Clausulas input={input} setInput={setInput} errors={validationErrors} />}
          {currentStep === 5 && <Step5_FirmasGenerar input={input} setInput={setInput} onGenerate={handleGenerate} isGenerating={isGenerating} />}

          {/* Navegación */}
          {!showPreview && !isGenerating && (
            <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                color="link"
                onClick={goPrev}
                disabled={currentStep === 1}
                className="hidden sm:block"
              >
                <FaArrowLeft className="mr-2" /> Anterior
              </Button>
              <div className="flex-1" />
              {currentStep < TOTAL_STEPS ? (
                <Button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext}
                  className="ml-auto"
                >
                  Siguiente <FaArrowRight className="ml-2" />
                </Button>
              ) : null}
            </div>
          )}
        </form>

        {/* Mobile nav */}
        {!showPreview && !isGenerating && (
          <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between">
            <Button color="link" onClick={goPrev} disabled={currentStep === 1}>
              <FaArrowLeft /> Anterior
            </Button>
            {currentStep < TOTAL_STEPS && (
              <Button onClick={goNext} disabled={!canGoNext}>
                Siguiente <FaArrowRight />
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Type for setInput updater function
type SetInputFn = (updater: (prev: ContractInput) => ContractInput) => void;

// ============================================================================
// STEP 1: PARTES
// ============================================================================

function Step1_Partes({ input, setInput, errors }: { input: ContractInput; setInput: SetInputFn; errors: Record<string, string> }) {
  return (
    <Card className="space-y-6">
      <div className="flex items-center gap-3">
        <FaUser className="text-blue-600 text-2xl" />
        <h2 className="text-xl font-semibold">1. Datos de las Partes</h2>
      </div>

      {/* Tipo de contrato */}
      <div>
        <Label value="Tipo de Contrato *" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {TIPO_CONTRATO_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`relative cursor-pointer p-4 border-2 rounded-lg transition-all ${
                input.tipoContrato === opt.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="tipoContrato"
                value={opt.value}
                checked={input.tipoContrato === opt.value}
                onChange={e => setInput(prev => ({ ...prev, tipoContrato: e.target.value as TipoContrato }))}
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <span className="text-3xl">{opt.icon}</span>
                <div>
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{opt.description}</p>
                </div>
              </div>
              {input.tipoContrato === opt.value && (
                <FaCheckCircle className="absolute top-2 right-2 text-blue-500" />
              )}
            </label>
          ))}
        </div>
        {errors.tipoContrato && <p className="mt-1 text-sm text-red-500">{errors.tipoContrato}</p>}
      </div>

      {/* Parte A y B en grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {["parteA", "parteB"].map((parteKey, idx) => {
          const parte = input[parteKey as "parteA" | "parteB"];
          const term = idx === 0 ? "VENDEDOR/ARRENDADOR/PRESTADOR" : "COMPRADOR/ARRENDATARIO/CLIENTE";
          const IconComponent = idx === 0 ? FaUser : FaBuilding;
          
          return (
            <div key={parteKey} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <IconComponent className="text-gray-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {idx === 0 ? "Parte A" : "Parte B"} ({term})
                </h3>
              </div>

              <div>
                <Label htmlFor={`${parteKey}-nombre`} value="Nombre / Razón Social *" />
                <TextInput
                  id={`${parteKey}-nombre`}
                  value={parte.nombre}
                  onChange={e => setInput(prev => ({
                    ...prev,
                    [parteKey]: { ...prev[parteKey as "parteA"], nombre: e.target.value }
                  }))}
                  placeholder={idx === 0 ? "Ej: Juan Pérez López" : "Ej: María González Ruiz"}
                  className={errors[`${parteKey}.nombre`] ? "border-red-500" : ""}
                />
                {errors[`${parteKey}.nombre`] && <p className="mt-1 text-sm text-red-500">{errors[`${parteKey}.nombre`]}</p>}
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id={`${parteKey}-empresa`}
                  checked={parte.esEmpresa}
                  onChange={e => setInput(prev => ({
                    ...prev,
                    [parteKey]: { ...prev[parteKey as "parteA"], esEmpresa: e.target.checked }
                  }))}
                />
                <Label htmlFor={`${parteKey}-empresa`} className="cursor-pointer mb-0">
                  Es una empresa / persona moral
                </Label>
              </div>

              {parte.esEmpresa && (
                <div>
                  <Label htmlFor={`${parteKey}-rep`} value="Representante Legal *" />
                  <TextInput
                    id={`${parteKey}-rep`}
                    value={parte.representante || ""}
                    onChange={e => setInput(prev => ({
                      ...prev,
                      [parteKey]: { ...prev[parteKey as "parteA"], representante: e.target.value }
                    }))}
                    placeholder="Nombre del representante legal"
                    className={errors[`${parteKey}.representante`] ? "border-red-500" : ""}
                  />
                  {errors[`${parteKey}.representante`] && <p className="mt-1 text-sm text-red-500">{errors[`${parteKey}.representante`]}</p>}
                </div>
              )}

              <div>
                <Label htmlFor={`${parteKey}-dom`} value="Domicilio Completo *" />
                <Textarea
                  id={`${parteKey}-dom`}
                  value={parte.domicilio}
                  onChange={e => setInput(prev => ({
                    ...prev,
                    [parteKey]: { ...prev[parteKey as "parteA"], domicilio: e.target.value }
                  }))}
                  placeholder="Calle, número, colonia, ciudad, estado, CP"
                  rows={3}
                  className={errors[`${parteKey}.domicilio`] ? "border-red-500" : ""}
                />
                {errors[`${parteKey}.domicilio`] && <p className="mt-1 text-sm text-red-500">{errors[`${parteKey}.domicilio`]}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================================
// STEP 2: OBJETO Y FECHAS
// ============================================================================

function Step2_ObjetoFechas({ input, setInput, errors }: { input: ContractInput; setInput: SetInputFn; errors: Record<string, string> }) {
  return (
    <Card className="space-y-6">
      <div className="flex items-center gap-3">
        <FaFileContract className="text-blue-600 text-2xl" />
        <h2 className="text-xl font-semibold">2. Objeto del Contrato y Fechas</h2>
      </div>

      {/* Objeto */}
      <div>
        <Label htmlFor="objeto" value="Descripción del Objeto *" />
        <Textarea
          id="objeto"
          value={input.objetoDescripcion}
          onChange={e => setInput(prev => ({ ...prev, objetoDescripcion: e.target.value }))}
          placeholder={OBJETO_PLACEHOLDER}
          rows={4}
          className={errors.objetoDescripcion ? "border-red-500" : ""}
        />
        {errors.objetoDescripcion && <p className="mt-1 text-sm text-red-500">{errors.objetoDescripcion}</p>}
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Mínimo 20 caracteres. Sé específico: qué, dónde, cómo, plazos, características técnicas.
        </p>
      </div>

      {/* Fechas */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="fecha-elab" value="Fecha de Elaboración *" />
          <TextInput
            id="fecha-elab"
            type="date"
            value={input.fechaElaboracion}
            onChange={e => setInput(prev => ({ ...prev, fechaElaboracion: e.target.value }))}
            className={errors.fechaElaboracion ? "border-red-500" : ""}
            suppressHydrationWarning
          />
          {errors.fechaElaboracion && <p className="mt-1 text-sm text-red-500">{errors.fechaElaboracion}</p>}
        </div>

        <div>
          <Label htmlFor="fecha-inicio" value="Fecha Inicio Vigencia *" />
          <TextInput
            id="fecha-inicio"
            type="date"
            value={input.fechaInicioVigencia}
            onChange={e => setInput(prev => ({ ...prev, fechaInicioVigencia: e.target.value }))}
            className={errors.fechaInicioVigencia ? "border-red-500" : ""}
            suppressHydrationWarning
          />
          {errors.fechaInicioVigencia && <p className="mt-1 text-sm text-red-500">{errors.fechaInicioVigencia}</p>}
        </div>

        <div>
          <Label value="Fecha de Fin de Vigencia *" />
          <Select
            value={input.fechaFinVigencia.tipo}
            onChange={e => setInput(prev => ({
              ...prev,
              fechaFinVigencia: { ...prev.fechaFinVigencia, tipo: e.target.value as FechaFinVigencia["tipo"] }
            }))}
            className="mb-2"
          >
            {FECHA_FIN_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>

          {input.fechaFinVigencia.tipo === "fecha_exacta" && (
            <>
              <TextInput
                type="date"
                value={input.fechaFinVigencia.fechaExacta || ""}
                onChange={e => setInput(prev => ({
                  ...prev,
                  fechaFinVigencia: { ...prev.fechaFinVigencia, fechaExacta: e.target.value }
                }))}
                className={errors["fechaFinVigencia.fechaExacta"] ? "border-red-500" : ""}
                suppressHydrationWarning
              />
              {errors["fechaFinVigencia.fechaExacta"] && (
                <p className="mt-1 text-sm text-red-500">{errors["fechaFinVigencia.fechaExacta"]}</p>
              )}
            </>
          )}

          {input.fechaFinVigencia.tipo === "personalizado" && (
            <>
              <TextInput
                value={input.fechaFinVigencia.textoPersonalizado || ""}
                onChange={e => setInput(prev => ({
                  ...prev,
                  fechaFinVigencia: { ...prev.fechaFinVigencia, textoPersonalizado: e.target.value }
                }))}
                placeholder="Ej: hasta liquidación total, por tiempo indefinido, etc."
                className={errors["fechaFinVigencia.textoPersonalizado"] ? "border-red-500" : ""}
              />
              {errors["fechaFinVigencia.textoPersonalizado"] && (
                <p className="mt-1 text-sm text-red-500">{errors["fechaFinVigencia.textoPersonalizado"]}</p>
              )}
            </>
          )}

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {FECHA_FIN_OPTIONS.find(o => o.value === input.fechaFinVigencia.tipo)?.description}
          </p>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// STEP 3: PAGO
// ============================================================================

function Step3_Pago({ input, setInput, errors }: { input: ContractInput; setInput: SetInputFn; errors: Record<string, string> }) {
  return (
    <Card className="space-y-6">
      <div className="flex items-center gap-3">
        <FaMoneyBillWave className="text-blue-600 text-2xl" />
        <h2 className="text-xl font-semibold">3. Precio y Forma de Pago</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monto" value="Monto Total (MXN) *" />
          <TextInput
            id="monto"
            type="number"
            step="0.01"
            min="0.01"
            value={input.montoTotal === 0 ? "" : input.montoTotal}
            onChange={e => setInput(prev => ({ 
              ...prev, 
              montoTotal: e.target.value === "" ? 0 : (parseFloat(e.target.value) || 0) 
            }))}
            placeholder="0.00"
            className={errors.montoTotal ? "border-red-500" : ""}
          />
          {errors.montoTotal && <p className="mt-1 text-sm text-red-500">{errors.montoTotal}</p>}
        </div>

        <div>
          <Label value="IVA *" />
          <Select
            value={input.iva}
            onChange={e => setInput(prev => ({ ...prev, iva: e.target.value as IVAOption }))}
          >
            {IVA_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label value="Tipo de Pago *" />
        <div className="space-y-2 mt-2">
          {TIPO_PAGO_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                input.tipoPago === opt.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-600"
              }`}
            >
              <Radio
                name="tipoPago"
                value={opt.value}
                checked={input.tipoPago === opt.value}
                onChange={e => setInput(prev => ({ ...prev, tipoPago: e.target.value as TipoPago }))}
              />
              <div>
                <p className="font-medium">{opt.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {(input.tipoPago === "parcialidades" || input.tipoPago === "otro") && (
        <div>
          <Label htmlFor="condiciones" value="Condiciones de Pago *" />
          <Textarea
            id="condiciones"
            value={input.condicionesPago || ""}
            onChange={e => setInput(prev => ({ ...prev, condicionesPago: e.target.value }))}
            placeholder="Ej: 30% al firmar, 40% a la entrega, 30% a 30 días naturales post-entrega"
            rows={3}
            className={errors.condicionesPago ? "border-red-500" : ""}
          />
          {errors.condicionesPago && <p className="mt-1 text-sm text-red-500">{errors.condicionesPago}</p>}
        </div>
      )}

      <div>
        <Label htmlFor="metodo" value="Método de Pago" />
        <TextInput
          id="metodo"
          value={input.metodoPago || ""}
          onChange={e => setInput(prev => ({ ...prev, metodoPago: e.target.value }))}
          placeholder="Ej: Transferencia SPEI, Efectivo, Cheque, Tarjeta"
        />
      </div>
    </Card>
  );
}

// ============================================================================
// STEP 4: CLÁUSULAS
// ============================================================================

function Step4_Clausulas({ input, setInput, errors }: { input: ContractInput; setInput: SetInputFn; errors: Record<string, string> }) {
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);

  const addClause = () => {
    const newClause: ClausulaUsuario = {
      id: uuidv4(),
      textoOriginal: "",
      orden: input.clausulasUsuario.length,
      pulida: false,
    };
    setInput(prev => ({
      ...prev,
      clausulasUsuario: [...prev.clausulasUsuario, newClause],
    }));
    setEditingClauseId(newClause.id);
  };

  const removeClause = (id: string) => {
    setInput(prev => ({
      ...prev,
      clausulasUsuario: prev.clausulasUsuario.filter(c => c.id !== id),
    }));
  };

  const updateClause = (id: string, updates: Partial<ClausulaUsuario>) => {
    setInput(prev => ({
      ...prev,
      clausulasUsuario: prev.clausulasUsuario.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  };

  const handlePolish = async (clause: ClausulaUsuario) => {
    if (!clause.textoOriginal.trim()) return;
    
    try {
      const response = await fetch("/api/ai/polish-clause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clausulaTexto: clause.textoOriginal,
          contextoContrato: {
            tipoContrato: input.tipoContrato,
            parteA: input.parteA.nombre,
            parteB: input.parteB.nombre,
            objetoDescripcion: input.objetoDescripcion,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        updateClause(clause.id, { textoPulido: data.textoPulido, pulida: true });
      }
    } catch (e) {
      console.error("Error puliendo cláusula:", e);
    }
  };

  return (
    <Card className="space-y-6">
      <div className="flex items-center gap-3">
        <FaGavel className="text-blue-600 text-2xl" />
        <h2 className="text-xl font-semibold">4. Cláusulas y Jurisdicción</h2>
      </div>

      {/* Jurisdicción */}
      <div>
        <Label htmlFor="jurisdiccion" value="Jurisdicción (Ciudad/Estado) *" />
        <TextInput
          id="jurisdiccion"
          value={input.jurisdiccion}
          onChange={e => setInput(prev => ({ ...prev, jurisdiccion: e.target.value }))}
          placeholder="Ej: Ciudad de México, Guadalajara, Monterrey..."
          list="estados-mx"
          className={errors.jurisdiccion ? "border-red-500" : ""}
        />
        <datalist id="estados-mx">
          {ESTADOS_MEXICO.map(edo => <option key={edo} value={edo} />)}
        </datalist>
        {errors.jurisdiccion && <p className="mt-1 text-sm text-red-500">{errors.jurisdiccion}</p>}
      </div>

      {/* Cláusulas estándar */}
      <div className="space-y-3">
        <Label value="Cláusulas Estándar Incluidas" className="block mb-2" />
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { key: "responsabilidadLaboral", label: "Responsabilidad Laboral", desc: "Independencia de partes, no solidaridad laboral" },
            { key: "facturacionFiscal", label: "Facturación Fiscal (CFDI)", desc: "Emisión de comprobantes por cada pago" },
            { key: "confidencialidad", label: "Confidencialidad", desc: "Protección de información sensible" },
            { key: "penalizaciones", label: "Cláusula Penal", desc: "Penalizaciones por incumplimiento" },
            { key: "fuerzaMayor", label: "Fuerza Mayor", desc: "Caso fortuito y exención de responsabilidad" },
            { key: "terminacionAnticipada", label: "Terminación Anticipada", desc: "Causas y procedimiento de rescisión" },
            { key: "notificaciones", label: "Notificaciones", desc: "Domicilio para oír notificaciones" },
            { key: "noCompetencia", label: "No Competencia", desc: "Exclusividad y no competencia (servicios/obra)" },
            { key: "propiedadIntelectual", label: "Propiedad Intelectual", desc: "Titularidad de entregables (obra/servicios creativos)" },
          ].map(clause => (
            <label key={clause.key} className="flex items-start gap-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
              <Checkbox
                checked={input.clausulasEstandar[clause.key as keyof ClausulasEstandarSeleccionadas]}
                onChange={e => setInput(prev => ({
                  ...prev,
                  clausulasEstandar: { ...prev.clausulasEstandar, [clause.key]: e.target.checked }
                }))}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-sm">{clause.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{clause.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Cláusulas del usuario */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label value="Cláusulas Adicionales (Opcional)" className="mb-0" />
          <Button outline onClick={addClause} className="text-sm">
            <FaPlus className="mr-1" /> Agregar Cláusula
          </Button>
        </div>

        {input.clausulasUsuario.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <FaPen className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No hay cláusulas adicionales aún</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Agrega cláusulas específicas que requiera tu contrato</p>
          </div>
        ) : (
          <div className="space-y-3">
            {input.clausulasUsuario.map((clause, index) => (
              <ClauseEditor
                key={clause.id}
                clause={clause}
                index={index}
                isEditing={editingClauseId === clause.id}
                onEdit={() => setEditingClauseId(clause.id)}
                onSave={() => setEditingClauseId(null)}
                onRemove={() => removeClause(clause.id)}
                onPolish={handlePolish}
                updateClause={updateClause}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// STEP 5: FIRMAS Y GENERAR
// ============================================================================

function Step5_FirmasGenerar({ input, setInput, onGenerate, isGenerating }: { input: ContractInput; setInput: SetInputFn; onGenerate: () => void; isGenerating: boolean }) {
  const [previewA, setPreviewA] = useState<string | null>(
    () => input.firmas.imagenA || null
  );
  const [previewB, setPreviewB] = useState<string | null>(
    () => input.firmas.imagenB || null
  );

  useEffect(() => {
    setPreviewA(input.firmas.imagenA || null);
    setPreviewB(input.firmas.imagenB || null);
  }, [input.firmas.imagenA, input.firmas.imagenB]);

  const handleImageUpload = (field: "imagenA" | "imagenB", file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen no debe superar 2MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      if (field === "imagenA") setPreviewA(result);
      else setPreviewB(result);
      setInput(prev => ({ ...prev, firmas: { ...prev.firmas, [field]: result } }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (field: "imagenA" | "imagenB") => {
    if (field === "imagenA") setPreviewA(null);
    else setPreviewB(null);
    setInput(prev => ({ ...prev, firmas: { ...prev.firmas, [field]: undefined } }));
  };

  return (
    <Card className="space-y-6">
      <div className="flex items-center gap-3">
        <FaPen className="text-blue-600 text-2xl" />
        <h2 className="text-xl font-semibold">5. Firmas y Generar Contrato</h2>
      </div>

      {/* Firma Parte A */}
      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h3 className="font-semibold">Firma de la Parte A ({input.parteA.nombre})</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label value="Imagen de Firma" />
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="firma-a-upload"
                onChange={e => e.target.files?.[0] && handleImageUpload("imagenA", e.target.files[0])}
              />
              <label htmlFor="firma-a-upload" className="cursor-pointer flex flex-col items-center gap-2">
                {previewA ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewA} alt="Firma A" className="max-h-32 max-w-full" />
                ) : (
                  <>
                    <FaPen className="text-3xl text-gray-400" />
                    <span className="text-gray-500">Click para subir firma (PNG/JPG, máx 2MB)</span>
                  </>
                )}
              </label>
            </div>
            {previewA && (
              <Button color="link" size="sm" onClick={() => removeImage("imagenA")} className="mt-2 text-red-500">
                <FaTrash className="mr-1" /> Quitar imagen
              </Button>
            )}
          </div>

          <div>
            <Label htmlFor="texto-firma-a" value="Texto de Firma (Opcional)" />
            <TextInput
              id="texto-firma-a"
              value={input.firmas.textoFirmaA || ""}
              onChange={e => setInput(prev => ({ ...prev, firmas: { ...prev.firmas, textoFirmaA: e.target.value } }))}
              placeholder="Ej: Por [Nombre], Representante Legal"
            />
          </div>
        </div>
      </div>

      {/* Firma Parte B */}
      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h3 className="font-semibold">Firma de la Parte B ({input.parteB.nombre})</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label value="Imagen de Firma" />
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="firma-b-upload"
                onChange={e => e.target.files?.[0] && handleImageUpload("imagenB", e.target.files[0])}
              />
              <label htmlFor="firma-b-upload" className="cursor-pointer flex flex-col items-center gap-2">
                {previewB ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewB} alt="Firma B" className="max-h-32 max-w-full" />
                ) : (
                  <>
                    <FaPen className="text-3xl text-gray-400" />
                    <span className="text-gray-500">Click para subir firma (PNG/JPG, máx 2MB)</span>
                  </>
                )}
              </label>
            </div>
            {previewB && (
              <Button color="link" size="sm" onClick={() => removeImage("imagenB")} className="mt-2 text-red-500">
                <FaTrash className="mr-1" /> Quitar imagen
              </Button>
            )}
          </div>

          <div>
            <Label htmlFor="texto-firma-b" value="Texto de Firma (Opcional)" />
            <TextInput
              id="texto-firma-b"
              value={input.firmas.textoFirmaB || ""}
              onChange={e => setInput(prev => ({ ...prev, firmas: { ...prev.firmas, textoFirmaB: e.target.value } }))}
              placeholder="Ej: Por [Nombre], Representante Legal"
            />
          </div>
        </div>
      </div>

      {/* Resumen y generar */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <FaInfoCircle /> Resumen antes de generar
        </h3>
        <dl className="grid sm:grid-cols-2 gap-2 text-sm">
          <dt className="text-gray-600 dark:text-gray-400">Tipo:</dt>
          <dd className="font-medium">{TIPO_CONTRATO_OPTIONS.find(o => o.value === input.tipoContrato)?.label}</dd>
          <dt className="text-gray-600 dark:text-gray-400">Partes:</dt>
          <dd className="font-medium">{input.parteA.nombre} / {input.parteB.nombre}</dd>
          <dt className="text-gray-600 dark:text-gray-400">Monto:</dt>
          <dd className="font-medium">{formatCurrencyForPDF(input.montoTotal)} ({input.iva === "incluido" ? "IVA incl." : input.iva === "separado" ? "IVA sep." : "Exento"})</dd>
          <dt className="text-gray-600 dark:text-gray-400">Pago:</dt>
          <dd className="font-medium">{TIPO_PAGO_OPTIONS.find(o => o.value === input.tipoPago)?.label}</dd>
          <dt className="text-gray-600 dark:text-gray-400">Cláusulas extra:</dt>
          <dd className="font-medium">{input.clausulasUsuario.filter(c => c.textoOriginal).length}</dd>
          <dt className="text-gray-600 dark:text-gray-400">Jurisdicción:</dt>
          <dd className="font-medium">{input.jurisdiccion}</dd>
        </dl>
      </div>

      {/* Botón generar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end">
        <p className="text-xs text-slate-500 dark:text-gray-400 sm:mr-auto">
          Borrador automático en este navegador
        </p>
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg border-0"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <Spinner className="w-5 h-5" />
              Generando con IA...
            </span>
          ) : (
            <>
              <FaMagic className="mr-2" />
              Generar Contrato con IA
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}