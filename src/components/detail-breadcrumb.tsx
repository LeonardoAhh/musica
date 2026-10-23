import Link from 'next/link';

export default function DetailBreadcrumb({title}:{title:string}){
 return <nav className="detail-breadcrumb" aria-label="Ruta de navegación">
  <ol>
   <li><Link href="/">Inicio</Link></li>
   <li aria-current="page"><span>{title}</span></li>
  </ol>
 </nav>;
}
