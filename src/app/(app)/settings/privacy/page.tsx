import { ChatsCircleIcon, ProhibitIcon } from '@phosphor-icons/react/dist/ssr'

import { Navigation } from '@/components/navigation'
import { SectionLink } from '../components/section_link'

const PRIVACY_ITEMS = [
    {
        href: '/settings/privacy/messages',
        label: 'Mensagens',
        icon: ChatsCircleIcon,
    },
    {
        href: '/settings/privacy/blocked-users',
        label: 'Usuários bloqueados',
        icon: ProhibitIcon,
    },
]

export default function PrivacyPage() {
    return (
        <>
            <Navigation title="Privacidade" />
            <section className="flex flex-col gap-1">
                {PRIVACY_ITEMS.map((item) => (
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
