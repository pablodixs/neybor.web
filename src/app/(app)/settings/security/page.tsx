import {
    DevicesIcon,
    FingerprintIcon,
    PasswordIcon,
    ShieldCheckIcon,
} from '@phosphor-icons/react/dist/ssr'

import { Navigation } from '@/components/navigation'
import { SectionLink } from '../components/section_link'

const SECURITY_ITEMS = [
    {
        href: '/settings/security/password',
        label: 'Alterar senha',
        icon: PasswordIcon,
    },
    {
        href: '/settings/security/2fa',
        label: 'Autenticação de dois fatores',
        icon: ShieldCheckIcon,
    },
    {
        href: '/settings/security/passkeys',
        label: 'Passkeys',
        icon: FingerprintIcon,
    },
    {
        href: '/settings/security/sessions',
        label: 'Dispositivos conectados',
        icon: DevicesIcon,
    },
]

export default function SecurityPage() {
    return (
        <>
            <Navigation title="Segurança" />
            <section className="flex flex-col gap-1">
                {SECURITY_ITEMS.map((item) => (
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
