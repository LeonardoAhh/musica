import Link from 'next/link';
import {ArrowLeft,Disc3} from 'lucide-react';
export default function NotFound(){return <main className="shell error-page"><div className="error-disc"><Disc3 size={42} strokeWidth={1.1} aria-hidden="true"/></div><p className="eyebrow">404 / ECOS DEL ALMA</p><h1>Esta canción aún<br/><em>no está en el archivo.</em></h1><p className="error-copy">Sigamos buscando otra joya.</p><div className="error-actions"><Link className="ink-button" href="/"><ArrowLeft size={17} aria-hidden="true"/> Volver al inicio</Link></div></main>}
