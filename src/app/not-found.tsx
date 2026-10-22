import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
export default function NotFound(){return <main className="shell detail-page"><p className="eyebrow">404 / ECOS DEL ALMA</p><h1>Esa melodía aún no está aquí.</h1><p className="detail-lead">Tal vez la encuentres explorando nuestra colección.</p><Link className="ink-button" href="/">Volver al inicio <ArrowUpRight size={16} aria-hidden="true"/></Link></main>}
