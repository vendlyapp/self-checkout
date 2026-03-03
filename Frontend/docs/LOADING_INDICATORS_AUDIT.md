# Auditoría de indicadores de carga (loaders / spinners)

## Componente estandarizado

- **`@/components/ui/Loader`**  
  - Tamaños: `xs` | `sm` | `md` | `lg` | `xl`  
  - Variantes: `spinner` | `dots` | `fullscreen` | `inline`  
  - Colores: `brand` | `white` | `gray`  
  - Uso recomendado: `<Loader size="lg" />`, `<Loader variant="fullscreen" message="Wird geladen..." />`

---

## Resumen por tipo

| Tipo | Cantidad aprox. | Descripción |
|------|------------------|-------------|
| **Loader (componente UI)** | 1 componente, ~12 usos | Loader central en `components/ui/Loader.tsx` |
| **Loader2 (Lucide)** | ~15 usos | Icono Loader2 + `animate-spin` |
| **Div custom (border spinner)** | ~25 usos | `<div className="animate-spin rounded-full ... border-b-2 ...">` |

---

## Archivos que ya usan `Loader` (estandarizado)

- `app/(dashboard)/sales/invoices/page.tsx` – `<Loader size="lg" />`
- `app/(dashboard)/sales/orders/page.tsx` – `<Loader size="lg" />`
- `app/(dashboard)/sales/verkaufe/page.tsx` – `<Loader size="lg" />`
- `app/(dashboard)/my-qr/page.tsx` – `<Loader size="md" />`, `<Loader size="sm" />`
- `app/(auth)/login/page.tsx` – `<Loader variant="fullscreen" />`, Loader en botón
- `components/dashboard/store/StoreSettingsForm.tsx` – `<Loader size="lg" />`, `<Loader size="sm" />`
- `components/dashboard/editProduct/EditForm.tsx` – `<Loader size="lg" />`
- `components/user/PaymentP.tsx` – `<Loader size="xl" />`

---

## Archivos a estandarizar (usar `Loader` en lugar de Loader2 o div custom)

### Loader2 (Lucide)

- `app/(dashboard)/store/invoice/page.tsx` – Loader2 → `<Loader size="lg" />`
- `app/(auth)/login/page.tsx` – Loader2 en botón → `<Loader size="sm" color="white" />` (o inline)
- `app/(auth)/register/page.tsx` – Loader2 → `<Loader size="xs" />`
- `app/invoice/public/[token]/page.tsx` – Loader2 → `<Loader size="lg" />`
- `components/dashboard/store/ConfigurePaymentMethodModal.tsx` – Loader2 → `<Loader size="xs" />`
- `components/admin/stores/StoreQRManagement.tsx` – Loader2 → `<Loader size="lg" />` / `<Loader size="xs" />`
- `components/user/QRScannerModal.tsx` – Loader2 → `<Loader size="sm" />`
- `components/dashboard/categories/CategoryFormPage.tsx` – Loader2 → `<Loader size="md" color="white" />`
- `components/dashboard/home/LoadingProductsModal.tsx` – Loader2 → `<Loader size="lg" />`
- `components/auth/ProtectedRoute.tsx` – Loader2 → `<Loader size="lg" />`
- `app/auth/callback/page.tsx` – Loader2 → `<Loader size="lg" />`
- `components/auth/GoogleLoginButton.tsx` – Loader2 → `<Loader size="sm" />`
- `components/admin/common/AdminDataState.tsx` – usa Loader2 como icono → puede usar `<Loader size="md" />`

### Div custom (animate-spin + border)

- `app/(dashboard)/store/customers/page.tsx` – div h-12 → `<Loader size="lg" />`
- `app/(dashboard)/store/customers/[id]/page.tsx` – div h-12 → `<Loader size="lg" />`
- `components/dashboard/categories/CategoriesListComponent.tsx` – 2 divs → `<Loader size="md" />` / `<Loader size="sm" />`
- `components/dashboard/categories/CategoriesPage.tsx` – div h-12 → `<Loader size="lg" />`
- `app/(auth)/check-email/page.tsx` – div h-12 → `<Loader size="lg" />`
- `components/orders/CancelOrderModal.tsx` – div h-4 white → `<Loader size="xs" color="white" />`
- `components/dashboard/discounts/DeleteDiscountCodeModal.tsx` – div h-4 white → `<Loader size="xs" color="white" />`
- `components/dashboard/categories/DeleteCategoryModal.tsx` – div h-4 white → `<Loader size="xs" color="white" />`
- `components/dashboard/store/DeactivatePaymentMethodModal.tsx` – div h-4 white → `<Loader size="xs" color="white" />`
- `components/dashboard/categories/ToggleCategoryModal.tsx` – div h-4 white → `<Loader size="xs" color="white" />`
- `app/super-admin/stores/[id]/page.tsx` – div h-12 → `<Loader size="lg" />`
- `app/super-admin/stores/page.tsx` – div h-12 → `<Loader size="lg" />`
- `app/super-admin/products/page.tsx` – div h-12 → `<Loader size="lg" />`
- `app/super-admin/users/page.tsx` – div h-12 → `<Loader size="lg" />`
- `app/products_list/page.tsx` – 2 divs → `<Loader size="lg" />` / `<Loader size="md" />`
- `app/categories/add/page.tsx` – div h-10 → `<Loader size="md" />`
- `app/categories/page.tsx` – 2 divs → `<Loader size="lg" />` / `<Loader size="md" />`
- `components/dashboard/home/SearchResultsSection.tsx` – div w-6 h-6 → `<Loader size="sm" />`

### Otros (dentro de botones o overlays)

- `components/user/PaymentP.tsx` – div custom + Loader; ya usa Loader en pantalla completa; los pequeños pueden ser `<Loader size="xs" color="white" />`
- `components/admin/layout/SuperAdminHeader.tsx` – div red → `<Loader size="xs" color="gray" />` o variante
- `components/admin/stores/StoreConfiguration.tsx` – div white → `<Loader size="xs" color="white" />`
- `components/user/PromotionCard.tsx` – div white → `<Loader size="xs" color="white" />`
- `components/ui/LogoutModal.tsx` – div brand → `<Loader size="xs" />`
- `components/user/SearchUser.tsx` – div brand → `<Loader size="sm" />`

---

## Conclusión

- **1** componente estándar: `Loader` en `components/ui/Loader.tsx`.
- **2** familias no estándar: **Loader2** (Lucide) y **div con animate-spin + border**.
- Estandarizar = reemplazar todos los usos anteriores por `<Loader size="..." color="..." />` (y `variant="fullscreen"` donde aplique).

---

## Estandarización aplicada (primera tanda)

Reemplazados por `Loader`:

- `app/(dashboard)/store/invoice/page.tsx` – Loader2 → Loader lg
- `app/(dashboard)/store/customers/page.tsx` – div → Loader lg
- `app/(dashboard)/store/customers/[id]/page.tsx` – div → Loader lg
- `components/dashboard/categories/CategoriesListComponent.tsx` – 2 divs → Loader md / sm
- `components/dashboard/categories/CategoriesPage.tsx` – div → Loader lg
- `components/dashboard/home/LoadingProductsModal.tsx` – Loader2 → Loader lg
- `components/dashboard/home/SearchResultsSection.tsx` – div → Loader sm
- `components/orders/CancelOrderModal.tsx` – div white → Loader xs white
- `components/dashboard/discounts/DeleteDiscountCodeModal.tsx` – div white → Loader xs white
- `components/dashboard/categories/DeleteCategoryModal.tsx` – div white → Loader xs white
- `components/dashboard/store/DeactivatePaymentMethodModal.tsx` – div white → Loader xs white
- `components/dashboard/categories/ToggleCategoryModal.tsx` – div white → Loader xs white

Quedan por estandarizar (ver listas arriba): login/register/check-email, invoice/public, ConfigurePaymentMethodModal, StoreQRManagement, QRScannerModal, CategoryFormPage, ProtectedRoute, auth/callback, GoogleLoginButton, super-admin pages, products_list, categories/add, categories/page, PaymentP, SuperAdminHeader, StoreConfiguration, PromotionCard, LogoutModal, SearchUser, AdminDataState.
