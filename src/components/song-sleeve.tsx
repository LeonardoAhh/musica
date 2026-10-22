import type {Song} from '@/data/songs';

export default function SongSleeve({song,large=false}:{song:Song;large?:boolean}){
 return <div className={`sleeve sleeve-${song.palette} ${large?'sleeve-large':''}`} aria-hidden="true">
  <div className="sleeve-sun"/><div className="sleeve-lines"/>
  <div className="sleeve-inner">
   <span className="sleeve-kicker">ECOS DEL ALMA / ARCHIVO SONORO</span>
   <span className="sleeve-title">{song.title}</span>
   <span className="sleeve-artist">{song.artist}</span>
   <span className="sleeve-index">EDA — {song.id.slice(0,2).toUpperCase()}</span>
  </div><span className="vinyl"/>
 </div>;
}
