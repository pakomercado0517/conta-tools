# 📧 Email Templates - ContaTools

Esta carpeta contiene los templates personalizados de email para ContaTools, diseñados específicamente para la plataforma de automatización contable.

## 📁 Archivos Incluidos

### 🎨 Templates HTML
- **`confirm-signup.html`** - Template para confirmación de registro de nuevos usuarios
- **`recovery.html`** - Template para recuperación/restablecimiento de contraseña

### 📋 Documentación
- **`CONFIGURACION_SUPABASE.md`** - Guía completa para configurar los templates en Supabase
- **`README.md`** - Este archivo de documentación

## 🎯 Características de los Templates

### ✨ Diseño y Branding
- **Colores corporativos**: Gradiente cyan-teal que coincide con la interfaz de ContaTools
- **Logo**: Incluye emoji 📊 y nombre "ContaTools"
- **Slogan**: "Automatiza tu contabilidad sin complicaciones"
- **Responsive**: Optimizado para dispositivos móviles y escritorio

### 📱 Compatibilidad
- ✅ Gmail, Outlook, Apple Mail, Thunderbird
- ✅ Dispositivos móviles (iOS/Android)
- ✅ Clientes web y de escritorio
- ✅ Modo oscuro y claro
- ✅ Lectores de pantalla (accesibilidad)

### 🔧 Funcionalidades
- **Call-to-Action prominente**: Botones grandes y coloridos
- **Fallback de enlaces**: Código copiable en caso de problemas con botones
- **Información de seguridad**: Avisos sobre expiración de enlaces
- **Diseño profesional**: Layout limpio y estructurado

## 🛠 Uso de los Templates

### 1. Confirmación de Registro (`confirm-signup.html`)
**Propósito**: Verificar el email de nuevos usuarios que se registran en ContaTools.

**Características**:
- Mensaje de bienvenida personalizado
- Lista de herramientas disponibles en ContaTools
- Botón prominente de confirmación
- Información sobre expiración del enlace (24 horas)

**Variables de Supabase**:
- `{{ .ConfirmationURL }}` - URL para confirmar el email

### 2. Recuperación de Contraseña (`recovery.html`)
**Propósito**: Permitir a los usuarios restablecer su contraseña olvidada.

**Características**:
- Botón de restablecimiento con colores de advertencia
- Aviso de seguridad destacado
- Información sobre expiración del enlace (1 hora)
- Instrucciones claras de qué hacer si no solicitaron el cambio

**Variables de Supabase**:
- `{{ .ConfirmationURL }}` - URL para restablecer la contraseña

## 🎨 Personalización

### Colores Utilizados
```css
/* Colores principales */
Primary Gradient: linear-gradient(135deg, #0e7490 0%, #0d9488 100%)
Background: #f8fafc
Text: #333333
Secondary Text: #4b5563

/* Botones */
Confirmation Button: Gradient cyan-teal
Recovery Button: Gradient red-orange
```

### Modificar Templates
1. Edita los archivos HTML en esta carpeta
2. Prueba localmente abriendo en un navegador
3. Actualiza en Supabase siguiendo la guía de configuración

## 📋 Checklist de Implementación

- [ ] Configurar templates en Supabase Dashboard
- [ ] Establecer Subject Lines personalizados
- [ ] Configurar remitente (From email/name)
- [ ] Agregar Redirect URLs
- [ ] Probar con registro de nueva cuenta
- [ ] Probar con recuperación de contraseña
- [ ] Verificar que no lleguen a spam
- [ ] Testear en diferentes clientes de email

## 🚀 Configuración Rápida

1. **Ve a Supabase Dashboard**
   - Authentication → Email Templates

2. **Copia los templates**
   - Confirm Signup: `confirm-signup.html`
   - Reset Password: `recovery.html`

3. **Configura Subject Lines**
   - Confirmación: "✅ Confirma tu cuenta de ContaTools - ¡Bienvenido!"
   - Recuperación: "🔐 Restablecer contraseña - ContaTools"

4. **¡Listo para usar!**

## 📞 Soporte

Para más información detallada, consulta:
- `CONFIGURACION_SUPABASE.md` - Guía paso a paso completa
- [Documentación de Supabase](https://supabase.com/docs/guides/auth/auth-email-templates)

---

**ContaTools** - Automatiza tu contabilidad sin complicaciones 🚀
