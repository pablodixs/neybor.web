import { CatIcon } from '@phosphor-icons/react/dist/icons/Cat'
import {
    BandaidsIcon,
    CloudLightningIcon,
    DotsThreeIcon,
    SirenIcon,
    TrafficConeIcon,
    TrafficSignIcon,
    WrenchIcon,
} from '@phosphor-icons/react/dist/ssr'

export enum AlertCategory {
    SECURITY,
    TRAFFIC,
    WEATHER,
    INFRASTRUCTURE,
    HEALTH,
    ANIMAL,
    UTILITIES,
    OTHER,
}

export const ALERT_TYPE_INFO = {
    [AlertCategory.SECURITY]: {
        label: 'Alerta de Segurança',
        icon: SirenIcon,
        color: 'bg-red-500',
    },
    [AlertCategory.TRAFFIC]: {
        label: 'Alerta de Trânsito',
        icon: TrafficConeIcon,
        color: 'bg-orange-500',
    },
    [AlertCategory.WEATHER]: {
        label: 'Alerta de Clima',
        icon: CloudLightningIcon,
        color: 'bg-purple-500',
    },
    [AlertCategory.INFRASTRUCTURE]: {
        label: 'Alerta de Infraestrutura',
        icon: TrafficSignIcon,
        color: 'bg-stone-500',
    },
    [AlertCategory.HEALTH]: {
        label: 'Alerta de Saúde',
        icon: BandaidsIcon,
        color: 'bg-pink-500',
    },
    [AlertCategory.ANIMAL]: {
        label: 'Alerta de Animais',
        icon: CatIcon,
        color: 'bg-green-500',
    },
    [AlertCategory.UTILITIES]: {
        label: 'Alerta de Utilidades',
        icon: WrenchIcon,
        color: 'bg-yellow-500',
    },
    [AlertCategory.OTHER]: {
        label: 'Outro',
        icon: DotsThreeIcon,
        color: 'bg-gray-500',
    },
}
