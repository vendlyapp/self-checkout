# 🚀 Guía Rápida: Control de Estado de Tienda (isOpen)

## ✅ Estado Actual

- ✅ Migración aplicada exitosamente
- ✅ Columna `isOpen` agregada a la tabla `Store`
- ✅ Endpoints creados y funcionando
- ✅ Todas las pruebas pasadas

## 📍 Endpoints Disponibles

### 1. Ver Estado de la Tienda
```bash
GET /api/store/my-store
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "ownerId": "...",
    "name": "...",
    "isOpen": true,
    ...
  }
}
```

### 2. Abrir/Cerrar Tienda
```bash
PATCH /api/store/my-store/status
Headers: { 
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
Body: { "isOpen": true }  // true = abierta, false = cerrada
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "isOpen": true,
    ...
  },
  "message": "Tienda abierta"
}
```

### 3. Actualizar Tienda (incluye isOpen)
```bash
PUT /api/store/my-store
Headers: { 
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "name": "Mi Tienda",
  "logo": "https://...",
  "isOpen": false
}
```

## 🧪 Probar con cURL

### Abrir tienda:
```bash
curl -X PATCH http://localhost:5000/api/store/my-store/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isOpen": true}'
```

### Cerrar tienda:
```bash
curl -X PATCH http://localhost:5000/api/store/my-store/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isOpen": false}'
```

## 📊 Estado de Tiendas Actual

Las siguientes tiendas están registradas y listas para usar:
- ✅ Steven Rodriguez's Store - isOpen: true
- ✅ Johan Rodríguez's Store - isOpen: true
- ✅ Admin Vendly's Store - isOpen: true

## 🎯 Próximos Pasos

### Para el Frontend:

1. Mostrar el estado `isOpen` en el dashboard
2. Crear un toggle/switch para abrir/cerrar la tienda
3. Mostrar un banner cuando la tienda esté cerrada
4. Deshabilitar la funcionalidad de agregar al carrito si `isOpen === false`

### Ejemplo de integración:

```typescript
// En tu componente de dashboard
const [store, setStore] = useState(null);

useEffect(() => {
  fetch('/api/store/my-store', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => setStore(data.data));
}, []);

const handleToggleStore = async (isOpen: boolean) => {
  await fetch('/api/store/my-store/status', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ isOpen })
  });
  // Actualizar estado local
  setStore({ ...store, isOpen });
};
```

## 🔄 Estructura de la Base de Datos

```sql
CREATE TABLE "Store" (
    "id" TEXT PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "logo" TEXT,
    "qrCode" TEXT,
    "isActive" BOOLEAN DEFAULT true,  -- Tienda desactivada del sistema
    "isOpen" BOOLEAN DEFAULT true,    -- Tienda abierta/cerrada para pedidos
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

## 📝 Notas Importantes

- `isActive`: Controla si la tienda está activa en el sistema (oculta o visible)
- `isOpen`: Controla si la tienda puede recibir pedidos (abierta o cerrada)
- Ambos campos son independientes
- Los cambios en `isOpen` actualizan automáticamente `updatedAt`

## 🛠️ Comandos Utiles

```bash
# Ver todas las tiendas con su estado
psql $DATABASE_URL -c "SELECT name, \"isOpen\", \"isActive\" FROM \"Store\";"

# Abrir una tienda específica
psql $DATABASE_URL -c "UPDATE \"Store\" SET \"isOpen\" = true WHERE slug = 'mi-tienda';"

# Cerrar una tienda específica
psql $DATABASE_URL -c "UPDATE \"Store\" SET \"isOpen\" = false WHERE slug = 'mi-tienda';"
```

