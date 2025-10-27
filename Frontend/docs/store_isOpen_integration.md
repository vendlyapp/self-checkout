# 📱 Integración Frontend: Control de Estado de Tienda (isOpen)

## ✅ Lo que se implementó

### 1. Store actualizado (`lib/stores/storeState.ts`)

**Nuevas funcionalidades:**

- ✨ **`toggleStore()`** - Ahora es asíncrono y actualiza el backend
- ✨ **`fetchStoreStatus()`** - Obtiene el estado actual desde la API
- ✨ **`setStoreStatus(isOpen)`** - Establece el estado y lo sincroniza con backend
- ✨ **Estados de carga** - `isLoading` y `error` para UI
- ✨ **Actualización optimista** - UI se actualiza inmediatamente, luego se confirma con backend

### 2. Componente actualizado (`GreetingSection.tsx`)

**Cambios:**

- ✅ Carga el estado de la tienda al montar el componente
- ✅ Maneja estados de carga (deshabilita botón mientras carga)
- ✅ Actualiza tanto el estado local como el backend
- ✅ Muestra errores si falla la actualización

## 🔄 Flujo de funcionamiento

### 1. Al cargar la página

```typescript
useEffect(() => {
  fetchStoreStatus(); // Obtiene el estado real desde el backend
}, [fetchStoreStatus]);
```

1. Componente monta
2. Llama a `fetchStoreStatus()`
3. Obtiene token de Supabase
4. Hace GET a `/api/store/my-store`
5. Actualiza el estado local con `isOpen` de la BD

### 2. Al hacer click en el botón

```typescript
onClick={async () => {
  await toggleStore();
  onToggleStore?.();
}}
```

**Proceso completo:**

1. **Actualización Optimista** (inmediato)
   - Cambia el estado local inmediatamente
   - UI se actualiza al instante

2. **Sincronización con Backend** (asíncrono)
   - Obtiene token de Supabase
   - Hace PATCH a `/api/store/my-store/status`
   - Envía `{ isOpen: true/false }`

3. **Manejo de Errores**
   - Si falla, revierte el cambio local
   - Muestra mensaje de error
   - El usuario puede intentar de nuevo

## 📊 Estados del Store

```typescript
interface StoreState {
  isStoreOpen: boolean;    // Estado actual (local + backend)
  lastUpdated: string;      // Timestamp de última actualización
  isLoading: boolean;       // ¿Está cargando?
  error: string | null;     // Mensaje de error si hay
}
```

## 🎯 Endpoints usados

### GET `/api/store/my-store`
- **Propósito:** Obtener información de la tienda actual
- **Autenticación:** Requerida (Bearer token)
- **Respuesta:** 
  ```json
  {
    "success": true,
    "data": {
      "id": "...",
      "name": "...",
      "isOpen": true,
      ...
    }
  }
  ```

### PATCH `/api/store/my-store/status`
- **Propósito:** Actualizar el estado isOpen de la tienda
- **Autenticación:** Requerida (Bearer token)
- **Body:**
  ```json
  {
    "isOpen": true
  }
  ```
- **Respuesta:**
  ```json
  {
    "success": true,
    "data": {
      "id": "...",
      "isOpen": true,
      ...
    },
    "message": "Tienda abierta"
  }
  ```

## 🛡️ Manejo de Errores

### Si falla la conexión

```typescript
try {
  await updateStoreStatusInBackend(newStatus);
} catch (error) {
  // Revierte el cambio local
  set({
    isStoreOpen: !newStatus,
    error: 'Error al cambiar estado de la tienda',
  });
}
```

### Estados de UI

```typescript
// Durante carga
<button disabled={isLoading} ...>
  {isLoading ? 'Actualizando...' : 'Toggle'}
</button>

// Si hay error
{storeError && (
  <div className="text-red-500">
    {storeError}
  </div>
)}
```

## 🔐 Autenticación

El store usa Supabase para obtener el token:

```typescript
const getToken = async (): Promise<string | undefined> => {
  const { supabase } = await import('@/lib/supabase/client');
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};
```

Este token se envía en el header:

```typescript
headers['Authorization'] = `Bearer ${token}`;
```

## 📱 Cómo usar en otros componentes

```typescript
import { useStoreState } from '@/lib/stores';

const MyComponent = () => {
  const { 
    isStoreOpen, 
    toggleStore, 
    fetchStoreStatus,
    isLoading 
  } = useStoreState();

  // Cargar estado al montar
  useEffect(() => {
    fetchStoreStatus();
  }, [fetchStoreStatus]);

  // Usar el estado
  return (
    <button onClick={() => toggleStore()} disabled={isLoading}>
      {isStoreOpen ? 'Abierta' : 'Cerrada'}
    </button>
  );
};
```

## 🧪 Probar la integración

### 1. Verifica que el backend esté corriendo

```bash
cd Backend
npm run dev
```

### 2. Verifica que el frontend esté corriendo

```bash
cd Frontend
npm run dev
```

### 3. Prueba el flujo

1. Inicia sesión en el dashboard
2. El estado de la tienda se carga automáticamente
3. Haz click en el toggle
4. Verifica en la consola del navegador:
   - Request a `/api/store/my-store/status`
   - Response con `success: true`
5. Verifica en la BD:

```bash
node scripts/test_store_isopen.js
```

## 🐛 Debug

### Si no funciona:

1. **Verifica el token:**
   ```typescript
   console.log('Token:', await getToken());
   ```

2. **Verifica la URL de la API:**
   ```bash
   # En .env del Frontend
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

3. **Verifica la respuesta del backend:**
   - Abre DevTools → Network
   - Busca las requests a `/api/store/my-store`
   - Verifica el status code y response

4. **Revisa los logs del backend:**
   - Los errores aparecerán en la consola del servidor

## 🎉 Resultado

Ahora cuando cambies el estado del botón:

1. ✅ La UI se actualiza inmediatamente (optimistic update)
2. ✅ El cambio se persiste en la base de datos
3. ✅ Si hay error, se revierte el cambio
4. ✅ El estado se carga desde el backend al recargar la página

