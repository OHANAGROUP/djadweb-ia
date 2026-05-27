# 📖 GUÍA MAESTRA: Flujo de Cambio de Representante Legal

Este módulo representa el workflow automático e independiente de **Tramita®** diseñado para formalizar legalmente el cambio de representante legal para sociedades en Chile.

---

## 🗂️ Arquitectura e Interacción

El flujo está compuesto de la siguiente manera:
1. **Frontend en Vercel (HTML estático premium):**
   * `index.html`: Formulario con validación visual y matemática de RUT Chileno. Realiza un POST con la carga de datos al webhook de Make.com.
   * `gracias.html`: Muestra aviso de confirmación con animación interactiva de confeti e ID único de expediente.
   * `estado.html`: Interfaz dinámica que se conecta directamente a Supabase Client para consultar y mostrar la fase actual en la que se encuentra el trámite.
2. **Base de Datos en Supabase:**
   * `supabase/schema.sql`: Define la tabla de base de datos (`rep_legal_workflows`) encargada de llevar el estado y auditoría del expediente.
3. **Automatización en Make.com:**
   * `make/blueprint_cambio_rep_legal.json`: Módulo de importación para levantar el escenario de Make, el cual recibe la carga, inserta en Supabase, procesa el acta a partir de la plantilla e inicia la firma digital.
4. **Plantillas Corporativas (`templates/`):**
   * `templates/documentos/acta_accionistas_template.txt`: Minuta legal para una Junta de Accionistas SpA.
   * `templates/emails/`: Plantillas responsivas en HTML para la inducción de firma, recordatorios automáticos de 48 horas y correo de cierre con notificaciones institucionales para el SII/bancos.

---

## 🛠️ Guía de Despliegue y Activación Paso a Paso

Sigue rigurosamente este orden para habilitar el flujo completo:

### Paso 1: Configurar la Base de Datos en Supabase
1. Ingresa a tu panel de **Supabase** -> Proyecto **DEJADWEBIAR**.
2. Dirígete a **SQL Editor** -> Abre una nueva consulta.
3. Copia el contenido de `supabase/schema.sql` y ejecútalo para crear la tabla de tracking (`rep_legal_workflows`), el trigger de fecha de actualización y las políticas de Row Level Security (RLS).

### Paso 2: Configurar e Importar el Escenario de Make.com
1. Ingresa a tu cuenta de **Make.com** -> Crea un nuevo escenario (*Scenario*).
2. Haz clic en el menú de tres puntos (opciones) -> **Import Blueprint** -> Carga el archivo `make/blueprint_cambio_rep_legal.json`.
3. Configura los módulos:
   * **Custom Webhook:** Crea un nuevo webhook y copia la URL generada.
   * **Supabase Connection:** Vincula tu proyecto `DEJADWEBIAR` usando el Host `luuicelooavahedkhlsw.supabase.co` y las claves correspondientes.
   * **Generador de Documentos:** Enlaza el archivo de plantilla `templates/documentos/acta_accionistas_template.txt` para mapear las variables.
   * **SMTP / Resend:** Configura tu cuenta de correo y apunta a las plantillas de correo (`01_instrucciones.html`, `02_recordatorio.html` y `03_cierre.html`).

### Paso 3: Vincular el Webhook en el Frontend
1. Abre el archivo `vercel/public/index.html`.
2. Busca la línea que contiene `const MAKE_WEBHOOK_URL = 'REEMPLAZAR_MAKE_WEBHOOK_INTAKE_URL';`.
3. Reemplázala por la URL real del Webhook copiado de Make en el Paso 2.
4. *(Opcional)* En `vercel/public/estado.html` puedes cambiar las credenciales de Supabase si en algún momento deseas apuntar a otro proyecto (actualmente viene configurado por defecto con las credenciales de producción de `luuicelooavahedkhlsw` de forma 100% operativa).

### Paso 4: Despliegue en Vercel
1. Despliega la carpeta `vercel/` directamente a tu cuenta de Vercel.
2. Agrega las variables de entorno si decidiste usar variables de Supabase personalizadas.
3. ¡Listo! Tu landing estará disponible públicamente y lista para ingresar solicitudes.

---

## 🧪 Checklist de Pruebas de Humo

* [ ] Ejecutar el DDL en Supabase y confirmar la existencia de la tabla `rep_legal_workflows`.
* [ ] Realizar una solicitud de prueba en `index.html` con RUTs válidos.
* [ ] Verificar la correcta redirección a `gracias.html` con ID único en la URL y confeti.
* [ ] Ingresar el ID en `estado.html` y confirmar que el Stepper se sincroniza visualmente en tiempo real.
* [ ] Asegurarse de que el webhook de Make se gatille correctamente e inyecte los datos a Supabase.
