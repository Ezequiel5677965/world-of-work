# 🚜 Maquinita - Sistema de Presupuestos para Movimiento de Suelo

Un sistema intuitivo, rápido y profesional diseñado específicamente para empresas, contratistas y operadores de **movimiento de suelo, excavaciones y equipos viales**.

---

## ⚡ ¿Cómo iniciar el sistema?

Tenés dos formas muy sencillas de abrir la aplicación:

1. **Opción con un solo clic (Recomendada en Windows):**
   * Hacé doble clic en el archivo `iniciar.bat`.
   * Se abrirá automáticamente la aplicación en tu navegador en `http://localhost:5173`.

2. **Opción desde la terminal:**
   ```bash
   npm run dev
   ```
   Y abrí en tu navegador: `http://localhost:5173`

---

## 🌟 Funcionalidades Principales

### 1. 📐 Calculadora Volumétrica Inteligente de Suelo
* **Dimensiones**: Ingreso de Largo × Ancho × Profundidad (o metros cuadrados directos, o pozos circulares).
* **Coeficiente de Esponjamiento automático**:
  * Tierra negra / vegetal (~25%)
  * Tosca / arcilla (~20%)
  * Suelo seleccionado (~18%)
  * Arena (~15%)
  * Escombros / demolición (~40%)
* **Cálculo automático de viajes de camión**:
  * Podés elegir el porte del camión: **6 m³** (simple), **8 m³** (doble eje) o **18 m³** (batea semirremolque).
* **⚡ Botón mágico**: Traslada el volumen calculado, los camiones necesarios y las horas de máquina directamente a la tabla del presupuesto con 1 solo clic.

### 2. 🚜 Carga Rápida de Recursos y Equipos
* Botones de agregado con un clic para:
  * Retroexcavadora / Pala mixta (por hora).
  * Minicargadora / Bobcat (por hora).
  * Flete carretón (traslado ida y vuelta de equipos).
  * Camiones volcadores y bateas.
  * Aporte de tosca de cantera y tierra negra (por m³).
  * Jornadas de operadores o nivelación láser.
  * Ítems libres personalizados.

### 3. 💰 Gestión de Márgenes y Condiciones Comerciales
* Ajuste de porcentaje de ganancia o imprevistos (15%, 20%, 25%, 30% o manual).
* Checkbox opcional para incluir IVA (+21%).
* Descuento comercial porcentual opcional.
* Condiciones de pago personalizadas (ej. 50% anticipo, saldo al finalizar).
* Validez de la oferta en días.

### 4. 📄 Presupuesto Formal, Descarga PDF y WhatsApp
* **Vista previa formal**: Hoja con membrete prolijo, datos de la empresa, CUIT, datos bancarios (Alias/CBU), detalle de ítems y memoria técnica del suelo.
* **Imprimir / Guardar en PDF**: Configurado con estilos de impresión optimizados (sin botones, formato A4 limpio).
* **Enviar por WhatsApp**: Genera automáticamente el mensaje estructurado con emojis y datos clave, abriendo directamente el chat con el cliente.

### 5. ⚙️ Precios Base y Datos de la Empresa
* Podés actualizar en cualquier momento los precios por hora de tus máquinas, el costo de los fletes o el precio de la tosca para que queden guardados por defecto y no tengas que escribirlos cada vez.

### 6. 📋 Historial de Presupuestos
* Guarda automáticamente tus presupuestos en el almacenamiento local de tu computadora.
* Permite buscar por cliente o dirección de obra.
* Permite cambiar el estado (*Borrador*, *Enviado*, *Aprobado*, *Rechazado*).
* Botón **Duplicar** para reutilizar presupuestos en obras similares.
