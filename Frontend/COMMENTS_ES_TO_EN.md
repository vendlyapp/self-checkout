# Comentarios español → inglés (pendientes)

Archivos que aún contienen comentarios en español. Objetivo: traducir a inglés y, donde aplique, simplificar (quitar redundantes, unificar estilo).

## Criterios

- **JSDoc / bloques**: Descripción breve en inglés.
- **Comentarios inline**: Solo cuando aclaren *por qué*, no *qué* hace el código.
- **Eliminar**: Comentarios que repiten el nombre de la función o que son obvios.

## Por carpeta

### `app/`
- `(auth)/login/page.tsx` – Ya tocado; revisar si queda algo.
- `auth/callback/page.tsx`
- `charge/page.tsx`, `charge/layout.tsx`, `charge/payment/page.tsx`
- `(dashboard)/layout.tsx`, `store/invoice/page.tsx`, `store/[slug]/layout.tsx`
- `store/[slug]/StoreContext.tsx`, `store/[slug]/cart/page.tsx`
- `product/[productId]/page.tsx`
- `categories/add/page.tsx`
- `invoice/public/[token]/page.tsx`
- `(dashboard)/sales/orders/[id]/page.tsx`, `(dashboard)/sales/invoices/[id]/page.tsx`
- `super-admin/*` (si hay comentarios ES)

### `components/`
- `admin/` – AdminLayout, EditProductModal, StorePaymentMethods, StoreQRManagement, etc.
- `auth/` – GoogleLoginButton, SessionTimeoutManager
- `dashboard/` – createProduct (Form, DesktopForm, MobileForm), editProduct (EditForm), categories, charge, store, invoice, products_list, analytics, home, sale
- `navigation/` – Header, HeaderNav, FooterNav, ResponsiveFooterNav, user/FooterNavUser, user/HeaderUser
- `orders/` – CancelOrderModal
- `ui/` – search-input, LogoutModal (solo comentarios JSX si los hay)
- `user/` – PaymentP, SnanerDash, SearchUser, Dashboard, QRScannerModal, etc.
- `invoice/` – InvoiceTemplate

### `hooks/`
- `auth/useSessionTimeout.ts`
- `queries/` – useInvoice, useRecentOrders, useProducts, useOrders, useProductsAnalytics, useOrderStats, useMyStore, useDiscountCodes, usePaymentMethods, useInvoices, useCategoryStats
- `mutations/` – useOrderMutations, useInvoiceMutations, useCategoryMutations
- `data/` – useDashboard, useAnalytics, useStoreData
- `business/` – usePromoLogic, usePromoCode

### `lib/`
- `config/` – api.ts, brand.ts
- `contexts/` – UserContext
- `services/` – productService, categoryService, orderService, invoiceService, discountCodeService, analyticsService, superAdminService
- `stores/` – storeState, cartStore
- `utils/` – safeFeedback, iosAnimations, visualFeedback, hapticFeedback, invoice-utils

### Organización y “espagueti”

- **ResponsiveHeader / Sidebar**: La lógica de logout está duplicada (mobile y tablet). Se puede extraer a un `handleLogout` único y reutilizarlo.
- **Form (createProduct)** y **EditForm**: Comentarios largos; agrupar por “fase” (validación, API, éxito) y reducir a una línea en inglés donde aporte.
- **sessionUtils**: Ya refactorizado; mantener una sola responsabilidad por función.

Buscar en el repo:
```bash
rg -l "//.*[áéíóúñ]|//.*(Guardar|Cerrar|Crear|tienda|sesión|Agregar|Filtrar|Buscar|Eliminar|Limpiar|Mostrar|Obtener|Redirigir|Verificar)" --type-add 'front:*.{ts,tsx}' -t front Frontend/
```
