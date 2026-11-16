import { Lottie } from 'lottie-react'

import lotie from '@/assets/lotties/recomendations.json'

export function RecomendationsLabel() {
    return (
        <div className="flex items-center gap-2 mb-2">
            <Lottie
                src={lotie}
                autoplay
                loop
                // o CSS do lottie-react não fica em @layer e ganha das classes do Tailwind
                style={{ width: 22, height: 22, flexShrink: 0 }}
            />
            <strong className="text-purple-600 font-semibold">
                Procurando recomendações
            </strong>
        </div>
    )
}
