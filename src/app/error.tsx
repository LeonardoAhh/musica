'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowLeft, RotateCcw, Disc3 } from 'lucide-react';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Ecos del Alma route error:', error);
  }, [error]);

  return (
    <main id="inicio" tabIndex={-1} className="shell error-page">
      <div className="error-disc">
        <Disc3 size={42} strokeWidth={1.1} aria-hidden="true" />
      </div>

      <p className="eyebrow">ALGO INTERRUMPIÓ LA MELODÍA</p>

      <h1>
        La música sigue.
        <br />
        <em>Intentemos otra vez.</em>
      </h1>

      <p className="error-copy">No pudimos mostrar esta página.</p>

      <div className="error-actions">
        <button className="ink-button" onClick={() => reset()} type="button">
          <RotateCcw size={17} aria-hidden="true" /> Reintentar
        </button>

        <Link className="outline-button" href="/">
          <ArrowLeft size={17} aria-hidden="true" /> Ir al inicio
        </Link>
      </div>
    </main>
  );
}
