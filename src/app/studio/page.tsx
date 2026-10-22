import type {Metadata} from 'next';
import StudioClient from '@/components/studio/studio-client';
export const metadata:Metadata={title:'Ecos Studio | Ecos del Alma',robots:{index:false,follow:false}};
export default function StudioPage(){return <StudioClient/>}
