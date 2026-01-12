# Sistema Unificado de Animaciones iOS

Este documento describe el sistema unificado de animaciones tipo iOS para toda la aplicación.

## Clases de Transición

### Clases Principales (Usar estas)
- `transition-ios` - Transición estándar (250ms)
- `transition-ios-fast` - Transición rápida (150ms) - Para micro-interacciones
- `transition-ios-slow` - Transición lenta (350ms) - Para transiciones de página
- `transition-ios-spring` - Transición con rebote (400ms) - Para elementos destacados

### Clases de Compatibilidad (Deprecadas)
- `transition-smooth` → Usar `transition-ios`
- `transition-fast` → Usar `transition-ios-fast`
- `transition-slow` → Usar `transition-ios-slow`
- `transition-page` → Usar `transition-ios-slow`
- `transition-interactive` → Usar `transition-ios`

## Clases de Animación

### Entrada
- `animate-fade-in` - Fade in suave
- `animate-slide-in-up` - Desliza desde abajo
- `animate-slide-in-down` - Desliza desde arriba
- `animate-slide-in-right` - Desliza desde la derecha
- `animate-slide-in-left` - Desliza desde la izquierda
- `animate-scale-in` - Escala desde pequeño
- `animate-spring-bounce` - Entrada con rebote

### Salida
- `animate-fade-out` - Fade out suave
- `animate-slide-out-up` - Desliza hacia arriba
- `animate-slide-out-down` - Desliza hacia abajo
- `animate-slide-out-right` - Desliza hacia la derecha
- `animate-slide-out-left` - Desliza hacia la izquierda
- `animate-scale-out` - Escala hacia pequeño

### Especiales
- `animate-stagger-fade-in` - Para listas con delay escalonado (usar con `useStaggerAnimation`)
- `animate-shimmer` - Efecto shimmer para loading
- `animate-float` - Animación flotante continua

## Guía de Migración

### Reemplazar transiciones Tailwind

**Antes:**
```tsx
className="transition-all duration-200"
className="transition-colors duration-150"
className="transition-all duration-300"
```

**Después:**
```tsx
className="transition-ios"
className="transition-ios-fast"
className="transition-ios-slow"
```

### Reemplazar animaciones personalizadas

**Antes:**
```tsx
className="animate-fade-in-scale"
className="animate-slide-up-fade"
```

**Después:**
```tsx
className="animate-scale-in"
className="animate-slide-in-up"
```

## Ejemplos de Uso

### Botones
```tsx
<button className="transition-ios-fast active:scale-90 hover:shadow-md">
  Click me
</button>
```

### Cards
```tsx
<div className="transition-ios hover:shadow-lg active:scale-[0.98]">
  Card content
</div>
```

### Listas con animación escalonada
```tsx
import { useStaggerAnimation } from '@/lib/utils/iosAnimations';

const { getItemStyle } = useStaggerAnimation(items.length, 40);

{items.map((item, index) => (
  <div 
    key={item.id}
    className="animate-stagger-fade-in"
    style={getItemStyle(index)}
  >
    {item.content}
  </div>
))}
```

### Modales
```tsx
<div className="animate-scale-in">
  Modal content
</div>
```

## Curvas de Easing

El sistema usa curvas de easing tipo iOS:
- **Estándar**: `cubic-bezier(0.4, 0.0, 0.2, 1)` - Para la mayoría de transiciones
- **Entrada**: `cubic-bezier(0.0, 0.0, 0.2, 1)` - Para elementos que aparecen
- **Salida**: `cubic-bezier(0.4, 0.0, 1, 1)` - Para elementos que desaparecen
- **Spring**: `cubic-bezier(0.34, 1.56, 0.64, 1)` - Para rebotes y elementos destacados
- **Touch**: `cubic-bezier(0.2, 0.0, 0, 1)` - Para interacciones táctiles rápidas

## Accesibilidad

El sistema respeta `prefers-reduced-motion` automáticamente. Todas las animaciones se desactivan cuando el usuario prefiere movimiento reducido.

## Mejores Prácticas

1. **Usar `transition-ios-fast`** para botones y elementos interactivos
2. **Usar `transition-ios`** para la mayoría de elementos
3. **Usar `transition-ios-slow`** solo para transiciones de página
4. **Usar `active:scale-90` o `active:scale-[0.98]`** para feedback táctil
5. **Evitar animaciones excesivas** - Menos es más
6. **Usar `animate-stagger-fade-in`** para listas largas con `useStaggerAnimation`

