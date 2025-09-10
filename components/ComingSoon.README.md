# 🚀 Componente ComingSoon - ContaTools

Un componente moderno, minimalista y profesional para mostrar páginas "Próximamente" con estilo y animaciones suaves.

## ✨ Características

- **🎨 Diseño Moderno**: Gradientes, glassmorphism y animaciones CSS suaves
- **🌙 Dark Mode**: Soporte completo para modo oscuro
- **📱 Responsive**: Optimizado para todos los dispositivos
- **🎯 Variantes Preconfiguradas**: Dashboard, Profile y genérico
- **⚡ Animaciones**: Efectos visuales atractivos sin ser molestos
- **🔧 Personalizable**: Props flexibles para diferentes necesidades

## 🛠️ Uso

### Variantes Preconfiguradas

#### Dashboard (usado en `/dashboard`)
```jsx
import ComingSoon from '../../components/ComingSoon';

export default function DashboardPage() {
  return (
    <ComingSoon variant="dashboard" />
  );
}
```

#### Profile (usado en `/profile/edit`)
```jsx
import ComingSoon from '../../../components/ComingSoon';

export default function ProfileEditPage() {
  return (
    <ComingSoon variant="profile" />
  );
}
```

#### Personalizado
```jsx
<ComingSoon 
  title="Nueva Funcionalidad"
  subtitle="Algo increíble se acerca"
  features={[
    "Feature 1",
    "Feature 2", 
    "Feature 3"
  ]}
  showNotifyMe={true}
/>
```

## 🎨 Variantes Disponibles

### 📊 Dashboard (`variant="dashboard"`)
- **Tema**: Cyan a Emerald 
- **Icono**: Gráfico de líneas
- **Features**: Resumen financiero, métricas, notificaciones, accesos rápidos
- **Enfoque**: Centro de control contable

### 👤 Profile (`variant="profile"`)  
- **Tema**: Azul a Púrpura
- **Icono**: Configuración
- **Features**: Preferencias, datos personales, historial, notificaciones
- **Enfoque**: Personalización de la experiencia

### 🎯 Default
- **Tema**: Cyan a Teal
- **Personalizable**: Título, subtítulo, features, icono

## 🔧 Props Disponibles

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `string` | `"default"` | `"dashboard"`, `"profile"`, `"default"` |
| `title` | `string` | `"Próximamente"` | Título principal |
| `subtitle` | `string` | `"Estamos trabajando..."` | Subtítulo descriptivo |
| `icon` | `Component` | `FaRocket` | Icono a mostrar en el header |
| `features` | `array` | `[]` | Lista de características a mostrar |
| `showNotifyMe` | `boolean` | `false` | Mostrar botón de notificación |

## 🎯 Elementos Visuales

### 🌟 Animaciones
- **Bounce**: Cohete principal
- **Pulse**: Elementos de fondo y progress bar
- **Hover**: Efectos en cards de features
- **Scale**: Botones y elementos interactivos

### 🎨 Efectos Visuales
- **Glassmorphism**: Card principal con backdrop-blur
- **Gradientes**: Colores de marca coherentes
- **Sombras**: Depth y elevación profesional
- **Progress Bar**: Indicador de progreso animado (75%)

### 🎭 Elementos Decorativos
- **Estrellas**: Posicionadas aleatoriamente con opacidad
- **Íconos flotantes**: Elementos contables de fondo
- **Círculos de fondo**: Efectos de halo detrás del icono principal

## 🚀 Funcionalidades

### 📋 Features Preview
Muestra una grilla de características esperadas con:
- Indicadores visuales (puntos coloreados)
- Hover effects
- Layout responsive (1 col móvil, 2 col desktop)

### 🔗 Quick Navigation
Links a herramientas existentes:
- 📊 Buscador SAT
- 💰 Contador Dinero  
- 🧮 Calculadora SDI
- 📋 Gen. Contratos

### 📅 Timeline
Información sobre la estimación de entrega:
- Icono de calendario
- Texto descriptivo "Próxima actualización"

## 🎨 Sistema de Colores

### Dashboard
```css
gradient: "from-cyan-600 via-teal-600 to-emerald-600"
background: "from-cyan-50 to-emerald-50 (dark: from-cyan-950 to-emerald-950)"
```

### Profile  
```css
gradient: "from-blue-600 via-purple-600 to-blue-800"
background: "from-blue-50 to-purple-50 (dark: from-blue-950 to-purple-950)"
```

### Default
```css
gradient: "from-cyan-700 to-teal-600"
background: "from-gray-50 to-cyan-50 (dark: from-gray-900 to-cyan-950)"
```

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: `md:` para tablets y desktop
- **Flexible Grid**: Features en 1/2 columnas según pantalla
- **Touch Friendly**: Botones y enlaces con área táctil adecuada

## 🌙 Dark Mode Support

Soporte completo para modo oscuro con:
- **Colores adaptativos**: Automáticos según preferencia del sistema
- **Contraste mejorado**: Legibilidad optimizada
- **Elementos decorativos**: Opacidad ajustada para cada modo

## ✨ Mejores Prácticas

1. **Usar variants**: Para consistencia visual
2. **Personalizar features**: Mantener 4 elementos máximo
3. **Consistencia de marca**: Respetar la paleta de colores
4. **Accesibilidad**: Mantener contraste y focus states
5. **Performance**: Animaciones suaves y ligeras

---

**Diseño por**: ContaTools Team 🚀
**Actualizado**: Próximamente... 😉
