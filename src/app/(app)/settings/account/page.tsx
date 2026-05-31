import {
    CityIcon,
    GlobeHemisphereWestIcon,
    PowerIcon,
    UserCircleGearIcon,
} from '@phosphor-icons/react/dist/ssr'

import { Navigation } from '@/components/navigation'
import { SectionLink } from '../components/section_link'

const ACCOUNT_ITEMS = [
    {
        href: '/settings/account/info',
        label: 'Informações da conta',
        icon: UserCircleGearIcon,
    },
    {
        href: '/settings/account/neighborhood',
        label: 'Vizinhança',
        icon: CityIcon,
    },
    {
        href: '/settings/account/region',
        label: 'Região e idioma',
        icon: GlobeHemisphereWestIcon,
    },
    {
        href: '/settings/account/disable-account',
        label: 'Desativar conta',
        icon: PowerIcon,
    },
]

export default function AccountPage() {
    return (
        <>
            <Navigation title="Sua conta" />
            <section className="flex flex-col gap-1">
                {ACCOUNT_ITEMS.map((item) => (
                    <SectionLink
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                    />
                ))}
            </section>
        </>
    )
}
