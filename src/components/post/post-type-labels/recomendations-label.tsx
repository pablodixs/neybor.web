import Lottie from 'lottie-react'

import lotie from '@/assets/lotties/recomendations.json'

export function RecomendationsLabel() {
    return (
        <div className="flex items-center gap-2 mb-2">
            <Lottie animationData={lotie} />
            <strong className="text-purple-600 font-semibold">
                Procurando recomendações
            </strong>
        </div>
    )
}
