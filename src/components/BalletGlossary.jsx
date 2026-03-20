import { useState, useMemo } from 'react'
import { Search, X, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// GLOSARIO — Técnica Vaganova (método ruso)
// ═══════════════════════════════════════════════════════════
const GLOSSARY = [
  // ─── POSICIONES DE PIES ───
  { category: 'Posiciones de pies', term: 'Primera posición', pronunciation: 'prem-YEHR poh-zee-SYOHN', definition: 'Los talones juntos y los pies abiertos en línea recta (180°). Es la base de toda la técnica clásica y el punto de partida para todos los ejercicios de barra.' },
  { category: 'Posiciones de pies', term: 'Segunda posición', pronunciation: 'say-GOON-dah', definition: 'Los pies abiertos y separados aproximadamente el ancho de los hombros, ambos en rotación externa. Base de los grands pliés y ejercicios de adagio.' },
  { category: 'Posiciones de pies', term: 'Tercera posición', pronunciation: 'tehr-SEHR-ah', definition: 'El talón de un pie toca el medio del otro. En Vaganova se usa principalmente como posición de paso o transición.' },
  { category: 'Posiciones de pies', term: 'Cuarta posición', pronunciation: 'KWAHR-tah', definition: 'Un pie adelante del otro separados aproximadamente el largo de un pie. Puede ser abierta (derivada de primera) o cruzada (derivada de quinta). Posición clave para los ports de bras y fondus.' },
  { category: 'Posiciones de pies', term: 'Quinta posición', pronunciation: 'KEEN-tah', definition: 'Los pies completamente cruzados, talón de un pie tocando la punta del otro. Posición más trabajada en Vaganova; de aquí parten la mayoría de los saltos y pirouettes.' },
  // ─── POSICIONES DE BRAZOS ───
  { category: 'Posiciones de brazos', term: 'Preparatoria (en bas)', pronunciation: 'prehp-ah-rah-TWAH / ohn bah', definition: 'Brazos redondeados frente al cuerpo a la altura de las caderas, manos a la distancia de un puño del cuerpo. Posición de inicio. En Vaganova se llama "preparatoria" o "en bas".' },
  { category: 'Posiciones de brazos', term: 'Primera posición de brazos', pronunciation: 'prehm-YEHR brah', definition: 'Brazos redondeados al frente a la altura del abdomen-pecho bajo. El óvalo formado es suave y vivo, con los codos ligeramente más altos que las muñecas.' },
  { category: 'Posiciones de brazos', term: 'Segunda posición de brazos', pronunciation: 'say-GOON-dah brah', definition: 'Brazos abiertos a los lados a la altura de los hombros, ligeramente por delante del cuerpo. Los codos deben estar levantados para no dejar caer los brazos.' },
  { category: 'Posiciones de brazos', term: 'Tercera posición de brazos', pronunciation: 'tehr-SEHR-ah brah', definition: 'Un brazo en corona (en alto) y el otro en segunda posición. En Vaganova, la posición con ambos brazos en alto se llama corona o allongé.' },
  { category: 'Posiciones de brazos', term: 'Allongé', pronunciation: 'ah-lohn-ZHAY', definition: 'Posición alargada de los brazos: los dedos se extienden y el brazo se "alarga" saliendo de la posición redondeada. Se usa en arabesques y attitudes para dar expresividad a la línea.' },
  // ─── PLIÉS ───
  { category: 'Pliés', term: 'Demi-plié', pronunciation: 'deh-MEE plee-AY', definition: 'Flexión parcial de rodillas conservando los talones en el piso. El demi-plié es el amortiguador del salto y la preparación para el relevé. En Vaganova se realiza en todas las posiciones.' },
  { category: 'Pliés', term: 'Grand plié', pronunciation: 'GRAHN plee-AY', definition: 'Flexión completa de rodillas. Excepto en segunda posición, los talones se elevan del piso al descender. El descenso es continuo y controlado, sin pausas. Vaganova enfatiza el "press del talón" al inicio.' },
  // ─── BATTEMENTS ───
  { category: 'Battements', term: 'Battement tendu', pronunciation: 'bat-MAHN tahn-DEW', definition: 'Deslizamiento del pie por el piso hacia afuera hasta la punta, y regreso. La pierna de trabajo permanece estirada y el pie toca el piso durante todo el recorrido. Ejercicio fundamental que activa la rotación y el trabajo de pie.' },
  { category: 'Battements', term: 'Battement tendu jeté', pronunciation: 'bat-MAHN tahn-DEW zheh-TAY', definition: 'Igual que el tendu pero el pie se despega del piso a una altura de 25°–45°. En Vaganova, el jeté desarrolla la precisión y la velocidad del trabajo de pierna.' },
  { category: 'Battements', term: 'Dégagé', pronunciation: 'day-gah-ZHAY', definition: 'Término usado frecuentemente como sinónimo de battement tendu jeté. El pie se "libera" del piso a una pequeña altura. Base de los allegros.' },
  { category: 'Battements', term: 'Rond de jambe à terre', pronunciation: 'ROHN deh ZHAMB ah TEHR', definition: 'Círculo con la pierna en el piso. La punta del pie traza un semicírculo sin despegarse. En dehors: adelante→lado→atrás. En dedans: atrás→lado→adelante. Desarrolla la rotación de cadera.' },
  { category: 'Battements', term: 'Battement fondu', pronunciation: 'bat-MAHN fohn-DEW', definition: 'La pierna de trabajo se flexiona y la de apoyo hace un demi-plié simultáneamente, luego ambas se extienden a la vez. Vaganova lo llama "fundido" porque ambas piernas fluyen juntas. Prepara para los adagios y turns.' },
  { category: 'Battements', term: 'Battement frappé', pronunciation: 'bat-MAHN frah-PAY', definition: 'Golpe controlado al piso con el pie de trabajo desde la posición sur le cou-de-pied. En Vaganova, el pie "golpea" el piso con energía para desarrollar la fuerza necesaria en el allegro.' },
  { category: 'Battements', term: "Rond de jambe en l'air", pronunciation: 'ROHN deh ZHAMB ohn LEHR', definition: 'Círculo con la pierna en el aire a 90°. La parte inferior de la pierna describe un óvalo mientras el muslo permanece fijo. En dehors o en dedans. Ejercicio central para la soltura del knee joint.' },
  { category: 'Battements', term: 'Grand battement', pronunciation: 'GRAHN bat-MAHN', definition: 'Lanzamiento de la pierna hacia arriba (generalmente 90° o más) con máxima extensión. La pierna de apoyo permanece completamente estirada. Desarrolla la amplitud y la fuerza para los grandes saltos y arabesques.' },
  // ─── PORTS DE BRAS ───
  { category: 'Ports de bras', term: 'Port de bras', pronunciation: 'por deh BRAH', definition: 'Literalmente "transporte de brazos". Secuencia de movimientos de brazos que pasan por las posiciones establecidas. En Vaganova incluye también el trabajo de espalda y torso (inclinaciones, arcos, espirales).' },
  { category: 'Ports de bras', term: 'Primer port de bras', pronunciation: 'prehm-YEHR por deh BRAH', definition: 'Brazos ascienden de preparatoria a primera posición y abren a segunda. Es el movimiento más básico de coordinación brazo-cuerpo.' },
  { category: 'Ports de bras', term: 'Segundo port de bras', pronunciation: 'say-GOON-dah por deh BRAH', definition: 'Desde segunda posición, un brazo sube a tercera (corona) y el otro se queda en segunda. Desarrolla la independencia y coordinación de los brazos.' },
  { category: 'Ports de bras', term: 'Sexto port de bras (Vaganova)', pronunciation: 'SEKS-toh por deh BRAH', definition: 'Port de bras combinado con cambrés (arcos). Incluye inclinación hacia adelante, verso atrás y espiral lateral. En Vaganova es el ejercicio más completo para el trabajo del torso y la expresividad escénica.' },
  // ─── ARABESQUES ───
  { category: 'Arabesques', term: 'Arabesque (general)', pronunciation: 'ah-rah-BESK', definition: 'Posición en la que la pierna de trabajo se extiende detrás del cuerpo a 90° o más. El cuerpo, los brazos y la pierna de trabajo forman una línea larga y armoniosa.' },
  { category: 'Arabesques', term: 'Primer arabesque (Vaganova)', pronunciation: 'prehm-YEHR ah-rah-BESK', definition: 'El brazo correspondiente a la pierna de apoyo va adelante (en allongé) y el otro se extiende detrás a la altura del hombro. Hombros de frente al público.' },
  { category: 'Arabesques', term: 'Segundo arabesque (Vaganova)', pronunciation: 'say-GOON-dah ah-rah-BESK', definition: 'El brazo del lado de la pierna de trabajo va adelante y el otro atrás. Los hombros permanecen paralelos al piso. Crea una línea abierta y cruzada.' },
  { category: 'Arabesques', term: 'Tercer arabesque (Vaganova)', pronunciation: 'tehr-SEHR ah-rah-BESK', definition: 'Ambos brazos van adelante, uno más alto que el otro, con el torso ligeramente inclinado hacia la pierna de apoyo. La mirada sigue la mano superior.' },
  { category: 'Arabesques', term: 'Cuarto arabesque (Vaganova)', pronunciation: 'KWAHR-toh ah-rah-BESK', definition: 'Similar al tercer arabesque pero los hombros se abren hacia el público y la mirada va hacia el frente. La línea de los brazos crea profundidad escénica.' },
  // ─── ATTITUDES ───
  { category: 'Attitudes', term: 'Attitude', pronunciation: 'ah-tee-TEWD', definition: 'Posición con la pierna de trabajo elevada a 90° y la rodilla flexionada en ángulo de 90°–145°. La cadera del lado de la pierna de trabajo no debe levantarse. Vaganova distingue attitude devant y attitude derrière.' },
  { category: 'Attitudes', term: 'Attitude derrière', pronunciation: 'ah-tee-TEWD deh-RYEHR', definition: 'La pierna doblada se extiende hacia atrás y arriba. La rodilla de la pierna de trabajo debe estar más alta que el pie. Es la base de muchas variaciones de repertorio clásico.' },
  { category: 'Attitudes', term: 'Attitude croisée devant', pronunciation: 'ah-tee-TEWD krwah-ZAY deh-VAHN', definition: 'La pierna doblada se extiende al frente en posición croisée (cruzada respecto al público). Muy frecuente en el repertorio femenino del ballet romántico.' },
  // ─── SALTOS ───
  { category: 'Saltos (Allegro)', term: 'Sauté', pronunciation: 'soh-TAY', definition: 'Salto simple en cualquier posición de pies. El aterrizaje siempre se hace con demi-plié para amortiguar el impacto. En Vaganova, el primer salto que se enseña es en primera y quinta posición.' },
  { category: 'Saltos (Allegro)', term: 'Échappé sauté', pronunciation: 'ay-sha-PAY soh-TAY', definition: 'Salto desde quinta posición que abre a segunda o cuarta posición en el aire, y cierra de nuevo a quinta. Desarrolla la coordinación y la apertura en el salto.' },
  { category: 'Saltos (Allegro)', term: 'Assemblé', pronunciation: 'ah-sahm-BLAY', definition: 'Un pie desliza al piso, ambas piernas se juntan en el aire y se aterriza en quinta posición. En Vaganova es el ejercicio de allegro más trabajado para desarrollar la coordinación.' },
  { category: 'Saltos (Allegro)', term: 'Jeté', pronunciation: 'zheh-TAY', definition: 'Salto de una pierna a la otra. La pierna de trabajo se lanza mientras la de apoyo empuja el piso. En grand jeté, ambas piernas se abren en el aire.' },
  { category: 'Saltos (Allegro)', term: 'Grand jeté', pronunciation: 'GRAHN zheh-TAY', definition: 'Gran salto de una pierna a la otra con máxima apertura en el aire (split aéreo). Es uno de los momentos más espectaculares del ballet y requiere gran impulso y flexibilidad.' },
  { category: 'Saltos (Allegro)', term: 'Sissonne', pronunciation: 'see-SOHN', definition: 'Salto desde dos piernas que aterriza en una (sissonne simple) o sigue en dos piernas (sissonne fermée). Variantes: sissonne ordinaire, ouverte, tombée.' },
  { category: 'Saltos (Allegro)', term: 'Pas de chat', pronunciation: 'pah deh SHAH', definition: 'Literalmente "paso de gato". Un pie sube a retiré, luego el otro lo sigue, y se aterriza en quinta. Movimiento ligero y ágil. Frecuente en variaciones del repertorio.' },
  { category: 'Saltos (Allegro)', term: 'Entrechat', pronunciation: 'ohn-treh-SHAH', definition: 'Salto en el que las piernas se cruzan y descruzan en el aire. El entrechat quatre cruza dos veces. Muy trabajado en los allegros de la técnica Vaganova.' },
  // ─── GIROS ───
  { category: 'Giros (Pirouettes)', term: 'Pirouette en dehors', pronunciation: 'peer-WET ohn deh-OR', definition: 'Giro hacia afuera sobre una pierna, en retiré passé. En Vaganova, parte desde quinta posición con demi-plié y empuje del brazo abierto.' },
  { category: 'Giros (Pirouettes)', term: 'Pirouette en dedans', pronunciation: 'peer-WET ohn deh-DAHN', definition: 'Giro hacia adentro. Parte generalmente desde una pierna extendida (lunge) y lleva la pierna al retiré mientras se eleva en relevé. Base del gran fouetté en pointe.' },
  { category: 'Giros (Pirouettes)', term: 'Retiré passé', pronunciation: 'reh-tee-RAY pah-SAY', definition: 'La pierna de trabajo sube con la rodilla flexionada hasta la rodilla de la pierna de apoyo. Es la posición base de la pirouette y muchos giros.' },
  { category: 'Giros (Pirouettes)', term: 'Fouetté en tournant', pronunciation: 'fweh-TAY ohn toor-NAHN', definition: 'Serie de giros en los que la pierna libre hace un movimiento de látigo que genera el impulso rotacional. El famoso "32 fouettés" del Lago de los Cisnes.' },
  { category: 'Giros (Pirouettes)', term: 'Spot (esguince visual)', pronunciation: '—', definition: 'Técnica de fijación visual durante los giros. La cabeza es lo último en girarse y lo primero en llegar al frente. Evita el mareo y da precisión al giro.' },
  { category: 'Giros (Pirouettes)', term: "Tour en l'air", pronunciation: 'toor ohn LEHR', definition: 'Giro completo en el aire antes de aterrizar. El giro se inicia desde demi-plié en quinta posición.' },
  // ─── CONCEPTOS ESENCIALES ───
  { category: 'Conceptos esenciales', term: 'En dehors / En dedans', pronunciation: 'ohn deh-OR / ohn deh-DAHN', definition: 'Direcciones de rotación. En dehors = hacia afuera. En dedans = hacia adentro. Aplica a rond de jambe, pirouettes y todos los giros.' },
  { category: 'Conceptos esenciales', term: 'Relevé', pronunciation: 'reh-leh-VAY', definition: 'Elevarse sobre las puntas o medias puntas. En Vaganova, el relevé se trabaja con impulso desde el demi-plié, no como simple levantamiento.' },
  { category: 'Conceptos esenciales', term: 'Sur le cou-de-pied', pronunciation: 'syur leh koo-deh-PYAY', definition: 'Literalmente "sobre el cuello del pie". El pie de trabajo descansa en el tobillo de la pierna de apoyo. Posición fundamental para frappés, fondus y giros básicos.' },
  { category: 'Conceptos esenciales', term: 'Pas de bourrée', pronunciation: 'pah deh boo-RAY', definition: 'Serie de tres pasos pequeños que sirven de enlace entre movimientos. En Vaganova es el paso de conexión más enseñado en el centro.' },
  { category: 'Conceptos esenciales', term: 'Croisé / Effacé', pronunciation: 'krwah-ZAY / eh-fah-SAY', definition: 'Croisé = cruzado, el cuerpo en diagonal con la pierna de trabajo cruzada. Effacé = abierto, la posición abre la línea del cuerpo. Son las dos orientaciones básicas del cuerpo en el escenario.' },
  { category: 'Conceptos esenciales', term: 'Aplomb', pronunciation: 'ah-PLOHM', definition: 'Equilibrio vertical perfecto sobre la pierna de apoyo. En Vaganova, el aplomb se trabaja desde el primer año como fundamento de todos los giros y poses.' },
  { category: 'Conceptos esenciales', term: 'Épaulement', pronunciation: 'ay-pohl-MAHN', definition: 'Inclinación sutil de hombros y cabeza que da expresividad y perspectiva a la postura. Vaganova lo considera fundamental para la interpretación escénica.' },
  { category: 'Conceptos esenciales', term: 'En face', pronunciation: 'ohn FAHS', definition: 'Posición directamente de frente al público, sin rotación de torso. Punto de referencia para las 8 direcciones corporales de Vaganova.' },
  { category: 'Conceptos esenciales', term: 'Demi-pointe / Pointe', pronunciation: 'deh-MEE PWANT / PWANT', definition: 'Demi-pointe = medias puntas. Pointe = puntas completas. El trabajo en pointe se inicia solo cuando el pie y el tobillo tienen la fortaleza necesaria, generalmente tras varios años de entrenamiento.' },
  { category: 'Conceptos esenciales', term: 'Cambré', pronunciation: 'kahm-BRAY', definition: 'Arco del torso hacia adelante, atrás o a los lados con los brazos en corona. Desarrolla la flexibilidad del torso y la expresividad escénica.' },
  { category: 'Conceptos esenciales', term: 'Pas de deux', pronunciation: 'pah deh DEH', definition: 'Danza para dos bailarines. El grand pas de deux clásico incluye: entrada, adagio, variación masculina, variación femenina y coda. Es la forma suprema del ballet clásico.' },
]

const CATEGORIES = ['Todos', ...Array.from(new Set(GLOSSARY.map(t => t.category)))]

const CATEGORY_CFG = {
  'Posiciones de pies':     { bg: 'bg-[#fdf2f7]',  text: 'text-[#551735]',  border: 'border-[#e8b4cc]',  dot: 'bg-[#7e2d55]',  activeBg: 'bg-[#6b2145]'  },
  'Posiciones de brazos':   { bg: 'bg-[#fff0f5]',  text: 'text-[#8b3a62]',  border: 'border-[#ffcfe0]',   dot: 'bg-[#e8b4cc]',  activeBg: 'bg-[#9e4a72]'  },
  'Pliés':                  { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-400',  activeBg: 'bg-orange-500'  },
  'Battements':             { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500',   activeBg: 'bg-amber-600'   },
  'Ports de bras':          { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-400',    activeBg: 'bg-rose-600'    },
  'Arabesques':             { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    dot: 'bg-teal-500',    activeBg: 'bg-teal-600'    },
  'Attitudes':              { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',    dot: 'bg-cyan-500',    activeBg: 'bg-cyan-600'    },
  'Saltos (Allegro)':       { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', activeBg: 'bg-emerald-600' },
  'Giros (Pirouettes)':     { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  dot: 'bg-indigo-500',  activeBg: 'bg-indigo-600'  },
  'Conceptos esenciales':   { bg: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-200',   dot: 'bg-slate-500',   activeBg: 'bg-slate-600'   },
}

const CATEGORY_COUNTS = Object.fromEntries(
  CATEGORIES.filter(c => c !== 'Todos').map(c => [c, GLOSSARY.filter(e => e.category === c).length])
)

// ── Tarjeta de término ─────────────────────────────────────────────
function GlossaryCard({ entry }) {
  const [open, setOpen] = useState(false)
  const cfg = CATEGORY_CFG[entry.category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' }

  return (
    <div className={`rounded-2xl border overflow-hidden bg-white shadow-sm ${open ? cfg.border : 'border-gray-100'}`}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        {/* Punto de color */}
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />

        <div className="flex-1 min-w-0">
          {/* Término */}
          <p className="text-[13.5px] font-bold text-gray-800 leading-snug">{entry.term}</p>
        </div>

        {open
          ? <ChevronUp size={15} className={`shrink-0 ${cfg.text}`} />
          : <ChevronDown size={15} className="text-gray-300 shrink-0" />
        }
      </button>

      {open && (
        <div className={`px-4 pt-0 pb-4 ${cfg.bg} border-t ${cfg.border}`}>
          {/* Definición */}
          <p className="text-[13px] text-gray-700 leading-relaxed mt-3">{entry.definition}</p>
          {/* Badge de categoría */}
          <span className={`inline-block mt-3 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${cfg.text} border ${cfg.border} bg-white/70`}>
            {entry.category}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Sección agrupada (cuando se ve "Todos" sin búsqueda) ───────────
function CategorySection({ category, entries }) {
  const [collapsed, setCollapsed] = useState(false)
  const cfg = CATEGORY_CFG[category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' }

  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-2 mb-2 group"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
        <span className={`text-[11px] font-bold uppercase tracking-wider ${cfg.text} flex-1 text-left`}>{category}</span>
        <span className={`text-[10px] font-semibold ${cfg.text} mr-1`}>{entries.length}</span>
        {collapsed
          ? <ChevronDown size={13} className={cfg.text} />
          : <ChevronUp size={13} className={cfg.text} />
        }
      </button>
      {!collapsed && (
        <div className="space-y-2">
          {entries.map((entry, i) => <GlossaryCard key={i} entry={entry} />)}
        </div>
      )}
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────
export default function BalletGlossary() {
  const [search, setSearch]               = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return GLOSSARY.filter(entry => {
      const matchCat = activeCategory === 'Todos' || entry.category === activeCategory
      if (!q) return matchCat
      return matchCat && (
        entry.term.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q) ||
        (entry.pronunciation || '').toLowerCase().includes(q)
      )
    })
  }, [search, activeCategory])

  // Modo agrupado: sin búsqueda y categoría = Todos
  const grouped = !search.trim() && activeCategory === 'Todos'

  // Agrupar por categoría cuando aplica
  const groupedEntries = useMemo(() => {
    if (!grouped) return null
    const map = {}
    CATEGORIES.filter(c => c !== 'Todos').forEach(c => {
      const items = GLOSSARY.filter(e => e.category === c)
      if (items.length) map[c] = items
    })
    return map
  }, [grouped])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-[#551735] text-white px-4 pt-5 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Glosario · Técnica Vaganova</h1>
              <p className="text-[11px] text-white/70">{GLOSSARY.length} términos · {CATEGORIES.length - 1} categorías</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Búsqueda (sticky) ── */}
      <div className="sticky top-0 z-20 bg-gray-50 px-4 pt-3 pb-2 shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar término, definición..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-9 py-2.5 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e8b4cc] focus:border-transparent"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filtros por categoría (grid 2 columnas) ── */}
      <div className="max-w-md mx-auto px-4 pt-3 pb-2">
        {/* Botón "Todos" */}
        <button
          onClick={() => setActiveCategory('Todos')}
          className={`w-full mb-2 py-2 rounded-xl text-[11px] font-bold border transition-all ${
            activeCategory === 'Todos'
              ? 'bg-[#6b2145] text-white border-[#6b2145] shadow-sm'
              : 'bg-white text-gray-500 border-gray-200'
          }`}
        >
          Todos los términos · {GLOSSARY.length}
        </button>

        {/* Grid 2 columnas para categorías */}
        <div className="grid grid-cols-2 gap-1.5">
          {CATEGORIES.filter(c => c !== 'Todos').map(cat => {
            const cfg = CATEGORY_CFG[cat]
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-left transition-all ${
                  isActive
                    ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm`
                    : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? cfg.dot : 'bg-gray-300'}`} />
                <span className="text-[10px] font-semibold leading-tight flex-1 truncate">{cat}</span>
                <span className={`text-[9px] font-bold shrink-0 ${isActive ? cfg.text : 'text-gray-400'}`}>
                  {CATEGORY_COUNTS[cat]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Lista de términos ── */}
      <div className="max-w-md mx-auto px-4 pb-28">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Search size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">Sin resultados</p>
            <p className="text-xs mt-1">Intenta con otro término</p>
          </div>
        ) : grouped && groupedEntries ? (
          // Vista agrupada por categoría
          Object.entries(groupedEntries).map(([cat, entries]) => (
            <CategorySection key={cat} category={cat} entries={entries} />
          ))
        ) : (
          // Vista plana (búsqueda o categoría específica)
          <div className="space-y-2 pt-1">
            {search && (
              <p className="text-[11px] text-gray-400 mb-3">
                {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'} para "{search}"
              </p>
            )}
            {filtered.map((entry, i) => (
              <GlossaryCard key={`${entry.term}-${i}`} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
