# Product Form Components

Esta carpeta contiene los componentes para crear y editar productos, organizados de manera modular y reutilizable.

## 📁 Estructura de Archivos

```
createProduct/
├── Form.tsx              # Componente principal que maneja la lógica
├── MobileForm.tsx        # UI específica para dispositivos móviles
├── DesktopForm.tsx       # UI específica para escritorio
├── types.ts              # Tipos e interfaces centralizados
├── validations.ts        # Funciones de validación centralizadas
├── constants.ts          # Constantes y datos estáticos
├── index.ts              # Exportaciones centralizadas
└── README.md             # Documentación
```

## 🚀 Uso

### Uso Básico
```tsx
import { Form } from '@/components/dashboard/createProduct';

// Para móvil
<Form isDesktop={false} />

// Para desktop
<Form isDesktop={true} />
```

### Uso con Detección Automática
```tsx
import { Form } from '@/components/dashboard/createProduct';
import { useResponsive } from '@/lib/hooks';

function MyComponent() {
  const { isMobile } = useResponsive();

  return <Form isDesktop={!isMobile} />;
}
```

### Uso de Componentes Individuales
```tsx
import { MobileForm, DesktopForm, SharedFormProps } from '@/components/dashboard/createProduct';

// Usar directamente MobileForm o DesktopForm
<MobileForm {...formProps} />
<DesktopForm {...formProps} />
```

## 🏗️ Arquitectura

### Form.tsx (Componente Principal)
- Maneja toda la lógica de estado
- Contiene las funciones de validación
- Pasa props a los componentes de UI
- Decide qué layout renderizar basado en `isDesktop`

### MobileForm.tsx & DesktopForm.tsx
- Componentes puramente de presentación
- Reciben props del componente principal
- No manejan lógica de negocio
- Optimizados para sus respectivos dispositivos

### types.ts
- Contiene todas las interfaces y tipos
- `SharedFormProps`: Props compartidas entre MobileForm y DesktopForm
- `FormProps`: Props del componente principal
- Otros tipos específicos del dominio

### validations.ts
- Funciones de validación reutilizables
- `validateField`: Validación de campos individuales
- `validateVariants`: Validación de variantes
- `createProductObject`: Creación del objeto producto

### constants.ts
- Datos estáticos como categorías y tasas de IVA
- Pasos de progreso para la simulación de guardado
- Configuraciones que no cambian

## ✨ Ventajas de esta Arquitectura

1. **Separación de Responsabilidades**: Cada archivo tiene una función específica
2. **Reutilización**: Los tipos y validaciones se pueden usar en otros componentes
3. **Mantenibilidad**: Fácil modificar lógica sin afectar la UI
4. **Escalabilidad**: Fácil agregar nuevos layouts o funcionalidades
5. **Type Safety**: TypeScript garantiza consistencia en toda la aplicación
6. **Testing**: Cada parte se puede testear independientemente

## 🔧 Personalización

### Agregar Nuevas Validaciones
```tsx
// En validations.ts
export const validateNewField = (value: string): string | undefined => {
  if (!value) return "Campo requerido";
  return undefined;
};
```

### Agregar Nuevas Categorías
```tsx
// En constants.ts
export const CATEGORIES: Category[] = [
  // ... categorías existentes
  { value: "Nueva Categoría", color: "bg-blue-50 text-blue-700" },
];
```

### Agregar Nuevo Layout
```tsx
// Crear TabletForm.tsx
export default function TabletForm(props: SharedFormProps) {
  // Implementación específica para tablet
}

// En Form.tsx
{isTablet ? (
  <TabletForm {...sharedProps} />
) : isDesktop ? (
  <DesktopForm {...sharedProps} />
) : (
  <MobileForm {...sharedProps} />
)}
```
