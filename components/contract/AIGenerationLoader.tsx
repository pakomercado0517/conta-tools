"use client";

import { useEffect, useState, useRef } from "react";
import { Alert } from "flowbite-react";
import { FaCheck, FaExclamationTriangle, FaFileContract, FaSpinner } from "react-icons/fa";
import { ContractInput, ContractGenerated, TipoContrato } from "@/types/contract-v2";

interface AIGenerationLoaderProps {
  input: ContractInput;
  onComplete: (contract: ContractGenerated) => void;
  onError: (error: string) => void;
}

type GenerationPhase =
  | "preparing"
  | "generating"
  | "assembling"
  | "validating"
  | "complete"
  | "error";

type SSEEvent = {
  type: string;
  message?: string;
  phase?: GenerationPhase;
  percent?: number;
  content?: string;
  contract?: ContractGenerated;
  details?: string;
  error?: string;
};

const PHASES: { id: GenerationPhase; label: string }[] = [
  { id: "preparing", label: "Preparando" },
  { id: "generating", label: "Redactando" },
  { id: "assembling", label: "Ensamblando" },
  { id: "validating", label: "Validando" },
  { id: "complete", label: "Listo" },
];

const PHASE_ORDER: GenerationPhase[] = [
  "preparing",
  "generating",
  "assembling",
  "validating",
  "complete",
];

const JSON_MARKERS = [
  { key: '"titulo"', label: "Definiendo título del contrato…", floor: 18 },
  { key: '"terminologia"', label: "Estableciendo terminología de las partes…", floor: 28 },
  { key: '"declaraciones"', label: "Redactando declaraciones…", floor: 42 },
  { key: '"clausulas"', label: "Generando cláusulas…", floor: 58 },
  { key: '"firma"', label: "Cerrando leyenda de firma…", floor: 74 },
] as const;

const ESTIMATED_CHARS = 7000;
const GENERATING_MIN = 8;
const GENERATING_MAX = 82;

const TIPO_LABELS: Record<TipoContrato, string> = {
  venta: "Compraventa",
  arrendamiento: "Arrendamiento",
  servicios: "Prestación de Servicios",
  obra: "Contrato de Obra",
  mandato: "Mandato/Poder",
  personalizado: "Personalizado",
};

function phaseIndex(phase: GenerationPhase): number {
  const idx = PHASE_ORDER.indexOf(phase);
  return idx === -1 ? -1 : idx;
}

function computeGeneratingProgress(content: string): { percent: number; label: string } {
  let markerFloor = GENERATING_MIN;
  let label = "Redactando contrato con IA…";

  for (const marker of JSON_MARKERS) {
    if (content.includes(marker.key)) {
      markerFloor = marker.floor;
      label = marker.label;
    }
  }

  const sizeRatio = Math.min(content.length / ESTIMATED_CHARS, 1);
  const sizePercent = GENERATING_MIN + sizeRatio * (GENERATING_MAX - GENERATING_MIN);
  const percent = Math.min(GENERATING_MAX, Math.max(markerFloor, sizePercent));

  return { percent: Math.round(percent), label };
}

export default function AIGenerationLoader({ input, onComplete, onError }: AIGenerationLoaderProps) {
  const [phase, setPhase] = useState<GenerationPhase>("preparing");
  const [progress, setProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState("Preparando solicitud…");
  const [error, setError] = useState<string | null>(null);

  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  const progressRef = useRef(0);
  const phaseRef = useRef<GenerationPhase>("preparing");
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  const bumpProgress = (next: number) => {
    const value = Math.max(progressRef.current, Math.min(100, next));
    if (value !== progressRef.current) {
      progressRef.current = value;
      setProgress(value);
    }
  };

  const setPhaseSafe = (next: GenerationPhase) => {
    if (phaseRef.current === "complete" || phaseRef.current === "error") return;
    if (phaseIndex(next) < phaseIndex(phaseRef.current)) return;
    phaseRef.current = next;
    setPhase(next);
  };

  useEffect(() => {
    let cancelled = false;
    let completeTimeout: ReturnType<typeof setTimeout> | null = null;
    let fullContent = "";

    const fail = (message: string) => {
      if (cancelled || completedRef.current) return;
      completedRef.current = true;
      phaseRef.current = "error";
      setPhase("error");
      setError(message);
      setStatusLabel("No se pudo generar el contrato");
      onErrorRef.current(message);
    };

    const handleSSEEvent = (data: SSEEvent) => {
      if (cancelled || completedRef.current) return;

      switch (data.type) {
        case "start":
          setPhaseSafe("preparing");
          bumpProgress(5);
          setStatusLabel(data.message || "Iniciando generación…");
          break;

        case "progress": {
          const nextPhase = data.phase as GenerationPhase;
          if (nextPhase === "preparing" || nextPhase === "assembling" || nextPhase === "validating") {
            setPhaseSafe(nextPhase);
          }
          if (typeof data.percent === "number") {
            bumpProgress(data.percent);
          }
          if (data.message) {
            setStatusLabel(data.message);
          }
          break;
        }

        case "chunk":
          if (data.content) {
            fullContent += data.content;
            if (phaseRef.current === "preparing" || phaseRef.current === "generating") {
              setPhaseSafe("generating");
              const { percent, label } = computeGeneratingProgress(fullContent);
              bumpProgress(percent);
              setStatusLabel(label);
            }
          }
          break;

        case "complete":
          if (!data.contract) {
            fail("La generación terminó sin contrato");
            break;
          }
          completedRef.current = true;
          setPhaseSafe("complete");
          bumpProgress(100);
          setStatusLabel("Contrato generado exitosamente");
          {
            const contract = data.contract;
            completeTimeout = setTimeout(() => {
              if (!cancelled) {
                onCompleteRef.current(contract);
              }
            }, 400);
          }
          break;

        case "error":
          fail(data.details || data.error || "Error en la generación");
          break;
      }
    };

    const startGeneration = async () => {
      try {
        const response = await fetch("/api/ai/generate-contract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, stream: true }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || "Error en la petición");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        if (!reader) throw new Error("No se pudo leer la respuesta");

        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6)) as SSEEvent;
              handleSSEEvent(data);
            } catch {
              // Ignorar líneas no parseables
            }
          }
        }

        if (!cancelled && !completedRef.current) {
          fail("La generación terminó sin respuesta completa");
        }
      } catch (err) {
        if (!cancelled) {
          fail((err as Error).message);
        }
      }
    };

    startGeneration();

    return () => {
      cancelled = true;
      if (completeTimeout) clearTimeout(completeTimeout);
    };
    // Solo relanzar si cambia el input de generación
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const activePhaseIndex =
    phase === "error" ? phaseIndex("preparing") : Math.max(0, phaseIndex(phase));

  const tipoLabel = TIPO_LABELS[input.tipoContrato] || input.tipoContrato;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 pt-8 pb-6 sm:px-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            {phase === "error" ? (
              <FaExclamationTriangle className="text-xl" />
            ) : phase === "complete" ? (
              <FaCheck className="text-xl" />
            ) : (
              <FaFileContract className="text-xl" />
            )}
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
              {phase === "error" ? "Error al generar" : "Generando tu contrato"}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
              {tipoLabel} · {input.parteA.nombre || "Parte A"} ↔ {input.parteB.nombre || "Parte B"}
            </p>
          </div>

          {/* Stepper de fases */}
          <ol className="mb-6 flex items-start justify-between gap-1">
            {PHASES.map((item, index) => {
              const isDone =
                phase === "complete" ||
                (phase !== "error" && index < activePhaseIndex);
              const isActive =
                phase !== "error" &&
                phase !== "complete" &&
                index === activePhaseIndex;

              return (
                <li key={item.id} className="flex flex-1 flex-col items-center gap-2 min-w-0">
                  <div className="flex w-full items-center">
                    {index > 0 && (
                      <div
                        className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                          isDone || isActive
                            ? "bg-blue-600"
                            : "bg-slate-200 dark:bg-gray-600"
                        }`}
                      />
                    )}
                    <div
                      className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isDone
                          ? "border-blue-600 bg-blue-600 text-white"
                          : isActive
                            ? "border-blue-600 bg-white dark:bg-gray-800 text-blue-600"
                            : "border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-300 dark:text-gray-500"
                      }`}
                    >
                      {isDone ? (
                        <FaCheck className="text-xs" />
                      ) : isActive ? (
                        <FaSpinner className="text-xs animate-spin" />
                      ) : (
                        <span className="text-[10px] font-semibold">{index + 1}</span>
                      )}
                    </div>
                    {index < PHASES.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                          isDone ? "bg-blue-600" : "bg-slate-200 dark:bg-gray-600"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs text-center leading-tight truncate w-full px-0.5 ${
                      isDone || isActive
                        ? "text-slate-800 dark:text-gray-100 font-medium"
                        : "text-slate-400 dark:text-gray-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* Barra de progreso */}
          <div className="mb-2">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600 dark:text-gray-300 truncate">{statusLabel}</p>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                {progress}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-gray-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  phase === "error"
                    ? "bg-red-500"
                    : phase === "complete"
                      ? "bg-emerald-500"
                      : "bg-blue-600"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {phase !== "error" && phase !== "complete" && (
            <p className="mt-4 text-center text-xs text-slate-400 dark:text-gray-500">
              Esto puede tomar unos segundos. No cierres esta ventana.
            </p>
          )}

          {error && (
            <Alert color="failure" className="mt-5 text-left">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Error en la generación</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
