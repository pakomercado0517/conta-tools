"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button, Textarea, Alert, Spinner } from "flowbite-react";
import {
  FaPaperPlane,
  FaTrash,
  FaTimes,
  FaExclamationTriangle,
  FaUndo,
} from "react-icons/fa";
import { ChatMessage, ContractOperation, ContractGenerated } from "@/types/contract-v2";

type ChatSSEEvent =
  | { type: "chunk"; content?: string }
  | {
      type: "complete";
      explicacion?: string;
      operations?: ContractOperation[];
      contract?: ContractGenerated;
    }
  | { type: "error"; details?: string; error?: string };

interface ContractChatProps {
  contract: ContractGenerated;
  onContractUpdate: (newContract: ContractGenerated) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function ContractChat({ contract, onContractUpdate, onClose, isOpen }: ContractChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<ChatMessage[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (undoTimeout) clearTimeout(undoTimeout);
    };
  }, [undoTimeout]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsStreaming(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/chat-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract,
          message: userMessage.content,
          history: messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Error en la petición");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalData: Extract<ChatSSEEvent, { type: "complete" }> | null = null;

      if (!reader) throw new Error("No se pudo leer la respuesta");

      // Crear mensaje asistente vacío para streaming
      const assistantMessageId = crypto.randomUUID();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          let data: ChatSSEEvent;
          try {
            data = JSON.parse(line.slice(6)) as ChatSSEEvent;
          } catch {
            // Ignorar líneas no parseables
            continue;
          }

          switch (data.type) {
            case "chunk":
              if (data.content) {
                const chunkContent = data.content;
                setMessages(prev => prev.map(m =>
                  m.id === assistantMessageId
                    ? { ...m, content: m.content + chunkContent }
                    : m
                ));
                setTimeout(scrollToBottom, 50);
              }
              break;

            case "complete":
              finalData = data;
              break;

            case "error":
              throw new Error(data.details || data.error);
          }
        }
      }

      if (!finalData) {
        throw new Error("No se recibió respuesta completa");
      }

      // Actualizar mensaje final con operaciones
      setMessages(prev => prev.map(m =>
        m.id === assistantMessageId
          ? {
              ...m,
              content: finalData.explicacion || "Operación completada",
              operations: finalData.operations,
            }
          : m
      ));

      // Aplicar nuevo contrato si hay operaciones
      if (finalData.contract) {
        onContractUpdate(finalData.contract);

        // Guardar en undo stack
        setUndoStack(prev => [...prev.slice(-9), messages[0]]); // Keep last 10
        setShowUndo(true);

        // Auto-hide undo button after 10 seconds
        if (undoTimeout) clearTimeout(undoTimeout);
        const timeout = setTimeout(() => setShowUndo(false), 10000);
        setUndoTimeout(timeout);
      }

    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      
      // Mostrar error en chat
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `❌ Error: ${errorMsg}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsStreaming(false);
      setTimeout(scrollToBottom, 100);
    }
  } // Cierre de handleSend

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastUserMessage = undoStack[undoStack.length - 1];
      // Find the contract state before last operation
      // For simplicity, we'll just notify the parent to handle undo
      // In a full implementation, you'd store contract snapshots
      console.log("Undo requested, would revert to:", lastUserMessage.timestamp);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setUndoStack([]);
    setShowUndo(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={chatContainerRef}
      className="fixed lg:relative inset-0 lg:inset-auto lg:w-96 bg-white dark:bg-gray-800 border-l lg:border-l-0 lg:border lg:rounded-xl lg:border-gray-200 dark:lg:border-gray-700 shadow-2xl lg:shadow-lg z-50 flex flex-col h-full lg:h-[calc(100vh-200px)] transition-transform duration-300 ease-in-out"
      role="dialog"
      aria-label="Chat para modificar contrato"
    >
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 lg:rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Asistente Jurídico</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Modifica tu contrato con lenguaje natural</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showUndo && (
            <Button
              color="ghost"
              size="sm"
              onClick={handleUndo}
              className="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              <FaUndo className="mr-1" /> Deshacer
            </Button>
          )}
          <Button
            color="ghost"
            size="sm"
            onClick={handleClear}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            title="Limpiar chat"
          >
            <FaTrash className="w-5 h-5" />
          </Button>
          <Button
            color="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden text-gray-500 dark:text-gray-400"
            title="Cerrar chat"
          >
            <FaTimes className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <svg className="mx-auto mb-3 w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">Escribe una instrucción para modificar el contrato</p>
            <p className="text-xs mt-1">Ej: &quot;Quita la cláusula penal&quot;, &quot;Cambia jurisdicción a Monterrey&quot;</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {msg.role === "user" ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h18a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                </div>
                <div
                  className={`max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white rounded-tr-none"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.operations && msg.operations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/20 dark:border-gray-600">
                        <p className="text-xs font-medium mb-1">Operaciones aplicadas:</p>
                        <ul className="text-xs space-y-0.5">
                          {msg.operations.map((op, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <span className="px-1.5 py-0.5 text-xs rounded bg-white/20 dark:bg-gray-600">
                                {op.tipo}
                              </span>
                              {"numeroRomano" in op && op.numeroRomano && (
                                <span className="text-gray-400 dark:text-gray-500">{op.numeroRomano}</span>
                              )}
                              {"campo" in op && op.campo && (
                                <span className="text-gray-400 dark:text-gray-500">{op.campo}</span>
                              )}
                              {op.tipo === "INSERTAR_CLAUSULA" && op.clausula.titulo && (
                                <span className="text-gray-400 dark:text-gray-500">{op.clausula.titulo}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {/* Streaming indicator */}
            {isStreaming && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <span className="relative w-6 h-6">
                      <span className="absolute inset-0 bg-current opacity-20 rounded-full animate-ping"></span>
                      <span className="absolute inset-0 bg-current opacity-30 rounded-full animate-ping" style={{ animationDelay: "0.3s" }}></span>
                      <span className="absolute inset-0 bg-current opacity-40 rounded-full animate-ping" style={{ animationDelay: "0.6s" }}></span>
                    </span>
                    <span className="text-sm">Pensando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Error Banner */}
        {error && (
          <Alert color="failure" className="mx-4 mb-4" onDismiss={() => setError(null)}>
            <FaExclamationTriangle className="mr-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm">{error}</span>
              <Button color="ghost" size="sm" onClick={() => setError(null)}>
                Cerrar
              </Button>
            </div>
          </Alert>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 lg:rounded-b-xl">
        {error && !isStreaming && (
          <Alert color="failure" className="mb-3" onDismiss={() => setError(null)}>
            <FaExclamationTriangle className="mr-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm">{error}</span>
              <Button color="ghost" size="sm" onClick={() => setError(null)}>
                Cerrar
              </Button>
            </div>
          </Alert>
        )}

        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Escribe tu instrucción... Ej: "Quita la cláusula penal"'
            rows={1}
            className="flex-1 min-h-[44px] max-h-[150px] resize-none"
            disabled={isStreaming}
            aria-label="Instrucción para modificar contrato"
          />
          <Button
            type="submit"
            disabled={isStreaming || !inputValue.trim()}
            className="flex-shrink-0 h-[44px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isStreaming ? "Enviando..." : "Enviar instrucción"}
          >
            {isStreaming ? (
              <Spinner className="w-5 h-5" aria-hidden="true" />
            ) : (
              <FaPaperPlane className="w-5 h-5" aria-hidden="true" />
            )}
          </Button>
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Presiona <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-mono">Enter</kbd> para enviar, <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-mono">Shift+Enter</kbd> para nueva línea
        </p>

        {/* Sugerencias rápidas */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            "Quita la cláusula penal",
            "Cambia jurisdicción a Monterrey",
            "Agrega cláusula de confidencialidad",
            "Sube el monto a 100,000",
            "Cambia a pago en parcialidades",
          ].map((sug, i) => (
            <Button
              key={i}
              type="button"
              color="ghost"
              size="sm"
              className="text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1"
              onClick={() => setInputValue(sug)}
              disabled={isStreaming}
            >
              {sug}
            </Button>
          ))}
        </div>
      </form>
    </div>
  );
}