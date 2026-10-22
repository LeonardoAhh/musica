export type Mood = 'Despecho' | 'Romance' | 'Salsa brava' | 'Cumbia' | 'Nostalgia';
export type Song = { id:string; title:string; artist:string; genre:'Salsa'|'Cumbia'; mood:Mood; note:string; featured?:boolean; favorite?:boolean; palette:string; score?:number };
export const songs:Song[] = [
{id:'me-tengo-que-ir',title:'Me Tengo Que Ir',artist:"Adolescent's Orquesta",genre:'Salsa',mood:'Despecho',note:'La despedida que no se termina de cantar.',featured:true,favorite:true,score:10,palette:'rose'},
{id:'si-volvieras',title:'Si Volvieras a Mí',artist:'Maelo Ruiz',genre:'Salsa',mood:'Nostalgia',note:'La número uno de Maelo. Confirmado.',featured:true,favorite:true,score:10,palette:'peach'},
{id:'busca-por-dentro',title:'Busca Por Dentro',artist:'Grupo Niche',genre:'Salsa',mood:'Romance',note:'La campeona de Grupo Niche.',featured:true,favorite:true,score:10,palette:'mint'},
{id:'antidoto',title:'Antídoto y Veneno',artist:'Eddie Santiago',genre:'Salsa',mood:'Despecho',note:'El amor que cura y también duele.',featured:true,favorite:true,score:10,palette:'lavender'},
{id:'fabricando',title:'Fabricando Fantasías',artist:'Tito Nieves',genre:'Salsa',mood:'Nostalgia',note:'Cuando el sentimiento pesa más que el ritmo.',favorite:true,score:10,palette:'sky'},
{id:'idilio',title:'Idilio',artist:'Willie Colón',genre:'Salsa',mood:'Romance',note:'Una melodía imposible de olvidar.',favorite:true,score:10,palette:'peach'},
{id:'anhelo',title:'Anhelo',artist:"Adolescent's Orquesta",genre:'Salsa',mood:'Romance',note:'Un coro para cantar sin medida.',favorite:true,score:10,palette:'sky'},
{id:'deseandote',title:'Deseándote',artist:'Frankie Ruiz',genre:'Salsa',mood:'Romance',note:'Sabor, voz y sentimiento.',favorite:true,score:10,palette:'mint'},
{id:'gracias-amor',title:'Gracias Amor',artist:'Matecaña Orquesta',genre:'Salsa',mood:'Despecho',note:'El adiós que se baila.',favorite:true,score:10,palette:'lavender'},
{id:'nuestro-sueno',title:'Nuestro Sueño',artist:'David Pabón',genre:'Salsa',mood:'Romance',note:'La versión que ganó el duelo.',favorite:true,score:10,palette:'rose'},
{id:'de-punta',title:'De Punta a Punta',artist:'Grupo Caneo',genre:'Salsa',mood:'Romance',note:'Salsa de principio a fin.',favorite:true,score:10,palette:'sky'},
{id:'te-va-a-doler',title:'Te Va a Doler',artist:'Maelo Ruiz',genre:'Salsa',mood:'Despecho',note:'Para subir el volumen al despecho.',favorite:true,score:10,palette:'peach'},
{id:'corazon-acero',title:'Corazón de Acero',artist:'Yiyo Sarante',genre:'Salsa',mood:'Despecho',note:'La determinación tiene ritmo.',favorite:true,score:10,palette:'mint'},
{id:'lloraras',title:'Llorarás',artist:"La Dimensión Latina, Oscar D'León",genre:'Salsa',mood:'Salsa brava',note:'Bajo, metales y energía pura.',favorite:true,score:10,palette:'rose'},
{id:'vuelvo-sentir',title:'Vuelvo a Sentir',artist:'Grupo Cañaveral de Humberto Pabón',genre:'Cumbia',mood:'Cumbia',note:'Cumbia romántica para volver a sentir.',favorite:true,score:10,palette:'peach'},
{id:'corazon-solitario',title:'Corazón Solitario',artist:'Alberto Pedraza',genre:'Cumbia',mood:'Cumbia',note:'Sabor sonidero con corazón.',favorite:true,score:10,palette:'lavender'},
{id:'como-decirte',title:'Como Decirte Adiós',artist:'Los Yaguarú de Ángel Venegas',genre:'Cumbia',mood:'Cumbia',note:'Cumbia de despedida y sentimiento.',favorite:true,score:10,palette:'sky'},
{id:'la-cita',title:'La Cita',artist:'Galy Galiano',genre:'Salsa',mood:'Despecho',note:'Una historia inolvidable.',favorite:true,score:10,palette:'mint'},
{id:'asi-fue',title:'Así Fue',artist:'Nelson Díaz y La Constelación',genre:'Salsa',mood:'Despecho',note:'De las que más duelen.',favorite:true,score:10,palette:'rose'},
{id:'amor-nuestro',title:'Amores Como el Nuestro',artist:'Jerry Rivera',genre:'Salsa',mood:'Romance',note:'10/10 del duelo musical.',score:10,palette:'peach'},
{id:'plastico',title:'Plástico',artist:'Rubén Blades y Willie Colón',genre:'Salsa',mood:'Salsa brava',note:'La recomendación que no pasó el examen.',score:3,palette:'lavender'},
{id:'quiereme',title:'Quiéreme',artist:'Orquesta La Identidad',genre:'Salsa',mood:'Romance',note:'Otra apuesta que quedó en 3/10.',score:3,palette:'mint'},
];
export const featured=songs.filter(s=>s.featured);
export const moods=['Todas','Despecho','Romance','Salsa brava','Cumbia','Nostalgia'] as const;
export function spotifySearch(song:Song){return `https://open.spotify.com/search/${encodeURIComponent(song.title+' '+song.artist)}`;}
