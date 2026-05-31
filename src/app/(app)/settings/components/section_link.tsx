import { Icon } from '@phosphor-icons/react'
import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr'
import Link, { LinkProps } from 'next/link'

interface SectionLinkProps extends LinkProps {
    label: string
    icon?: Icon
    showCaret?: boolean
}

const linkSectionStyle =
    'flex px-4 py-3 items-center gap-3 font-medium text- w-full rounded-full hover:bg-neutral-100 transition cursor-pointer'

export function SectionLink({
    label,
    icon: Icon,
    showCaret = true,
    ...props
}: SectionLinkProps) {
    return (
        <Link className={linkSectionStyle} {...props}>
            {Icon && <Icon size={20} weight="bold" />}
            <span className="flex-1">{label}</span>
            {showCaret && (
                <CaretRightIcon className="text-lg text-neutral-400" />
            )}
        </Link>
    )
}
