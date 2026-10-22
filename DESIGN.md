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
