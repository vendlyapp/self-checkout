# Estrategia de Pagos — selfchekout
**Última actualización:** Marzo 2026
**Estado:** Decisión tomada — pendiente implementación

---

## Resumen ejecutivo

selfchekout es una plataforma SaaS multi-comerciante donde cada tienda (granjero/negocio) opera de forma independiente y debe recibir directamente el dinero de sus ventas. Después de evaluar todas las alternativas disponibles en Suiza, **Stripe Connect** fue seleccionado como el gateway de pagos principal, con soporte para **TWINT** (método de pago #1 en Suiza) habilitado como método adicional.

La integración directa con la API de TWINT fue descartada para esta etapa. En este documento se explican todas las razones.

---

## 1. El problema que resuelve el sistema de pagos

selfchekout no es una tienda única. Es una plataforma con múltiples comerciantes. Eso crea un problema de distribución de dinero:

```
❌ Sin arquitectura correcta:
   Cliente paga → dinero llega a UNA cuenta → alguien redistribuye manualmente

✅ Con Stripe Connect:
   Cliente paga → Stripe divide automáticamente
               → Dinero del comerciante → su cuenta bancaria
               → Comisión de plataforma → cuenta Vendly
```

Cualquier solución de pagos que no resuelva este problema de raíz hace la plataforma inoperable a escala.

---

## 2. Alternativas evaluadas

### 2.1 Stripe Connect ✅ SELECCIONADO

| Característica | Detalle |
|---|---|
| **Soporte TWINT** | Nativo — se activa con un toggle en el dashboard |
| **Marketplace** | Stripe Connect — split automático de pagos entre plataforma y comerciante |
| **Sandbox** | Gratuito, completo, disponible sin contrato |
| **SDK Node.js** | Oficial, excelente documentación |
| **Onboarding comerciantes** | Automatizado — Stripe maneja KYC, verificación de identidad y cuenta bancaria |
| **Webhooks** | Robustos, con reintentos automáticos |
| **Países** | 34 países europeos pueden procesar pagos TWINT |
| **Moneda** | CHF obligatorio para TWINT |
| **Límite por transacción** | CHF 5.000 máximo (TWINT) |
| **Pagos recurrentes** | No soportados con TWINT (sí con tarjeta) |

**Precios Stripe en Suiza (aproximados):**
| Tipo | Costo |
|---|---|
| Tarjetas europeas | 1.5% + CHF 0.30 |
| Tarjetas no europeas | 2.5% + CHF 0.30 |
| TWINT | ~1.5% + CHF 0.30 |
| Connect — application fee | Definido por la plataforma (ej: 1-3% adicional) |
| Sin costos fijos mensuales | Solo pagas por transacción |

**Por qué ganó:**
- Es la única opción con marketplace nativo listo para usar sin trámites adicionales
- El SDK de Node.js es el mejor documentado del mercado
- No requiere contrato con banco adquirente por separado
- Cuando selfchekout se adapte para otros mercados (Colombia, Alemania), el 80% del código de pagos reutiliza — solo cambia currency y métodos habilitados

---

### 2.2 Datatrans ❌ Descartado (por ahora)

Gateway suizo establecido. Mencionado explícitamente en el formulario oficial de TWINT como PSP recomendado.

| Característica | Detalle |
|---|---|
| **Soporte TWINT** | ✅ Soportado nativamente |
| **Marketplace** | ⚠️ Tiene sub-merchants pero requiere contrato adicional con banco adquirente (SIX, PostFinance, Concardis) |
| **Sandbox** | ✅ Disponible |
| **Proceso** | ❌ Firma de contrato + acuerdo con adquirente = semanas de gestión |
| **Ideal para** | Empresas suizas establecidas con volumen alto |

**Por qué no se eligió:**
Requiere un contrato con un banco adquirente suizo independiente antes de poder procesar pagos. Para un MVP o plataforma en fase inicial, este proceso puede tomar semanas y presenta barreras burocráticas que Stripe no tiene.

**Cuándo reconsiderar:** Cuando selfchekout tenga +100 comerciantes activos y el volumen de transacciones justifique negociar mejores comisiones directamente con un adquirente suizo.

---

### 2.3 Payrexx ❌ Descartado

Gateway suizo popular entre pequeños negocios locales.

| Característica | Detalle |
|---|---|
| **Soporte TWINT** | ✅ Soportado |
| **Marketplace** | ❌ No existe — todos los pagos llegan a una sola cuenta |
| **Redistribución** | ❌ Manual — el operador debe transferir a cada comerciante |
| **Ideal para** | Un solo comerciante con su propia tienda |

**Por qué no se eligió:**
Payrexx no tiene el equivalente de Stripe Connect. En una plataforma multi-comerciante como Vendly, usarlo significaría recibir todos los pagos de todos los granjeros en una sola cuenta y redistribuirlos manualmente. Esto no escala, crea problemas legales de retención de fondos, y hace la operación imposible.

---

### 2.4 Worldline / SIX Payment ❌ Descartado

Empresa suiza, co-propietaria parcial de TWINT AG.

| Característica | Detalle |
|---|---|
| **Soporte TWINT** | ✅ Integración profunda |
| **Marketplace** | ⚠️ Existe pero nivel enterprise |
| **Acceso** | ❌ Proceso de onboarding largo, enfocado en grandes empresas |
| **Ideal para** | Bancos, retailers nacionales, corporaciones |

**Por qué no se eligió:** No diseñado para startups ni MVPs. El proceso de aprobación y los costos de implementación son desproporcionados para la etapa actual de selfchekout.

---

### 2.5 PostFinance ❌ Descartado

Banco postal suizo con su propio gateway de pagos.

| Característica | Detalle |
|---|---|
| **Soporte TWINT** | ✅ Integración directa |
| **Marketplace** | ❌ No tiene |
| **Restricción** | ❌ Requiere cuenta bancaria PostFinance activa |
| **Ideal para** | Negocios con cuenta PostFinance existente |

**Por qué no se eligió:** Demasiado atado al ecosistema bancario postal suizo. No tiene arquitectura multi-comerciante y requiere relación bancaria previa.

---

### 2.6 Mollie ❌ Descartado

Gateway europeo popular en Países Bajos, Alemania, Bélgica.

| Característica | Detalle |
|---|---|
| **Soporte TWINT** | ❌ No soportado |
| **Marketplace** | ✅ Mollie Connect existe |

**Por qué no se eligió:** No soporta TWINT — el método de pago más importante en Suiza. Sin TWINT, el producto no es viable para el mercado suizo.

---

## 3. Por qué NO se integró TWINT directamente

TWINT ofrece una **integración directa** para plataformas que quieran actuar como intermediarios entre sus comerciantes y TWINT. En el sitio oficial (twint.ch) existe un formulario de solicitud para este proceso.

### Por qué fue descartada para esta etapa:

**3.1 Proceso de aprobación manual**
TWINT AG revisa cada solicitud manualmente. El proceso no es self-service — requieren verificar empresa, volumen de transacciones estimado, clientes potenciales y estructura técnica. Para un MVP sin clientes activos, la aprobación es poco probable.

**3.2 Requiere empresa suiza registrada**
La integración directa está diseñada para negocios legalmente establecidos en Suiza, con acquirer (banco procesador) ya contratado. Los acquirers mencionados en el formulario son: SIX, Concardis, BSPO, PostFinance. Cada uno requiere su propio contrato.

**3.3 Está diseñada para otro perfil**
El formulario de integración directa pregunta:
- Número de clientes comerciales activos en Suiza
- Puntos de venta ya operando
- Volumen de transacciones anuales estimado

Es un proceso para empresas como Datatrans o SIX — no para plataformas en fase de construcción.

**3.4 Stripe ya resuelve el problema**
Stripe es un acquirer certificado de TWINT. Al integrar Stripe, TWINT queda disponible automáticamente sin ningún trámite adicional. Se accede a TWINT a través de Stripe, no directamente — lo que es perfectamente válido y usado por miles de merchants en Suiza.

---

## 4. Cuándo se podría integrar TWINT directamente

La integración directa con TWINT tiene sentido cuando selfchekout cumpla estas condiciones:

| Condición | Por qué importa |
|---|---|
| **+100 comerciantes activos** | TWINT AG necesita ver tracción real para aprobar |
| **Empresa registrada en Suiza** | Requisito legal del proceso |
| **Volumen mensual significativo** | El acquirer (banco) evalúa rentabilidad |
| **Querer reducir comisiones** | Integración directa permite negociar fees más bajos que Stripe |
| **Funcionalidades TWINT+ avanzadas** | Loyalty, cupones, TWINT marketplace — no disponibles vía Stripe |

**Estimado:** Si selfchekout crece según el plan, la integración directa podría evaluarse a partir del **mes 18-24** de operación.

---

## 5. Arquitectura de pagos con Stripe Connect

```
┌─────────────────────────────────────────────────────┐
│                 SELFCHEKOUT PLATFORM                │
│              (Stripe Connect Account)               │
└─────────────────────────┬───────────────────────────┘
                          │ application_fee
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │  Granjero A │ │  Granjero B │ │  Granjero C │
   │  Connected  │ │  Connected  │ │  Connected  │
   │   Account   │ │   Account   │ │   Account   │
   └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
          │               │               │
          ▼               ▼               ▼
   Cuenta bancaria  Cuenta bancaria  Cuenta bancaria
      suiza A          suiza B          suiza C
```

**Métodos de pago habilitados:**
- TWINT (móvil / QR)
- Tarjetas de crédito/débito (Visa, Mastercard)
- QR Rechnung (factura QR suiza) — via Stripe o separado

---

## 6. Flujo técnico de un pago con TWINT

```
1. Cliente selecciona productos y va al checkout
2. Elige "Pagar con TWINT"
3. Backend crea PaymentIntent en Stripe:
   → payment_method_types: ['twint']
   → amount: 5000 (en centavos CHF = CHF 50.00)
   → currency: 'chf'
   → transfer_data.destination: 'acct_XXXX' (cuenta del granjero)
   → application_fee_amount: 150 (CHF 1.50 para la plataforma)
4. En móvil: redirect automático a app TWINT
   En desktop: cliente escanea QR con su app TWINT
5. Cliente confirma pago en su app
6. TWINT notifica a Stripe → Stripe envía webhook a Vendly
7. Backend actualiza orden como PAGADA
8. Cliente ve pantalla de confirmación
9. Stripe deposita CHF 48.20 en cuenta del granjero (en 2-7 días hábiles)
   Stripe deposita CHF 1.50 en cuenta selfchekout
   Stripe cobra su fee (~CHF 1.05) al granjero
```

---

## 7. Pendiente de implementación

- [ ] Crear cuenta Stripe Connect del operador (cliente suizo)
- [ ] Endpoint `POST /api/payments/onboard-merchant` — genera link de onboarding Stripe para cada granjero
- [ ] Endpoint `POST /api/payments/create-intent` — crea PaymentIntent con destination + application_fee
- [ ] Endpoint `POST /api/webhooks/stripe` — maneja eventos de pago confirmado/fallido/reembolsado
- [ ] Frontend: integrar `@stripe/stripe-js` en el checkout
- [ ] UI de onboarding para granjeros (conectar cuenta bancaria)
- [ ] Dashboard: mostrar estado de pagos y próxima fecha de depósito
- [ ] Activar TWINT en el dashboard de Stripe del operador
- [ ] Testing completo en sandbox antes de producción

---

*Documento creado en base a investigación de: TWINT AG (twint.ch), Stripe Documentation (docs.stripe.com), Datatrans Documentation, Payrexx, Worldline, PostFinance, Mollie.*
