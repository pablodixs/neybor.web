'use client'

import { cellToBoundary } from 'h3-js'

/** Draws the provider's H3 coverage cells as a simple SVG; the viewer's cell is highlighted. */
export function ServiceArea({
    cells,
    viewerCell,
}: {
    cells: string[]
    viewerCell: string | null
}) {
    if (cells.length === 0) return null
    const polys = cells.map((c) => ({
        id: c,
        pts: cellToBoundary(c).map(([lat, lng]) => [lng, -lat] as const),
    }))
    const all = polys.flatMap((p) => p.pts)
    const xs = all.map((p) => p[0])
    const ys = all.map((p) => p[1])
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    const w = Math.max(...xs) - minX
    const h = Math.max(...ys) - minY
    const pad = Math.max(w, h) * 0.05
    return (
        <svg
            viewBox={`${minX - pad} ${minY - pad} ${w + pad * 2} ${h + pad * 2}`}
            className="w-full max-h-56 bg-neutral-50 rounded-2xl"
            role="img"
            aria-label="Área de atendimento"
        >
            {polys.map((p) => (
                <polygon
                    key={p.id}
                    points={p.pts.map((q) => q.join(',')).join(' ')}
                    className={
                        p.id === viewerCell
                            ? 'fill-green-600 stroke-white'
                            : 'fill-green-200 stroke-white'
                    }
                    strokeWidth={Math.max(w, h) * 0.01}
                />
            ))}
        </svg>
    )
}
