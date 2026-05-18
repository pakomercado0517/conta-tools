# 🤖 Hook useAIGenerator

Hook personalizado para generar contenido usando **Groq**, específicamente diseñado para crear conceptos profesionales de cotizaciones y contratos.

## 🚀 Instalación y Configuración

### Variables de Entorno

Asegúrate de tener configurado tu `.env.local`:

```bash
GROQ_API_KEY=gsk_...tu-api-key-aqui
# Opcional
# GROQ_MODEL=llama-3.3-70b-versatile
# GROQ_MAX_COMPLETION_TOKENS=384
```

Obtén la clave en [Groq Console](https://console.groq.com/keys).

### Dependencias

```bash
pnpm add axios
```

## 📚 Uso del Hook

### Importación Básica

```javascript
import useAIGenerator from "@/hooks/useAIGenerator";

const MyComponent = () => {
  const {
    isLoading,
    error,
    generateQuotationConcept,
    generateContractConcept,
    clearState,
  } = useAIGenerator();

  // ... resto del componente
};
```

### Estados Disponibles

- `isLoading`: Boolean - Indica si hay una generación en proceso
- `error`: String|null - Mensaje de error si algo sale mal
- `lastGenerated`: String - Último contenido generado
- `isAvailable`: Boolean - Indica si el servicio está disponible

### Funciones Principales

#### `generateQuotationConcept(concept)`

Genera un concepto ejecutivo para cotizaciones (postura de prestador, sin preámbulos, infinitivos/sustantivos de acción). Los prompts viven en `lib/ai-prompts.ts`.

```javascript
const handleGenerate = async () => {
  const result = await generateQuotationConcept("instalación eléctrica en oficina");
  if (result.success) {
    console.log(result.data);
  }
};
```

#### `generateContractConcept(concept)`

Genera descripción legal para contratos.

```javascript
const handleGenerate = async () => {
  const result = await generateContractConcept("prestación de servicios");
  if (result.success) {
    console.log(result.data);
  }
};
```

#### `generateContent(prompt, options?)`

Función genérica. `options` puede incluir `userInput` y `systemInstruction`.

```javascript
const result = await generateContent("Crea una descripción de:", {
  userInput: "mi producto",
});
```

## 🎨 Componente AIGeneratorButton

Componente UI completo que incluye modal, estados de carga y manejo de errores.

### Props

```typescript
{
  type: 'quotation' | 'contract' | 'custom'  // Tipo de generación
  concept: string                            // Concepto base
  onGenerated: (content: string) => void     // Callback al generar
  placeholder: string                        // Placeholder del input
  disabled: boolean                          // Deshabilitar botón
  className: string                          // Clases CSS adicionales
}
```

### Ejemplo de Uso

```jsx
<AIGeneratorButton
  type="quotation"
  concept={producto.descripcion}
  onGenerated={(content) => setDescripcion(content)}
  placeholder="Ej: servicio de plomería..."
/>
```

## 🔧 Integración en Formularios

### Ejemplo con QuotationProducts

```jsx
const handleAIGenerated = (generatedContent, index) => {
  const syntheticEvent = {
    target: {
      name: "descripcion",
      value: generatedContent,
    },
  };
  handleProductoChange(syntheticEvent, index);
};

// En el JSX
<div className="flex gap-2">
  <TextInput
    name="descripcion"
    value={producto.descripcion}
    onChange={(e) => handleProductoChange(e, index)}
    className="flex-1"
  />
  <AIGeneratorButton
    type="quotation"
    onGenerated={(content) => handleAIGenerated(content, index)}
  />
</div>;
```

## 🛠 API Route

El hook utiliza la ruta `/api/ai/generate` que:

- Valida el prompt
- Se comunica con la API de Groq (`max_completion_tokens` por defecto 384)
- Maneja errores específicos
- Retorna respuestas estructuradas

## 📈 Características Avanzadas

### Manejo de Errores

El hook captura y maneja:

- Errores de red
- API key inválida
- Límite de rate excedido
- Prompts vacíos

### Optimizaciones

- Prompts optimizados para cada tipo de contenido
- Límite de tokens para respuestas concisas
- Temperature balanceada para creatividad/consistencia

## 🎯 Casos de Uso

1. **Cotizaciones**: Generar descripciones técnicas de productos/servicios
2. **Contratos**: Crear cláusulas legales profesionales
3. **Conceptos generales**: Descripción de cualquier servicio/producto

## 🔮 Extensiones Futuras

- Caché de respuestas para evitar duplicados
- Historial de generaciones
- Templates personalizables
- Integración con más modelos de IA
- Rate limiting inteligente
