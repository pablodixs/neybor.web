import { CheckIcon } from '@phosphor-icons/react/dist/ssr'

type RadioInputProps = {
    label: string
    value: string
    checked: boolean
    onChange: (value: string) => void
    name: string
    disabled?: boolean
}

export function RadioInput({
    label,
    value,
    checked,
    onChange,
    name,
    disabled = false,
}: RadioInputProps) {
    return (
        <label
            className={`
                group flex items-center gap-3 select-none
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                disabled={disabled}
                onChange={() => {
                    if (!disabled) {
                        onChange(value)
                    }
                }}
                className="sr-only"
            />

            <span
                className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    transition-all duration-150
                    ${
                        checked
                            ? 'border-green-600 bg-green-600'
                            : disabled
                              ? 'border-neutral-300 bg-transparent'
                              : 'border-neutral-300 bg-transparent group-hover:border-green-600'
                    }
                `}
            >
                {checked && (
                    <CheckIcon size={14} weight="bold" className="text-white" />
                )}
            </span>

            <span className="font-semibold text-neutral-800">{label}</span>
        </label>
    )
}
