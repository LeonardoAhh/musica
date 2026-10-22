# Ecos del Alma — Design System / Edition 03

## Intent
An independent music discovery publication: quietly editorial, emotional, not a Spotify imitation. Inspired by the user's ElevenLabs design reference but with original music-first compositions, typographic record sleeves, and an intimate editorial voice.

## Tokens
- Canvas: `#f5f5f5`; soft: `#fafafa`; card: `#ffffff`
- Ink: `#0c0a09`; primary action: `#292524`
- Body: `#4e4e4e`; muted: `#777169`; hairline: `#e7e5e4`
- Atmospheric mint: `#a7e5d3`; peach: `#f4c5a8`; lavender: `#c8b8e0`; sky: `#a8c8e8`; rose: `#e8b8c4`
- Display: Cormorant Garamond Light (300); body: Inter 400/500. Cormorant is an open-source substitute, not the proprietary Waldenburg face.
- Max content width: 1200px; base spacing: 4px; large desktop section rhythm: ~96–125px; mobile ~74px.
- Buttons: ink primary pills, soft-outline secondary pills, no saturated action colors.
- Cards: subtle outlines; album-cover artwork is original procedural typography/gradients, not reproductions of licensed covers.

## Components
- `Header`: anchored brand, category links, saved collection shortcut, responsive nav.
- `Hero`: large editorial display, pastel atmospheric blooms, two restrained CTAs.
- `ChampionCard`: original record sleeve with hierarchy and story.
- `Catalog`: accessible search, emotional facets, saving, ordering, empty-state.
- `SongDetail`: keyboard-accessible modal with Spotify search handoff.
- `Footer`: minimalist publication identity.

## Responsive
- 320–355px: 1-column catalog for readable titles.
- 356–767px: 2-column catalog, hamburger nav and stacked editorial intros.
- 768–1050px: 3-column catalog.
- >1050px: 4-column catalog, full navigation, 1200px content max.
- Fluid display sizes via `clamp()`; flex content widths; avoid horizontal overflow.
- Touch targets at least 42–46px in main controls; buttons and controls visible on touch.
- `prefers-reduced-motion` disables motion, semantic buttons and labels, visible focus outlines.

## Product boundaries
- Audio belongs to rights holders; site does not host audio. Spotify URLs are user-initiated *search* links, not verified track-specific URLs.
- Ratings are editorial ratings from this conversation, not crowd averages.
- Saved tracks are stored only in browser localStorage; no login or synchronization.
- No database, analytics, voting backend, or real-time music APIs in this current edition.

## Future iterations
- Artist and playlist routes, links to verified track IDs using approved integrations, opt-in community recommendations, moderated voting, database-backed collections, device tests and richer automated accessibility auditing.

## Edición 03 — Interacción e identidad
- Marca visible: **Ecos del Alma**; el eslogan «se sufre bonito» puede permanecer como referencia editorial, no como logotipo.
- Favicon: `src/app/icon.svg`, vinilo monocromo original con notas atmosféricas.
- Rutas: `/c/[id]` y `/a/[slug]`; identificadores cortos, legibles y estables, enlaces canónicos.
- Motion: entrada del hero y microinteracciones CSS; respetar preferencia de movimiento reducido.
- Cuelume: solamente sonidos de controles de interfaz, no música de terceros; desactivado inicialmente, activación explícita.

## Edición 08 — Progressive enhancement
- Motion solo para cambios significativos; usar prefers-reduced-motion.
- Cuelume opt-in, jamás auto-audio.
- Banner PWA contextual y descartable; oculto en standalone.
- Conservar fuentes y escala de espaciado del sistema, paleta, contraste, foco y objetivos táctiles de mínimo 42px.
- Sin emojis; Lucide para iconos estáticos y Morphicons para transiciones de estado.
- No activar auto-focus móvil ni deshabilitar zoom de accesibilidad.

## Error states & loading states
- 404: editorial empty state with a direct link home, never an unstyled browser page.
- Route errors: user-facing brief copy, reset and home action; global boundary with independent document shell.
- Section-specific skeletons: hero and featured sleeves on home, cover/details on songs, typographic introduction and track rows for artist/collections.
- Skeletons mirror the actual content geometry to minimize layout shift; subtle shimmer disabled under `prefers-reduced-motion`.
- Accessible `aria-busy` on loading placeholders; no unnecessary decorative status icons or emojis.


## Ratings, Firebase y hoja de detalles

- Escalas distintas: personal 1–5 estrellas; editorial 1–10 sin mezclarlas.
- Etiquetas de estrellas accesibles (radio nativo, `fieldset` y `legend`); tamaño objetivo 42px, foco visible y mensajes cortos.
- Datos personales: `localStorage` primero; Firestore solo con configuración y sesión anónima iniciada al valorar. Cada usuario ve únicamente sus datos.
- Esquema futuro: preferencias por usuario y canciones editoriales administradas; negar escritura pública por defecto.
- Móvil <=767px: bottom sheet con safe area, contenido scrollable, cierre por tirador y botón. Escritorio: modal centrado.
- Mantener sonidos Cuelume opcionales y Motion discreto; reducir animaciones según configuración del sistema.
- Los estados vacíos respetan eje y alineación del catálogo, sin bloques centrados innecesariamente.


## Ecos Studio — edición editorial del panel administrativo

- Herramienta de trabajo, no landing: barra compacta, encabezado breve y panel de catálogo separado de cuatro secciones del editor (identidad, historia, clasificación y publicación).
- Fuentes: Cormorant Garamond Light solo para marca/títulos editoriales; Inter 400/500/600 para campos, controles y estados. Paleta y `--line`, `--paper`, `--canvas` del sistema.
- Espaciado de 4 px: grupos 16–20 px, tarjetas 20–28 px, columnas 24 px; sin bloques excesivamente altos.
- Escritorio: listado sticky con desplazamiento interno y editor por tarjetas. Móvil ≤767 px: dos pestañas con roles, estados y flechas de teclado; solo un panel visible a la vez.
- Botones, iconos Lucide y etiquetas funcionales son unidades sin salto de línea. Nombres de canciones largos usan truncamiento en el listado.
- `UiSelect` es una primitiva Radix accesible y controlada: trigger con nombre mediante `label`, navegación con teclado, typeahead, Portal para evitar recortes, indicador y foco visibles. No usar `<select>` nativo en Studio.
- `UiToaster` y `notify`: mensajes breves no bloqueantes, Lucide, como máximo 3; éxito/error después de resolver acciones, no al hacer clic. Sonido Cuelume desactivado inicialmente.
- `ConfirmDialog` de Radix solo para acciones que merecen confirmación: importar catálogo o abandonar una edición sin guardar; foco contenido y Escape.
- Feedback accesible: aviso de cambios pendientes, foco visible, objetivos ≥42 px, inputs de ≥16 px para iOS, `prefers-reduced-motion` desactiva animaciones no esenciales.
