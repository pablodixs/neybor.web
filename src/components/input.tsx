import { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input(props: InputProps) {
    return (
        <input
            className="px-4 py-3 border-2 border-neutral-100 outline-transparent focus:outline-green-600 transition-all font-semibold rounded-lg data-[valid=false]:border-red-500"
            {...props}
        />
    )
}
