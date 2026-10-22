import type { Metadata,Viewport } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
const inter=Inter({subsets:['latin'],variable:'--font-inter',display:'swap'});
const editorial=Cormorant_Garamond({subsets:['latin'],weight:['300','400'],variable:'--font-editorial',display:'swap'});
export const metadata:Metadata={title:'Se Sufre Bonito — Música que se queda contigo',description:'Una colección editorial de salsa, cumbia y canciones que se bailan con los pies y se sienten con el corazón.',openGraph:{title:'Se Sufre Bonito',description:'Hay canciones que se bailan. Otras se quedan contigo.',type:'website'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#f5f5f5'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body className={`${inter.variable} ${editorial.variable}`}>{children}</body></html>}
