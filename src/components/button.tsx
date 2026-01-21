import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', ...props }: ButtonProps) {
    return (
        <button
            className={`${variant === 'primary' ? 'bg-green-500 hover:bg-green-600' : 'bg-neutral-100 hover:bg-neutral-200'} px-4 py-3 cursor-pointer rounded-full font-semibold transition`}
            {...props}
        />
    )
}
