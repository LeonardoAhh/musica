import type {Metadata} from 'next';

export const metadata:Metadata={
 manifest:'/studio/manifest.webmanifest',
 applicationName:'Ecos Studio',
 appleWebApp:{capable:true,title:'Ecos Studio',statusBarStyle:'default'},
 icons:{icon:[{url:'/studio-icon.svg',type:'image/svg+xml'}],apple:'/studio-icon.svg'},
};

export default function StudioLayout({children}:{children:React.ReactNode}){
 return children;
}
