import { PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr'
import { Navigation } from '@/components/navigation'
import { SectionLink } from './components/section_link'

export default function SecurityPage() {
    return (
        <>
            <Navigation title="Segurança" />
            <section className="flex flex-col gap-1">
                <SectionLink
                    icon={PlugsConnectedIcon}
                    label="Dispositivos conectados"
                    href={'/settings/security/sessions'}
                />
            </section>
        </>
    )
}
