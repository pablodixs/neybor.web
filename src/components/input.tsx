import { Icon } from '@phosphor-icons/react'
import { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    fullWidth?: boolean
    icon?: Icon
    button?: ReactNode
}

export function Input({ fullWidth, button, icon: Icon, ...props }: InputProps) {
    return (
        <div className="relative">
            <input
                className={`px-4 py-3 border-2 border-neutral-100 outline-transparent focus:outline-green-600 transition-all font-semibold rounded-lg data-[valid=false]:border-red-500 ${fullWidth ? 'w-full' : ''}`}
                {...props}
            />
            {Icon && (
                <Icon
                    weight="bold"
                    size={20}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />
            )}
            {button && (
                <button className="cursor-pointer text-neutral-600 aspect-square absolute right-2 top-1/2 -translate-y-1/2 transition hover:bg-neutral-100 p-2 rounded-full">
                    {button}
                </button>
            )}
        </div>
    )
}
