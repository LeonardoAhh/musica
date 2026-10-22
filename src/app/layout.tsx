import type { Metadata,Viewport } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import './edition02.css';
import './edition03.css';
import './collections.css';
import './discovery.css';
import './pwa.css';
import InstallBanner from '@/components/install-banner';
const inter=Inter({subsets:['latin'],variable:'--font-inter',display:'swap'});
const editorial=Cormorant_Garamond({subsets:['latin'],weight:['300','400'],variable:'--font-editorial',display:'swap'});
export const metadata:Metadata={metadataBase:new URL('https://musica-tau-livid.vercel.app'),alternates:{canonical:'/'},applicationName:'Ecos del Alma',title:'Ecos del Alma — Música que se queda contigo',appleWebApp:{capable:true,title:'Ecos del Alma',statusBarStyle:'default'},description:'Una colección editorial de salsa, cumbia y canciones que se bailan con los pies y se sienten con el corazón.',openGraph:{siteName:'Ecos del Alma',locale:'es_MX',url:'/',title:'Ecos del Alma',description:'Hay canciones que se bailan. Otras se quedan contigo.',type:'website'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#f5f5f5'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body className={`${inter.variable} ${editorial.variable}`}>{children}<InstallBanner/></body></html>}
