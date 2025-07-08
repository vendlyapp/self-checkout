# Sistema de Corner Smoothing (Squircle)

## ¿Qué es Corner Smoothing?

El corner smoothing o "squircle" es una técnica de diseño que reemplaza los bordes redondeados tradicionales (`border-radius`) con una forma geométrica llamada super-elipse. Esta técnica:

- **Hace que las esquinas se vean más orgánicas y suaves**
- **Es el estándar de iOS desde la versión 13**
- **Mejora la percepción visual de modernidad**
- **Crea una sensación más "natural" en las interfaces**

## Comparación Visual

```
Border-radius normal:    Squircle (super-elipse):
┌─────────────────┐      ╭─────────────────╮
│                 │      │                 │
│     Contenido   │  vs  │     Contenido   │
│                 │      │                 │
└─────────────────┘      ╰─────────────────╯
    "Mecánico"              "Orgánico"
```

## Uso Básico

### 1. Componente Squircle

```tsx
import Squircle from '@/components/ui/squircle';

// Uso básico (variante medium por defecto)
<Squircle className="bg-white p-4">
  <p>Contenido con esquinas suaves</p>
</Squircle>

// Con variante específica
<Squircle variant="strong" className="bg-blue-500 p-6">
  <h2>Squircle fuerte</h2>
</Squircle>

// Como otro elemento HTML
<Squircle as="button" variant="medium" onClick={handleClick} className="btn">
  Botón con squircle
</Squircle>

// Compatibilidad con smoothing (legacy)
<Squircle smoothing={0.8} className="bg-green-500 p-4">
  <p>Se mapea automáticamente a variant="strong"</p>
</Squircle>
```

### 2. Hook useSquircle

```tsx
import { useSquircle } from '@/lib/hooks/useSquircle';

const MyComponent = () => {
  // Con presets
  const { smoothing, scaledSmoothing } = useSquircle({
    preset: 'ios', // 'none' | 'subtle' | 'medium' | 'ios' | 'strong' | 'full'
    scale: 0.8 // Para elementos anidados
  });
  
  // Con smoothing personalizado
  const { smoothing } = useSquircle({
    customSmoothing: 0.7
  });
  
  return (
    <Squircle smoothing={smoothing}>
      <Squircle smoothing={scaledSmoothing}>
        Elemento anidado
      </Squircle>
    </Squircle>
  );
};
```

## Variantes Disponibles

| Variante  | Border-radius | Descripción                     | Uso Recomendado           |
|-----------|---------------|---------------------------------|---------------------------|
| `sm`      | 12px          | Para iconos y elementos pequeños| Avatares, badges          |
| `subtle`  | 16px          | Squircle sutil                  | Botones pequeños          |
| `medium`  | 24px          | **Default** - Efecto balanceado| Cards principales, modals |
| `ios`     | 24px          | Alias de medium                 | Compatibilidad iOS        |
| `strong`  | 32px          | Squircle pronunciado            | Elementos destacados      |

**🎯 Efecto Real**: Todas las variantes usan **SVG masks** para crear el verdadero efecto squircle (super-elipse), no solo border-radius variable.

## Clases CSS Utilitarias

Además del componente, puedes usar clases CSS directamente:

```html
<!-- Presets predefinidos -->
<div class="squircle-ios bg-white p-4">Contenido</div>
<div class="squircle-strong bg-blue-500 p-6">Contenido</div>

<!-- Tamaños combinados -->
<div class="squircle-ios squircle-lg bg-white p-4">Card grande</div>
<div class="squircle-subtle squircle-sm bg-gray-100 p-2">Badge pequeño</div>
```

## Integración en Componentes Existentes

### ActionCard

```tsx
<ActionCard
  title="Kassieren"
  subtitle="Verkauf starten"
  smoothingPreset="ios"
  emoji="🧾"
  isPrimary={true}
  onClick={handleClick}
/>

// ActionCard secundaria
<ActionCard
  title="Produkte"
  subtitle="245 Artikel"
  smoothingPreset="ios"
  emoji="📦"
  isPrimary={false}
  onClick={handleClick}
/>
```

**Estilos aplicados:**
- Dimensiones: 188x188px (aspecto cuadrado)
- Border-radius: 24px (smoothing 0.6)
- Sombra: `0px 7px 29px 0px rgba(100, 100, 111, 0.20)`
- Background: Brand-500 (primaria) o White (secundaria)

### ActiveCustomers

```tsx
<ActiveCustomers
  data={shopActivity}
  smoothingPreset="strong"
  loading={false}
/>
```

## Implementación Técnica

### Cómo Funciona

1. **SVG Mask Real**: Usa `mask-image` CSS con SVG pre-generados para cada variante
2. **Super-elipse**: Path SVG optimizado con curvas quadráticas (`Q`) para suavidad orgánica
3. **Fallback Robusto**: Si el navegador no soporta `mask`, mantiene `border-radius` visible
4. **Performance**: CSS puro sin JavaScript, aceleración por hardware activada

### Path SVG Utilizado

```svg
<!-- Ejemplo variante medium -->
<path d="M50,0 L150,0 Q200,0 200,50 L200,150 Q200,200 150,200 L50,200 Q0,200 0,150 L0,50 Q0,0 50,0" />
```

**Explicación del Path:**
- `M50,0`: Comienza en esquina superior con radio de 50px
- `Q200,0 200,50`: Curva quadrática hacia la esquina superior derecha
- El patrón se repite para crear 4 esquinas orgánicas perfectas

### Navegadores Soportados

- ✅ **Chrome/Edge**: Soporte completo
- ✅ **Firefox**: Soporte completo
- ✅ **Safari**: Soporte completo (nativo en iOS)
- ✅ **Fallback**: Border-radius normal en navegadores antiguos

## Mejores Prácticas

### 1. Consistencia
```tsx
// ✅ Correcto: Usar el mismo preset en toda la aplicación
const cardPreset = 'ios';

// ❌ Incorrecto: Mezclar valores aleatorios
// No usar smoothing={0.4}, smoothing={0.7}, smoothing={0.9} sin criterio
```

### 2. Jerarquía Visual
```tsx
// ✅ Correcto: Smoothing más fuerte para elementos principales
<Squircle smoothing={0.6}>      // Card principal
  <Squircle smoothing={0.4}>    // Elemento secundario
    <Squircle smoothing={0.2}>  // Elemento terciario
    </Squircle>
  </Squircle>
</Squircle>
```

### 3. Performance
```tsx
// ✅ Correcto: Usar presets para valores comunes
const { smoothing } = useSquircle({ preset: 'ios' });

// ✅ Correcto: Memoizar cálculos complejos
const squircleValues = useMemo(() => 
  useSquircle({ customSmoothing: complexCalculation() }), 
  [dependency]
);
```

### 4. Accesibilidad
```tsx
// ✅ Correcto: Mantener áreas táctiles adecuadas
<Squircle 
  as="button"
  smoothing={0.6}
  className="min-h-[44px] min-w-[44px] p-3" // Mínimo 44px para touch
>
  Botón accesible
</Squircle>
```

## Casos de Uso Comunes

### Cards y Contenedores
```tsx
<Squircle smoothing={0.6} className="bg-white shadow-lg p-6">
  <h2>Título de la Card</h2>
  <p>Contenido principal...</p>
</Squircle>
```

### Botones
```tsx
<Squircle 
  as="button"
  smoothing={0.5}
  className="bg-blue-500 text-white px-6 py-3 hover:bg-blue-600"
>
  Botón de Acción
</Squircle>
```

### Avatares y Elementos Circulares
```tsx
<Squircle 
  smoothing={0.8}
  className="w-12 h-12 bg-gray-300 flex items-center justify-center"
>
  👤
</Squircle>
```

### Modals y Overlays
```tsx
<Squircle 
  smoothing={0.6}
  className="bg-white max-w-md mx-auto p-8 shadow-xl"
>
  <h1>Modal con Esquinas Suaves</h1>
  {/* Contenido del modal */}
</Squircle>
```

## Troubleshooting

### Problema: No veo diferencia visual
**Solución**: Incrementa el valor de smoothing o usa un preset más fuerte como `strong` o `full`.

### Problema: Performance lenta
**Solución**: 
- Evita cambiar smoothing dinámicamente en animaciones
- Usa presets en lugar de cálculos complejos
- Considera usar clases CSS para elementos estáticos

### Problema: No funciona en navegador X
**Solución**: El componente tiene fallback automático a `border-radius`. Verifica que las clases CSS base estén aplicadas.

### Problema: Elementos anidados se ven mal
**Solución**: Usa `scaledSmoothing` del hook o ajusta manualmente:
```tsx
const { smoothing, scaledSmoothing } = useSquircle({ 
  preset: 'ios', 
  scale: 0.8 
});
```

## Contribuir

Para mejoras o nuevas funcionalidades:

1. Agrega casos de prueba en `SquircleShowcase`
2. Actualiza esta documentación
3. Considera el impacto en performance
4. Mantén compatibilidad con fallbacks

---

**Nota**: Este sistema está inspirado en el corner smoothing de iOS y las mejores prácticas de diseño moderno de interfaces móviles. 