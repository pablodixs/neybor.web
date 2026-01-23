import { Icon } from '@phosphor-icons/react'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'bordered'
    icon?: Icon
    iconPlacement?: 'leading' | 'trailing'
    textAlign?: 'left' | 'center' | 'right'
    fullWidth?: boolean
}

const VARIANT_CLASSES = {
    primary: 'bg-green-600 hover:bg-green-700 text-white',
    secondary: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900',
    bordered:
        'border-2 border-neutral-100 text-neutral-800 hover:bg-neutral-100',
}

export function Button({
    variant = 'primary',
    icon: Icon,
    iconPlacement = 'trailing',
    textAlign = 'center',
    fullWidth,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`${VARIANT_CLASSES[variant]} text-${textAlign} ${fullWidth ? 'w-full' : 'inline-flex'} gap-2 items-center justify-${textAlign} px-4 py-2 cursor-pointer rounded-full font-semibold transition disabled:text-green-900 disabled:hover:bg-green-600 disabled:cursor-not-allowed`}
            {...props}
        >
            {Icon && iconPlacement === 'leading' && (
                <Icon weight="bold" size={18} />
            )}
            {props.children}
            {Icon && iconPlacement === 'trailing' && (
                <Icon weight="bold" size={18} />
            )}
        </button>
    )
}
