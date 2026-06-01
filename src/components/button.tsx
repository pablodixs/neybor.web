import { Icon } from '@phosphor-icons/react'
import { ButtonHTMLAttributes } from 'react'
import { Spinner } from './spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:
        | 'primary'
        | 'secondary'
        | 'bordered'
        | 'danger'
        | 'ghost'
        | 'ghostDestructive'
        | 'borderedDestructive'
    icon?: Icon
    iconPlacement?: 'leading' | 'trailing'
    textAlign?: 'left' | 'center' | 'right'
    size?: 'sm' | 'md' | 'lg'
    fullWidth?: boolean
    activityIndicator?: boolean
    activityLabel?: string
}

const VARIANT_CLASSES = {
    primary: 'bg-green-600 hover:bg-green-700 text-white active:bg-green-900',
    secondary:
        'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 active:bg-neutral-300',
    bordered:
        'outline outline-2 outline-neutral-100 -outline-offset-2 text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200',
    borderedDestructive:
        'outline outline-2 outline-red-100 -outline-offset-2 text-red-600 hover:bg-red-100 active:bg-red-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white active:bg-red-900',
    ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-800 active:bg-neutral-200',
    ghostDestructive:
        'bg-transparent hover:bg-red-100 text-red-600 active:bg-red-200',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-md px-4 py-2 min-h-10',
    lg: 'text-lg px-5 py-3',
}

export function Button({
    variant = 'primary',
    icon: Icon,
    iconPlacement = 'trailing',
    textAlign = 'center',
    fullWidth,
    activityIndicator,
    activityLabel,
    size = 'md',
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={activityIndicator || props.disabled}
            className={`${VARIANT_CLASSES[variant]} text-${textAlign} ${fullWidth ? 'w-full' : 'w-content'} text-nowrap flex gap-2 items-center justify-${textAlign} ${VARIANT_CLASSES[size]} cursor-pointer rounded-full font-semibold transition disabled:text-neutral-500 disabled:hover:bg-neutral-100 disabled:bg-neutral-100 disabled:outline-0 disabled:cursor-not-allowed`}
            {...props}
        >
            {Icon && !activityIndicator && iconPlacement === 'leading' && (
                <Icon
                    weight="bold"
                    size={size === 'sm' ? 16 : size === 'md' ? 18 : 20}
                />
            )}
            {activityIndicator && <Spinner size="sm" color="white" />}
            {activityIndicator ? activityLabel : props.children}
            {Icon && iconPlacement === 'trailing' && (
                <Icon
                    weight="bold"
                    size={size === 'sm' ? 16 : size === 'md' ? 18 : 20}
                />
            )}
        </button>
    )
}
