"use client";

import { Card } from 'flowbite-react';
import { 
  FaRocket, 
  FaCog, 
  FaChartLine, 
  FaStar, 
  FaCalendarAlt,
  FaBell,
  FaGithub,
  FaLinkedin,
  FaEnvelope
} from 'react-icons/fa';

export default function ComingSoon({ 
  title = "Próximamente", 
  subtitle = "Estamos trabajando en algo increíble",
  icon: IconComponent = FaRocket,
  features = [],
  showNotifyMe = false,
  variant = "default" // default, profile, dashboard
}) {
  
  const getVariantConfig = () => {
    switch (variant) {
      case 'profile':
        return {
          title: "Tu Perfil de ContaTools",
          subtitle: "Personaliza tu experiencia contable",
          icon: FaCog,
          features: [
            "Configuración de preferencias",
            "Gestión de datos personales", 
            "Historial de actividad",
            "Configuración de notificaciones"
          ],
          gradient: "from-blue-600 via-purple-600 to-blue-800",
          bgPattern: "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950"
        };
      case 'dashboard':
        return {
          title: "Dashboard Inteligente",
          subtitle: "Tu centro de control contable",
          icon: FaChartLine,
          features: [
            "Resumen financiero en tiempo real",
            "Gráficos y métricas avanzadas",
            "Notificaciones importantes",
            "Accesos rápidos a herramientas"
          ],
          gradient: "from-cyan-600 via-teal-600 to-emerald-600",
          bgPattern: "bg-gradient-to-br from-cyan-50 to-emerald-50 dark:from-cyan-950 dark:to-emerald-950"
        };
      default:
        return {
          title,
          subtitle,
          icon: IconComponent,
          features,
          gradient: "from-cyan-700 to-teal-600",
          bgPattern: "bg-gradient-to-br from-gray-50 to-cyan-50 dark:from-gray-900 dark:to-cyan-950"
        };
    }
  };

  const config = getVariantConfig();
  const Icon = config.icon;

  return (
    <div className={`min-h-[calc(100vh-200px)] p-6 ${config.bgPattern}`}>
      <div className="mx-auto max-w-4xl">
        
        {/* Header con animación */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            {/* Círculos animados de fondo */}
            <div className="absolute -inset-4 opacity-30 animate-pulse">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${config.gradient} blur-xl`}></div>
            </div>
            <div className="relative">
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${config.gradient} shadow-xl flex items-center justify-center`}>
                <Icon className="text-white text-2xl" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            {config.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-light max-w-2xl mx-auto">
            {config.subtitle}
          </p>
        </div>

        {/* Card principal */}
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-2xl">
          <div className="text-center py-12">
            
            {/* Cohete animado */}
            <div className="relative mb-8">
              <div className="animate-bounce">
                <FaRocket className="text-6xl text-gray-400 dark:text-gray-500 mx-auto mb-6" />
              </div>
              
              {/* Estrellas decorativas */}
              <div className="absolute top-0 left-1/4 animate-pulse">
                <FaStar className="text-yellow-400 text-lg opacity-70" />
              </div>
              <div className="absolute top-8 right-1/4 animate-pulse delay-300">
                <FaStar className="text-yellow-400 text-sm opacity-50" />
              </div>
              <div className="absolute bottom-4 left-1/3 animate-pulse delay-700">
                <FaStar className="text-yellow-400 text-xs opacity-60" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              🚀 Próximamente
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
              Estamos construyendo algo extraordinario para mejorar tu experiencia con ContaTools.
            </p>

            {/* Features preview */}
            {config.features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                  Lo que puedes esperar:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {config.features.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-start bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 transition-all duration-300 hover:scale-105"
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient} mr-3 flex-shrink-0`}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 text-left">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline estimado */}
            <div className="flex items-center justify-center mb-8 text-gray-500 dark:text-gray-400">
              <FaCalendarAlt className="mr-2" />
              <span className="text-sm">Estimado: Próxima actualización</span>
            </div>

            {/* Notify me button (opcional) */}
            {showNotifyMe && (
              <div className="mb-6">
                <button className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${config.gradient} text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}>
                  <FaBell className="mr-2" />
                  Notificarme cuando esté listo
                </button>
              </div>
            )}

            {/* Progress indicator */}
            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span>Progreso</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-1000 animate-pulse`}
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>

          </div>
        </Card>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Mientras tanto, explora todas las herramientas disponibles de ContaTools
          </p>
          
          {/* Links de navegación rápida */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="/generador_conceptos" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors">
              📊 Buscador SAT
            </a>
            <a href="/counterMoney" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors">
              💰 Contador Dinero
            </a>
            <a href="/sdiCalculator" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors">
              🧮 Calculadora SDI
            </a>
            <a href="/generador_contratos" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors">
              📋 Gen. Contratos
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="fixed top-20 left-10 opacity-10 dark:opacity-5 pointer-events-none">
          <div className="text-6xl transform rotate-12 text-gray-400">📊</div>
        </div>
        <div className="fixed bottom-20 right-10 opacity-10 dark:opacity-5 pointer-events-none">
          <div className="text-4xl transform -rotate-12 text-gray-400">💰</div>
        </div>
        
      </div>
    </div>
  );
}
