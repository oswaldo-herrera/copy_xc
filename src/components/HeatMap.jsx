import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { MAP_W, MAP_H, PATHS, project } from '../edomexMap'
import { MUNICIPIOS, MAP_FILTERS } from '../data'
import { Icon, Tabs } from './ui'

const STATE_LABELS = [
  { name: 'Hidalgo', lon: -98.95, lat: 20.3 },
  { name: 'Querétaro', lon: -100.15, lat: 20.38 },
  { name: 'Michoacán', lon: -100.68, lat: 19.45 },
  { name: 'Guerrero', lon: -99.95, lat: 18.32 },
  { name: 'Morelos', lon: -99.12, lat: 18.72 },
  { name: 'Puebla', lon: -98.55, lat: 18.95 },
  { name: 'Tlaxcala', lon: -98.5, lat: 19.58 },
]

// Pseudo-aleatorio estable para variar la intensidad por categoría
const rand = (i, seed) => {
  const s = Math.sin((i + 1) * 12.9898 * seed) * 43758.5453
  return s - Math.floor(s)
}

const ZOOMS = [1, 1.6, 2.4]
const FOCUS = project(-99.15, 19.5) // Valle de México

export default function HeatMap() {
  const [filter, setFilter] = useState('todas')
  const [zoom, setZoom] = useState(0)
  const [hover, setHover] = useState(null)

  const points = useMemo(() => {
    const f = MAP_FILTERS.find(x => x.id === filter)
    return MUNICIPIOS.map((m, i) => {
      const w = f?.seed ? 0.35 + rand(i, f.seed) * 0.9 : 1
      const value = Math.round(m.total * w)
      const [x, y] = project(m.lon, m.lat)
      return { ...m, value, x, y }
    })
  }, [filter])

  const max = Math.max(...points.map(p => p.value))
  // Etiquetas para los puntos más intensos, evitando encimarse
  const labeled = new Set()
  const placed = []
  for (const p of [...points].sort((a, b) => b.value - a.value)) {
    if (placed.length >= 7) break
    if (placed.some(q => Math.abs(q.x - p.x) < 120 && Math.abs(q.y - p.y) < 30)) continue
    placed.push(p)
    labeled.add(p.name)
  }

  const z = ZOOMS[zoom]
  const vw = MAP_W / z, vh = MAP_H / z
  const vx = z === 1 ? 0 : Math.min(Math.max(FOCUS[0] - vw / 2, 0), MAP_W - vw)
  const vy = z === 1 ? 0 : Math.min(Math.max(FOCUS[1] - vh / 2, 0), MAP_H - vh)

  return (
    <div className="map">
      <div className="map-toolbar">
        <Tabs items={MAP_FILTERS} value={filter} onChange={setFilter} id="mapf" small />
      </div>

      <div className="map-stage">
        <motion.svg
          className="map-svg"
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          animate={{ viewBox: `${vx} ${vy} ${vw} ${vh}` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          role="img"
          aria-label="Mapa de calor de expedientes en el Estado de México"
        >
          <defs>
            <radialGradient id="heat">
              <stop offset="0" stopColor="#FFD27A" stopOpacity="1" />
              <stop offset="0.25" stopColor="#FF8A1F" stopOpacity="0.85" />
              <stop offset="0.6" stopColor="#E5262B" stopOpacity="0.35" />
              <stop offset="1" stopColor="#E5262B" stopOpacity="0" />
            </radialGradient>
            <pattern id="mapgrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0H0V24" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1" />
            </pattern>
            <filter id="edoGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect width={MAP_W} height={MAP_H} fill="url(#mapgrid)" />

          {Object.entries(PATHS).filter(([k]) => k !== 'edomex' && k !== 'cdmx').map(([k, d]) => (
            <path key={k} d={d} className="map-neighbor" />
          ))}

          <motion.path
            d={PATHS.edomex}
            className="map-edomex"
            filter="url(#edoGlow)"
            fillRule="evenodd"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
          <path d={PATHS.cdmx} className="map-cdmx" />

          {STATE_LABELS.map(s => {
            const [x, y] = project(s.lon, s.lat)
            return <text key={s.name} x={x} y={y} className="map-state" textAnchor="middle">{s.name.toUpperCase()}</text>
          })}
          {(() => {
            const [x, y] = project(-99.14, 19.33)
            return <text x={x} y={y} className="map-state map-state--cdmx" textAnchor="middle">CDMX</text>
          })()}

          <g className="heat-layer">
            {points.map(p => (
              <motion.circle
                key={p.name}
                cx={p.x}
                cy={p.y}
                fill="url(#heat)"
                initial={false}
                animate={{ r: 22 + Math.sqrt(p.value / max) * 78 }}
                transition={{ duration: 0.6 }}
              />
            ))}
          </g>

          {points.map(p => (
            <g
              key={p.name}
              className="map-pt"
              onPointerEnter={() => setHover(p)}
              onPointerLeave={() => setHover(null)}
            >
              <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
              <circle cx={p.x} cy={p.y} r={hover?.name === p.name ? 6 : 3.5} className="map-dot" />
              {p.value / max > 0.55 && <circle cx={p.x} cy={p.y} r="6" className="map-pulse" />}
              {labeled.has(p.name) && (
                <text x={p.x + 9} y={p.y - 8} className="map-label">{p.name}</text>
              )}
            </g>
          ))}
        </motion.svg>

        <div className="map-scan" aria-hidden />

        <AnimatePresence>
          {hover && (
            <motion.div
              className="map-tip"
              style={{
                left: `${((hover.x - vx) / vw) * 100}%`,
                top: `${((hover.y - vy) / vh) * 100}%`,
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <strong>{hover.name}</strong>
              <span>{hover.value} expedientes</span>
              <span className="map-tip-sub">+{hover.mes} este mes</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="map-legend">
          <span>Baja</span>
          <span className="map-legend-bar" />
          <span>Crítica</span>
        </div>

        <div className="map-zoom">
          <button className="map-zbtn" onClick={() => setZoom(v => Math.min(v + 1, ZOOMS.length - 1))} aria-label="Acercar">+</button>
          <button className="map-zbtn" onClick={() => setZoom(v => Math.max(v - 1, 0))} aria-label="Alejar">−</button>
          <button className="map-zbtn" onClick={() => setZoom(0)} aria-label="Centrar mapa"><Icon name="gps" size={15} /></button>
        </div>
      </div>
    </div>
  )
}
