# Inventario: español → alemán (Frontend)

## Resumen

Este documento lista **qué se encontró en español** y **qué se corrigió** para dejar la UI y mensajes visibles al usuario en alemán.

---

## Comentarios: español → inglés (primera pasada)

Se han pasado a **inglés** y se ha mejorado la organización en:

- **lib/utils/sessionUtils.ts** – JSDoc y comentarios en inglés; `console.warn` en inglés; constantes claras.
- **components/navigation/ResponsiveHeader.tsx** – Comentarios EN; lógica de logout sin duplicar comentarios.
- **components/navigation/Sidebar.tsx** – Comentarios EN; mismo flujo de logout simplificado.
- **app/(auth)/login/page.tsx** – Comentarios EN; eliminados los redundantes.
- **lib/auth/AuthContext.tsx** – Comentarios EN; `signOut` simplificado.
- **components/auth/ProtectedRoute.tsx** – Comentarios EN.
- **hooks/useSessionTimeout.ts** – JSDoc y comentarios EN; constantes `*_MS`.
- **lib/supabase/client.ts** – Comentarios EN.
- **lib/guards/AuthGuard.tsx** – Comentarios EN; mensaje de timeout en inglés.

Para el **resto de archivos** con comentarios en español, ver `COMMENTS_ES_TO_EN.md`.

---

## ✅ Corregido en esta revisión

### Botones y acciones
| Ubicación | Antes (ES) | Después (DE) |
|-----------|------------|--------------|
| `DesktopForm.tsx` | Descargar (QR y Barcode) | Herunterladen |

### Toasts (notificaciones)
| Ubicación | Antes (ES) | Después (DE) |
|-----------|------------|-------------|
| `useDiscountCodes.ts` | Código de descuento creado/actualizado/archivado exitosamente | Rabattcode erfolgreich erstellt/aktualisiert/archiviert |
| `useDiscountCodes.ts` | Error al crear/actualizar/archivar... Código inválido | Fehler beim... / Ungültiger Rabattcode |
| `useStoreMutations.ts` | Tienda actualizada exitosamente / Error al actualizar tienda | Geschäft erfolgreich aktualisiert / Fehler beim Aktualisieren des Geschäfts |

### Mensajes de error (throw / toast)
- **discountCodeService.ts**: todos los mensajes de error traducidos (obtener/crear/actualizar/archivar/eliminar/validar/estadísticas).
- **useStoreMutations.ts**: "No estás autenticado", "Error al actualizar tienda", "Error al regenerar QR".
- **usePaymentMethods.ts**: "Error al cargar métodos de pago" → Fehler beim Laden der Zahlungsmethoden.
- **useCategoryMutations.ts**: Error al crear/actualizar/eliminar categoría → Fehler beim Erstellen/Aktualisieren/Löschen der Kategorie.
- **useProductMutations.ts**: Error al crear/actualizar/eliminar producto, actualizar stock.
- **useCategories.ts**, **useCategoryStats.ts**: Error al obtener categorías/estadísticas.
- **useProducts.ts**, **useStoreProducts.ts**, **useProductStats.ts**, **useProductById.ts**, **useProductByQR.ts**: errores de productos.
- **useMyStore.ts**: Error al cargar tienda.
- **useOrderStats.ts**: Error al obtener estadísticas de órdenes.
- **storeState.ts**: Error al actualizar estado de la tienda.
- **useStoreData.ts**: "No se proporcionó un slug de tienda" → Es wurde kein Shop-Slug angegeben.
- **usePromoLogic.ts** / **usePromoCode.ts**: "Este código... límite de usos / no está activo" → mensajes en alemán.
- **api.ts**: "Respuesta de API inválida" → Ungültige API-Antwort.
- **EditForm.tsx**: "Precio inválido" en variantErrors → Ungültiger Preis.
- **mockProducts.ts**: mensajes de error de producto/stock.

---

## 📋 Lo que sigue en español (solo comentarios o logs)

Estos **no** son visibles para el usuario final; son comentarios o `console.error`/`console.warn` para desarrolladores. Opcionalmente puedes dejarlos en español o pasarlos a inglés/alemán más adelante.

- Comentarios en código (ej. `// Guardar la tienda`, `// Cerrar sesión`, `// Crear categoría`).
- `console.error('Error al cerrar sesión:', ...)` en AuthContext, ResponsiveHeader, Sidebar, SuperAdminHeader, sessionUtils.
- `console.error('Error al iniciar/detener el escáner')` en SnanerDash.
- `console.warn` en storeState, orderService, AuthGuard, etc.
- Comentarios en JSX (ej. `{/* Botón "Ver más" */}`).

---

## 🔍 Dónde buscar si quieres revisar más

1. **Modales**: buscar `className="...modal"`, `<Dialog`, `<div role="dialog"` y revisar todo el texto dentro.
2. **Botones**: buscar `<button`, `onClick` y el texto entre `<button>` y `</button>`.
3. **Toasts**: `toast.success(`, `toast.error(`, `toast.info(`.
4. **Mensajes de error**: `throw new Error(`, `setError(`, `alert(`.
5. **Placeholders y labels**: `placeholder="`, `label="`, `aria-label="`.

Si quieres, en la próxima iteración se puede hacer una pasada solo por modales y botones para asegurar que no quede ningún texto en español visible.
