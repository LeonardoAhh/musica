'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MorphIcon } from 'morphicons/react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpDown,
  ArrowUpRight,
  Bookmark,
  CircleCheck,
  Disc3,
  Headphones,
  Heart,
  Menu,
  Music2,
  Search,
  SlidersHorizontal,
  Shuffle,
  X,
} from 'lucide-react';

import SongDialog from '@/components/song-dialog';
import SongSleeve from '@/components/song-sleeve';
import SoundControls from '@/components/sound-controls';
import HeroTypewriter from '@/components/hero-typewriter';
import CollectionShowcase from '@/components/collection-showcase';
import MoodDiscovery from '@/components/mood-discovery';
import { UiSelect } from '@/components/ui/select';
import { useCatalog } from '@/components/catalog-provider';
import { artistSlug } from '@/data/paths';
import { moods, spotifySearch, type Song } from '@/data/songs';

const MenuShape = 'M4 6h16 M4 12h16 M4 18h16';
const CloseShape = 'M18 6 6 18 M6 6l12 12';
const BookmarkShape = 'M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z';
const BookmarkCheckShape = 'M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16 M9 10l2 2 4-4';

type Filter = (typeof moods)[number];
type HomeReturn = {
  filter: Filter;
  search: string;
  savedOnly: boolean;
  sort: string;
  scrollY: number;
};

const HOME_RETURN_KEY = 'eda-home-return';
const mark = (s: Song) => (s.score === 10 ? '10/10' : `${s.score ?? '—'}/10`);
const isMoodFilter = (value: string): value is Filter => moods.some((mood) => mood === value);
const Sleeve = SongSleeve;

export default function Home() {
  const { songs } = useCatalog();
  const reduceMotion = useReducedMotion();

  const [filter, setFilter] = useState<Filter>('Todas');
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState<string[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [selected, setSelected] = useState<Song | null>(null);
  const [sort, setSort] = useState('editorial');
  const [ready, setReady] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const returnPositionRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(HOME_RETURN_KEY) || 'null') as HomeReturn | null;
      if (
        !stored ||
        !moods.includes(stored.filter) ||
        typeof stored.search !== 'string' ||
        typeof stored.savedOnly !== 'boolean' ||
        typeof stored.sort !== 'string' ||
        !Number.isFinite(stored.scrollY)
      )
        return;

      setFilter(stored.filter);
      setSearch(stored.search);
      setSavedOnly(stored.savedOnly);
      setSort(stored.sort);
      returnPositionRef.current = stored.scrollY;
      sessionStorage.removeItem(HOME_RETURN_KEY);
    } catch {}
  }, []);

  useLayoutEffect(() => {
    if (returnPositionRef.current === null || !songs.length) return;

    const position = returnPositionRef.current;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const root = document.documentElement;
        const previous = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, position);
        root.style.scrollBehavior = previous;
        returnPositionRef.current = null;
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [songs.length, filter, search, savedOnly, sort]);

  useEffect(() => {
    const remember = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.getAttribute('target') === '_blank') return;

      const destination = new URL(anchor.href);
      if (destination.origin !== location.origin || destination.pathname === '/') return;

      try {
        sessionStorage.setItem(
          HOME_RETURN_KEY,
          JSON.stringify({
            filter,
            search,
            savedOnly,
            sort,
            scrollY: window.scrollY,
          } satisfies HomeReturn)
        );
      } catch {}
    };

    document.addEventListener('click', remember, true);
    return () => document.removeEventListener('click', remember, true);
  }, [filter, search, savedOnly, sort]);

  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem('eda-saved') || '[]');
      if (Array.isArray(value)) setSaved(value.filter((id): id is string => typeof id === 'string'));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem('eda-saved', JSON.stringify(saved));
      } catch {}
  }, [saved, ready]);

  const filtered = useMemo(() => {
    let a = songs.filter(
      (s) =>
        (filter === 'Todas' || s.mood === filter) &&
        (!savedOnly || saved.includes(s.id)) &&
        `${s.title} ${s.artist} ${s.genre}`.toLowerCase().includes(search.toLowerCase().trim())
    );
    if (sort === 'az') a = [...a].sort((a, b) => a.title.localeCompare(b.title, 'es'));
    if (sort === 'score') a = [...a].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return a;
  }, [filter, search, savedOnly, saved, sort]);

  const toggle = (id: string) =>
    setSaved((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const goCatalog = () =>
    document.getElementById('coleccion')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });

  const clearFilters = () => {
    setSearch('');
    setFilter('Todas');
    setSavedOnly(false);
    setSort('editorial');
  };

  const surprise = () => {
    if (filtered.length) setSelected(filtered[Math.floor(Math.random() * filtered.length)]);
  };

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.matches('input,textarea,select,[contenteditable="true"]');

      if (event.key === '/' && !typing && !selected) {
        event.preventDefault();
        document.getElementById('coleccion')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        searchRef.current?.focus({ preventScroll: true });
      }

      if (event.key === 'Escape') {
        if (selected) setSelected(null);
        else if (document.activeElement === searchRef.current) searchRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [selected, reduceMotion]);

  return (
    <>
      <header className="header" data-cuelume-emphasis="subtle">
        <div className="shell header-inner">
          <a className="brand" href="#inicio" aria-label="Ecos del Alma, inicio">
            <Disc3 size={23} strokeWidth={1.5} aria-hidden="true" />
            <span>
              ecos del alma<span className="brand-dot">.</span>
            </span>
          </a>
          <nav className="desktop-nav" aria-label="Navegación principal">
            <a href="#descubrir">Descubrir</a>
            <a href="#colecciones">Colecciones</a>
            <a href="#coleccion">Canciones</a>
          </nav>
          <div className="header-actions">
            <SoundControls />
            <button
              className="nav-icon"
              onClick={() => {
                setSavedOnly(!savedOnly);
                goCatalog();
              }}
              aria-label="Ver canciones guardadas"
            >
              <Bookmark size={19} aria-hidden="true" />
              {saved.length > 0 && <span className="save-count">{saved.length}</span>}
            </button>
            <button
              className="nav-icon mobile-toggle"
              aria-label={mobileMenu ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenu}
              aria-controls="mobile-nav"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <MorphIcon
                icon={mobileMenu ? CloseShape : MenuShape}
                size={22}
                strokeWidth={1.8}
                reducedMotion="user"
              />
            </button>
          </div>
        </div>
        <nav id="mobile-nav" className="mobile-nav" aria-label="Navegación móvil" hidden={!mobileMenu}>
          <a onClick={() => setMobileMenu(false)} href="#descubrir">
            Descubrir
          </a>
          <a onClick={() => setMobileMenu(false)} href="#colecciones">
            Colecciones
          </a>
          <a onClick={() => setMobileMenu(false)} href="#coleccion">
            Canciones
          </a>
          <a onClick={() => setMobileMenu(false)} href="#manifiesto">
            El manifiesto
          </a>
          <a onClick={() => setMobileMenu(false)} href="#campeonas">
            Las campeonas
          </a>
        </nav>
      </header>

      <main id="inicio" tabIndex={-1}>
        <motion.section
          className="hero shell"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-bloom bloom-mint" />
          <div className="hero-bloom bloom-peach" />
          <div className="hero-bloom bloom-lavender" />
          <div className="eyebrow hero-eyebrow">
            <span className="dot" /> UNA COLECCIÓN PARA SENTIR
          </div>
          <HeroTypewriter />
          <p className="hero-intro">
            Una selección de salsa, cumbia y melodías que hacen historia. Para quienes saben que el mejor ritmo también
            puede doler bonito.
          </p>
          <div className="hero-actions">
            <button data-cuelume-tap className="ink-button" onClick={goCatalog}>
              Descubrir joyas <ArrowUpRight size={17} aria-hidden="true" />
            </button>
            <a className="outline-button" href="#manifiesto">
              Conoce la historia <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
          <div className="hero-bottom">
            <span>EDICIÓN INDEPENDIENTE · 2026</span>
            <span>HECHA PARA ESCUCHAR SIN PRISA</span>
            <a href="#campeonas" aria-label="Bajar a las campeonas">
              <ArrowDown size={19} aria-hidden="true" />
            </a>
          </div>
        </motion.section>

        <section className="champions shell" id="campeonas">
          <div className="section-top">
            <div>
              <p className="eyebrow">01 / EL SALÓN DE LA FAMA</p>
              <h2>
                Las que nunca
                <br />
                <em>fallan.</em>
              </h2>
            </div>
            <p className="section-desc">
              Cuatro campeonas elegidas después de una larga cátedra musical. No son algoritmos: son canciones que se
              ganaron su lugar.
            </p>
          </div>
          <div className="champion-grid">
            {songs
              .filter((s) => s.featured)
              .map((s, i) => (
                <button
                  data-cuelume-open
                  className="champion-card"
                  key={s.id}
                  onClick={() => setSelected(s)}
                  aria-label={`Ver ${s.title} de ${s.artist}`}
                >
                  <Sleeve song={s} />
                  <div className="champion-info">
                    <span className="index">0{i + 1} / CAMPEONA</span>
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.artist}</p>
                    </div>
                    <ArrowUpRight size={22} strokeWidth={1.4} aria-hidden="true" />
                  </div>
                </button>
              ))}
          </div>
        </section>

        <section className="quote-band" id="manifiesto">
          <div className="shell quote-content">
            <div className="quote-orb" />
            <p className="eyebrow">02 / NUESTRO MANIFIESTO</p>
            <blockquote>
              «Que me duela hasta el alma,
              <br />
              pero que tenga <em>tremendo piano,</em>
              <br />
              metales y un coro
              <br />
              para cantar a todo pulmón».
            </blockquote>
            <span className="quote-foot">SE BAILA SABROSO, ECOS DEL ALMA.</span>
          </div>
        </section>

        <MoodDiscovery />
        <CollectionShowcase />

        <section className="catalog shell" id="coleccion">
          <div className="section-top catalog-head">
            <div>
              <p className="eyebrow">03 / EL ARCHIVO SONORO</p>
              <h2>
                Cada canción,
                <br />
                <em>una historia.</em>
              </h2>
            </div>
            <p className="section-desc">
              Explora nuestras favoritas, descubre clásicos y escucha por tu cuenta. La colección seguirá creciendo.
            </p>
          </div>
          <div className="catalog-toolbar">
            <label className="search">
              <Search size={20} strokeWidth={1.7} aria-hidden="true" />
              <input
                ref={searchRef}
                data-cuelume-type
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="search"
                placeholder="Busca una canción o artista..."
                aria-label="Buscar canciones"
              />
              <span className="search-short" aria-hidden="true">
                / para buscar
              </span>
            </label>
            <div className="filters" aria-label="Filtrar por emoción">
              {moods.map((m) => (
                <button
                  data-cuelume-select
                  key={m}
                  className={`filter ${filter === m ? 'active' : ''}`}
                  aria-pressed={filter === m}
                  onClick={() => setFilter(m)}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="mobile-catalog-filters">
              <label className="sr-only" htmlFor="catalog-mood-filter">
                Filtrar por emoción
              </label>
              <UiSelect
                id="catalog-mood-filter"
                value={filter}
                onValueChange={(value) => {
                  if (isMoodFilter(value)) setFilter(value);
                }}
                leadingIcon={<SlidersHorizontal size={15} aria-hidden="true" />}
                options={moods.map((m) => ({ value: m, label: m }))}
              />
              <label className="sr-only" htmlFor="catalog-sort-mobile">
                Orden editorial
              </label>
              <UiSelect
                id="catalog-sort-mobile"
                value={sort}
                onValueChange={setSort}
                leadingIcon={<ArrowUpDown size={15} aria-hidden="true" />}
                options={[
                  { value: 'editorial', label: 'Editorial' },
                  { value: 'az', label: 'Título A–Z' },
                  { value: 'score', label: 'Puntuación' },
                ]}
              />
              <button className="quiet-tool mobile-surprise-filter" onClick={surprise} disabled={!filtered.length}>
                <Shuffle size={15} aria-hidden="true" />
                <span>Sorprende</span>
              </button>
              <button
                type="button"
                onClick={() => setSavedOnly(!savedOnly)}
                className={`quiet-tool mobile-saved-filter ${savedOnly ? 'chosen' : ''}`}
                aria-pressed={savedOnly}
              >
                <Bookmark size={15} aria-hidden="true" />
                <span>Guardadas</span>
              </button>
            </div>
            <div className="catalog-tools">
              <button className="quiet-tool surprise-tool" onClick={surprise} disabled={!filtered.length}>
                <Shuffle size={16} aria-hidden="true" /> Sorpréndeme
              </button>
              <button
                onClick={() => setSavedOnly(!savedOnly)}
                className={`quiet-tool desktop-saved-filter ${savedOnly ? 'chosen' : ''}`}
                aria-pressed={savedOnly}
              >
                <Bookmark size={16} aria-hidden="true" />
                {savedOnly ? 'Mis guardadas' : 'Solo guardadas'}
              </button>
              <div className="sort">
                <SlidersHorizontal size={16} aria-hidden="true" />
                <label className="sr-only" htmlFor="catalog-sort">
                  Ordenar canciones
                </label>
                <UiSelect
                  id="catalog-sort"
                  value={sort}
                  onValueChange={setSort}
                  options={[
                    { value: 'editorial', label: 'Orden editorial' },
                    { value: 'az', label: 'Título A–Z' },
                    { value: 'score', label: 'Calificación' },
                  ]}
                />
              </div>
            </div>
            <div className="ux-catalog-status" role="status">
              <span>
                {filtered.length} {filtered.length === 1 ? 'canción' : 'canciones'} encontradas
              </span>
              {(search || filter !== 'Todas' || savedOnly || sort !== 'editorial') && (
                <button className="ux-reset" onClick={clearFilters}>
                  Limpiar filtros <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {filtered.length ? (
            <div className="song-grid">
              {filtered.map((s, i) => (
                <article className="song-card" key={s.id}>
                  <button
                    data-cuelume-open
                    className="cover-button"
                    onClick={() => setSelected(s)}
                    aria-label={`Detalles de ${s.title}`}
                  >
                    <Sleeve song={s} />
                  </button>
                  <div className="song-details">
                    <div className="song-meta">
                      <span>
                        {s.genre} / {s.mood}
                      </span>
                      <span>{mark(s)}</span>
                    </div>
                    <h3>{s.title}</h3>
                    <p className="song-artist">{s.artist}</p>
                    <div className="song-quick">
                      <button className="text-link" onClick={() => setSelected(s)}>
                        Descubrir <ArrowUpRight size={15} aria-hidden="true" />
                      </button>
                      <button
                        data-cuelume-toggle
                        className={`save-button ${saved.includes(s.id) ? 'is-saved' : ''}`}
                        aria-label={saved.includes(s.id) ? `Quitar ${s.title} de guardadas` : `Guardar ${s.title}`}
                        aria-pressed={saved.includes(s.id)}
                        onClick={() => toggle(s.id)}
                      >
                        <MorphIcon
                          icon={saved.includes(s.id) ? BookmarkCheckShape : BookmarkShape}
                          size={18}
                          strokeWidth={1.8}
                          reducedMotion="user"
                        />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">
              <Music2 size={30} aria-hidden="true" />
              <h3>No encontramos esa melodía.</h3>
              <p>Prueba con otro artista, emoción o palabra.</p>
            </div>
          )}
        </section>

        <section className="closing shell">
          <span className="eyebrow">LA MÚSICA NOS ENCUENTRA</span>
          <motion.h2
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.35 }}
          >
            <span className="closing-reveal">
              <motion.span
                className="closing-reveal-inner"
                variants={{ hidden: { y: "105%", opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                No todas las canciones
                <br />
                duelen por alguien.
              </motion.span>
            </span>
            <span className="closing-reveal">
              <motion.span
                className="closing-reveal-inner"
                variants={{ hidden: { y: "105%", opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <em>
                  Algunas son demasiado bonitas
                  <br />
                  para no sentirlas.
                </em>
              </motion.span>
            </span>
          </motion.h2>
          <button className="ink-button" onClick={goCatalog}>
            Volver a escuchar <Headphones size={17} aria-hidden="true" />
          </button>
        </section>
      </main>

      <footer className="footer">
        <div className="shell footer-top">
          <a className="brand" href="#inicio">
            <Disc3 size={22} strokeWidth={1.5} aria-hidden="true" /> ecos del alma.
          </a>
          <a href="#inicio">
            Volver arriba <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
        <div className="shell footer-bottom">
          <span>© 2026 ECOS DEL ALMA</span>
          <span>HECHO CON RITMO Y UN POQUITO DE DESPECHO.</span>
        </div>
      </footer>

      <SongDialog
        song={selected}
        saved={selected ? saved.includes(selected.id) : false}
        onSave={toggle}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
