"use client";

import { Card } from "flowbite-react";
import {
  FaRocket,
  FaCog,
  FaChartLine,
  FaStar,
  FaCalendarAlt,
  FaBell,
} from "react-icons/fa";
import type { IconType } from "react-icons";

// Tipos para las variantes del componente
type ComingSoonVariant = "default" | "profile" | "dashboard";

// Configuración para cada variante
interface VariantConfig {
  title: string;
  subtitle: string;
  icon: IconType;
  features: string[];
  gradient: string;
  bgPattern: string;
}

// Props del componente ComingSoon
interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  icon?: IconType;
  features?: string[];
  showNotifyMe?: boolean;
  variant?: ComingSoonVariant;
}

/**
 * Componente Coming Soon personalizable
 * Muestra una página de "próximamente" con diferentes variantes según el contexto
 */
export default function ComingSoon({
  title = "Próximamente",
  subtitle = "Estamos trabajando en algo increíble",
  icon: IconComponent = FaRocket,
  features = [],
  showNotifyMe = false,
  variant = "default",
}: ComingSoonProps) {
  /**
   * Obtiene la configuración específica para cada variante
   * @returns Configuración de la variante seleccionada
   */
  const getVariantConfig = (): VariantConfig => {
    switch (variant) {
      case "profile":
        return {
          title: "Tu Perfil de ContaTools",
          subtitle: "Personaliza tu experiencia contable",
          icon: FaCog,
          features: [
            "Configuración de preferencias",
            "Gestión de datos personales",
            "Historial de actividad",
            "Configuración de notificaciones",
          ],
          gradient: "from-blue-600 via-purple-600 to-blue-800",
          bgPattern:
            "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950",
        };
      case "dashboard":
        return {
          title: "Dashboard Inteligente",
          subtitle: "Tu centro de control contable",
          icon: FaChartLine,
          features: [
            "Resumen financiero en tiempo real",
            "Gráficos y métricas avanzadas",
            "Notificaciones importantes",
            "Accesos rápidos a herramientas",
          ],
          gradient: "from-cyan-600 via-teal-600 to-emerald-600",
          bgPattern:
            "bg-gradient-to-br from-cyan-50 to-emerald-50 dark:from-cyan-950 dark:to-emerald-950",
        };
      default:
        return {
          title,
          subtitle,
          icon: IconComponent,
          features,
          gradient: "from-cyan-700 to-teal-600",
          bgPattern:
            "bg-gradient-to-br from-gray-50 to-cyan-50 dark:from-gray-900 dark:to-cyan-950",
        };
    }
  };

  const config: VariantConfig = getVariantConfig();
  const Icon = config.icon;

  return (
    <div className={`min-h-[calc(100vh-200px)] p-6 ${config.bgPattern}`}>
      <div className="mx-auto max-w-4xl">
        {/* Header con animación */}
        <div className="mb-8 text-center">
          <div className="relative mb-6 inline-block">
            {/* Círculos animados de fondo */}
            <div className="absolute -inset-4 animate-pulse opacity-30">
              <div
                className={`h-24 w-24 rounded-full bg-gradient-to-r ${config.gradient} blur-xl`}
              ></div>
            </div>
            <div className="relative">
              <div
                className={`mx-auto h-16 w-16 rounded-2xl bg-gradient-to-r ${config.gradient} flex items-center justify-center shadow-xl`}
              >
                <Icon className="text-2xl text-white" />
              </div>
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {config.title}
          </h1>
          <p className="mx-auto max-w-2xl text-xl font-light text-gray-600 dark:text-gray-300">
            {config.subtitle}
          </p>
        </div>

        {/* Card principal */}
        <Card className="border-0 bg-white/70 shadow-2xl backdrop-blur-sm dark:bg-gray-800/70">
          <div className="py-12 text-center">
            {/* Cohete animado */}
            <div className="relative mb-8">
              <div className="animate-bounce">
                <FaRocket className="mx-auto mb-6 text-6xl text-gray-400 dark:text-gray-500" />
              </div>

              {/* Estrellas decorativas */}
              <div className="absolute left-1/4 top-0 animate-pulse">
                <FaStar className="text-lg text-yellow-400 opacity-70" />
              </div>
              <div className="absolute right-1/4 top-8 animate-pulse delay-300">
                <FaStar className="text-sm text-yellow-400 opacity-50" />
              </div>
              <div className="absolute bottom-4 left-1/3 animate-pulse delay-700">
                <FaStar className="text-xs text-yellow-400 opacity-60" />
              </div>
            </div>

            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              🚀 Próximamente
            </h2>

            <p className="mx-auto mb-8 max-w-md leading-relaxed text-gray-600 dark:text-gray-300">
              Estamos construyendo algo extraordinario para mejorar tu
              experiencia con ContaTools.
            </p>

            {/* Features preview */}
            {config.features.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-200">
                  Lo que puedes esperar:
                </h3>
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 md:grid-cols-2">
                  {config.features.map((feature: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-start rounded-lg bg-gray-100 px-4 py-3 transition-all duration-300 hover:scale-105 dark:bg-gray-700"
                    >
                      <div
                        className={`h-2 w-2 rounded-full bg-gradient-to-r ${config.gradient} mr-3 flex-shrink-0`}
                      ></div>
                      <span className="text-left text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline estimado */}
            <div className="mb-8 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <FaCalendarAlt className="mr-2" />
              <span className="text-sm">Estimado: Próxima actualización</span>
            </div>

            {/* Notify me button (opcional) */}
            {showNotifyMe && (
              <div className="mb-6">
                <button
                  className={`inline-flex items-center bg-gradient-to-r px-6 py-3 ${config.gradient} rounded-xl font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
                  type="button"
                  aria-label="Notificarme cuando esté disponible"
                >
                  <FaBell className="mr-2" />
                  Notificarme cuando esté listo
                </button>
              </div>
            )}

            {/* Progress indicator */}
            <div className="mx-auto max-w-xs">
              <div className="mb-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Progreso</span>
                <span>75%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-2 bg-gradient-to-r ${config.gradient} animate-pulse rounded-full transition-all duration-1000`}
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Mientras tanto, explora todas las herramientas disponibles de
            ContaTools
          </p>

          {/* Links de navegación rápida */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a
              href="/generador_conceptos"
              className="text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              📊 Buscador SAT
            </a>
            <a
              href="/counterMoney"
              className="text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              💰 Contador Dinero
            </a>
            <a
              href="/sdiCalculator"
              className="text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              🧮 Calculadora SDI
            </a>
            <a
              href="/generador_contratos"
              className="text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              📋 Gen. Contratos
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="pointer-events-none fixed left-10 top-20 opacity-10 dark:opacity-5">
          <div className="rotate-12 transform text-6xl text-gray-400">📊</div>
        </div>
        <div className="pointer-events-none fixed bottom-20 right-10 opacity-10 dark:opacity-5">
          <div className="-rotate-12 transform text-4xl text-gray-400">💰</div>
        </div>
      </div>
    </div>
  );
}
