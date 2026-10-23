import type {Song} from '@/data/songs';

export default function SongSleeve({song}:{song:Song}){
 return <div className={`sleeve sleeve-${song.palette}`} aria-hidden="true">
  <div className="sleeve-sun"/><div className="sleeve-lines"/>
  <div className="sleeve-inner">
   <div className="sleeve-copy">
    <span className="sleeve-title">{song.title}</span>
    <span className="sleeve-artist">{song.artist}</span>
   </div>
  </div><span className="vinyl"/>
 </div>;
}
