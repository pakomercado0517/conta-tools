# ContaTools 🧮

ContaTools es una plataforma web integral y moderna diseñada para profesionales contables, que automatiza y simplifica tareas contables cotidianas. Con un sistema completo de autenticación y gestión de usuarios, ofrece herramientas especializadas para la generación de documentos, cálculos contables y administración empresarial.

![ContaTools Logo](https://conta-tools.vercel.app/_next/static/media/logo_transparent.8f509eef.svg)

## 🔐 Sistema de Autenticación y Usuarios

### 👤 Gestión de Cuentas

- **Registro seguro** con verificación de email obligatoria
- **Login protegido** con NextAuth.js y credenciales
- **Verificación de email** con tokens seguros y tiempo limitado
- **Recuperación de contraseñas** con sistema de reset por email
- **Middleware de seguridad** que protege rutas sensibles

### ⚙️ Gestión de Perfil

- **Edición de perfil** en tiempo real sin recarga manual
- **Cambio de nombre** con actualización inmediata de la interfaz
- **Cambio de email** con re-verificación automática y logout por seguridad
- **Cambio de contraseñas** con validación de contraseña actual
- **Estados de verificación** visibles en todo momento
- **Reenvío de verificaciones** cuando sea necesario

## ✨ Herramientas Contables y Empresariales

### 📄 Generador de Contratos

- **Contratos de compraventa** profesionales y personalizables
- **Datos de vendedor y comprador** con validación completa
- **Descripción detallada** del bien o servicio
- **Condiciones comerciales** (precio, forma de pago, entrega)
- **Cláusulas legales** predefinidas y personalizables
- **Generación PDF** con diseño profesional y legal
- **Vista previa** antes de la generación final
- **Guardado local** automático del documento

### 📋 Generador de Cotizaciones

- **Cotizaciones profesionales** en formato PDF
- **Gestión de productos/servicios** con precios unitarios
- **Cálculo automático** de subtotales, impuestos y totales
- **Datos de empresa** personalizables (logo, información fiscal)
- **Información del cliente** completa y organizada
- **Términos y condiciones** personalizables
- **Datos bancarios** opcionales para facilitar pagos
- **Vigencia de cotización** configurable
- **Descuentos y recargos** flexibles

### 🔍 Buscador de Claves SAT

- **Búsqueda inteligente** de productos y servicios SAT
- **Algoritmo difuso** (Fuse.js) para mejores coincidencias
- **Búsqueda por código** o descripción
- **Resultados instantáneos** con filtrado en tiempo real
- **Integración directa** con formularios de cotización
- **Base de datos actualizada** con claves oficiales SAT

### 💰 Calculadora de SDI (Salario Diario Integrado)

- **Cálculo preciso** según normativa mexicana
- **Variables completas**: salario base, prestaciones, aguinaldo
- **Factor de integración** automático
- **Resultados detallados** con desglose completo
- **Validación de datos** para evitar errores
- **Historial de cálculos** para referencia

### 💸 Control de Efectivo

- **Conteo de denominaciones** (billetes y monedas)
- **Cálculo automático** de totales por denominación
- **Registro de movimientos** de entrada y salida
- **Balance en tiempo real** del efectivo disponible
- **Reportes de arqueo** para cierre de caja
- **Historial completo** de transacciones

### 📊 Gestión Financiera Avanzada

- **Registro de devoluciones** con seguimiento de estados
- **Control de gastos** por categorías
- **Análisis de flujo** de efectivo
- **Reportes detallados** exportables
- **Dashboard financiero** con métricas clave

### 📈 Calculadora de Información de Payback

- **Análisis de retorno de inversión** detallado
- **Cálculos de recuperación** de capital
- **Proyecciones financieras** a diferentes plazos
- **Análisis de viabilidad** de proyectos
- **Reportes ejecutivos** para toma de decisiones

## 🚀 Tecnologías y Arquitectura

### Frontend

- **Next.js 14+** con App Router para rendimiento óptimo
- **React 18+** con hooks modernos y optimizaciones
- **Tailwind CSS** para diseño responsive y moderno
- **Flowbite React** para componentes UI consistentes
- **TypeScript/JavaScript** híbrido para desarrollo robusto

### Backend y Base de Datos

- **NextAuth.js** para autenticación segura y moderna
- **PostgreSQL** como base de datos principal
- **Supabase** para hosting de base de datos en la nube
- **API Routes** de Next.js para endpoints seguros
- **Middleware personalizado** para protección de rutas

### Servicios y Integraciones

- **Nodemailer** para envío de emails transaccionales
- **bcryptjs** para hashing seguro de contraseñas
- **jsPDF** para generación de documentos PDF
- **PDF-lib** para manipulación avanzada de PDFs
- **Fuse.js** para búsquedas inteligentes
- **UUID** para generación de tokens seguros

### DevOps y Deployment

- **Vercel** para deployment automático y CDN global
- **Git** con flujo de trabajo por branches
- **Environment variables** para configuración segura
- **HTTPS** forzado en producción
- **Monitoreo** de performance y errores

## 🚀 Instalación y Configuración

### Prerrequisitos

```bash
# Node.js 18+ y pnpm
node --version  # >= 18.0.0
pnpm --version  # >= 8.0.0
```

### Variables de Entorno

Copia `.env.local.example` a `.env.local` y configura:

```bash
# Aplicación
APP_NAME="Conta Tools"
APP_URL=http://localhost:3000

# NextAuth.js
NEXTAUTH_SECRET=tu-secret-key-segura
NEXTAUTH_URL=http://localhost:3000

# Base de Datos PostgreSQL
DATABASE_URL=postgresql://usuario:password@host:5432/database

# Servicios de Email (Gmail)
EMAIL_SERVER_USER=tu-email@gmail.com
EMAIL_SERVER_PASSWORD=tu-app-password
EMAIL_FROM=tu-email@gmail.com
```

### Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/pakomercado0517/conta-tools.git
cd conta-tools

# Instalar dependencias
pnpm install

# Configurar base de datos
pnpm run db:setup

# Ejecutar en desarrollo
pnpm run dev
```

### Configuración de Base de Datos

```bash
# Crear tablas necesarias
node scripts/create-tables.js

# Verificar instalación
node scripts/verify-tables.js

# Probar conexión
node scripts/test-db-connection.js
```

## 🔐 Seguridad y Privacidad

### Características de Seguridad

- **Hashing de contraseñas** con bcrypt (cost factor 12)
- **Tokens seguros** con UUID v4 para verificaciones
- **Expiración automática** de tokens de verificación
- **Protección de rutas** con middleware personalizado
- **Validación estricta** de datos en frontend y backend
- **Headers de seguridad** configurados correctamente
- **Sesión segura** con NextAuth.js y JWT

### Protección de Datos

- **Encriptación en tránsito** con HTTPS/TLS
- **Almacenamiento seguro** en PostgreSQL
- **Limpieza automática** de tokens expirados
- **No almacenamiento** de contraseñas en texto plano
- **Logout automático** en cambios críticos (email)

## 🎯 Flujos de Usuario Principales

### 👤 Registro y Autenticación

1. **Registro** → Verificación de email → Activación de cuenta
2. **Login** → Validación de credenciales → Acceso al dashboard
3. **Recuperación** → Email de reset → Nueva contraseña

### 📄 Generación de Documentos

1. **Selección** de tipo de documento (contrato/cotización)
2. **Captura** de información (partes, productos, condiciones)
3. **Vista previa** con validación en tiempo real
4. **Generación** y descarga automática del PDF

### 📊 Herramientas de Cálculo

1. **Selección** de herramienta (SDI, Payback, etc.)
2. **Ingreso** de parámetros con validación
3. **Cálculo instantáneo** con resultados detallados
4. **Exportación** opcional de resultados

## 📱 Diseño Responsive

La aplicación está completamente optimizada para:

- **Desktop** (1024px+): Interfaz completa con paneles laterales
- **Tablet** (768px-1023px): Interfaz adaptada con menús colapsables
- **Móvil** (320px-767px): Interfaz simplificada y táctil
- **Accesibilidad** con soporte para lectores de pantalla
- **Tema claro/oscuro** automático según preferencias del sistema

## 🛠️ API Endpoints

### Autenticación

```
POST /api/auth/register          # Registro de usuario
POST /api/auth/verify-email      # Verificación de email
GET  /api/auth/verify-email      # Verificación desde enlace
POST /api/auth/[...nextauth]     # Login/logout NextAuth
```

### Gestión de Usuario

```
GET  /api/user/profile           # Obtener perfil
PUT  /api/user/profile           # Actualizar perfil
POST /api/user/change-password   # Cambiar contraseña
POST /api/user/resend-verification # Reenviar verificación
```

### Herramientas

```
GET  /api/generador_conceptos     # Búsqueda de conceptos SAT
```

## 🎯 Objetivos del Proyecto

ContaTools nace con el propósito de democratizar el acceso a herramientas contables profesionales, ofreciendo:

- **Simplicidad**: Interfaz intuitiva que reduce la curva de aprendizaje
- **Eficiencia**: Automatización de tareas repetitivas y cálculos complejos
- **Confiabilidad**: Validaciones estrictas y cálculos precisos
- **Accesibilidad**: Disponible desde cualquier dispositivo con navegador
- **Seguridad**: Protección de datos empresariales y personales

## 🚧 Roadmap y Mejoras Futuras

### 🔄 Próximamente

- **Dashboard analítico** con métricas empresariales
- **Plantillas personalizables** para documentos
- **Integración SAT** para facturación electrónica
- **API pública** para integraciones de terceros
- **Móvil app nativa** (iOS/Android)
- **Colaboración multi-usuario** en documentos
- **Backup automático** de datos
- **Reportes avanzados** con gráficas interactivas

### 🆕 En Desarrollo

- **Sistema de notificaciones** push y email
- **Calculadora de nómina** completa
- **Generador de estados financieros**
- **Integración con bancos** mexicanos
- **Módulo de inventarios** y almacén

## 🔒 Licencia y Uso

Este proyecto utiliza una **licencia de uso comercial restringido**.

- **Uso personal y educativo**: Libre y gratuito
- **Uso comercial**: Requiere licencia comercial
- **Redistribución**: Prohibida sin autorización
- **Modificaciones**: Permitidas para uso personal

Para detalles completos, consulta nuestra [página de licencia](https://conta-tools.vercel.app/licensing).

## 👨‍💻 Desarrollo y Contribuciones

**Desarrollado por**: [TresA Design](https://tresa-design.vercel.app/) - [Francisco Pako Mercado](https://tresa-design.vercel.app/)
**Versión actual**: 2.0.0
**Última actualización**: Enero 2025

### Contribuir al Proyecto

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Reporte de Bugs

¿Encontraste un problema? [Abre un issue](https://github.com/pakomercado0517/conta-tools/issues) con:

- Descripción detallada del problema
- Pasos para reproducirlo
- Capturas de pantalla (si es necesario)
- Información del navegador/dispositivo

## 🔗 Enlaces y Recursos

- **🌐 Aplicación en Producción**: [https://conta-tools.vercel.app](https://conta-tools.vercel.app)
- **👨‍💻 Portfolio de TresA Design**: [https://tresa-design.vercel.app](https://tresa-design.vercel.app)
- **📚 Documentación Técnica**: [GitHub Wiki](https://github.com/pakomercado0517/conta-tools/wiki)
- **🐛 Issues y Sugerencias**: [GitHub Issues](https://github.com/pakomercado0517/conta-tools/issues)
- **💬 Comunidad**: [Discussions](https://github.com/pakomercado0517/conta-tools/discussions)

---

**© 2025 TresA Design - Todos los derechos reservados**

_ContaTools - Herramientas Contables Profesionales_

_Desarrollado con ❤️ para la comunidad contable mexicana_
