# 🧱 UI Components Kit

**Sistema de componentes base con Shadcn/ui + TailwindCSS**  
Kit de componentes reutilizables optimizados para mobile-first en Vendly Self-Checkout.

## 📋 Componentes Disponibles

```
ui/
├── badge.tsx                    # Badges y etiquetas  
├── button.tsx                   # Botones con variantes
├── card.tsx                     # Cards contenedores
├── dialog.tsx                   # Modales y diálogos
├── form.tsx                     # Formularios con validación
├── input.tsx                    # Inputs de texto
├── label.tsx                    # Labels accesibles
├── search-input.tsx             # Input de búsqueda especializado
├── select.tsx                   # Selectores dropdown
├── separator.tsx                # Separadores visuales
├── skeleton.tsx                 # Skeleton base de Shadcn
├── table.tsx                    # Tablas responsive
└── tabs.tsx                     # Navegación por tabs
```

## 🎯 Componentes Base

### **Button**
**Botón versátil con múltiples variantes**

```tsx
import { Button } from '@/components/ui/button';

// Variantes principales
<Button variant="default">Kassieren</Button>
<Button variant="secondary">Produkte</Button>
<Button variant="destructive">Löschen</Button>
<Button variant="outline">Abbrechen</Button>
<Button variant="ghost">Mehr</Button>

// Tamaños
<Button size="default">Standard</Button>
<Button size="sm">Klein</Button>
<Button size="lg">Groß</Button>
<Button size="icon">🛒</Button>
```

**Optimizaciones Mobile:**
- ✅ **Touch targets**: Mínimo 44px altura
- ✅ **Tap highlight**: `tap-highlight-transparent`
- ✅ **Active states**: Feedback visual inmediato
- ✅ **Loading states**: Spinner integrado

---

### **Card**
**Contenedor flexible para secciones**

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

<Card className="rounded-2xl border-border/50">
  <CardHeader>
    <h3 className="text-lg font-semibold">Título</h3>
  </CardHeader>
  <CardContent>
    <p>Contenido del card</p>
  </CardContent>
  <CardFooter>
    <Button>Acción</Button>
  </CardFooter>
</Card>
```

**Características:**
- ✅ **Bordes redondeados**: `rounded-2xl` para mobile
- ✅ **Shadows sutiles**: Elevación consistente
- ✅ **Padding optimizado**: Espaciado para touch
- ✅ **Composición flexible**: Header, content, footer

---

### **Input & SearchInput**
**Inputs optimizados para móvil**

```tsx
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';

// Input estándar
<Input 
  type="text"
  placeholder="Nombre del producto"
  className="h-12 text-base"
/>

// Search input especializado
<SearchInput 
  placeholder="Buscar productos..."
  onSearch={(query) => console.log(query)}
  loading={isSearching}
/>
```

**Mobile Optimizations:**
- ✅ **Altura mínima 44px**: Touch-friendly
- ✅ **Font size 16px+**: Evita zoom en iOS
- ✅ **Iconos contextuales**: Search, clear, loading
- ✅ **Keyboard types**: Numérico, email, etc.

---

### **Dialog & Sheet**
**Modales optimizados para móvil**

```tsx
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-md max-w-[95vw] rounded-xl">
    <DialogHeader>
      <h2>Confirmar acción</h2>
    </DialogHeader>
    <div className="p-4">
      <p>¿Estás seguro?</p>
    </div>
    <div className="flex gap-3 p-4">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleConfirm}>
        Confirmar
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

**Mobile Features:**
- ✅ **Full width en mobile**: `max-w-[95vw]`
- ✅ **Slide animations**: Desde abajo en mobile
- ✅ **Backdrop blur**: Enfoque en contenido
- ✅ **Escape key**: Cerrar con teclado

## 🎨 Sistema de Diseño

### **Colores Principales**
```css
/* Definidos en globals.css */
--primary: #22C55F;              /* Verde principal */
--primary-foreground: #FFFFFF;   /* Texto en primary */
--secondary: #F3F4F6;            /* Gris claro */
--muted: #E5E7EB;               /* Elementos deshabilitados */
--border: #D1D5DB;              /* Bordes sutiles */
--destructive: #EF4444;         /* Rojo para errores */
```

### **Espaciado Consistente**
```css
/* Padding estándar */
p-3      /* 12px - Elementos pequeños */
p-4      /* 16px - Estándar */
p-5      /* 20px - Cards importantes */
p-6      /* 24px - Secciones grandes */

/* Gaps entre elementos */
gap-2    /* 8px - Elementos muy cercanos */
gap-3    /* 12px - Estándar */
gap-4    /* 16px - Elementos separados */
```

### **Bordes y Sombras**
```css
/* Bordes redondeados mobile-friendly */
rounded-lg     /* 8px - Elementos pequeños */
rounded-xl     /* 12px - Botones, inputs */
rounded-2xl    /* 16px - Cards principales */

/* Sombras sutiles */
shadow-sm      /* Elevación mínima */
shadow-md      /* Elevación estándar */
shadow-lg      /* Elementos flotantes */
```

## 📱 Componentes Mobile-Specific

### **SearchInput**
**Input de búsqueda con funcionalidades avanzadas**

```tsx
interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  loading?: boolean;
  debounceMs?: number;
}

<SearchInput 
  placeholder="Buscar productos, clientes..."
  onSearch={handleSearch}
  loading={isSearching}
  debounceMs={300}
/>
```

**Características especiales:**
- ✅ **Debounce integrado**: Evita búsquedas excesivas
- ✅ **Loading state**: Spinner durante búsqueda
- ✅ **Clear button**: Limpiar rápidamente
- ✅ **Keyboard shortcuts**: Enter para buscar

---

### **Mobile Form**
**Formularios optimizados para touch**

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';

<Form {...form}>
  <form onSubmit={handleSubmit} className="space-y-4">
    <FormField
      control={form.control}
      name="productName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre del producto</FormLabel>
          <FormControl>
            <Input 
              {...field} 
              className="h-12 text-base"
              placeholder="Ingresa el nombre"
            />
          </FormControl>
        </FormItem>
      )}
    />
    
    <Button type="submit" className="w-full h-12">
      Guardar producto
    </Button>
  </form>
</Form>
```

## 🔧 Uso en Dashboard

### **Integración con Dashboard Components**
```tsx
// En ActionCard.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const ActionCard = ({ icon, title, subtitle, isPrimary, onClick }) => (
  <Card className={cn(
    "rounded-2xl border-border/50 transition-fast",
    isPrimary ? "bg-primary/10" : "bg-card"
  )}>
    <CardContent className="p-5">
      <Button 
        variant={isPrimary ? "default" : "ghost"}
        onClick={onClick}
        className="w-full h-auto p-0 justify-start"
      >
        <div className="flex items-center gap-3">
          {icon}
          <div className="text-left">
            <div className="font-medium">{title}</div>
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          </div>
        </div>
      </Button>
    </CardContent>
  </Card>
);
```

### **Modal para Acciones**
```tsx
// Confirmación de acciones críticas
const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, itemName }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <h3 className="text-lg font-semibold">Producto löschen</h3>
      </DialogHeader>
      
      <div className="py-4">
        <p className="text-gray-600">
          Möchten Sie "{itemName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
      </div>
      
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Abbrechen
        </Button>
        <Button variant="destructive" onClick={onConfirm} className="flex-1">
          Löschen
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
```

## 📊 Componentes de Datos

### **Table (Mobile Responsive)**
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<div className="overflow-x-auto">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Producto</TableHead>
        <TableHead>Precio</TableHead>
        <TableHead>Stock</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {products.map(product => (
        <TableRow key={product.id}>
          <TableCell className="font-medium">{product.name}</TableCell>
          <TableCell>€{product.price}</TableCell>
          <TableCell>{product.stock}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### **Badge para Estados**
```tsx
import { Badge } from '@/components/ui/badge';

// Estados de productos
<Badge variant="default">Activo</Badge>
<Badge variant="secondary">Agotado</Badge>
<Badge variant="destructive">Descontinuado</Badge>

// Estados de ventas
<Badge variant="default">Completado</Badge>
<Badge variant="outline">Pendiente</Badge>
```

## 🚀 Customización

### **Extending Base Components**
```tsx
// Crear variantes específicas del proyecto
const PrimaryActionButton = ({ children, ...props }) => (
  <Button 
    variant="default"
    size="lg"
    className="h-12 rounded-xl font-medium tap-highlight-transparent"
    {...props}
  >
    {children}
  </Button>
);

const DashboardCard = ({ children, ...props }) => (
  <Card 
    className="rounded-2xl border-border/50 bg-card shadow-sm"
    {...props}
  >
    {children}
  </Card>
);
```

### **Theme Customization**
```tsx
// En globals.css - variables CSS custom
:root {
  --vendly-primary: #22C55F;
  --vendly-background: #F2EDE8;
  --vendly-card: #FFFFFF;
  --vendly-border: #D1D5DB;
}

// Usar en componentes
.vendly-button {
  @apply bg-[var(--vendly-primary)] text-white;
}
```

## 🔍 Accesibilidad

### **ARIA Labels**
```tsx
// Botones con labels descriptivos
<Button aria-label="Abrir menú de configuración">
  <Settings className="w-5 h-5" />
</Button>

// Inputs con labels asociados
<Label htmlFor="search">Buscar productos</Label>
<Input id="search" type="search" />

// Estados de loading
<Button disabled aria-busy="true">
  <Spinner className="w-4 h-4 mr-2" />
  Cargando...
</Button>
```

### **Keyboard Navigation**
- ✅ **Tab order**: Navegación lógica con teclado
- ✅ **Focus visible**: Indicadores claros de foco
- ✅ **Escape keys**: Cerrar modales/dropdowns
- ✅ **Enter/Space**: Activar botones

---

**El sistema UI proporciona una base sólida y consistente para toda la aplicación** 🎨 