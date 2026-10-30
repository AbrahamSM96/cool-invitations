# Cool Invitations — Arquitectura del CMS

Plataforma para crear invitaciones digitales (bodas, XV años, fiestas) con URLs personalizadas por evento y por invitado, basada en el análisis de:

- **Tu invitación actual:** `viridianaydaniel.com/invitacion/abraham-y-ana`
- **Referencia:** `rsvp-pro.mx/papeleria-beigeoliva/9fb53a88`

---

## 1. Lo que encontramos

### Tu sitio (viridianaydaniel.com)

| Aspecto            | Hallazgo                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Render             | HTML del servidor (Jinja/Python) + **HTMX** para el RSVP. Sin framework JS.                                                                                                                                                    |
| Config             | `window.WEDDING_CONFIG` inyectado (countdown ISO, lista de versículos).                                                                                                                                                        |
| URL invitado       | `/invitacion/{slug-invitado}` → el form postea a `/i/{token}/rsvp`                                                                                                                                                             |
| Secciones          | sobre animado → hero → countdown → intro + versículo → foto → fecha → ceremonia → recepción (carrusel de entradas) → padres → dress code → regalos (BBVA, Santander, internacional, PayPal) → tu mesa → RSVP → cierre → footer |
| Extras             | Spotify embed (playlist), subida de fotos de invitados (`guest-upload.css`), copiar al portapapeles, animaciones por IntersectionObserver                                                                                      |
| Datos por invitado | nombre ("Abraham y Ana"), pases máx (2), mesa, respuesta, mensaje                                                                                                                                                              |

### Referencia (rsvp-pro.mx)

| Aspecto         | Hallazgo                                                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack           | PHP + jQuery + Bootstrap, endpoint `controllers/movimientosPases.php`                                                                                                              |
| URL             | `/{slug-diseño}/{id-pase}` → el diseño es una "papelería" reutilizable                                                                                                             |
| Pase            | nombre, descripción (2 adultos y 1 niño), personas, mesa, estado (habilitado), mensaje                                                                                             |
| Secciones extra | galería, hospedaje recomendado, "agregar a calendario" (AddEvent), hashtag Instagram, contacto wedding planner, aviso "solo adultos", confetti, padres de novia/novio por separado |

**Conclusión:** ambos sitios son lo mismo por dentro: **evento + lista de secciones + tema visual + pase por invitado**. Eso es lo que el CMS tiene que modelar.

### ⚠️ Problema de seguridad en el sitio actual

`/invitacion/abraham-y-ana` es adivinable. Cualquiera que pruebe nombres puede ver la mesa de otro invitado y **cambiar su RSVP**. En la nueva arquitectura el slug bonito siempre lleva un token corto: `/abraham-y-ana-k2Hv` o `/i/k2Hv2dFx`.

---

### XV años y cumpleaños (rsvp-pro.mx)

Analizados: `papeleriaxv-eleganciareal/6011e508` (XV de Rebeca) y `negroydorado/9aab30d6` (XV de Mateo, diseño tipo cumpleaños).

- **Es la misma plantilla HTML que la boda.** Solo cambian textos, qué secciones se muestran y el tema. Hasta reciclan el markup de "bridesmaid/groomsman" para "Mi familia". Confirma el modelo: **un catálogo de secciones + configuración por tipo de evento**.
- **Voz:** XV y cumpleaños hablan en primera persona singular ("¡Te espero!", "Mis padres"). La boda habla en plural ("Nuestros padres", "Los esperamos").
- **Personas:** una lista genérica de _rol + nombres_: padres, padrinos, abuelos maternos y paternos, hermano.
- **Secciones extra:**
  - Itinerario (en rsvp-pro es una imagen; aquí lo haremos estructurado).
  - Agendar en Google/Apple Calendar.
  - Galería y video.
  - Trivia.
  - Encuesta "¿qué canción quieres escuchar?" (búsqueda en Spotify).
  - Música mp3.
  - Hospedaje y contacto por WhatsApp.
  - Modal de bienvenida.
  - Aviso "evento sin niños".
- **Pase:** mensaje personal por invitado ("Mis queridos padrinos, los espero…") y estado (habilitado/deshabilitado).
- **Dress code:** color reservado para la protagonista ("El azul marino se reserva para la quinceañera").

---

## 2. Stack (decidido)

| Capa            | Tecnología                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework       | **Next.js 16 (App Router) + TypeScript**, un solo repo para el CMS y las invitaciones públicas                                                                                 |
| DB              | **Postgres en Neon** + **Drizzle ORM**                                                                                                                                         |
| Validación      | **Zod**: un schema por tipo de evento y por sección; los forms del CMS se generan de ahí                                                                                       |
| Forms CMS       | **react-hook-form** + `@hookform/resolvers/zod`                                                                                                                                |
| UI del CMS      | **shadcn/ui** + Tailwind v4; **dnd-kit** para reordenar secciones                                                                                                              |
| UI invitaciones | Tailwind + CSS variables por tema; **Motion** para sobre y animaciones de scroll                                                                                               |
| Auth            | Solo un admin: contraseña en variable de entorno + cookie firmada. Los invitados entran por token                                                                              |
| Archivos        | **Cloudflare R2** (fotos, texturas, mp3, fotos de invitados)                                                                                                                   |
| Mutaciones      | Server Actions (CMS) + Route Handlers (`/api/rsvp`)                                                                                                                            |
| Hosting         | **Vercel** + Vercel Domains API para dominios propios                                                                                                                          |
| Extras          | `ics` (archivo de calendario), Spotify embed, links `wa.me` para WhatsApp, `nanoid` (tokens), **SheetJS** (importar invitados desde Excel/CSV)                                 |
| Tooling         | **Bun** (paquetes y scripts), **Oxlint** con tipos (lint), **Oxfmt** (formato + orden de imports y clases Tailwind), **TypeScript 7** (`tsc --noEmit`). Sin ESLint ni Prettier |

---

## 2.1 Flujo de creación de una invitación

```
1. Proyecto  →  2. Tipo de evento  →  3. Diseño  →  4. Datos principales
   →  5. Secciones (+ preview)  →  6. Invitados  →  7. Publicar y enviar  →  8. Seguimiento RSVP
```

| Paso                 | Qué hace el admin                                                           | Qué hace el sistema                                                                                                       |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1. Proyecto          | Nombre interno + cliente                                                    | Crea `event` en `draft`                                                                                                   |
| 2. Tipo              | Elige **Boda / XV años / Cumpleaños / General**                             | Carga los campos de protagonistas, las secciones por defecto, la voz (singular/plural) y los textos sugeridos de ese tipo |
| 3. Diseño            | Elige plantilla (filtrada por tipo) y ajusta colores                        | Guarda `template_id` + `theme_overrides`                                                                                  |
| 4. Datos principales | Protagonistas, fecha, hora, zona horaria, fecha límite de RSVP, slug        | Valida con el schema del tipo; sugiere slug (`viridiana-y-daniel`)                                                        |
| 5. Secciones         | Activa, desactiva, reordena y llena cada sección                            | Cada form sale de su schema Zod; preview en vivo a la derecha                                                             |
| 6. Invitados         | Alta manual o CSV                                                           | Genera slug + token por invitado                                                                                          |
| 7. Publicar          | Botón Publicar y entrega al cliente su link privado (y el Excel si lo pide) | `status=published`, revalida caché, genera mensajes `wa.me`                                                               |
| 8. Seguimiento       | Revisa el dashboard                                                         | Confirmados, pendientes, pases, mesas, mensajes, export CSV                                                               |

El tipo de evento se puede cambiar después: se conservan los datos de las secciones compartidas y solo se piden los campos de protagonistas faltantes.

---

## 2.2 Campos por tipo de evento

El modelo tiene tres niveles:

1. **Campos base**: todos los eventos.
2. **Protagonistas**: dependen del tipo.
3. **Secciones**: un catálogo común. Cada tipo define cuáles vienen activas y con qué textos sugeridos.

### Nivel 1: campos base (todos los tipos)

| Campo                             | Tipo                   | Req. | Ejemplo                                    |
| --------------------------------- | ---------------------- | ---- | ------------------------------------------ |
| `title`                           | texto                  | ✔    | "Nos casamos" / "¡Mis XV!" / "Mis 15 años" |
| `slug`                            | slug                   | ✔    | `viridiana-y-daniel`                       |
| `starts_at` + `timezone`          | fecha/hora             | ✔    | 2026-11-14 16:30, America/Mexico_City      |
| `rsvp_deadline`                   | fecha                  |      | 31 oct 2026                                |
| `city_label`                      | texto                  |      | "Zimapán, Hidalgo"                         |
| `hashtag`                         | texto                  |      | `#XV_Rebe`                                 |
| `voice`                           | `singular` \| `plural` | auto | sale del tipo; se puede cambiar            |
| `adults_only`                     | bool                   |      | "El evento es sin niños"                   |
| `cover_photo`                     | imagen                 |      |                                            |
| `template_id` / `theme_overrides` | ref / json             | ✔    |                                            |

### Nivel 2: protagonistas por tipo

| Tipo           | Campos                                                                                                   | Voz          | Ejemplo de título      |
| -------------- | -------------------------------------------------------------------------------------------------------- | ------------ | ---------------------- |
| **Boda**       | `partner_1` {nombre corto, nombre completo}, `partner_2` {ídem}, `couple_display` ("Viridiana & Daniel") | plural       | "Nos casamos"          |
| **XV años**    | `honoree` {nombre corto, nombre completo}, `honoree_gender` (para textos: quinceañera / quinceañero)     | singular     | "¡Mis XV!"             |
| **Cumpleaños** | `honoree` {nombre corto, nombre completo}, `age` (opcional), `honoree_gender`                            | singular     | "Mi cumpleaños 30"     |
| **General**    | `host_display` (texto libre: "Familia Pérez", "Empresa X"), `event_name`                                 | configurable | "Fiesta de fin de año" |

### Nivel 3: catálogo de secciones y sus campos

✔ = activa por defecto · ○ = disponible pero apagada · — = no aplica

| Sección                     | Campos                                                                                                                                                                            | Boda |  XV   | Cumple | General |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :---: | :----: | :-----: |
| `envelope` sobre/bienvenida | texto del botón ("Toca el sobre" / "Ingresar"), imagen de sello, muestra nombre del invitado                                                                                      |  ✔   |   ✔   |   ✔    |    ○    |
| `hero`                      | título, nombres (desde protagonistas), foto o arte de fondo, fecha corta                                                                                                          |  ✔   |   ✔   |   ✔    |    ✔    |
| `countdown`                 | (usa `starts_at`); texto después del evento                                                                                                                                       |  ✔   |   ✔   |   ✔    |    ✔    |
| `intro`                     | encabezado, párrafo, cita {texto, referencia} o rotación de versículos                                                                                                            |  ✔   |   ✔   |   ○    |    ○    |
| `photo` / `gallery`         | imágenes[] {url, alt}, layout (una / carrusel / grid)                                                                                                                             |  ✔   |   ✔   |   ✔    |    ○    |
| `video`                     | URL YouTube/Vimeo o archivo                                                                                                                                                       |  ○   |   ○   |   ○    |    ○    |
| `date`                      | (usa `starts_at`), formato                                                                                                                                                        |  ✔   |   ○   |   ○    |    ○    |
| `venues`                    | lista de lugares[] {rol: ceremonia / misa / recepción / fiesta, tipo de lugar, nombre, dirección, hora, link de Maps, coordenadas, nota ("Sé puntual"), accesos[] {nombre, foto}} | ✔ 2  | ✔ 1–2 |  ✔ 1   |   ✔ 1   |
| `add_to_calendar`           | (auto con fecha y lugar) Google / Apple / .ics                                                                                                                                    |  ○   |   ✔   |   ✔    |    ✔    |
| `itinerary`                 | items[] {hora, actividad, icono}                                                                                                                                                  |  ○   |   ✔   |   ✔    |    ○    |
| `people` (familia/padrinos) | grupos[] {título ("Padres de la novia", "Mis padrinos", "Abuelos paternos"), nombres[]}                                                                                           |  ✔   |   ✔   |   ✔    |    ○    |
| `court` cortejo             | damas[], chambelanes[], padrinos por rol (velación, anillos, lazo, arras / vals, corona, última muñeca)                                                                           |  ○   |   ○   |   —    |    —    |
| `dress_code`                | código (Formal, Elegante sport…), detalle hombres, detalle mujeres, `reserved_color` + texto auto ("Deja el blanco para la novia"), link de inspiración                           |  ✔   |   ✔   |   ✔    |    ○    |
| `gifts`                     | intro, cuentas[] {banco, número, CLABE, titular}, internacional {SWIFT, país}, links[] {PayPal, Liverpool, Amazon}, `envelope_rain` (lluvia de sobres)                            |  ✔   |   ✔   |   ✔    |    ○    |
| `lodging`                   | hoteles[] {nombre, dirección, teléfono, Maps, web, código de descuento}                                                                                                           |  ○   |   ○   |   ○    |    ○    |
| `guest_pass` (tu pase/mesa) | (usa datos del invitado): nombre, pases, mesa, mensaje personal                                                                                                                   |  ✔   |   ✔   |   ✔    |    ✔    |
| `rsvp`                      | texto, fecha límite, mensaje de gracias, pedir mensaje sí/no, preguntas extra[] (alergias, canción)                                                                               |  ✔   |   ✔   |   ✔    |    ✔    |
| `song_request`              | pregunta, búsqueda en Spotify                                                                                                                                                     |  ○   |   ○   |   ○    |    ○    |
| `trivia`                    | preguntas[] {pregunta, opciones[], correcta}                                                                                                                                      |  —   |   ○   |   ○    |    ○    |
| `music`                     | Spotify playlist URI o mp3, autoplay al abrir el sobre                                                                                                                            |  ✔   |   ✔   |   ✔    |    ○    |
| `guest_uploads`             | activo desde (fecha), aprobar antes de mostrar                                                                                                                                    |  ○   |   ○   |   ○    |    ○    |
| `hashtag`                   | (usa `hashtag`), link Instagram                                                                                                                                                   |  ○   |   ✔   |   ✔    |    ○    |
| `contact`                   | texto, contactos[] {nombre, rol (planner, mamá…), WhatsApp}                                                                                                                       |  ○   |   ✔   |   ✔    |    ○    |
| `closing`                   | mensaje final, firma ("con amor, Viridiana & Daniel")                                                                                                                             |  ✔   |   ✔   |   ✔    |    ✔    |

### Detalle: confirmación (RSVP) y notas

**Qué guarda.** Cada invitado tiene una respuesta vigente en `rsvps` y todos sus cambios en `rsvp_history`. Así se ve si alguien dijo "sí" y luego "no".

**Reglas de validación** (en el servidor, con Zod):

- `passes` va de 1 a `guest.max_passes`. Si responde `no`, `passes = 0`.
- `message` es opcional, máximo 500 caracteres y se guarda como texto plano.
- Después de `rsvp_deadline` solo se puede leer; el admin decide si permite editar.
- Si el pase está `disabled`, no se puede responder.

**Flujo del invitado:** abre su link → elige "Sí, asistiré" o "No podré asistir" → escoge cuántos pases → escribe un mensaje opcional → envía.

- Al enviar ve "¡Gracias, Abraham y Ana! Te esperamos con 2 pases" y un botón "Actualizar respuesta".
- Si responde "no", le aparece el texto "Lamentamos que no puedas asistir, déjanos un mensaje".

**Admin (dashboard):**

- Totales: confirmados, no asisten, pendientes y pases confirmados vs. pases enviados.
- Tabla filtrable por grupo y mesa.
- Muro de mensajes con todas las notas, para imprimirlas o regalarlas a los novios.
- Export a CSV/Excel.

### Detalle: regalos (mesa de regalos + cuentas)

La sección `gifts` acepta cualquier combinación de estos bloques. Cada uno se muestra solo si tiene datos.

| Bloque            | Campos                                                                                               | Cómo se ve                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Intro             | título, texto                                                                                        | "Un regalo de corazón…"                         |
| Mesas de regalos  | links[] {tienda: Liverpool / Amazon / Palacio de Hierro / Sears / otra, número de evento, URL, logo} | Tarjeta con logo + botón "Ver mesa"             |
| Cuentas bancarias | cuentas[] {banco, titular, número de tarjeta, CLABE, número de cuenta}                               | Tarjeta desplegable + botón **copiar** por dato |
| Internacional     | beneficiario, banco, CLABE/IBAN, SWIFT/BIC, país                                                     | Desplegable aparte                              |
| Pagos en línea    | links[] {PayPal, Mercado Pago, otro}                                                                 | Botón con icono                                 |
| Efectivo / sobres | activar "lluvia de sobres" + texto                                                                   | "En el lugar habrá sobres…"                     |

Para que los datos bancarios no queden expuestos a cualquiera, se puede activar "mostrar cuentas solo a invitados con link". Así no salen en la invitación genérica ni en la vista previa de WhatsApp.

### Campos del invitado (pase)

| Campo              | Tipo                    | Ejemplo                                          |
| ------------------ | ----------------------- | ------------------------------------------------ |
| `display_name`     | texto                   | "Abraham y Ana", "Isela Velasco y Familia"       |
| `max_passes`       | número                  | 2                                                |
| `adults` / `kids`  | número                  | 2 / 1 → "2 adultos y un niño"                    |
| `table`            | texto                   | "6"                                              |
| `personal_message` | texto                   | "Mis queridos padrinos, los espero…"             |
| `status`           | `enabled` \| `disabled` |                                                  |
| `phone`            | tel                     | para enviar por WhatsApp                         |
| `group`            | texto                   | "Familia novia", "Amigos trabajo" (para filtrar) |

### Textos que cambian por tipo y voz

Se guardan como `copy_presets` por tipo. El admin los ve prellenados y los puede editar.

| Clave                  | Boda (plural)                                          | XV / Cumple (singular)                        |
| ---------------------- | ------------------------------------------------------ | --------------------------------------------- |
| `rsvp.title`           | "¿Nos acompañas?"                                      | "¡Te espero!"                                 |
| `people.parents_title` | "Con la bendición de nuestros padres"                  | "Mis padres"                                  |
| `gifts.intro`          | "Su presencia es el mejor regalo que podemos recibir…" | "Para mí tu presencia es el mejor regalo…"    |
| `dress_code.reserved`  | "Deja el blanco para la novia"                         | "El {color} se reserva para la {quinceañera}" |
| `closing.signature`    | "con amor, {partner_1} & {partner_2}"                  | "con cariño, {honoree}"                       |

### Cómo se implementa

```ts
// src/event-types/index.ts
export const eventTypes = {
  wedding:  { label: 'Boda',       voice: 'plural',   hostsSchema: WeddingHosts,  defaultSections: [...], copy: weddingCopy },
  xv:       { label: 'XV años',    voice: 'singular', hostsSchema: HonoreeHosts,  defaultSections: [...], copy: xvCopy },
  birthday: { label: 'Cumpleaños', voice: 'singular', hostsSchema: BirthdayHosts, defaultSections: [...], copy: birthdayCopy },
  general:  { label: 'General',    voice: 'plural',   hostsSchema: GeneralHosts,  defaultSections: [...], copy: generalCopy },
} satisfies Record<EventType, EventTypeConfig>
```

`events.hosts` (jsonb) se valida con `hostsSchema` del tipo, y `sections.data` con el schema de cada sección. Agregar un tipo nuevo (bautizo, graduación, baby shower) = agregar una entrada aquí, sin migraciones.

---

## 3. Modelo de datos

```
accounts ─┬─< events ─┬─< sections          (orden, tipo, data jsonb)
          │           ├─< guests ──< rsvps  (pase por invitado)
          │           ├─< media             (fotos del evento)
          │           ├─< guest_uploads     (fotos que suben invitados)
          │           └─< domains           (dominio propio opcional)
templates ┘ (catálogo global)
```

| Tabla           | Campos clave                                                                                                                                                                                                                                                                                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accounts`      | id, nombre, email, plan                                                                                                                                                                                                                                                                                                                                                    |
| `templates`     | id, key (`beige-oliva`), nombre, event_types[] (`boda`,`xv`,`fiesta`), theme jsonb (colores, fuentes, texturas, ornamentos), default_sections jsonb, preview_url                                                                                                                                                                                                           |
| `events`        | id, account_id, template_id, type (`wedding`/`xv`/`birthday`/`general`), slug (`viridiana-y-daniel`), title, hosts jsonb (protagonistas, validado por tipo), voice, starts_at, timezone, rsvp_deadline, city_label, hashtag, adults_only, theme_overrides jsonb, client_token (nanoid 16, link privado del cliente), status (`draft`/`published`/`archived`), published_at |
| `sections`      | id, event_id, type, position, enabled, variant, data jsonb                                                                                                                                                                                                                                                                                                                 |
| `guests`        | id, event_id, slug (`abraham-y-ana`), token (nanoid 10), display_name, max_passes, adults, kids, table, personal_message, status (`enabled`/`disabled`), group, phone, notes                                                                                                                                                                                               |
| `rsvps`         | id, guest_id (único: 1 respuesta vigente por invitado), response (`yes`/`no`), passes, message, answers jsonb (preguntas extra: alergias, canción), responded_at, updated_at                                                                                                                                                                                               |
| `rsvp_history`  | id, guest_id, response, passes, message, created_at, ip, user_agent (cada cambio queda registrado)                                                                                                                                                                                                                                                                         |
| `domains`       | id, event_id, hostname, verified, path_prefix (`/invitacion`)                                                                                                                                                                                                                                                                                                              |
| `media`         | id, event_id, url, kind, alt, width, height                                                                                                                                                                                                                                                                                                                                |
| `guest_uploads` | id, event_id, guest_id, url, approved                                                                                                                                                                                                                                                                                                                                      |

---

## 4. Sistema de secciones (el corazón del CMS)

Cada sección es un módulo con 3 piezas registradas en un solo lugar:

```ts
// src/sections/registry.ts
export const sections = {
  hero: { schema: HeroSchema, View: HeroView, Editor: HeroEditor },
  countdown: {
    schema: CountdownSchema,
    View: CountdownView,
    Editor: CountdownEditor,
  },
  venue: { schema: VenueSchema, View: VenueView, Editor: VenueEditor },
  // ...
} satisfies Record<SectionType, SectionModule>
```

### Catálogo inicial (sale de los dos sitios analizados)

| Grupo       | Secciones                                                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Apertura    | `envelope` (sobre animado), `hero`, `countdown`                                                                                          |
| Contenido   | `intro` (texto + versículo/frase), `photo`, `gallery`, `date`, `quote`                                                                   |
| Lugares     | `venue` (ceremonia / recepción / fiesta; mapa, horario, carrusel de entradas), `lodging` (hospedaje)                                     |
| Personas    | `parents`, `godparents` (padrinos), `court` (chambelanes/damas, XV)                                                                      |
| Logística   | `dress_code`, `gifts` (cuentas, CLABE, PayPal, mesa de regalos), `table`, `add_to_calendar`, `adults_only`, `contact` (planner/WhatsApp) |
| Interacción | `rsvp`, `guest_uploads`, `music` (Spotify), `hashtag`                                                                                    |
| Cierre      | `closing`, `footer`                                                                                                                      |

### Plantillas por tipo de evento

Una plantilla = **tema + lista de secciones por defecto**. Ejemplo:

| Tipo    | Secciones por defecto                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Boda    | envelope, hero, countdown, intro, photo, date, venue(ceremonia), venue(recepción), parents, godparents, dress_code, gifts, table, rsvp, music, closing |
| XV años | envelope, hero, countdown, intro, gallery, date, venue(misa), venue(fiesta), parents, godparents, court, dress_code, gifts, rsvp, closing              |
| Fiesta  | hero, countdown, date, venue, dress_code, rsvp, music                                                                                                  |

El tema (`beige-oliva`, `verde-dorado`, etc.) solo define CSS variables + assets:

```json
{
  "colors": { "bg": "#F0E9DB", "accent": "#B89A5C", "leaf": "#5C7A5E" },
  "fonts": {
    "display": "Cormorant Garamond",
    "body": "EB Garamond",
    "caps": "Cinzel"
  },
  "assets": {
    "envelope": "fondo_sobre.jpg",
    "seal": "sello-dorado.png",
    "texture": "green_texture.jpg"
  }
}
```

---

## 5. URLs y routing

| URL                                                   | Qué muestra                                                                       |
| ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| `cool-invitations.mx/{evento}`                        | Invitación genérica (sin datos de pase)                                           |
| `cool-invitations.mx/{evento}/{invitado}-{token4}`    | Invitación personalizada                                                          |
| `viridianaydaniel.com/invitacion/{invitado}-{token4}` | Igual, con dominio propio                                                         |
| `cool-invitations.mx/i/{token}`                       | Link corto para WhatsApp → redirige al anterior                                   |
| `cool-invitations.mx/c/{client_token}`                | Página privada del cliente: lista de invitados + envío por WhatsApp + estado RSVP |
| `POST /api/rsvp/{token}`                              | Guardar/actualizar respuesta                                                      |
| `/admin/...`                                          | CMS                                                                               |

`proxy.ts` (antes `middleware.ts`) resuelve el `host`: si es un dominio propio, busca el evento en `domains` y reescribe internamente a `/e/{evento}/...`. Un solo árbol de páginas sirve los dos casos.

### Render y caché

- Contenido del evento → **estático con ISR**; al publicar se llama `revalidateTag('event:{id}')`.
- Parte del invitado (nombre, pases, mesa, estado RSVP) → **dinámica** por token. Evita cachear datos privados.

---

## 6. Panel CMS (`/admin`)

1. **Eventos** — lista, crear (tipo → plantilla → datos básicos → slug).
2. **Editor** — lista de secciones con drag & drop, toggle on/off, formulario generado del schema Zod, **preview en vivo** (iframe a la ruta pública en modo draft).
3. **Tema** — elegir plantilla, override de colores/fuentes, subir fotos.
4. **Invitados** — alta manual o **importar Excel/CSV** con columnas: nombre, pases, mesa (opcional), teléfono; genera slug + token.
5. **Envío** — botón "copiar link del cliente", "regenerar link del cliente" y "descargar Excel de links" (ver 6.1).
6. **RSVP** — dashboard: confirmados / pendientes / no asisten, total de pases, mensajes, exportar CSV, distribución por mesa.
7. **Dominio** — conectar dominio propio (Vercel Domains API + verificación DNS).

### 6.1 Entrega de links al cliente

Solo el admin entra al CMS. El cliente recibe los links de sus invitados por dos vías:

**1. Página privada del cliente (principal)** — `/c/{client_token}`

| Qué ve el cliente           | Detalle                                                                        |
| --------------------------- | ------------------------------------------------------------------------------ |
| Lista de invitados          | nombre, pases, mesa, teléfono                                                  |
| Botón "Enviar por WhatsApp" | abre `wa.me/{teléfono}?text=...` con mensaje prellenado y el link del invitado |
| Botón "Copiar link"         | para mandarlo por otro medio                                                   |
| Estado RSVP                 | confirmado / no asiste / pendiente, pases confirmados, mensaje                 |
| Totales                     | confirmados, pendientes, pases confirmados vs. enviados                        |
| Filtro                      | por estado y por mesa; búsqueda por nombre                                     |

- Solo lectura: el cliente no edita invitados ni la invitación.
- Sin contraseña: el `client_token` (nanoid 16) es el acceso. El admin lo puede regenerar si se filtra.
- `noindex` y sin vista previa de datos en WhatsApp.
- Dinámica (no se cachea), siempre muestra el estado actual.

**2. Excel de links (respaldo)** — botón en el admin

Descarga `.xlsx` con las columnas del Excel original más:

| Columna           | Ejemplo                                                     |
| ----------------- | ----------------------------------------------------------- |
| `nombre`          | Abraham y Ana                                               |
| `pases`           | 2                                                           |
| `mesa`            | 6                                                           |
| `telefono`        | 5512345678                                                  |
| `link`            | `cool-invitations.mx/viridiana-y-daniel/abraham-y-ana-k2Hv` |
| `enviar_whatsapp` | `wa.me/525512345678?text=...` (clic para enviar)            |
| `rsvp`            | confirmado / pendiente / no asiste                          |

Se genera con SheetJS en un Route Handler. Es una foto del momento: para ver el estado al día, el cliente usa la página privada.

---

## 7. Estructura de carpetas

```
src/
  app/
    (public)/e/[event]/page.tsx              # invitación genérica
    (public)/e/[event]/[guest]/page.tsx      # invitación personalizada
    (public)/i/[token]/route.ts              # link corto
    (public)/c/[token]/page.tsx              # página privada del cliente
    admin/events/[id]/export/route.ts        # Excel de links
    api/rsvp/[token]/route.ts
    api/uploads/[token]/route.ts
    admin/events/...                         # CMS
  proxy.ts                                   # host → evento
  sections/<tipo>/{schema,View,Editor}.tsx
  sections/registry.ts
  templates/<key>/{theme.json,assets/}
  db/schema.ts                               # Drizzle
  lib/{auth,storage,tokens,whatsapp}.ts
```

---

## 8. Fases

| Fase | Entregable                                                                                                | Estimado |
| ---- | --------------------------------------------------------------------------------------------------------- | -------- |
| 1    | DB + registry + 6 secciones (hero, countdown, date, venue, rsvp, closing) + render público con datos seed | 3–4 días |
| 2    | Migrar la invitación Viridiana & Daniel completa (todas sus secciones + tema beige-oliva)                 | 3 días   |
| 3    | Admin: CRUD de eventos, editor de secciones con forms de Zod, preview                                     | 4–5 días |
| 4    | Invitados: importar Excel/CSV, tokens, dashboard RSVP, página privada del cliente, Excel de links         | 3–4 días |
| 5    | Plantillas XV y fiesta + secciones extra (court, gallery, lodging, add_to_calendar)                       | 3–4 días |
| 6    | Dominios propios, subida de fotos de invitados, música                                                    | 2–3 días |

Total aproximado: **3–4 semanas** a tiempo parcial-completo.
