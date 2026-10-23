import type {Metadata} from 'next';
import StudioSuggestionsClient from '@/components/studio/studio-suggestions-client';

export const metadata:Metadata={title:'Sugerencias | Ecos Studio',robots:{index:false,follow:false}};

export default function SuggestionsPage(){return <StudioSuggestionsClient/>}
