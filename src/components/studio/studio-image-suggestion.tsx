'use client';

export type ImageSuggestion={title:string;artist:string;note:string;genre:string;mood:string};
type Props={suggestion:ImageSuggestion;onReset:()=>void;onApply:()=>void};

/** Render extracted metadata without owning editor state or side effects. */
export function StudioImageSuggestion({suggestion,onReset,onApply}:Props){
 return <div className="studio-image-suggestion" role="region" aria-label="Datos sugeridos"><div><strong>Datos detectados</strong><dl>{([['Título',suggestion.title],['Artista',suggestion.artist],['Descripción',suggestion.note],['Género',suggestion.genre],['Emoción',suggestion.mood]] as const).filter(([,value])=>Boolean(value)).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{!suggestion.note&&<p>La imagen no aportó datos suficientes para sugerir una descripción; puedes escribirla en Historia.</p>}{![suggestion.title,suggestion.artist,suggestion.note,suggestion.genre,suggestion.mood].some(Boolean)&&<p>No se encontraron datos legibles.</p>}</div><div className="studio-image-suggestion-actions"><button type="button" className="outline-button" onClick={onReset}>Otra imagen</button>{[suggestion.title,suggestion.artist,suggestion.note,suggestion.genre,suggestion.mood].some(Boolean)&&<button type="button" className="ink-button" onClick={onApply}>Aplicar a la ficha</button>}</div></div>;
}
