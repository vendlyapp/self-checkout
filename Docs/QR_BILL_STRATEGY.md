# Estrategia de QR-bill (Factura QR Suiza) — selfchekout

**Última actualización:** Marzo 2026  
**Estado:** Investigación completada — pendiente diseño técnico detallado

---

## 1. Qué es la QR-bill y por qué importa

La **QR-bill** (QR-Rechnung / Swiss QR-bill) es el estándar oficial para facturación escrita en Suiza y Liechtenstein. Reemplazó definitivamente a las antiguas boletas de pago rojas y naranjas en octubre de 2022.  

Cada QR-bill contiene:
- Datos completos de pago impresos (beneficiario, IBAN, importe, referencia, etc.)
- Un **Swiss QR Code** que codifica la misma información para ser leída por apps bancarias, escáneres o sistemas de backoffice

Referencias clave:
- Generador y escáner práctico: [qr-rechnung.net](https://qr-rechnung.net/#/)
- Estándar oficial y guías de implementación: [SIX QR-bill](https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/qr-bill.html)
- Visión general de negocio: [Storecove — Swiss QR-bill overview](https://www.storecove.com/blog/en/swiss-qr-bill/#)

Para selfchekout, la QR-bill es relevante porque:
- Permite ofrecer **facturas bancarias estándar suizas** junto al pago inmediato (TWINT / tarjeta).
- Es necesaria para algunos clientes B2B que pagan desde su e-banking corporativo.
- Facilita conciliación gracias a referencias estructuradas (SCOR).

---

## 2. Requisitos principales del estándar QR-bill

Basado en las guías de SIX (IG QR-bill v2.3 y futura v2.4) y recursos públicos:

- **Dirección estructurada obligatoria** desde noviembre 2025  
  - Nombre, calle, número, código postal, ciudad, país en campos separados.
- **IBAN suizo o Liechtenstein** válido para el beneficiario.
- **Moneda**: CHF o EUR.
- **Campo de referencia**:
  - SCOR (referencia estructurada) o
  - Mensaje sin estructurar (no ambas, según combinación IBAN/SCOR).
- **Tamaño del pago section**: DIN A6 (105 x 148 mm) cuando se imprime.
- **Estilo y layout**: definido en el Style Guide oficial (tipografías, márgenes, posiciones).
- **Juego de caracteres extendido** (umlauts y caracteres especiales) soportado desde versión 2.3.

Cumplimiento:
- Validar QR-bills generadas con el **portal de validación** de SIX (enlace desde la página oficial de QR-bill de SIX).
- Seguir las reglas de layout para uso online y PDF indicadas en IG QR-bill y Style Guide.

---

## 3. Opciones de integración para selfchekout

### 3.1 Fase 1 — Generación manual (bajo volumen)

Caso de uso: pocos clientes que requieren factura bancaria ocasionalmente, sin automatización completa todavía.

Estrategia:
- Usar [qr-rechnung.net](https://qr-rechnung.net/#/) como herramienta de backoffice para el operador:
  - **Zahlteil erstellen**: crear el “Zahlteil + Empfangsschein” para un importe/cliente concreto.
  - **In Dokument einfügen**: insertar el Zahlteil en un PDF de factura generado desde nuestro sistema.
  - **Aus Tabelle generieren**: cargar un Excel exportado desde selfchekout con múltiples facturas y generar una serie de QR-bills.
- Guardar en selfchekout:
  - ID de factura interna.
  - Referencia SCOR usada.
  - Importe y estado de pago (pendiente/pagado/cancelado).

Ventajas:
- Cero desarrollo inicial.
- Permite validar proceso y necesidad real de QR-bills.

Limitaciones:
- Proceso manual/no escalable.
- No hay generación directa desde el backend.

### 3.2 Fase 2 — Generación automática en backend (Node.js)

Objetivo: generar automáticamente QR-bills (PDF o SVG) desde el backend de selfchekout, integradas con el flujo de órdenes.

Librería recomendada:
- [swissqrbill](https://github.com/schoero/swissqrbill) — generación de QR-bill en Node.js y navegador.
  - Genera:
    - PDF del Zahlteil o factura completa usando PDFKit.
    - SVG del QR-bill (para incrustar en PDFs existentes o en vistas web).
  - Soporta múltiples idiomas (DE/FR/IT/EN).

Diseño propuesto:
- Servicio `qrBillService` en el backend (Node.js):
  - Input:
    - Datos del beneficiario (cuenta bancaria de cada granjero/tienda).
    - Datos del deudor (cliente).
    - Importe y moneda.
    - Referencia estructurada ligada al `orderId`.
  - Output:
    - Buffer PDF (factura completa o solo Zahlteil).
    - URL firmada o enlace de descarga almacenado en S3/Storage.
- Flujo:
  1. Orden se crea en selfchekout (estado `PENDING_QR_BILL`).
  2. Backend genera QR-bill con `swissqrbill` y crea PDF:
     - Opción A: factura completa (cabecera + detalles + Zahlteil).
     - Opción B: solo Zahlteil, incrustado en un template PDF propio.
  3. PDF se asocia a la orden (link en dashboard y en correo al cliente).
  4. Al recibir el pago en la cuenta bancaria, se concilia usando la referencia SCOR = `orderId`/`invoiceId`.

Aspectos técnicos:
- Necesitamos **IBAN propio por comerciante** (o subcuentas controladas).
- Mapeo 1:1 entre:
  - `orderId` ↔ referencia QR-bill.
  - `merchantId` ↔ IBAN de beneficiario.
- Validar referencia y layout con herramientas de SIX.

### 3.3 Relación con Stripe / otros PSP

Stripe no es estrictamente necesario para QR-bill (es un estándar bancario, no de tarjeta), pero podemos combinar enfoques:
- Pagos inmediatos → Stripe (TWINT / tarjeta).
- Pagos diferidos por transferencia → QR-bill directa al IBAN del comerciante.

Para evitar dobles cobros:
- Al emitir QR-bill, la orden debe quedarse en estado `PENDING_BANK_TRANSFER`.
- Cuando el comerciante confirma que el pago ha llegado (o en integración futura, leyendo extractos bancarios), la orden pasa a `PAID`.

---

## 4. Integración con otros canales: eBill y TWINT

Según [qr-rechnung.net](https://qr-rechnung.net/#/) y la documentación de SIX:

### 4.1 eBill

- eBill permite enviar facturas directamente al e-banking del cliente, sin escanear QR.
- Algunos proveedores de eBill aceptan **QR-bills generadas** por herramientas como qr-rechnung.net como entrada.
- Para selfchekout:
  - Fase temprana: documentar que ciertos clientes pueden usar su proveedor eBill para registrar nuestras QR-bills.
  - Fase avanzada: integrar con un proveedor eBill (tipo Storecove u otros), usando la misma referencia que en QR-bill.

### 4.2 TWINT como “Alternative Procedure”

El estándar QR-bill soporta un campo de **“alternative procedures”** donde se pueden definir esquemas adicionales (por ejemplo, TWINT, eBill).

- TWINT puede integrarse como “Alternative Procedure” dentro del mismo QR code:
  - El QR Code contiene los parámetros necesarios para que la app TWINT reconozca el pago.
  - De esta manera, **no es necesario imprimir un segundo QR TWINT separado**.
- Según qr-rechnung.net:
  - Es posible escanear un QR TWINT existente y añadirlo como procedimiento alternativo dentro de la QR-bill.

Para selfchekout (futuro):
- Si ya tenemos TWINT operativo vía Stripe o integración directa:
  - Explorar esquema oficial de parámetros TWINT para QR-bills (documentado por TWINT/SIX).
  - Añadir esos parámetros como “alternative procedure” en la generación del Swiss QR Code.
- Beneficio:
  - Una única factura física sirve tanto para pago bancario tradicional como para pago instantáneo con TWINT.

---

## 5. Cómo encaja el sistema de efectivo (cash) con QR-bill

La QR-bill está pensada para pagos vía banco (transferencia / e-banking / m-banking), no directamente para efectivo. Sin embargo, en selfchekout debemos armonizar todos los métodos:

- **Pagos en efectivo en la granja/tienda**:
  - Se registran en selfchekout como `PAYMENT_METHOD = CASH`.
  - No requieren QR-bill para completar la venta.
  - Opcionalmente se puede:
    - Generar un recibo simple (no QR-bill) para el cliente.
    - Generar una QR-bill interna ligada a la contabilidad del comerciante, si desea registrar el ingreso bancario posterior.

- **Pagos mixtos (efectivo + QR-bill)**:
  - Escenario de contabilidad avanzada: parte de la factura se paga en efectivo y parte via transferencia.
  - Estrategia recomendada:
    - A nivel de sistema, dividir la orden en:
      - `paymentLine` CASH.
      - `paymentLine` BANK_TRANSFER (QR-bill) por el resto.
    - Generar QR-bill sólo por el importe pendiente.

- **Reconciliación**:
  - Efectivo:
    - Conciliación interna del comerciante (caja diaria, arqueos).
  - QR-bill:
    - Conciliación bancaria utilizando la referencia estructurada ligada al `orderId` o `invoiceId`.

Conclusión:  
QR-bill y efectivo son **métodos complementarios**. selfchekout debe modelarlos como tipos de pago distintos que conviven sobre la misma entidad `Order`, pero sólo QR-bill participa en flujos bancarios automatizables.

---

## 6. Roadmap propuesto para QR-bill en selfchekout

### Fase 0 — Validación manual
- [ ] Definir formato interno de referencia para QR-bill (p.ej. `SCOR` basado en `orderId`).
- [ ] Probar generación de QR-bills con [qr-rechnung.net](https://qr-rechnung.net/#/), vinculando manualmente órdenes reales de prueba.
- [ ] Validar en bancos reales que las QR-bills se procesan correctamente.

### Fase 1 — Servicio backend con `swissqrbill`
- [ ] Añadir librería `swissqrbill` al backend Node.js.
- [ ] Diseñar `qrBillService` con input/output claramente tipado.
- [ ] Crear endpoint interno para generar factura PDF con QR-bill y asociarla a una orden.
- [ ] Integrar en dashboard para que el comerciante pueda descargar/enviar la factura.

### Fase 2 — Automatización de conciliación
- [ ] Definir proceso para importar extractos bancarios (o introducir manualmente pagos recibidos).
- [ ] Implementar matching por referencia estructurada ↔ `orderId`.
- [ ] Actualizar automáticamente estados de orden y reportes para el comerciante.

### Fase 3 — Integraciones avanzadas
- [ ] Evaluar integración con eBill a través de un proveedor (p.ej. Storecove).
- [ ] Explorar soporte de TWINT como “Alternative Procedure” dentro del Swiss QR Code.
- [ ] Ajustar documentación interna siguiendo actualizaciones de IG QR-bill (p.ej. v2.4).

---

## 7. Decisiones y próximos pasos

**Decisión estratégica:**  
selfchekout **sí debe soportar QR-bill** a medio plazo, empezando por una fase manual y evolucionando hacia generación automática y conciliación bancaria basada en referencias estructuradas.

**Próximos pasos inmediatos:**
- Formalizar el formato de referencia estructurada que usará selfchekout.
- Definir qué comerciantes (granjeros/negocios) necesitan QR-bill desde el MVP y cuáles sólo requieren TWINT/tarjeta/efectivo.
- Abrir un spike técnico en backend para probar `swissqrbill` y generar el primer PDF de factura QR end-to-end.

