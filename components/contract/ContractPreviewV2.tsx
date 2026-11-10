"use client";

import { useState } from "react";
import { Button, Alert, Dropdown, DropdownItem, DropdownDivider } from "flowbite-react";
import {
  FaArrowLeft,
  FaRedo,
  FaFilePdf,
  FaCheckCircle,
  FaExclamationTriangle,
  FaComments,
  FaTimes,
  FaEllipsisH,
  FaEdit,
} from "react-icons/fa";
import { ContractGenerated, ContractInput, TipoContrato } from "@/types/contract-v2";
import ContractPDFGeneratorV2 from "./ContractPDFGeneratorV2";
import ContractChat from "./ContractChat";

interface ContractPreviewV2Props {
  contract: ContractGenerated;
  input: ContractInput;
  onBack: () => void;
  onRegenerate: () => void;
  onContractUpdate: (contract: ContractGenerated) => void;
  onCreateAnother: () => void;
}

const TIPO_LABELS: Record<TipoContrato, string> = {
  venta: "Compraventa",
  arrendamiento: "Arrendamiento",
  servicios: "Servicios",
  obra: "Obra",
  mandato: "Mandato",
  personalizado: "Personalizado",
};

export default function ContractPreviewV2({
  contract,
  input,
  onBack,
  onRegenerate,
  onContractUpdate,
  onCreateAnother,
}: ContractPreviewV2Props) {
  const term = {
    parteA: input.parteA.nombre,
    parteB: input.parteB.nombre,
  };

  const warnings = contract.warnings || [];
  const [chatOpen, setChatOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleContractUpdate = (newContract: ContractGenerated) => {
    onContractUpdate(newContract);
  };

  const tipoLabel = TIPO_LABELS[contract.tipoContrato] || contract.tipoContrato;

  const renderContractContent = (currentContract: ContractGenerated) => (
    <>
      <header className="text-center mb-10 pb-6 border-b border-slate-200 dark:border-gray-700">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {currentContract.titulo}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-gray-400">
          Celebrado en {currentContract.firma.ciudad} a {currentContract.firma.fechaEnLetras}
        </p>
      </header>

      <section className="mb-8 text-justify leading-relaxed">
        <p className="mb-4">
          En <strong>{currentContract.firma.ciudad}</strong>, a{" "}
          <strong>{currentContract.firma.fechaEnLetras}</strong>, se celebra el presente{" "}
          <strong>{currentContract.titulo}</strong> entre{" "}
          <strong>{currentContract.terminologia.parteA}</strong>, <strong>{term.parteA}</strong>
          {input.parteA.esEmpresa && input.parteA.representante && (
            <>
              , representado por <strong>{input.parteA.representante}</strong>
            </>
          )}
          , con domicilio en <strong>{input.parteA.domicilio}</strong>, y{" "}
          <strong>{currentContract.terminologia.parteB}</strong>, <strong>{term.parteB}</strong>
          {input.parteB.esEmpresa && input.parteB.representante && (
            <>
              , representado por <strong>{input.parteB.representante}</strong>
            </>
          )}
          , con domicilio en <strong>{input.parteB.domicilio}</strong>, a quienes en lo sucesivo se
          les denominará conjunta e indistintamente como <strong>&quot;LAS PARTES&quot;</strong>, al
          tenor de las siguientes declaraciones y cláusulas:
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-center mb-6 text-slate-900 dark:text-white border-b border-slate-300 dark:border-gray-600 pb-2">
          DECLARACIONES
        </h2>

        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="font-semibold mb-3">
              I. DECLARA <strong>{currentContract.terminologia.parteA}</strong>
              {input.parteA.esEmpresa ? " POR CONDUCTO DE SU REPRESENTANTE LEGAL" : ""}:
            </p>
            <ol className="list-[upper-alpha.] space-y-2 ml-4">
              {currentContract.declaraciones.parteA.map((item, i) => (
                <li key={i} className="text-justify leading-relaxed">
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <div className="border-l-4 border-emerald-500 pl-4">
            <p className="font-semibold mb-3">
              II. DECLARA <strong>{currentContract.terminologia.parteB}</strong>
              {input.parteB.esEmpresa ? " POR CONDUCTO DE SU REPRESENTANTE LEGAL" : ""}:
            </p>
            <ol className="list-[upper-alpha.] space-y-2 ml-4">
              {currentContract.declaraciones.parteB.map((item, i) => (
                <li key={i} className="text-justify leading-relaxed">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p className="mt-6 text-center text-justify leading-relaxed">
          De conformidad con las declaraciones anteriores, las Partes convienen en otorgar las
          siguientes:
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-center mb-6 text-slate-900 dark:text-white border-b border-slate-300 dark:border-gray-600 pb-2">
          CLÁUSULAS
        </h2>

        <div className="space-y-6">
          {currentContract.clausulas.map((clausula, index) => (
            <div
              key={index}
              className="border-l-4 border-slate-300 dark:border-gray-600 pl-4 pb-6 last:pb-0"
            >
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 flex-wrap">
                <span className="text-blue-600 dark:text-blue-400">{clausula.numeroRomano}.</span>
                <span className="uppercase">{clausula.titulo}</span>
                {(clausula.fuente === "ia-usuario" || clausula.fuente === "usuario") && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                    {clausula.fuente === "ia-usuario" ? "Usuario (pulida)" : "Usuario"}
                  </span>
                )}
                {!clausula.esObligatoria && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400">
                    Opcional
                  </span>
                )}
              </h3>
              <div className="text-justify leading-relaxed whitespace-pre-line ml-6">
                {clausula.contenido}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 pt-8 border-t border-slate-200 dark:border-gray-700">
        <p className="text-center text-justify leading-relaxed mb-10">
          {currentContract.firma.leyendaCompleta}
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="text-center space-y-4">
            <p className="font-bold uppercase tracking-wide">
              {currentContract.terminologia.parteB}
            </p>
            {input.firmas.imagenB && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={input.firmas.imagenB}
                alt={`Firma ${term.parteB}`}
                className="mx-auto max-h-20 max-w-xs border border-slate-300 dark:border-gray-600 p-2"
              />
            )}
            <div className="h-16 flex items-end justify-center">
              <div className="w-64 border-b border-slate-600" />
            </div>
            <p className="font-bold text-sm">{term.parteB.toUpperCase()}</p>
            {input.parteB.esEmpresa && input.parteB.representante && (
              <>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  {input.parteB.representante.toUpperCase()}
                </p>
                <p className="text-xs text-slate-400 dark:text-gray-500">Representante Legal</p>
              </>
            )}
            {input.firmas.textoFirmaB && (
              <p className="text-xs text-slate-500 dark:text-gray-400 italic mt-1">
                {input.firmas.textoFirmaB}
              </p>
            )}
          </div>

          <div className="text-center space-y-4">
            <p className="font-bold uppercase tracking-wide">
              {currentContract.terminologia.parteA}
            </p>
            {input.firmas.imagenA && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={input.firmas.imagenA}
                alt={`Firma ${term.parteA}`}
                className="mx-auto max-h-20 max-w-xs border border-slate-300 dark:border-gray-600 p-2"
              />
            )}
            <div className="h-16 flex items-end justify-center">
              <div className="w-64 border-b border-slate-600" />
            </div>
            <p className="font-bold text-sm">{term.parteA.toUpperCase()}</p>
            {input.parteA.esEmpresa && input.parteA.representante && (
              <>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  {input.parteA.representante.toUpperCase()}
                </p>
                <p className="text-xs text-slate-400 dark:text-gray-500">Representante Legal</p>
              </>
            )}
            {input.firmas.textoFirmaA && (
              <p className="text-xs text-slate-500 dark:text-gray-400 italic mt-1">
                {input.firmas.textoFirmaA}
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );

  const moreMenu = (
    <Dropdown
      arrowIcon={false}
      inline
      label={
        <span className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
          <FaEllipsisH className="h-4 w-4" />
          <span className="sr-only">Más opciones</span>
        </span>
      }
    >
      <div className="min-w-48 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-800 dark:text-gray-100 shadow-lg">
        <DropdownItem onClick={onBack} className="cursor-pointer">
          <FaEdit className="mr-2 h-4 w-4 text-slate-500" />
          Editar datos
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem onClick={onRegenerate} className="cursor-pointer">
          <FaRedo className="mr-2 h-4 w-4 text-slate-500" />
          Regenerar con IA
        </DropdownItem>
      </div>
    </Dropdown>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Toolbar única */}
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0 flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
            >
              <FaArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Datos</span>
            </button>

            <div className="hidden h-5 w-px bg-slate-200 dark:bg-gray-600 sm:block" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                  <FaCheckCircle className="h-3 w-3" />
                  Generado
                </span>
                <span className="hidden text-xs text-slate-400 dark:text-gray-500 sm:inline">
                  {tipoLabel}
                </span>
              </div>
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white max-w-[40vw] sm:max-w-md">
                {contract.titulo}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              outline
              size="sm"
              onClick={() => setChatOpen((open) => !open)}
              className={`border-slate-200 dark:border-gray-600 text-slate-700 dark:text-gray-200 ${
                chatOpen ? "bg-slate-100 dark:bg-gray-700" : ""
              }`}
            >
              <FaComments className="sm:mr-1.5" />
              <span className="hidden sm:inline">Asistente</span>
            </Button>

            <ContractPDFGeneratorV2
              contract={contract}
              input={input}
              className="bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white border-0 text-sm px-3 py-2"
              onSuccess={() => {
                setChatOpen(false);
                setDownloadError(null);
                setDownloadSuccess(true);
              }}
              onError={(message) => {
                setDownloadError(message);
                setDownloadSuccess(false);
              }}
            >
              <span className="inline-flex items-center">
                <FaFilePdf className="mr-0 sm:mr-1.5" />
                <span className="hidden sm:inline">Descargar PDF</span>
                <span className="sm:hidden ml-1.5">PDF</span>
              </span>
            </ContractPDFGeneratorV2>

            {moreMenu}
          </div>
        </div>
      </header>

      {downloadSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/45"
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pdf-success-title"
            className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-xl"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300">
              <FaCheckCircle className="h-7 w-7" />
            </div>
            <h2
              id="pdf-success-title"
              className="text-center text-xl font-semibold text-slate-900 dark:text-white"
            >
              Contrato descargado
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500 dark:text-gray-400">
              El PDF se guardó en tu dispositivo. ¿Qué quieres hacer ahora?
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                onClick={onCreateAnother}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                Crear otro contrato
              </Button>
              <Button
                color="light"
                className="w-full border border-slate-200 dark:border-gray-600"
                onClick={() => setDownloadSuccess(false)}
              >
                Seguir en este contrato
              </Button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400 dark:text-gray-500">
              “Crear otro” limpia el borrador de este navegador.
            </p>
          </div>
        </div>
      )}

      <main
        className={`mx-auto px-4 py-6 ${
          chatOpen ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        {downloadError && (
          <Alert color="failure" className="mb-6" onDismiss={() => setDownloadError(null)}>
            <FaExclamationTriangle className="mr-2" />
            <span>{downloadError}</span>
          </Alert>
        )}

        {warnings.length > 0 && (
          <Alert color="warning" className="mb-6">
            <FaExclamationTriangle className="mr-2" />
            <div>
              <p className="font-medium">Revisa los siguientes puntos:</p>
              <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </Alert>
        )}

        <div
          className={`gap-6 ${
            chatOpen ? "lg:grid lg:grid-cols-[minmax(0,1fr)_360px]" : ""
          }`}
        >
          <article className="rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sm:p-10 shadow-sm prose prose-slate dark:prose-invert max-w-none lg:max-h-[calc(100vh-140px)] overflow-y-auto">
            {renderContractContent(contract)}
          </article>

          {/* Chat desktop */}
          {chatOpen && (
            <aside className="hidden lg:flex flex-col rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden h-[calc(100vh-140px)] sticky top-[73px]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaComments className="text-blue-600 dark:text-blue-400" />
                  Asistente
                </h2>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-gray-700 dark:hover:text-white"
                  aria-label="Cerrar asistente"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <ContractChat
                  contract={contract}
                  onContractUpdate={handleContractUpdate}
                  onClose={() => setChatOpen(false)}
                  isOpen={true}
                />
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Chat móvil: bottom sheet */}
      {chatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setChatOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0 h-[90vh] max-h-[90vh] bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl flex flex-col z-10">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FaComments className="text-blue-600 dark:text-blue-400" />
                Asistente
              </h2>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700"
                aria-label="Cerrar asistente"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ContractChat
                contract={contract}
                onContractUpdate={handleContractUpdate}
                onClose={() => setChatOpen(false)}
                isOpen={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
