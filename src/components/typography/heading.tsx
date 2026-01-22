import { HTMLAttributes } from 'react'

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
    textAlign?: 'left' | 'center' | 'right'
}

export function Heading({ textAlign = 'left', ...props }: HeadingProps) {
    return (
        <h1
            className={`font-semibold text-neutral-900 tracking-tight text-2xl mb-4 text-${textAlign}`}
            {...props}
        >
            {props.children}
        </h1>
    )
}
