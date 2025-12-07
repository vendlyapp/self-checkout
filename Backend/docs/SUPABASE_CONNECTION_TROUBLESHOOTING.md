# Solución de Problemas de Conexión con Supabase

## Error XX000: "DbHandler exited"

Este error ocurre cuando Supabase cierra la conexión a la base de datos. Es común y generalmente se debe a:

### Causas Comunes

1. **Límites de Conexiones Simultáneas**
   - Supabase tiene límites en el número de conexiones simultáneas
   - Plan gratuito: ~60 conexiones directas, ~200 con pooler
   - Si el pool tiene `max: 20`, esto puede exceder límites si hay múltiples instancias

2. **Uso del Pooler de Supabase**
   - Si usas el puerto `6543`, estás usando el pooler
   - El pooler tiene límites más estrictos de tiempo de conexión
   - Las conexiones idle se cierran automáticamente

3. **Queries que Toman Mucho Tiempo**
   - Supabase puede cerrar conexiones si las queries toman más de 30 segundos
   - Queries bloqueantes pueden causar que se cierren conexiones

### Soluciones Implementadas

1. **Reducción de Conexiones Máximas**
   - Desarrollo: `max: 5` conexiones
   - Producción: `max: 10` conexiones
   - Esto reduce la probabilidad de exceder límites

2. **Reducción de Tiempo Idle**
   - `idleTimeoutMillis: 20000` (20 segundos)
   - Libera conexiones más rápido cuando no se usan

3. **Reintentos Automáticos**
   - La función `query()` ahora reintenta automáticamente en caso de error de conexión
   - Espera 500ms entre reintentos

4. **Mejor Manejo de Errores**
   - Los errores XX000 ya no se loguean como errores críticos
   - El pool reconecta automáticamente

### Recomendaciones

1. **Verificar tu DATABASE_URL**
   ```bash
   # Si usas pooler (puerto 6543):
   DATABASE_URL=postgresql://user:pass@host:6543/db?pgbouncer=true
   
   # Si usas conexión directa (puerto 5432):
   DATABASE_URL=postgresql://user:pass@host:5432/db
   ```

2. **Usar Pooler en Producción**
   - El pooler es más eficiente para aplicaciones con muchas conexiones
   - Cambia el puerto a `6543` en tu DATABASE_URL

3. **Monitorear Conexiones**
   - Revisa el dashboard de Supabase para ver cuántas conexiones estás usando
   - Si excedes límites frecuentemente, considera actualizar tu plan

4. **Optimizar Queries**
   - Asegúrate de que las queries no tomen más de 30 segundos
   - Usa índices en las columnas que se usan en WHERE clauses
   - Evita queries bloqueantes

### El Error es Normal

**Importante**: Este error es común y generalmente no es crítico. El pool de conexiones maneja automáticamente la reconexión. Si ves este error ocasionalmente, es normal. Solo deberías preocuparte si:

- El error ocurre constantemente (más de 1 vez por minuto)
- Las queries fallan frecuentemente
- El servidor se cae por este error

