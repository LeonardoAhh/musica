import type { Metadata,Viewport } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import './edition02.css';
import './edition03.css';
import './collections.css';
import './discovery.css';
import './pwa.css';
import './error-states.css';
import './song-experience.css';
import InstallBanner from '@/components/install-banner';
import {site} from '@/data/site';
const inter=Inter({subsets:['latin'],variable:'--font-inter',display:'swap'});
const editorial=Cormorant_Garamond({subsets:['latin'],weight:['300','400'],variable:'--font-editorial',display:'swap'});
export const metadata:Metadata={metadataBase:new URL(site.origin),alternates:{canonical:'/'},applicationName:site.name,title:`${site.name} — Música que se queda contigo`,appleWebApp:{capable:true,title:site.name,statusBarStyle:'default'},description:site.description,openGraph:{siteName:site.name,locale:'es_MX',url:'/',title:site.name,description:'Hay canciones que se bailan. Otras se quedan contigo.',type:'website'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:site.colors.canvas};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body className={`${inter.variable} ${editorial.variable}`}>{children}<InstallBanner/></body></html>}
