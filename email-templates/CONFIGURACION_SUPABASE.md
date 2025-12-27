# 📧 Configuración de Templates de Email Personalizados en Supabase

Esta guía te ayudará a configurar los templates de email personalizados para ContaTools en tu proyecto de Supabase.

## 🎯 Templates Incluidos

- **`confirm-signup.html`** - Email de confirmación de registro
- **`recovery.html`** - Email de recuperación de contraseña

## 🚀 Pasos para Configurar en Supabase

### 1. Acceder al Dashboard de Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Selecciona tu proyecto de ContaTools
3. En el panel lateral, ve a **Authentication** → **Email Templates**

### 2. Configurar Template de Confirmación de Registro

1. **Seleccionar Template**:

   - En la pestaña "Email Templates"
   - Selecciona **"Confirm signup"**

2. **Configurar el Subject**:

   ```
   ✅ Confirma tu cuenta de ContaTools - ¡Bienvenido!
   ```

3. **Configurar el Contenido HTML**:

   - Copia todo el contenido del archivo `confirm-signup.html`
   - Pégalo en el campo "Message (HTML)"
   - Asegúrate de que la variable `{{ .ConfirmationURL }}` esté presente

4. **Configurar Contenido de Texto Plano** (opcional pero recomendado):

   ```
   ¡Bienvenido a ContaTools!

   Gracias por registrarte en ContaTools, tu solución integral para automatizar procesos contables.

   Para completar tu registro, confirma tu dirección de correo electrónico haciendo clic en el siguiente enlace:

   {{ .ConfirmationURL }}

   Si tienes problemas con el enlace, copia y pega la URL completa en tu navegador.

   Este enlace expirará en 24 horas por seguridad.

   ¡Gracias por unirte a ContaTools!

   ---
   ContaTools - Automatiza tu contabilidad sin complicaciones
   ```

### 3. Configurar Template de Recuperación de Contraseña

1. **Seleccionar Template**:

   - Selecciona **"Reset password"**

2. **Configurar el Subject**:

   ```
   🔐 Restablecer contraseña - ContaTools
   ```

3. **Configurar el Contenido HTML**:

   - Copia todo el contenido del archivo `recovery.html`
   - Pégalo en el campo "Message (HTML)"
   - Asegúrate de que la variable `{{ .ConfirmationURL }}` esté presente

4. **Configurar Contenido de Texto Plano**:

   ```
   Restablecer Contraseña - ContaTools

   Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de ContaTools.

   Si fuiste tú quien realizó esta solicitud, haz clic en el siguiente enlace para crear una nueva contraseña:

   {{ .ConfirmationURL }}

   Si tienes problemas con el enlace, copia y pega la URL completa en tu navegador.

   ⚠️ IMPORTANTE:
   - Este enlace expirará en 1 hora por seguridad
   - Si no solicitaste el restablecimiento, ignora este correo de forma segura
   - Tu contraseña actual seguirá siendo válida

   ---
   ContaTools - Automatiza tu contabilidad sin complicaciones
   ```

### 4. Configurar Remitente (From)

En la sección **"Sender Settings"**:

1. **From Email**: Usar el email verificado de tu dominio

   ```
   ContaTools <noreply@tudominio.com>
   ```

2. **From Name**:
   ```
   ContaTools
   ```

### 5. Configurar Redirecciones

En **Authentication** → **URL Configuration**:

1. **Site URL**: Tu dominio principal

   ```
   https://tudominio.com
   ```

2. **Redirect URLs**: Agregar las URLs permitidas
   ```
   https://tudominio.com/auth/reset-password
   https://tudominio.com/auth/callback
   https://localhost:3000/auth/reset-password (para desarrollo)
   https://localhost:3001/auth/reset-password (para desarrollo)
   ```

## 🎨 Personalización Adicional

### Colores del Brand

Los templates ya incluyen los colores de ContaTools:

- **Primary**: `#0e7490` (cyan-700)
- **Secondary**: `#0d9488` (teal-600)
- **Gradiente**: `linear-gradient(135deg, #0e7490 0%, #0d9488 100%)`

### Modificar Templates

Si quieres modificar los templates:

1. **Edita los archivos HTML** en la carpeta `email-templates/`
2. **Testa localmente** abriendo los archivos en un navegador
3. **Actualiza en Supabase** copiando el nuevo código

### Variables Disponibles

Supabase proporciona estas variables para los templates:

**Confirmación de Registro:**

- `{{ .ConfirmationURL }}` - URL de confirmación
- `{{ .Token }}` - Token de confirmación
- `{{ .TokenHash }}` - Hash del token
- `{{ .SiteURL }}` - URL del sitio principal

**Recuperación de Contraseña:**

- `{{ .ConfirmationURL }}` - URL de recuperación
- `{{ .Token }}` - Token de recuperación
- `{{ .TokenHash }}` - Hash del token
- `{{ .SiteURL }}` - URL del sitio principal

## 🧪 Testing

### Probar Templates

1. **Registro**: Crea una cuenta nueva para probar el email de confirmación
2. **Recovery**: Usa "Olvidé mi contraseña" para probar el email de recuperación
3. **Verificar Spam**: Revisa que los emails no lleguen a spam

### Debug Common Issues

1. **Email no llega**: Verificar configuración SMTP y DNS
2. **Links no funcionan**: Revisar Redirect URLs
3. **Estilo roto**: Verificar que el HTML sea válido
4. **Variables vacías**: Verificar que las variables estén bien escritas

## 📱 Vista Móvil

Los templates están optimizados para:

- ✅ Dispositivos móviles
- ✅ Clientes de email (Gmail, Outlook, etc.)
- ✅ Modo oscuro/claro
- ✅ Accesibilidad

## 🔧 Configuración de Desarrollo

Para desarrollo local, configura las siguientes variables en tu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs en Supabase Dashboard
2. Verifica la configuración de SMTP
3. Testea con diferentes proveedores de email
4. Consulta la documentación de Supabase

---

**¡Listo!** 🎉 Tus templates personalizados de ContaTools están configurados y listos para usar.
